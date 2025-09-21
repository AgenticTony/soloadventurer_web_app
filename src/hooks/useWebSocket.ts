// WebSocket Hooks - React Integration
// Sprint 3: WebSocket React Hooks with Official Best Practices

'use client';

import { useEffect, useCallback, useMemo, useRef } from 'react';
import useWebSocketLib, { ReadyState } from 'react-use-websocket';
import { useWebSocketContext } from '@/contexts/WebSocketContext';
import { WebSocketMessage } from '@/lib/websocket/wsClient';
import { useAuth } from '@/contexts/AuthContext';

/**
 * WebSocket hooks based on official documentation patterns:
 * - React-use-websocket for React integration
 * - Socket.IO for connection state management
 * - Pusher.js for event subscription patterns
 * - AWS IoT SDK for auth and reconnection
 */

export interface UseWebSocketOptions {
  /** Auto-connect when hook mounts (default: true) */
  autoConnect?: boolean;
  /** Event types to subscribe to */
  eventTypes?: string[];
  /** Enable debug logging */
  debug?: boolean;
  /** Custom message filter */
  filter?: (message: WebSocketMessage) => boolean;
  /** Callback for connection state changes */
  onStateChange?: (connected: boolean) => void;
  /** Callback for messages */
  onMessage?: (message: WebSocketMessage) => void;
  /** Callback for connection errors */
  onError?: (error: string) => void;
}

export interface UseWebSocketReturn {
  // Connection State
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
  connectionError: string | null;
  readyState: ReadyState;

  // Message Handling
  sendMessage: (message: Omit<WebSocketMessage, 'id' | 'timestamp'>) => Promise<boolean>;
  lastMessage: WebSocketMessage | null;

  // Connection Management
  connect: () => Promise<void>;
  disconnect: () => void;
  reconnect: () => Promise<void>;

  // Queue Management
  queuedMessageCount: number;
  clearMessageQueue: () => Promise<void>;

  // Event Subscription
  subscribe: (eventType: string, handler: (message: WebSocketMessage) => void) => void;
  unsubscribe: (eventType: string, handler?: (message: WebSocketMessage) => void) => void;
}

/**
 * Main WebSocket hook
 * Combines context state with React-use-websocket patterns
 */
