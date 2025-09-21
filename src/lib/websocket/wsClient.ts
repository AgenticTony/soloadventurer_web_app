// WebSocket Client - JWT Auth & Auto-Reconnection
// Sprint 3: WebSocket Connection Management with Official Best Practices

/**
 * Enterprise-grade WebSocket client based on official documentation patterns:
 * - Pusher.js connection management and auth patterns
 * - AWS IoT SDK auto-reconnection and token handling
 * - React-use-websocket hooks integration
 * - Socket.IO offline handling and state recovery
 */

export interface WebSocketMessage {
  id: string;
  type: string;
  data: any;
  timestamp: string;
  userId?: string;
}

export interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  userId: string;
}

export interface ConnectionOptions {
  /** JWT auth token for WebSocket connection */
  authToken?: AuthToken;
  /** Custom WebSocket URL override */
  url?: string;
  /** Additional query parameters */
  queryParams?: Record<string, string>;
  /** Custom headers for auth */
  headers?: Record<string, string>;
  /** Enable debug logging */
  debug?: boolean;
  /** Heartbeat interval in ms */
  heartbeatInterval?: number;
  /** Max reconnection attempts */
  maxReconnectAttempts?: number;
  /** Initial reconnection delay in ms */
  baseReconnectDelay?: number;
  /** Max reconnection delay in ms */
  maxReconnectDelay?: number;
  /** Enable persistent message queue */
  enableMessageQueue?: boolean;
  /** Message queue options */
  messageQueueOptions?: any;
}

export interface WebSocketState {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  reconnectAttempts: number;
  lastConnected: Date | null;
  connectionId: string | null;
}

export type WebSocketEventHandler = (message: WebSocketMessage) => void;
export type ConnectionStateHandler = (state: WebSocketState) => void;

/**
 * WebSocket Client Class
 * Implements official patterns from Pusher.js, AWS IoT SDK, and Socket.IO
 */
export class WebSocketClient {
  private ws: WebSocket | null = null;
  private state: WebSocketState = {
    connected: false,
    connecting: false,
    error: null,
    reconnectAttempts: 0,
    lastConnected: null,
    connectionId: null,
  };

  private options: Required<ConnectionOptions>;
  private eventHandlers = new Map<string, Set<WebSocketEventHandler>>();
  private stateHandlers = new Set<ConnectionStateHandler>();
  private inMemoryQueue: WebSocketMessage[] = [];
  private persistentQueue: any = null; // MessageQueue instance
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private lastHeartbeat: number = 0;

  // Default configuration based on official documentation
  private static readonly DEFAULT_OPTIONS: Required<ConnectionOptions> = {
    authToken: undefined as any,
    url: process.env.NEXT_PUBLIC_WS_URL || 'wss://api.soloadventurer.com/ws',
    queryParams: {},
    headers: {},
    debug: process.env.NODE_ENV === 'development',
    heartbeatInterval: 30000, // 30 seconds (Pusher.js default)
    maxReconnectAttempts: 10, // AWS IoT SDK pattern
    baseReconnectDelay: 1000, // 1 second initial delay
    maxReconnectDelay: 10000, // 10 seconds max (Socket.IO pattern)
    enableMessageQueue: true, // Enable persistent queue by default
    messageQueueOptions: {},
  };

  constructor(options: ConnectionOptions = {}) {
    this.options = { ...WebSocketClient.DEFAULT_OPTIONS, ...options };
    this.log('WebSocket client initialized', this.options);

    // Initialize persistent message queue if enabled
    if (this.options.enableMessageQueue && typeof window !== 'undefined') {
      this.initializeMessageQueue();
    }
  }

  /**
   * Initialize persistent message queue
   */
  private async initializeMessageQueue(): Promise<void> {
    try {
      const { MessageQueue } = await import('./messageQueue');
      this.persistentQueue = new MessageQueue(this.options.messageQueueOptions);
      this.log('Persistent message queue initialized');
    } catch (error) {
      this.log('Failed to initialize persistent queue, using in-memory fallback:', error);
    }
  }

