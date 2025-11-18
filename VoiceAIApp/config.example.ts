// ============================================
// Voice AI App - Configuration Template
// ============================================

// API Configuration
// Copy this file to config.ts and fill in your actual values
export const API_CONFIG = {
  // Backend API Base URL
  // Development: http://localhost:3000/api/v1
  // Production: https://your-api-domain.com/api/v1
  BASE_URL: 'http://localhost:3000/api/v1',
  
  // API Authentication Token
  // Get this from your backend after creating a user
  // Example: Run `rails console` then `User.first.api_token`
  API_TOKEN: 'YOUR_API_TOKEN_HERE',
  
  // Request timeout in milliseconds
  TIMEOUT: 30000,
  
  // Polling configuration for async operations
  POLLING: {
    INTERVAL: 2000,      // Check every 2 seconds
    MAX_ATTEMPTS: 60,    // Max 60 attempts = 2 minutes
  },
};

// D-ID Configuration (if using direct API)
// Get your API key from: https://www.d-id.com/
export const D_ID_CONFIG = {
  API_KEY: 'YOUR_D_ID_API_KEY_HERE',
  BASE_URL: 'https://api.d-id.com',
};

// AssemblyAI Configuration (if using direct API)
// Get your API key from: https://www.assemblyai.com/
export const ASSEMBLY_AI_CONFIG = {
  API_KEY: 'YOUR_ASSEMBLY_AI_API_KEY_HERE',
  BASE_URL: 'https://api.assemblyai.com/v2',
};

// Feature Flags
export const FEATURES = {
  // Toggle between backend and local mode
  USE_BACKEND: true,
  
  // Enable debug logging
  DEBUG_MODE: __DEV__,
  
  // Enable analytics
  ENABLE_ANALYTICS: false,
};

// App Constants
export const APP_CONSTANTS = {
  // Avatar texts refresh interval
  TEXTS_CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  
  // Max recording duration in seconds
  MAX_RECORDING_DURATION: 60,
  
  // Supported languages
  SUPPORTED_LANGUAGES: ['tr-TR', 'en-US'] as const,
};

