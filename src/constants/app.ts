export const APP_CONFIG = {
  name: 'SoloAdventurer',
  description: 'Your solo travel companion',
  version: '1.0.0',

  // API Configuration
  apiUrl: process.env.NEXT_PUBLIC_API_URL || '/api',

  // Authentication
  auth: {
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    tokenRefreshThreshold: 5 * 60 * 1000, // 5 minutes
  },

  // UI Configuration
  ui: {
    theme: {
      primary: '#3B82F6',
      secondary: '#10B981',
      accent: '#F59E0B',
    },
    pagination: {
      defaultPageSize: 10,
      maxPageSize: 100,
    },
  },

  // Feature Flags
  features: {
    enableSocialSharing: true,
    enableOfflineMode: false,
    enablePushNotifications: true,
  },
} as const

export type AppConfig = typeof APP_CONFIG
