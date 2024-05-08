const mongoose = require('mongoose');
const mpathPlugin = require('mongoose-mpath');
const { Schema } = mongoose;
const { toJSON } = require('../plugins');

const gameHistorySchema = mongoose.Schema(
  {
    game: {
      type: Schema.Types.ObjectId,
      ref: 'Game',
      required: true,
    },
    action: {
      type: Object,
      default: {},
    },
    player: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
gameHistorySchema.plugin(toJSON);
gameHistorySchema.plugin(mpathPlugin, { modelName: 'GameHistory' });

/**
 * @typedef GameHistory
 */
const GameHistory = mongoose.model('GameHistory', gameHistorySchema);

module.exports = GameHistory;
