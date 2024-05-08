const express = require('express');
const validate = require('../../middlewares/validate');
const boardValidation = require('../../validations/board.validation');
const boardController = require('../../controllers/board.controller');
const auth = require('../../middlewares/auth');

const router = express.Router();

router.post('/commit', auth(), auth.isVerified(), validate(boardValidation.commit), boardController.commit);
router.get('/boards', boardController.getBoards);
router.post(
  '/commit_original',
  auth(),
  auth.isVerified(),
  validate(boardValidation.commitOriginal),
  boardController.commitOriginal
);
router.get('/original_menu', validate(boardValidation.getOriginalBoardsMenu), boardController.getOriginalBoardsMenu);
router.get('/original_boards', boardController.getOriginalBoards);
router.get('/original_board', validate(boardValidation.getOriginalBoard), boardController.getOriginalBoard);
router.post('/publish', auth(), auth.isVerified(), validate(boardValidation.publish), boardController.publish);
router.post('/unpublish', auth(), auth.isVerified(), validate(boardValidation.unpublish), boardController.unpublish);
router.get('/board', validate(boardValidation.getBoard), boardController.getBoard);
module.exports = router;
