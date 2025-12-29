// API Configuration
// For development: uses local IP
// For production: uses deployed backend URL

import { Platform } from 'react-native';

// ========================================
// 🔧 CHANGE THIS AFTER DEPLOYING BACKEND
// ========================================
const PRODUCTION_API_URL = 'https://your-render-url.onrender.com';
// Example: 'https://social-media-api-abc123.onrender.com'

// Development URL (your local computer IP)
const DEV_API_URL = 'http://192.168.18.9:5000';

// Get the appropriate base URL
const getBaseUrl = () => {
  if (__DEV__) {
    // Development mode - use local server
    if (Platform.OS === 'android') {
      // Android emulator uses 10.0.2.2 to access host machine
      // For physical device, use your computer's IP
      return DEV_API_URL;
    }
    // iOS simulator can use localhost, but IP works for both
    return DEV_API_URL;
  }
  
  // Production mode - use deployed backend
  return PRODUCTION_API_URL;
};

export const API_BASE_URL = getBaseUrl();
export const API_URL = `${API_BASE_URL}/api`;

// WebSocket URL for real-time features
export const WS_URL = API_BASE_URL;
