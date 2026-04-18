// Connection Types - Friend Connection Management System
// Sprint 3: TypeScript interfaces following official best practices

/**
 * Connection state enum following official WebSocket patterns
 * Based on documented state machine patterns for friend connections
 */
export enum ConnectionStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  BLOCKED = 'blocked',
  DECLINED = 'declined'
}

/**
 * Connection request direction for proper state management
 */
export enum RequestDirection {
  INCOMING = 'incoming', // Request received from another user
  OUTGOING = 'outgoing'  // Request sent to another user
}

/**
 * User interface for connection system
 * Following React patterns for user data structures
 */
export interface User {
  id: string;
  username: string;
  name: string;
  avatar?: string;
  bio?: string;
  location?: string;
  isOnline: boolean;
  lastSeen?: Date;
  stats: {
    trips: number;
    connections: number;
    posts: number;
  };
  preferences: {
    visibility: 'public' | 'friends' | 'private';
    allowConnectionRequests: boolean;
  };
}

/**
 * Core Connection interface
 * Following official patterns for entity relationships
 */
export interface Connection {
  id: string;
  userId: string; // Current user's ID
  connectedUserId: string; // Other user's ID
  status: ConnectionStatus;
  direction: RequestDirection;
  requestedAt: Date;
  respondedAt?: Date;
  mutualConnections: number; // Count of mutual friends
  connectionSource?: 'suggestion' | 'search' | 'mutual_friend' | 'trip' | 'group';
  metadata?: {
    requestMessage?: string;
    connectionStrength?: number; // Algorithm-based connection relevance
    interactionHistory?: {
      messages: number;
      tripsTogether: number;
      mutualGroups: number;
    };
  };
}

/**
 * Connection with populated user data
 * For UI components that need full user information
 */
export interface ConnectionWithUser extends Connection {
  user: User; // The connected user's full data
}

/**
 * Friend suggestion interface
 * Based on algorithm recommendations
 */
export interface ConnectionSuggestion {
  id: string;
  suggestedUser: User;
  reason: 'mutual_friends' | 'shared_interests' | 'location_proximity' | 'trip_similarity';
  confidence: number; // 0-1 score from algorithm
  mutualConnections: User[]; // Up to 3 mutual friends to display
  sharedInterests?: string[];
  metadata: {
    lastUpdated: Date;
    dismissed?: boolean;
    viewCount: number;
  };
}

/**
 * Connection activity for activity feed
 * Real-time updates and notifications
 */
export interface ConnectionActivity {
  id: string;
  type: 'request_sent' | 'request_received' | 'connection_accepted' | 'connection_removed';
  userId: string;
  targetUserId: string;
  timestamp: Date;
  read: boolean;
  metadata?: {
    requestMessage?: string;
    mutualConnectionsCount?: number;
  };
}

/**
 * Connection statistics for user profile
 */
export interface ConnectionStats {
  totalConnections: number;
  pendingIncoming: number;
  pendingOutgoing: number;
  mutualConnections: number;
  recentConnections: ConnectionWithUser[]; // Last 5 connections
  connectionGrowth: {
    thisWeek: number;
    thisMonth: number;
    percentage: number; // Growth percentage
  };
}

/**
 * API Request/Response types following REST patterns
 */

// Create connection request
export interface CreateConnectionRequest {
  targetUserId: string;
  message?: string; // Optional request message
}

export interface CreateConnectionResponse {
  connection: Connection;
  success: boolean;
  message?: string;
}

// Update connection status
export interface UpdateConnectionRequest {
  connectionId: string;
  status: ConnectionStatus;
  message?: string; // Optional response message
}

export interface UpdateConnectionResponse {
  connection: Connection;
  success: boolean;
  message?: string;
}

// Search connections
export interface SearchConnectionsRequest {
  query: string;
  limit?: number;
  offset?: number;
  filters?: {
    status?: ConnectionStatus[];
    onlineOnly?: boolean;
    location?: string;
    mutualConnectionsMin?: number;
  };
}

export interface SearchConnectionsResponse {
  connections: ConnectionWithUser[];
  total: number;
  hasMore: boolean;
  suggestions?: ConnectionSuggestion[];
}

// Bulk operations for optimistic updates
export interface BulkConnectionOperation {
  operation: 'accept' | 'decline' | 'block' | 'remove';
  connectionIds: string[];
}

