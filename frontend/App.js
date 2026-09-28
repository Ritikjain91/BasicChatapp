import React, { useState } from 'react';
import { StyleSheet, View, StatusBar, Platform } from 'react-native';
import { colors } from './src/theme/colors';
import { LoginScreen } from './src/screens/LoginScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import { DEFAULT_SERVER_URL } from './src/config/constants';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [serverUrl, setServerUrl] = useState(DEFAULT_SERVER_URL);

  const handleLoginSuccess = ({ user, serverUrl: chosenUrl }) => {
    setCurrentUser(user);
    if (chosenUrl) {
      setServerUrl(chosenUrl);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.surface}
        translucent={false}
      />
      <View style={styles.appWrapper}>
        {!currentUser ? (
          <LoginScreen onLoginSuccess={handleLoginSuccess} />
        ) : (
          <ChatScreen
            currentUser={currentUser}
            serverUrl={serverUrl}
            onLogout={handleLogout}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    ...Platform.select({
      web: {
        height: '100dvh',
        maxHeight: '100dvh',
        width: '100%',
        overflow: 'hidden',
      },
    }),
  },
  appWrapper: {
    flex: 1,
    backgroundColor: colors.background,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 1000 : '100%',
    alignSelf: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 0 40px rgba(0, 0, 0, 0.5)',
      },
    }),
  },
});
