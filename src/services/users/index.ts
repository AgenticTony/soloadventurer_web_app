// Export service instance and class
export { userService, UserService } from './userService'

// Export all types
export type {
  UserProfile,
  UpdateUserProfileInput,
  FeedItem,
  UserSearchOptions,
  UserConnection,
  UserStats,
} from './types'

// Export API error for consumers
export { ApiError } from '../base/ApiClient'
