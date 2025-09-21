'use client';

import { UserAvatar, UserAvatarSkeleton } from './UserAvatar';
import { UserStats, UserStatsSkeleton } from './UserStats';
import { PrivacyIndicator } from './PrivacyIndicator';
import { WaveButton } from '@/components/waves/WaveButton';
import { useWaves } from '@/hooks/useWaves';
import { useAuth } from '@/contexts/AuthContext';
import type { UserCardProps, UserCardSkeletonProps, UserCardSize } from '@/types/user';
import type { WaveWithUsers } from '@/types/wave';

const sizeStyles: Record<UserCardSize, {
  container: string;
  contentGap: string;
  nameText: string;
  bioText: string;
  avatarSize: 'sm' | 'md' | 'lg';
  statsSize: UserCardSize;
}> = {
  small: {
    container: 'p-3',
    contentGap: 'gap-2',
    nameText: 'text-sm font-semibold',
    bioText: 'text-xs text-gray-600',
    avatarSize: 'sm',
    statsSize: 'small',
  },
  medium: {
    container: 'p-4',
    contentGap: 'gap-3',
    nameText: 'text-base font-semibold',
    bioText: 'text-sm text-gray-600',
    avatarSize: 'md',
    statsSize: 'medium',
  },
  large: {
    container: 'p-6',
    contentGap: 'gap-4',
    nameText: 'text-lg font-semibold',
    bioText: 'text-base text-gray-600',
    avatarSize: 'lg',
    statsSize: 'large',
  },
};

