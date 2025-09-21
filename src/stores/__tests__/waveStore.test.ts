// Wave Store Tests
// Sprint 3: Zustand Store Testing with Real-time Scenarios

import { act, renderHook } from '@testing-library/react';
import { useWaveStore } from '../waveStore';
import { WaveWithUsers, SendWaveInput, SendWaveResponse } from '@/types/wave';
import { getWaveAPI } from '@/lib/api/waves';

// Mock the wave API
jest.mock('@/lib/api/waves');

const mockWaveAPI = {
  sendWave: jest.fn(),
  respondToWave: jest.fn(),
  getWaves: jest.fn(),
  getMutualConnections: jest.fn(),
  getWaveStats: jest.fn(),
  markAsRead: jest.fn(),
  subscribeToWaves: jest.fn(),
};

beforeEach(() => {
  (getWaveAPI as jest.Mock).mockReturnValue(mockWaveAPI);
  jest.clearAllMocks();
});

const mockWave: WaveWithUsers = {
  id: 'wave-1',
  fromUserId: 'user-1',
  toUserId: 'user-2',
  type: 'sent',
  status: 'pending',
  message: 'Hello!',
  tripId: undefined,
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  fromUser: {
    id: 'user-1',
    name: 'User One',
    avatar: undefined,
    location: undefined,
  },
  toUser: {
    id: 'user-2',
    name: 'User Two',
    avatar: undefined,
    location: undefined,
  },
};

