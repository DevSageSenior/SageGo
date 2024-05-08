const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const boardRoute = require('./board.route');
const gameRoute = require('./game.route');
const messageRoute = require('./message.route');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/board',
    route: boardRoute,
  },
  {
    path: '/game',
    route: gameRoute,
  },
  {
    path: '/message',
    route: messageRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
