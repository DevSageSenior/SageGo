const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { boardService } = require('../services');
const { getUserfromToken } = require('../services/token.service');
const ApiError = require('../utils/ApiError');
const error = require('../config/error');

const commit = catchAsync(async (req, res) => {
  req.body.designer = req.user._id;
  const board = await boardService.commitBoard(req.body);
  res.status(httpStatus.CREATED).send({ board });
});

const getBoards = catchAsync(async (req, res) => {
  const token = req.headers.authorization;
  let boards;
  if (!token) boards = await boardService.getBoards(null, req.query.type);
  else {
    const userDoc = await getUserfromToken(token);
    boards = await boardService.getBoards(userDoc._id, req.query.type);
  }
  res.status(httpStatus.OK).send({ boards });
});

const getOriginalBoards = catchAsync(async (req, res) => {
  const board = await boardService.getOriginalBoards(req.query.type);
  res.status(httpStatus.OK).send({ board });
});

const getOriginalBoard = catchAsync(async (req, res) => {
  const board = await boardService.getOriginalBoard(req.query.id);
  if (!board) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.RequestNotCorrect);
  }
  if (board.published) res.status(httpStatus.OK).send({ board });
  else {
    throw new ApiError(httpStatus.FORBIDDEN, error.ActionForbidden);
  }
});

const getOriginalBoardsMenu = catchAsync(async (req, res) => {
  const boardList = await boardService.getOriginalBoardsMenu(req.query.type);
  res.status(httpStatus.OK).send({ originalBoardList: boardList });
});

const commitOriginal = catchAsync(async (req, res) => {
  const board = await boardService.commitOriginalBoard(req.body);
  res.status(httpStatus.CREATED).send({ board });
});

const publish = catchAsync(async (req, res) => {
  const result = await boardService.publish(req.body.id, req.body.type);
  res.status(httpStatus.CREATED).send(result);
});

const unpublish = catchAsync(async (req, res) => {
  const result = await boardService.unpublish(req.body.id, req.body.type);
  res.status(httpStatus.CREATED).send(result);
});

const getBoard = catchAsync(async (req, res) => {
  const board = await boardService.getBoard(req.query.id);
  res.status(httpStatus.OK).send({ board });
});

module.exports = {
  commit,
  getBoards,
  getOriginalBoardsMenu,
  getOriginalBoards,
  getOriginalBoard,
  commitOriginal,
  publish,
  unpublish,
  getBoard,
};
