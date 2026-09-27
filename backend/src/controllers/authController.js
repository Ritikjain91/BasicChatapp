const UserModel = require('../models/userModel');

const AuthController = {
  /**
   * Username-based login
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const { username } = req.body;

      if (!username || typeof username !== 'string' || !username.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Username is required and must not be empty.',
        });
      }

      const trimmed = username.trim();
      if (trimmed.length < 2 || trimmed.length > 25) {
        return res.status(400).json({
          success: false,
          error: 'Username must be between 2 and 25 characters.',
        });
      }

      const user = await UserModel.findOrCreate(trimmed);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get all registered and online users
   * GET /api/users
   */
  async getUsers(req, res, next) {
    try {
      const users = await UserModel.getAllUsers();
      res.status(200).json({
        success: true,
        count: users.length,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get online users only
   * GET /api/users/online
   */
  async getOnlineUsers(req, res, next) {
    try {
      const onlineUsers = await UserModel.getOnlineUsers();
      res.status(200).json({
        success: true,
        count: onlineUsers.length,
        data: onlineUsers,
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = AuthController;
