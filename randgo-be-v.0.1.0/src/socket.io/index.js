const http = require('http');
const socketIo = require('socket.io');
const gameSocket = require('./game');
const express = require('express');
const cors = require('cors');
const messageSocket = require('./message');
const app = express();
// enable cors
const server = http.createServer(app);
const io = socketIo(server);

io.use(cors());
const gameNamespace = io.of('/game');
gameSocket(gameNamespace);

const messageNamespace = io.of('/message');
messageSocket(messageNamespace);

module.exports = server;