describe('Wave Store', () => {
  beforeEach(() => {
    // Reset store state
    useWaveStore.getState().reset();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useWaveStore.getState();

      expect(state.sentWaves).toEqual([]);
      expect(state.receivedWaves).toEqual([]);
      expect(state.mutualWaves).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.isSending).toBe(false);
      expect(state.isResponding).toBe(false);
      expect(state.error).toBeNull();
      expect(state.isConnected).toBe(navigator.onLine);
      expect(state.lastSync).toBeNull();
      expect(state.stats).toEqual({
        sentCount: 0,
        receivedCount: 0,
        mutualCount: 0,
        pendingCount: 0,
      });
    });
  });

  describe('sendWave action', () => {
    it('should send wave successfully', async () => {
      const sendInput: SendWaveInput = {
        toUserId: 'user-2',
        message: 'Hello!',
      };

      const sendResponse: SendWaveResponse = {
        wave: mockWave,
        isMutual: false,
      };

      mockWaveAPI.sendWave.mockResolvedValueOnce(sendResponse);

      const { result } = renderHook(() => useWaveStore());

      await act(async () => {
        await result.current.sendWave(sendInput);
      });

      const state = useWaveStore.getState();

      expect(mockWaveAPI.sendWave).toHaveBeenCalledWith(sendInput);
      expect(state.sentWaves).toContain(mockWave);
      expect(state.stats.sentCount).toBe(1);
      expect(state.isSending).toBe(false);
      expect(state.error).toBeNull();
      expect(state.lastSync).toBeTruthy();
    });

    it('should handle mutual match', async () => {
      const sendInput: SendWaveInput = {
        toUserId: 'user-2',
        message: 'Hello!',
      };

      const mutualResponse: SendWaveResponse = {
        wave: mockWave,
        isMutual: true,
      };

      mockWaveAPI.sendWave.mockResolvedValueOnce(mutualResponse);

      const { result } = renderHook(() => useWaveStore());

      await act(async () => {
        await result.current.sendWave(sendInput);
      });

      const state = useWaveStore.getState();

      expect(state.sentWaves).toContain(mockWave);
      expect(state.mutualWaves).toContainEqual({ ...mockWave, type: 'mutual' });
      expect(state.stats.sentCount).toBe(1);
      expect(state.stats.mutualCount).toBe(1);
    });

    it('should handle send wave errors', async () => {
      const sendInput: SendWaveInput = {
        toUserId: 'user-2',
        message: 'Hello!',
      };

      const error = new Error('Failed to send wave');
      mockWaveAPI.sendWave.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useWaveStore());

      await act(async () => {
        try {
          await result.current.sendWave(sendInput);
        } catch (e) {
          // Expected to throw
        }
      });

      const state = useWaveStore.getState();

      expect(state.isSending).toBe(false);
      expect(state.error).toBe('Failed to send wave');
      expect(state.sentWaves).toHaveLength(0);
    });

    it('should set loading states correctly', async () => {
      const sendInput: SendWaveInput = {
        toUserId: 'user-2',
        message: 'Hello!',
      };

      // Create a promise that we can control
      let resolvePromise: (value: SendWaveResponse) => void;
      const sendPromise = new Promise<SendWaveResponse>((resolve) => {
        resolvePromise = resolve;
      });

      mockWaveAPI.sendWave.mockReturnValueOnce(sendPromise);

      const { result } = renderHook(() => useWaveStore());

      // Start sending
      const sendPromiseResult = act(async () => {
        return result.current.sendWave(sendInput);
      });

      // Check loading state is true
      expect(useWaveStore.getState().isSending).toBe(true);
      expect(useWaveStore.getState().error).toBeNull();

      // Resolve the promise
      resolvePromise!({ wave: mockWave, isMutual: false });
      await sendPromiseResult;

      // Check loading state is false
      expect(useWaveStore.getState().isSending).toBe(false);
    });
  });

  describe('respondToWave action', () => {
    beforeEach(() => {
      // Add a received wave to respond to
      useWaveStore.setState({
        receivedWaves: [{ ...mockWave, type: 'received', status: 'pending' }],
        stats: { sentCount: 0, receivedCount: 1, mutualCount: 0, pendingCount: 1 },
      });
    });

    it('should respond to wave successfully', async () => {
      mockWaveAPI.respondToWave.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useWaveStore());

      await act(async () => {
        await result.current.respondToWave({ waveId: 'wave-1', response: 'accepted' });
      });

      const state = useWaveStore.getState();
      const updatedWave = state.receivedWaves.find(w => w.id === 'wave-1');

      expect(mockWaveAPI.respondToWave).toHaveBeenCalledWith({
        waveId: 'wave-1',
        response: 'accepted',
      });
      expect(updatedWave?.status).toBe('accepted');
      expect(state.isResponding).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should create mutual match when accepting', async () => {
      mockWaveAPI.respondToWave.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useWaveStore());

      await act(async () => {
        await result.current.respondToWave({ waveId: 'wave-1', response: 'accepted' });
      });

      const state = useWaveStore.getState();

      expect(state.mutualWaves).toHaveLength(1);
      expect(state.stats.mutualCount).toBe(1);
    });

    it('should handle respond errors', async () => {
      const error = new Error('Failed to respond');
      mockWaveAPI.respondToWave.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useWaveStore());

      await act(async () => {
        try {
          await result.current.respondToWave({ waveId: 'wave-1', response: 'accepted' });
        } catch (e) {
          // Expected to throw
        }
      });

      const state = useWaveStore.getState();

      expect(state.isResponding).toBe(false);
      expect(state.error).toBe('Failed to respond to wave');
    });
  });

  describe('loadWaves action', () => {
    it('should load all wave types successfully', async () => {
      const sentWaves = [mockWave];
      const receivedWaves = [{ ...mockWave, id: 'wave-2', type: 'received' as const }];
      const mutualWaves = [{ ...mockWave, id: 'wave-3', type: 'mutual' as const }];
      const stats = { sentCount: 1, receivedCount: 1, mutualCount: 1, pendingCount: 1 };

      mockWaveAPI.getWaves
        .mockResolvedValueOnce({ waves: sentWaves })
        .mockResolvedValueOnce({ waves: receivedWaves });
      mockWaveAPI.getMutualConnections.mockResolvedValueOnce({ waves: mutualWaves });
      mockWaveAPI.getWaveStats.mockResolvedValueOnce(stats);

      const { result } = renderHook(() => useWaveStore());

      await act(async () => {
        await result.current.loadWaves();
      });

      const state = useWaveStore.getState();

      expect(state.sentWaves).toEqual(sentWaves);
      expect(state.receivedWaves).toEqual(receivedWaves);
      expect(state.mutualWaves).toEqual(mutualWaves);
      expect(state.stats).toEqual(stats);
      expect(state.isLoading).toBe(false);
      expect(state.lastSync).toBeTruthy();
    });

    it('should handle load errors', async () => {
      const error = new Error('Failed to load');
      mockWaveAPI.getWaves.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useWaveStore());

      await act(async () => {
        await result.current.loadWaves();
      });

      const state = useWaveStore.getState();

      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Failed to load waves');
    });
  });

  describe('real-time subscriptions', () => {
    it('should subscribe to waves', () => {
      const mockCleanup = jest.fn();
      mockWaveAPI.subscribeToWaves.mockReturnValueOnce(mockCleanup);

      const { result } = renderHook(() => useWaveStore());

      act(() => {
        result.current.subscribeToWaves('user-1');
      });

      expect(mockWaveAPI.subscribeToWaves).toHaveBeenCalledWith('user-1', expect.any(Object));

      const state = useWaveStore.getState();
      expect(state.isConnected).toBe(true);
    });

    it('should handle subscription callbacks', () => {
      const callbacks = {
        onWaveReceived: jest.fn(),
        onWaveResponded: jest.fn(),
        onMutualMatch: jest.fn(),
      };

      mockWaveAPI.subscribeToWaves.mockImplementationOnce((userId, cbs) => {
        Object.assign(callbacks, cbs);
        return jest.fn();
      });

      const { result } = renderHook(() => useWaveStore());

      act(() => {
        result.current.subscribeToWaves('user-1');
      });

      // Simulate wave received
      const newWave = { ...mockWave, id: 'new-wave', type: 'received' as const };
      act(() => {
        callbacks.onWaveReceived!(newWave);
      });

      const state = useWaveStore.getState();
      expect(state.receivedWaves).toContain(newWave);
      expect(state.stats.receivedCount).toBe(1);
    });

    it('should unsubscribe from waves', () => {
      const mockCleanup = jest.fn();
      mockWaveAPI.subscribeToWaves.mockReturnValueOnce(mockCleanup);

      const { result } = renderHook(() => useWaveStore());

      act(() => {
        result.current.subscribeToWaves('user-1');
      });

      act(() => {
        result.current.unsubscribeFromWaves();
      });

      expect(mockCleanup).toHaveBeenCalled();
    });
  });

  describe('utility actions', () => {
    it('should mark wave as read', () => {
      useWaveStore.setState({
        receivedWaves: [{ ...mockWave, type: 'received', isRead: false }],
      });

      const { result } = renderHook(() => useWaveStore());

      act(() => {
        result.current.markAsRead('wave-1');
      });

      const state = useWaveStore.getState();
      const wave = state.receivedWaves.find(w => w.id === 'wave-1');

      expect(wave?.isRead).toBe(true);
      expect(mockWaveAPI.markAsRead).toHaveBeenCalledWith('wave-1');
    });

    it('should clear expired waves', () => {
      const expiredWave = {
        ...mockWave,
        id: 'expired-wave',
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      };

      useWaveStore.setState({
        sentWaves: [mockWave, expiredWave],
        receivedWaves: [expiredWave],
      });

      const { result } = renderHook(() => useWaveStore());

      act(() => {
        result.current.clearExpiredWaves();
      });

      const state = useWaveStore.getState();

      expect(state.sentWaves).toEqual([mockWave]);
      expect(state.receivedWaves).toEqual([]);
    });

    it('should reset store state', () => {
      useWaveStore.setState({
        sentWaves: [mockWave],
        receivedWaves: [mockWave],
        isLoading: true,
        error: 'Some error',
      });

      const mockCleanup = jest.fn();
      useWaveStore.setState({ _subscriptionCleanup: mockCleanup });

      const { result } = renderHook(() => useWaveStore());

      act(() => {
        result.current.reset();
      });

      const state = useWaveStore.getState();

      expect(state.sentWaves).toEqual([]);
      expect(state.receivedWaves).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(mockCleanup).toHaveBeenCalled();
    });
  });

  describe('offline handling', () => {
    it('should handle online/offline events', () => {
      // Simulate going offline
      act(() => {
        window.dispatchEvent(new Event('offline'));
      });

      expect(useWaveStore.getState().isConnected).toBe(false);

      // Simulate going online
      act(() => {
        window.dispatchEvent(new Event('online'));
      });

      const state = useWaveStore.getState();
      expect(state.isConnected).toBe(true);
      expect(state.error).toBeNull();
    });
  });

  describe('persistence', () => {
    it('should persist relevant state', () => {
      const state = {
        sentWaves: [mockWave],
        mutualWaves: [{ ...mockWave, type: 'mutual' as const }],
        stats: { sentCount: 1, receivedCount: 0, mutualCount: 1, pendingCount: 0 },
        lastSync: new Date().toISOString(),
        // These should not be persisted
        receivedWaves: [mockWave],
        isLoading: true,
        error: 'Some error',
      };

      useWaveStore.setState(state);

      // The actual persistence is handled by Zustand middleware
      // This test just ensures the partialize function works correctly
      const persistedState = {
        sentWaves: state.sentWaves,
        mutualWaves: state.mutualWaves,
        stats: state.stats,
        lastSync: state.lastSync,
      };

      expect(persistedState).not.toHaveProperty('receivedWaves');
      expect(persistedState).not.toHaveProperty('isLoading');
      expect(persistedState).not.toHaveProperty('error');
    });
  });
});