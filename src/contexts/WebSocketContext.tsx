// WebSocket Context - Global Connection Management
// Sprint 3: WebSocket State Management with Official Best Practices

'use client';

import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { wsClient, WebSocketState, WebSocketMessage, AuthToken } from '@/lib/websocket/wsClient';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

/**
 * WebSocket Context based on official patterns:
 * - Socket.IO connection state management
 * - Pusher.js event subscription patterns
 * - AWS IoT SDK auth token management
 * - React patterns for context and state management
 */

export interface WebSocketContextState {
  // Connection State
  connectionState: WebSocketState;
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
  connectionError: string | null;

  // Message Queue
  queuedMessageCount: number;
  lastMessage: WebSocketMessage | null;

  // Connection Info
  connectionId: string | null;
  lastConnectedAt: Date | null;
  reconnectAttempts: number;
}

export interface WebSocketContextActions {
  // Connection Management
  connect: () => Promise<void>;
  disconnect: () => void;
  reconnect: () => Promise<void>;

  // Message Handling
  sendMessage: (message: Omit<WebSocketMessage, 'id' | 'timestamp'>) => Promise<boolean>;
  clearMessageQueue: () => Promise<void>;

  // Event Subscription
  subscribe: (eventType: string, handler: (message: WebSocketMessage) => void) => void;
  unsubscribe: (eventType: string, handler?: (message: WebSocketMessage) => void) => void;

  // Auth Management
  updateAuthToken: (token: AuthToken) => void;
}

export interface WebSocketContextValue extends WebSocketContextState, WebSocketContextActions {}

// Context State Management with useReducer (React best practices)
interface ContextState extends WebSocketContextState {}

type ContextAction =
  | { type: 'SET_CONNECTION_STATE'; payload: WebSocketState }
  | { type: 'SET_LAST_MESSAGE'; payload: WebSocketMessage }
  | { type: 'SET_QUEUED_COUNT'; payload: number }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET' };

const initialState: ContextState = {
  connectionState: {
    connected: false,
    connecting: false,
    error: null,
    reconnectAttempts: 0,
    lastConnected: null,
    connectionId: null,
  },
  isConnected: false,
  isConnecting: false,
  isReconnecting: false,
  connectionError: null,
  queuedMessageCount: 0,
  lastMessage: null,
  connectionId: null,
  lastConnectedAt: null,
  reconnectAttempts: 0,
};

/**
 * Context state reducer
 * Based on React useReducer patterns for complex state management
 */