export const useWebSocket = (options: UseWebSocketOptions = {}): UseWebSocketReturn => {
  const {
    autoConnect = true,
    eventTypes = [],
    debug = false,
    filter,
    onStateChange,
    onMessage,
    onError,
  } = options;

  const context = useWebSocketContext();
  const handlersRef = useRef(new Map<string, (message: WebSocketMessage) => void>());

  // Convert connection state to ReadyState (react-use-websocket compatibility)
  const readyState = useMemo((): ReadyState => {
    if (context.isConnecting) return ReadyState.CONNECTING;
    if (context.isConnected) return ReadyState.OPEN;
    if (context.connectionError) return ReadyState.CLOSED;
    return ReadyState.UNINSTANTIATED;
  }, [context.isConnecting, context.isConnected, context.connectionError]);

  /**
   * Enhanced send message with filtering
   */
  const sendMessage = useCallback(async (message: Omit<WebSocketMessage, 'id' | 'timestamp'>): Promise<boolean> => {
    if (filter && !filter(message as WebSocketMessage)) {
      log('Message filtered out:', message);
      return false;
    }

    return await context.sendMessage(message);
  }, [context.sendMessage, filter]);

  /**
   * Auto-subscribe to event types
   */
  useEffect(() => {
    if (eventTypes.length === 0) return;

    const handlers = new Map<string, (message: WebSocketMessage) => void>();

    eventTypes.forEach(eventType => {
      const handler = (message: WebSocketMessage) => {
        log(`Received ${eventType}:`, message);
        onMessage?.(message);
      };

      handlers.set(eventType, handler);
      handlersRef.current.set(eventType, handler);
      context.subscribe(eventType, handler);
    });

    return () => {
      handlers.forEach((handler, eventType) => {
        context.unsubscribe(eventType, handler);
        handlersRef.current.delete(eventType);
      });
    };
  }, [eventTypes, context.subscribe, context.unsubscribe, onMessage]);

  /**
   * Connection state change notifications
   */
  useEffect(() => {
    onStateChange?.(context.isConnected);
  }, [context.isConnected, onStateChange]);

  /**
   * Error notifications
   */
  useEffect(() => {
    if (context.connectionError) {
      onError?.(context.connectionError);
    }
  }, [context.connectionError, onError]);

  /**
   * Auto-connect on mount
   */
  useEffect(() => {
    if (autoConnect && !context.isConnected && !context.isConnecting) {
      log('Auto-connecting WebSocket');
      context.connect().catch(error => {
        log('Auto-connect failed:', error);
      });
    }
  }, [autoConnect, context.isConnected, context.isConnecting, context.connect]);

  /**
   * Debug logging
   */
  const log = (...args: any[]) => {
    if (debug) {
      console.log('[useWebSocket]', ...args);
    }
  };

  return {
    // Connection State
    isConnected: context.isConnected,
    isConnecting: context.isConnecting,
    isReconnecting: context.isReconnecting,
    connectionError: context.connectionError,
    readyState,

    // Message Handling
    sendMessage,
    lastMessage: context.lastMessage,

    // Connection Management
    connect: context.connect,
    disconnect: context.disconnect,
    reconnect: context.reconnect,

    // Queue Management
    queuedMessageCount: context.queuedMessageCount,
    clearMessageQueue: context.clearMessageQueue,

    // Event Subscription
    subscribe: context.subscribe,
    unsubscribe: context.unsubscribe,
  };
};

/**
 * Hook for connection status indicator
 * Based on Socket.IO connection state patterns
 */
export interface UseConnectionStatusReturn {
  isOnline: boolean;
  isConnected: boolean;
  isReconnecting: boolean;
  connectionStatus: 'online' | 'offline' | 'connecting' | 'reconnecting';
  statusColor: 'green' | 'red' | 'yellow' | 'blue';
  statusText: string;
}

export const useConnectionStatus = (): UseConnectionStatusReturn => {
  const { isConnected, isConnecting, isReconnecting, connectionError } = useWebSocketContext();

  return useMemo(() => {
    let status: UseConnectionStatusReturn['connectionStatus'];
    let color: UseConnectionStatusReturn['statusColor'];
    let text: string;

    if (isReconnecting) {
      status = 'reconnecting';
      color = 'blue';
      text = 'Reconnecting...';
    } else if (isConnecting) {
      status = 'connecting';
      color = 'yellow';
      text = 'Connecting...';
    } else if (isConnected) {
      status = 'online';
      color = 'green';
      text = 'Connected';
    } else {
      status = 'offline';
      color = 'red';
      text = connectionError || 'Disconnected';
    }

    return {
      isOnline: isConnected,
      isConnected,
      isReconnecting,
      connectionStatus: status,
      statusColor: color,
      statusText: text,
    };
  }, [isConnected, isConnecting, isReconnecting, connectionError]);
};

/**
 * Hook for event subscription
 * Based on Pusher.js event handling patterns
 */
export const useWebSocketEvent = <T = any>(
  eventType: string,
  handler: (data: T, message: WebSocketMessage) => void,
  deps: React.DependencyList = []
): void => {
  const { subscribe, unsubscribe } = useWebSocketContext();

  useEffect(() => {
    const wrappedHandler = (message: WebSocketMessage) => {
      handler(message.data, message);
    };

    subscribe(eventType, wrappedHandler);

    return () => {
      unsubscribe(eventType, wrappedHandler);
    };
  }, [eventType, subscribe, unsubscribe, ...deps]);
};

/**
 * Hook for sending messages with queue management
 * Based on Socket.IO message queueing patterns
 */
