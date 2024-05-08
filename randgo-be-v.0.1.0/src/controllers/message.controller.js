const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { messageService } = require('../services');

const postMessage = catchAsync(async (req, res) => {
  const { receiver, message } = req.body;
  const messageDoc = await messageService.postMessage(req.user._id, receiver, message);
  res.status(httpStatus.OK).send(messageDoc);
});

const getUserMessages = catchAsync(async (req, res) => {
  const { communicator } = req.query;
  const filter = {
    $or: [
      { sender: req.user._id, receiver: communicator },
      { sender: communicator, receiver: req.user._id },
    ],
  };
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const messageDoc = await messageService.getMessages(filter, options);
  res.status(httpStatus.OK).send(messageDoc);
});

const getAllUserMessages = catchAsync(async (req, res) => {
  const filter = { $or: [{ sender: req.user._id }, { receiver: req.user._id }] };
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const messageDoc = await messageService.getMessages(filter, options);
  res.status(httpStatus.OK).send(messageDoc);
});

const readMessage = catchAsync(async (req, res) => {
  const { messageId } = req.body;
  await messageService.readMessage(req.user._id, messageId);
  res.status(httpStatus.OK).send();
});

module.exports = {
  postMessage,
  getUserMessages,
  getAllUserMessages,
  readMessage,
};
