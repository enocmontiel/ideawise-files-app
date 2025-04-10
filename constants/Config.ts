// API Configuration
export const API_URL =
    process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Other configuration constants can be added here
export const CONFIG = {
    API_URL,
    // Add other configuration values as needed
} as const;