  /**
   * Connect to WebSocket server with JWT authentication
   * Based on AWS IoT SDK connection patterns
   */
  async connect(): Promise<void> {
    if (this.state.connecting || this.state.connected) {
      this.log('Connection already in progress or established');
      return;
    }

    this.updateState({ connecting: true, error: null });

    try {
      const wsUrl = this.buildWebSocketUrl();
      this.log('Connecting to WebSocket:', wsUrl);

      this.ws = new WebSocket(wsUrl);
      this.setupWebSocketHandlers();

      // Connection timeout based on AWS IoT patterns
      const connectionTimeout = setTimeout(() => {
        if (!this.state.connected) {
          this.handleConnectionError(new Error('Connection timeout'));
        }
      }, 10000);

      // Wait for connection to complete
      await new Promise<void>((resolve, reject) => {
        const onOpen = () => {
          clearTimeout(connectionTimeout);
          resolve();
        };
        const onError = (error: Event) => {
          clearTimeout(connectionTimeout);
          reject(new Error('WebSocket connection failed'));
        };

        this.ws!.addEventListener('open', onOpen, { once: true });
        this.ws!.addEventListener('error', onError, { once: true });
      });

    } catch (error) {
      this.handleConnectionError(error as Error);
      throw error;
    }
  }

  /**
   * Disconnect from WebSocket server
   * Based on Socket.IO disconnect patterns
   */
  disconnect(): void {
    this.log('Disconnecting WebSocket');

    // Clear timers
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    // Close WebSocket connection
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    this.updateState({
      connected: false,
      connecting: false,
      reconnectAttempts: 0,
      connectionId: null,
    });
  }

  /**
   * Send message to WebSocket server
   * Implements offline queuing based on Socket.IO patterns
   */
  async send(message: Omit<WebSocketMessage, 'id' | 'timestamp'>, priority: number = 1): Promise<boolean> {
    const fullMessage: WebSocketMessage = {
      id: this.generateMessageId(),
      timestamp: new Date().toISOString(),
      ...message,
    };

    if (!this.state.connected || !this.ws) {
      // Queue message for offline delivery
      await this.queueMessage(fullMessage, priority);
      this.log('Message queued for offline delivery:', fullMessage);
      return false;
    }

    try {
      this.ws.send(JSON.stringify(fullMessage));
      this.log('Message sent:', fullMessage);
      return true;
    } catch (error) {
      this.log('Failed to send message:', error);
      await this.queueMessage(fullMessage, priority);
      return false;
    }
  }

  /**
   * Queue message for offline delivery
   */
  private async queueMessage(message: WebSocketMessage, priority: number = 1): Promise<void> {
    if (this.persistentQueue) {
      try {
        await this.persistentQueue.enqueue(message, priority);
      } catch (error) {
        this.log('Failed to queue in persistent storage, using in-memory:', error);
        this.inMemoryQueue.push(message);
      }
    } else {
      this.inMemoryQueue.push(message);
    }
  }

