// WaveNotification Component Tests
// Sprint 3: Wave UI Component Testing

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WaveNotification } from '../WaveNotification';
import { useWaveNotifications } from '@/hooks/useWaves';
import { WaveWithUsers } from '@/types/wave';

// Mock the hooks
jest.mock('@/hooks/useWaves');

const mockWave: WaveWithUsers = {
  id: 'wave-1',
  fromUserId: 'user-1',
  toUserId: 'user-2',
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
    location: 'Paris, France',
  },
  toUser: {
    id: 'user-2',
    name: 'Jane Smith',
    avatar: undefined,
    location: undefined,
  },
};

const mockUseWaveNotifications = {
  unreadCount: 2,
  pendingWaves: [mockWave],
  isConnected: true,
};

describe('WaveNotification', () => {
  beforeEach(() => {
    (useWaveNotifications as jest.Mock).mockReturnValue(mockUseWaveNotifications);
    jest.clearAllMocks();
  });

  it('renders notification icon', () => {
    render(<WaveNotification />);

    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  it('shows connection status indicator', () => {
    render(<WaveNotification />);

    const indicator = document.querySelector('.bg-green-500');
    expect(indicator).toBeInTheDocument();
  });

  it('shows offline status when disconnected', () => {
    (useWaveNotifications as jest.Mock).mockReturnValue({
      ...mockUseWaveNotifications,
      isConnected: false,
    });

    render(<WaveNotification />);

    const indicator = document.querySelector('.bg-red-500');
    expect(indicator).toBeInTheDocument();
  });

  it('displays notification badge with unread count', () => {
    render(<WaveNotification />);

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByLabelText('2 unread waves')).toBeInTheDocument();
  });

  it('displays "9+" when count exceeds maxCount', () => {
    (useWaveNotifications as jest.Mock).mockReturnValue({
      ...mockUseWaveNotifications,
      unreadCount: 15,
    });

    render(<WaveNotification maxCount={9} />);

    expect(screen.getByText('9+')).toBeInTheDocument();
  });

  it('does not show badge when unread count is 0', () => {
    (useWaveNotifications as jest.Mock).mockReturnValue({
      ...mockUseWaveNotifications,
      unreadCount: 0,
    });

    render(<WaveNotification />);

    expect(screen.queryByLabelText(/unread waves/)).not.toBeInTheDocument();
  });

  it('does not show badge when showBadge is false', () => {
    render(<WaveNotification showBadge={false} />);

    expect(screen.queryByLabelText(/unread waves/)).not.toBeInTheDocument();
  });

  it('applies badge position classes correctly', () => {
    const { rerender } = render(<WaveNotification badgePosition="top-right" />);
    expect(screen.getByLabelText(/unread waves/)).toHaveClass('-top-2', '-right-2');

    rerender(<WaveNotification badgePosition="top-left" />);
    expect(screen.getByLabelText(/unread waves/)).toHaveClass('-top-2', '-left-2');

    rerender(<WaveNotification badgePosition="bottom-right" />);
    expect(screen.getByLabelText(/unread waves/)).toHaveClass('-bottom-2', '-right-2');

    rerender(<WaveNotification badgePosition="bottom-left" />);
    expect(screen.getByLabelText(/unread waves/)).toHaveClass('-bottom-2', '-left-2');
  });

  it('applies badge variant classes correctly', () => {
    const { rerender } = render(<WaveNotification badgeVariant="primary" />);
    expect(screen.getByLabelText(/unread waves/)).toHaveClass('bg-blue-600');

    rerender(<WaveNotification badgeVariant="secondary" />);
    expect(screen.getByLabelText(/unread waves/)).toHaveClass('bg-gray-600');

    rerender(<WaveNotification badgeVariant="success" />);
    expect(screen.getByLabelText(/unread waves/)).toHaveClass('bg-green-600');

    rerender(<WaveNotification badgeVariant="warning" />);
    expect(screen.getByLabelText(/unread waves/)).toHaveClass('bg-yellow-500');

    rerender(<WaveNotification badgeVariant="danger" />);
    expect(screen.getByLabelText(/unread waves/)).toHaveClass('bg-red-600');
  });

  it('opens dropdown when badge is clicked and showDropdown is true', async () => {
    const user = userEvent.setup();

    render(<WaveNotification showDropdown />);

    await user.click(screen.getByLabelText(/unread waves/));

    expect(screen.getByText('Wave Notifications')).toBeInTheDocument();
    expect(screen.getByText('Connected')).toBeInTheDocument();
  });

  it('calls onBadgeClick when badge is clicked', async () => {
    const user = userEvent.setup();
    const onBadgeClick = jest.fn();

    render(<WaveNotification onBadgeClick={onBadgeClick} />);

    await user.click(screen.getByLabelText(/unread waves/));

    expect(onBadgeClick).toHaveBeenCalled();
  });

  it('displays pending waves in dropdown', async () => {
    const user = userEvent.setup();

    render(<WaveNotification showDropdown />);

    await user.click(screen.getByLabelText(/unread waves/));

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('"Hello!"')).toBeInTheDocument();
    expect(screen.getByText('📍 Paris, France')).toBeInTheDocument();
  });

  it('displays "No pending waves" when no waves exist', async () => {
    const user = userEvent.setup();

    (useWaveNotifications as jest.Mock).mockReturnValue({
      ...mockUseWaveNotifications,
      pendingWaves: [],
    });

    render(<WaveNotification showDropdown />);

    await user.click(screen.getByLabelText(/unread waves/));

    expect(screen.getByText('No pending waves')).toBeInTheDocument();
  });

  it('calls onClick when notification item is clicked', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();

    render(<WaveNotification showDropdown onClick={onClick} />);

    await user.click(screen.getByLabelText(/unread waves/));

    const notification = screen.getByText('John Doe').closest('[role="listitem"]');
    await user.click(notification!);

    expect(onClick).toHaveBeenCalledWith(mockWave);
  });

  it('closes dropdown when notification item is clicked', async () => {
    const user = userEvent.setup();

    render(<WaveNotification showDropdown />);

    await user.click(screen.getByLabelText(/unread waves/));
    expect(screen.getByText('Wave Notifications')).toBeInTheDocument();

    const notification = screen.getByText('John Doe').closest('[role="listitem"]');
    await user.click(notification!);

    await waitFor(() => {
      expect(screen.queryByText('Wave Notifications')).not.toBeInTheDocument();
    });
  });

  it('closes dropdown when backdrop is clicked', async () => {
    const user = userEvent.setup();

    render(<WaveNotification showDropdown />);

    await user.click(screen.getByLabelText(/unread waves/));
    expect(screen.getByText('Wave Notifications')).toBeInTheDocument();

    // Click backdrop (the fixed overlay)
    const backdrop = document.querySelector('.fixed.inset-0.z-40');
    fireEvent.click(backdrop!);

    await waitFor(() => {
      expect(screen.queryByText('Wave Notifications')).not.toBeInTheDocument();
    });
  });

  it('handles keyboard navigation for notification items', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();

    render(<WaveNotification showDropdown onClick={onClick} />);

    await user.click(screen.getByLabelText(/unread waves/));

    const notification = screen.getByText('John Doe').closest('[role="listitem"]');

    // Focus and press Enter
    (notification as HTMLElement).focus();
    await user.keyboard('{Enter}');

    expect(onClick).toHaveBeenCalledWith(mockWave);

    // Test Space key
    onClick.mockClear();
    (notification as HTMLElement).focus();
    await user.keyboard(' ');

    expect(onClick).toHaveBeenCalledWith(mockWave);
  });

  it('shows offline status in dropdown when disconnected', async () => {
    const user = userEvent.setup();

    (useWaveNotifications as jest.Mock).mockReturnValue({
      ...mockUseWaveNotifications,
      isConnected: false,
    });

    render(<WaveNotification showDropdown />);

    await user.click(screen.getByLabelText(/unread waves/));

    expect(screen.getByText('Offline')).toBeInTheDocument();
  });

  it('limits displayed waves to 5', async () => {
    const user = userEvent.setup();

    const manyWaves = Array.from({ length: 10 }, (_, i) => ({
      ...mockWave,
      id: `wave-${i}`,
      fromUser: { ...mockWave.fromUser, name: `User ${i}` },
    }));

    (useWaveNotifications as jest.Mock).mockReturnValue({
      ...mockUseWaveNotifications,
      pendingWaves: manyWaves,
    });

    render(<WaveNotification showDropdown />);

    await user.click(screen.getByLabelText(/unread waves/));

    // Should show first 5 waves
    expect(screen.getByText('User 0')).toBeInTheDocument();
    expect(screen.getByText('User 4')).toBeInTheDocument();
    expect(screen.queryByText('User 5')).not.toBeInTheDocument();

    // Should show "View all" link
    expect(screen.getByText('View all 10 waves')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<WaveNotification className="custom-class" />);

    expect(document.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('announces unread count to screen readers', () => {
    render(<WaveNotification />);

    expect(screen.getByText('You have 2 unread waves')).toBeInTheDocument();
  });

  it('has proper ARIA attributes', () => {
    render(<WaveNotification />);

    const badge = screen.getByLabelText(/unread waves/);
    expect(badge).toHaveAttribute('aria-live', 'polite');
    expect(badge).toHaveAttribute('aria-atomic', 'true');
  });

  it('formats wave timestamps correctly', async () => {
    const user = userEvent.setup();

    const now = new Date();
    const waveWithTimestamp = {
      ...mockWave,
      createdAt: new Date(now.getTime() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
    };

    (useWaveNotifications as jest.Mock).mockReturnValue({
      ...mockUseWaveNotifications,
      pendingWaves: [waveWithTimestamp],
    });

    render(<WaveNotification showDropdown />);

    await user.click(screen.getByLabelText(/unread waves/));

    // Should show relative time
    expect(screen.getByText(/\d+\/\d+, \d+:\d+ [AP]M/)).toBeInTheDocument();
  });
});