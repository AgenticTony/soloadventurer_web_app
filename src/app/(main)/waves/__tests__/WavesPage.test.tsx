// Waves Page Integration Tests
// Sprint 3: Wave Management Page Testing with Real-time & Offline Features

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WavesPage from '../page';
import { useWaves } from '@/hooks/useWaves';
import { useAuth } from '@/contexts/AuthContext';
import type { WaveWithUsers } from '@/types/wave';

// Mock dependencies
jest.mock('@/hooks/useWaves');
jest.mock('@/contexts/AuthContext');
jest.mock('@/components/layout/MainLayout', () => ({
  MainLayout: ({ children }: { children: React.ReactNode }) => <div data-testid="main-layout">{children}</div>,
}));
jest.mock('@/components/waves/WaveList', () => ({
  WaveList: ({ waves, onWaveClick, onWaveRespond, className }: any) => (
    <div data-testid="wave-list" className={className}>
      {waves.map((wave: WaveWithUsers) => (
        <div
          key={wave.id}
          data-testid={`wave-item-${wave.id}`}
          onClick={() => onWaveClick?.(wave)}
        >
          <span>{wave.fromUser.name}</span>
          <span>{wave.status}</span>
          {wave.status === 'pending' && (
            <div>
              <button onClick={() => onWaveRespond?.(wave, 'accepted')}>Accept</button>
              <button onClick={() => onWaveRespond?.(wave, 'declined')}>Decline</button>
            </div>
          )}
        </div>
      ))}
    </div>
  ),
}));
jest.mock('@/components/waves/WaveNotification', () => ({
  WaveNotification: ({ onClick, onBadgeClick }: any) => (
    <div data-testid="wave-notification">
      <button onClick={onBadgeClick}>Notification Badge</button>
    </div>
  ),
}));

const mockCurrentUser = {
  id: 'current-user',
  name: 'Current User',
  email: 'current@example.com',
  emailVerified: true,
};

const mockWaves: WaveWithUsers[] = [
  {
    id: 'wave-1',
    fromUserId: 'user-1',
    toUserId: 'current-user',
    type: 'received',
    status: 'pending',
    message: 'Hello!',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fromUser: {
      id: 'user-1',
      name: 'John Doe',
      avatar: undefined,
      location: 'Paris',
    },
    toUser: {
      id: 'current-user',
      name: 'Current User',
      avatar: undefined,
      location: undefined,
    },
    isRead: false,
    isExpired: false,
    isMutual: false,
  },
  {
    id: 'wave-2',
    fromUserId: 'current-user',
    toUserId: 'user-2',
    type: 'sent',
    status: 'accepted',
    message: 'Hey there!',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    fromUser: {
      id: 'current-user',
      name: 'Current User',
      avatar: undefined,
      location: undefined,
    },
    toUser: {
      id: 'user-2',
      name: 'Jane Smith',
      avatar: undefined,
      location: 'Tokyo',
    },
    isRead: true,
    isExpired: false,
    isMutual: false,
  },
  {
    id: 'wave-3',
    fromUserId: 'current-user',
    toUserId: 'user-3',
    type: 'mutual',
    status: 'accepted',
    message: 'Great to connect!',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    fromUser: {
      id: 'current-user',
      name: 'Current User',
      avatar: undefined,
      location: undefined,
    },
    toUser: {
      id: 'user-3',
      name: 'Bob Wilson',
      avatar: undefined,
      location: 'London',
    },
    isRead: true,
    isExpired: false,
    isMutual: true,
  },
];

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseWaves = useWaves as jest.MockedFunction<typeof useWaves>;

