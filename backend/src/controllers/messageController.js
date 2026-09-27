const MessageModel = require('../models/messageModel');

/**
 * Controller for handling message REST APIs
 */
const MessageController = {
  /**
   * Fetch chat history
   * GET /api/messages
   */
  async getMessages(req, res, next) {
    try {
      const { limit = 100, before } = req.query;
      const messages = await MessageModel.getHistory(limit, before);
      res.status(200).json({
        success: true,
        count: messages.length,
        data: messages,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Send a new message via REST API
   * POST /api/messages
   */
  async sendMessage(req, res, next) {
    try {
      const { sender, text, recipient = 'all' } = req.body;

      if (!sender || typeof sender !== 'string' || !sender.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Sender username is required and must be non-empty.',
        });
      }

      if (!text || typeof text !== 'string' || !text.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Message text is required and cannot be empty.',
        });
      }

      const message = await MessageModel.create({
        sender: sender.trim(),
        text: text.trim(),
        recipient,
        timestamp: Date.now(),
        status: 'delivered',
      });

      // Broadcast to all connected socket clients if socket.io is available on req
      if (req.io) {
        req.io.emit('receive_message', message);
      }

      res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: message,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Mark messages as read
   * PUT /api/messages/read
   */
  async markAsRead(req, res, next) {
    try {
      const { reader } = req.body;
      if (!reader) {
        return res.status(400).json({
          success: false,
          error: 'Reader username is required.',
        });
      }

      const updatedCount = await MessageModel.markAsRead(reader);

      if (req.io && updatedCount > 0) {
        req.io.emit('messages_marked_read', { reader, count: updatedCount });
      }

      res.status(200).json({
        success: true,
        message: `${updatedCount} messages marked as read`,
        count: updatedCount,
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = MessageController;
