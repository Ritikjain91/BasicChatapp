require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const { createApp } = require('./app');
const { initDatabase } = require('./config/database');
const { setupChatSocket } = require('./sockets/chatSocket');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Initialize SQLite Database Schema
    await initDatabase();

    // 2. Create HTTP Server
    const server = http.createServer();

    // 3. Initialize Socket.io with robust CORS
    const io = new Server(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
      },
      pingTimeout: 30000,
      pingInterval: 25000,
    });

    // 4. Attach Express App to HTTP Server
    const app = createApp(io);
    server.on('request', app);

    // 5. Setup Socket.io real-time chat event handlers
    setupChatSocket(io);

    // 6. Start listening
    server.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`🚀 ChatApp Server running on port ${PORT}`);
      console.log(`📡 Socket.io ready for real-time connections`);
      console.log(`🔗 REST API: http://localhost:${PORT}/api`);
      console.log(`===============================================`);
    });

    // Graceful shutdown handling
    const shutdown = () => {
      console.log('Shutting down server gracefully...');
      server.close(() => {
        console.log('Server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
