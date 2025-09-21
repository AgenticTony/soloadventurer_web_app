// WebSocket Context Tests
// Sprint 3: WebSocket Context Testing with Official Best Practices

import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WebSocketProvider, useWebSocketContext } from '../WebSocketContext';
import { AuthProvider } from '../AuthContext';

/**
 * WebSocket Context test suite based on official testing patterns:
 * - React Testing Library context testing
 * - React Hook testing patterns
 * - Socket.IO context testing
 * - Jest mocking best practices
 */

// Mock WebSocket client
const mockWsClient = {
  connect: jest.fn().mockResolvedValue(undefined),
  disconnect: jest.fn(),
  send: jest.fn().mockReturnValue(true),
  on: jest.fn(),
  off: jest.fn(),
  onStateChange: jest.fn(),
  offStateChange: jest.fn(),
  updateAuthToken: jest.fn(),
  getState: jest.fn().mockReturnValue({
    connected: false,
    connecting: false,
    error: null,
    reconnectAttempts: 0,
    lastConnected: null,
    connectionId: null,
  }),
  getQueuedMessageCount: jest.fn().mockResolvedValue(0),
  clearMessageQueue: jest.fn().mockResolvedValue(undefined),
};

jest.mock('@/lib/websocket/wsClient', () => ({
  wsClient: mockWsClient,
  WebSocketClientClass: jest.fn(),
}));

// Mock Auth Context
const mockAuthContextValue = {
  user: {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    emailVerified: true,
    accessToken: 'test-access-token',
    refreshToken: 'test-refresh-token',
    tokenExpiresAt: Date.now() + 3600000,
  },
  isAuthenticated: true,
  login: jest.fn(),
  logout: jest.fn(),
  signup: jest.fn(),
  isLoading: false,
  error: null,
  clearAuthState: jest.fn(),
  resetPassword: jest.fn(),
  confirmResetPassword: jest.fn(),
  confirmSignUp: jest.fn(),
  resendSignUpCode: jest.fn(),
};

