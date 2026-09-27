import { Platform } from 'react-native';

// Default development backend URLs
const getDefaultBackendUrl = () => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location) {
      const hostname = window.location.hostname || 'localhost';
      return `http://${hostname}:5000`;
    }
    return 'http://localhost:5000';
  } else if (Platform.OS === 'android') {
    // Android emulator loopback alias
    return 'http://10.0.2.2:5000';
  } else {
    // iOS simulator
    return 'http://localhost:5000';
  }
};

export const DEFAULT_SERVER_URL = getDefaultBackendUrl();

export const STORAGE_KEYS = {
  USERNAME: '@chatapp_username',
  SERVER_URL: '@chatapp_server_url',
};
