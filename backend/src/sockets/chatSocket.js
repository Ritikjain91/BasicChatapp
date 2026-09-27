const MessageModel = require('../models/messageModel');
const UserModel = require('../models/userModel');

// Map of socket.id -> username
const socketUserMap = new Map();
// Map of username -> Set of socket.ids (handles multiple tabs/devices)
const userSocketsMap = new Map();

/**
 * Socket.io chat handlers setup
 */
const setupChatSocket = (io) => {
  const getOnlineUsernames = () => {
    return Array.from(userSocketsMap.keys());
  };

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Handle user join/login over socket
    socket.on('user_join', async (data) => {
      try {
        const username = typeof data === 'string' ? data : data?.username;
        if (!username || !username.trim()) return;

        const cleanUsername = username.trim();
        socketUserMap.set(socket.id, cleanUsername);

        if (!userSocketsMap.has(cleanUsername)) {
          userSocketsMap.set(cleanUsername, new Set());
        }
        userSocketsMap.get(cleanUsername).add(socket.id);

        // Update database user status
        await UserModel.setOnlineStatus(cleanUsername, true);

        console.log(`👤 User '${cleanUsername}' joined (socket ${socket.id})`);

        // Notify other users
        socket.broadcast.emit('user_status_change', {
          username: cleanUsername,
          isOnline: true,
          timestamp: Date.now(),
        });

        // Broadcast current online user list
        const onlineUsers = await UserModel.getOnlineUsers();
        io.emit('online_users_list', onlineUsers);

        // Acknowledge connection to joining client
        socket.emit('join_acknowledged', {
          username: cleanUsername,
          onlineUsers,
        });
      } catch (err) {
        console.error('Error handling user_join:', err);
        socket.emit('socket_error', { message: 'Failed to complete user join' });
      }
    });

    // Handle incoming message
    socket.on('send_message', async (data, callback) => {
      try {
        const { sender, text, recipient = 'all', tempId } = data || {};

        if (!sender || !text || !text.trim()) {
          if (typeof callback === 'function') {
            return callback({ success: false, error: 'Invalid message content or sender' });
          }
          return;
        }

        const cleanText = text.trim();
        const cleanSender = sender.trim();

        // Save to SQLite
        const message = await MessageModel.create({
          sender: cleanSender,
          recipient,
          text: cleanText,
          timestamp: Date.now(),
          status: 'sent',
        });

        // Broadcast to all connected clients in real time
        io.emit('receive_message', {
          ...message,
          tempId,
        });

        console.log(`💬 Message from [${cleanSender}]: "${cleanText.substring(0, 30)}${cleanText.length > 30 ? '...' : ''}"`);

        // Callback acknowledgment for sender
        if (typeof callback === 'function') {
          callback({ success: true, data: message });
        }
      } catch (err) {
        console.error('Error handling send_message:', err);
        if (typeof callback === 'function') {
          callback({ success: false, error: 'Failed to process message' });
        }
        socket.emit('socket_error', { message: 'Failed to send message' });
      }
    });

    // Handle typing start
    socket.on('typing_start', (data) => {
      const username = data?.username || socketUserMap.get(socket.id);
      if (username) {
        socket.broadcast.emit('user_typing', {
          username,
          isTyping: true,
        });
      }
    });

    // Handle typing stop
    socket.on('typing_stop', (data) => {
      const username = data?.username || socketUserMap.get(socket.id);
      if (username) {
        socket.broadcast.emit('user_typing', {
          username,
          isTyping: false,
        });
      }
    });

    // Handle message status updates (e.g. read receipts)
    socket.on('mark_read', async (data) => {
      try {
        const { messageId, reader } = data || {};
        if (messageId) {
          await MessageModel.updateStatus(messageId, 'read');
          io.emit('message_status_change', {
            messageId,
            status: 'read',
            reader,
          });
        }
      } catch (err) {
        console.error('Error updating message status:', err);
      }
    });

    // Handle disconnect gracefully
    socket.on('disconnect', async (reason) => {
      console.log(`🔌 Client disconnected: ${socket.id} (${reason})`);
      const username = socketUserMap.get(socket.id);

      if (username) {
        socketUserMap.delete(socket.id);

        const userSockets = userSocketsMap.get(username);
        if (userSockets) {
          userSockets.delete(socket.id);
          // If no more open connections for this username, set offline
          if (userSockets.size === 0) {
            userSocketsMap.delete(username);
            await UserModel.setOnlineStatus(username, false);

            console.log(`🚪 User '${username}' is now offline`);

            // Broadcast user left
            socket.broadcast.emit('user_status_change', {
              username,
              isOnline: false,
              timestamp: Date.now(),
            });

            // Broadcast updated online list
            const onlineUsers = await UserModel.getOnlineUsers();
            io.emit('online_users_list', onlineUsers);
          }
        }
      }
    });
  });
};

module.exports = { setupChatSocket };
