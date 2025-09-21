// WaveList Component - Real-time Wave Management Interface
// Sprint 3: Wave UI Components with Live Updates and Interactions

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWaves, useWave } from '@/hooks/useWaves';
import { WaveWithUsers, WaveType, WaveStatus } from '@/types/wave';

interface WaveListProps {
  /** Optional pre-filtered waves array */
  waves?: WaveWithUsers[];
  /** Wave type filter */
  type?: WaveType | 'all';
  /** Wave status filter */
  status?: WaveStatus[];
  /** Maximum number of waves to display */
  limit?: number;
  /** Show search/filter controls */
  showControls?: boolean;
  /** Enable real-time updates */
  realTimeUpdates?: boolean;
  /** Custom className */
  className?: string;
  /** Callback when wave is clicked */
  onWaveClick?: (wave: WaveWithUsers) => void;
  /** Callback when wave is responded to */
  onWaveRespond?: (wave: WaveWithUsers, response: 'accepted' | 'declined') => void;
}

interface WaveItemProps {
  wave: WaveWithUsers;
  onWaveClick?: (wave: WaveWithUsers) => void;
  onWaveRespond?: (wave: WaveWithUsers, response: 'accepted' | 'declined') => void;
}

const WaveItem: React.FC<WaveItemProps> = ({ wave, onWaveClick, onWaveRespond }) => {
  const { respond, markRead, canRespond, isExpired } = useWave(wave.id);
  const [isResponding, setIsResponding] = React.useState(false);

  const handleRespond = async (response: 'accepted' | 'declined') => {
    if (!canRespond || isResponding) return;

    setIsResponding(true);
    try {
      await respond(response);
      onWaveRespond?.(wave, response);
    } catch (error) {
      console.error('Failed to respond to wave:', error);
    } finally {
      setIsResponding(false);
    }
  };

  const handleMarkRead = React.useCallback(() => {
    if (!wave.isRead) {
      markRead();
    }
  }, [wave.isRead, markRead]);

  React.useEffect(() => {
    // Auto-mark as read when item is clicked
    if (onWaveClick) {
      handleMarkRead();
    }
  }, [onWaveClick, handleMarkRead]);

  // Animation variants
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    hover: {
      scale: 1.02,
      backgroundColor: "rgba(59, 130, 246, 0.05)",
      transition: { duration: 0.2 }
    },
    exit: {
      opacity: 0,
      x: -100,
      transition: { duration: 0.3 }
    }
  };

  const buttonVariants = {
    idle: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };

  // Status styling
  const getStatusStyling = (status: WaveStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'declined':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'expired':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <motion.div
      className={`
        relative p-4 bg-white rounded-lg border border-gray-200 cursor-pointer
        ${!wave.isRead ? 'border-l-4 border-l-blue-500' : ''}
        ${isExpired ? 'opacity-60' : ''}
      `}
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      whileHover="hover"
      onClick={() => {
        handleMarkRead();
        onWaveClick?.(wave);
      }}
      role="article"
      aria-label={`Wave from ${wave.fromUser.name}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleMarkRead();
          onWaveClick?.(wave);
        }
      }}
    >
      {/* Unread indicator */}
      {!wave.isRead && (
        <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full" />
      )}

      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {wave.fromUser.avatar ? (
            <img
              src={wave.fromUser.avatar}
              alt={wave.fromUser.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-medium text-lg">
                {wave.fromUser.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                {wave.fromUser.name}
              </h3>
              {wave.fromUser.location && (
                <p className="text-xs text-gray-500">
                  📍 {wave.fromUser.location}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs text-gray-500">
                {formatTimeAgo(wave.createdAt)}
              </span>
              <span className={`
                px-2 py-1 text-xs font-medium rounded-full border
                ${getStatusStyling(wave.status)}
              `}>
                {wave.status}
              </span>
            </div>
          </div>

          {/* Message */}
          {wave.message && (
            <div className="mb-3">
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2">
                &quot;{wave.message}&quot;
              </p>
            </div>
          )}

          {/* Trip info */}
          {wave.tripId && (
            <div className="mb-3 text-xs text-blue-600">
              🧳 Related to trip
            </div>
          )}

          {/* Mutual match indicator */}
          {wave.isMutual && (
            <div className="mb-3 flex items-center gap-1 text-sm text-green-600">
              ✨ Mutual match!
            </div>
          )}

          {/* Expiry warning */}
          {isExpired && (
            <div className="mb-3 text-xs text-red-600 bg-red-50 rounded px-2 py-1">
              ⏰ This wave has expired
            </div>
          )}

          {/* Action buttons */}
          {canRespond && wave.type === 'received' && (
            <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
              <motion.button
                className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={() => handleRespond('accepted')}
                disabled={isResponding}
                aria-label="Accept wave"
              >
                {isResponding ? '...' : '✓ Accept'}
              </motion.button>

              <motion.button
                className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={() => handleRespond('declined')}
                disabled={isResponding}
                aria-label="Decline wave"
              >
                {isResponding ? '...' : '✗ Decline'}
              </motion.button>
            </div>
          )}
        </div>

        {/* Wave animation */}
        <motion.div
          className="flex-shrink-0 text-2xl"
          animate={{
            rotate: [0, 15, -8, 12, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 4
          }}
        >
          👋
        </motion.div>
      </div>
    </motion.div>
  );
};

export const WaveList: React.FC<WaveListProps> = ({
  waves: externalWaves,
  type = 'all',
  status,
  limit = 20,
  showControls = true,
  realTimeUpdates = true,
  className = '',
  onWaveClick,
  onWaveRespond,
}) => {
  const {
    sentWaves,
    receivedWaves,
    mutualWaves,
    isLoading,
    error,
    refresh
  } = useWaves();

  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedType, setSelectedType] = React.useState<WaveType | 'all'>(type);
  const [selectedStatus] = React.useState<WaveStatus[]>(status || []);

  // Get filtered waves
  const getFilteredWaves = React.useMemo(() => {
    let waves: WaveWithUsers[] = [];

    // Use external waves if provided, otherwise combine from hooks
    if (externalWaves) {
      waves = externalWaves;
    } else {
      // Combine waves based on type filter
      switch (selectedType) {
        case 'sent':
          waves = sentWaves;
          break;
        case 'received':
          waves = receivedWaves;
          break;
        case 'mutual':
          waves = mutualWaves;
          break;
        default:
          waves = [...sentWaves, ...receivedWaves, ...mutualWaves];
      }
    }

    // Apply status filter
    if (selectedStatus.length > 0) {
      waves = waves.filter(wave => selectedStatus.includes(wave.status));
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      waves = waves.filter(wave =>
        wave.fromUser.name.toLowerCase().includes(term) ||
        wave.toUser.name.toLowerCase().includes(term) ||
        (wave.message && wave.message.toLowerCase().includes(term))
      );
    }

    // Sort by creation date (newest first)
    waves.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Apply limit
    return waves.slice(0, limit);
  }, [externalWaves, sentWaves, receivedWaves, mutualWaves, selectedType, selectedStatus, searchTerm, limit]);

  // Auto-refresh when realTimeUpdates is enabled
  React.useEffect(() => {
    if (realTimeUpdates) {
      const interval = setInterval(refresh, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [realTimeUpdates, refresh]);

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-red-600 mb-4">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm">{error}</p>
        </div>
        <button
          onClick={refresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Controls */}
      {showControls && (
        <div className="space-y-3">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search waves..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <svg
              className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as WaveType | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Waves</option>
              <option value="sent">Sent</option>
              <option value="received">Received</option>
              <option value="mutual">Mutual</option>
            </select>

            <button
              onClick={refresh}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>
      )}

      {/* Wave list */}
      <div className="space-y-3" role="list" aria-label="Wave list">
        {isLoading && getFilteredWaves.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading waves...</p>
          </div>
        ) : getFilteredWaves.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-6xl mb-4">👋</div>
            <p className="text-lg font-medium mb-2">No waves found</p>
            <p className="text-sm">
              {searchTerm ? 'Try adjusting your search' : 'Start waving to connect with other travelers!'}
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {getFilteredWaves.map((wave, index) => (
              <motion.div
                key={wave.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
                role="listitem"
              >
                <WaveItem
                  wave={wave}
                  onWaveClick={onWaveClick}
                  onWaveRespond={onWaveRespond}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Load more indicator */}
      {getFilteredWaves.length === limit && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">
            Showing {limit} waves. Use search to find specific waves.
          </p>
        </div>
      )}
    </div>
  );
};

export default WaveList;