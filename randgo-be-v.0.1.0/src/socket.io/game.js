const config = require('../config/config');
const error = require('../config/error');
const { gameState } = require('../config/game');
const { gameService, userService } = require('../services');
const { getUserfromToken } = require('../services/token.service');

/**
 * Manage the sockets grouped by user
 */
class UserSocketsRegistry {
  constructor() {
    this.userSockets = {}
    this.socketIds = new Set()
  }
  registerSocket(userId, socket) {
    if (this.socketIds.has(socket.id)) {
      // the socket is already added
      return;
    }
    if (this.userSockets[userId] && this.userSockets[userId].map((val)=>val.id).indexOf(socket.id) >= 0) {
      // the socket is already added, though this case shouldn't happen
      console.log("DEV-ATTENTION! Unexpected event happened. Code: UserSocketsRegistry-registerSocket");
      return;
    }
    if (!this.userSockets[userId]) {
      this.userSockets[userId] = []
    }
    this.userSockets[userId].push(socket)
  }
  unregisterSocket(userId, socket) {
    let socketIndex = this.userSockets.findIndex((val)=>val.id===socket.id)
    if (socketIndex<0)
      return
    this.userSockets[userId].splice(socketIndex,1)
    this.socketIds.delete(socket.id)
  }
  getSockets(userId) {
    return this.userSockets[userId] || []
  }
}

const gameSocket = (gameNamespace) => {
  const userToSockets = new UserSocketsRegistry();

  gameNamespace.on('connection', (socket) => {
    socket.emit('authenticate');
    let userDoc = { _id: null };
    let validateAuth = () => {
      if (!userDoc._id) throw new Error(error.Authenticate);
      return true;
    };
    let validateEmailVerify = () => {
      if (!userDoc.isEmailVerified) throw new Error(error.EmailNotVerified);
      return true;
    };
    socket.on('authenticate', async (token) => {
      try {
        userDoc = await getUserfromToken(token);
        let gameIds = await gameService.getGamesfromUserId(userDoc._id);
        await userService.loginGameRoom(userDoc._id);
        userToSockets.registerSocket(userDoc._id, socket);
        gameIds.forEach(({ _id }) => {
          socket.join(_id.toString());
        });
      } catch (err) {
        socket.emit('Error', err);
        return;
      }
    });
    socket.on('getLiveRooms', async (type = -1) => {
      try {
        const gameList = await gameService.getGameList(gameState.PLAYING, userDoc._id, type);
        socket.emit(
          'Live Rooms',
          gameList.map((gameDocs) => {
            gameDocs.observerCount = gameNamespace.adapter.rooms.get(gameDocs._id.toString());
            return gameDocs;
          })
        );
      } catch (error) {
        socket.emit('Error', error.message);
      }
    });
    socket.on('getCreatedRooms', async (type = -1) => {
      try {
        const gameList = await gameService.getGameList(gameState.CREATED, userDoc._id, type);
        socket.emit('Created Rooms', gameList);
      } catch (error) {
        socket.emit('Error', error.message);
      }
    });
    socket.on('create', async (game) => {
      try {
        validateAuth() && validateEmailVerify();
        game.player1 = userDoc._id;
        const gameDoc = await gameService.commitGame(game);
        if (!game.private) gameNamespace.emit('create', gameDoc);
        const invitedUsers = gameDoc.invitedUsers;
        invitedUsers.forEach((userId) => {
          for (const _socket of userToSockets.getSockets(userId)) {
            _socket.emit('invited', gameDoc);
          }
        });
        socket.join(gameDoc._id.toString());
      } catch (error) {
        socket.emit('Error', error.message);
      }
    });
    socket.on('join', async (gameId) => {
      try {
        validateAuth() && validateEmailVerify();
        const gameDoc = await gameService.joinGame(gameId, userDoc._id);
        socket.join(gameDoc._id.toString());
        gameNamespace.emit('joined', gameDoc);
      } catch (error) {
        socket.emit('Error', error.message);
      }
    });
    socket.on('load', async (gameId) => {
      try {
        const gameData = await gameService.loadGameHistory(gameId);
        socket.join(gameId);
        socket.emit('load', { ...gameData, gameId });
      } catch (error) {
        socket.emit('Error', error.message);
      }
    });
    socket.on('observe', async (gameId) => {
      try {
        const gameData = await gameService.loadGameHistory(gameId);
        socket.join(gameId);
        socket.emit('observe', { ...gameData, gameId });
      } catch (error) {
        socket.emit('Error', error.message);
      }
    });
    socket.on('ready', async (gameId) => {
      try {
        validateAuth() && validateEmailVerify();
        const gameDoc = await gameService.setReady(gameId, userDoc._id);
        gameNamespace.in(gameDoc._id.toString()).emit('ready', gameDoc);
      } catch (error) {
        socket.emit('Error', error.message);
      }
    });
    socket.on('start', async (gameId) => {
      try {
        validateAuth() && validateEmailVerify();
        gameService.startGame(gameId);
        gameNamespace.in(gameId).emit('gamestarted', 'Game Started');
      } catch (error) {
        socket.emit('Error', error.message);
      }
    });
    socket.on('doAction', (gameId, action) => {
      try {
        validateAuth() && validateEmailVerify();
        gameService
          .doAction(userDoc._id, gameId, action)
          .then((gameData) => {
            gameNamespace.emit('doAction', { ...gameData, player: userDoc.name, gameId });
            if (gameData.finished) gameNamespace.emit('finished', { ...gameData, player: userDoc.name, gameId });
          })
          .catch((error) => {
            socket.emit('Error', error.message);
          });
      } catch (error) {
        socket.emit('Error', error.message);
      }
    });
    socket.on('pass', async (gameId) => {
      try {
        validateAuth() && validateEmailVerify();
        const isFinished = await gameService.pass(userDoc._id, gameId);
        if (!isFinished) gameNamespace.in(gameId).emit('passed', { player: userDoc.name, gameId });
        else {
          gameNamespace.in(gameId).emit('finished', { player: userDoc.name, gameId });
        }
      } catch (error) {
        socket.emit('Error', error.message);
      }
    });

    socket.on('resign', async (gameId) => {
      try {
        validateAuth() && validateEmailVerify();
        await gameService.resign(userDoc._id, gameId);
        gameNamespace.in(gameId).emit('resigned', { player: userDoc.id, gameId });
      } catch (error) {
        socket.emit('Error', error.message);
      }
    });

    // Game Chat
    socket.on('message', async (message, gameId) => {
      try {
        validateAuth() && validateEmailVerify();
        if (!config.chatEnabled) throw new Error('Chatting is not available.');
        await gameService.sendMessage(userDoc._id, message, gameId);
        const messageList = await gameService.getMessages(userDoc._id, gameId);
        gameNamespace.in(gameId).emit('message', messageList);
      } catch (error) {
        socket.emit('Error', error.message);
      }
    });

    socket.on('messages', async (gameId) => {
      try {
        const messageList = await gameService.getMessages(userDoc._id, gameId);
        socket.emit('messages', { messageList });
      } catch (error) {
        socket.emit('Error', error.message);
      }
    });

    socket.on('disconnect', async () => {
      try {
        // cancel joining the games
        await gameService.disconnectGame(userDoc._id);
        // unregister the socket
        userToSockets.unregisterSocket(userDoc._id, socket);
        if (userToSockets.getSockets(userDoc._id).length===0) {
          // mark the user as offline
          await userService.logoutGameRoom(userDoc._id);
        }
      } catch (error) {
        socket.emit('Error', error.message);
      }
    });
  });
};

module.exports = gameSocket;
