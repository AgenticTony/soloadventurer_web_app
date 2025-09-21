// WaveList Component Tests
// Sprint 3: Wave UI Component Testing

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WaveList } from '../WaveList';
import { useWaves, useWave } from '@/hooks/useWaves';
import { WaveWithUsers } from '@/types/wave';

// Mock the hooks
jest.mock('@/hooks/useWaves');

const mockWave: WaveWithUsers = {
  id: 'wave-1',
  fromUserId: 'user-1',
  toUserId: 'user-2',
  type: 'received',
  status: 'pending',
  message: 'Hello there!',
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  fromUser: {
    id: 'user-1',
    name: 'John Doe',
    avatar: 'https://example.com/avatar.jpg',
    location: 'Paris, France',
  },
  toUser: {
    id: 'user-2',
    name: 'Jane Smith',
    avatar: undefined,
    location: undefined,
  },
  isRead: false,
};

const mockSentWave: WaveWithUsers = {
  ...mockWave,
  id: 'wave-2',
  type: 'sent',
  fromUserId: 'user-2',
  toUserId: 'user-1',
  status: 'accepted',
  isRead: true,
};

const mockMutualWave: WaveWithUsers = {
  ...mockWave,
  id: 'wave-3',
  type: 'mutual',
  status: 'accepted',
  isMutual: true,
};

const mockUseWaves = {
  sentWaves: [mockSentWave],
  receivedWaves: [mockWave],
  mutualWaves: [mockMutualWave],
  isLoading: false,
  error: null,
  refresh: jest.fn(),
};

const mockUseWave = {
  respond: jest.fn(),
  markRead: jest.fn(),
  canRespond: true,
  isExpired: false,
};

