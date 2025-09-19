// Export all services and their types
export * from './auth';
export * from './trips';
export { userService, UserService } from './users';
export type { UpdateUserProfileInput, FeedItem, UserSearchOptions, UserConnection, UserStats } from './users';
export * from './base/ApiClient';

// Re-export service instances for easy access
export { authService } from './auth';
export { tripService } from './trips';
export { apiClient } from './base/ApiClient';