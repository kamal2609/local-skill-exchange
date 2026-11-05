const express = require('express');
const router = express.Router();

const {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
} = require('../controllers/messageController');

const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createConversationSchema,
  sendMessageSchema,
} = require('../validators/communicationValidators');

// Protected conversation & message routes
router.get('/', protect, getConversations);
router.post('/', protect, validate(createConversationSchema), getOrCreateConversation);
router.get('/:id/messages', protect, getMessages);
router.post('/:id/messages', protect, validate(sendMessageSchema), sendMessage);

module.exports = router;

