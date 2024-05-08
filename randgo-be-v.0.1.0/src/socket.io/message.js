const config = require('../config/config');
const { messageService } = require('../services');
const { getUserfromToken } = require('../services/token.service');

const messageSocket = (messageNamespace) => {
  const userToSocket = [];

  messageNamespace.on('connection', async (socket) => {
    const token = socket.handshake.query.token;
    let userDoc;
    try {
      userDoc = await getUserfromToken(token);
    } catch (err) {
      socket.emit('Error', err);
      return;
    }
    userToSocket[userDoc._id] = socket;
    socket.on('message', async (receiver, receiver_name, message) => {
      try {
        if (!config.chatEnabled) throw new Error('Chatting is not available');
        const messageDoc = await messageService.postMessage(userDoc._id, receiver, message);
        socket.emit('message', {
          id: messageDoc._id,
          sender: userDoc._id,
          sender_name: userDoc.name,
          read: false,
          receiver,
          receiver_name,
          message,
        });
        userToSocket[receiver].emit('message', {
          id: messageDoc._id,
          sender: userDoc._id,
          sender_name: userDoc.name,
          read: false,
          receiver,
          receiver_name,
          message,
        });
        // messageNamespace.to(userToSocket[receiver]).emit('message', message)
      } catch (err) {
        socket.emit('Error', err);
      }
    });
    socket.on('disconnect', async () => {
      userToSocket[userDoc._id] = null;
    });
  });
};

module.exports = messageSocket;
