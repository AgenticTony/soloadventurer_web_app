'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react'
import { createClient } from '@/lib/supabase/client'
import { blockUserInDb, unblockUserInDb, listBlockedUserIds } from '@/lib/moderation'
import { useToast } from '@/contexts/ToastContext'

export type LocationSharingLevel = 'off' | 'friends' | 'everyone'
export type SocialInteractionLevel = 'everyone' | 'connections' | 'none'

export interface PrivacySettings {
  locationSharing: LocationSharingLevel
  preciseLocation: boolean
  blockedUsers: string[]
  hideFromUsers: string[]
  showPrivacyStatus: boolean
  // New social privacy settings
  whoCanWave: SocialInteractionLevel
  whoCanMessage: SocialInteractionLevel
  readReceipts: boolean
  onlineStatus: boolean
  activityStatus: boolean
}

export interface PrivacyContextType {
  settings: PrivacySettings
  updateLocationSharing: (level: LocationSharingLevel) => void
  togglePreciseLocation: () => void
  blockUser: (userId: string, reason?: string) => Promise<void>
  unblockUser: (userId: string) => Promise<void>
  hideFromUser: (userId: string) => void
  showToUser: (userId: string) => void
  togglePrivacyStatus: () => void
  resetToDefaults: () => void
  isUserBlocked: (userId: string) => boolean
  isHiddenFromUser: (userId: string) => boolean
  getBlockedUsers: () => Promise<void>
  isBlockingEnabled: boolean
  isLoading: boolean
  // New social privacy methods
  updateWhoCanWave: (level: SocialInteractionLevel) => void
  updateWhoCanMessage: (level: SocialInteractionLevel) => void
  toggleReadReceipts: () => void
  toggleOnlineStatus: () => void
  toggleActivityStatus: () => void
  canUserWave: (userId: string, userIsConnection?: boolean) => boolean
  canUserMessage: (userId: string, userIsConnection?: boolean) => boolean
}

const PRIVACY_STORAGE_KEY = 'soloadventurer_privacy_settings'

// Privacy-first defaults
const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  locationSharing: 'off',
  preciseLocation: false,
  blockedUsers: [],
  hideFromUsers: [],
  showPrivacyStatus: true,
  // Social privacy defaults - privacy-first approach
  whoCanWave: 'connections',
  whoCanMessage: 'connections',
  readReceipts: false,
  onlineStatus: false,
  activityStatus: false,
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined)

export function usePrivacy(): PrivacyContextType {
  const context = useContext(PrivacyContext)
  if (context === undefined) {
    throw new Error('usePrivacy must be used within a PrivacyProvider')
  }
  return context
}

interface PrivacyProviderProps {
  children: ReactNode
}

