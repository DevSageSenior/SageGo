const mongoose = require('mongoose');
const { Schema } = mongoose;
const { toJSON, paginate } = require('../plugins');
const compareArray = require('../../utils/compareArray');
const { gameType } = require('../../config/game');

const originalBoardSchema = mongoose.Schema(
  {
    gameType: {
      type: Number,
      default: gameType.GO,
    },
    designer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    published: {
      type: Boolean,
      default: false,
    },
    rate: {
      type: Number,
      default: 0,
    },
    data: {
      type: Object,
      default: {},
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

// add plugin that converts mongoose to json
originalBoardSchema.plugin(toJSON);
originalBoardSchema.plugin(paginate);

originalBoardSchema.statics.isExist = async (board, type = gameType.GO) => {
  switch (type) {
    case gameType.GO: {
      return await originalBoard
        .find()
        .then((boardDocs) => boardDocs.filter((boardDoc) => compareArray(boardDoc.data.edges, board.data.edges)));
    }
    case gameType.CHESS: {
      return await originalBoard.find().then((boardDocs) => {
        boardDocs.filter(
          (boardDoc) =>
            compareArray(boardDoc.data.deaths, board.data.deaths) && compareArray(boardDoc.data.fears, board.data.fears)
        );
      });
    }
  }
};

const originalBoard = mongoose.model('OriginalBoard', originalBoardSchema);

module.exports = originalBoard;
