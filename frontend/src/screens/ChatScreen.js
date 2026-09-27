import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../theme/colors';
import { ChatHeader } from '../components/ChatHeader';
import { MessageBubble } from '../components/MessageBubble';
import { MessageInput } from '../components/MessageInput';
import { TypingIndicator } from '../components/TypingIndicator';
import { OnlineUsersModal } from '../components/OnlineUsersModal';
import { EmptyChat } from '../components/EmptyChat';
import { ChatApi } from '../api/chatApi';
import { socketService } from '../services/socketService';
import { formatDateDivider } from '../utils/helpers';

export const ChatScreen = ({ currentUser, serverUrl, onLogout }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [errorBanner, setErrorBanner] = useState('');

  const flatListRef = useRef(null);

  /**
   * Load previous message history from SQLite via REST API
   */
  const loadMessageHistory = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const history = await ChatApi.getMessages(serverUrl);
      setMessages(history);
      setErrorBanner('');
    } catch (err) {
      console.error('Failed to load chat history:', err);
      setErrorBanner('Could not load chat history. Tap to retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [serverUrl]);

  /**
   * Initialize Socket.io connection and real-time listeners
   */
  useEffect(() => {
    // 1. Fetch initial chat history from SQLite via REST API
    loadMessageHistory();

    // 2. Fetch online users
    ChatApi.getOnlineUsers(serverUrl)
      .then((users) => setOnlineUsers(users))
      .catch((e) => console.log('Error fetching online users:', e));

    // 3. Connect to Socket.io
    socketService.connect(serverUrl, currentUser.username, {
      onConnect: () => {
        setIsConnected(true);
        setErrorBanner('');
      },
      onDisconnect: () => {
        setIsConnected(false);
      },
      onError: (err) => {
        setIsConnected(false);
        setErrorBanner('Connecting to real-time server...');
      },
      onReceiveMessage: (newMsg) => {
        setMessages((prev) => {
          // If this was our own optimistic message with tempId, replace it
          if (newMsg.tempId) {
            const index = prev.findIndex((m) => m.id === newMsg.tempId);
            if (index !== -1) {
              const updated = [...prev];
              updated[index] = newMsg;
              return updated;
            }
          }

          // Check if message already exists
          if (prev.some((m) => m.id === newMsg.id)) {
            return prev;
          }

          return [...prev, newMsg];
        });

        // Mark as read if received from another user
        if (newMsg.sender !== currentUser.username) {
          socketService.markRead(newMsg.id, currentUser.username);
        }
      },
      onUserTyping: ({ username, isTyping }) => {
        if (username === currentUser.username) return;

        setTypingUsers((prev) => {
          if (isTyping) {
            if (!prev.includes(username)) {
              return [...prev, username];
            }
            return prev;
          } else {
            return prev.filter((u) => u !== username);
          }
        });
      },
      onOnlineUsers: (users) => {
        setOnlineUsers(users);
      },
      onUserStatusChange: ({ username, isOnline }) => {
        setOnlineUsers((prev) => {
          const index = prev.findIndex((u) => u.username === username);
          if (index !== -1) {
            const updated = [...prev];
            updated[index] = { ...updated[index], is_online: isOnline ? 1 : 0 };
            return updated;
          } else if (isOnline) {
            return [...prev, { username, is_online: 1 }];
          }
          return prev;
        });
      },
      onMessageStatusChange: ({ messageId, status }) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, status } : msg
          )
        );
      },
    });

    // Cleanup socket on unmount
    return () => {
      socketService.disconnect();
    };
  }, [currentUser.username, loadMessageHistory, serverUrl]);

  /**
   * Handle sending a new message
   */
  const handleSendMessage = async (text) => {
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      id: tempId,
      sender: currentUser.username,
      recipient: 'all',
      text,
      timestamp: Date.now(),
      status: 'pending',
    };

    // Optimistic UI update
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      if (socketService.isConnected()) {
        // Send via Socket.io for instant real-time delivery
        const savedMessage = await socketService.sendMessage({
          sender: currentUser.username,
          text,
          recipient: 'all',
          tempId,
        });

        // Replace optimistic message with saved server response
        if (savedMessage) {
          setMessages((prev) =>
            prev.map((m) => (m.id === tempId ? savedMessage : m))
          );
        }
      } else {
        // Fallback to REST API if Socket is temporarily disconnected
        const savedMessage = await ChatApi.sendMessage(serverUrl, {
          sender: currentUser.username,
          text,
          recipient: 'all',
        });
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? savedMessage : m))
        );
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      // Mark as failed in UI
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId ? { ...m, status: 'failed' } : m
        )
      );
    }
  };

  /**
   * Typing handlers
   */
  const handleTypingStart = () => {
    socketService.sendTypingStart(currentUser.username);
  };

  const handleTypingStop = () => {
    socketService.sendTypingStop(currentUser.username);
  };

  /**
   * Render message item with smart date dividers
   */
  const renderItem = ({ item, index }) => {
    const prevItem = index > 0 ? messages[index - 1] : null;
    const isCurrentUser = item.sender === currentUser.username;

    // Check if we should render a date separator
    const currentDateStr = formatDateDivider(item.timestamp);
    const prevDateStr = prevItem ? formatDateDivider(prevItem.timestamp) : null;
    const showDateDivider = currentDateStr !== prevDateStr;

    return (
      <View>
        {showDateDivider && (
          <View style={styles.dateDivider}>
            <View style={styles.dateLine} />
            <Text style={styles.dateText}>{currentDateStr}</Text>
            <View style={styles.dateLine} />
          </View>
        )}
        <MessageBubble
          message={item}
          isCurrentUser={isCurrentUser}
          showSenderName={!prevItem || prevItem.sender !== item.sender}
        />
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      {/* Top Header */}
      <ChatHeader
        currentUser={currentUser}
        isConnected={isConnected}
        onlineCount={onlineUsers.filter((u) => u.is_online).length || 1}
        onOpenOnlineUsers={() => setShowUsersModal(true)}
        onLogout={onLogout}
      />

      {/* Network / Error Notice */}
      {errorBanner ? (
        <TouchableOpacity
          style={styles.errorNotice}
          onPress={() => loadMessageHistory(true)}
        >
          <Text style={styles.errorNoticeText}>⚠️ {errorBanner}</Text>
        </TouchableOpacity>
      ) : null}

      {/* Messages list */}
      <View style={styles.messageArea}>
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Fetching messages...</Text>
          </View>
        ) : messages.length === 0 ? (
          <EmptyChat username={currentUser.username} />
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => String(item.id || item.timestamp)}
            renderItem={renderItem}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }}
            onLayout={() => {
              flatListRef.current?.scrollToEnd({ animated: false });
            }}
            refreshing={refreshing}
            onRefresh={() => loadMessageHistory(true)}
          />
        )}

        {/* Typing indicator */}
        <TypingIndicator typingUsers={typingUsers} />
      </View>

      {/* Input bar */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onTypingStart={handleTypingStart}
        onTypingStop={handleTypingStop}
      />

      {/* Online Users Modal */}
      <OnlineUsersModal
        visible={showUsersModal}
        onClose={() => setShowUsersModal(false)}
        users={onlineUsers}
        currentUsername={currentUser.username}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  errorNotice: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(239, 68, 68, 0.3)',
    paddingVertical: 6,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  errorNoticeText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '600',
  },
  messageArea: {
    flex: 1,
    position: 'relative',
  },
  messagesList: {
    paddingVertical: 12,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: colors.textSecondary,
    fontSize: 13,
  },
  dateDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 14,
    paddingHorizontal: 20,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dateText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    marginHorizontal: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
