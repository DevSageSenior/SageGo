const { Game } = require('../../models');
const GameHistory = require('../../models/game/gamehistory.model');
const { gameState } = require('../../config/game');
const { getBoard } = require('../board.service');
const { ChessBoard } = require('../../engine/chess_engine/ChessBoard');
const { ActionForbidden } = require('../../config/error');
const error = require('../../config/error');

const getGameBoard = (boardDoc, gameHistory) => {
  let gameBoard = new ChessBoard(boardDoc.deaths, boardDoc.fears);
  for (let index = 0; index < gameHistory.length; index++) {
    let { action } = gameHistory[index];
    if (action.pass) continue;
    let message = gameBoard.isValidMove(action.from, action.to);
    if (message !== 'Valid') {
      return { isValid: false, board: gameBoard.board, ErrorMessage: message };
    }
    gameBoard = gameBoard.makeMove(action.from, action.to);
    if (action.promotion) {
      gameBoard.promote(action.to, action.promotion);
    }
  }

  return {
    isValid: true,
    board: gameBoard.board,
    finished: gameBoard.isFinished(),
    turn: gameBoard.turn,
    check: gameBoard.isInCheck(gameBoard.turn == 0 ? 'white' : 'black'),
    availableMoves: gameBoard.getAllAvailableMoves(),
  };
};

const loadGameHistory = async (gameId) => {
  const gameDoc = await Game.findById(gameId);
  const boardDoc = await getBoard(gameDoc.board);
  const lastTurn = gameDoc.lastTurn;
  if (!lastTurn) {
    let data = getGameBoard(boardDoc.data, []);
    return { ...data, gameHistory: [] };
  }
  const lastTurnDoc = await GameHistory.findById(lastTurn);
  const gameHistoryDoc = await lastTurnDoc.getAncestors({}, 'action');
  gameHistoryDoc.push(lastTurnDoc);
  let data = getGameBoard(boardDoc.data, gameHistoryDoc);
  return { ...data, gameHistory: gameHistoryDoc };
};

const movePiece = async (userId, gameId, action) => {
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

  let { isValid, board, ErrorMessage, finished, turn, availableMoves, check } = getGameBoard(boardDoc.data, gameHistory);

  if (isValid) {
    const gameHistoryDoc = await GameHistory.create({
      game: gameDoc,
      player: userId,
      parent: lastTurn,
      action,
    });
    if (finished) {
      gameDoc.state = gameState.FINISHED;
      if (turn == 0) gameDoc.result = 'B Won';
      else gameDoc.result = 'W Won';
    }
    gameDoc.lastTurn = gameHistoryDoc._id;
    await gameDoc.save();
  } else throw new Error(ErrorMessage);

  return { board, gameHistory, isValid, finished, ErrorMessage, availableMoves, check };
};

const getGameResult = async (gameId) => {
  const gameDoc = await Game.findById(gameId);
  const boardDoc = await getBoard(gameDoc.board);
  const lastTurn = gameDoc.lastTurn;
  if (!lastTurn) throw new Error(error.GameNotExisting);
  const lastTurnDoc = await GameHistory.findById(lastTurn);
  let gameHistory = await lastTurnDoc.getAncestors({}, 'action player');
  gameHistory.push(lastTurnDoc);
  const data = getGameBoard(boardDoc.data, gameHistory);
  return { ...data, result: gameDoc.result };
};

const getGameStatus = async (gameId, turnIndex) => {
  const gameDoc = await Game.findById(gameId);
  const boardDoc = await getBoard(gameDoc.board);
  const lastTurn = gameDoc.lastTurn;
  if (!lastTurn) {
    const data = getGameBoard(boardDoc.data, []);
    return { ...data, action: { pass: true }, player: 'None' };
  }
  const lastTurnDoc = await GameHistory.findById(lastTurn);
  let gameHistory = await lastTurnDoc.getAncestors({}, 'action player');
  gameHistory.push(lastTurnDoc);
  if (turnIndex > gameHistory.length) turnIndex = gameHistory.length;
  gameHistory.length = turnIndex;
  const data = getGameBoard(boardDoc.data, gameHistory);
  let lastAction = { action: { pass: true }, player: 'None' };
  if (gameHistory.length) lastAction = gameHistory[gameHistory.length - 1];
  return { ...data, action: lastAction.action, player: lastAction.player };
};

module.exports = {
  movePiece,
  loadGameHistory,
  getGameStatus,
  getGameResult,
};
