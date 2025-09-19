'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import type { UserAvatarProps, AvatarSize, UserStatus } from '@/types/user';

const sizeClasses: Record<AvatarSize, string> = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-12 w-12 text-lg',
  xl: 'h-16 w-16 text-xl',
};

const statusColors: Record<UserStatus, string> = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  away: 'bg-yellow-500',
};

const statusSizes: Record<AvatarSize, string> = {
  xs: 'h-1.5 w-1.5',
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
  lg: 'h-3 w-3',
  xl: 'h-4 w-4',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

function generateAvatarColor(name: string): string {
  // Generate consistent color based on name
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
  ];

  const hash = name.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  return colors[Math.abs(hash) % colors.length];
}

export function UserAvatar({
  user,
  size = 'md',
  status,
  showStatus = false,
  className = '',
  alt
}: UserAvatarProps) {
  const initials = useMemo(() => getInitials(user.name), [user.name]);
  const avatarColor = useMemo(() => generateAvatarColor(user.name), [user.name]);
  const altText = alt || `${user.name}'s avatar`;

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        className={`
          ${sizeClasses[size]}
          rounded-full
          overflow-hidden
          flex
          items-center
          justify-center
          ${!user.avatar ? `${avatarColor} text-white font-medium` : 'bg-gray-200'}
        `}
        role="img"
        aria-label={altText}
      >
        {user.avatar ? (
          <Image
            src={user.avatar}
            alt={altText}
            fill
            className="object-cover"
            sizes="(max-width: 64px) 64px, 128px"
            onError={(e) => {
              // Fallback to initials on image error
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.className = `${parent.className} ${avatarColor} text-white font-medium`;
                parent.textContent = initials;
              }
            }}
          />
        ) : (
          <span className="font-medium" aria-hidden="true">
            {initials}
          </span>
        )}
      </div>

      {/* Status indicator */}
      {showStatus && status && (
        <div
          className={`
            absolute
            -bottom-0.5
            -right-0.5
            ${statusSizes[size]}
            ${statusColors[status]}
            rounded-full
            border-2
            border-white
          `}
          role="status"
          aria-label={`User is ${status}`}
          title={`${user.name} is ${status}`}
        />
      )}
    </div>
  );
}

// Skeleton component for loading state
export function UserAvatarSkeleton({
  size = 'md',
  showStatus = false,
  className = ''
}: {
  size?: AvatarSize;
  showStatus?: boolean;
  className?: string;
}) {
  return (
    <div className={`relative inline-block ${className}`} aria-hidden="true">
      <div
        className={`
          ${sizeClasses[size]}
          rounded-full
          bg-gray-200
          animate-pulse
        `}
      />
      {showStatus && (
        <div
          className={`
            absolute
            -bottom-0.5
            -right-0.5
            ${statusSizes[size]}
            bg-gray-300
            rounded-full
            border-2
            border-white
            animate-pulse
          `}
        />
      )}
    </div>
  );
}