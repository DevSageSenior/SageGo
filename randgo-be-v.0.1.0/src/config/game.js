const gameState = {
  PLANNED: 0,
  CREATED: 1,
  PLAYING: 2,
  FINISHED: 3,
};

const gameRule = {
  CHINESE: 0,
  JAPANESE: 1,
};

const gameType = {
  GO: 1,
  CHESS: 2,
};

const gameName = {
  1: 'Go',
  2: 'Chess',
};

const gameSpeed = {
  1: 'Live',
  2: 'Correspondent',
  3: 'Untimed',
};

module.exports = {
  gameState,
  gameRule,
  gameType,
  gameName,
  gameSpeed,
};
