// WaveButton Component Tests
// Sprint 3: Wave UI Component Testing

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WaveButton } from '../WaveButton';
import { useSendWave } from '@/hooks/useWaves';

// Mock the hooks
jest.mock('@/hooks/useWaves');

const mockUseSendWave = {
  sendWave: jest.fn(),
  isSending: false,
  canSendWaveTo: jest.fn(),
};

describe('WaveButton', () => {
  beforeEach(() => {
    (useSendWave as jest.Mock).mockReturnValue(mockUseSendWave);
    mockUseSendWave.canSendWaveTo.mockResolvedValue({ canSend: true });
    jest.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<WaveButton toUserId="user-123" />);

    expect(screen.getByRole('button', { name: /send wave/i })).toBeInTheDocument();
    expect(screen.getByText('Wave')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    render(<WaveButton toUserId="user-123" message="Hello there!" />);

    expect(screen.getByRole('button', { name: /send wave with message: hello there!/i })).toBeInTheDocument();
  });

  it('applies variant classes correctly', () => {
    const { rerender } = render(<WaveButton toUserId="user-123" variant="primary" />);
    expect(screen.getByRole('button')).toHaveClass('bg-blue-600');

    rerender(<WaveButton toUserId="user-123" variant="secondary" />);
    expect(screen.getByRole('button')).toHaveClass('bg-gray-600');

    rerender(<WaveButton toUserId="user-123" variant="outline" />);
    expect(screen.getByRole('button')).toHaveClass('bg-transparent');
  });

  it('applies size classes correctly', () => {
    const { rerender } = render(<WaveButton toUserId="user-123" size="sm" />);
    expect(screen.getByRole('button')).toHaveClass('px-3', 'py-2', 'text-sm');

    rerender(<WaveButton toUserId="user-123" size="md" />);
    expect(screen.getByRole('button')).toHaveClass('px-4', 'py-3', 'text-base');

    rerender(<WaveButton toUserId="user-123" size="lg" />);
    expect(screen.getByRole('button')).toHaveClass('px-6', 'py-4', 'text-lg');
  });

  it('handles send wave successfully', async () => {
    const user = userEvent.setup();
    const onWaveSent = jest.fn();

    mockUseSendWave.sendWave.mockResolvedValueOnce({});

    render(
      <WaveButton
        toUserId="user-123"
        message="Hello!"
        onWaveSent={onWaveSent}
      />
    );

    await user.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(mockUseSendWave.sendWave).toHaveBeenCalledWith({
        toUserId: 'user-123',
        message: 'Hello!',
        tripId: undefined,
      });
      expect(onWaveSent).toHaveBeenCalled();
    });
  });

  it('handles send wave with trip ID', async () => {
    const user = userEvent.setup();

    mockUseSendWave.sendWave.mockResolvedValueOnce({});

    render(
      <WaveButton
        toUserId="user-123"
        tripId="trip-456"
      />
    );

    await user.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(mockUseSendWave.sendWave).toHaveBeenCalledWith({
        toUserId: 'user-123',
        message: undefined,
        tripId: 'trip-456',
      });
    });
  });

  it('displays loading state while sending', () => {
    mockUseSendWave.isSending = true;

    render(<WaveButton toUserId="user-123" />);

    expect(screen.getByText('Sending...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('handles send wave error', async () => {
    const user = userEvent.setup();
    const onError = jest.fn();
    const error = new Error('Failed to send wave');

    mockUseSendWave.sendWave.mockRejectedValueOnce(error);

    render(
      <WaveButton
        toUserId="user-123"
        onError={onError}
      />
    );

    await user.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith('Failed to send wave');
      expect(screen.getByText('Failed to send wave')).toBeInTheDocument();
    });
  });

  it('shows error when user cannot send wave', async () => {
    mockUseSendWave.canSendWaveTo.mockResolvedValue({
      canSend: false,
      reason: 'ALREADY_SENT'
    });

    render(<WaveButton toUserId="user-123" />);

    await waitFor(() => {
      expect(screen.getByText('Wave already sent to this user')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  it('disables button when disabled prop is true', () => {
    render(<WaveButton toUserId="user-123" disabled />);

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('trims message whitespace', async () => {
    const user = userEvent.setup();

    mockUseSendWave.sendWave.mockResolvedValueOnce({});

    render(<WaveButton toUserId="user-123" message="  Hello!  " />);

    await user.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(mockUseSendWave.sendWave).toHaveBeenCalledWith({
        toUserId: 'user-123',
        message: 'Hello!',
        tripId: undefined,
      });
    });
  });

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup();

    render(<WaveButton toUserId="user-123" />);

    const button = screen.getByRole('button');

    // Focus the button
    await user.tab();
    expect(button).toHaveFocus();

    // Should have focus styles
    expect(button).toHaveClass('focus:outline-none', 'focus:ring-2');
  });

  it('has proper ARIA attributes', () => {
    render(<WaveButton toUserId="user-123" message="Hello!" />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Send wave with message: Hello!');
  });

  it('has proper ARIA attributes for error state', async () => {
    mockUseSendWave.canSendWaveTo.mockResolvedValue({
      canSend: false,
      reason: 'ALREADY_SENT'
    });

    render(<WaveButton toUserId="user-123" />);

    await waitFor(() => {
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-describedby', 'wave-button-error');

      const errorElement = screen.getByRole('alert');
      expect(errorElement).toHaveAttribute('id', 'wave-button-error');
      expect(errorElement).toHaveAttribute('aria-live', 'polite');
    });
  });

  it('handles different error reasons correctly', async () => {
    const errorCases = [
      { reason: 'SELF_WAVE', message: 'Cannot send wave to yourself' },
      { reason: 'USER_BLOCKED', message: 'User has blocked you' },
      { reason: 'RATE_LIMITED', message: 'Daily wave limit reached' },
      { reason: 'UNAUTHORIZED', message: 'Must be logged in to send waves' },
      { reason: 'NETWORK_ERROR', message: 'Network error occurred' },
      { reason: 'UNKNOWN', message: 'Unable to send wave' },
    ];

    for (const errorCase of errorCases) {
      mockUseSendWave.canSendWaveTo.mockResolvedValue({
        canSend: false,
        reason: errorCase.reason
      });

      const { unmount } = render(<WaveButton toUserId="user-123" />);

      await waitFor(() => {
        expect(screen.getByText(errorCase.message)).toBeInTheDocument();
      });

      unmount();
    }
  });

  it('applies custom className', () => {
    render(<WaveButton toUserId="user-123" className="custom-class" />);

    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  it('checks wave sending permission on mount', async () => {
    render(<WaveButton toUserId="user-123" />);

    await waitFor(() => {
      expect(mockUseSendWave.canSendWaveTo).toHaveBeenCalledWith('user-123');
    });
  });

  it('rechecks permission when toUserId changes', async () => {
    const { rerender } = render(<WaveButton toUserId="user-123" />);

    await waitFor(() => {
      expect(mockUseSendWave.canSendWaveTo).toHaveBeenCalledWith('user-123');
    });

    rerender(<WaveButton toUserId="user-456" />);

    await waitFor(() => {
      expect(mockUseSendWave.canSendWaveTo).toHaveBeenCalledWith('user-456');
    });
  });
});