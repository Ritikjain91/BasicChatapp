import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.currentUsername = null;
    this.listeners = new Map();
  }

  /**
   * Connect to Socket.io server
   */
  connect(serverUrl, username, handlers = {}) {
    if (this.socket && this.socket.connected) {
      if (this.currentUsername === username) {
        return this.socket;
      }
      this.disconnect();
    }

    this.currentUsername = username;

    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 15000,
    });

    this.socket.on('connect', () => {
      console.log('⚡ Socket connected with ID:', this.socket.id);
      if (handlers.onConnect) handlers.onConnect();

      // Emit join event with current username
      this.socket.emit('user_join', { username: this.currentUsername });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      if (handlers.onDisconnect) handlers.onDisconnect(reason);
    });

    this.socket.on('connect_error', (error) => {
      console.warn('⚠️ Socket connection error:', error.message);
      if (handlers.onError) handlers.onError(error);
    });

    this.socket.on('receive_message', (message) => {
      if (handlers.onReceiveMessage) {
        handlers.onReceiveMessage(message);
      }
    });

    this.socket.on('user_typing', (data) => {
      if (handlers.onUserTyping) {
        handlers.onUserTyping(data);
      }
    });

    this.socket.on('online_users_list', (users) => {
      if (handlers.onOnlineUsers) {
        handlers.onOnlineUsers(users);
      }
    });

    this.socket.on('user_status_change', (data) => {
      if (handlers.onUserStatusChange) {
        handlers.onUserStatusChange(data);
      }
    });

    this.socket.on('message_status_change', (data) => {
      if (handlers.onMessageStatusChange) {
        handlers.onMessageStatusChange(data);
      }
    });

    return this.socket;
  }

  /**
   * Send a real-time message through Socket.io
   */
  sendMessage({ sender, text, recipient = 'all', tempId = null }) {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.socket.connected) {
        reject(new Error('Socket is not connected'));
        return;
      }

      this.socket.emit(
        'send_message',
        { sender, text, recipient, tempId },
        (response) => {
          if (response && response.success) {
            resolve(response.data);
          } else {
            reject(new Error(response?.error || 'Failed to send message'));
          }
        }
      );
    });
  }

  /**
   * Notify that the current user started typing
   */
  sendTypingStart(username) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('typing_start', { username: username || this.currentUsername });
    }
  }

  /**
   * Notify that the current user stopped typing
   */
  sendTypingStop(username) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('typing_stop', { username: username || this.currentUsername });
    }
  }

  /**
   * Mark message as read
   */
  markRead(messageId, reader) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('mark_read', { messageId, reader: reader || this.currentUsername });
    }
  }

  /**
   * Graceful disconnect
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.currentUsername = null;
    }
  }

  /**
   * Check if currently connected
   */
  isConnected() {
    return Boolean(this.socket && this.socket.connected);
  }
}

export const socketService = new SocketService();
