// Connection Status Indicator - Real-time Connection State
// Sprint 3: WebSocket Connection Status UI with Official Best Practices

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useConnectionStatus } from '@/hooks/useWebSocket';

/**
 * Connection Status Indicator based on official patterns:
 * - Socket.IO connection state visualization
 * - Pusher.js connection status patterns
 * - AWS IoT SDK connection monitoring
 * - Material Design status indicators
 */

export interface ConnectionStatusProps {
  /** Show status text (default: true) */
  showText?: boolean;
  /** Show queued message count (default: false) */
  showQueueCount?: boolean;
  /** Compact mode (smaller indicator) */
  compact?: boolean;
  /** Custom className */
  className?: string;
  /** Position for floating indicator */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'inline';
  /** Show only when disconnected (default: false) */
  showOnlyWhenDisconnected?: boolean;
}

/**
 * Main Connection Status Component
 */
export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  showText = true,
  showQueueCount = false,
  compact = false,
  className = '',
  position = 'inline',
  showOnlyWhenDisconnected = false,
}) => {
  const {
    isOnline,
    isConnected,
    isReconnecting,
    connectionStatus,
    statusColor,
    statusText,
  } = useConnectionStatus();

  // Hide when connected if showOnlyWhenDisconnected is true
  if (showOnlyWhenDisconnected && isConnected) {
    return null;
  }

  // Position classes for floating indicators
  const positionClasses = {
    'top-left': 'fixed top-4 left-4 z-50',
    'top-right': 'fixed top-4 right-4 z-50',
    'bottom-left': 'fixed bottom-4 left-4 z-50',
    'bottom-right': 'fixed bottom-4 right-4 z-50',
    'inline': '',
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.2 },
    },
  };

  const pulseVariants = {
    pulse: {
      scale: [1, 1.2, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  // Status colors
  const colors = {
    green: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-200',
      dot: 'bg-green-500',
    },
    red: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-200',
      dot: 'bg-red-500',
    },
    yellow: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-200',
      dot: 'bg-yellow-500',
    },
    blue: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-200',
      dot: 'bg-blue-500',
    },
  };

  const colorScheme = colors[statusColor];

  return (
    <AnimatePresence>
      <motion.div
        className={`
          inline-flex items-center gap-2 rounded-lg border
          ${compact ? 'px-2 py-1' : 'px-3 py-2'}
          ${colorScheme.bg} ${colorScheme.border}
          ${positionClasses[position]}
          ${className}
        `}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        role="status"
        aria-label={`Connection status: ${statusText}`}
      >
        {/* Status Dot */}
        <motion.div
          className={`
            relative rounded-full
            ${compact ? 'w-2 h-2' : 'w-3 h-3'}
            ${colorScheme.dot}
          `}
          variants={isReconnecting ? pulseVariants : {}}
          animate={isReconnecting ? 'pulse' : 'static'}
        >
          {/* Pulse ring for connecting/reconnecting states */}
          {(connectionStatus === 'connecting' || connectionStatus === 'reconnecting') && (
            <motion.div
              className={`
                absolute inset-0 rounded-full border-2
                ${colorScheme.dot.replace('bg-', 'border-')}
                opacity-75
              `}
              animate={{
                scale: [1, 2, 1],
                opacity: [0.7, 0, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          )}
        </motion.div>

        {/* Status Text */}
        {showText && (
          <span
            className={`
              font-medium
              ${compact ? 'text-xs' : 'text-sm'}
              ${colorScheme.text}
            `}
          >
            {statusText}
          </span>
        )}

        {/* Queue Count */}
        {showQueueCount && (
          <QueueIndicator compact={compact} />
        )}

        {/* Connection Icon */}
        <ConnectionIcon
          status={connectionStatus}
          compact={compact}
          colorScheme={colorScheme}
        />
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * Queue Indicator Component
 */
interface QueueIndicatorProps {
  compact: boolean;
}

const QueueIndicator: React.FC<QueueIndicatorProps> = ({ compact }) => {
  // This would connect to actual queue state
  // For now, showing placeholder
  const queueCount = 0; // TODO: Connect to actual queue

  if (queueCount === 0) return null;

  return (
    <motion.div
      className={`
        inline-flex items-center gap-1 rounded-full bg-orange-100 text-orange-800
        ${compact ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-1 text-sm'}
      `}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
    >
      <svg
        className={compact ? 'w-3 h-3' : 'w-4 h-4'}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span className="font-medium">{queueCount}</span>
    </motion.div>
  );
};

/**
 * Connection Icon Component
 */
interface ConnectionIconProps {
  status: 'online' | 'offline' | 'connecting' | 'reconnecting';
  compact: boolean;
  colorScheme: any;
}

const ConnectionIcon: React.FC<ConnectionIconProps> = ({ status, compact, colorScheme }) => {
  const iconSize = compact ? 'w-4 h-4' : 'w-5 h-5';

  const icons = {
    online: (
      <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
        />
      </svg>
    ),
    offline: (
      <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M18.364 5.636l-12.728 12.728m0 0L1.394 14.122m4.242 4.242L9.878 22.606m8.486-8.486l-2.122-2.122m0 0l-2.122-2.122m2.122 2.122L12 16.364"
        />
      </svg>
    ),
    connecting: (
      <motion.svg
        className={iconSize}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </motion.svg>
    ),
    reconnecting: (
      <motion.svg
        className={iconSize}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </motion.svg>
    ),
  };

  return (
    <div className={colorScheme.text}>
      {icons[status]}
    </div>
  );
};

/**
 * Simple Connection Dot
 * Minimal indicator for use in navigation bars
 */
export const ConnectionDot: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { statusColor, isConnected } = useConnectionStatus();

  const colors = {
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    blue: 'bg-blue-500',
  };

  return (
    <motion.div
      className={`w-2 h-2 rounded-full ${colors[statusColor]} ${className}`}
      animate={isConnected ? {} : { scale: [1, 1.2, 1] }}
      transition={isConnected ? {} : { duration: 1.5, repeat: Infinity }}
      aria-label={`Connection status: ${isConnected ? 'connected' : 'disconnected'}`}
    />
  );
};

/**
 * Connection Status Banner
 * Full-width banner for critical connection issues
 */
export const ConnectionBanner: React.FC = () => {
  const { isConnected, connectionStatus, statusText } = useConnectionStatus();

  if (isConnected) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white px-4 py-2 text-center text-sm font-medium"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        exit={{ y: -100 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="flex items-center justify-center gap-2">
          <ConnectionIcon
            status={connectionStatus}
            compact={true}
            colorScheme={{ text: 'text-white' }}
          />
          <span>{statusText}</span>
          {connectionStatus === 'reconnecting' && (
            <motion.div
              className="w-4 h-1 bg-white/30 rounded-full overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="h-full bg-white rounded-full"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConnectionStatus;