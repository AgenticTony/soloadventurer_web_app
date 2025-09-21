// useWaves Hook - React Integration for Wave System
// Sprint 3: Real-time Wave Management

import { useEffect, useCallback, useMemo } from 'react';
// TODO: Replace with actual auth context when available
// import { useAuthContext } from '@/contexts/AuthContext';
const useAuthContext = () => ({ user: { id: 'current-user' } });
import {
  useWaveStore,
  useSentWaves,
  useReceivedWaves,
  useMutualWaves,
  useWaveStats as useWaveStatsFromStore,
  useWaveLoading,
  useWaveConnection,
  useWaveActions
} from '@/stores/waveStore';
import {
  Wave,
  WaveWithUsers,
  SendWaveInput,
  RespondToWaveInput,
  WaveError,
  WaveValidation,
  isWaveExpired,
  canRespondToWave,
  MAX_WAVES_PER_DAY
} from '@/types/wave';

export interface UseWavesReturn {
  // Wave collections
  sentWaves: WaveWithUsers[];
  receivedWaves: WaveWithUsers[];
  mutualWaves: WaveWithUsers[];

  // Computed values
  unreadCount: number;
  pendingWaves: WaveWithUsers[];
  expiredWaves: WaveWithUsers[];

  // Statistics
  stats: {
    sentCount: number;
    receivedCount: number;
    mutualCount: number;
    pendingCount: number;
  };

  // Loading states
  isLoading: boolean;
  isSending: boolean;
  isResponding: boolean;

  // Connection state
  isConnected: boolean;
  lastSync: string | null;
  error: string | null;

  // Actions
  sendWave: (input: SendWaveInput) => Promise<void>;
  respondToWave: (waveId: string, response: 'accepted' | 'declined') => Promise<void>;
  markAsRead: (waveId: string) => void;
  refresh: () => Promise<void>;
  canSendWaveTo: (userId: string) => Promise<{ canSend: boolean; reason?: WaveError }>;

  // Validation
  validateSendWave: (input: SendWaveInput) => WaveValidation;

  // Utilities
  getWaveById: (waveId: string) => WaveWithUsers | undefined;
  getWavesByUser: (userId: string) => WaveWithUsers[];
  isWaveFromUser: (wave: Wave, userId: string) => boolean;
}

/**
 * Main hook for wave management
 */
