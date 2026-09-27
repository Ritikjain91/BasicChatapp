import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, getAvatarColor } from '../theme/colors';
import { formatTime } from '../utils/helpers';
import { UserAvatar } from './UserAvatar';

export const MessageBubble = ({ message, isCurrentUser, showSenderName = true }) => {
  const { sender, text, timestamp, status } = message;
  const timeString = formatTime(timestamp);

  // Status icon rendering
  const renderStatus = () => {
    if (!isCurrentUser) return null;

    if (status === 'pending') {
      return <Text style={styles.statusTick}>🕒</Text>;
    } else if (status === 'read') {
      return <Text style={[styles.statusTick, { color: colors.readTick }]}>✓✓</Text>;
    } else if (status === 'delivered') {
      return <Text style={[styles.statusTick, { color: colors.sentTick }]}>✓✓</Text>;
    } else {
      // Sent
      return <Text style={[styles.statusTick, { color: colors.sentTick }]}>✓</Text>;
    }
  };

  return (
    <View
      style={[
        styles.rowContainer,
        isCurrentUser ? styles.rowRight : styles.rowLeft,
      ]}
    >
      {/* Avatar for other users */}
      {!isCurrentUser && (
        <View style={styles.avatarWrapper}>
          <UserAvatar name={sender} size={30} />
        </View>
      )}

      <View
        style={[
          styles.bubble,
          isCurrentUser ? styles.senderBubble : styles.receiverBubble,
        ]}
      >
        {/* Sender name for group clarity */}
        {!isCurrentUser && showSenderName && (
          <Text style={[styles.senderName, { color: getAvatarColor(sender) }]}>
            {sender}
          </Text>
        )}

        {/* Message text */}
        <Text
          style={[
            styles.messageText,
            isCurrentUser ? styles.senderText : styles.receiverText,
          ]}
        >
          {text}
        </Text>

        {/* Meta row: timestamp & read receipt ticks */}
        <View style={styles.metaRow}>
          <Text
            style={[
              styles.timeText,
              isCurrentUser ? styles.senderTime : styles.receiverTime,
            ]}
          >
            {timeString}
          </Text>
          {renderStatus()}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingHorizontal: 12,
    alignItems: 'flex-end',
  },
  rowRight: {
    justifyContent: 'flex-end',
  },
  rowLeft: {
    justifyContent: 'flex-start',
  },
  avatarWrapper: {
    marginRight: 8,
    marginBottom: 2,
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  senderBubble: {
    backgroundColor: colors.senderBubble,
    borderBottomRightRadius: 4,
  },
  receiverBubble: {
    backgroundColor: colors.receiverBubble,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
  },
  senderText: {
    color: colors.senderText,
  },
  receiverText: {
    color: colors.receiverText,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  timeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  senderTime: {
    color: colors.senderTime,
  },
  receiverTime: {
    color: colors.receiverTime,
  },
  statusTick: {
    fontSize: 11,
    marginLeft: 4,
    fontWeight: '700',
  },
});
