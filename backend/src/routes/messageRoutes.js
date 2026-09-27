const express = require('express');
const router = express.Router();
const MessageController = require('../controllers/messageController');

// GET /api/messages - Fetch chat history
router.get('/', MessageController.getMessages);

// POST /api/messages - Send a new message
router.post('/', MessageController.sendMessage);

// PUT /api/messages/read - Mark messages as read
router.put('/read', MessageController.markAsRead);

module.exports = router;
