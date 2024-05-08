const httpStatus = require('http-status');
const { Message, Friend } = require('../models');
const ApiError = require('../utils/ApiError');
const error = require('../config/error');

const postMessage = async (sender, receiver, message) => {
  const friendshipDoc = await Friend.findOne({ sender, receiver });
  const friendshipDoc1 = await Friend.findOne({ sender: receiver, receiver: sender }); // Two Directions Handling
  if ((!friendshipDoc || friendshipDoc.accepted == false) && (!friendshipDoc1 || friendshipDoc1.accepted == false)) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You can only send messages to friends');
  }
  return await Message.create({
    sender,
    receiver,
    message,
  });
};

const getMessages = async (filter, options) => {
  // const messageDocs = await Message.paginate(filter, options);
  var messageDocs;
  await Message.find(filter)
    .then(async (gameDocs) => {
      messageDocs = gameDocs;
    })
    .catch((err) => {})
    .finally(() => {});
  // return messageDocs;
  return messageDocs;
};

const readMessage = async (userId, messageId) => {
  const messageDoc = await Message.findById(messageId);
  if (!messageDoc || !messageDoc.receiver.equals(userId)) {
    throw new ApiError(httpStatus.FORBIDDEN, error.ActionForbidden);
  }
  messageDoc.read = true;
  await messageDoc.save();
};

module.exports = {
  postMessage,
  getMessages,
  readMessage,
};
