import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { colors } from '../theme/colors';
import { UserAvatar } from '../components/UserAvatar';
import { DEFAULT_SERVER_URL, SERVER_PRESETS } from '../config/constants';
import { ChatApi } from '../api/chatApi';

const SUGGESTED_USERS = [
  { name: 'Alex', role: 'Product Lead' },
  { name: 'Sophia', role: 'Designer' },
  { name: 'Marcus', role: 'Engineer' },
  { name: 'Ritik', role: 'Developer' },
];

export const LoginScreen = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [serverUrl, setServerUrl] = useState(DEFAULT_SERVER_URL);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (nameToUse) => {
    const finalName = (nameToUse || username).trim();

    if (!finalName) {
      setError('Please enter a username to proceed.');
      return;
    }

    if (finalName.length < 2) {
      setError('Username must be at least 2 characters.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const cleanUrl = serverUrl.replace(/\/+$/, '');
      const userData = await ChatApi.login(cleanUrl, finalName);
      onLoginSuccess({
        user: userData,
        serverUrl: cleanUrl,
      });
    } catch (err) {
      console.error('Login error:', err);
      setShowSettings(true);
      setError(
        `Unable to reach backend at ${serverUrl}. If you are on an Android phone, make sure your phone and PC share the same Wi-Fi and select the Wi-Fi IP below.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : (StatusBar.currentHeight ?? 0)}
      style={styles.keyboardContainer}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          {/* Brand Header */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoIcon}>⚡</Text>
            </View>
            <Text style={styles.appTitle}>PulseChat</Text>
            <Text style={styles.appSubtitle}>
              Real-Time Chat with React Native & Socket.io
            </Text>
          </View>

          {/* Avatar Preview */}
          <View style={styles.avatarPreviewContainer}>
            <UserAvatar name={username || 'Guest'} size={68} />
            <Text style={styles.avatarLabel}>
              {username.trim() ? username : 'Your Display Avatar'}
            </Text>
          </View>

          {/* Error Message */}
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          ) : null}

          {/* Username Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Enter your Username</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Ritik, Alex, Sarah"
              placeholderTextColor={colors.textMuted}
              value={username}
              onChangeText={(txt) => {
                setUsername(txt);
                if (error) setError('');
              }}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={25}
              onSubmitEditing={() => handleLogin()}
              returnKeyType="done"
            />
          </View>

          {/* Quick Select demo profiles */}
          <View style={styles.quickSelectSection}>
            <Text style={styles.quickSelectLabel}>Or pick a test identity:</Text>
            <View style={styles.quickChipsRow}>
              {SUGGESTED_USERS.map((item) => (
                <TouchableOpacity
                  key={item.name}
                  style={[
                    styles.chip,
                    username === item.name && styles.chipActive,
                  ]}
                  onPress={() => {
                    setUsername(item.name);
                    setError('');
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.chipText,
                      username === item.name && styles.chipTextActive,
                    ]}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, (!username.trim() || loading) && styles.loginButtonDisabled]}
            onPress={() => handleLogin()}
            disabled={!username.trim() || loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.loginButtonText}>Join Chat Room ➜</Text>
            )}
          </TouchableOpacity>

          {/* Server Config Accordion */}
          <TouchableOpacity
            style={styles.toggleSettings}
            onPress={() => setShowSettings((prev) => !prev)}
            activeOpacity={0.7}
          >
            <Text style={styles.toggleSettingsText}>
              {showSettings ? '▾ Hide Server Settings' : '▸ Configure Server URL'}
            </Text>
          </TouchableOpacity>

          {showSettings && (
            <View style={styles.settingsBox}>
              <Text style={styles.settingsLabel}>Backend Endpoint URL:</Text>
              <TextInput
                style={styles.settingsInput}
                value={serverUrl}
                onChangeText={setServerUrl}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="https://basicchatapp-smik.onrender.com"
                placeholderTextColor={colors.textMuted}
              />
              <View style={styles.presetRow}>
                {SERVER_PRESETS.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={[
                      styles.presetChip,
                      serverUrl === p.url && styles.presetChipActive,
                    ]}
                    onPress={() => {
                      setServerUrl(p.url);
                      setError('');
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.presetChipText,
                        serverUrl === p.url && styles.presetChipTextActive,
                      ]}
                    >
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.settingsHint}>
                Connected by default to live cloud on Render. Tap chips above to switch servers anytime.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoBadge: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  logoIcon: {
    fontSize: 26,
  },
  appTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  appSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  avatarPreviewContainer: {
    alignItems: 'center',
    marginVertical: 14,
  },
  avatarLabel: {
    marginTop: 8,
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.textPrimary,
    fontSize: 15,
  },
  quickSelectSection: {
    marginBottom: 20,
  },
  quickSelectLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  quickChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primaryGlow,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  chipTextActive: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
  loginButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  loginButtonDisabled: {
    opacity: 0.5,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  toggleSettings: {
    alignItems: 'center',
    marginTop: 18,
    padding: 4,
  },
  toggleSettingsText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  settingsBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingsLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 4,
    fontWeight: '600',
  },
  settingsInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: colors.textPrimary,
    fontSize: 12,
  },
  settingsHint: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 6,
    lineHeight: 14,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
    marginBottom: 4,
  },
  presetChip: {
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  presetChipActive: {
    backgroundColor: colors.primaryGlow,
    borderColor: colors.primary,
  },
  presetChipText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  presetChipTextActive: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
});
