'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export type LocationSharingLevel = 'off' | 'friends' | 'everyone';

export interface PrivacySettings {
  locationSharing: LocationSharingLevel;
  preciseLocation: boolean;
  blockedUsers: string[];
  hideFromUsers: string[];
  showPrivacyStatus: boolean;
}

export interface PrivacyContextType {
  settings: PrivacySettings;
  updateLocationSharing: (level: LocationSharingLevel) => void;
  togglePreciseLocation: () => void;
  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;
  hideFromUser: (userId: string) => void;
  showToUser: (userId: string) => void;
  togglePrivacyStatus: () => void;
  resetToDefaults: () => void;
  isUserBlocked: (userId: string) => boolean;
  isHiddenFromUser: (userId: string) => boolean;
}

const PRIVACY_STORAGE_KEY = 'soloadventurer_privacy_settings';

// Privacy-first defaults
const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  locationSharing: 'off',
  preciseLocation: false,
  blockedUsers: [],
  hideFromUsers: [],
  showPrivacyStatus: true,
};

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

export function usePrivacy(): PrivacyContextType {
  const context = useContext(PrivacyContext);
  if (context === undefined) {
    throw new Error('usePrivacy must be used within a PrivacyProvider');
  }
  return context;
}

interface PrivacyProviderProps {
  children: ReactNode;
}

export function PrivacyProvider({ children }: PrivacyProviderProps) {
  const [settings, setSettings] = useState<PrivacySettings>(DEFAULT_PRIVACY_SETTINGS);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PRIVACY_STORAGE_KEY);
      if (stored) {
        const parsedSettings = JSON.parse(stored) as Partial<PrivacySettings>;
        // Merge with defaults to ensure all properties exist
        setSettings(prev => ({
          ...prev,
          ...parsedSettings,
        }));
      }
    } catch (error) {
      console.warn('Failed to load privacy settings from localStorage:', error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (!isInitialized) return;

    try {
      localStorage.setItem(PRIVACY_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to save privacy settings to localStorage:', error);
    }
  }, [settings, isInitialized]);

  const updateLocationSharing = useCallback((level: LocationSharingLevel) => {
    setSettings(prev => ({
      ...prev,
      locationSharing: level,
      // Auto-disable precise location if sharing is turned off
      preciseLocation: level === 'off' ? false : prev.preciseLocation,
    }));
  }, []);

  const togglePreciseLocation = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      preciseLocation: !prev.preciseLocation,
      // Auto-enable at least friends sharing if precise location is enabled
      locationSharing: !prev.preciseLocation && prev.locationSharing === 'off' ? 'friends' : prev.locationSharing,
    }));
  }, []);

  const blockUser = useCallback((userId: string) => {
    setSettings(prev => ({
      ...prev,
      blockedUsers: [...new Set([...prev.blockedUsers, userId])],
      // Also hide from blocked user
      hideFromUsers: [...new Set([...prev.hideFromUsers, userId])],
    }));
  }, []);

  const unblockUser = useCallback((userId: string) => {
    setSettings(prev => ({
      ...prev,
      blockedUsers: prev.blockedUsers.filter(id => id !== userId),
    }));
  }, []);

  const hideFromUser = useCallback((userId: string) => {
    setSettings(prev => ({
      ...prev,
      hideFromUsers: [...new Set([...prev.hideFromUsers, userId])],
    }));
  }, []);

  const showToUser = useCallback((userId: string) => {
    setSettings(prev => ({
      ...prev,
      hideFromUsers: prev.hideFromUsers.filter(id => id !== userId),
    }));
  }, []);

  const togglePrivacyStatus = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      showPrivacyStatus: !prev.showPrivacyStatus,
    }));
  }, []);

  const resetToDefaults = useCallback(() => {
    setSettings(DEFAULT_PRIVACY_SETTINGS);
  }, []);

  const isUserBlocked = useCallback((userId: string) => {
    return settings.blockedUsers.includes(userId);
  }, [settings.blockedUsers]);

  const isHiddenFromUser = useCallback((userId: string) => {
    return settings.hideFromUsers.includes(userId);
  }, [settings.hideFromUsers]);

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
  };

  return (
    <PrivacyContext.Provider value={contextValue}>
      {children}
    </PrivacyContext.Provider>
  );
}

// Helper function to get location visibility level for a specific user
export function getLocationVisibility(
  settings: PrivacySettings,
  viewerUserId?: string,
  viewerIsFriend?: boolean
): 'visible' | 'approximate' | 'hidden' {
  if (!viewerUserId || settings.locationSharing === 'off') {
    return 'hidden';
  }

  // Check if viewer is blocked or hidden from
  if (settings.blockedUsers.includes(viewerUserId) || settings.hideFromUsers.includes(viewerUserId)) {
    return 'hidden';
  }

  // Check sharing level
  if (settings.locationSharing === 'everyone') {
    return settings.preciseLocation ? 'visible' : 'approximate';
  }

  if (settings.locationSharing === 'friends' && viewerIsFriend) {
    return settings.preciseLocation ? 'visible' : 'approximate';
  }

  return 'hidden';
}

// Helper function to format privacy level for display
export function formatPrivacyLevel(level: LocationSharingLevel): string {
  switch (level) {
    case 'off':
      return 'Private';
    case 'friends':
      return 'Friends Only';
    case 'everyone':
      return 'Public';
    default:
      return 'Private';
  }
}

// Helper function to get privacy icon
export function getPrivacyIcon(level: LocationSharingLevel): string {
  switch (level) {
    case 'off':
      return '🔒';
    case 'friends':
      return '👥';
    case 'everyone':
      return '🌍';
    default:
      return '🔒';
  }
}