  /**
   * Subscribe to events
   * Based on Pusher.js event subscription patterns
   */
  on(eventType: string, handler: WebSocketEventHandler): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }
    this.eventHandlers.get(eventType)!.add(handler);
    this.log(`Subscribed to event: ${eventType}`);
  }

  /**
   * Unsubscribe from events
   * Based on Pusher.js event unsubscription patterns
   */
  off(eventType: string, handler?: WebSocketEventHandler): void {
    const handlers = this.eventHandlers.get(eventType);
    if (!handlers) return;

    if (handler) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.eventHandlers.delete(eventType);
      }
    } else {
      this.eventHandlers.delete(eventType);
    }
    this.log(`Unsubscribed from event: ${eventType}`);
  }

  /**
   * Subscribe to connection state changes
   */
  onStateChange(handler: ConnectionStateHandler): void {
    this.stateHandlers.add(handler);
  }

  /**
   * Unsubscribe from connection state changes
   */
  offStateChange(handler: ConnectionStateHandler): void {
    this.stateHandlers.delete(handler);
  }

  /**
   * Update authentication token
   * Based on AWS IoT SDK credential update patterns
   */
  updateAuthToken(authToken: AuthToken): void {
    this.options.authToken = authToken;
    this.log('Auth token updated');

    // Reconnect with new token if currently connected
    if (this.state.connected) {
      this.log('Reconnecting with new auth token');
      this.disconnect();
      this.connect().catch((error) => {
        this.log('Failed to reconnect with new token:', error);
      });
    }
  }

  /**
   * Get current connection state
   */
  getState(): WebSocketState {
    return { ...this.state };
  }

  /**
   * Get queued message count
   */
  async getQueuedMessageCount(): Promise<number> {
    let count = this.inMemoryQueue.length;

    if (this.persistentQueue) {
      try {
        const status = await this.persistentQueue.getStatus();
        count += status.size;
      } catch (error) {
        this.log('Failed to get persistent queue status:', error);
      }
    }

    return count;
  }

  /**
   * Clear message queue
   */
  async clearMessageQueue(): Promise<void> {
    this.inMemoryQueue = [];

    if (this.persistentQueue) {
      try {
        await this.persistentQueue.clear();
      } catch (error) {
        this.log('Failed to clear persistent queue:', error);
      }
    }

    this.log('Message queue cleared');
  }

  // Private Methods

  /**
   * Build WebSocket URL with auth and query parameters
   * Based on AWS IoT SDK URL construction patterns
   */
  private buildWebSocketUrl(): string {
    const url = new URL(this.options.url);

    // Add auth token as query parameter (AWS IoT pattern)
    if (this.options.authToken?.accessToken) {
      url.searchParams.set('token', this.options.authToken.accessToken);
      url.searchParams.set('userId', this.options.authToken.userId);
    }

    // Add custom query parameters
    Object.entries(this.options.queryParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    // Add client info for debugging
    url.searchParams.set('client', 'soloadventurer-web');
    url.searchParams.set('version', '1.0.0');

    return url.toString();
  }

  /**
   * Setup WebSocket event handlers
   * Based on Socket.IO connection management patterns
   */
  private setupWebSocketHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = (event) => {
      this.log('WebSocket connected');
      this.updateState({
        connected: true,
        connecting: false,
        reconnectAttempts: 0,
        lastConnected: new Date(),
        connectionId: this.generateConnectionId(),
        error: null,
      });

      // Start heartbeat (Pusher.js pattern)
      this.startHeartbeat();

      // Send queued messages (Socket.IO pattern)
      this.sendQueuedMessages();
    };

    this.ws.onclose = (event) => {
      this.log('WebSocket disconnected:', event.code, event.reason);
      this.updateState({ connected: false, connecting: false });

      // Stop heartbeat
      if (this.heartbeatTimer) {
        clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = null;
      }

      // Auto-reconnect unless manually disconnected
      if (event.code !== 1000) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (event) => {
      this.log('WebSocket error:', event);
      this.handleConnectionError(new Error('WebSocket error'));
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        this.log('Failed to parse message:', error, event.data);
      }
    };
  }

  /**
   * Handle incoming messages
   * Based on Pusher.js message routing patterns
   */
  private handleMessage(message: WebSocketMessage): void {
    this.log('Message received:', message);

    // Handle heartbeat responses
    if (message.type === 'pong') {
      this.lastHeartbeat = Date.now();
      return;
    }

    // Emit to event handlers
    const handlers = this.eventHandlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          this.log('Error in event handler:', error);
        }
      });
    }
  }

  /**
   * Start heartbeat monitoring
   * Based on Pusher.js heartbeat patterns
   */
  private startHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }

    this.lastHeartbeat = Date.now();
    this.heartbeatTimer = setInterval(() => {
      if (!this.state.connected || !this.ws) {
        return;
      }

      // Send ping
      this.send({ type: 'ping', data: {} });

      // Check for heartbeat timeout (30 seconds)
      const heartbeatTimeout = 30000;
      if (Date.now() - this.lastHeartbeat > heartbeatTimeout) {
        this.log('Heartbeat timeout, reconnecting');
        this.handleConnectionError(new Error('Heartbeat timeout'));
      }
    }, this.options.heartbeatInterval);
  }

  /**
   * Send queued messages after reconnection
   * Based on Socket.IO offline message delivery
   */
  private async sendQueuedMessages(): Promise<void> {
    // Send in-memory queue first
    if (this.inMemoryQueue.length > 0) {
      this.log(`Sending ${this.inMemoryQueue.length} in-memory queued messages`);
      const messages = [...this.inMemoryQueue];
      this.inMemoryQueue = [];

      for (const message of messages) {
        if (this.ws && this.state.connected) {
          try {
            this.ws.send(JSON.stringify(message));
          } catch (error) {
            this.log('Failed to send queued message:', error);
            this.inMemoryQueue.push(message);
          }
        }
      }
    }

    // Send persistent queue
    if (this.persistentQueue) {
      try {
        let message;
        let sentCount = 0;
        const maxBatch = 10; // Send max 10 messages per batch to avoid overwhelming

        while ((message = await this.persistentQueue.dequeue()) && sentCount < maxBatch) {
          if (this.ws && this.state.connected) {
            try {
              this.ws.send(JSON.stringify(message));
              sentCount++;
              this.log('Sent queued message:', message);
            } catch (error) {
              this.log('Failed to send persistent queued message:', error);
              await this.persistentQueue.markFailed(message, error instanceof Error ? error.message : String(error));
              break;
            }
          } else {
            // Connection lost during sending, re-queue message
            await this.persistentQueue.enqueue(message, message.priority);
            break;
          }
        }

        if (sentCount > 0) {
          this.log(`Sent ${sentCount} persistent queued messages`);
        }
      } catch (error) {
        this.log('Failed to process persistent queue:', error);
      }
    }
  }

  /**
   * Handle connection errors
   * Based on AWS IoT SDK error handling patterns
   */
  private handleConnectionError(error: Error): void {
    this.log('Connection error:', error.message);
    this.updateState({
      connected: false,
      connecting: false,
      error: error.message,
    });

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.scheduleReconnect();
  }

  /**
   * Schedule automatic reconnection
   * Based on React-use-websocket exponential backoff patterns
   */
  private scheduleReconnect(): void {
    if (this.state.reconnectAttempts >= this.options.maxReconnectAttempts) {
      this.log('Max reconnect attempts reached');
      this.updateState({ error: 'Max reconnection attempts exceeded' });
      return;
    }

    // Exponential backoff with jitter (React-use-websocket pattern)
    const attempt = this.state.reconnectAttempts;
    const delay = Math.min(
      this.options.baseReconnectDelay * Math.pow(2, attempt),
      this.options.maxReconnectDelay
    );
    const jitter = delay * 0.1 * Math.random();
    const totalDelay = delay + jitter;

    this.log(`Scheduling reconnect attempt ${attempt + 1} in ${totalDelay}ms`);

    this.reconnectTimer = setTimeout(() => {
      this.updateState({ reconnectAttempts: this.state.reconnectAttempts + 1 });
      this.connect().catch((error) => {
        this.log('Reconnection failed:', error);
      });
    }, totalDelay);
  }

  /**
   * Update connection state and notify handlers
   */
  private updateState(updates: Partial<WebSocketState>): void {
    this.state = { ...this.state, ...updates };
    this.stateHandlers.forEach(handler => {
      try {
        handler(this.state);
      } catch (error) {
        this.log('Error in state handler:', error);
      }
    });
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique connection ID
   */
  private generateConnectionId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Debug logging
   */
  private log(...args: any[]): void {
    if (this.options.debug) {
      console.log('[WebSocketClient]', ...args);
    }
  }
}

// Export singleton instance
export const wsClient = new WebSocketClient();

// Export for testing
export { WebSocketClient as WebSocketClientClass };