export function PrivacyProvider({ children }: PrivacyProviderProps) {
  const [settings, setSettings] = useState<PrivacySettings>(DEFAULT_PRIVACY_SETTINGS)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isBlockingEnabled, setIsBlockingEnabled] = useState(true)
  const { showSuccess, showError } = useToast()

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PRIVACY_STORAGE_KEY)
      if (stored) {
        const parsedSettings = JSON.parse(stored) as Partial<PrivacySettings>
        // Merge with defaults to ensure all properties exist
        setSettings(prev => ({
          ...prev,
          ...parsedSettings,
        }))
      }
    } catch (error) {
      console.warn('Failed to load privacy settings from localStorage:', error)
    } finally {
      setIsInitialized(true)
    }
  }, [])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (!isInitialized) return

    try {
      localStorage.setItem(PRIVACY_STORAGE_KEY, JSON.stringify(settings))
    } catch (error) {
      console.warn('Failed to save privacy settings to localStorage:', error)
    }
  }, [settings, isInitialized])

  const updateLocationSharing = useCallback((level: LocationSharingLevel) => {
    setSettings(prev => ({
      ...prev,
      locationSharing: level,
      // Auto-disable precise location if sharing is turned off
      preciseLocation: level === 'off' ? false : prev.preciseLocation,
    }))
  }, [])

  const togglePreciseLocation = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      preciseLocation: !prev.preciseLocation,
      // Auto-enable at least friends sharing if precise location is enabled
      locationSharing:
        !prev.preciseLocation && prev.locationSharing === 'off' ? 'friends' : prev.locationSharing,
    }))
  }, [])

  const blockUser = useCallback(
    async (userId: string, reason?: string) => {
      if (!userId || settings.blockedUsers.includes(userId)) {
        return
      }

      setIsLoading(true)
      try {
        // Optimistic update - add to blocked list immediately
        setSettings(prev => ({
          ...prev,
          blockedUsers: [...new Set([...prev.blockedUsers, userId])],
          // Also hide from blocked user
          hideFromUsers: [...new Set([...prev.hideFromUsers, userId])],
        }))

        // Persist to Supabase
        const supabase = createClient()
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (session?.user) {
          // Single write path (src/lib/moderation.ts): blocks row + optional
          // reason routed to reports. Story 0.6: this used to target
          // `blocked_users`, a table that does not exist.
          await blockUserInDb(supabase, session.user.id, userId, reason)
        }

        showSuccess('User Blocked', 'The user has been blocked successfully.')
      } catch (error) {
        console.error('Failed to block user:', error)

        // Revert optimistic update on error
        setSettings(prev => ({
          ...prev,
          blockedUsers: prev.blockedUsers.filter(id => id !== userId),
          hideFromUsers: prev.hideFromUsers.filter(id => id !== userId),
        }))

        const message = error instanceof Error ? error.message : 'Please try again later.'
        showError('Failed to Block User', message)
      } finally {
        setIsLoading(false)
      }
    },
    [settings.blockedUsers, showSuccess, showError]
  )

  const unblockUser = useCallback(
    async (userId: string) => {
      if (!userId || !settings.blockedUsers.includes(userId)) {
        return
      }

      setIsLoading(true)
      try {
        // Optimistic update - remove from blocked list immediately
        setSettings(prev => ({
          ...prev,
          blockedUsers: prev.blockedUsers.filter(id => id !== userId),
        }))

        // Persist to Supabase
        const supabase = createClient()
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (session?.user) {
          await unblockUserInDb(supabase, session.user.id, userId)
        }

        showSuccess('User Unblocked', 'The user has been unblocked successfully.')
      } catch (error) {
        console.error('Failed to unblock user:', error)

        // Revert optimistic update on error
        setSettings(prev => ({
          ...prev,
          blockedUsers: [...new Set([...prev.blockedUsers, userId])],
        }))

        const message = error instanceof Error ? error.message : 'Please try again later.'
        showError('Failed to Unblock User', message)
      } finally {
        setIsLoading(false)
      }
    },
    [settings.blockedUsers, showSuccess, showError]
  )

  const hideFromUser = useCallback((userId: string) => {
    setSettings(prev => ({
      ...prev,
      hideFromUsers: [...new Set([...prev.hideFromUsers, userId])],
    }))
  }, [])

  const showToUser = useCallback((userId: string) => {
    setSettings(prev => ({
      ...prev,
      hideFromUsers: prev.hideFromUsers.filter(id => id !== userId),
    }))
  }, [])

  const togglePrivacyStatus = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      showPrivacyStatus: !prev.showPrivacyStatus,
    }))
  }, [])

  const resetToDefaults = useCallback(() => {
    setSettings(DEFAULT_PRIVACY_SETTINGS)
  }, [])

  const isUserBlocked = useCallback(
    (userId: string) => {
      return settings.blockedUsers.includes(userId)
    },
    [settings.blockedUsers]
  )

  const isHiddenFromUser = useCallback(
    (userId: string) => {
      return settings.hideFromUsers.includes(userId)
    },
    [settings.hideFromUsers]
  )

  /**
   * Sync blocked users with API and update local state
   */
  const getBlockedUsers = useCallback(async () => {
    if (!isBlockingEnabled) return

    try {
      setIsLoading(true)
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session?.user) return

      const serverBlockedUserIds = await listBlockedUserIds(supabase, session.user.id)
      setSettings(prev => ({
        ...prev,
        blockedUsers: serverBlockedUserIds,
      }))
    } catch (error) {
      console.error('Failed to sync blocked users:', error)
      // Don't show error to user for background sync
      setIsBlockingEnabled(false)
    } finally {
      setIsLoading(false)
    }
  }, [isBlockingEnabled])

  // Sync blocked users on mount if blocking is enabled
  useEffect(() => {
    if (isInitialized && isBlockingEnabled) {
      getBlockedUsers()
    }
  }, [isInitialized, isBlockingEnabled, getBlockedUsers])

  // New social privacy methods following official React patterns
  const updateWhoCanWave = useCallback((level: SocialInteractionLevel) => {
    setSettings(prev => ({
      ...prev,
      whoCanWave: level,
    }))
  }, [])

  const updateWhoCanMessage = useCallback((level: SocialInteractionLevel) => {
    setSettings(prev => ({
      ...prev,
      whoCanMessage: level,
    }))
  }, [])

  const toggleReadReceipts = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      readReceipts: !prev.readReceipts,
    }))
  }, [])

  const toggleOnlineStatus = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      onlineStatus: !prev.onlineStatus,
    }))
  }, [])

  const toggleActivityStatus = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      activityStatus: !prev.activityStatus,
    }))
  }, [])

  const canUserWave = useCallback(
    (userId: string, userIsConnection?: boolean): boolean => {
      // Blocked users cannot wave
      if (settings.blockedUsers.includes(userId)) return false

      switch (settings.whoCanWave) {
        case 'everyone':
          return true
        case 'connections':
          return userIsConnection === true
        case 'none':
          return false
        default:
          return false
      }
    },
    [settings.blockedUsers, settings.whoCanWave]
  )

  const canUserMessage = useCallback(
    (userId: string, userIsConnection?: boolean): boolean => {
      // Blocked users cannot message
      if (settings.blockedUsers.includes(userId)) return false

      switch (settings.whoCanMessage) {
        case 'everyone':
          return true
        case 'connections':
          return userIsConnection === true
        case 'none':
          return false
        default:
          return false
      }
    },
    [settings.blockedUsers, settings.whoCanMessage]
  )

  const contextValue: PrivacyContextType = {
    settings,
    updateLocationSharing,
    togglePreciseLocation,
    blockUser,
    unblockUser,
    hideFromUser,
    showToUser,
    togglePrivacyStatus,
    resetToDefaults,
    isUserBlocked,
    isHiddenFromUser,
    getBlockedUsers,
    isBlockingEnabled,
    isLoading,
    // New social privacy methods
    updateWhoCanWave,
    updateWhoCanMessage,
    toggleReadReceipts,
    toggleOnlineStatus,
    toggleActivityStatus,
    canUserWave,
    canUserMessage,
  }

  return <PrivacyContext.Provider value={contextValue}>{children}</PrivacyContext.Provider>
}

