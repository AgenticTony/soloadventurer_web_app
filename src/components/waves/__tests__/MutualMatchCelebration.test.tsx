// MutualMatchCelebration Component Tests
// Sprint 3: Wave UI Component Testing

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MutualMatchCelebration } from '../MutualMatchCelebration';
import { WaveWithUsers } from '@/types/wave';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: React.ComponentProps<'button'>) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

const mockWave: WaveWithUsers = {
  id: 'wave-1',
  fromUserId: 'user-1',
  toUserId: 'user-2',
  type: 'mutual',
  status: 'accepted',
  message: 'Hello!',
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isMutual: true,
  fromUser: {
    id: 'user-1',
    name: 'John Doe',
    avatar: 'https://example.com/john.jpg',
    location: 'Paris, France',
  },
  toUser: {
    id: 'user-2',
    name: 'Jane Smith',
    avatar: 'https://example.com/jane.jpg',
    location: 'London, UK',
  },
};

describe('MutualMatchCelebration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('does not render when show is false', () => {
    render(<MutualMatchCelebration show={false} />);

    expect(screen.queryByText("It's a Match!")).not.toBeInTheDocument();
  });

  it('renders celebration when show is true', () => {
    render(<MutualMatchCelebration show={true} wave={mockWave} />);

    expect(screen.getByText("It's a Match!")).toBeInTheDocument();
    expect(screen.getByText('🎉')).toBeInTheDocument();
    expect(screen.getByText('👋')).toBeInTheDocument();
    expect(screen.getByText('💖')).toBeInTheDocument();
  });

  it('displays user information correctly', () => {
    render(<MutualMatchCelebration show={true} wave={mockWave} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('displays user avatars when available', () => {
    render(<MutualMatchCelebration show={true} wave={mockWave} />);

    const johnAvatar = screen.getByAltText('John Doe');
    expect(johnAvatar).toHaveAttribute('src', 'https://example.com/john.jpg');

    const janeAvatar = screen.getByAltText('Jane Smith');
    expect(janeAvatar).toHaveAttribute('src', 'https://example.com/jane.jpg');
  });

  it('displays fallback avatars when images not available', () => {
    const waveWithoutAvatars = {
      ...mockWave,
      fromUser: { ...mockWave.fromUser, avatar: undefined },
      toUser: { ...mockWave.toUser, avatar: undefined },
    };

    render(<MutualMatchCelebration show={true} wave={waveWithoutAvatars} />);

    expect(screen.getByText('J')).toBeInTheDocument(); // John's initial
    expect(screen.getByText('J')).toBeInTheDocument(); // Jane's initial
  });

  it('displays match description with user name', () => {
    render(<MutualMatchCelebration show={true} wave={mockWave} />);

    expect(screen.getByText('You and John Doe both waved at each other!')).toBeInTheDocument();
  });

  it('handles missing wave data gracefully', () => {
    render(<MutualMatchCelebration show={true} />);

    expect(screen.getByText('You and another traveler both waved at each other!')).toBeInTheDocument();
  });

  it('calls onComplete when Start Messaging button is clicked', async () => {
    const user = userEvent.setup();
    const onComplete = jest.fn();

    render(<MutualMatchCelebration show={true} wave={mockWave} onComplete={onComplete} />);

    await user.click(screen.getByText('Start Messaging ✨'));

    expect(onComplete).toHaveBeenCalled();
  });

  it('calls onComplete when close button is clicked', async () => {
    const user = userEvent.setup();
    const onComplete = jest.fn();

    render(<MutualMatchCelebration show={true} wave={mockWave} onComplete={onComplete} />);

    await user.click(screen.getByLabelText('Close celebration'));

    expect(onComplete).toHaveBeenCalled();
  });

  it('auto-completes after specified duration', async () => {
    const onComplete = jest.fn();

    render(
      <MutualMatchCelebration
        show={true}
        wave={mockWave}
        duration={2000}
        onComplete={onComplete}
      />
    );

    // Fast-forward time by 2 seconds
    jest.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled();
    });
  });

  it('uses default duration when not specified', async () => {
    const onComplete = jest.fn();

    render(<MutualMatchCelebration show={true} wave={mockWave} onComplete={onComplete} />);

    // Fast-forward by default duration (3000ms)
    jest.advanceTimersByTime(3000);

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled();
    });
  });

  it('cleans up timer when component unmounts', () => {
    const onComplete = jest.fn();

    const { unmount } = render(
      <MutualMatchCelebration show={true} wave={mockWave} onComplete={onComplete} />
    );

    unmount();

    // Advance timer - onComplete should not be called
    jest.advanceTimersByTime(3000);

    expect(onComplete).not.toHaveBeenCalled();
  });

  it('has proper ARIA attributes', () => {
    render(<MutualMatchCelebration show={true} wave={mockWave} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-label', 'Mutual wave match celebration');
    expect(dialog).toHaveAttribute('aria-live', 'assertive');
  });

  it('provides screen reader announcement', () => {
    render(<MutualMatchCelebration show={true} wave={mockWave} />);

    expect(
      screen.getByText(
        'Congratulations! You have a mutual wave match with John Doe. You can now message each other.'
      )
    ).toBeInTheDocument();
  });

  it('handles keyboard navigation for action buttons', async () => {
    const user = userEvent.setup();
    const onComplete = jest.fn();

    render(<MutualMatchCelebration show={true} wave={mockWave} onComplete={onComplete} />);

    // Tab to Start Messaging button and press Enter
    await user.tab();
    await user.tab(); // Close button might be first in tab order
    await user.keyboard('{Enter}');

    expect(onComplete).toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<MutualMatchCelebration show={true} wave={mockWave} className="custom-class" />);

    expect(document.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('renders confetti particles', () => {
    render(<MutualMatchCelebration show={true} wave={mockWave} />);

    // Check for confetti container
    const confettiContainer = document.querySelector('.absolute.inset-0.pointer-events-none.overflow-hidden');
    expect(confettiContainer).toBeInTheDocument();

    // Check for multiple confetti particles
    const confettiParticles = document.querySelectorAll('.absolute.w-4.h-4.rounded-full');
    expect(confettiParticles.length).toBeGreaterThan(0);
  });

  it('renders sparkles background', () => {
    render(<MutualMatchCelebration show={true} wave={mockWave} />);

    // Check for sparkles (✨ emoji)
    const sparkles = screen.getAllByText('✨');
    expect(sparkles.length).toBeGreaterThan(0);
  });

  it('renders floating hearts', () => {
    render(<MutualMatchCelebration show={true} wave={mockWave} />);

    // Check for floating hearts (💖 emoji)
    const hearts = screen.getAllByText('💖');
    expect(hearts.length).toBeGreaterThan(0);
  });

  it('shows connection indicator between users', () => {
    render(<MutualMatchCelebration show={true} wave={mockWave} />);

    expect(screen.getByText('🔗')).toBeInTheDocument();
  });

  it('displays call to action message', () => {
    render(<MutualMatchCelebration show={true} wave={mockWave} />);

    expect(
      screen.getByText('You can now message each other and plan adventures together!')
    ).toBeInTheDocument();
  });

  it('does not render when initially hidden and then show becomes false', async () => {
    const { rerender } = render(<MutualMatchCelebration show={false} wave={mockWave} />);

    expect(screen.queryByText("It's a Match!")).not.toBeInTheDocument();

    rerender(<MutualMatchCelebration show={true} wave={mockWave} />);
    expect(screen.getByText("It's a Match!")).toBeInTheDocument();

    rerender(<MutualMatchCelebration show={false} wave={mockWave} />);

    await waitFor(() => {
      expect(screen.queryByText("It's a Match!")).not.toBeInTheDocument();
    });
  });

  it('prevents multiple auto-completion calls', async () => {
    const onComplete = jest.fn();

    render(<MutualMatchCelebration show={true} wave={mockWave} duration={1000} onComplete={onComplete} />);

    // Fast-forward time
    jest.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    // Advance more time
    jest.advanceTimersByTime(1000);

    // Should not be called again
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});