jest.mock('../AuthContext', () => ({
  useAuth: () => mockAuthContextValue,
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Test component that uses the WebSocket context
const TestComponent: React.FC = () => {
  const {
    isConnected,
    isConnecting,
    connectionError,
    connect,
    disconnect,
    sendMessage,
    subscribe,
    unsubscribe,
    queuedMessageCount,
    clearMessageQueue,
  } = useWebSocketContext();

  return (
    <div>
      <div data-testid="connection-status">
        {isConnecting ? 'connecting' : isConnected ? 'connected' : 'disconnected'}
      </div>
      <div data-testid="connection-error">{connectionError || 'no-error'}</div>
      <div data-testid="queued-count">{queuedMessageCount}</div>
      <button data-testid="connect-btn" onClick={connect}>
        Connect
      </button>
      <button data-testid="disconnect-btn" onClick={disconnect}>
        Disconnect
      </button>
      <button
        data-testid="send-btn"
        onClick={() =>
          sendMessage({
            type: 'test_message',
            data: { content: 'Hello' },
            userId: 'test-user',
          })
        }
      >
        Send Message
      </button>
      <button
        data-testid="subscribe-btn"
        onClick={() => subscribe('test_event', () => {})}
      >
        Subscribe
      </button>
      <button data-testid="clear-queue-btn" onClick={clearMessageQueue}>
        Clear Queue
      </button>
    </div>
  );
};

// Wrapper component for testing
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthProvider>
    <WebSocketProvider autoConnect={false}>{children}</WebSocketProvider>
  </AuthProvider>
);

describe('WebSocketContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset mock implementations
    mockWsClient.getState.mockReturnValue({
      connected: false,
      connecting: false,
      error: null,
      reconnectAttempts: 0,
      lastConnected: null,
      connectionId: null,
    });

    mockWsClient.getQueuedMessageCount.mockResolvedValue(0);
  });

  describe('Provider Setup', () => {
    it('should provide context to child components', () => {
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      expect(screen.getByTestId('connection-status')).toHaveTextContent('disconnected');
      expect(screen.getByTestId('connection-error')).toHaveTextContent('no-error');
    });

    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useWebSocketContext must be used within a WebSocketProvider');

      consoleSpy.mockRestore();
    });

    it('should initialize with default state', () => {
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      expect(screen.getByTestId('connection-status')).toHaveTextContent('disconnected');
      expect(screen.getByTestId('queued-count')).toHaveTextContent('0');
    });
  });

  describe('Connection Management', () => {
    it('should handle manual connection', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      const connectBtn = screen.getByTestId('connect-btn');
      await user.click(connectBtn);

      expect(mockWsClient.connect).toHaveBeenCalled();
      expect(mockWsClient.updateAuthToken).toHaveBeenCalledWith({
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        expiresAt: expect.any(Number),
        userId: 'test-user-id',
      });
    });

    it('should handle disconnection', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      const disconnectBtn = screen.getByTestId('disconnect-btn');
      await user.click(disconnectBtn);

      expect(mockWsClient.disconnect).toHaveBeenCalled();
    });

    it('should update state when WebSocket state changes', async () => {
      // Setup state change handler capture
      let stateChangeHandler: any;
      mockWsClient.onStateChange.mockImplementation((handler) => {
        stateChangeHandler = handler;
      });

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      // Simulate state change to connecting
      act(() => {
        stateChangeHandler({
          connected: false,
          connecting: true,
          error: null,
          reconnectAttempts: 0,
          lastConnected: null,
          connectionId: null,
        });
      });

      expect(screen.getByTestId('connection-status')).toHaveTextContent('connecting');

      // Simulate state change to connected
      act(() => {
        stateChangeHandler({
          connected: true,
          connecting: false,
          error: null,
          reconnectAttempts: 0,
          lastConnected: new Date(),
          connectionId: 'test-conn-id',
        });
      });

      expect(screen.getByTestId('connection-status')).toHaveTextContent('connected');
    });

    it('should handle connection errors', async () => {
      let stateChangeHandler: any;
      mockWsClient.onStateChange.mockImplementation((handler) => {
        stateChangeHandler = handler;
      });

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      act(() => {
        stateChangeHandler({
          connected: false,
          connecting: false,
          error: 'Connection failed',
          reconnectAttempts: 1,
          lastConnected: null,
          connectionId: null,
        });
      });

      expect(screen.getByTestId('connection-error')).toHaveTextContent('Connection failed');
    });
  });

  describe('Message Handling', () => {
    it('should send messages through WebSocket client', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      const sendBtn = screen.getByTestId('send-btn');
      await user.click(sendBtn);

      expect(mockWsClient.send).toHaveBeenCalledWith({
        type: 'test_message',
        data: { content: 'Hello' },
        userId: 'test-user',
      });
    });

    it('should handle message queue updates', async () => {
      let stateChangeHandler: any;
      mockWsClient.onStateChange.mockImplementation((handler) => {
        stateChangeHandler = handler;
      });

      mockWsClient.getQueuedMessageCount.mockResolvedValue(5);

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      await act(async () => {
        stateChangeHandler({
          connected: false,
          connecting: false,
          error: null,
          reconnectAttempts: 0,
          lastConnected: null,
          connectionId: null,
        });
      });

      await waitFor(() => {
        expect(screen.getByTestId('queued-count')).toHaveTextContent('5');
      });
    });

    it('should clear message queue', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      const clearBtn = screen.getByTestId('clear-queue-btn');
      await user.click(clearBtn);

      expect(mockWsClient.clearMessageQueue).toHaveBeenCalled();
    });
  });

  describe('Event Subscription', () => {
    it('should subscribe to events', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      const subscribeBtn = screen.getByTestId('subscribe-btn');
      await user.click(subscribeBtn);

      expect(mockWsClient.on).toHaveBeenCalledWith(
        'test_event',
        expect.any(Function)
      );
    });

    it('should unsubscribe from events on unmount', () => {
      const { unmount } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      unmount();

      expect(mockWsClient.offStateChange).toHaveBeenCalled();
    });

    it('should handle global message events', () => {
      // Setup message handler capture
      const messageHandlers: any[] = [];
      mockWsClient.on.mockImplementation((eventType, handler) => {
        messageHandlers.push({ eventType, handler });
      });

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      // Verify global message handlers are registered
      const expectedEvents = ['wave_received', 'wave_accepted', 'wave_declined', 'message_received', 'user_online', 'user_offline'];
      expectedEvents.forEach(eventType => {
        expect(mockWsClient.on).toHaveBeenCalledWith(
          eventType,
          expect.any(Function)
        );
      });
    });
  });

  describe('Auto-connection', () => {
    it('should auto-connect when enabled and user is authenticated', () => {
      render(
        <WebSocketProvider autoConnect={true}>
          <TestComponent />
        </WebSocketProvider>
      );

      expect(mockWsClient.connect).toHaveBeenCalled();
    });

    it('should not auto-connect when disabled', () => {
      render(
        <WebSocketProvider autoConnect={false}>
          <TestComponent />
        </WebSocketProvider>
      );

      expect(mockWsClient.connect).not.toHaveBeenCalled();
    });

    it('should not auto-connect when user is not authenticated', () => {
      // Mock unauthenticated state
      const originalAuthValue = mockAuthContextValue;
      jest.doMock('../AuthContext', () => ({
        useAuth: () => ({
          ...originalAuthValue,
          isAuthenticated: false,
          user: null,
        }),
      }));

      render(
        <WebSocketProvider autoConnect={true}>
          <TestComponent />
        </WebSocketProvider>
      );

      expect(mockWsClient.connect).not.toHaveBeenCalled();
    });
  });

  describe('Auth Token Management', () => {
    it('should update auth token when user changes', () => {
      let stateChangeHandler: any;
      mockWsClient.onStateChange.mockImplementation((handler) => {
        stateChangeHandler = handler;
      });

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      // Simulate connected state
      act(() => {
        stateChangeHandler({
          connected: true,
          connecting: false,
          error: null,
          reconnectAttempts: 0,
          lastConnected: new Date(),
          connectionId: 'test-conn-id',
        });
      });

      // Update should trigger auth token update
      expect(mockWsClient.updateAuthToken).toHaveBeenCalledWith({
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        expiresAt: expect.any(Number),
        userId: 'test-user-id',
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle WebSocket client errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      mockWsClient.connect.mockRejectedValue(new Error('Connection failed'));

      const user = userEvent.setup();

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      const connectBtn = screen.getByTestId('connect-btn');
      await user.click(connectBtn);

      // Should not crash the component
      expect(screen.getByTestId('connection-status')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('should handle message sending errors', async () => {
      mockWsClient.send.mockReturnValue(false);

      const user = userEvent.setup();

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      const sendBtn = screen.getByTestId('send-btn');
      await user.click(sendBtn);

      // Should not crash and continue working
      expect(screen.getByTestId('connection-status')).toBeInTheDocument();
    });
  });

  describe('Memory Management', () => {
    it('should cleanup event handlers on unmount', () => {
      const { unmount } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      // Simulate connected state to ensure handlers are registered
      act(() => {
        const stateHandler = mockWsClient.onStateChange.mock.calls[0][0];
        stateHandler({
          connected: true,
          connecting: false,
          error: null,
          reconnectAttempts: 0,
          lastConnected: new Date(),
          connectionId: 'test-conn-id',
        });
      });

      unmount();

      // Should cleanup state change handlers
      expect(mockWsClient.offStateChange).toHaveBeenCalled();

      // Should cleanup message event handlers
      const expectedEvents = ['wave_received', 'wave_accepted', 'wave_declined', 'message_received', 'user_online', 'user_offline'];
      expectedEvents.forEach(eventType => {
        expect(mockWsClient.off).toHaveBeenCalledWith(
          eventType,
          expect.any(Function)
        );
      });
    });

    it('should disconnect on unmount if connected', () => {
      let stateChangeHandler: any;
      mockWsClient.onStateChange.mockImplementation((handler) => {
        stateChangeHandler = handler;
      });

      const { unmount } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      // Simulate connected state
      act(() => {
        stateChangeHandler({
          connected: true,
          connecting: false,
          error: null,
          reconnectAttempts: 0,
          lastConnected: new Date(),
          connectionId: 'test-conn-id',
        });
      });

      unmount();

      expect(mockWsClient.disconnect).toHaveBeenCalled();
    });
  });

  describe('State Synchronization', () => {
    it('should maintain consistent state across re-renders', () => {
      let stateChangeHandler: any;
      mockWsClient.onStateChange.mockImplementation((handler) => {
        stateChangeHandler = handler;
      });

      const { rerender } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      // Change state
      act(() => {
        stateChangeHandler({
          connected: true,
          connecting: false,
          error: null,
          reconnectAttempts: 0,
          lastConnected: new Date(),
          connectionId: 'test-conn-id',
        });
      });

      expect(screen.getByTestId('connection-status')).toHaveTextContent('connected');

      // Re-render should maintain state
      rerender(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      expect(screen.getByTestId('connection-status')).toHaveTextContent('connected');
    });
  });
});