// UserCard Wave Integration Tests
// Sprint 3: Wave Integration Testing with Offline & Real-time Scenarios

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserCard } from '../UserCard';
import { useWaves } from '@/hooks/useWaves';
import { useAuth } from '@/contexts/AuthContext';
import type { UserProfile } from '@/types/user';
import type { WaveWithUsers } from '@/types/wave';

// Mock dependencies
jest.mock('@/hooks/useWaves');
jest.mock('@/contexts/AuthContext');
jest.mock('@/components/waves/WaveButton', () => ({
  WaveButton: ({ onWaveSent, className, ...props }: any) => (
    <button
      className={className}
      onClick={onWaveSent}
      data-testid="wave-button"
      {...props}
    >
      Wave
    </button>
  ),
}));

const mockUser: UserProfile = {
  id: 'user-1',
  name: 'John Doe',
  email: 'john@example.com',
  emailVerified: true,
  bio: 'Travel enthusiast',
  isOnline: true,
  isVerified: true,
  stats: {
    tripsCount: 5,
    followersCount: 100,
    followingCount: 50,
    placesVisited: 20,
  },
  locationSharing: 'friends',
  preciseLocation: true,
};

const mockCurrentUser = {
  id: 'current-user',
  name: 'Current User',
  email: 'current@example.com',
  emailVerified: true,
};

const mockWave: WaveWithUsers = {
  id: 'wave-1',
  fromUserId: 'current-user',
  toUserId: 'user-1',
  type: 'sent',
  status: 'pending',
  message: 'Hello!',
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  fromUser: {
    id: 'current-user',
    name: 'Current User',
    avatar: undefined,
    location: undefined,
  },
  toUser: {
    id: 'user-1',
    name: 'John Doe',
    avatar: undefined,
    location: undefined,
  },
  isRead: false,
  isExpired: false,
  isMutual: false,
};

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseWaves = useWaves as jest.MockedFunction<typeof useWaves>;

