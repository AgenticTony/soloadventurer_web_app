// WaveButton Component - Animated Wave Gesture Button
// Sprint 3: Wave UI Components with Motion Animations

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useSendWave } from '@/hooks/useWaves';
import { SendWaveInput } from '@/types/wave';

interface WaveButtonProps {
  /** User ID to send wave to */
  toUserId: string;
  /** Optional message to include with the wave */
  message?: string;
  /** Optional trip ID if wave is related to a trip */
  tripId?: string;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'outline';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Disabled state */
  disabled?: boolean;
  /** Custom className */
  className?: string;
  /** Callback when wave is sent successfully */
  onWaveSent?: () => void;
  /** Callback when wave sending fails */
  onError?: (error: string) => void;
}

export const WaveButton: React.FC<WaveButtonProps> = ({
  toUserId,
  message,
  tripId,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  onWaveSent,
  onError,
}) => {
  const { sendWave, isSending, canSendWaveTo } = useSendWave();
  const [canSend, setCanSend] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  // Check if user can send wave on mount and when toUserId changes
  React.useEffect(() => {
    const checkCanSend = async () => {
      try {
        const result = await canSendWaveTo(toUserId);
        setCanSend(result.canSend);
        if (!result.canSend && result.reason) {
          setError(getErrorMessage(result.reason));
        }
      } catch (err) {
        setCanSend(false);
        setError('Unable to validate wave sending');
      }
    };

    if (toUserId) {
      checkCanSend();
    }
  }, [toUserId, canSendWaveTo]);

  const handleSendWave = async () => {
    if (!canSend || isSending || disabled) return;

    try {
      setError(null);

      const waveInput: SendWaveInput = {
        toUserId,
        message: message?.trim(),
        tripId,
      };

      await sendWave(waveInput);
      onWaveSent?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send wave';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  };

  // Animation variants
  const buttonVariants = {
    idle: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
    disabled: { scale: 1, opacity: 0.5 },
  };

  const waveIconVariants = {
    idle: { rotate: 0 },
    wave: {
      rotate: [0, 20, -10, 20, -10, 0],
      transition: {
        duration: 0.6,
        ease: "easeInOut",
      }
    },
    hover: {
      rotate: [0, 15, -8, 12, 0],
      transition: {
        duration: 0.4,
        ease: "easeInOut",
      }
    }
  };

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
  };

  // Variant classes
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white border-gray-600',
    outline: 'bg-transparent hover:bg-blue-50 text-blue-600 border-blue-600',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const isDisabled = disabled || !canSend || isSending;

  return (
    <div className="relative">
      <motion.button
        className={`
          relative inline-flex items-center justify-center gap-2
          rounded-lg border-2 font-medium transition-colors
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          disabled:cursor-not-allowed disabled:opacity-50
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          ${className}
        `}
        variants={buttonVariants}
        initial="idle"
        animate={isDisabled ? "disabled" : "idle"}
        whileHover={!isDisabled ? "hover" : undefined}
        whileTap={!isDisabled ? "tap" : undefined}
        disabled={isDisabled}
        onClick={handleSendWave}
        aria-label={`Send wave${message ? ` with message: ${message}` : ''}`}
        aria-describedby={error ? "wave-button-error" : undefined}
      >
        {/* Wave hand icon with animation */}
        <motion.div
          className={`flex items-center justify-center ${iconSizes[size]}`}
          variants={waveIconVariants}
          initial="idle"
          animate={isSending ? "wave" : "idle"}
          whileHover={!isDisabled && !isSending ? "hover" : undefined}
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-full h-full"
            aria-hidden="true"
          >
            {/* Hand wave icon */}
            <path d="M7 4V2C7 1.45 7.45 1 8 1S9 1.45 9 2V4.13C9.72 4.06 10.46 4.24 11.03 4.66L18.5 9.5C19.43 10.07 19.77 11.29 19.2 12.22S17.29 13.27 16.36 12.7L13 10.54V11.5C13 12.33 12.33 13 11.5 13S10 12.33 10 11.5V4C10 3.45 9.55 3 9 3S8 3.45 8 4V12C8 12.55 7.55 13 7 13S6 12.55 6 12V4C6 2.9 6.9 2 8 2S10 2.9 10 4V4.13C11.17 3.47 12.58 3.61 13.64 4.36L19.78 8.44C21.7 9.67 22.25 12.18 21.02 14.1S16.82 17.75 14.9 16.52L9.17 12.96C8.5 12.58 8 11.83 8 11V4Z"/>
          </svg>
        </motion.div>

        {/* Button text */}
        <span>
          {isSending ? 'Sending...' : 'Wave'}
        </span>

        {/* Loading indicator */}
        {isSending && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-current bg-opacity-10 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        )}
      </motion.button>

      {/* Error message */}
      {error && (
        <motion.div
          id="wave-button-error"
          className="absolute top-full left-0 mt-1 text-sm text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          role="alert"
          aria-live="polite"
        >
          {error}
        </motion.div>
      )}
    </div>
  );
};

// Helper function to convert error codes to user-friendly messages
function getErrorMessage(reason: string): string {
  switch (reason) {
    case 'SELF_WAVE':
      return 'Cannot send wave to yourself';
    case 'ALREADY_SENT':
      return 'Wave already sent to this user';
    case 'USER_BLOCKED':
      return 'User has blocked you';
    case 'RATE_LIMITED':
      return 'Daily wave limit reached';
    case 'WAVE_EXPIRED':
      return 'This wave has expired';
    case 'UNAUTHORIZED':
      return 'Must be logged in to send waves';
    case 'NETWORK_ERROR':
      return 'Network error occurred';
    case 'INVALID_USER':
      return 'Invalid user specified';
    default:
      return 'Unable to send wave';
  }
}

export default WaveButton;