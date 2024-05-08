const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');
const { Game } = require('../../models');
const GameHistory = require('../../models/game/gamehistory.model');
const { gameState, gameType, gameName } = require('../../config/game');
const { getBoard, useBoard } = require('../board.service');
const GameChat = require('../../models/game/gamechat.model');
const ErrorMessage = require('../../config/error');
const { userService } = require('../');
const goService = require('./go.service');
const chessService = require('./chess.service');
const error = require('../../config/error');
const { Schema } = require('mongoose');

const getGameWithName = async (gameId) => {
  return await Game.findById(gameId)
    .populate('player1', 'name email')
    .populate('player2', 'name email')
    .populate('lastTurn', 'player');
};

/**
 * commit a game
 * @param {object} Game
 * @returns Promise<Game>
 */
const commitGame = async (game) => {
  const lastInsertedDoc = await Game.findOne({ type: game.type }).sort({ _id: -1 }).limit(1);
  let insertId = 1;
  if (lastInsertedDoc) {
    const lastInsertedId = lastInsertedDoc.name.split(':')[1];
    if (lastInsertedId) insertId = Number(lastInsertedId) + 1;
  }
  game.name = gameName[game.type] + ':' + insertId;
  switch (game.type) {
    case gameType.GO: {
      const boardDoc = await getBoard(game.board);
      if (!boardDoc) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Board is not exist');
      }
      await useBoard(game.board);
      return await Game.create(game);
    }
    case gameType.CHESS: {
      return await Game.create(game);
    }
    default: {
      throw new Error('This is not an allowed game type');
    }
  }
};

/**
 *
 * @param {Number} state The current state of the game
 * @param {ObjectId} userId The id of the user joined in the game
 * @param {Number} type The game type for NOT FINISHED games
 * @returns GameList
 */
