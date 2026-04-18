import {
  createTypingDebounce,
  sendTypingIndicator,
  clearTypingIndicator,
  subscribeToTypingIndicators,
  type TypingEvent,
} from '../chat';

// ── Supabase mock ─────────────────────────────────────────────

const mockChannel = jest.fn();
const mockSend = jest.fn();
const mockOn = jest.fn();
const mockSubscribe = jest.fn();
const mockRemoveChannel = jest.fn();

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    channel: mockChannel,
    removeChannel: mockRemoveChannel,
  }),
}));

jest.mock('@/lib/errors', () => ({
  AppError: class AppError extends Error {
    status?: number;
    constructor(message: string, status?: number) {
      super(message);
      this.status = status;
    }
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();

  // Default channel mock that returns chainable for both broadcast and postgres_changes
  mockChannel.mockReturnValue({
    send: mockSend,
    on: mockOn.mockReturnValue({
      subscribe: mockSubscribe.mockReturnValue(undefined),
    }),
    subscribe: mockSubscribe.mockReturnValue(undefined),
  });
});

afterEach(() => {
  jest.useRealTimers();
});

// ── sendTypingIndicator ──────────────────────────────────────

describe('sendTypingIndicator', () => {
  it('broadcasts typing=true on the connection channel', () => {
    sendTypingIndicator('conn-1', 'user-1');

    expect(mockChannel).toHaveBeenCalledWith('typing:conn-1');
    expect(mockSend).toHaveBeenCalledWith({
      type: 'broadcast',
      event: 'typing',
      payload: { userId: 'user-1', connectionId: 'conn-1', isTyping: true },
    });
  });
});

// ── clearTypingIndicator ─────────────────────────────────────

describe('clearTypingIndicator', () => {
  it('broadcasts typing=false on the connection channel', () => {
    clearTypingIndicator('conn-1', 'user-1');

    expect(mockChannel).toHaveBeenCalledWith('typing:conn-1');
    expect(mockSend).toHaveBeenCalledWith({
      type: 'broadcast',
      event: 'typing',
      payload: { userId: 'user-1', connectionId: 'conn-1', isTyping: false },
    });
  });
});

// ── subscribeToTypingIndicators ──────────────────────────────

describe('subscribeToTypingIndicators', () => {
  it('subscribes to the typing broadcast channel', () => {
    const callback = jest.fn();
    subscribeToTypingIndicators('conn-1', 'user-1', callback);

    expect(mockChannel).toHaveBeenCalledWith('typing:conn-1');
    expect(mockOn).toHaveBeenCalledWith(
      'broadcast',
      { event: 'typing' },
      expect.any(Function),
    );
    expect(mockSubscribe).toHaveBeenCalled();
  });

  it('invokes callback for other user typing events', () => {
    let capturedHandler: ((payload: { payload: TypingEvent }) => void) | null = null;
    mockOn.mockImplementation((_event: string, _opts: unknown, handler: (p: { payload: TypingEvent }) => void) => {
      capturedHandler = handler;
      return { subscribe: mockSubscribe };
    });

    const callback = jest.fn();
    subscribeToTypingIndicators('conn-1', 'user-1', callback);

    // Simulate Supabase broadcast payload shape: { payload: TypingEvent }
    const event: TypingEvent = { userId: 'user-2', connectionId: 'conn-1', isTyping: true };
    capturedHandler!({ payload: event });

    expect(callback).toHaveBeenCalledWith(event);
  });

  it('ignores own typing events', () => {
    let capturedHandler: ((payload: { payload: TypingEvent }) => void) | null = null;
    mockOn.mockImplementation((_event: string, _opts: unknown, handler: (p: { payload: TypingEvent }) => void) => {
      capturedHandler = handler;
      return { subscribe: mockSubscribe };
    });

    const callback = jest.fn();
    subscribeToTypingIndicators('conn-1', 'user-1', callback);

    // Simulate own typing event
    capturedHandler!({ payload: { userId: 'user-1', connectionId: 'conn-1', isTyping: true } });

    expect(callback).not.toHaveBeenCalled();
  });

  it('returns unsubscribe function that removes the channel', () => {
    const callback = jest.fn();
    const unsub = subscribeToTypingIndicators('conn-1', 'user-1', callback);

    unsub();

    expect(mockRemoveChannel).toHaveBeenCalled();
  });
});

// ── createTypingDebounce ────────────────────────────────────

describe('createTypingDebounce', () => {
  it('sends typing indicator on first trigger', () => {
    const debounce = createTypingDebounce('conn-1', 'user-1');

    debounce.trigger();

    expect(mockSend).toHaveBeenCalledWith({
      type: 'broadcast',
      event: 'typing',
      payload: { userId: 'user-1', connectionId: 'conn-1', isTyping: true },
    });

    debounce.stop();
  });

  it('debounces subsequent triggers within 2.5s window', () => {
    const debounce = createTypingDebounce('conn-1', 'user-1');

    // First trigger sends immediately
    debounce.trigger();
    expect(mockSend).toHaveBeenCalledTimes(1);

    // Subsequent triggers within debounce window do not send
    debounce.trigger();
    debounce.trigger();
    debounce.trigger();
    expect(mockSend).toHaveBeenCalledTimes(1);

    debounce.stop();
  });

  it('sends again after debounce window expires', () => {
    const debounce = createTypingDebounce('conn-1', 'user-1');

    debounce.trigger();
    expect(mockSend).toHaveBeenCalledTimes(1);

    // Advance past debounce window
    jest.advanceTimersByTime(2501);

    debounce.trigger();
    expect(mockSend).toHaveBeenCalledTimes(2);

    debounce.stop();
  });

  it('auto-clears typing after 5 seconds of inactivity', () => {
    const debounce = createTypingDebounce('conn-1', 'user-1');

    debounce.trigger();
    expect(mockSend).toHaveBeenCalledTimes(1);

    // Advance past auto-clear timeout
    jest.advanceTimersByTime(5000);

    // Should have sent a clear (isTyping: false)
    expect(mockSend).toHaveBeenLastCalledWith({
      type: 'broadcast',
      event: 'typing',
      payload: { userId: 'user-1', connectionId: 'conn-1', isTyping: false },
    });

    debounce.stop();
  });

  it('clear() immediately sends not-typing and resets timers', () => {
    const debounce = createTypingDebounce('conn-1', 'user-1');

    debounce.trigger();
    expect(mockSend).toHaveBeenCalledTimes(1);

    debounce.clear();

    // clear sends isTyping: false
    expect(mockSend).toHaveBeenLastCalledWith({
      type: 'broadcast',
      event: 'typing',
      payload: { userId: 'user-1', connectionId: 'conn-1', isTyping: false },
    });

    // Advance time to verify no further sends
    jest.advanceTimersByTime(10000);
    expect(mockSend).toHaveBeenCalledTimes(2); // 1 trigger + 1 clear

    debounce.stop();
  });

  it('stop() cleans up timers without sending', () => {
    const debounce = createTypingDebounce('conn-1', 'user-1');

    debounce.trigger();
    expect(mockSend).toHaveBeenCalledTimes(1);

    debounce.stop();

    // Advance time — no auto-clear should fire
    jest.advanceTimersByTime(10000);
    expect(mockSend).toHaveBeenCalledTimes(1); // Only the initial trigger
  });

  it('clear() allows trigger() to send again immediately', () => {
    const debounce = createTypingDebounce('conn-1', 'user-1');

    debounce.trigger();
    expect(mockSend).toHaveBeenCalledTimes(1);

    debounce.clear();
    expect(mockSend).toHaveBeenCalledTimes(2); // trigger + clear

    // Trigger should send immediately again after clear
    debounce.trigger();
    expect(mockSend).toHaveBeenCalledTimes(3);

    debounce.stop();
  });
});
