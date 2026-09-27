import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { colors } from '../theme/colors';
import { UserAvatar } from './UserAvatar';

export const OnlineUsersModal = ({
  visible,
  onClose,
  users = [],
  currentUsername,
}) => {
  const renderItem = ({ item }) => {
    const isMe = item.username === currentUsername;
    const isOnline = item.is_online === 1 || item.is_online === true;

    return (
      <View style={styles.userRow}>
        <UserAvatar
          name={item.username}
          size={42}
          showOnline
          isOnline={isOnline}
          customColor={item.avatar_color}
        />
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.username}>{item.username}</Text>
            {isMe && <Text style={styles.youBadge}>YOU</Text>}
          </View>
          <Text style={[styles.statusText, { color: isOnline ? colors.online : colors.textMuted }]}>
            {isOnline ? 'Active now' : 'Offline'}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={styles.modalContent}
          onStartShouldSetResponder={() => true}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Channel Members</Text>
              <Text style={styles.modalSubtitle}>
                {users.filter((u) => u.is_online).length} online now
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* List */}
          <FlatList
            data={users}
            keyExtractor={(item) => item.id || item.username}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No users found.</Text>
            }
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: '75%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: 12,
    color: colors.online,
    marginTop: 2,
    fontWeight: '500',
  },
  closeButton: {
    padding: 6,
  },
  closeText: {
    color: colors.textSecondary,
    fontSize: 18,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  username: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  youBadge: {
    backgroundColor: colors.primaryGlow,
    color: colors.primaryLight,
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  statusText: {
    fontSize: 12,
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  emptyText: {
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: 20,
  },
});
