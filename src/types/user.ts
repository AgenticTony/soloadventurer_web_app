import type { User } from './auth'
import type { LocationSharingLevel } from '@/contexts/PrivacyContext'

// Location data interface
export interface UserLocation {
  city: string
  country: string
  coordinates?: {
    lat: number
    lng: number
  }
}

// Extended user profile interface for display components
export interface UserProfile extends User {
  // Stats for profile display
  stats?: UserStats
  // Online status
  isOnline?: boolean
  lastSeen?: string
  // Social/travel info
  followersCount?: number
  followingCount?: number
  tripsCount?: number
  // Verification status
  isVerified?: boolean
  // Location information (detailed)
  locationData?: UserLocation
  // Interests/tags
  interests?: string[]
  // Privacy settings (for display purposes)
  locationSharing?: LocationSharingLevel
  preciseLocation?: boolean
}

export interface UserStats {
  tripsCount: number
  followersCount: number
  followingCount: number
  placesVisited: number
}

// Component size variants
export type UserCardSize = 'small' | 'medium' | 'large'

// Avatar size mapping
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

// Online status types
export type UserStatus = 'online' | 'offline' | 'away'

// Props for user components
export interface UserCardProps {
  user: UserProfile
  size?: UserCardSize
  showStats?: boolean
  showActions?: boolean
  isLoading?: boolean
  className?: string
}

export interface UserAvatarProps {
  user: Pick<UserProfile, 'name' | 'avatar'>
  size?: AvatarSize
  status?: UserStatus
  showStatus?: boolean
  className?: string
  alt?: string
}

export interface UserStatsProps {
  stats: UserStats
  size?: UserCardSize
  isLoading?: boolean
  className?: string
}

// Skeleton loading props
export interface UserCardSkeletonProps {
  size?: UserCardSize
  showStats?: boolean
  showActions?: boolean
  className?: string
}
