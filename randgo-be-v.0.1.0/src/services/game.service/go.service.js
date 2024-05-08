const { Game } = require('../../models');
const GameHistory = require('../../models/game/gamehistory.model');
const { gameState } = require('../../config/game');
const GoBoard = require('../../engine/go_engine/go-board/src/GoBoard');
const { getBoard } = require('../board.service');
const deadstones = require('../../engine/go_engine/deadstones/js/main');
const influence = require('../../engine/go_engine/influence');
const { userService } = require('../');
const { ActionForbidden } = require('../../config/error');
const error = require('../../config/error');

const getGameBoard = (boardDoc, gameHistory) => {
  let gameBoard = new GoBoard(boardDoc.ptCnt, boardDoc.edges);
  for (let index = 0; index < gameHistory.length; index++) {
    let { action } = gameHistory[index];
    let sign = 1;
    if (index & 1) sign = -1;
    if (action.pass) continue;
    let { isValid, ErrorMessage } = gameBoard.isValidMove(sign, action.pos);
    if (!isValid) {
      return { isValid: false, board: gameBoard.signMap, ErrorMessage };
    }
    gameBoard = gameBoard.makeMove(sign, action.pos);
  }

  return { isValid: true, board: gameBoard.signMap };
};

const loadGameHistory = async (gameId) => {
  const gameDoc = await Game.findById(gameId);
  const boardDoc = await getBoard(gameDoc.board);
  const lastTurn = gameDoc.lastTurn;
  if (!lastTurn) {
    let { board } = getGameBoard(boardDoc.data, []);
    return { board, gameHistory: [] };
  }
  const lastTurnDoc = await GameHistory.findById(lastTurn);
  const gameHistoryDoc = await lastTurnDoc.getAncestors({}, 'action');
  gameHistoryDoc.push(lastTurnDoc);
  let { board } = getGameBoard(boardDoc.data, gameHistoryDoc);
  return { board, gameHistory: gameHistoryDoc };
};

const putStone = async (userId, gameId, action) => {
  const gameDoc = await Game.findById(gameId);
  if (gameDoc.state == gameState.FINISHED) throw new Error('The game is finished');
  const boardDoc = await getBoard(gameDoc.board);
  let gameHistory = [];

  if (!gameDoc || (!gameDoc.player1.equals(userId) && !gameDoc.player2.equals(userId))) throw new Error(ActionForbidden);
  const lastTurn = gameDoc.lastTurn;

  if (lastTurn) {
    const lastTurnDoc = await GameHistory.findById(lastTurn);
    gameHistory = await lastTurnDoc.getAncestors({}, 'action');
    gameHistory.push(lastTurnDoc);
    if (lastTurnDoc && lastTurnDoc.player.equals(userId)) throw new Error("It's not your turn");
  } else {
    if (!gameDoc.player1.equals(userId)) {
      throw new Error("It's not your turn");
    }
  }
  gameHistory.push({ action });

  let { isValid, board, ErrorMessage } = getGameBoard(boardDoc.data, gameHistory);

  if (isValid) {
    const gameHistoryDoc = await GameHistory.create({
      game: gameDoc,
      player: userId,
      parent: lastTurn,
      action,
    });
    gameDoc.lastTurn = gameHistoryDoc._id;
    await gameDoc.save();
  } else throw new Error(ErrorMessage);

  return { board, gameHistory, isValid, ErrorMessage };
};