export interface BulkConnectionResponse {
  successful: string[]; // Connection IDs that succeeded
  failed: Array<{
    connectionId: string;
    error: string;
  }>;
  totalProcessed: number;
}

/**
 * WebSocket event types for real-time updates
 * Following documented WebSocket message patterns
 */
export interface ConnectionWebSocketEvent {
  type: 'connection_request' | 'connection_accepted' | 'connection_declined' | 'connection_removed' | 'user_online' | 'user_offline' | 'connection_status';
  userId: string;
  data: {
    connection?: Connection;
    user?: User;
    message?: string;
    timestamp: Date;
  };
}

/**
 * React Hook return types for type safety
 */
export interface UseConnectionsReturn {
  connections: ConnectionWithUser[];
  suggestions: ConnectionSuggestion[];
  stats: ConnectionStats;
  isLoading: boolean;
  error: string | null;

  // Actions with optimistic updates
  sendConnectionRequest: (targetUserId: string, message?: string) => Promise<void>;
  acceptConnection: (connectionId: string) => Promise<void>;
  declineConnection: (connectionId: string) => Promise<void>;
  removeConnection: (connectionId: string) => Promise<void>;
  blockUser: (userId: string) => Promise<void>;
  unblockUser: (userId: string) => Promise<void>;

  // Utility functions
  refetch: () => Promise<void>;
  searchConnections: (query: string) => Promise<ConnectionWithUser[]>;
  dismissSuggestion: (suggestionId: string) => void;
}

/**
 * Component prop interfaces
 */
export interface ConnectionListProps {
  connections: ConnectionWithUser[];
  onConnectionUpdate: (connectionId: string, status: ConnectionStatus) => void;
  onUserClick: (userId: string) => void;
  isLoading?: boolean;
  error?: string | null;
  emptyState?: {
    title: string;
    description: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
}

export interface ConnectionCardProps {
  connection: ConnectionWithUser;
  onAccept: (connectionId: string) => void;
  onDecline: (connectionId: string) => void;
  onRemove: (connectionId: string) => void;
  onBlock: (userId: string) => void;
  onUserClick: (userId: string) => void;
  showActions?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
}

export interface SuggestionCardProps {
  suggestion: ConnectionSuggestion;
  onSendRequest: (userId: string, message?: string) => void;
  onDismiss: (suggestionId: string) => void;
  onUserClick: (userId: string) => void;
}

/**
 * Optimistic update context types
 * Following React useOptimistic patterns
 */
export interface OptimisticConnection extends Connection {
  isOptimistic?: boolean;
  optimisticOperation?: 'sending_request' | 'accepting' | 'declining' | 'removing';
}

export interface ConnectionOptimisticState {
  connections: OptimisticConnection[];
  pendingOperations: Map<string, 'pending' | 'success' | 'error'>;
}

/**
 * Error types for proper error handling
 */
export interface ConnectionError {
  code: 'ALREADY_CONNECTED' | 'USER_NOT_FOUND' | 'REQUEST_BLOCKED' | 'RATE_LIMITED' | 'NETWORK_ERROR' | 'VALIDATION_ERROR';
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Input validation schemas (Zod-like structure)
 */
export interface ConnectionValidationRules {
  targetUserId: {
    required: true;
    minLength: 1;
    maxLength: 50;
    pattern: string; // RegExp pattern as string: '^[a-zA-Z0-9_-]+$'
  };
  message: {
    required: false;
    minLength: 0;
    maxLength: 500;
    sanitize: true;
  };
}

/**
 * Cache and state management types
 */
export interface ConnectionCache {
  connections: Map<string, ConnectionWithUser>;
  suggestions: Map<string, ConnectionSuggestion>;
  lastFetched: Date;
  invalidatedAt?: Date;
}

export interface ConnectionState {
  connections: ConnectionWithUser[];
  suggestions: ConnectionSuggestion[];
  stats: ConnectionStats;
  isLoading: boolean;
  error: string | null;
  cache: ConnectionCache;
  optimisticOperations: Map<string, OptimisticConnection>;
  websocketStatus: 'connecting' | 'connected' | 'disconnected';
  retryCount: number;
  lastError?: ConnectionError;
  lastFetched: Date;
}