describe('WavesPage', () => {
  const defaultWaveState = {
    sentWaves: [mockWaves[1]],
    receivedWaves: [mockWaves[0]],
    mutualWaves: [mockWaves[2]],
    stats: {
      sentCount: 5,
      receivedCount: 3,
      mutualCount: 2,
      pendingCount: 1,
    },
    isLoading: false,
    error: null,
    isConnected: true,
    refresh: jest.fn(),
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

  describe('Page Rendering', () => {
    it('renders the waves page with header and stats', () => {
      render(<WavesPage />);

      expect(screen.getByText('My Waves')).toBeInTheDocument();
      expect(screen.getByText('Manage your wave interactions and connections')).toBeInTheDocument();

      // Check stats cards
      expect(screen.getByText('5')).toBeInTheDocument(); // Sent count
      expect(screen.getByText('3')).toBeInTheDocument(); // Received count
      expect(screen.getByText('2')).toBeInTheDocument(); // Mutual count
      expect(screen.getByText('1')).toBeInTheDocument(); // Pending count
    });

    it('shows sign-in prompt when user is not authenticated', () => {
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

      render(<WavesPage />);

      expect(screen.getByText('Please sign in')).toBeInTheDocument();
      expect(screen.getByText('You need to be signed in to view your waves.')).toBeInTheDocument();
    });
  });

  describe('Filter Functionality', () => {
    it('shows all waves by default', () => {
      render(<WavesPage />);

      expect(screen.getByTestId('wave-list')).toBeInTheDocument();
      // All waves should be shown (3 total)
      expect(screen.getByTestId('wave-item-wave-1')).toBeInTheDocument();
      expect(screen.getByTestId('wave-item-wave-2')).toBeInTheDocument();
      expect(screen.getByTestId('wave-item-wave-3')).toBeInTheDocument();
    });

    it('filters to pending waves only', async () => {
      const user = userEvent.setup();

      render(<WavesPage />);

      const pendingTab = screen.getByRole('button', { name: /pending/i });
      await user.click(pendingTab);

      // Should only show pending waves
      expect(screen.getByTestId('wave-item-wave-1')).toBeInTheDocument();
      expect(screen.queryByTestId('wave-item-wave-2')).not.toBeInTheDocument();
      expect(screen.queryByTestId('wave-item-wave-3')).not.toBeInTheDocument();
    });

    it('filters to accepted waves only', async () => {
      const user = userEvent.setup();

      render(<WavesPage />);

      const acceptedTab = screen.getByRole('button', { name: /accepted/i });
      await user.click(acceptedTab);

      // Should only show accepted (non-mutual) waves
      expect(screen.queryByTestId('wave-item-wave-1')).not.toBeInTheDocument();
      expect(screen.getByTestId('wave-item-wave-2')).toBeInTheDocument();
      expect(screen.queryByTestId('wave-item-wave-3')).not.toBeInTheDocument();
    });

    it('filters to mutual waves only', async () => {
      const user = userEvent.setup();

      render(<WavesPage />);

      const mutualTab = screen.getByRole('button', { name: /mutual/i });
      await user.click(mutualTab);

      // Should only show mutual waves
      expect(screen.queryByTestId('wave-item-wave-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('wave-item-wave-2')).not.toBeInTheDocument();
      expect(screen.getByTestId('wave-item-wave-3')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('filters waves by search query', async () => {
      const user = userEvent.setup();

      render(<WavesPage />);

      const searchInput = screen.getByPlaceholderText('Search waves by name or message...');
      await user.type(searchInput, 'John');

      // Should filter to waves containing "John"
      expect(screen.getByTestId('wave-item-wave-1')).toBeInTheDocument();
      expect(screen.queryByTestId('wave-item-wave-2')).not.toBeInTheDocument();
      expect(screen.queryByTestId('wave-item-wave-3')).not.toBeInTheDocument();
    });

    it('clears search when X button is clicked', async () => {
      const user = userEvent.setup();

      render(<WavesPage />);

      const searchInput = screen.getByPlaceholderText('Search waves by name or message...');
      await user.type(searchInput, 'John');

      const clearButton = screen.getByRole('button', { name: '' });
      await user.click(clearButton);

      expect(searchInput).toHaveValue('');
    });

    it('shows empty state when search has no results', async () => {
      const user = userEvent.setup();

      render(<WavesPage />);

      const searchInput = screen.getByPlaceholderText('Search waves by name or message...');
      await user.type(searchInput, 'nonexistent');

      expect(screen.getByText('No matching waves found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your search or filters')).toBeInTheDocument();
    });
  });

  describe('Unread Filter', () => {
    it('filters to unread waves only', async () => {
      const user = userEvent.setup();

      render(<WavesPage />);

      const unreadButton = screen.getByRole('button', { name: /unread only/i });
      await user.click(unreadButton);

      // Should only show unread waves (wave-1 is unread)
      expect(screen.getByTestId('wave-item-wave-1')).toBeInTheDocument();
      expect(screen.queryByTestId('wave-item-wave-2')).not.toBeInTheDocument();
      expect(screen.queryByTestId('wave-item-wave-3')).not.toBeInTheDocument();
    });
  });

  describe('Connection Status', () => {
    it('shows online status when connected', () => {
      render(<WavesPage />);

      expect(screen.getByText('Online')).toBeInTheDocument();
    });

    it('shows offline status when disconnected', () => {
      mockUseWaves.mockReturnValue({
        ...defaultWaveState,
        isConnected: false,
      } as any);

      render(<WavesPage />);

      expect(screen.getByText('Offline')).toBeInTheDocument();
    });
  });

  describe('Real-time Updates', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('auto-refreshes every 30 seconds when online', () => {
      const mockRefresh = jest.fn();
      mockUseWaves.mockReturnValue({
        ...defaultWaveState,
        refresh: mockRefresh,
      } as any);

      render(<WavesPage />);

      // Fast-forward 30 seconds
      jest.advanceTimersByTime(30000);

      expect(mockRefresh).toHaveBeenCalled();
    });

    it('does not auto-refresh when offline', () => {
      const mockRefresh = jest.fn();
      mockUseWaves.mockReturnValue({
        ...defaultWaveState,
        isConnected: false,
        refresh: mockRefresh,
      } as any);

      render(<WavesPage />);

      // Fast-forward 30 seconds
      jest.advanceTimersByTime(30000);

      expect(mockRefresh).not.toHaveBeenCalled();
    });
  });

  describe('Manual Refresh', () => {
    it('refreshes data when refresh button is clicked', async () => {
      const user = userEvent.setup();
      const mockRefresh = jest.fn();
      mockUseWaves.mockReturnValue({
        ...defaultWaveState,
        refresh: mockRefresh,
      } as any);

      render(<WavesPage />);

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      await user.click(refreshButton);

      expect(mockRefresh).toHaveBeenCalled();
    });

    it('shows loading state during refresh', () => {
      mockUseWaves.mockReturnValue({
        ...defaultWaveState,
        isLoading: true,
      } as any);

      render(<WavesPage />);

      expect(screen.getByText('Loading waves...')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('displays error message when loading fails', () => {
      mockUseWaves.mockReturnValue({
        ...defaultWaveState,
        error: 'Failed to load waves',
      } as any);

      render(<WavesPage />);

      expect(screen.getByText('Error loading waves')).toBeInTheDocument();
      expect(screen.getByText('Failed to load waves')).toBeInTheDocument();
    });

    it('allows retry when error occurs', async () => {
      const user = userEvent.setup();
      const mockRefresh = jest.fn();
      mockUseWaves.mockReturnValue({
        ...defaultWaveState,
        error: 'Network error',
        refresh: mockRefresh,
      } as any);

      render(<WavesPage />);

      const retryButton = screen.getByRole('button', { name: /try again/i });
      await user.click(retryButton);

      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  describe('Empty States', () => {
    it('shows empty state when no waves exist', () => {
      mockUseWaves.mockReturnValue({
        ...defaultWaveState,
        sentWaves: [],
        receivedWaves: [],
        mutualWaves: [],
      } as any);

      render(<WavesPage />);

      expect(screen.getByText('No waves yet')).toBeInTheDocument();
      expect(screen.getByText('Start waving to connect with other travelers!')).toBeInTheDocument();
    });

    it('shows filtered empty state when search has no results', async () => {
      const user = userEvent.setup();

      render(<WavesPage />);

      const searchInput = screen.getByPlaceholderText('Search waves by name or message...');
      await user.type(searchInput, 'nonexistent');

      expect(screen.getByText('No matching waves found')).toBeInTheDocument();

      const clearSearchButton = screen.getByRole('button', { name: /clear search/i });
      expect(clearSearchButton).toBeInTheDocument();
    });
  });

  describe('Wave Interaction', () => {
    it('handles wave click events', async () => {
      const user = userEvent.setup();

      render(<WavesPage />);

      const waveItem = screen.getByTestId('wave-item-wave-1');
      await user.click(waveItem);

      // Wave click handling is logged (would trigger navigation in real app)
    });

    it('handles wave response actions', async () => {
      const user = userEvent.setup();

      render(<WavesPage />);

      const acceptButton = screen.getByRole('button', { name: /accept/i });
      await user.click(acceptButton);

      // Wave response handling is logged (would update state in real app)
    });
  });

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(<WavesPage />);

      expect(screen.getByRole('heading', { level: 1, name: 'My Waves' })).toBeInTheDocument();
    });

    it('has accessible filter tabs', () => {
      render(<WavesPage />);

      const tabs = screen.getAllByRole('button');
      expect(tabs.length).toBeGreaterThan(0);

      // Filter tabs should be keyboard accessible
      tabs.forEach(tab => {
        expect(tab).toHaveAttribute('type', 'button');
      });
    });

    it('has accessible search input', () => {
      render(<WavesPage />);

      const searchInput = screen.getByPlaceholderText('Search waves by name or message...');
      expect(searchInput).toHaveAttribute('type', 'text');
    });
  });
});