const pass = async (userId, gameId) => {
  const gameDoc = await Game.findById(gameId);
  const lastTurn = gameDoc.lastTurn;
  if (!lastTurn) throw new Error("It's not your turn");
  const lastTurnDoc = await GameHistory.findById(lastTurn);
  if (lastTurnDoc.player.equals(userId)) {
    throw new Error("It's not your turn");
  }
  const gameHistoryDoc = await GameHistory.create({
    game: gameDoc,
    player: userId,
    parent: lastTurn,
    action: { pass: true },
  });
  gameDoc.lastTurn = gameHistoryDoc._id;
  await gameDoc.save();
  if (lastTurnDoc.action.pass) {
    gameDoc.state = gameState.FINISHED;
    await gameDoc.save();
    const { score } = await getGameResult(gameId);
    const player1Doc = await userService.getUserById(gameDoc.player1);
    const player2Doc = await userService.getUserById(gameDoc.player2);
    if (score.areaScore > 0) {
      player1Doc.gameWonCount++;
      player2Doc.gameLostCount++;
      gameDoc.result = `B + ${score.areaScore}`;
    }
    if (score.areaScore < 0) {
      player2Doc.gameWonCount++;
      player1Doc.gameLostCount++;
      gameDoc.result = `W + ${-score.areaScore}`;
    }
    await player1Doc.save();
    await player2Doc.save();
    await gameDoc.save();
    return true;
  } else return false;
};

const getGameResult = async (gameId) => {
  const gameDoc = await Game.findById(gameId);
  const boardDoc = await getBoard(gameDoc.board);
  const lastTurn = gameDoc.lastTurn;
  if (!lastTurn) throw new Error(error.GameNotExisting);
  const lastTurnDoc = await GameHistory.findById(lastTurn);
  let gameHistory = await lastTurnDoc.getAncestors({}, 'action player');
  gameHistory.push(lastTurnDoc);
  const { board } = getGameBoard(boardDoc.data, gameHistory);
  const getScore = (board, areaMap, { komi = 0, handicap = 0 } = {}) => {
    let score = {
      area: [0, 0],
      territory: [0, 0],
      captures: [0, 0],
    };
    for (let i = 0; i < board.length; i++) {
      let v = board[i];
      let rev = board[board.length - i - 1];
      let z = areaMap[i];
      let index = z > 0 ? 0 : 1;
      if (v == 1) score.captures[0]++;
      else if (v == -1) score.captures[1]++;
      score.area[index] += Math.abs(Math.sign(z));
      if (rev == 0) {
        score.territory[index] += Math.abs(Math.sign(z));
      }
    }

    score.area = score.area.map(Math.round);
    score.territory = score.territory.map(Math.round);

    score.areaScore = score.area[0] - score.area[1] + komi + handicap;
    score.territoryScore = score.territory[0] - score.territory[1] + score.captures[0] - score.captures[1] + komi;

    return score;
  };
  let Redge = [];
  for (let index = 0; index < boardDoc.data.edges.length; index++) {
    Redge = [...Redge, ...boardDoc.data.edges[index], boardDoc.data.ptCnt];
  }
  Redge.pop();

  let deads = await deadstones.guess(board, Redge, {
    finished: true,
    iterations: 100,
  });

  for (let vertex of deads) {
    let sign = board[vertex];
    if (sign === 0) continue;
    board[vertex] = 0;
  }
  let areaMap = influence.areaMap(board, boardDoc.data.edges);

  let score = getScore(board, areaMap, { komi: gameDoc.miscellaneous.komi, handicap: gameDoc.miscellaneous.handicap });

  return { score, areaMap, board };
};

const getGameStatus = async (gameId, turnIndex) => {
  const gameDoc = await Game.findById(gameId);
  const boardDoc = await getBoard(gameDoc.board);
  const lastTurn = gameDoc.lastTurn;
  if (!lastTurn) {
    const { board } = getGameBoard(boardDoc.data, []);
    return { board, action: { pass: true }, player: 'None' };
  }
  const lastTurnDoc = await GameHistory.findById(lastTurn);
  let gameHistory = await lastTurnDoc.getAncestors({}, 'action player');
  gameHistory.push(lastTurnDoc);
  if (turnIndex > gameHistory.length) turnIndex = gameHistory.length;
  gameHistory.length = turnIndex;
  const { board } = getGameBoard(boardDoc.data, gameHistory);
  let lastAction = { action: { pass: true }, player: 'None' };
  if (gameHistory.length) lastAction = gameHistory[gameHistory.length - 1];
  return { board, action: lastAction.action, player: lastAction.player };
};

module.exports = {
  putStone,
  pass,
  loadGameHistory,
  getGameStatus,
  getGameResult,
};
