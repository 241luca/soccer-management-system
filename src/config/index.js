// Configuration for the application
export const config = {
  // API Configuration
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  USE_API: import.meta.env.VITE_USE_API === 'true',
  
  // WebSocket Configuration
  USE_WEBSOCKET: import.meta.env.VITE_USE_WEBSOCKET === 'true',
  WS_URL: import.meta.env.VITE_WS_URL || 'http://localhost:3000',
  
  // App Configuration
  APP_NAME: 'Soccer Management System',
  APP_VERSION: '2.1.0',
  
  // Feature Flags
  FEATURES: {
    NOTIFICATIONS: true,
    AI_ASSISTANT: true,
    EXPORT: true,
    ADMIN_AREA: true,
    WEBSOCKET_UPDATES: import.meta.env.VITE_USE_WEBSOCKET === 'true'
  },
  
  // Development
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
  
  // Sentry (optional)
  SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN || '',
  
  // File Upload
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
};
