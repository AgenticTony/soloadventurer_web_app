// User profile interface (extends auth user)
export interface UserProfile {
  id: string
  username: string
  email: string
  name: string
  bio: string
  avatarUrl: string | null
  emailVerified: boolean
  createdAt: string
  updatedAt: string

  // Social features (for future use)
  followersCount?: number
  followingCount?: number
  tripsCount?: number
  isFollowing?: boolean
  isPrivate?: boolean
}

// User profile update input
export interface UpdateUserProfileInput {
  name?: string
  bio?: string
  username?: string
  isPrivate?: boolean
}

// Feed item interface
export interface FeedItem {
  id: string
  title: string
  excerpt?: string
  content?: string
  createdAt: string
  updatedAt?: string
  authorId: string
  authorName: string
  authorAvatar?: string
  type: 'trip' | 'post' | 'checkin' | 'photo'

  // Media and attachments
  imageUrls?: string[]
  location?: {
    name: string
    coordinates?: {
      lat: number
      lng: number
    }
  }

  // Engagement
  likesCount?: number
  commentsCount?: number
  sharesCount?: number
  isLiked?: boolean

  // Trip-specific fields
  tripId?: string
  startDate?: string
  endDate?: string
}

// User search options
export interface UserSearchOptions {
  limit?: number
  offset?: number
  filters?: {
    location?: string
    interests?: string[]
    verified?: boolean
  }
}

// User connection/relationship
export interface UserConnection {
  id: string
  followerId: string
  followingId: string
  createdAt: string
  status: 'active' | 'blocked'
}

// User stats
export interface UserStats {
  tripsCount: number
  followersCount: number
  followingCount: number
  postsCount: number
  countriesVisited: number
  citiesVisited: number
}
