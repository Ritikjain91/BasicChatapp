import { Platform } from 'react-native';

// Default development backend URLs
export const CURRENT_LAN_IP = '10.231.65.181';

export const SERVER_PRESETS = [
  { id: 'wifi', label: 'Wi-Fi / Phone', url: `http://${CURRENT_LAN_IP}:5000` },
  { id: 'emulator', label: 'Android Emulator', url: 'http://10.0.2.2:5000' },
  { id: 'localhost', label: 'Localhost', url: 'http://localhost:5000' },
];

const getDefaultBackendUrl = () => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location) {
      const hostname = window.location.hostname || 'localhost';
      return `http://${hostname}:5000`;
    }
    return 'http://localhost:5000';
  } else if (Platform.OS === 'android') {
    // Default to the current Wi-Fi LAN IP so both physical devices and emulators on LAN can reach the backend
    return `http://${CURRENT_LAN_IP}:5000`;
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