describe('WaveList', () => {
  beforeEach(() => {
    (useWaves as jest.Mock).mockReturnValue(mockUseWaves);
    (useWave as jest.Mock).mockReturnValue(mockUseWave);
    jest.clearAllMocks();
  });

  it('renders all waves by default', () => {
    render(<WaveList />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('"Hello there!"')).toBeInTheDocument();
  });

  it('filters waves by type', () => {
    render(<WaveList type="sent" />);

    // Should only show sent waves
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });

  it('filters waves by status', () => {
    render(<WaveList status={['pending']} />);

    // Should only show pending waves
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
  });

  it('shows search controls when enabled', () => {
    render(<WaveList showControls />);

    expect(screen.getByPlaceholderText('Search waves...')).toBeInTheDocument();
    expect(screen.getByDisplayValue('All Waves')).toBeInTheDocument();
    expect(screen.getByText('Refresh')).toBeInTheDocument();
  });

  it('hides search controls when disabled', () => {
    render(<WaveList showControls={false} />);

    expect(screen.queryByPlaceholderText('Search waves...')).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue('All Waves')).not.toBeInTheDocument();
  });

  it('filters waves by search term', async () => {
    const user = userEvent.setup();

    render(<WaveList showControls />);

    const searchInput = screen.getByPlaceholderText('Search waves...');
    await user.type(searchInput, 'John');

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
  });

  it('filters waves by message content', async () => {
    const user = userEvent.setup();

    render(<WaveList showControls />);

    const searchInput = screen.getByPlaceholderText('Search waves...');
    await user.type(searchInput, 'Hello');

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('changes filter type via dropdown', async () => {
    const user = userEvent.setup();

    render(<WaveList showControls />);

    const typeSelect = screen.getByDisplayValue('All Waves');
    await user.selectOptions(typeSelect, 'sent');

    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });

  it('calls refresh when refresh button is clicked', async () => {
    const user = userEvent.setup();

    render(<WaveList showControls />);

    await user.click(screen.getByText('Refresh'));

    expect(mockUseWaves.refresh).toHaveBeenCalled();
  });

  it('shows loading state', () => {
    (useWaves as jest.Mock).mockReturnValue({
      ...mockUseWaves,
      isLoading: true,
    });

    render(<WaveList />);

    expect(screen.getByText('Loading waves...')).toBeInTheDocument();
  });

  it('shows error state with retry button', async () => {
    const user = userEvent.setup();

    (useWaves as jest.Mock).mockReturnValue({
      ...mockUseWaves,
      error: 'Failed to load waves',
    });

    render(<WaveList />);

    expect(screen.getByText('Failed to load waves')).toBeInTheDocument();

    await user.click(screen.getByText('Retry'));
    expect(mockUseWaves.refresh).toHaveBeenCalled();
  });

  it('shows empty state when no waves exist', () => {
    (useWaves as jest.Mock).mockReturnValue({
      ...mockUseWaves,
      sentWaves: [],
      receivedWaves: [],
      mutualWaves: [],
    });

    render(<WaveList />);

    expect(screen.getByText('No waves found')).toBeInTheDocument();
    expect(screen.getByText('Start waving to connect with other travelers!')).toBeInTheDocument();
  });

  it('shows empty state with search message when searching', async () => {
    const user = userEvent.setup();

    render(<WaveList showControls />);

    const searchInput = screen.getByPlaceholderText('Search waves...');
    await user.type(searchInput, 'nonexistent');

    expect(screen.getByText('No waves found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your search')).toBeInTheDocument();
  });

  it('displays wave details correctly', () => {
    render(<WaveList />);

    // Check user info
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('📍 Paris, France')).toBeInTheDocument();

    // Check message
    expect(screen.getByText('"Hello there!"')).toBeInTheDocument();

    // Check status
    expect(screen.getByText('pending')).toBeInTheDocument();

    // Check unread indicator (blue dot should be present for unread waves)
    const unreadIndicator = document.querySelector('.bg-blue-500');
    expect(unreadIndicator).toBeInTheDocument();
  });

  it('shows avatar image when available', () => {
    render(<WaveList />);

    const avatar = screen.getByAltText('John Doe');
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('shows avatar fallback when image not available', () => {
    const waveWithoutAvatar = {
      ...mockWave,
      fromUser: {
        ...mockWave.fromUser,
        avatar: undefined,
      },
    };

    (useWaves as jest.Mock).mockReturnValue({
      ...mockUseWaves,
      receivedWaves: [waveWithoutAvatar],
    });

    render(<WaveList />);

    expect(screen.getByText('J')).toBeInTheDocument(); // First letter of name
  });

  it('shows mutual match indicator', () => {
    render(<WaveList type="mutual" />);

    expect(screen.getByText('✨ Mutual match!')).toBeInTheDocument();
  });

  it('shows trip indicator when present', () => {
    const waveWithTrip = {
      ...mockWave,
      tripId: 'trip-123',
    };

    (useWaves as jest.Mock).mockReturnValue({
      ...mockUseWaves,
      receivedWaves: [waveWithTrip],
    });

    render(<WaveList />);

    expect(screen.getByText('🧳 Related to trip')).toBeInTheDocument();
  });

  it('shows expired warning for expired waves', () => {
    (useWave as jest.Mock).mockReturnValue({
      ...mockUseWave,
      isExpired: true,
    });

    render(<WaveList />);

    expect(screen.getByText('⏰ This wave has expired')).toBeInTheDocument();
  });

  it('shows action buttons for respondable waves', () => {
    render(<WaveList />);

    expect(screen.getByText('✓ Accept')).toBeInTheDocument();
    expect(screen.getByText('✗ Decline')).toBeInTheDocument();
  });

  it('handles accept wave action', async () => {
    const user = userEvent.setup();
    const onWaveRespond = jest.fn();

    render(<WaveList onWaveRespond={onWaveRespond} />);

    await user.click(screen.getByText('✓ Accept'));

    expect(mockUseWave.respond).toHaveBeenCalledWith('accepted');
  });

  it('handles decline wave action', async () => {
    const user = userEvent.setup();
    const onWaveRespond = jest.fn();

    render(<WaveList onWaveRespond={onWaveRespond} />);

    await user.click(screen.getByText('✗ Decline'));

    expect(mockUseWave.respond).toHaveBeenCalledWith('declined');
  });

  it('calls onWaveClick when wave item is clicked', async () => {
    const user = userEvent.setup();
    const onWaveClick = jest.fn();

    render(<WaveList onWaveClick={onWaveClick} />);

    const waveItem = screen.getByText('John Doe').closest('[role="article"]');
    await user.click(waveItem!);

    expect(onWaveClick).toHaveBeenCalledWith(mockWave);
    expect(mockUseWave.markRead).toHaveBeenCalled();
  });

  it('handles keyboard navigation for wave items', async () => {
    const user = userEvent.setup();
    const onWaveClick = jest.fn();

    render(<WaveList onWaveClick={onWaveClick} />);

    const waveItem = screen.getByText('John Doe').closest('[role="article"]');

    // Focus and press Enter
    (waveItem as HTMLElement).focus();
    await user.keyboard('{Enter}');

    expect(onWaveClick).toHaveBeenCalledWith(mockWave);

    // Test Space key
    onWaveClick.mockClear();
    (waveItem as HTMLElement).focus();
    await user.keyboard(' ');

    expect(onWaveClick).toHaveBeenCalledWith(mockWave);
  });

  it('limits displayed waves to specified limit', () => {
    const manyWaves = Array.from({ length: 5 }, (_, i) => ({
      ...mockWave,
      id: `wave-${i}`,
      fromUser: { ...mockWave.fromUser, name: `User ${i}` },
    }));

    (useWaves as jest.Mock).mockReturnValue({
      ...mockUseWaves,
      receivedWaves: manyWaves,
    });

    render(<WaveList limit={3} />);

    expect(screen.getByText('User 0')).toBeInTheDocument();
    expect(screen.getByText('User 1')).toBeInTheDocument();
    expect(screen.getByText('User 2')).toBeInTheDocument();
    expect(screen.queryByText('User 3')).not.toBeInTheDocument();
    expect(screen.queryByText('User 4')).not.toBeInTheDocument();
  });

  it('shows load more indicator when at limit', () => {
    const manyWaves = Array.from({ length: 20 }, (_, i) => ({
      ...mockWave,
      id: `wave-${i}`,
    }));

    (useWaves as jest.Mock).mockReturnValue({
      ...mockUseWaves,
      receivedWaves: manyWaves,
    });

    render(<WaveList limit={20} />);

    expect(screen.getByText('Showing 20 waves. Use search to find specific waves.')).toBeInTheDocument();
  });

  it('sorts waves by creation date (newest first)', () => {
    const olderWave = {
      ...mockWave,
      id: 'wave-old',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      fromUser: { ...mockWave.fromUser, name: 'Old User' },
    };

    const newerWave = {
      ...mockWave,
      id: 'wave-new',
      createdAt: new Date().toISOString(),
      fromUser: { ...mockWave.fromUser, name: 'New User' },
    };

    (useWaves as jest.Mock).mockReturnValue({
      ...mockUseWaves,
      receivedWaves: [olderWave, newerWave],
    });

    render(<WaveList />);

    const waveItems = screen.getAllByRole('article');
    expect(waveItems[0]).toHaveTextContent('New User');
    expect(waveItems[1]).toHaveTextContent('Old User');
  });

  it('has proper ARIA attributes', () => {
    render(<WaveList />);

    expect(screen.getByRole('list', { name: 'Wave list' })).toBeInTheDocument();
    expect(screen.getByRole('article', { name: 'Wave from John Doe' })).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<WaveList className="custom-class" />);

    expect(document.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('enables real-time updates by default', () => {
    jest.useFakeTimers();

    render(<WaveList realTimeUpdates />);

    // Advance timer by 30 seconds
    jest.advanceTimersByTime(30000);

    expect(mockUseWaves.refresh).toHaveBeenCalled();

    jest.useRealTimers();
  });

  it('disables real-time updates when specified', () => {
    jest.useFakeTimers();

    render(<WaveList realTimeUpdates={false} />);

    // Advance timer by 30 seconds
    jest.advanceTimersByTime(30000);

    expect(mockUseWaves.refresh).not.toHaveBeenCalled();

    jest.useRealTimers();
  });
});