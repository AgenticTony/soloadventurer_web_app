import { ApiClient, ApiError } from '../base/ApiClient';
import {
  Wave,
  WaveWithUsers,
  SendWaveInput,
  SendWaveResponse,
  RespondToWaveInput,
  GetWavesResponse,
  WaveStats,
  WaveError,
  WaveValidation,
  OfflineWaveAction,
  WAVE_EXPIRY_DAYS,
  MAX_MESSAGE_LENGTH,
  MAX_WAVES_PER_DAY,
  isWaveExpired,
  canRespondToWave
} from '@/types/wave';

export class WaveService {
  private offlineQueue: OfflineWaveAction[] = [];
  private isOnline: boolean = navigator.onLine;

  constructor(private apiClient: ApiClient) {
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
  }

  /**
   * Send a wave to another user with optimistic updates
   */
  async sendWave(input: SendWaveInput): Promise<SendWaveResponse> {
    // Input validation
    const validation = this.validateSendWave(input);
    if (!validation.isValid) {
      throw new ApiError(validation.errors.join(', '));
    }

    try {
      // If offline, add to queue and return optimistic response
      if (!this.isOnline) {
        return this.handleOfflineSendWave(input);
      }

      // Make API call
      const response = await this.apiClient.post<SendWaveResponse>('/waves', {
        toUserId: input.toUserId,
        message: input.message?.trim(),
        tripId: input.tripId,
      });

      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw this.mapApiError(error);
      }
      throw new ApiError('Failed to send wave');
    }
  }

  /**
   * Respond to a received wave
   */
  async respondToWave(input: RespondToWaveInput): Promise<void> {
    // Input validation
    const validation = this.validateRespondToWave(input);
    if (!validation.isValid) {
      throw new ApiError(validation.errors.join(', '));
    }

    try {
      // If offline, add to queue
      if (!this.isOnline) {
        this.addToOfflineQueue('respond', input);
        return;
      }

      await this.apiClient.put<void>(`/waves/${input.waveId}/respond`, {
        response: input.response,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        throw this.mapApiError(error);
      }
      throw new ApiError('Failed to respond to wave');
    }
  }

  /**
   * Get waves for current user with filtering
   */
  async getWaves(filters?: {
    type?: 'sent' | 'received' | 'mutual';
    status?: string[];
    limit?: number;
    nextToken?: string;
  }): Promise<GetWavesResponse> {
    try {
      const params = new URLSearchParams();

      if (filters?.type) params.set('type', filters.type);
      if (filters?.status) params.set('status', filters.status.join(','));
      if (filters?.limit) params.set('limit', filters.limit.toString());
      if (filters?.nextToken) params.set('nextToken', filters.nextToken);

      const queryString = params.toString();
      const endpoint = queryString ? `/waves?${queryString}` : '/waves';

      const response = await this.apiClient.get<GetWavesResponse>(endpoint);

      // Filter out expired waves on client side as backup
      response.waves = response.waves.filter(wave => !isWaveExpired(wave));

      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to fetch waves');
    }
  }

  /**
   * Get mutual connections
   */
  async getMutualConnections(options?: {
    limit?: number;
    nextToken?: string;
  }): Promise<GetWavesResponse> {
    try {
      const params = new URLSearchParams();

      if (options?.limit) params.set('limit', options.limit.toString());
      if (options?.nextToken) params.set('nextToken', options.nextToken);

      const queryString = params.toString();
      const endpoint = queryString ? `/waves/connections?${queryString}` : '/waves/connections';

      return await this.apiClient.get<GetWavesResponse>(endpoint);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to fetch mutual connections');
    }
  }

  /**
   * Get wave statistics for current user
   */
  async getWaveStats(): Promise<WaveStats> {
    try {
      return await this.apiClient.get<WaveStats>('/waves/stats');
    } catch (error) {
      // Return default stats if API fails
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
      await this.apiClient.put<void>(`/waves/${waveId}/read`, {});
    } catch (error) {
      // Non-critical operation, fail silently
      console.warn('Failed to mark wave as read:', error);
    }
  }

  /**
   * Clean up expired waves (admin operation)
   */
  async expireOldWaves(): Promise<{ expiredCount: number }> {
    try {
      return await this.apiClient.post<{ expiredCount: number }>('/waves/expire', {});
    } catch (error) {
      throw new ApiError('Failed to expire old waves');
    }
  }

  /**
   * Check if user can send wave to another user
   */
  async canSendWave(toUserId: string): Promise<{
    canSend: boolean;
    reason?: WaveError;
  }> {
    try {
      return await this.apiClient.get<{
        canSend: boolean;
        reason?: WaveError;
      }>(`/waves/can-send/${toUserId}`);
    } catch (error) {
      return { canSend: false, reason: 'NETWORK_ERROR' };
    }
  }

  /**
   * Get user's daily wave count
   */
  async getDailyWaveCount(): Promise<number> {
    try {
      const response = await this.apiClient.get<{ count: number }>('/waves/daily-count');
      return response.count;
    } catch (error) {
      return 0;
    }
  }

  // Private helper methods

  private validateSendWave(input: SendWaveInput): WaveValidation {
    const errors: string[] = [];

    if (!input.toUserId?.trim()) {
      errors.push('Recipient user ID is required');
    }

    if (input.message && input.message.length > MAX_MESSAGE_LENGTH) {
      errors.push(`Message must be ${MAX_MESSAGE_LENGTH} characters or less`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private validateRespondToWave(input: RespondToWaveInput): WaveValidation {
    const errors: string[] = [];

    if (!input.waveId?.trim()) {
      errors.push('Wave ID is required');
    }

    if (!['accepted', 'declined'].includes(input.response)) {
      errors.push('Response must be either "accepted" or "declined"');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private mapApiError(error: ApiError): ApiError {
    // Map specific API errors to wave errors
    if (error.message.includes('already sent')) {
      return new ApiError('Wave already sent to this user');
    }
    if (error.message.includes('user blocked')) {
      return new ApiError('Cannot send wave to blocked user');
    }
    if (error.message.includes('expired')) {
      return new ApiError('This wave has expired');
    }
    if (error.message.includes('rate limit')) {
      return new ApiError(`Daily wave limit reached (${MAX_WAVES_PER_DAY})`);
    }
    if (error.message.includes('self')) {
      return new ApiError('Cannot send wave to yourself');
    }

    return error;
  }

  private handleOfflineSendWave(input: SendWaveInput): SendWaveResponse {
    // Create optimistic wave response
    const optimisticWave: WaveWithUsers = {
      id: `temp-${Date.now()}`,
      fromUserId: 'current-user', // Will be replaced by actual user ID
      toUserId: input.toUserId,
      type: 'sent',
      status: 'pending',
      message: input.message,
      tripId: input.tripId,
      expiresAt: new Date(Date.now() + WAVE_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fromUser: {
        id: 'current-user',
        name: 'You',
        avatar: undefined,
        location: undefined,
      },
      toUser: {
        id: input.toUserId,
        name: 'Unknown User',
        avatar: undefined,
        location: undefined,
      },
    };

    // Add to offline queue
    this.addToOfflineQueue('send', input);

    return {
      wave: optimisticWave,
      isMutual: false,
    };
  }

  private addToOfflineQueue(type: 'send' | 'respond', payload: SendWaveInput | RespondToWaveInput): void {
    const action: OfflineWaveAction = {
      id: `${type}-${Date.now()}`,
      type,
      payload,
      timestamp: new Date().toISOString(),
      retryCount: 0,
    };

    this.offlineQueue.push(action);
    this.saveOfflineQueue();
  }

  private handleOnline(): void {
    this.isOnline = true;
    this.processOfflineQueue();
  }

  private handleOffline(): void {
    this.isOnline = false;
  }

  private async processOfflineQueue(): Promise<void> {
    const queue = [...this.offlineQueue];
    this.offlineQueue = [];

    for (const action of queue) {
      try {
        if (action.type === 'send') {
          await this.sendWave(action.payload as SendWaveInput);
        } else if (action.type === 'respond') {
          await this.respondToWave(action.payload as RespondToWaveInput);
        }
      } catch (error) {
        // Re-queue failed actions with retry limit
        if (action.retryCount < 3) {
          action.retryCount++;
          this.offlineQueue.push(action);
        }
      }
    }

    this.saveOfflineQueue();
  }

  private saveOfflineQueue(): void {
    try {
      localStorage.setItem('wave_offline_queue', JSON.stringify(this.offlineQueue));
    } catch (error) {
      console.warn('Failed to save offline queue:', error);
    }
  }

  private loadOfflineQueue(): void {
    try {
      const saved = localStorage.getItem('wave_offline_queue');
      if (saved) {
        this.offlineQueue = JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load offline queue:', error);
      this.offlineQueue = [];
    }
  }

  // Initialize offline queue on service creation
  public initialize(): void {
    this.loadOfflineQueue();
  }
}

// Create singleton instance
import { apiClient } from '../base/ApiClient';
export const waveService = new WaveService(apiClient);

// Initialize the service
waveService.initialize();

// Export the service class for testing
export default WaveService;