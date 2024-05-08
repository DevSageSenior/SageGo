const mongoose = require('mongoose');
const { Schema } = mongoose;
const gameConfig = require('../../config/game');
const { toJSON, paginate } = require('../plugins');

const gameChatSchema = mongoose.Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    game: {
      type: Schema.Types.ObjectId,
      ref: 'Game',
      required: true,
    },
    message: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
gameChatSchema.plugin(toJSON);

/**
 * @typedef Game
 */
const GameChat = mongoose.model('GameChat', gameChatSchema);

module.exports = GameChat;
