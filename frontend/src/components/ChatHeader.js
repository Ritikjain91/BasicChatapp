import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { colors } from '../theme/colors';
import { UserAvatar } from './UserAvatar';

export const ChatHeader = ({
  currentUser,
  isConnected,
  onlineCount = 1,
  onOpenOnlineUsers,
  onLogout,
}) => {
  return (
    <View style={styles.header}>
      {/* Left side: Channel info & Status */}
      <View style={styles.channelInfo}>
        <View style={styles.titleRow}>
          <Text style={styles.channelHash}>#</Text>
          <Text style={styles.channelTitle}>general-chat</Text>
        </View>

        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isConnected ? colors.online : colors.warning },
            ]}
          />
          <Text style={styles.statusText}>
            {isConnected ? 'Realtime Connected' : 'Reconnecting...'}
          </Text>

          {/* Online count pill */}
          <TouchableOpacity
            style={styles.onlinePill}
            onPress={onOpenOnlineUsers}
            activeOpacity={0.7}
          >
            <Text style={styles.onlinePillText}>{onlineCount} online</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Right side: User Profile & Logout */}
      <View style={styles.userSection}>
        <TouchableOpacity
          style={styles.profileBox}
          onPress={onOpenOnlineUsers}
          activeOpacity={0.8}
        >
          <UserAvatar
            name={currentUser?.username}
            size={36}
            showOnline
            isOnline={isConnected}
            customColor={currentUser?.avatar_color}
          />
          <View style={styles.userInfo}>
            <Text style={styles.usernameText} numberOfLines={1}>
              {currentUser?.username || 'Guest'}
            </Text>
            <Text style={styles.userSubText}>You</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={onLogout}
          title="Sign Out"
          activeOpacity={0.7}
        >
          <Text style={styles.logoutText}>Exit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  channelInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  channelHash: {
    color: colors.primaryLight,
    fontSize: 20,
    fontWeight: '800',
    marginRight: 4,
  },
  channelTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
    marginRight: 8,
  },
  onlinePill: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  onlinePillText: {
    color: colors.emerald,
    fontSize: 11,
    fontWeight: '600',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    maxWidth: 140,
  },
  userInfo: {
    marginLeft: 8,
    justifyContent: 'center',
  },
  usernameText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    maxWidth: 70,
  },
  userSubText: {
    color: colors.primaryLight,
    fontSize: 10,
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  logoutText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '600',
  },
});
