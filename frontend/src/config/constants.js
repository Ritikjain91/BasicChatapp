import { Platform } from 'react-native';

// Live Production Backend URL deployed on Render
export const PRODUCTION_SERVER_URL = 'https://basicchatapp-smik.onrender.com';
export const CURRENT_LAN_IP = '10.231.65.181';

export const SERVER_PRESETS = [
  { id: 'cloud', label: '☁️ Live Cloud', url: PRODUCTION_SERVER_URL },
  { id: 'wifi', label: 'Wi-Fi / LAN', url: `http://${CURRENT_LAN_IP}:5000` },
  { id: 'emulator', label: 'Emulator', url: 'http://10.0.2.2:5000' },
  { id: 'localhost', label: 'Localhost', url: 'http://localhost:5000' },
];

export const DEFAULT_SERVER_URL = PRODUCTION_SERVER_URL;

export const STORAGE_KEYS = {
  USERNAME: '@chatapp_username',
  SERVER_URL: '@chatapp_server_url',
};
