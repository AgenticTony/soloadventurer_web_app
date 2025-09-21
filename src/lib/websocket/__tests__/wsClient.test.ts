// WebSocket Client Tests
// Sprint 3: Comprehensive WebSocket Testing with Official Best Practices

import { WebSocketClientClass, AuthToken, WebSocketMessage } from '../wsClient';

/**
 * WebSocket Client test suite based on official testing patterns:
 * - Socket.IO connection testing patterns
 * - AWS IoT SDK authentication testing
 * - React testing library patterns
 * - Jest WebSocket mocking best practices
 */

// Mock WebSocket
class MockWebSocket {
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;

  readyState: number = MockWebSocket.CONNECTING;
  url: string;
  protocol?: string;
  onopen?: (event: Event) => void;
  onclose?: (event: CloseEvent) => void;
  onerror?: (event: Event) => void;
  onmessage?: (event: MessageEvent) => void;

  private listeners: { [key: string]: ((event: any) => void)[] } = {};

  constructor(url: string, protocol?: string) {
    this.url = url;
    this.protocol = protocol;

    // Simulate async connection
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      this.onopen?.(new Event('open'));
      this.dispatchEvent(new Event('open'));
    }, 10);
  }

  send(data: string | ArrayBuffer | Blob): void {
    if (this.readyState !== MockWebSocket.OPEN) {
      throw new Error('WebSocket is not open');
    }
    // Echo back the message for testing
    setTimeout(() => {
      const message = new MessageEvent('message', { data });
      this.onmessage?.(message);
      this.dispatchEvent(message);
    }, 5);
  }

  close(code?: number, reason?: string): void {
    this.readyState = MockWebSocket.CLOSING;
    setTimeout(() => {
      this.readyState = MockWebSocket.CLOSED;
      const closeEvent = new CloseEvent('close', { code: code || 1000, reason });
      this.onclose?.(closeEvent);
      this.dispatchEvent(closeEvent);
    }, 5);
  }

  addEventListener(type: string, listener: (event: any) => void): void {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(listener);
  }

  removeEventListener(type: string, listener: (event: any) => void): void {
    if (this.listeners[type]) {
      const index = this.listeners[type].indexOf(listener);
      if (index !== -1) {
        this.listeners[type].splice(index, 1);
      }
    }
  }

  dispatchEvent(event: Event): boolean {
    const listeners = this.listeners[event.type] || [];
    listeners.forEach(listener => listener(event));
    return true;
  }

  // Test utilities
  simulateError(): void {
    const errorEvent = new Event('error');
    this.onerror?.(errorEvent);
    this.dispatchEvent(errorEvent);
  }

  simulateMessage(data: any): void {
    const message = new MessageEvent('message', { data: JSON.stringify(data) });
    this.onmessage?.(message);
    this.dispatchEvent(message);
  }
}

// Mock message queue
jest.mock('../messageQueue', () => ({
  MessageQueue: jest.fn().mockImplementation(() => ({
    enqueue: jest.fn().mockResolvedValue(true),
    dequeue: jest.fn().mockResolvedValue(null),
    clear: jest.fn().mockResolvedValue(undefined),
    getStatus: jest.fn().mockResolvedValue({ size: 0, pendingCount: 0, retryingCount: 0, expiredCount: 0 }),
    markFailed: jest.fn().mockResolvedValue(undefined),
  })),
}));

// Setup global WebSocket mock
Object.assign(global, { WebSocket: MockWebSocket });

