const Joi = require('joi');
const { objectId } = require('./custom.validation');

const commitGame = {
  body: Joi.object().keys({
    private: Joi.boolean().required(),
    inviteOnly: Joi.boolean().required(),
    miscellaneous: Joi.object().required(),
    gameSpeed: Joi.number().required(),
    timePerMove: Joi.number().required(),
    board: Joi.required().custom(objectId),
    player1: Joi.required().custom(objectId),
    player2: Joi.custom(objectId),
    player1Ready: Joi.boolean(),
    player2Ready: Joi.boolean(),
    state: Joi.number(),
    invitedUsers: Joi.array(),
    gameType: Joi.number().required(),
  }),
};

module.exports = {
  commitGame,
};
