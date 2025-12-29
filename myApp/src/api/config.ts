// API Configuration
// Change this to your backend URL
// For Android emulator: http://10.0.2.2:5000
// For iOS simulator: http://localhost:5000
// For physical device: use your computer's local IP address

import { Platform } from 'react-native';

// Get the appropriate base URL based on platform
const getBaseUrl = () => {
  if (__DEV__) {
    // Use your computer's IP address for physical devices
    // Both phone and computer must be on the same WiFi network
    return 'http://192.168.18.9:5000';
  }
  // Production URL - change this to your deployed backend
  return 'https://your-production-api.com';
};

export const API_BASE_URL = getBaseUrl();
export const API_URL = `${API_BASE_URL}/api`;

// WebSocket URL for real-time features
export const WS_URL = API_BASE_URL;

