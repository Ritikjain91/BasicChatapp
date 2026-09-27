const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');

// POST /api/auth/login - Username login
router.post('/login', AuthController.login);

// GET /api/users - List users
router.get('/users', AuthController.getUsers);

// GET /api/users/online - List online users
router.get('/users/online', AuthController.getOnlineUsers);

module.exports = router;
