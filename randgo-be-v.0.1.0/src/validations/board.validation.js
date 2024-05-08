const Joi = require('joi');
const { objectId } = require('./custom.validation');

const commitOriginal = {
  body: Joi.object().keys({
    data: Joi.object(),
    edges: Joi.array().required(),
    designer: Joi.required().custom(objectId),
    type: Joi.number().required(),
  }),
};

const commit = {
  body: Joi.object().keys({
    originalBoard: Joi.required().custom(objectId),
    published: Joi.boolean().required(),
    name: Joi.string().required(),
    changes: Joi.object().required(),
    type: Joi.number().required(),
  }),
};

const getOriginalBoard = {
  query: Joi.object().keys({
    id: Joi.required().custom(objectId),
  }),
};

const getOriginalBoardsMenu = {
  query: Joi.object().keys({
    type: Joi.number().required(),
  }),
};

const publish = {
  body: Joi.object().keys({
    id: Joi.required().custom(objectId),
    type: Joi.number().required(),
  }),
};

const unpublish = {
  body: Joi.object().keys({
    id: Joi.required().custom(objectId),
    type: Joi.number().required(),
  }),
};

const getBoard = {
  query: Joi.object().keys({
    id: Joi.required().custom(objectId),
  }),
};

module.exports = {
  commitOriginal,
  commit,
  getOriginalBoard,
  publish,
  unpublish,
  getBoard,
  getOriginalBoardsMenu,
};