export interface UseSendMessageOptions {
  /** Queue messages when offline (default: true) */
  queueWhenOffline?: boolean;
  /** Show queue status */
  showQueueStatus?: boolean;
  /** Auto-retry failed messages */
  autoRetry?: boolean;
}

export interface UseSendMessageReturn {
  sendMessage: (message: Omit<WebSocketMessage, 'id' | 'timestamp'>) => Promise<boolean>;
  isConnected: boolean;
  queuedCount: number;
  clearQueue: () => void;
}

export const useSendMessage = (options: UseSendMessageOptions = {}): UseSendMessageReturn => {
  const { queueWhenOffline = true, autoRetry = false } = options;
  const { sendMessage: contextSendMessage, isConnected, queuedMessageCount, clearMessageQueue } = useWebSocketContext();

  const sendMessage = useCallback(async (message: Omit<WebSocketMessage, 'id' | 'timestamp'>): Promise<boolean> => {
    const success = await contextSendMessage(message);

    // Auto-retry logic
    if (!success && autoRetry && isConnected) {
      // Retry after a short delay
      setTimeout(() => {
        contextSendMessage(message);
      }, 1000);
    }

    return success;
  }, [contextSendMessage, isConnected, autoRetry]);

  return {
    sendMessage,
    isConnected,
    queuedCount: queuedMessageCount,
    clearQueue: clearMessageQueue,
  };
};

/**
 * Hook for wave-specific WebSocket events
 * Application-specific hook for wave functionality
 */
export const useWaveWebSocket = () => {
  const { user } = useAuth();

  const {
    isConnected,
    isConnecting,
    sendMessage,
    lastMessage,
    subscribe,
    unsubscribe
  } = useWebSocket({
    eventTypes: ['wave_received', 'wave_accepted', 'wave_declined', 'wave_matched'],
    debug: process.env.NODE_ENV === 'development',
  });

  /**
   * Send wave notification
   */
  const sendWaveNotification = useCallback((toUserId: string, waveId: string, type: 'sent' | 'accepted' | 'declined') => {
    if (!user) return false;

    return sendMessage({
      type: `wave_${type}`,
      data: {
        waveId,
        fromUserId: user.id,
        toUserId,
        timestamp: new Date().toISOString(),
      },
      userId: user.id,
    });
  }, [sendMessage, user]);

  /**
   * Subscribe to wave events for specific user
   */
  const subscribeToWaveEvents = useCallback((
    onWaveReceived?: (data: any) => void,
    onWaveAccepted?: (data: any) => void,
    onWaveDeclined?: (data: any) => void,
    onWaveMatched?: (data: any) => void
  ) => {
    const handlers: Array<[string, (message: WebSocketMessage) => void]> = [];

    if (onWaveReceived) {
      const handler = (message: WebSocketMessage) => onWaveReceived(message.data);
      handlers.push(['wave_received', handler]);
      subscribe('wave_received', handler);
    }

    if (onWaveAccepted) {
      const handler = (message: WebSocketMessage) => onWaveAccepted(message.data);
      handlers.push(['wave_accepted', handler]);
      subscribe('wave_accepted', handler);
    }

    if (onWaveDeclined) {
      const handler = (message: WebSocketMessage) => onWaveDeclined(message.data);
      handlers.push(['wave_declined', handler]);
      subscribe('wave_declined', handler);
    }

    if (onWaveMatched) {
      const handler = (message: WebSocketMessage) => onWaveMatched(message.data);
      handlers.push(['wave_matched', handler]);
      subscribe('wave_matched', handler);
    }

    // Return cleanup function
    return () => {
      handlers.forEach(([eventType, handler]) => {
        unsubscribe(eventType, handler);
      });
    };
  }, [subscribe, unsubscribe]);

  return {
    isConnected,
    isConnecting,
    lastMessage,
    sendWaveNotification,
    subscribeToWaveEvents,
  };
};

// Export ReadyState for compatibility
export { ReadyState } from 'react-use-websocket';