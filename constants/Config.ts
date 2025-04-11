// API Configuration
export const API_URL =
    process.env.REACT_APP_API_URL || 'http://192.168.1.172:3000/api';

// Other configuration constants can be added here
export const CONFIG = {
    API_URL,
    // Add other configuration values as needed
} as const;
