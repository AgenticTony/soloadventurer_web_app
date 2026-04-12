// Wave Store - Zustand Real-time State Management
// Sprint 3: Real-time Wave System with Offline Support

import { create } from 'zustand';
import { subscribeWithSelector, persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import { immer } from 'zustand/middleware/immer';
import {
  WaveState,
  WaveWithUsers,
  SendWaveInput,
  SendWaveResponse,
  RespondToWaveInput,
  WaveStats,
  WaveEvent,
  OfflineWaveAction,
  isWaveExpired,
  WAVE_EXPIRY_DAYS,
} from '@/types/wave';
import { getWaveAPI } from '@/lib/api/waves';

interface WaveStore extends WaveState {
  // Additional internal state
  _subscriptionCleanup: (() => void) | null;
  _lastHeartbeat: string | null;
  _retryTimeout: NodeJS.Timeout | null;
}

const initialStats: WaveStats = {
  sentCount: 0,
  receivedCount: 0,
  mutualCount: 0,
  pendingCount: 0,
};

export const useWaveStore = create<WaveStore>()(
  subscribeWithSelector(
    persist(
      immer((set, get) => ({
        // State
        sentWaves: [],
        receivedWaves: [],
        mutualWaves: [],
        isLoading: false,
        isSending: false,
        isResponding: false,
        error: null,
        isConnected: typeof window !== 'undefined' ? navigator.onLine : true,
        lastSync: null,
        stats: initialStats,

        // Internal state
        _subscriptionCleanup: null,
        _lastHeartbeat: null,
        _retryTimeout: null,

        // Actions
        sendWave: async (input: SendWaveInput): Promise<SendWaveResponse> => {
          set((state) => {
            state.isSending = true;
            state.error = null;
          });

          try {
            const waveAPI = getWaveAPI();
            const response = await waveAPI.sendWave(input);

            set((state) => {
              // Add to sent waves - ensure we have WaveWithUsers format
              const waveWithUsers = response.wave as WaveWithUsers;
              const existingIndex = state.sentWaves.findIndex(w => w.id === waveWithUsers.id);
              if (existingIndex >= 0) {
                state.sentWaves[existingIndex] = waveWithUsers;
              } else {
                state.sentWaves.unshift(waveWithUsers);
              }

              // If mutual, add to mutual waves
              if (response.isMutual) {
                const mutualWave = { ...waveWithUsers, type: 'mutual' as const };
                state.mutualWaves.unshift(mutualWave);
              }

              // Update stats
              state.stats.sentCount += 1;
              if (response.isMutual) {
                state.stats.mutualCount += 1;
              }

              state.isSending = false;
              state.lastSync = new Date().toISOString();
            });

            return response;
          } catch (error) {
            set((state) => {
              state.isSending = false;
              state.error = error instanceof Error ? error.message : 'Failed to send wave';
            });
            throw error;
          }
        },

        respondToWave: async (input: RespondToWaveInput): Promise<void> => {
          set((state) => {
            state.isResponding = true;
            state.error = null;
          });

          try {
            const waveAPI = getWaveAPI();
            await waveAPI.respondToWave(input);

            set((state) => {
              // Update wave status in received waves
              const waveIndex = state.receivedWaves.findIndex(w => w.id === input.waveId);
              if (waveIndex >= 0) {
                const wave = state.receivedWaves[waveIndex];
                wave.status = input.response;
                wave.updatedAt = new Date().toISOString();

                // If accepted and creates mutual match, add to mutual waves
                if (input.response === 'accepted') {
                  const mutualWave = { ...wave, type: 'mutual' as const };
                  state.mutualWaves.unshift(mutualWave);
                  state.stats.mutualCount += 1;
                }

                // Update pending count
                if (input.response === 'accepted' || input.response === 'declined') {
                  state.stats.pendingCount = Math.max(0, state.stats.pendingCount - 1);
                }
              }

              state.isResponding = false;
              state.lastSync = new Date().toISOString();
            });
          } catch (error) {
            set((state) => {
              state.isResponding = false;
              state.error = error instanceof Error ? error.message : 'Failed to respond to wave';
            });
            throw error;
          }
        },

        loadWaves: async (): Promise<void> => {
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            const waveAPI = getWaveAPI();
            const currentUserId = 'current-user'; // Get from auth context

            // Load all wave types in parallel
            const [sentResponse, receivedResponse, mutualResponse, stats] = await Promise.all([
              waveAPI.getWaves(currentUserId, { type: ['sent'], status: ['pending', 'accepted', 'declined'] }),
              waveAPI.getWaves(currentUserId, { type: ['received'], status: ['pending'] }),
              waveAPI.getMutualConnections(currentUserId),
              waveAPI.getWaveStats(currentUserId),
            ]);

            set((state) => {
              state.sentWaves = sentResponse.waves.filter(w => !isWaveExpired(w));
              state.receivedWaves = receivedResponse.waves.filter(w => !isWaveExpired(w));
              state.mutualWaves = mutualResponse.waves.filter(w => !isWaveExpired(w));
              state.stats = stats;
              state.isLoading = false;
              state.lastSync = new Date().toISOString();
            });
          } catch (error) {
            set((state) => {
              state.isLoading = false;
              state.error = error instanceof Error ? error.message : 'Failed to load waves';
            });
          }
        },

        markAsRead: (waveId: string): void => {
          set((state) => {
            // Optimistically update UI
            const wave = state.receivedWaves.find(w => w.id === waveId);
            if (wave) {
              wave.isRead = true;
            }
          });

          // Make API call in background
          getWaveAPI().markAsRead(waveId).catch(console.warn);
        },

        clearExpiredWaves: (): void => {
          set((state) => {
            const now = new Date();

            state.sentWaves = state.sentWaves.filter(w => !isWaveExpired(w));
            state.receivedWaves = state.receivedWaves.filter(w => !isWaveExpired(w));
            state.mutualWaves = state.mutualWaves.filter(w => !isWaveExpired(w));

            state.lastSync = now.toISOString();
          });
        },

        subscribeToWaves: (userId: string): void => {
          // Clean up existing subscription
          const cleanup = get()._subscriptionCleanup;
          if (cleanup) {
            cleanup();
          }

          try {
            const waveAPI = getWaveAPI();
            const newCleanup = waveAPI.subscribeToWaves(userId, {
              onWaveReceived: (wave) => {
                set((state) => {
                  // Add to received waves if not duplicate
                  const exists = state.receivedWaves.some(w => w.id === wave.id);
                  if (!exists) {
                    state.receivedWaves.unshift(wave);
                    state.stats.receivedCount += 1;
                    state.stats.pendingCount += 1;
                  }
                  state.lastSync = new Date().toISOString();
                });
              },

              onWaveResponded: (wave) => {
                set((state) => {
                  // Update sent wave status
                  const sentIndex = state.sentWaves.findIndex(w => w.id === wave.id);
                  if (sentIndex >= 0) {
                    state.sentWaves[sentIndex] = wave;

                    // If accepted and creates mutual match, add to mutual waves
                    if (wave.status === 'accepted' && wave.isMutual) {
                      const mutualWave = { ...wave, type: 'mutual' as const };
                      state.mutualWaves.unshift(mutualWave);
                      state.stats.mutualCount += 1;
                    }
                  }
                  state.lastSync = new Date().toISOString();
                });
              },

              onMutualMatch: (connection) => {
                set((state) => {
                  // Add mutual connection if not already present
                  const exists = state.mutualWaves.some(w =>
                    (w.fromUserId === connection.userOneId && w.toUserId === connection.userTwoId) ||
                    (w.fromUserId === connection.userTwoId && w.toUserId === connection.userOneId)
                  );

                  if (!exists) {
                    const mutualWave: WaveWithUsers = {
                      id: connection.id,
                      fromUserId: connection.userOneId,
                      toUserId: connection.userTwoId,
                      type: 'mutual',
                      status: 'accepted',
                      message: connection.waveOne.message,
                      expiresAt: new Date(Date.now() + WAVE_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString(),
                      createdAt: connection.createdAt,
                      updatedAt: connection.createdAt,
                      isExpired: false,
                      isMutual: true,
                      fromUser: connection.userOne,
                      toUser: connection.userTwo,
                    };

                    state.mutualWaves.unshift(mutualWave);
                    state.stats.mutualCount += 1;
                  }
                  state.lastSync = new Date().toISOString();
                });
              },
            });

            set((state) => {
              state._subscriptionCleanup = newCleanup;
              state.isConnected = true;
            });
          } catch (error) {
            console.error('Failed to subscribe to waves:', error);
            set((state) => {
              state.isConnected = false;
              state.error = 'Failed to connect to real-time updates';
            });

            // Retry connection after delay
            setTimeout(() => get().subscribeToWaves(userId), 5000);
          }
        },

        unsubscribeFromWaves: (): void => {
          const cleanup = get()._subscriptionCleanup;
          if (cleanup) {
            cleanup();
            set((state) => {
              state._subscriptionCleanup = null;
              state.isConnected = false;
            });
          }
        },

        handleWaveEvent: (event: WaveEvent): void => {
          set((state) => {
            switch (event.type) {
              case 'wave_sent':
                // Already handled in sendWave action
                break;

              case 'wave_received':
                const exists = state.receivedWaves.some(w => w.id === event.wave.id);
                if (!exists) {
                  state.receivedWaves.unshift(event.wave);
                  state.stats.receivedCount += 1;
                  state.stats.pendingCount += 1;
                }
                break;

              case 'wave_responded':
                const waveIndex = state.sentWaves.findIndex(w => w.id === event.wave.id);
                if (waveIndex >= 0) {
                  state.sentWaves[waveIndex] = event.wave;
                }
                break;

              case 'mutual_match':
                if (event.wave.isMutual && !state.mutualWaves.some(w => w.id === event.wave.id)) {
                  state.mutualWaves.unshift(event.wave);
                  state.stats.mutualCount += 1;
                }
                break;

              case 'wave_expired':
                // Remove expired wave from all collections
                state.sentWaves = state.sentWaves.filter(w => w.id !== event.wave.id);
                state.receivedWaves = state.receivedWaves.filter(w => w.id !== event.wave.id);
                if (event.wave.status === 'pending') {
                  state.stats.pendingCount = Math.max(0, state.stats.pendingCount - 1);
                }
                break;
            }

            state.lastSync = new Date().toISOString();
          });
        },

        reset: (): void => {
          // Clean up subscription
          const cleanup = get()._subscriptionCleanup;
          if (cleanup) {
            cleanup();
          }

          // Clear retry timeout
          const timeout = get()._retryTimeout;
          if (timeout) {
            clearTimeout(timeout);
          }

          set((state) => {
            state.sentWaves = [];
            state.receivedWaves = [];
            state.mutualWaves = [];
            state.isLoading = false;
            state.isSending = false;
            state.isResponding = false;
            state.error = null;
            state.isConnected = navigator.onLine;
            state.lastSync = null;
            state.stats = initialStats;
            state._subscriptionCleanup = null;
            state._lastHeartbeat = null;
            state._retryTimeout = null;
          });
        },

        setError: (error: string | null): void => {
          set((state) => {
            state.error = error;
          });
        },
      })),
      {
        name: 'wave-store',
        // Only persist non-sensitive data
        partialize: (state) => ({
          sentWaves: state.sentWaves.filter(w => !isWaveExpired(w)),
          mutualWaves: state.mutualWaves.filter(w => !isWaveExpired(w)),
          stats: state.stats,
          lastSync: state.lastSync,
        }),
      }
    )
  )
);

// Selector hooks for optimized re-renders
export const useSentWaves = () => useWaveStore((state) => state.sentWaves);
export const useReceivedWaves = () => useWaveStore((state) => state.receivedWaves);
export const useMutualWaves = () => useWaveStore((state) => state.mutualWaves);
export const useWaveStats = () => useWaveStore((state) => state.stats);
export const useWaveLoading = () => useWaveStore(useShallow((state) => ({
  isLoading: state.isLoading,
  isSending: state.isSending,
  isResponding: state.isResponding,
})));
export const useWaveConnection = () => useWaveStore(useShallow((state) => ({
  isConnected: state.isConnected,
  lastSync: state.lastSync,
  error: state.error,
})));

// Actions
export const useWaveActions = () => useWaveStore(useShallow((state) => ({
  sendWave: state.sendWave,
  respondToWave: state.respondToWave,
  loadWaves: state.loadWaves,
  markAsRead: state.markAsRead,
  clearExpiredWaves: state.clearExpiredWaves,
  subscribeToWaves: state.subscribeToWaves,
  unsubscribeFromWaves: state.unsubscribeFromWaves,
  reset: state.reset,
  setError: state.setError,
})));

// Auto-cleanup expired waves every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    useWaveStore.getState().clearExpiredWaves();
  }, 5 * 60 * 1000);
}

// Handle online/offline events
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useWaveStore.setState({ isConnected: true, error: null });
  });

  window.addEventListener('offline', () => {
    useWaveStore.setState({ isConnected: false });
  });
}