const getGameList = async (state, userId, type) => {
  return new Promise((resolve, reject) => {
    const filterOptions = {
      state,
      $or: [{ private: false }, { player1: userId }, { player2: userId }],
    };
    if (type) filterOptions.type = type;
    Game.find(filterOptions)
      .populate('player1', 'name email')
      .populate('player2', 'name email')
      .then(async (gameDocs) => {
        if (state == gameState.CREATED) {
          gameDocs = gameDocs.filter((gameDoc) => {
            if (
              gameDoc.inviteOnly == true &&
              (!gameDoc.player1 || !gameDoc.player1._id.equals(userId)) &&
              (!gameDoc.player2 || !gameDoc.player2._id.equals(userId)) &&
              gameDoc.invitedUsers.indexOf(userId) == -1
            )
              return false;
            return true;
          });
        }
        return resolve(gameDocs);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const getFinishedGames = async (userId, type) => {
  const filterOption = {
    state: gameState.FINISHED,
    $or: [{ private: false }, { player1: userId }, { player2: userId }],
  };
  if (type != '0') filterOption.type = type;
  return await Game.find(filterOption).populate('player1', 'name email').populate('player2', 'name email');
};

const getInvitedGames = async (userId, type) => {
  const filterOption = {
    state: gameState.CREATED,
    inviteOnly: true,
  };
  if (type != '0') filterOption.type = type;
  return Game.find(filterOption).then((gameList) => {
    return gameList.filter((game) => game.invitedUsers.indexOf(Schema.Types.ObjectId(userId)) != -1);
  });
};

const getGamesfromUserId = async (userId) => {
  const gameDocs = await Game.find({ $or: [{ player1: userId }, { player2: userId }] }).select('_id');
  return gameDocs;
};

const setReady = async (gameId, userId) => {
  const gameDoc = await Game.findById(gameId);
  if (String(gameDoc.player1) == String(userId)) gameDoc.player1Ready = !gameDoc.player1Ready;
  else if (String(gameDoc.player2) == String(userId)) gameDoc.player2Ready = !gameDoc.player2Ready;
  await gameDoc.save();
  return getGameWithName(gameDoc._id);
};

const joinGame = async (gameId, userId) => {
  const gameDoc = await Game.findById(gameId);
  if (gameDoc.state == gameState.FINISHED) return await getGameWithName(gameDoc._id);
  if (!gameDoc.player1) gameDoc.player1 = userId;
  else if (!gameDoc.player2) gameDoc.player2 = userId;
  await gameDoc.save();
  return await getGameWithName(gameDoc._id);
};

const inviteGame = async (userId, gameId) => {
  const gameDoc = await Game.findById(gameId);
  if (!gameDoc || gameDoc.private) {
    throw new ApiError(httpStatus.FORBIDDEN, error.ActionForbidden);
  }
  gameDoc.observers.push(userId);
  return await gameDoc.save();
};

const loadGameHistory = async (gameId) => {
  try {
    const gameDoc = await Game.findById(gameId);
    if (!gameDoc) {
      throw new Error(error.GameNotExisting);
    }
    switch (gameDoc.type) {
      case gameType.GO: {
        return await goService.loadGameHistory(gameId);
      }
      case gameType.CHESS: {
        return await chessService.loadGameHistory(gameId);
      }
    }
  } catch (error) {
    throw error;
  }
};

const doAction = async (userId, gameId, action) => {
  try {
    const gameDoc = await Game.findById(gameId);
    if (!gameDoc) {
      throw new Error(ErrorMessage.GameNotExisting);
    }
    switch (gameDoc.type) {
      case gameType.GO: {
        return await goService.putStone(userId, gameId, action);
      }
      case gameType.CHESS: {
        return await chessService.movePiece(userId, gameId, action);
      }
    }
  } catch (error) {
    throw error;
  }
};

const getGameInfo = async (userId, gameId) => {
  const gameDoc = await getGameWithName(gameId);
  let turnCount = await GameHistory.find({ game: gameId }).count();
  return { game: gameDoc, turnCount };
};

const pass = async (userId, gameId) => {
  try {
    const gameDoc = await Game.findById(gameId);
    if (!gameDoc) {
      throw new Error(ErrorMessage.GameNotExisting);
    }
    switch (gameDoc.type) {
      case gameType.GO: {
        return await goService.pass(userId, gameId);
      }
      case gameType.CHESS: {
        throw new Error('Pass is not allowed in chess game');
      }
    }
  } catch (error) {
    throw error;
  }
};

const getGameResult = async (gameId) => {
  try {
    const gameDoc = await Game.findById(gameId);
    if (!gameDoc) {
      throw new Error(ErrorMessage.GameNotExisting);
    }
    switch (gameDoc.type) {
      case gameType.GO: {
        return await goService.getGameResult(gameId);
      }
      case gameType.CHESS: {
        return await chessService.getGameResult(gameId);
      }
    }
  } catch (error) {
    throw error;
  }
};

const resign = async (userId, gameId) => {
  const gameDoc = await Game.findById(gameId);
  // if(!gameDoc.lastTurn) return false;
  const lastTurnDoc = await GameHistory.findById(gameDoc.lastTurn);
  if (lastTurnDoc.player.equals(userId)) {
    throw new Error("It's not your turn");
  }
  gameDoc.state = gameState.FINISHED;
  const player1Doc = await userService.getUserById(gameDoc.player1);
  const player2Doc = await userService.getUserById(gameDoc.player2);
  if (gameDoc.player1.equals(userId)) {
    player1Doc.gameLostCount++;
    player2Doc.gameWonCount++;
    gameDoc.result = 'B resigned';
  } else {
    player2Doc.gameLostCount++;
    player1Doc.gameWonCount++;
    gameDoc.result = 'W resigned';
  }
  await player1Doc.save();
  await player2Doc.save();
  await gameDoc.save();
};

const getGameStatus = async (gameId, turnIndex) => {
  try {
    const gameDoc = await Game.findById(gameId);
    if (!gameDoc) {
      throw new Error(ErrorMessage.GameNotExisting);
    }
    switch (gameDoc.type) {
      case gameType.GO: {
        return await goService.getGameStatus(gameId, turnIndex);
      }
      case gameType.CHESS: {
        return await chessService.getGameStatus(gameId, turnIndex);
      }
    }
  } catch (error) {
    throw error;
  }
};

/**
 * cancel joining the games as second player
 */
const disconnectGame = async (userId) => {
  return await Game.update({ player2: userId, state: gameState.CREATED }, { player2: null, player2Ready: false });
};

const startGame = async (gameId) => {
  return await Game.update({ _id: gameId }, { state: gameState.PLAYING });
};

const sendMessage = async (userId, message, gameId) => {
  const gameDoc = await Game.findById(gameId);
  if (!gameDoc || (!gameDoc.player1.equals(userId) && !gameDoc.player2.equals(userId))) {
    throw new Error(error.ActionForbidden);
  }
  return await GameChat.create({ sender: userId, message, game: gameId });
};

const getMessages = async (userId, gameId) => {
  const gameDoc = await Game.findById(gameId);
  if (!gameDoc) {
    throw new Error(error.ActionForbidden);
  }
  return await GameChat.find({ game: gameId }).populate('sender', 'name email').select('sender message');
};

module.exports = {
  commitGame,
  getGameList,
  inviteGame,
  doAction,
  setReady,
  getGamesfromUserId,
  disconnectGame,
  joinGame,
  startGame,
  pass,
  resign,
  getGameInfo,
  loadGameHistory,
  getFinishedGames,
  getGameStatus,
  getGameResult,
  getInvitedGames,
  sendMessage,
  getMessages,
};
