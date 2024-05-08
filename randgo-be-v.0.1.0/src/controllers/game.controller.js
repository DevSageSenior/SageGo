const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { gameService } = require('../services');
const { gameState } = require('../config/game');
const { getUserfromToken } = require('../services/token.service');

const commitGame = catchAsync(async (req, res) => {
  const game = await gameService.commitGame(req.body);
  res.status(httpStatus.CREATED).send({ game });
});

const getLiveGames = catchAsync(async (req, res) => {
  const userDoc = await getUserfromToken(req.headers.authorization);
  const games = await gameService.getGameList(gameState.PLAYING, userDoc._id);
  res.status(httpStatus.OK).send({ games });
});

const getCreatedGames = catchAsync(async (req, res) => {
  const userDoc = await getUserfromToken(req.headers.authorization);
  const games = await gameService.getGameList(gameState.CREATED, userDoc._id);
  res.status(httpStatus.OK).send({ games });
});

const getGameInfo = catchAsync(async (req, res) => {
  const userDoc = await getUserfromToken(req.headers.authorization);
  const gameInfo = await gameService.getGameInfo(userDoc._id, req.query.gameId);
  res.status(httpStatus.OK).send(gameInfo);
});

const getGameHistory = catchAsync(async (req, res) => {
  const userDoc = await getUserfromToken(req.headers.authorization);
  const games = await gameService.getGameInfo(userDoc._id, req.query.gameId, req.query.turnIndex);
  res.status(httpStatus.OK).send({ games });
});

const getGameStatus = catchAsync(async (req, res) => {
  const { gameId, turnIndex } = req.query;
  const gameStatus = await gameService.getGameStatus(gameId, turnIndex);
  res.status(httpStatus.OK).send(gameStatus);
});

const getGameResult = catchAsync(async (req, res) => {
  const { gameId } = req.query;
  const gameStatus = await gameService.getGameResult(gameId);
  res.status(httpStatus.OK).send(gameStatus);
});

const getFinishedGames = catchAsync(async (req, res) => {
  const userDoc = await getUserfromToken(req.headers.authorization);
  const gameList = await gameService.getFinishedGames(userDoc._id, req.query.type);
  res.status(httpStatus.OK).send({ games: gameList });
});

const getInvitedGames = catchAsync(async (req, res) => {
  const userDoc = await getUserfromToken(req.headers.authorization);
  const gameStatus = await gameService.getInvitedGames(userDoc._id, req.query.type);
  res.status(httpStatus.OK).send(gameStatus);
});

module.exports = {
  commitGame,
  getLiveGames,
  getCreatedGames,
  getGameInfo,
  getFinishedGames,
  getGameHistory,
  getGameStatus,
  getGameResult,
  getInvitedGames,
};
