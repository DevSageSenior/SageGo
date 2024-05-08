const mongoose = require('mongoose');
const { Schema } = mongoose;
const { toJSON, paginate } = require('../plugins');
const compareArray = require('../../utils/compareArray');
const { gameType } = require('../../config/game');

const boardSchema = mongoose.Schema(
  {
    originalBoard: {
      type: Schema.Types.ObjectId,
      ref: 'OriginalBoard',
      required: true,
    },
    changes: {
      type: Object,
      default: {},
      required: true,
    },
    name: {
      type: String,
      required: true,
      unique: true,
    },
    published: {
      type: Boolean,
      default: false,
    },
    designer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rate: {
      type: Number,
      default: 0,
    },
    type: {
      type: Number,
      enum: Object.values(gameType),
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

boardSchema.statics.isExist = async function (board, type = gameType.GO) {
  let compareBoard;
  switch (type) {
    case gameType.GO: {
      compareBoard = (boardL, boardR) => {
        return compareArray(boardL.changes.edges, boardR.changes.edges);
      };
    }
    case gameType.CHESS: {
      compareBoard = (boardL, boardR) => {
        return (
          compareArray(boardL.changes.deaths, boardR.changes.deaths) &&
          compareArray(boardL.changes.fears, boardR.changes.fears)
        );
      };
    }
  }
  let value = await this.find({ originalBoard: board.originalBoard })
    .then((boardDocs) => boardDocs.filter((boardDoc) => compareBoard(boardDoc, board)))
    .catch((err) => {
      throw err;
    });
  return value.length;
};

// add plugin that converts mongoose to json
boardSchema.plugin(toJSON);
boardSchema.plugin(paginate);

/**
 * @typedef Board
 */
const Board = mongoose.model('Board', boardSchema);

module.exports = Board;
