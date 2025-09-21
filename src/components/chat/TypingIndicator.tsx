// Typing Indicator Component - Real-time Typing Animation Component
// Sprint 3: Chat Interface Components with Official Best Practices

'use client';

import React, { memo, useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from 'lucide-react';
import { useWebSocketContext } from '@/contexts/WebSocketContext';
import { clsx } from 'clsx';

/**
 * User and typing interfaces based on official patterns
 * Following WebSocket real-time best practices
 */
interface TypingUser {
  id: string;
  name: string;
  avatar?: string;
  startedTypingAt: Date;
}

interface TypingIndicatorProps {
  /** Current chat/room ID */
  chatId?: string;
  /** Users currently typing */
  typingUsers?: TypingUser[];
  /** Current user ID to exclude from display */
  currentUserId?: string;
  /** Maximum users to display before showing count */
  maxDisplayUsers?: number;
  /** Auto-hide timeout in milliseconds */
  autoHideTimeout?: number;
  /** Custom styling variant */
  variant?: 'default' | 'compact' | 'minimal';
  /** Custom position */
  position?: 'inline' | 'floating' | 'overlay';
  /** Show avatars */
  showAvatars?: boolean;
  /** Animation type */
  animation?: 'dots' | 'wave' | 'pulse' | 'typing';
  /** Custom className */
  className?: string;
}

/**
 * Typing Dots Animation Component
 * Based on Material Design and modern chat patterns
 */
const TypingDots = memo<{
  variant: 'dots' | 'wave' | 'pulse' | 'typing';
  size?: 'sm' | 'md' | 'lg';
}>(({ variant, size = 'md' }) => {
  const dotSizes = {
    sm: 'w-1 h-1',
    md: 'w-1.5 h-1.5',
    lg: 'w-2 h-2'
  };

  const dotSize = dotSizes[size];

  const renderDots = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex gap-1">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className={clsx(dotSize, 'bg-current rounded-full')}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: index * 0.2,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        );

      case 'wave':
        return (
          <div className="flex gap-0.5">
            {[0, 1, 2, 3, 4].map((index) => (
              <motion.div
                key={index}
                className={clsx('w-0.5 bg-current rounded-full', size === 'sm' ? 'h-2' : size === 'md' ? 'h-3' : 'h-4')}
                animate={{
                  scaleY: [1, 2, 1],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: index * 0.1,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        );

      case 'pulse':
        return (
          <motion.div
            className={clsx(dotSize, 'bg-current rounded-full')}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        );

      case 'typing':
        return (
          <div className="flex items-center gap-1">
            <motion.div
              className="text-xs"
              animate={{
                opacity: [1, 0.5, 1],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              typing
            </motion.div>
            <div className="flex gap-0.5">
              {[0, 1, 2].map((index) => (
                <motion.div
                  key={index}
                  className={clsx(dotSize, 'bg-current rounded-full')}
                  animate={{
                    y: [0, -2, 0],
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: index * 0.1,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-center text-muted-foreground">
      {renderDots()}
    </div>
  );
});

TypingDots.displayName = 'TypingDots';

/**
 * User Avatar Component for Typing Indicator
 */
const TypingAvatar = memo<{
  user: TypingUser;
  size?: 'sm' | 'md' | 'lg';
}>(({ user, size = 'md' }) => {
  const avatarSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const iconSizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className="relative"
    >
      {user.avatar ? (
        <img
          src={user.avatar}
          alt={user.name}
          className={clsx(avatarSizes[size], 'rounded-full object-cover border border-border')}
        />
      ) : (
        <div className={clsx(
          avatarSizes[size],
          'rounded-full bg-primary/10 flex items-center justify-center border border-border'
        )}>
          <User className={clsx(iconSizes[size], 'text-primary')} />
        </div>
      )}

      {/* Online indicator */}
      <motion.div
        className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-card"
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </motion.div>
  );
});

TypingAvatar.displayName = 'TypingAvatar';

/**
 * Main Typing Indicator Component
 * Real-time typing indicator with WebSocket integration
 */
export const TypingIndicator = memo<TypingIndicatorProps>(({
  chatId,
  typingUsers = [],
  currentUserId,
  maxDisplayUsers = 3,
  autoHideTimeout = 3000,
  variant = 'default',
  position = 'inline',
  showAvatars = true,
  animation = 'dots',
  className,
}) => {
  const { isConnected } = useWebSocketContext();

  // Filter out current user and limit display users
  const displayUsers = useMemo(() => {
    const filtered = typingUsers.filter(user => user.id !== currentUserId);

    // Auto-hide users who have been typing for too long
    const now = new Date();
    const activeUsers = filtered.filter(user => {
      const timeDiff = now.getTime() - user.startedTypingAt.getTime();
      return timeDiff < autoHideTimeout;
    });

    return activeUsers.slice(0, maxDisplayUsers);
  }, [typingUsers, currentUserId, maxDisplayUsers, autoHideTimeout]);

  const remainingCount = Math.max(0, typingUsers.length - (currentUserId ? 1 : 0) - maxDisplayUsers);

  // Format typing message
  const getTypingMessage = useCallback(() => {
    const count = displayUsers.length;

    if (count === 0) return null;

    if (count === 1) {
      return `${displayUsers[0].name} is typing...`;
    }

    if (count === 2) {
      return `${displayUsers[0].name} and ${displayUsers[1].name} are typing...`;
    }

    if (count === 3 && remainingCount === 0) {
      return `${displayUsers[0].name}, ${displayUsers[1].name}, and ${displayUsers[2].name} are typing...`;
    }

    if (remainingCount > 0) {
      return `${displayUsers[0].name} and ${count + remainingCount - 1} others are typing...`;
    }

    return 'Several people are typing...';
  }, [displayUsers, remainingCount]);

  // Don't render if no users are typing
  if (displayUsers.length === 0) {
    return null;
  }

  const typingMessage = getTypingMessage();

  // Base container classes
  const containerClasses = clsx(
    'flex items-center gap-2 text-sm text-muted-foreground transition-all duration-200',
    {
      'p-2': variant === 'default',
      'p-1': variant === 'compact',
      'py-1': variant === 'minimal',
      'fixed bottom-4 left-4 bg-card/90 backdrop-blur-sm border border-border rounded-lg shadow-lg z-50': position === 'floating',
      'absolute bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border': position === 'overlay',
    },
    className
  );

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="typing-indicator"
        initial={{ opacity: 0, y: position === 'inline' ? 5 : position === 'floating' ? 20 : -5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: position === 'inline' ? -5 : position === 'floating' ? 20 : 5 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className={containerClasses}
      >
        {/* Connection status indicator */}
        {!isConnected && (
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" title="Reconnecting..." />
        )}

        {/* User avatars */}
        {showAvatars && variant !== 'minimal' && (
          <div className="flex -space-x-1">
            <AnimatePresence>
              {displayUsers.map((user) => (
                <TypingAvatar
                  key={user.id}
                  user={user}
                  size={variant === 'compact' ? 'sm' : 'md'}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Typing animation */}
        <TypingDots
          variant={animation}
          size={variant === 'compact' ? 'sm' : variant === 'minimal' ? 'sm' : 'md'}
        />

        {/* Typing message */}
        {variant !== 'minimal' && typingMessage && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className={clsx(
              'truncate',
              variant === 'compact' ? 'text-xs' : 'text-sm'
            )}
          >
            {typingMessage}
          </motion.span>
        )}

        {/* Remaining count indicator */}
        {remainingCount > 0 && variant === 'default' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="ml-auto flex-shrink-0 w-5 h-5 bg-muted text-muted-foreground text-xs rounded-full flex items-center justify-center"
          >
            +{remainingCount}
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
});

TypingIndicator.displayName = 'TypingIndicator';

/**
 * Hook for managing typing state with WebSocket
 * Provides debounced typing indicators with automatic cleanup
 */
export const useTypingIndicator = (chatId: string, currentUserId: string) => {
  const { sendMessage } = useWebSocketContext();
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  const startTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      sendMessage({
        type: 'typing_start',
        data: { chatId, userId: currentUserId },
        userId: currentUserId,
      });
    }

    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Set new timeout to stop typing
    const timeout = setTimeout(() => {
      setIsTyping(false);
      sendMessage({
        type: 'typing_stop',
        data: { chatId, userId: currentUserId },
        userId: currentUserId,
      });
    }, 2000);

    setTypingTimeout(timeout);
  }, [isTyping, typingTimeout, sendMessage, chatId, currentUserId]);

  const stopTyping = useCallback(() => {
    if (isTyping) {
      setIsTyping(false);
      sendMessage({
        type: 'typing_stop',
        data: { chatId, userId: currentUserId },
        userId: currentUserId,
      });
    }

    if (typingTimeout) {
      clearTimeout(typingTimeout);
      setTypingTimeout(null);
    }
  }, [isTyping, typingTimeout, sendMessage, chatId, currentUserId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      if (isTyping) {
        sendMessage({
          type: 'typing_stop',
          data: { chatId, userId: currentUserId },
          userId: currentUserId,
        });
      }
    };
  }, []);

  return {
    isTyping,
    startTyping,
    stopTyping,
  };
};

export default TypingIndicator;