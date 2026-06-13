export const ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',

  // Protected routes
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  TRIPS: '/trips',
  TRIP_DETAILS: (id: string) => `/trips/${id}`,
  CREATE_TRIP: '/trips/create',
  EDIT_TRIP: (id: string) => `/trips/${id}/edit`,

  // Settings
  SETTINGS: '/settings',
  ACCOUNT_SETTINGS: '/settings/account',
  PRIVACY_SETTINGS: '/settings/privacy',
  NOTIFICATION_SETTINGS: '/settings/notifications',
} as const

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },

  // User endpoints
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    CHANGE_PASSWORD: '/user/change-password',
  },

  // Trip endpoints
  TRIPS: {
    LIST: '/trips',
    CREATE: '/trips',
    GET: (id: string) => `/trips/${id}`,
    UPDATE: (id: string) => `/trips/${id}`,
    DELETE: (id: string) => `/trips/${id}`,
    POSTS: (tripId: string) => `/trips/${tripId}/posts`,
    CREATE_POST: (tripId: string) => `/trips/${tripId}/posts`,
  },
} as const