describe('WebSocketClient', () => {
  let client: WebSocketClientClass;
  let mockAuthToken: AuthToken;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    mockAuthToken = {
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token',
      expiresAt: Date.now() + 3600000,
      userId: 'test-user-id',
    };

    client = new WebSocketClientClass({
      debug: false,
      authToken: mockAuthToken,
      url: 'wss://test.example.com/ws',
      enableMessageQueue: false, // Disable for most tests
    });
  });

  afterEach(() => {
    client.disconnect();
    jest.useRealTimers();
  });

  describe('Connection Management', () => {
    it('should initialize with correct default state', () => {
      const state = client.getState();
      expect(state).toEqual({
        connected: false,
        connecting: false,
        error: null,
        reconnectAttempts: 0,
        lastConnected: null,
        connectionId: null,
      });
    });

    it('should connect successfully with auth token', async () => {
      const stateHandler = jest.fn();
      client.onStateChange(stateHandler);

      await client.connect();

      expect(stateHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          connecting: true,
        })
      );

      // Fast-forward to connection completion
      jest.advanceTimersByTime(20);

      expect(stateHandler).toHaveBeenLastCalledWith(
        expect.objectContaining({
          connected: true,
          connecting: false,
          connectionId: expect.any(String),
          lastConnected: expect.any(Date),
        })
      );
    });

    it('should build correct WebSocket URL with auth parameters', async () => {
      await client.connect();

      // Check if URL contains auth parameters
      // This would need to be verified through WebSocket mock
      expect(MockWebSocket).toHaveBeenCalledWith(
        expect.stringContaining('token=test-access-token')
      );
      expect(MockWebSocket).toHaveBeenCalledWith(
        expect.stringContaining('userId=test-user-id')
      );
    });

    it('should handle connection timeout', async () => {
      // Mock WebSocket that never connects
      const SlowWebSocket = class extends MockWebSocket {
        constructor(url: string) {
          super(url);
          this.readyState = MockWebSocket.CONNECTING;
          // Never call onopen
        }
      };

      Object.assign(global, { WebSocket: SlowWebSocket });

      const connectPromise = client.connect();

      // Fast-forward past connection timeout
      jest.advanceTimersByTime(15000);

      await expect(connectPromise).rejects.toThrow('Connection timeout');
    });

    it('should disconnect cleanly', () => {
      const stateHandler = jest.fn();
      client.onStateChange(stateHandler);

      client.disconnect();

      expect(stateHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          connected: false,
          connecting: false,
          reconnectAttempts: 0,
          connectionId: null,
        })
      );
    });

    it('should update auth token and reconnect', async () => {
      await client.connect();
      jest.advanceTimersByTime(20);

      const newToken: AuthToken = {
        ...mockAuthToken,
        accessToken: 'new-access-token',
      };

      client.updateAuthToken(newToken);

      // Should trigger disconnect and reconnect
      jest.advanceTimersByTime(50);

      expect(MockWebSocket).toHaveBeenCalledWith(
        expect.stringContaining('token=new-access-token')
      );
    });
  });

  describe('Message Handling', () => {
    beforeEach(async () => {
      await client.connect();
      jest.advanceTimersByTime(20);
    });

    it('should send message when connected', async () => {
      const mockSend = jest.fn();
      (global.WebSocket as any).prototype.send = mockSend;

      const message = {
        type: 'test_message',
        data: { content: 'Hello, World!' },
        userId: 'test-user',
      };

      const success = await client.send(message);

      expect(success).toBe(true);
      expect(mockSend).toHaveBeenCalledWith(
        expect.stringContaining('"type":"test_message"')
      );
    });

    it('should queue message when disconnected', async () => {
      client.disconnect();

      const message = {
        type: 'test_message',
        data: { content: 'Offline message' },
        userId: 'test-user',
      };

      const success = await client.send(message);

      expect(success).toBe(false);
      expect(await client.getQueuedMessageCount()).toBe(1);
    });

    it('should handle message reception', async () => {
      const messageHandler = jest.fn();
      client.on('test_event', messageHandler);

      const testMessage: WebSocketMessage = {
        id: 'test-id',
        type: 'test_event',
        data: { content: 'Test data' },
        timestamp: new Date().toISOString(),
        userId: 'sender-id',
      };

      // Simulate incoming message
      const ws = (client as any).ws as MockWebSocket;
      ws.simulateMessage(testMessage);

      expect(messageHandler).toHaveBeenCalledWith(testMessage);
    });

    it('should handle heartbeat messages', async () => {
      const ws = (client as any).ws as MockWebSocket;

      // Send ping and expect pong response
      jest.advanceTimersByTime(30000); // Trigger heartbeat

      ws.simulateMessage({ type: 'pong', data: {} });

      // Heartbeat should update internal timestamp
      expect((client as any).lastHeartbeat).toBeGreaterThan(0);
    });

    it('should handle heartbeat timeout', async () => {
      const stateHandler = jest.fn();
      client.onStateChange(stateHandler);

      // Trigger heartbeat
      jest.advanceTimersByTime(30000);

      // Don't respond to ping, advance to timeout
      jest.advanceTimersByTime(35000);

      expect(stateHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Heartbeat timeout',
        })
      );
    });
  });

  describe('Event Subscription', () => {
    beforeEach(async () => {
      await client.connect();
      jest.advanceTimersByTime(20);
    });

    it('should subscribe and unsubscribe from events', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      client.on('test_event', handler1);
      client.on('test_event', handler2);

      const testMessage: WebSocketMessage = {
        id: 'test-id',
        type: 'test_event',
        data: { content: 'Test' },
        timestamp: new Date().toISOString(),
      };

      const ws = (client as any).ws as MockWebSocket;
      ws.simulateMessage(testMessage);

      expect(handler1).toHaveBeenCalledWith(testMessage);
      expect(handler2).toHaveBeenCalledWith(testMessage);

      // Unsubscribe one handler
      client.off('test_event', handler1);

      ws.simulateMessage(testMessage);

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(2);

      // Unsubscribe all handlers
      client.off('test_event');

      ws.simulateMessage(testMessage);

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(2);
    });

    it('should handle multiple event types', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      client.on('event_1', handler1);
      client.on('event_2', handler2);

      const ws = (client as any).ws as MockWebSocket;

      ws.simulateMessage({ type: 'event_1', data: {} });
      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(0);

      ws.simulateMessage({ type: 'event_2', data: {} });
      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
    });
  });

  describe('Reconnection Logic', () => {
    it('should attempt reconnection on unexpected disconnect', async () => {
      await client.connect();
      jest.advanceTimersByTime(20);

      const stateHandler = jest.fn();
      client.onStateChange(stateHandler);

      // Simulate unexpected disconnect
      const ws = (client as any).ws as MockWebSocket;
      ws.close(1006, 'Connection lost'); // Abnormal closure

      jest.advanceTimersByTime(10);

      expect(stateHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          connected: false,
        })
      );

      // Should schedule reconnection
      jest.advanceTimersByTime(2000); // Base delay + jitter

      expect(stateHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          reconnectAttempts: 1,
        })
      );
    });

    it('should implement exponential backoff', async () => {
      client = new WebSocketClientClass({
        debug: false,
        maxReconnectAttempts: 3,
        baseReconnectDelay: 1000,
      });

      const stateHandler = jest.fn();
      client.onStateChange(stateHandler);

      // Mock connection that always fails
      const FailingWebSocket = class extends MockWebSocket {
        constructor(url: string) {
          super(url);
          setTimeout(() => {
            this.simulateError();
          }, 5);
        }
      };

      Object.assign(global, { WebSocket: FailingWebSocket });

      // First attempt
      await expect(client.connect()).rejects.toThrow();

      // Fast-forward through reconnection attempts
      for (let i = 1; i <= 3; i++) {
        const expectedDelay = Math.min(1000 * Math.pow(2, i - 1), 10000);
        jest.advanceTimersByTime(expectedDelay + 500); // Add buffer for jitter

        expect(stateHandler).toHaveBeenCalledWith(
          expect.objectContaining({
            reconnectAttempts: i,
          })
        );
      }

      // Should stop after max attempts
      jest.advanceTimersByTime(20000);

      expect(stateHandler).toHaveBeenLastCalledWith(
        expect.objectContaining({
          error: 'Max reconnection attempts exceeded',
        })
      );
    });

    it('should not reconnect on manual disconnect', async () => {
      await client.connect();
      jest.advanceTimersByTime(20);

      const stateHandler = jest.fn();
      client.onStateChange(stateHandler);

      client.disconnect(); // Manual disconnect

      // Should not attempt reconnection
      jest.advanceTimersByTime(5000);

      expect(stateHandler).not.toHaveBeenCalledWith(
        expect.objectContaining({
          reconnectAttempts: expect.any(Number),
        })
      );
    });
  });

  describe('Message Queue Integration', () => {
    beforeEach(() => {
      client = new WebSocketClientClass({
        debug: false,
        enableMessageQueue: true,
        authToken: mockAuthToken,
      });
    });

    it('should queue messages with persistent storage', async () => {
      const message = {
        type: 'test_message',
        data: { content: 'Queued message' },
        userId: 'test-user',
      };

      const success = await client.send(message, 2); // High priority

      expect(success).toBe(false); // Not connected
      expect(await client.getQueuedMessageCount()).toBeGreaterThan(0);
    });

    it('should send queued messages on reconnection', async () => {
      // Queue a message while disconnected
      await client.send({
        type: 'queued_message',
        data: { content: 'Test' },
        userId: 'test-user',
      });

      const mockSend = jest.fn();
      (global.WebSocket as any).prototype.send = mockSend;

      // Connect and trigger queue processing
      await client.connect();
      jest.advanceTimersByTime(20);

      // Should send queued messages
      expect(mockSend).toHaveBeenCalled();
    });

    it('should clear message queue', async () => {
      await client.send({
        type: 'test_message',
        data: { content: 'Test' },
        userId: 'test-user',
      });

      expect(await client.getQueuedMessageCount()).toBeGreaterThan(0);

      await client.clearMessageQueue();

      expect(await client.getQueuedMessageCount()).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle WebSocket errors gracefully', async () => {
      const stateHandler = jest.fn();
      client.onStateChange(stateHandler);

      await client.connect();
      jest.advanceTimersByTime(20);

      const ws = (client as any).ws as MockWebSocket;
      ws.simulateError();

      expect(stateHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'WebSocket error',
        })
      );
    });

    it('should handle message parsing errors', async () => {
      await client.connect();
      jest.advanceTimersByTime(20);

      const messageHandler = jest.fn();
      client.on('test_event', messageHandler);

      const ws = (client as any).ws as MockWebSocket;

      // Send invalid JSON
      const invalidMessage = new MessageEvent('message', { data: 'invalid json' });
      ws.onmessage?.(invalidMessage);

      // Should not crash or call handler
      expect(messageHandler).not.toHaveBeenCalled();
    });

    it('should handle send errors', async () => {
      await client.connect();
      jest.advanceTimersByTime(20);

      // Mock send to throw error
      (global.WebSocket as any).prototype.send = jest.fn(() => {
        throw new Error('Send failed');
      });

      const message = {
        type: 'test_message',
        data: { content: 'Test' },
        userId: 'test-user',
      };

      const success = await client.send(message);

      expect(success).toBe(false);
      expect(await client.getQueuedMessageCount()).toBe(1);
    });
  });

  describe('State Management', () => {
    it('should track connection state accurately', async () => {
      const stateHandler = jest.fn();
      client.onStateChange(stateHandler);

      // Initial state
      expect(client.getState().connected).toBe(false);

      // Connecting state
      const connectPromise = client.connect();
      expect(stateHandler).toHaveBeenCalledWith(
        expect.objectContaining({ connecting: true })
      );

      // Connected state
      jest.advanceTimersByTime(20);
      await connectPromise;

      expect(stateHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          connected: true,
          connecting: false,
          connectionId: expect.any(String),
        })
      );

      // Disconnected state
      client.disconnect();
      expect(stateHandler).toHaveBeenLastCalledWith(
        expect.objectContaining({
          connected: false,
          connectionId: null,
        })
      );
    });

    it('should generate unique connection IDs', async () => {
      await client.connect();
      jest.advanceTimersByTime(20);

      const connectionId1 = client.getState().connectionId;

      client.disconnect();
      await client.connect();
      jest.advanceTimersByTime(20);

      const connectionId2 = client.getState().connectionId;

      expect(connectionId1).not.toBe(connectionId2);
      expect(connectionId1).toMatch(/^conn_\d+_[a-z0-9]+$/);
      expect(connectionId2).toMatch(/^conn_\d+_[a-z0-9]+$/);
    });
  });
});