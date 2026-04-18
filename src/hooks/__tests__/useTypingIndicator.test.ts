import { renderHook, act } from '@testing-library/react';
import { useTypingIndicator } from '../useTypingIndicator';
import * as chatApi from '@/lib/api/chat';

// ── Mocks ──────────────────────────────────────────────────────

jest.mock('@/lib/api/chat', () => ({
  createTypingDebounce: jest.fn(),
  subscribeToTypingIndicators: jest.fn(),
}));

const mockCreateTypingDebounce = chatApi.createTypingDebounce as jest.MockedFunction<typeof chatApi.createTypingDebounce>;
const mockSubscribe = chatApi.subscribeToTypingIndicators as jest.MockedFunction<typeof chatApi.subscribeToTypingIndicators>;

function makeMockDebounce() {
  return {
    trigger: jest.fn(),
    clear: jest.fn(),
    stop: jest.fn(),
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

// ── Tests ──────────────────────────────────────────────────────

describe('useTypingIndicator', () => {
  const defaultOptions = {
    connectionId: 'conn-1',
    userId: 'user-1',
  };

  it('creates a typing debounce on mount', () => {
    const debounce = makeMockDebounce();
    mockCreateTypingDebounce.mockReturnValue(debounce);
    mockSubscribe.mockReturnValue(jest.fn());

    renderHook(() => useTypingIndicator(defaultOptions));

    expect(mockCreateTypingDebounce).toHaveBeenCalledWith('conn-1', 'user-1');
  });

  it('subscribes to typing indicators on mount', () => {
    const debounce = makeMockDebounce();
    mockCreateTypingDebounce.mockReturnValue(debounce);
    mockSubscribe.mockReturnValue(jest.fn());

    renderHook(() => useTypingIndicator(defaultOptions));

    expect(mockSubscribe).toHaveBeenCalledWith('conn-1', 'user-1', expect.any(Function));
  });

  it('calls debounce.trigger() when onTypingStart is called', () => {
    const debounce = makeMockDebounce();
    mockCreateTypingDebounce.mockReturnValue(debounce);
    mockSubscribe.mockReturnValue(jest.fn());

    const { result } = renderHook(() => useTypingIndicator(defaultOptions));

    act(() => {
      result.current.onTypingStart();
    });

    expect(debounce.trigger).toHaveBeenCalledTimes(1);
  });

  it('calls debounce.clear() when onTypingStop is called', () => {
    const debounce = makeMockDebounce();
    mockCreateTypingDebounce.mockReturnValue(debounce);
    mockSubscribe.mockReturnValue(jest.fn());

    const { result } = renderHook(() => useTypingIndicator(defaultOptions));

    act(() => {
      result.current.onTypingStop();
    });

    expect(debounce.clear).toHaveBeenCalledTimes(1);
  });

  it('sets isOtherUserTyping to true when receiving typing event', () => {
    let capturedCallback: ((event: chatApi.TypingEvent) => void) | null = null;
    mockCreateTypingDebounce.mockReturnValue(makeMockDebounce());
    mockSubscribe.mockImplementation((_connId, _userId, callback) => {
      capturedCallback = callback;
      return jest.fn();
    });

    const { result } = renderHook(() => useTypingIndicator(defaultOptions));

    expect(result.current.isOtherUserTyping).toBe(false);

    act(() => {
      capturedCallback!({ userId: 'user-2', connectionId: 'conn-1', isTyping: true });
    });

    expect(result.current.isOtherUserTyping).toBe(true);
  });

  it('sets isOtherUserTyping to false when receiving stop event', () => {
    let capturedCallback: ((event: chatApi.TypingEvent) => void) | null = null;
    mockCreateTypingDebounce.mockReturnValue(makeMockDebounce());
    mockSubscribe.mockImplementation((_connId, _userId, callback) => {
      capturedCallback = callback;
      return jest.fn();
    });

    const { result } = renderHook(() => useTypingIndicator(defaultOptions));

    act(() => {
      capturedCallback!({ userId: 'user-2', connectionId: 'conn-1', isTyping: true });
    });
    expect(result.current.isOtherUserTyping).toBe(true);

    act(() => {
      capturedCallback!({ userId: 'user-2', connectionId: 'conn-1', isTyping: false });
    });
    expect(result.current.isOtherUserTyping).toBe(false);
  });

  it('auto-hides typing indicator after 3 seconds without update', () => {
    let capturedCallback: ((event: chatApi.TypingEvent) => void) | null = null;
    mockCreateTypingDebounce.mockReturnValue(makeMockDebounce());
    mockSubscribe.mockImplementation((_connId, _userId, callback) => {
      capturedCallback = callback;
      return jest.fn();
    });

    const { result } = renderHook(() => useTypingIndicator(defaultOptions));

    act(() => {
      capturedCallback!({ userId: 'user-2', connectionId: 'conn-1', isTyping: true });
    });
    expect(result.current.isOtherUserTyping).toBe(true);

    // Advance past 3s auto-hide timeout
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(result.current.isOtherUserTyping).toBe(false);
  });

  it('does not auto-hide if typing event arrives before timeout', () => {
    let capturedCallback: ((event: chatApi.TypingEvent) => void) | null = null;
    mockCreateTypingDebounce.mockReturnValue(makeMockDebounce());
    mockSubscribe.mockImplementation((_connId, _userId, callback) => {
      capturedCallback = callback;
      return jest.fn();
    });

    const { result } = renderHook(() => useTypingIndicator(defaultOptions));

    act(() => {
      capturedCallback!({ userId: 'user-2', connectionId: 'conn-1', isTyping: true });
    });

    // Advance 2s (not yet expired)
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // New typing event arrives, resetting the timer
    act(() => {
      capturedCallback!({ userId: 'user-2', connectionId: 'conn-1', isTyping: true });
    });

    // Advance 2s more — should still be true (timer reset)
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(result.current.isOtherUserTyping).toBe(true);

    // Now advance past full 3s
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(result.current.isOtherUserTyping).toBe(false);
  });

  it('unsubscribes on unmount', () => {
    const mockUnsub = jest.fn();
    const debounce = makeMockDebounce();
    mockCreateTypingDebounce.mockReturnValue(debounce);
    mockSubscribe.mockReturnValue(mockUnsub);

    const { unmount } = renderHook(() => useTypingIndicator(defaultOptions));

    unmount();

    expect(debounce.stop).toHaveBeenCalled();
    expect(mockUnsub).toHaveBeenCalled();
  });

  it('returns default state when connectionId is null', () => {
    mockCreateTypingDebounce.mockReturnValue(makeMockDebounce());
    mockSubscribe.mockReturnValue(jest.fn());

    const { result } = renderHook(() =>
      useTypingIndicator({ connectionId: null, userId: 'user-1' }),
    );

    expect(result.current.isOtherUserTyping).toBe(false);
    // trigger and clear are no-ops
    act(() => { result.current.onTypingStart(); });
    act(() => { result.current.onTypingStop(); });
  });

  it('cleans up and re-subscribes when connectionId changes', () => {
    const debounce1 = makeMockDebounce();
    const debounce2 = makeMockDebounce();
    const unsub1 = jest.fn();
    const unsub2 = jest.fn();

    mockCreateTypingDebounce
      .mockReturnValueOnce(debounce1)
      .mockReturnValueOnce(debounce2);
    mockSubscribe
      .mockReturnValueOnce(unsub1)
      .mockReturnValueOnce(unsub2);

    const { rerender } = renderHook(
      ({ connectionId }) => useTypingIndicator({ connectionId, userId: 'user-1' }),
      { initialProps: { connectionId: 'conn-1' } },
    );

    // Change connection
    rerender({ connectionId: 'conn-2' });

    expect(debounce1.stop).toHaveBeenCalled();
    expect(unsub1).toHaveBeenCalled();
    expect(mockCreateTypingDebounce).toHaveBeenLastCalledWith('conn-2', 'user-1');
  });
});
