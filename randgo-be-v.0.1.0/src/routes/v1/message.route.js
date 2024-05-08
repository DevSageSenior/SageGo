const express = require('express');
const validate = require('../../middlewares/validate');
const messageController = require('../../controllers/message.controller');
const auth = require('../../middlewares/auth');

const router = express.Router();

router.post('/', auth(), auth.isVerified(), messageController.postMessage);
router.get('/', auth(), auth.isVerified(), messageController.getUserMessages);
router.get('/all', auth(), auth.isVerified(), messageController.getAllUserMessages);
router.post('/read', auth(), auth.isVerified(), messageController.readMessage);

module.exports = router;
