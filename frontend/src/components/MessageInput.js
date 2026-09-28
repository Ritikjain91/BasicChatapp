import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import { colors } from '../theme/colors';

const QUICK_EMOJIS = ['👋', '🔥', '🚀', '❤️', '👍', '🎉', '😊'];

export const MessageInput = ({
  onSendMessage,
  onTypingStart,
  onTypingStop,
  onFocus,
  disabled = false,
}) => {
  const [text, setText] = useState('');
  const typingTimeoutRef = useRef(null);

  const handleTextChange = (val) => {
    setText(val);

    if (val.trim().length > 0) {
      if (onTypingStart) onTypingStart();

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        if (onTypingStop) onTypingStop();
      }, 1500);
    } else {
      if (onTypingStop) onTypingStop();
    }
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (onTypingStop) onTypingStop();

    onSendMessage(trimmed);
    setText('');
  };

  const handleKeyPress = (e) => {
    if (Platform.OS === 'web') {
      if (e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    }
  };

  const addQuickEmoji = (emoji) => {
    setText((prev) => prev + emoji);
  };

  const canSend = text.trim().length > 0 && !disabled;

  return (
    <View style={styles.wrapper}>
      {/* Quick emoji bar */}
      <View style={styles.quickEmojiBar}>
        {QUICK_EMOJIS.map((emoji) => (
          <TouchableOpacity
            key={emoji}
            onPress={() => addQuickEmoji(emoji)}
            style={styles.emojiButton}
            activeOpacity={0.6}
          >
            <Text style={styles.emojiText}>{emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Input container */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          placeholderTextColor={colors.textMuted}
          value={text}
          onChangeText={handleTextChange}
          onKeyPress={handleKeyPress}
          onFocus={onFocus}
          multiline
          maxLength={1000}
          editable={!disabled}
          returnKeyType="send"
        />

        <TouchableOpacity
          style={[styles.sendButton, canSend ? styles.sendButtonActive : styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!canSend}
          activeOpacity={0.8}
        >
          <Text style={styles.sendIcon}>➤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  quickEmojiBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    gap: 6,
  },
  emojiButton: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  emojiText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    paddingLeft: 14,
    paddingRight: 6,
    paddingVertical: 4,
    minHeight: 44,
  },
  textInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
    maxHeight: 100,
    paddingTop: 8,
    paddingBottom: 8,
    paddingRight: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  sendButtonActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  sendIcon: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    transform: [{ rotate: '0deg' }],
  },
});