export function UserCard({
  user,
  size = 'medium',
  showStats = true,
  showActions = false,
  isLoading = false,
  className = ''
}: UserCardProps) {
  const styles = sizeStyles[size];
  const { user: currentUser } = useAuth();
  const { getWavesByUser, isConnected, respondToWave } = useWaves();

  // Get wave status with current user
  const getWaveStatus = (): {
    status: 'none' | 'sent' | 'received' | 'mutual';
    wave?: WaveWithUsers;
  } => {
    if (!currentUser) return { status: 'none' };

    const sentWaves = getWavesByUser(currentUser.id);
    const receivedWaves = getWavesByUser(user.id);

    // Check for mutual connection
    const mutualWave = sentWaves.find(w =>
      w.toUserId === user.id && w.status === 'accepted' && w.isMutual
    );
    if (mutualWave) return { status: 'mutual', wave: mutualWave };

    // Check for sent wave
    const sentWave = sentWaves.find(w =>
      w.toUserId === user.id && w.status === 'pending'
    );
    if (sentWave) return { status: 'sent', wave: sentWave };

    // Check for received wave
    const receivedWave = receivedWaves.find(w =>
      w.fromUserId === user.id && w.status === 'pending'
    );
    if (receivedWave) return { status: 'received', wave: receivedWave };

    return { status: 'none' };
  };

  const waveStatus = getWaveStatus();

  if (isLoading) {
    return <UserCardSkeleton size={size} showStats={showStats} showActions={showActions} className={className} />;
  }

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 ${styles.container} ${className}`}
      role="article"
      aria-labelledby={`user-card-${user.id}`}
    >
      <div className={`flex items-start ${styles.contentGap}`}>
        {/* Avatar section */}
        <div className="flex-shrink-0">
          <UserAvatar
            user={user}
            size={styles.avatarSize}
            status={user.isOnline ? 'online' : 'offline'}
            showStatus={true}
          />
        </div>

        {/* Content section */}
        <div className="flex-1 min-w-0">
          <div className={`flex items-center ${styles.contentGap.replace('gap-', 'gap-x-')}`}>
            <h3
              id={`user-card-${user.id}`}
              className={`${styles.nameText} text-gray-900 truncate`}
            >
              {user.name}
            </h3>
            <div className="flex items-center gap-2">
              {user.isVerified && (
                <div
                  className="flex-shrink-0 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center"
                  role="img"
                  aria-label="Verified user"
                  title="Verified user"
                >
                  <svg
                    className="w-2.5 h-2.5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
              {user.locationSharing && (
                <PrivacyIndicator
                  locationSharing={user.locationSharing}
                  precise={user.preciseLocation}
                  size="sm"
                  className="flex-shrink-0"
                />
              )}
            </div>
          </div>

          {user.bio && (
            <p className={`${styles.bioText} mt-1 line-clamp-2`}>
              {user.bio}
            </p>
          )}

          {user.lastSeen && !user.isOnline && (
            <p className="text-xs text-gray-400 mt-1">
              Last seen {user.lastSeen}
            </p>
          )}
        </div>
      </div>

      {/* Stats section */}
      {showStats && user.stats && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <UserStats
            stats={user.stats}
            size={styles.statsSize}
          />
        </div>
      )}

      {/* Actions section with wave functionality */}
      {showActions && currentUser && currentUser.id !== user.id && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            {/* Wave status indicator */}
            <div className="flex items-center gap-2">
              {waveStatus.status === 'mutual' && (
                <div className="flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                  <span className="font-medium">Mutual Connection</span>
                </div>
              )}
              {waveStatus.status === 'sent' && (
                <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  <div className="w-2 h-2 bg-blue-400 rounded-full" />
                  <span className="font-medium">Wave Sent</span>
                </div>
              )}
              {waveStatus.status === 'received' && (
                <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="font-medium">Waved at You</span>
                </div>
              )}
              {!isConnected && (
                <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                  <div className="w-2 h-2 bg-amber-400 rounded-full" />
                  <span className="font-medium">Offline</span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              {waveStatus.status === 'none' && (
                <WaveButton
                  toUserId={user.id}
                  size="sm"
                  variant="primary"
                  className="text-xs"
                  onWaveSent={() => {
                    // Optimistic update handled by WaveButton and store
                  }}
                />
              )}
              {waveStatus.status === 'received' && waveStatus.wave && (
                <div className="flex gap-1">
                  <button
                    className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                    aria-label="Accept wave"
                    onClick={async () => {
                      try {
                        await respondToWave(waveStatus.wave!.id, 'accepted');
                      } catch (error) {
                        console.error('Failed to respond to wave:', error);
                      }
                    }}
                  >
                    Accept
                  </button>
                  <button
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    aria-label="Decline wave"
                    onClick={async () => {
                      try {
                        await respondToWave(waveStatus.wave!.id, 'declined');
                      } catch (error) {
                        console.error('Failed to respond to wave:', error);
                      }
                    }}
                  >
                    Decline
                  </button>
                </div>
              )}
              <button
                disabled
                className="px-3 py-1.5 text-xs font-medium text-gray-400 bg-gray-100 rounded-md cursor-not-allowed"
                aria-label="Message user (coming soon)"
              >
                Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function UserCardSkeleton({
  size = 'medium',
  showStats = true,
  showActions = false,
  className = ''
}: UserCardSkeletonProps) {
  const styles = sizeStyles[size];

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 ${styles.container} ${className}`}
      role="article"
      aria-hidden="true"
    >
      <div className={`flex items-start ${styles.contentGap}`}>
        {/* Avatar skeleton */}
        <div className="flex-shrink-0">
          <UserAvatarSkeleton
            size={styles.avatarSize}
            showStatus={true}
          />
        </div>

        {/* Content skeleton */}
        <div className="flex-1 min-w-0">
          <div className={`flex items-center ${styles.contentGap.replace('gap-', 'gap-x-')}`}>
            <div className={`${styles.nameText} bg-gray-200 rounded animate-pulse`}>
              <span className="opacity-0">John Doe</span>
            </div>
            <div className="w-4 h-4 bg-gray-200 rounded-full animate-pulse" />
          </div>

          <div className={`${styles.bioText} bg-gray-200 rounded animate-pulse mt-1`}>
            <span className="opacity-0">This is a sample bio text that might span multiple lines</span>
          </div>

          <div className="text-xs bg-gray-200 rounded animate-pulse mt-1 w-24">
            <span className="opacity-0">Last seen 2h ago</span>
          </div>
        </div>
      </div>

      {/* Stats skeleton */}
      {showStats && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <UserStatsSkeleton size={styles.statsSize} />
        </div>
      )}

      {/* Actions skeleton */}
      {showActions && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-center">
          <div className="flex gap-2">
            <div className="px-3 py-1.5 text-xs bg-gray-200 rounded-md animate-pulse">
              <span className="opacity-0">Follow</span>
            </div>
            <div className="px-3 py-1.5 text-xs bg-gray-200 rounded-md animate-pulse">
              <span className="opacity-0">Message</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}