function contextReducer(state: ContextState, action: ContextAction): ContextState {
  switch (action.type) {
    case 'SET_CONNECTION_STATE': {
      const connectionState = action.payload;
      return {
        ...state,
        connectionState,
        isConnected: connectionState.connected,
        isConnecting: connectionState.connecting,
        isReconnecting: connectionState.reconnectAttempts > 0 && connectionState.connecting,
        connectionError: connectionState.error,
        connectionId: connectionState.connectionId,
        lastConnectedAt: connectionState.lastConnected,
        reconnectAttempts: connectionState.reconnectAttempts,
      };
    }

    case 'SET_LAST_MESSAGE':
      return {
        ...state,
        lastMessage: action.payload,
      };

    case 'SET_QUEUED_COUNT':
      return {
        ...state,
        queuedMessageCount: action.payload,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        connectionError: null,
      };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

// Create context
const WebSocketContext = createContext<WebSocketContextValue | null>(null);

/**
 * WebSocket Provider Component
 * Implements global connection management based on Socket.IO patterns
 */
interface WebSocketProviderProps {
  children: React.ReactNode;
  /** Auto-connect on mount (default: true) */
  autoConnect?: boolean;
  /** Auto-reconnect on auth changes (default: true) */
  autoReconnectOnAuth?: boolean;
  /** Debug mode (default: development env) */
  debug?: boolean;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
  autoConnect = true,
  autoReconnectOnAuth = true,
  debug = process.env.NODE_ENV === 'development',
}) => {
  const [state, dispatch] = useReducer(contextReducer, initialState);
  const { user, isAuthenticated } = useAuth();

  // Event handlers storage (stable references)
  const eventHandlersRef = React.useRef(new Map<string, Set<(message: WebSocketMessage) => void>>());

  /**
   * Connection management
   * Based on AWS IoT SDK connection patterns
   */
  const connect = useCallback(async (): Promise<void> => {
    if (!isAuthenticated || !user) {
      log('Cannot connect: user not authenticated');
      return;
    }

    try {
      // Fetch current auth session for tokens
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        log('No access token available');
        return;
      }

      // Update auth token before connecting
      const authToken: AuthToken = {
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        expiresAt: session.expires_at ? session.expires_at * 1000 : Date.now() + 3600000,
        userId: user.id,
      };

      wsClient.updateAuthToken(authToken);
      await wsClient.connect();
      log('WebSocket connected successfully');
    } catch (error) {
      log('Failed to connect WebSocket:', error);
      throw error;
    }
  }, [isAuthenticated, user]);

  const disconnect = useCallback((): void => {
    log('Disconnecting WebSocket');
    wsClient.disconnect();
  }, []);

  const reconnect = useCallback(async (): Promise<void> => {
    log('Reconnecting WebSocket');
    disconnect();
    await connect();
  }, [connect, disconnect]);

  /**
   * Message handling
   * Based on Socket.IO message patterns
   */
  const sendMessage = useCallback(async (message: Omit<WebSocketMessage, 'id' | 'timestamp'>): Promise<boolean> => {
    const success = await wsClient.send(message);
    if (!success) {
      // Update queued count
      const count = await wsClient.getQueuedMessageCount();
      dispatch({ type: 'SET_QUEUED_COUNT', payload: count });
    }
    return success;
  }, []);

  const clearMessageQueue = useCallback(async (): Promise<void> => {
    await wsClient.clearMessageQueue();
    dispatch({ type: 'SET_QUEUED_COUNT', payload: 0 });
  }, []);

  /**
   * Event subscription management
   * Based on Pusher.js subscription patterns
   */
  const subscribe = useCallback((eventType: string, handler: (message: WebSocketMessage) => void): void => {
    // Store handler reference for cleanup
    if (!eventHandlersRef.current.has(eventType)) {
      eventHandlersRef.current.set(eventType, new Set());
    }
    eventHandlersRef.current.get(eventType)!.add(handler);

    // Subscribe to WebSocket client
    wsClient.on(eventType, handler);
    log(`Subscribed to event: ${eventType}`);
  }, []);

  const unsubscribe = useCallback((eventType: string, handler?: (message: WebSocketMessage) => void): void => {
    const handlers = eventHandlersRef.current.get(eventType);
    if (handlers && handler) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        eventHandlersRef.current.delete(eventType);
      }
    } else {
      eventHandlersRef.current.delete(eventType);
    }

    wsClient.off(eventType, handler);
    log(`Unsubscribed from event: ${eventType}`);
  }, []);

  /**
   * Auth token management
   * Based on AWS IoT SDK credential update patterns
   */
  const updateAuthToken = useCallback((token: AuthToken): void => {
    wsClient.updateAuthToken(token);
    log('Auth token updated in WebSocket client');
  }, []);

  /**
   * Setup WebSocket state monitoring
   * Based on Socket.IO connection state patterns
   */
  useEffect(() => {
    const handleStateChange = (connectionState: WebSocketState) => {
      dispatch({ type: 'SET_CONNECTION_STATE', payload: connectionState });

      // Update queued message count
      wsClient.getQueuedMessageCount().then(queuedCount => {
        dispatch({ type: 'SET_QUEUED_COUNT', payload: queuedCount });
      });
    };

    // Subscribe to state changes
    wsClient.onStateChange(handleStateChange);

    // Set initial state
    handleStateChange(wsClient.getState());

    return () => {
      wsClient.offStateChange(handleStateChange);
    };
  }, []);

  /**
   * Setup global message handler for last message tracking
   */
  useEffect(() => {
    const handleGlobalMessage = (message: WebSocketMessage) => {
      dispatch({ type: 'SET_LAST_MESSAGE', payload: message });
    };

    // Subscribe to all messages using wildcard pattern
    const messageTypes = ['wave_received', 'wave_accepted', 'wave_declined', 'message_received', 'user_online', 'user_offline'];
    messageTypes.forEach(type => {
      wsClient.on(type, handleGlobalMessage);
    });

    return () => {
      messageTypes.forEach(type => {
        wsClient.off(type, handleGlobalMessage);
      });
    };
  }, []);

  /**
   * Auto-connect on authentication
   * Based on Socket.IO auto-connection patterns
   */
  useEffect(() => {
    if (autoConnect && isAuthenticated && user && !state.isConnected && !state.isConnecting) {
      log('Auto-connecting WebSocket on authentication');
      connect().catch(error => {
        log('Auto-connect failed:', error);
      });
    }
  }, [autoConnect, isAuthenticated, user, state.isConnected, state.isConnecting, connect]);

  /**
   * Auto-reconnect on auth changes
   * Based on AWS IoT SDK token refresh patterns
   */
  useEffect(() => {
    if (autoReconnectOnAuth && state.isConnected && user) {
      log('Updating WebSocket auth token on user change');
      // Fetch fresh tokens and update
      const supabase = createClient();
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.access_token) {
          const authToken: AuthToken = {
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
            expiresAt: session.expires_at ? session.expires_at * 1000 : Date.now() + 3600000,
            userId: user.id,
          };
          updateAuthToken(authToken);
        }
      }).catch(error => {
        log('Failed to update auth token:', error);
      });
    }
  }, [autoReconnectOnAuth, state.isConnected, user, updateAuthToken]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      log('WebSocket context unmounting, cleaning up');

      // Unsubscribe all event handlers
      eventHandlersRef.current.forEach((handlers, eventType) => {
        handlers.forEach(handler => {
          wsClient.off(eventType, handler);
        });
      });
      eventHandlersRef.current.clear();

      // Disconnect if still connected
      if (state.isConnected) {
        wsClient.disconnect();
      }
    };
  }, [state.isConnected]);

  // Context value
  const contextValue: WebSocketContextValue = {
    // State
    ...state,

    // Actions
    connect,
    disconnect,
    reconnect,
    sendMessage,
    clearMessageQueue,
    subscribe,
    unsubscribe,
    updateAuthToken,
  };

  /**
   * Debug logging
   */
  const log = (...args: any[]) => {
    if (debug) {
      console.log('[WebSocketContext]', ...args);
    }
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

/**
 * Hook to use WebSocket context
 * Throws error if used outside provider (React best practices)
 */
export const useWebSocketContext = (): WebSocketContextValue => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};

// Export for testing
export { WebSocketContext };