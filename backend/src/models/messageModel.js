const { v4: uuidv4 } = require('uuid');
const { dbRun, dbAll, dbGet } = require('../config/database');

const MessageModel = {
  /**
   * Save a new message to the database
   */
  async create({ sender, text, recipient = 'all', id = null, timestamp = null, status = 'sent' }) {
    const messageId = id || uuidv4();
    const messageTimestamp = timestamp || Date.now();

    const sql = `
      INSERT INTO messages (id, sender, recipient, text, timestamp, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await dbRun(sql, [messageId, sender, recipient, text, messageTimestamp, status]);

    return {
      id: messageId,
      sender,
      recipient,
      text,
      timestamp: messageTimestamp,
      status,
    };
  },

  /**
   * Retrieve message history
   */
  async getHistory(limit = 100, before = null) {
    let sql = 'SELECT * FROM messages';
    const params = [];

    if (before) {
      sql += ' WHERE timestamp < ?';
      params.push(before);
    }

    sql += ' ORDER BY timestamp ASC LIMIT ?';
    params.push(Number(limit) || 100);

    const rows = await dbAll(sql, params);
    return rows;
  },

  /**
   * Update message status (e.g., sent -> delivered -> read)
   */
  async updateStatus(id, status) {
    const sql = 'UPDATE messages SET status = ? WHERE id = ?';
    const result = await dbRun(sql, [status, id]);
    return result.changes > 0;
  },

  /**
   * Mark all messages sent by others as read for a given recipient/channel
   */
  async markAsRead(excludeSender) {
    const sql = `UPDATE messages SET status = 'read' WHERE sender != ? AND status != 'read'`;
    const result = await dbRun(sql, [excludeSender]);
    return result.changes;
  },

  /**
   * Get a single message by ID
   */
  async getById(id) {
    const sql = 'SELECT * FROM messages WHERE id = ?';
    return await dbGet(sql, [id]);
  }
};

module.exports = MessageModel;
