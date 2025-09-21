// Wave System Types for Real-time Matching
// Sprint 3: Matching & Connections

export type WaveType = 'sent' | 'received' | 'mutual';

export type WaveStatus = 'pending' | 'accepted' | 'declined' | 'expired';

// Core Wave interface
export interface Wave {
  id: string;
  fromUserId: string;
  toUserId: string;
  type: WaveType;
  status: WaveStatus;
  message?: string;
  tripId?: string; // Optional: Associate wave with a specific trip
  expiresAt: string; // ISO date string - waves expire after 7 days
  createdAt: string;
  updatedAt: string;
  // Computed fields
  isExpired?: boolean;
  isMutual?: boolean;
}

// Extended Wave with user information for UI display
export interface WaveWithUsers extends Wave {
  fromUser: {
    id: string;
    name: string;
    avatar?: string;
    location?: string;
  };
  toUser: {
    id: string;
    name: string;
    avatar?: string;
    location?: string;
  };
  trip?: {
    id: string;
    title: string;
    destination?: string;
    startDate: string;
  };
  isRead?: boolean;
}

// Input types for API operations
export interface SendWaveInput {
  toUserId: string;
  message?: string;
  tripId?: string;
}

export interface RespondToWaveInput {
  waveId: string;
  response: 'accepted' | 'declined';
}

// API Response types
export interface SendWaveResponse {
  wave: Wave;
  isMutual: boolean; // True if this creates a mutual match
}

export interface GetWavesResponse {
  waves: WaveWithUsers[];
  nextToken?: string;
}

// Wave statistics for UI
export interface WaveStats {
  sentCount: number;
  receivedCount: number;
  mutualCount: number;
  pendingCount: number;
}

// Real-time subscription events
export interface WaveEvent {
  type: 'wave_sent' | 'wave_received' | 'wave_responded' | 'wave_expired' | 'mutual_match';
  wave: WaveWithUsers;
  userId: string; // Target user for the event
}

// Zustand store state interface
export interface WaveState {
  // Wave collections
  sentWaves: WaveWithUsers[];
  receivedWaves: WaveWithUsers[];
  mutualWaves: WaveWithUsers[];

  // Loading states
  isLoading: boolean;
  isSending: boolean;
  isResponding: boolean;

  // Error handling
  error: string | null;

  // Real-time connection status
  isConnected: boolean;
  lastSync: string | null;

  // Statistics
  stats: WaveStats;

  // Actions
  sendWave: (input: SendWaveInput) => Promise<SendWaveResponse>;
  respondToWave: (input: RespondToWaveInput) => Promise<void>;
  loadWaves: () => Promise<void>;
  markAsRead: (waveId: string) => void;
  clearExpiredWaves: () => void;

  // Real-time actions
  subscribeToWaves: (userId: string) => void;
  unsubscribeFromWaves: () => void;
  handleWaveEvent: (event: WaveEvent) => void;

  // Utility actions
  reset: () => void;
  setError: (error: string | null) => void;
}

// Filter options for wave queries
export interface WaveFilters {
  status?: WaveStatus[];
  type?: WaveType[];
  includeExpired?: boolean;
  tripId?: string;
  limit?: number;
  nextToken?: string;
}

// Wave validation helpers
export interface WaveValidation {
  isValid: boolean;
  errors: string[];
}

// Offline queue for sending waves when connection is restored
export interface OfflineWaveAction {
  id: string;
  type: 'send' | 'respond';
  payload: SendWaveInput | RespondToWaveInput;
  timestamp: string;
  retryCount: number;
}

// Error types specific to wave operations
export type WaveError =
  | 'INVALID_USER'
  | 'ALREADY_SENT'
  | 'SELF_WAVE'
  | 'USER_BLOCKED'
  | 'WAVE_EXPIRED'
  | 'NETWORK_ERROR'
  | 'UNAUTHORIZED'
  | 'RATE_LIMITED';

// Constants
export const WAVE_EXPIRY_DAYS = 7;
export const MAX_MESSAGE_LENGTH = 200;
export const MAX_WAVES_PER_DAY = 50;
export const WAVE_RETRY_ATTEMPTS = 3;
export const WAVE_RETRY_DELAY = 1000; // milliseconds

// Utility type guards
export const isWaveExpired = (wave: Wave): boolean => {
  return new Date(wave.expiresAt) < new Date();
};

export const isMutualWave = (wave: Wave): boolean => {
  return wave.type === 'mutual' || wave.isMutual === true;
};

export const canRespondToWave = (wave: Wave): boolean => {
  return wave.status === 'pending' && !isWaveExpired(wave);
};

// Wave notification types for push notifications
export interface WaveNotification {
  waveId: string;
  type: 'new_wave' | 'wave_accepted' | 'mutual_match';
  fromUser: {
    id: string;
    name: string;
    avatar?: string;
  };
  message: string;
  data?: Record<string, any>;
}