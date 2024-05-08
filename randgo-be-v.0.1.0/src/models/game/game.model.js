const mongoose = require('mongoose');
const { Schema } = mongoose;
const gameConfig = require('../../config/game');
const { toJSON, paginate } = require('../plugins');

const gameSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: false,
    },
    type: {
      type: Number,
      required: true,
      default: gameConfig.gameType.GO,
    },
    private: {
      type: Boolean,
      default: false,
    },
    inviteOnly: {
      type: Boolean,
      default: false,
    },
    rules: {
      type: Number,
    },
    gameSpeed: {
      type: Number,
    },
    timePerMove: {
      type: Number,
      required: true,
    },
    board: {
      type: Schema.Types.ObjectId,
      ref: 'Board',
    },
    miscellaneous: {
      type: Object,
    },
    player1: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    player2: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    player1Ready: {
      type: Boolean,
      default: false,
    },
    player2Ready: {
      type: Boolean,
      default: false,
    },
    state: {
      type: Number,
      default: gameConfig.gameState.CREATED,
    },
    observers: {
      type: Array,
      default: [],
    },
    lastTurn: {
      type: Schema.Types.ObjectId,
      ref: 'GameHistory',
      default: null,
    },
    result: {
      type: String,
    },
    invitedUsers: {
      type: [Schema.Types.ObjectId],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
gameSchema.plugin(toJSON);
gameSchema.plugin(paginate);

/**
 * @typedef Game
 */
const Game = mongoose.model('Game', gameSchema);

module.exports = Game;
