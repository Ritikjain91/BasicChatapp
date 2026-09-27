import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getAvatarColor, colors } from '../theme/colors';
import { getInitials } from '../utils/helpers';

export const UserAvatar = ({ name, size = 40, showOnline = false, isOnline = false, customColor }) => {
  const bgColor = customColor || getAvatarColor(name);
  const initials = getInitials(name);
  const fontSize = Math.max(12, Math.floor(size * 0.4));
  const dotSize = Math.max(8, Math.floor(size * 0.28));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View
        style={[
          styles.avatar,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: bgColor,
          },
        ]}
      >
        <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
      </View>
      {showOnline && (
        <View
          style={[
            styles.onlineBadge,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              backgroundColor: isOnline ? colors.online : colors.offline,
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: colors.background,
  },
});