// Helper function to get location visibility level for a specific user
export function getLocationVisibility(
  settings: PrivacySettings,
  viewerUserId?: string,
  viewerIsFriend?: boolean
): 'visible' | 'approximate' | 'hidden' {
  if (!viewerUserId || settings.locationSharing === 'off') {
    return 'hidden'
  }

  // CRITICAL: Check if viewer is blocked - blocked users should never see content
  if (
    settings.blockedUsers.includes(viewerUserId) ||
    settings.hideFromUsers.includes(viewerUserId)
  ) {
    return 'hidden'
  }

  // Check sharing level
  if (settings.locationSharing === 'everyone') {
    return settings.preciseLocation ? 'visible' : 'approximate'
  }

  if (settings.locationSharing === 'friends' && viewerIsFriend) {
    return settings.preciseLocation ? 'visible' : 'approximate'
  }

  return 'hidden'
}

/**
 * Helper function to determine if a user should be visible in any context
 * This is the primary blocking enforcement function
 */
export function shouldShowUser(settings: PrivacySettings, userId: string): boolean {
  return !settings.blockedUsers.includes(userId)
}

/**
 * Helper function to determine if interaction is allowed with a user
 * Blocked users cannot interact in any way
 */
export function canInteractWithUser(settings: PrivacySettings, userId: string): boolean {
  return !settings.blockedUsers.includes(userId)
}

// Helper function to format privacy level for display
export function formatPrivacyLevel(level: LocationSharingLevel): string {
  switch (level) {
    case 'off':
      return 'Private'
    case 'friends':
      return 'Friends Only'
    case 'everyone':
      return 'Public'
    default:
      return 'Private'
  }
}

// Helper function to get privacy icon
export function getPrivacyIcon(level: LocationSharingLevel): string {
  switch (level) {
    case 'off':
      return '🔒'
    case 'friends':
      return '👥'
    case 'everyone':
      return '🌍'
    default:
      return '🔒'
  }
}

/**
 * Helper function to check if a user can wave to another user
 * Following official patterns for privacy enforcement
 */
export function canWaveToUser(
  settings: PrivacySettings,
  targetUserId: string,
  userIsConnection?: boolean
): boolean {
  // Blocked users cannot wave
  if (settings.blockedUsers.includes(targetUserId)) return false

  switch (settings.whoCanWave) {
    case 'everyone':
      return true
    case 'connections':
      return userIsConnection === true
    case 'none':
      return false
    default:
      return false
  }
}

/**
 * Helper function to check if a user can message another user
 * Following official patterns for privacy enforcement
 */
export function canMessageUser(
  settings: PrivacySettings,
  targetUserId: string,
  userIsConnection?: boolean
): boolean {
  // Blocked users cannot message
  if (settings.blockedUsers.includes(targetUserId)) return false

  switch (settings.whoCanMessage) {
    case 'everyone':
      return true
    case 'connections':
      return userIsConnection === true
    case 'none':
      return false
    default:
      return false
  }
}

/**
 * Helper function to format social interaction level for display
 */
export function formatSocialInteractionLevel(level: SocialInteractionLevel): string {
  switch (level) {
    case 'everyone':
      return 'Everyone'
    case 'connections':
      return 'Connections Only'
    case 'none':
      return 'No One'
    default:
      return 'Connections Only'
  }
}

/**
 * Helper function to get social interaction icon
 */
export function getSocialInteractionIcon(level: SocialInteractionLevel): string {
  switch (level) {
    case 'everyone':
      return '🌍'
    case 'connections':
      return '👥'
    case 'none':
      return '🚫'
    default:
      return '👥'
  }
}
