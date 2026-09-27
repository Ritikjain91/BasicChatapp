const { v4: uuidv4 } = require('uuid');
const { dbRun, dbAll, dbGet } = require('../config/database');

const AVATAR_COLORS = [
  '#4F46E5', '#7C3AED', '#EC4899', '#F59E0B', 
  '#10B981', '#3B82F6', '#06B6D4', '#8B5CF6'
];

const getRandomColor = () => {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
};

const UserModel = {
  /**
   * Register or log in a user by username
   */
  async findOrCreate(username) {
    const cleanUsername = username.trim();
    let user = await dbGet('SELECT * FROM users WHERE username = ?', [cleanUsername]);

    if (!user) {
      const id = uuidv4();
      const color = getRandomColor();
      const now = Date.now();
      await dbRun(
        'INSERT INTO users (id, username, avatar_color, is_online, last_seen) VALUES (?, ?, ?, 1, ?)',
        [id, cleanUsername, color, now]
      );
      user = {
        id,
        username: cleanUsername,
        avatar_color: color,
        is_online: 1,
        last_seen: now,
      };
    } else {
      // Mark as online
      const now = Date.now();
      await dbRun('UPDATE users SET is_online = 1, last_seen = ? WHERE id = ?', [now, user.id]);
      user.is_online = 1;
      user.last_seen = now;
    }

    return user;
  },

  /**
   * Set user online status
   */
  async setOnlineStatus(username, isOnline) {
    const now = Date.now();
    await dbRun(
      'UPDATE users SET is_online = ?, last_seen = ? WHERE username = ?',
      [isOnline ? 1 : 0, now, username]
    );
  },

  /**
   * Get all users
   */
  async getAllUsers() {
    return await dbAll('SELECT id, username, avatar_color, is_online, last_seen FROM users ORDER BY is_online DESC, username ASC');
  },

  /**
   * Get online users
   */
  async getOnlineUsers() {
    return await dbAll('SELECT id, username, avatar_color, is_online, last_seen FROM users WHERE is_online = 1 ORDER BY username ASC');
  }
};

module.exports = UserModel;