export const useWaves = (): UseWavesReturn => {
  const { user } = useAuthContext();
  const sentWaves = useSentWaves();
  const receivedWaves = useReceivedWaves();
  const mutualWaves = useMutualWaves();
  const stats = useWaveStatsFromStore();
  const { isLoading, isSending, isResponding } = useWaveLoading();
  const { isConnected, lastSync, error } = useWaveConnection();
  const actions = useWaveActions();

  // Initialize wave system when user is authenticated
  useEffect(() => {
    if (user?.id) {
      actions.loadWaves();
      actions.subscribeToWaves(user.id);

      return () => {
        actions.unsubscribeFromWaves();
      };
    }
  }, [user?.id, actions]);

  // Computed values
  const unreadCount = useMemo(() => {
    return receivedWaves.filter(wave => !wave.isRead && wave.status === 'pending').length;
  }, [receivedWaves]);

  const pendingWaves = useMemo(() => {
    return receivedWaves.filter(wave => wave.status === 'pending' && !isWaveExpired(wave));
  }, [receivedWaves]);

  const expiredWaves = useMemo(() => {
    return [...sentWaves, ...receivedWaves].filter(isWaveExpired);
  }, [sentWaves, receivedWaves]);

  // Actions with error handling
  const sendWave = useCallback(async (input: SendWaveInput) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      await actions.sendWave(input);
    } catch (error) {
      throw error;
    }
  }, [user?.id, actions]);

  const respondToWave = useCallback(async (waveId: string, response: 'accepted' | 'declined') => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      await actions.respondToWave({ waveId, response });
    } catch (error) {
      throw error;
    }
  }, [user?.id, actions]);

  const refresh = useCallback(async () => {
    if (user?.id) {
      await actions.loadWaves();
    }
  }, [user?.id, actions]);

  const canSendWaveTo = useCallback(async (userId: string): Promise<{
    canSend: boolean;
    reason?: WaveError;
  }> => {
    if (!user?.id) {
      return { canSend: false, reason: 'UNAUTHORIZED' };
    }

    if (user.id === userId) {
      return { canSend: false, reason: 'SELF_WAVE' };
    }

    // Check for existing pending wave
    const existingWave = sentWaves.find(wave =>
      wave.toUserId === userId &&
      wave.status === 'pending' &&
      !isWaveExpired(wave)
    );

    if (existingWave) {
      return { canSend: false, reason: 'ALREADY_SENT' };
    }

    // Check daily limit (client-side check)
    const today = new Date().toDateString();
    const todayWaves = sentWaves.filter(wave =>
      new Date(wave.createdAt).toDateString() === today
    );

    if (todayWaves.length >= MAX_WAVES_PER_DAY) {
      return { canSend: false, reason: 'RATE_LIMITED' };
    }

    return { canSend: true };
  }, [user?.id, sentWaves]);

  const validateSendWave = useCallback((input: SendWaveInput): WaveValidation => {
    const errors: string[] = [];

    if (!input.toUserId?.trim()) {
      errors.push('Recipient is required');
    }

    if (!user?.id) {
      errors.push('User not authenticated');
    }

    if (input.message && input.message.length > 200) {
      errors.push('Message must be 200 characters or less');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [user?.id]);

  // Utility functions
  const getWaveById = useCallback((waveId: string): WaveWithUsers | undefined => {
    return [...sentWaves, ...receivedWaves, ...mutualWaves].find(wave => wave.id === waveId);
  }, [sentWaves, receivedWaves, mutualWaves]);

  const getWavesByUser = useCallback((userId: string): WaveWithUsers[] => {
    return [...sentWaves, ...receivedWaves, ...mutualWaves].filter(wave =>
      wave.fromUserId === userId || wave.toUserId === userId
    );
  }, [sentWaves, receivedWaves, mutualWaves]);

  const isWaveFromUser = useCallback((wave: Wave, userId: string): boolean => {
    return wave.fromUserId === userId;
  }, []);

  return {
    // Wave collections
    sentWaves,
    receivedWaves,
    mutualWaves,

    // Computed values
    unreadCount,
    pendingWaves,
    expiredWaves,

    // Statistics
    stats,

    // Loading states
    isLoading,
    isSending,
    isResponding,

    // Connection state
    isConnected,
    lastSync,
    error,

    // Actions
    sendWave,
    respondToWave,
    markAsRead: actions.markAsRead,
    refresh,
    canSendWaveTo,

    // Validation
    validateSendWave,

    // Utilities
    getWaveById,
    getWavesByUser,
    isWaveFromUser,
  };
};

/**
 * Hook for wave statistics with auto-refresh
 */
export const useWaveStatsHook = (autoRefresh = true) => {
  const stats = useWaveStore((state: any) => state.stats);
  const { loadWaves } = useWaveActions();
  const { user } = useAuthContext();

  useEffect(() => {
    if (autoRefresh && user?.id) {
      // Refresh stats every 5 minutes
      const interval = setInterval(() => {
        loadWaves();
      }, 5 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, user?.id, loadWaves]);

  return stats;
};

/**
 * Hook for managing a specific wave
 */
export const useWave = (waveId: string) => {
  const { getWaveById, respondToWave, markAsRead } = useWaves();
  const wave = getWaveById(waveId);

  const respond = useCallback(async (response: 'accepted' | 'declined') => {
    await respondToWave(waveId, response);
  }, [waveId, respondToWave]);

  const markRead = useCallback(() => {
    markAsRead(waveId);
  }, [waveId, markAsRead]);

  return {
    wave,
    respond,
    markRead,
    canRespond: wave ? canRespondToWave(wave) : false,
    isExpired: wave ? isWaveExpired(wave) : false,
  };
};

/**
 * Hook for optimistic wave sending with better UX
 */
export const useSendWave = () => {
  const { sendWave: baseSendWave, validateSendWave, canSendWaveTo } = useWaves();
  const { isSending } = useWaveLoading();

  const sendWave = useCallback(async (input: SendWaveInput) => {
    // Pre-flight validation
    const validation = validateSendWave(input);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    // Check if can send
    const canSend = await canSendWaveTo(input.toUserId);
    if (!canSend.canSend) {
      throw new Error(getErrorMessage(canSend.reason));
    }

    // Send wave
    await baseSendWave(input);
  }, [baseSendWave, validateSendWave, canSendWaveTo]);

  return {
    sendWave,
    isSending,
    canSendWaveTo,
  };
};

/**
 * Hook for wave notifications and real-time updates
 */
export const useWaveNotifications = () => {
  const { unreadCount, pendingWaves, isConnected } = useWaves();

  // Update document title with unread count
  useEffect(() => {
    const originalTitle = document.title.replace(/ \(\d+\)$/, '');
    if (unreadCount > 0) {
      document.title = `${originalTitle} (${unreadCount})`;
    } else {
      document.title = originalTitle;
    }

    return () => {
      document.title = originalTitle;
    };
  }, [unreadCount]);

  return {
    unreadCount,
    pendingWaves,
    isConnected,
  };
};

// Helper function to get user-friendly error messages
function getErrorMessage(reason?: WaveError): string {
  switch (reason) {
    case 'SELF_WAVE':
      return 'You cannot send a wave to yourself';
    case 'ALREADY_SENT':
      return 'You have already sent a wave to this user';
    case 'USER_BLOCKED':
      return 'This user has blocked you';
    case 'RATE_LIMITED':
      return `Daily wave limit reached (${MAX_WAVES_PER_DAY} waves per day)`;
    case 'WAVE_EXPIRED':
      return 'This wave has expired';
    case 'UNAUTHORIZED':
      return 'You must be logged in to send waves';
    case 'NETWORK_ERROR':
      return 'Network error. Please check your connection';
    case 'INVALID_USER':
      return 'Invalid user specified';
    default:
      return 'An error occurred while sending the wave';
  }
}