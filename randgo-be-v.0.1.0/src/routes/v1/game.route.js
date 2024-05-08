const express = require('express');
const validate = require('../../middlewares/validate');
const gameValidation = require('../../validations/game.validation');
const gameController = require('../../controllers/game.controller');
const auth = require('../../middlewares/auth');

const router = express.Router();

router.post('/commit', auth(), auth.isVerified(), validate(gameValidation.commitGame), gameController.commitGame);
router.get('/live', gameController.getLiveGames);
router.get('/created', gameController.getCreatedGames);
router.get('/game', gameController.getGameInfo);
router.get('/finished', gameController.getFinishedGames);
router.get('/gameStatus', gameController.getGameStatus);
router.get('/result', gameController.getGameResult);
router.get('/invited', gameController.getInvitedGames);

module.exports = router;
