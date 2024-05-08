const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { OriginalBoard, Board } = require('../models');
const compareArray = require('../utils/compareArray');
const originalBoard = require('../models/board/originalBoard.model');
const { boardType } = require('../config/board');
const { gameType } = require('../config/game');
const { ActionForbidden } = require('../config/error');
const error = require('../config/error');

/**
 * commit a transformed board
 * @param {object} board
 * @returns Promise<Board>
 */
const commitBoard = async (board) => {
  const OriginalBoardDoc = await OriginalBoard.findById(board.originalBoard);
  if (board.type != OriginalBoardDoc.type) {
    throw new ApiError(httpStatus.FORBIDDEN, error.ActionForbidden);
  }
  switch (board.type) {
    case gameType.GO: {
      if (OriginalBoardDoc == null || compareArray(OriginalBoardDoc.data.edges, board.changes.edges)) {
        throw new ApiError(httpStatus.BAD_REQUEST, error.RequestNotCorrect);
      }
      let changes = board.changes;
      if (!(changes.edges && changes.starPoints)) throw new ApiError(httpStatus.BAD_REQUEST, error.RequestNotCorrect);
      if ((await Board.isExist(board)) == 0) {
        return Board.create(board);
      }
      throw new ApiError(httpStatus.BAD_REQUEST, 'The same board exists');
    }
    case gameType.CHESS: {
      if (OriginalBoardDoc == null) throw new ApiError(httpStatus.BAD_REQUEST, error.RequestNotCorrect);
      board.changes.deaths.sort((_lv, _rv) => {
        return _lv - _rv;
      });
      board.changes.fears.sort((_lv, _rv) => {
        return _lv - _rv;
      });
      if (
        compareArray(OriginalBoardDoc.data.deaths, board.changes.deaths) &&
        compareArray(OriginalBoardDoc.data.fears, board.changes.fears)
      ) {
        throw new ApiError(httpStatus.BAD_REQUEST, error.RequestNotCorrect);
      }
      let changes = board.changes;
      if (!(changes.deaths && changes.fears)) throw new ApiError(httpStatus.BAD_REQUEST, error.RequestNotCorrect);
      if ((await Board.isExist(board)) == 0) {
        return Board.create(board);
      }
      throw new ApiError(httpStatus.BAD_REQUEST, 'The same board exists');
    }
  }
};

/**
 * commit an original board
 * @param {*} board
 * @returns Promise<Board>
 */
const commitOriginalBoard = async (board) => {
  if (!(await OriginalBoard.isExist(board))) return OriginalBoard.create(board);
};

/**
 * Get all boards
 * @returns Promises<Board>
 */

const getBoards = async (userId, type) => {
  const boardFilterOption = {
    $or: [{ published: true }, { designer: userId }],
  };
  if (type && type != '0') boardFilterOption.type = type;
  const originalFilterOption = {
    published: true,
  };
  if (type && type != '0') originalFilterOption.type = type;
  const BoardDocs = await Board.find(boardFilterOption)
    .populate({
      path: 'designer',
      select: 'name email',
    })
    .lean();
  BoardDocs.forEach(async (boardDoc, index) => {
    const originalBoardDoc = await originalBoard.findById(boardDoc.originalBoard);
    boardDoc.data = { ...originalBoardDoc.data, ...boardDoc.changes };
    delete boardDoc.changes;
    BoardDocs[index] = boardDoc;
  });
  const OriginalBoardDocs = await originalBoard.find(originalFilterOption).populate('designer', 'name email').lean();
  return [...BoardDocs, ...OriginalBoardDocs];
};

/**
 *
 * @param {Number} type Board type indicating to game type
 * @returns Menu of the boards
 */

const getOriginalBoardsMenu = (type) => {
  switch (type) {
    case gameType.GO: {
      return new Promise((resolve, reject) => {
        OriginalBoard.find({ published: true, type })
          .select('data.type data.size')
          .then((OriginalBoardDocs) => resolve(OriginalBoardDocs))
          .catch((err) => reject(err));
      });
    }
    case gameType.CHESS: {
      return new Promise((resolve, reject) => {
        OriginalBoard.find({ published: true, type })
          .then((OriginalBoardDocs) => resolve(OriginalBoardDocs))
          .catch((err) => reject(err));
      });
    }
  }
};

const getOriginalBoards = (type) => {
  const filterOption = {
    published: true,
    type,
  };
  return new Promise((resolve, reject) => {
    OriginalBoard.find(filterOption)
      .populate({
        path: 'designer',
        select: 'name email',
      })
      .then((OriginalBoardDocs) => resolve(OriginalBoardDocs))
      .catch((err) => reject(err));
  });
};

const getOriginalBoard = (id) => {
  return new Promise((resolve, reject) => {
    OriginalBoard.findById(id)
      .populate({
        path: 'designer',
        select: 'name email',
      })
      .then((OriginalBoardDoc) => resolve(OriginalBoardDoc))
      .catch((err) => reject(err));
  });
};

const getBoard = async (id) => {
  let boardDoc = await Board.findById(id)
    .populate({
      path: 'designer',
      select: 'name email',
    })
    .lean();
  const originalboardDoc = await originalBoard.findById(id).populate('designer', 'name email');
  if (originalboardDoc) return originalboardDoc;
  if (!boardDoc) {
    throw new ApiError(httpStatus.FORBIDDEN, ActionForbidden);
  }
  const originalBoardDoc = await originalBoard.findById(boardDoc.originalBoard);
  boardDoc.data = { ...originalBoardDoc.data, ...boardDoc.changes };
  delete boardDoc.changes;
  return boardDoc;
};

const useBoard = async (id) => {
  let boardDoc = await Board.findById(id);
  const originalboardDoc = await originalBoard.findById(id);
  if (originalboardDoc) {
    originalboardDoc.rate++;
    return await originalboardDoc.save();
  }
  if (!boardDoc) {
    throw new ApiError(httpStatus.FORBIDDEN, ActionForbidden);
  }
  boardDoc.rate++;
  return await boardDoc.save();
};

/**
 * publish unpublished go board
 * @param {objectId} id
 */
const publish = async (id, type) => {
  if (type == boardType.ORIGINAL) return await OriginalBoard.findByIdAndUpdate(id, { published: true });
  else return await Board.findByIdAndUpdate(id, { published: true });
};

const unpublish = async (id, type) => {
  if (type == boardType.ORIGINAL) return await OriginalBoard.findByIdAndUpdate(id, { published: false });
  else return await Board.findByIdAndUpdate(id, { published: false });
};

module.exports = {
  commitBoard,
  getBoard,
  useBoard,
  getBoards,
  getOriginalBoardsMenu,
  getOriginalBoards,
  getOriginalBoard,
  commitOriginalBoard,
  publish,
  unpublish,
};
