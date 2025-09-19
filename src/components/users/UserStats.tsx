'use client';

import type { UserStatsProps, UserCardSize } from '@/types/user';

const sizeStyles: Record<UserCardSize, {
  container: string;
  statValue: string;
  statLabel: string;
}> = {
  small: {
    container: 'gap-3',
    statValue: 'text-sm font-semibold',
    statLabel: 'text-xs text-gray-500',
  },
  medium: {
    container: 'gap-4',
    statValue: 'text-base font-semibold',
    statLabel: 'text-sm text-gray-500',
  },
  large: {
    container: 'gap-6',
    statValue: 'text-lg font-semibold',
    statLabel: 'text-sm text-gray-500',
  },
};

function formatStatValue(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
}

export function UserStats({
  stats,
  size = 'medium',
  isLoading = false,
  className = ''
}: UserStatsProps) {
  const styles = sizeStyles[size];

  if (isLoading) {
    return <UserStatsSkeleton size={size} className={className} />;
  }

  const statItems = [
    {
      key: 'trips',
      label: 'Trips',
      value: stats.tripsCount,
      'aria-label': `${stats.tripsCount} trips taken`,
    },
    {
      key: 'followers',
      label: 'Followers',
      value: stats.followersCount,
      'aria-label': `${stats.followersCount} followers`,
    },
    {
      key: 'following',
      label: 'Following',
      value: stats.followingCount,
      'aria-label': `Following ${stats.followingCount} people`,
    },
    {
      key: 'places',
      label: 'Places',
      value: stats.placesVisited,
      'aria-label': `${stats.placesVisited} places visited`,
    },
  ];

  return (
    <div
      className={`flex justify-center ${styles.container} ${className}`}
      role="group"
      aria-label="User statistics"
    >
      {statItems.map((stat) => (
        <div
          key={stat.key}
          className="text-center"
          role="img"
          aria-label={stat['aria-label']}
        >
          <div className={styles.statValue}>
            {formatStatValue(stat.value)}
          </div>
          <div className={styles.statLabel}>
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}

// Skeleton component for loading state
export function UserStatsSkeleton({
  size = 'medium',
  className = ''
}: {
  size?: UserCardSize;
  className?: string;
}) {
  const styles = sizeStyles[size];

  return (
    <div
      className={`flex justify-center ${styles.container} ${className}`}
      role="group"
      aria-hidden="true"
    >
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="text-center">
          <div className={`${styles.statValue} bg-gray-200 rounded animate-pulse mb-1`}>
            <span className="opacity-0">000</span>
          </div>
          <div className={`${styles.statLabel} bg-gray-200 rounded animate-pulse`}>
            <span className="opacity-0">Label</span>
          </div>
        </div>
      ))}
    </div>
  );
}