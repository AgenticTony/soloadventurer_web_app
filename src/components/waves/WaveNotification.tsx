// WaveNotification Component - Real-time Wave Notifications with Badge
// Sprint 3: Wave UI Components with Live Updates

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWaveNotifications } from '@/hooks/useWaves';
import { WaveWithUsers } from '@/types/wave';

interface WaveNotificationProps {
  /** Show notification badge */
  showBadge?: boolean;
  /** Badge position */
  badgePosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  /** Badge variant */
  badgeVariant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  /** Maximum count to display before showing "9+" */
  maxCount?: number;
  /** Show notification dropdown */
  showDropdown?: boolean;
  /** Custom className */
  className?: string;
  /** Click handler for notifications */
  onClick?: (wave: WaveWithUsers) => void;
  /** Click handler for badge */
  onBadgeClick?: () => void;
}

export const WaveNotification: React.FC<WaveNotificationProps> = ({
  showBadge = true,
  badgePosition = 'top-right',
  badgeVariant = 'primary',
  maxCount = 9,
  showDropdown = false,
  className = '',
  onClick,
  onBadgeClick,
}) => {
  const { unreadCount, pendingWaves, isConnected } = useWaveNotifications();
  const [isOpen, setIsOpen] = React.useState(false);

  // Badge position classes
  const badgePositionClasses = {
    'top-right': '-top-2 -right-2',
    'top-left': '-top-2 -left-2',
    'bottom-right': '-bottom-2 -right-2',
    'bottom-left': '-bottom-2 -left-2',
  };

  // Badge variant classes
  const badgeVariantClasses = {
    primary: 'bg-blue-600 text-white',
    secondary: 'bg-gray-600 text-white',
    success: 'bg-green-600 text-white',
    warning: 'bg-yellow-500 text-white',
    danger: 'bg-red-600 text-white',
  };

  // Format count for display
  const displayCount = unreadCount > maxCount ? `${maxCount}+` : unreadCount.toString();

  // Handle badge click
  const handleBadgeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showDropdown) {
      setIsOpen(!isOpen);
    }
    onBadgeClick?.();
  };

  // Handle notification click
  const handleNotificationClick = (wave: WaveWithUsers) => {
    onClick?.(wave);
    setIsOpen(false);
  };

  // Animation variants
  const badgeVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30
      }
    },
    pulse: {
      scale: [1, 1.2, 1],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        repeatDelay: 2
      }
    }
  };

  const dropdownVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: -10,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  const notificationVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    hover: {
      scale: 1.02,
      backgroundColor: "rgba(59, 130, 246, 0.05)",
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main notification icon */}
      <div className="relative">
        {/* Wave icon */}
        <svg
          className="w-6 h-6 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 4V2C7 1.45 7.45 1 8 1S9 1.45 9 2V4.13C9.72 4.06 10.46 4.24 11.03 4.66L18.5 9.5C19.43 10.07 19.77 11.29 19.2 12.22S17.29 13.27 16.36 12.7L13 10.54V11.5C13 12.33 12.33 13 11.5 13S10 12.33 10 11.5V4C10 3.45 9.55 3 9 3S8 3.45 8 4V12C8 12.55 7.55 13 7 13S6 12.55 6 12V4C6 2.9 6.9 2 8 2S10 2.9 10 4V4.13C11.17 3.47 12.58 3.61 13.64 4.36L19.78 8.44C21.7 9.67 22.25 12.18 21.02 14.1S16.82 17.75 14.9 16.52L9.17 12.96C8.5 12.58 8 11.83 8 11V4Z"
          />
        </svg>

        {/* Connection status indicator */}
        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`} />

        {/* Notification badge */}
        <AnimatePresence>
          {showBadge && unreadCount > 0 && (
            <motion.button
              className={`
                absolute ${badgePositionClasses[badgePosition]}
                min-w-[1.25rem] h-5 px-1 rounded-full text-xs font-medium
                flex items-center justify-center cursor-pointer
                focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2
                ${badgeVariantClasses[badgeVariant]}
              `}
              variants={badgeVariants}
              initial="hidden"
              animate={unreadCount > 0 ? ["visible", "pulse"] : "visible"}
              exit="hidden"
              onClick={handleBadgeClick}
              aria-label={`${unreadCount} unread waves`}
              aria-live="polite"
              aria-atomic="true"
            >
              {displayCount}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Dropdown notification panel */}
      <AnimatePresence>
        {showDropdown && isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown panel */}
            <motion.div
              className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">
                    Wave Notifications
                  </h3>
                  <div className={`flex items-center gap-1 text-xs ${
                    isConnected ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      isConnected ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    {isConnected ? 'Connected' : 'Offline'}
                  </div>
                </div>
              </div>

              {/* Notifications list */}
              <div className="max-h-64 overflow-y-auto">
                {pendingWaves.length === 0 ? (
                  <div className="px-4 py-6 text-center text-gray-500 text-sm">
                    No pending waves
                  </div>
                ) : (
                  <div className="py-2" role="list" aria-label="Pending waves">
                    <AnimatePresence>
                      {pendingWaves.slice(0, 5).map((wave, index) => (
                        <motion.div
                          key={wave.id}
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          variants={notificationVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          whileHover="hover"
                          onClick={() => handleNotificationClick(wave)}
                          role="listitem"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleNotificationClick(wave);
                            }
                          }}
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <div className="flex items-start gap-3">
                            {/* Avatar */}
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              {wave.fromUser.avatar ? (
                                <img
                                  src={wave.fromUser.avatar}
                                  alt={wave.fromUser.name}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-blue-600 text-sm font-medium">
                                  {wave.fromUser.name.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {wave.fromUser.name}
                              </p>
                              {wave.message && (
                                <p className="text-sm text-gray-600 truncate">
                                  &quot;{wave.message}&quot;
                                </p>
                              )}
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(wave.createdAt).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>

                            {/* Wave icon */}
                            <motion.div
                              className="text-blue-500"
                              animate={{
                                rotate: [0, 15, -8, 12, 0]
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                repeatDelay: 3
                              }}
                            >
                              👋
                            </motion.div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}

                {/* View all link */}
                {pendingWaves.length > 5 && (
                  <div className="px-4 py-3 border-t border-gray-200">
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      View all {pendingWaves.length} waves
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Screen reader announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {unreadCount > 0 && `You have ${unreadCount} unread wave${unreadCount === 1 ? '' : 's'}`}
      </div>
    </div>
  );
};

export default WaveNotification;