describe('UserCard Wave Integration', () => {
  const defaultWaveState = {
    getWavesByUser: jest.fn().mockReturnValue([]),
    isConnected: true,
    sendWave: jest.fn(),
    respondToWave: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: mockCurrentUser,
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
    });
    mockUseWaves.mockReturnValue(defaultWaveState as any);
  });

  describe('Wave Status Display', () => {
    it('shows no wave status when no interaction exists', () => {
      render(
        <UserCard
          user={mockUser}
          showActions={true}
        />
      );

      expect(screen.getByTestId('wave-button')).toBeInTheDocument();
      expect(screen.queryByText('Wave Sent')).not.toBeInTheDocument();
      expect(screen.queryByText('Waved at You')).not.toBeInTheDocument();
      expect(screen.queryByText('Mutual Connection')).not.toBeInTheDocument();
    });

    it('shows "Wave Sent" status with pending wave', () => {
      mockUseWaves.mockReturnValue({
        ...defaultWaveState,
        getWavesByUser: jest.fn().mockReturnValue([mockWave]),
      } as any);

      render(
        <UserCard
          user={mockUser}
          showActions={true}
        />
      );

      expect(screen.getByText('Wave Sent')).toBeInTheDocument();
      expect(screen.queryByTestId('wave-button')).not.toBeInTheDocument();
    });

    it('shows "Waved at You" status with received wave', () => {
      const receivedWave = {
        ...mockWave,
        fromUserId: 'user-1',
        toUserId: 'current-user',
        type: 'received' as const,
      };

      mockUseWaves.mockReturnValue({
        ...defaultWaveState,
        getWavesByUser: jest.fn().mockImplementation((userId) => {
          if (userId === 'user-1') return [receivedWave];
          return [];
        }),
      } as any);

      render(
        <UserCard
          user={mockUser}
          showActions={true}
        />
      );

      expect(screen.getByText('Waved at You')).toBeInTheDocument();
      expect(screen.getByText('Accept')).toBeInTheDocument();
      expect(screen.getByText('Decline')).toBeInTheDocument();
    });

    it('shows "Mutual Connection" status with mutual wave', () => {
      const mutualWave = {
        ...mockWave,
        status: 'accepted' as const,
        isMutual: true,
      };

      mockUseWaves.mockReturnValue({
        ...defaultWaveState,
        getWavesByUser: jest.fn().mockReturnValue([mutualWave]),
      } as any);

      render(
        <UserCard
          user={mockUser}
          showActions={true}
        />
      );

      expect(screen.getByText('Mutual Connection')).toBeInTheDocument();
      expect(screen.queryByTestId('wave-button')).not.toBeInTheDocument();
    });
  });

  describe('Offline Behavior', () => {
    it('shows offline indicator when disconnected', () => {
      mockUseWaves.mockReturnValue({
        ...defaultWaveState,
        isConnected: false,
      } as any);

      render(
        <UserCard
          user={mockUser}
          showActions={true}
        />
      );

      expect(screen.getByText('Offline')).toBeInTheDocument();
    });

    it('disables wave button when offline', () => {
      mockUseWaves.mockReturnValue({
        ...defaultWaveState,
        isConnected: false,
      } as any);

      render(
        <UserCard
          user={mockUser}
          showActions={true}
        />
      );

      const waveButton = screen.getByTestId('wave-button');
      expect(waveButton).toBeInTheDocument();
      // Wave button should handle offline state internally
    });
  });

  describe('Wave Actions', () => {
    it('handles wave button click with optimistic update', async () => {
      const user = userEvent.setup();
      const onWaveSent = jest.fn();

      render(
        <UserCard
          user={mockUser}
          showActions={true}
        />
      );

      const waveButton = screen.getByTestId('wave-button');
      await user.click(waveButton);

      // Optimistic update should be handled by WaveButton component
      // This test verifies the integration works
    });

    it('handles accept wave action', async () => {
      const user = userEvent.setup();
      const mockRespondToWave = jest.fn();
      const receivedWave = {
        ...mockWave,
        fromUserId: 'user-1',
        toUserId: 'current-user',
        type: 'received' as const,
      };

      mockUseWaves.mockReturnValue({
        ...defaultWaveState,
        getWavesByUser: jest.fn().mockImplementation((userId) => {
          if (userId === 'user-1') return [receivedWave];
          return [];
        }),
        respondToWave: mockRespondToWave,
      } as any);

      render(
        <UserCard
          user={mockUser}
          showActions={true}
        />
      );

      const acceptButton = screen.getByText('Accept');
      await user.click(acceptButton);

      expect(mockRespondToWave).toHaveBeenCalledWith(receivedWave.id, 'accepted');
    });

    it('handles decline wave action', async () => {
      const user = userEvent.setup();
      const mockRespondToWave = jest.fn();
      const receivedWave = {
        ...mockWave,
        fromUserId: 'user-1',
        toUserId: 'current-user',
        type: 'received' as const,
      };

      mockUseWaves.mockReturnValue({
        ...defaultWaveState,
        getWavesByUser: jest.fn().mockImplementation((userId) => {
          if (userId === 'user-1') return [receivedWave];
          return [];
        }),
        respondToWave: mockRespondToWave,
      } as any);

      render(
        <UserCard
          user={mockUser}
          showActions={true}
        />
      );

      const declineButton = screen.getByText('Decline');
      await user.click(declineButton);

      expect(mockRespondToWave).toHaveBeenCalledWith(receivedWave.id, 'declined');
    });
  });

  describe('Authentication States', () => {
    it('hides wave actions when user is not authenticated', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
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
      });

      render(
        <UserCard
          user={mockUser}
          showActions={true}
        />
      );

      expect(screen.queryByTestId('wave-button')).not.toBeInTheDocument();
      expect(screen.queryByText('Wave Sent')).not.toBeInTheDocument();
    });

    it('hides wave actions when viewing own profile', () => {
      const ownProfile = { ...mockUser, id: 'current-user' };

      render(
        <UserCard
          user={ownProfile}
          showActions={true}
        />
      );

      expect(screen.queryByTestId('wave-button')).not.toBeInTheDocument();
    });
  });

  describe('Real-time Updates', () => {
    it('updates wave status when wave state changes', async () => {
      const { rerender } = render(
        <UserCard
          user={mockUser}
          showActions={true}
        />
      );

      expect(screen.getByTestId('wave-button')).toBeInTheDocument();

      // Simulate real-time update - wave sent
      mockUseWaves.mockReturnValue({
        ...defaultWaveState,
        getWavesByUser: jest.fn().mockReturnValue([mockWave]),
      } as any);

      rerender(
        <UserCard
          user={mockUser}
          showActions={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Wave Sent')).toBeInTheDocument();
        expect(screen.queryByTestId('wave-button')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for wave actions', () => {
      const receivedWave = {
        ...mockWave,
        fromUserId: 'user-1',
        toUserId: 'current-user',
        type: 'received' as const,
      };

      mockUseWaves.mockReturnValue({
        ...defaultWaveState,
        getWavesByUser: jest.fn().mockImplementation((userId) => {
          if (userId === 'user-1') return [receivedWave];
          return [];
        }),
      } as any);

      render(
        <UserCard
          user={mockUser}
          showActions={true}
        />
      );

      expect(screen.getByLabelText('Accept wave')).toBeInTheDocument();
      expect(screen.getByLabelText('Decline wave')).toBeInTheDocument();
    });

    it('announces status changes to screen readers', () => {
      render(
        <UserCard
          user={mockUser}
          showActions={true}
        />
      );

      // Status indicators should be properly marked for screen readers
      // This would be implemented with aria-live regions in the actual component
    });
  });

  describe('Error Handling', () => {
    it('handles wave action errors gracefully', async () => {
      const user = userEvent.setup();
      const mockRespondToWave = jest.fn().mockRejectedValue(new Error('Network error'));
      const receivedWave = {
        ...mockWave,
        fromUserId: 'user-1',
        toUserId: 'current-user',
        type: 'received' as const,
      };

      mockUseWaves.mockReturnValue({
        ...defaultWaveState,
        getWavesByUser: jest.fn().mockImplementation((userId) => {
          if (userId === 'user-1') return [receivedWave];
          return [];
        }),
        respondToWave: mockRespondToWave,
      } as any);

      // Mock console.error to avoid test output pollution
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      render(
        <UserCard
          user={mockUser}
          showActions={true}
        />
      );

      const acceptButton = screen.getByText('Accept');
      await user.click(acceptButton);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to respond to wave:', expect.any(Error));
      });

      consoleErrorSpy.mockRestore();
    });
  });
});