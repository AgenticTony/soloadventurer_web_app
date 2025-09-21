// Wave API Client - GraphQL Integration
// Sprint 3: Real-time Wave System

import { ApolloClient, NormalizedCacheObject, gql, type FetchPolicy } from '@apollo/client';
import {
  Wave,
  WaveWithUsers,
  SendWaveInput,
  SendWaveResponse,
  RespondToWaveInput,
  GetWavesResponse,
  WaveStats,
  WaveFilters,
  WaveError,
  WAVE_EXPIRY_DAYS,
  isWaveExpired
} from '@/types/wave';

import {
  GET_WAVES_BY_USER,
  GET_MUTUAL_CONNECTIONS,
  GET_WAVE_STATS,
  SEND_WAVE,
  RESPOND_TO_WAVE,
  MARK_WAVE_AS_READ,
  EXPIRE_OLD_WAVES,
  ON_WAVE_RECEIVED,
  ON_WAVE_RESPONDED,
  ON_MUTUAL_MATCH,
  ON_WAVE_STATUS_CHANGE
} from '@/graphql/waves';

export class WaveAPI {
  private subscriptions: Map<string, any> = new Map();

  constructor(private apolloClient: ApolloClient<NormalizedCacheObject>) {}

  /**
   * Send a wave to another user
   */
  async sendWave(input: SendWaveInput): Promise<SendWaveResponse> {
    try {
      const { data } = await this.apolloClient.mutate({
        mutation: SEND_WAVE,
        variables: { input },
        // Optimistic response for immediate UI feedback
        optimisticResponse: {
          sendWave: {
            __typename: 'SendWaveResponse',
            wave: {
              __typename: 'Wave',
              id: `temp-${Date.now()}`,
              fromUserId: 'current-user', // Will be replaced by real data
              toUserId: input.toUserId,
              type: 'SENT',
              status: 'PENDING',
              message: input.message || null,
              tripId: input.tripId || null,
              expiresAt: new Date(Date.now() + WAVE_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString(),
              isRead: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              fromUser: {
                __typename: 'User',
                id: 'current-user',
                name: 'You',
                avatar: null,
                location: null,
              },
              toUser: {
                __typename: 'User',
                id: input.toUserId,
                name: 'Loading...',
                avatar: null,
                location: null,
              },
              trip: input.tripId ? {
                __typename: 'Trip',
                id: input.tripId,
                title: 'Loading...',
                startDate: new Date().toISOString(),
                destination: {
                  __typename: 'Destination',
                  city: '',
                  country: '',
                },
              } : null,
            },
            isMutual: false,
            connection: null,
          },
        },
        // Update Apollo cache
        update: (cache, { data }) => {
          if (data?.sendWave) {
            // Add to sent waves cache
            this.updateWavesCache(cache, data.sendWave.wave, 'sent');
          }
        },
      });

      return data.sendWave;
    } catch (error) {
      throw this.handleGraphQLError(error);
    }
  }

  /**
   * Respond to a received wave
   */
  async respondToWave(input: RespondToWaveInput): Promise<void> {
    try {
      await this.apolloClient.mutate({
        mutation: RESPOND_TO_WAVE,
        variables: { input },
        // Optimistic response
        optimisticResponse: {
          respondToWave: {
            __typename: 'RespondToWaveResponse',
            wave: {
              __typename: 'Wave',
              id: input.waveId,
              status: input.response.toUpperCase(),
              updatedAt: new Date().toISOString(),
            },
            isMutual: input.response === 'accepted',
            connection: null,
          },
        },
        // Update cache
        update: (cache, { data }) => {
          if (data?.respondToWave) {
            // Update wave status in cache
            cache.writeFragment({
              id: cache.identify({ __typename: 'Wave', id: input.waveId }),
              fragment: gql`
                fragment UpdateWaveStatus on Wave {
                  status
                  updatedAt
                }
              `,
              data: {
                status: input.response.toUpperCase(),
                updatedAt: new Date().toISOString(),
              },
            });
          }
        },
      });
    } catch (error) {
      throw this.handleGraphQLError(error);
    }
  }

  /**
   * Get waves for a user with filtering
   */
  async getWaves(userId: string, filters?: WaveFilters): Promise<GetWavesResponse> {
    try {
      const { data } = await this.apolloClient.query({
        query: GET_WAVES_BY_USER,
        variables: {
          userId,
          status: filters?.status?.[0]?.toUpperCase(),
          limit: filters?.limit || 20,
          nextToken: filters?.nextToken,
        },
        fetchPolicy: 'cache-first',
      });

      // Transform GraphQL response to match our types
      const waves: WaveWithUsers[] = data.getWavesByUser.waves.map((wave: any) => ({
        ...wave,
        type: wave.type.toLowerCase(),
        status: wave.status.toLowerCase(),
        isExpired: isWaveExpired(wave),
        isMutual: wave.type === 'MUTUAL',
      }));

      return {
        waves,
        nextToken: data.getWavesByUser.nextToken,
      };
    } catch (error) {
      throw this.handleGraphQLError(error);
    }
  }

  /**
   * Get mutual connections
   */
  async getMutualConnections(userId: string, limit = 20, nextToken?: string): Promise<GetWavesResponse> {
    try {
      const { data } = await this.apolloClient.query({
        query: GET_MUTUAL_CONNECTIONS,
        variables: { userId, limit, nextToken },
        fetchPolicy: 'cache-first',
      });

      // Transform connections to waves format for consistency
      const waves: WaveWithUsers[] = data.getMutualConnections.map((connection: any) => ({
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
      }));

      return { waves };
    } catch (error) {
      throw this.handleGraphQLError(error);
    }
  }

  /**
   * Get wave statistics
   */
  async getWaveStats(userId: string): Promise<WaveStats> {
    try {
      const { data } = await this.apolloClient.query({
        query: GET_WAVE_STATS,
        variables: { userId },
        fetchPolicy: 'cache-first',
      });

      return data.getWaveStats;
    } catch (error) {
      // Return default stats on error
      return {
        sentCount: 0,
        receivedCount: 0,
        mutualCount: 0,
        pendingCount: 0,
      };
    }
  }

  /**
   * Mark a wave as read
   */
  async markAsRead(waveId: string): Promise<void> {
    try {
      await this.apolloClient.mutate({
        mutation: MARK_WAVE_AS_READ,
        variables: { waveId },
        // Optimistic update
        optimisticResponse: {
          markWaveAsRead: {
            __typename: 'Wave',
            id: waveId,
            isRead: true,
            updatedAt: new Date().toISOString(),
          },
        },
      });
    } catch (error) {
      // Non-critical operation, log but don't throw
      console.warn('Failed to mark wave as read:', error);
    }
  }

  /**
   * Subscribe to real-time wave updates
   */
  subscribeToWaves(userId: string, callbacks: {
    onWaveReceived?: (wave: WaveWithUsers) => void;
    onWaveResponded?: (wave: WaveWithUsers) => void;
    onMutualMatch?: (connection: any) => void;
  }): () => void {
    const subscriptionHandlers: (() => void)[] = [];

    // Subscribe to new waves received
    if (callbacks.onWaveReceived) {
      const waveReceivedSub = this.apolloClient.subscribe({
        query: ON_WAVE_RECEIVED,
        variables: { userId },
      }).subscribe({
        next: ({ data }) => {
          if (data?.onWaveReceived) {
            const wave = {
              ...data.onWaveReceived,
              type: data.onWaveReceived.type.toLowerCase(),
              status: data.onWaveReceived.status.toLowerCase(),
              isExpired: isWaveExpired(data.onWaveReceived),
              isMutual: data.onWaveReceived.type === 'MUTUAL',
            };
            callbacks.onWaveReceived!(wave);
          }
        },
        error: (err) => console.error('Wave received subscription error:', err),
      });
      subscriptionHandlers.push(() => waveReceivedSub.unsubscribe());
    }

    // Subscribe to wave responses
    if (callbacks.onWaveResponded) {
      const waveRespondedSub = this.apolloClient.subscribe({
        query: ON_WAVE_RESPONDED,
        variables: { userId },
      }).subscribe({
        next: ({ data }) => {
          if (data?.onWaveResponded) {
            const wave = {
              ...data.onWaveResponded,
              type: data.onWaveResponded.type.toLowerCase(),
              status: data.onWaveResponded.status.toLowerCase(),
              isExpired: isWaveExpired(data.onWaveResponded),
              isMutual: data.onWaveResponded.type === 'MUTUAL',
            };
            callbacks.onWaveResponded!(wave);
          }
        },
        error: (err) => console.error('Wave responded subscription error:', err),
      });
      subscriptionHandlers.push(() => waveRespondedSub.unsubscribe());
    }

    // Subscribe to mutual matches
    if (callbacks.onMutualMatch) {
      const mutualMatchSub = this.apolloClient.subscribe({
        query: ON_MUTUAL_MATCH,
        variables: { userId },
      }).subscribe({
        next: ({ data }) => {
          if (data?.onMutualMatch) {
            callbacks.onMutualMatch!(data.onMutualMatch);
          }
        },
        error: (err) => console.error('Mutual match subscription error:', err),
      });
      subscriptionHandlers.push(() => mutualMatchSub.unsubscribe());
    }

    // Return cleanup function
    return () => {
      subscriptionHandlers.forEach(cleanup => cleanup());
    };
  }

  /**
   * Check if user can send wave (validation helper)
   */
  async canSendWave(fromUserId: string, toUserId: string): Promise<{
    canSend: boolean;
    reason?: WaveError;
  }> {
    // Client-side validation
    if (fromUserId === toUserId) {
      return { canSend: false, reason: 'SELF_WAVE' };
    }

    try {
      // Check for existing waves
      const { waves } = await this.getWaves(fromUserId, {
        type: ['sent'],
        status: ['pending'],
      });

      const existingWave = waves.find(wave => wave.toUserId === toUserId && !isWaveExpired(wave));
      if (existingWave) {
        return { canSend: false, reason: 'ALREADY_SENT' };
      }

      return { canSend: true };
    } catch (error) {
      return { canSend: false, reason: 'NETWORK_ERROR' };
    }
  }

  /**
   * Clean up expired waves
   */
  async expireOldWaves(): Promise<{ expiredCount: number }> {
    try {
      const { data } = await this.apolloClient.mutate({
        mutation: EXPIRE_OLD_WAVES,
      });

      return { expiredCount: data.expireOldWaves.expiredCount };
    } catch (error) {
      throw this.handleGraphQLError(error);
    }
  }

  // Private helper methods

  private updateWavesCache(cache: any, wave: Wave, type: 'sent' | 'received'): void {
    try {
      const existingData = cache.readQuery({
        query: GET_WAVES_BY_USER,
        variables: { userId: wave.fromUserId },
      });

      if (existingData) {
        cache.writeQuery({
          query: GET_WAVES_BY_USER,
          variables: { userId: wave.fromUserId },
          data: {
            getWavesByUser: {
              ...existingData.getWavesByUser,
              waves: [wave, ...existingData.getWavesByUser.waves],
            },
          },
        });
      }
    } catch (error) {
      // Cache update failed, but mutation was successful
      console.warn('Failed to update waves cache:', error);
    }
  }

  private handleGraphQLError(error: any): Error {
    // Extract meaningful error from GraphQL error
    if (error.graphQLErrors?.length > 0) {
      const gqlError = error.graphQLErrors[0];
      return new Error(gqlError.message || 'GraphQL error occurred');
    }

    if (error.networkError) {
      return new Error('Network error: Please check your connection');
    }

    return new Error(error.message || 'Unknown error occurred');
  }
}

// Export a configured instance
// Note: This will be initialized with the Apollo client from the app's provider
let waveAPI: WaveAPI;

export const initializeWaveAPI = (apolloClient: ApolloClient<NormalizedCacheObject>) => {
  waveAPI = new WaveAPI(apolloClient);
  return waveAPI;
};

export const getWaveAPI = (): WaveAPI => {
  if (!waveAPI) {
    throw new Error('WaveAPI not initialized. Call initializeWaveAPI first.');
  }
  return waveAPI;
};

export { waveAPI };