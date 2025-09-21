// Connections API Layer - Friend Connection Management with Real-time Support
// Sprint 3: API layer following official best practices with optimistic updates

'use client';

import {
  Connection,
  ConnectionWithUser,
  ConnectionSuggestion,
  ConnectionStats,
  ConnectionStatus,
  RequestDirection,
  CreateConnectionRequest,
  CreateConnectionResponse,
  UpdateConnectionRequest,
  UpdateConnectionResponse,
  SearchConnectionsRequest,
  SearchConnectionsResponse,
  BulkConnectionOperation,
  BulkConnectionResponse,
  ConnectionWebSocketEvent,
  User
} from '@/types/connection';

/**
 * API Configuration following official patterns
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/ws';

/**
 * HTTP Client with proper error handling and retry logic
 * Following official fetch patterns and error handling
 */
class ConnectionsAPIClient {
  private baseURL: string;
  private retryAttempts: number = 3;
  private retryDelay: number = 1000;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Generic fetch wrapper with retry logic and error handling
   * Following official patterns for network resilience
   */
  private async fetchWithRetry<T>(
    endpoint: string,
    options: RequestInit = {},
    attempt: number = 1
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));

        // Handle specific HTTP status codes
        if (response.status === 401) {
          // Handle unauthorized - redirect to login or refresh token
          window.dispatchEvent(new CustomEvent('auth:unauthorized'));
          throw new ConnectionError('VALIDATION_ERROR', 'Authentication required');
        }

        if (response.status === 429) {
          throw new ConnectionError('RATE_LIMITED', 'Too many requests. Please try again later.');
        }

        if (response.status >= 500 && attempt < this.retryAttempts) {
          // Retry on server errors with exponential backoff
          await this.delay(this.retryDelay * Math.pow(2, attempt - 1));
          return this.fetchWithRetry<T>(endpoint, options, attempt + 1);
        }

        throw new ConnectionError(
          errorData.code || 'NETWORK_ERROR',
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ConnectionError) {
        throw error;
      }

      // Network error - retry if not the last attempt
      if (attempt < this.retryAttempts) {
        await this.delay(this.retryDelay * Math.pow(2, attempt - 1));
        return this.fetchWithRetry<T>(endpoint, options, attempt + 1);
      }

      throw new ConnectionError('NETWORK_ERROR', 'Network request failed. Please check your connection.');
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Input validation and sanitization
   * Following security best practices
   */
  private validateAndSanitizeInput(data: any): any {
    const sanitized = { ...data };

    // Sanitize string inputs to prevent XSS
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string') {
        sanitized[key] = sanitized[key]
          .trim()
          .replace(/[<>\"']/g, '') // Basic XSS prevention
          .substring(0, 1000); // Prevent overly long inputs
      }
    });

    return sanitized;
  }

  /**
   * Get user's connections with pagination and filtering
   */
  async getConnections(
    status?: ConnectionStatus[],
    limit: number = 50,
    offset: number = 0
  ): Promise<SearchConnectionsResponse> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    if (status?.length) {
      params.append('status', status.join(','));
    }

    return this.fetchWithRetry<SearchConnectionsResponse>(`/connections?${params}`);
  }

  /**
   * Get connection suggestions based on algorithm
   */
  async getConnectionSuggestions(limit: number = 10): Promise<ConnectionSuggestion[]> {
    return this.fetchWithRetry<ConnectionSuggestion[]>(`/connections/suggestions?limit=${limit}`);
  }

  /**
   * Get connection statistics for user profile
   */
  async getConnectionStats(): Promise<ConnectionStats> {
    return this.fetchWithRetry<ConnectionStats>('/connections/stats');
  }

  /**
   * Search connections and users
   */
  async searchConnections(request: SearchConnectionsRequest): Promise<SearchConnectionsResponse> {
    const sanitizedRequest = this.validateAndSanitizeInput(request);

    return this.fetchWithRetry<SearchConnectionsResponse>('/connections/search', {
      method: 'POST',
      body: JSON.stringify(sanitizedRequest),
    });
  }

  /**
   * Send a connection request with optimistic update support
   */
  async sendConnectionRequest(request: CreateConnectionRequest): Promise<CreateConnectionResponse> {
    const sanitizedRequest = this.validateAndSanitizeInput(request);

    // Validate required fields
    if (!sanitizedRequest.targetUserId) {
      throw new ConnectionError('VALIDATION_ERROR', 'Target user ID is required');
    }

    if (sanitizedRequest.message && sanitizedRequest.message.length > 500) {
      throw new ConnectionError('VALIDATION_ERROR', 'Message must be 500 characters or less');
    }

    return this.fetchWithRetry<CreateConnectionResponse>('/connections/request', {
      method: 'POST',
      body: JSON.stringify(sanitizedRequest),
    });
  }

  /**
   * Update connection status (accept/decline/block)
   */
  async updateConnectionStatus(request: UpdateConnectionRequest): Promise<UpdateConnectionResponse> {
    const sanitizedRequest = this.validateAndSanitizeInput(request);

    if (!sanitizedRequest.connectionId || !sanitizedRequest.status) {
      throw new ConnectionError('VALIDATION_ERROR', 'Connection ID and status are required');
    }

    return this.fetchWithRetry<UpdateConnectionResponse>(`/connections/${sanitizedRequest.connectionId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: sanitizedRequest.status,
        message: sanitizedRequest.message,
      }),
    });
  }

  /**
   * Remove/unfriend a connection
   */
  async removeConnection(connectionId: string): Promise<{ success: boolean; message?: string }> {
    if (!connectionId) {
      throw new ConnectionError('VALIDATION_ERROR', 'Connection ID is required');
    }

    return this.fetchWithRetry<{ success: boolean; message?: string }>(`/connections/${connectionId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Block a user
   */
  async blockUser(userId: string): Promise<{ success: boolean; message?: string }> {
    if (!userId) {
      throw new ConnectionError('VALIDATION_ERROR', 'User ID is required');
    }

    return this.fetchWithRetry<{ success: boolean; message?: string }>('/connections/block', {
      method: 'POST',
      body: JSON.stringify({ targetUserId: userId }),
    });
  }

  /**
   * Unblock a user
   */
  async unblockUser(userId: string): Promise<{ success: boolean; message?: string }> {
    if (!userId) {
      throw new ConnectionError('VALIDATION_ERROR', 'User ID is required');
    }

    return this.fetchWithRetry<{ success: boolean; message?: string }>(`/connections/unblock/${userId}`, {
      method: 'POST',
    });
  }

  /**
   * Bulk operations for efficiency
   */
  async bulkUpdateConnections(operation: BulkConnectionOperation): Promise<BulkConnectionResponse> {
    if (!operation.connectionIds?.length) {
      throw new ConnectionError('VALIDATION_ERROR', 'Connection IDs are required');
    }

    return this.fetchWithRetry<BulkConnectionResponse>('/connections/bulk', {
      method: 'POST',
      body: JSON.stringify(operation),
    });
  }

  /**
   * Dismiss a connection suggestion
   */
  async dismissSuggestion(suggestionId: string): Promise<{ success: boolean }> {
    if (!suggestionId) {
      throw new ConnectionError('VALIDATION_ERROR', 'Suggestion ID is required');
    }

    return this.fetchWithRetry<{ success: boolean }>(`/connections/suggestions/${suggestionId}/dismiss`, {
      method: 'POST',
    });
  }
}

/**
 * WebSocket utilities for react-use-websocket integration
 * Following official react-use-websocket patterns
 */
export const getConnectionsWebSocketUrl = () => {
  const token = localStorage.getItem('auth_token');
  return token ? `${WEBSOCKET_URL}?token=${token}` : WEBSOCKET_URL;
};

/**
 * WebSocket options following react-use-websocket best practices
 */
export const connectionsWebSocketOptions = {
  shouldReconnect: () => true,
  reconnectAttempts: 10,
  reconnectInterval: (attemptNumber: number) =>
    Math.min(Math.pow(2, attemptNumber) * 1000, 10000), // Exponential backoff, max 10s
  heartbeat: {
    message: 'ping',
    returnMessage: 'pong',
    timeout: 60000, // 1 minute timeout
    interval: 25000, // ping every 25 seconds
  },
  onOpen: () => console.log('Connected to connections WebSocket'),
  onClose: () => console.log('Disconnected from connections WebSocket'),
  onError: (error: Event) => console.error('WebSocket error:', error),
  filter: (message: MessageEvent) => {
    try {
      const data = JSON.parse(message.data);
      // Filter out ping/pong messages
      if (data.type === 'ping' || data.type === 'pong') {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  },
  onMessage: (event: MessageEvent) => {
    try {
      const data: ConnectionWebSocketEvent = JSON.parse(event.data);
      console.log('Connection WebSocket message:', data);
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }
};

/**
 * Custom ConnectionError class for proper error handling
 */
class ConnectionError extends Error {
  public code: string;
  public details?: Record<string, any>;

  constructor(code: string, message: string, details?: Record<string, any>) {
    super(message);
    this.name = 'ConnectionError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Mock data for development and testing
 * Remove in production and replace with real API calls
 */
const mockUsers: User[] = [
  {
    id: 'user1',
    username: 'alex_adventurer',
    name: 'Alex Johnson',
    avatar: '/avatars/alex.jpg',
    bio: 'Solo traveler exploring Southeast Asia',
    location: 'Bangkok, Thailand',
    isOnline: true,
    stats: { trips: 15, connections: 120, posts: 45 },
    preferences: { visibility: 'public', allowConnectionRequests: true }
  },
  {
    id: 'user2',
    username: 'sarah_explorer',
    name: 'Sarah Chen',
    avatar: '/avatars/sarah.jpg',
    bio: 'Digital nomad and photographer',
    location: 'Tokyo, Japan',
    isOnline: false,
    lastSeen: new Date(Date.now() - 1000 * 60 * 30),
    stats: { trips: 8, connections: 89, posts: 23 },
    preferences: { visibility: 'public', allowConnectionRequests: true }
  },
];

/**
 * Export singleton instances
 */
export const connectionsAPI = new ConnectionsAPIClient();

/**
 * Export error class and mock data for testing
 */
export { ConnectionError, mockUsers };

/**
 * Helper functions for common operations
 */
export const connectionHelpers = {
  /**
   * Check if users are already connected
   */
  areUsersConnected(connections: Connection[], userId1: string, userId2: string): boolean {
    return connections.some(conn =>
      (conn.userId === userId1 && conn.connectedUserId === userId2 && conn.status === ConnectionStatus.ACCEPTED) ||
      (conn.userId === userId2 && conn.connectedUserId === userId1 && conn.status === ConnectionStatus.ACCEPTED)
    );
  },

  /**
   * Get connection status between two users
   */
  getConnectionStatus(connections: Connection[], userId1: string, userId2: string): ConnectionStatus | null {
    const connection = connections.find(conn =>
      (conn.userId === userId1 && conn.connectedUserId === userId2) ||
      (conn.userId === userId2 && conn.connectedUserId === userId1)
    );
    return connection?.status || null;
  },

  /**
   * Calculate mutual connections count
   */
  calculateMutualConnections(userConnections: string[], targetUserConnections: string[]): number {
    return userConnections.filter(id => targetUserConnections.includes(id)).length;
  },

  /**
   * Format connection status for display
   */
  formatConnectionStatus(status: ConnectionStatus): string {
    const statusMap = {
      [ConnectionStatus.PENDING]: 'Pending',
      [ConnectionStatus.ACCEPTED]: 'Connected',
      [ConnectionStatus.BLOCKED]: 'Blocked',
      [ConnectionStatus.DECLINED]: 'Declined'
    };
    return statusMap[status] || 'Unknown';
  },

  /**
   * Validate user input for security
   */
  validateUserInput(input: string, maxLength: number = 500): boolean {
    if (!input || input.trim().length === 0) return false;
    if (input.length > maxLength) return false;

    // Check for potentially malicious content
    const maliciousPatterns = [/<script/i, /javascript:/i, /on\w+=/i];
    return !maliciousPatterns.some(pattern => pattern.test(input));
  }
};