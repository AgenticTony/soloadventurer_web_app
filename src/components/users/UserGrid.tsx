'use client';

import { useEffect, useRef, useCallback } from 'react';
import { UserCard, UserCardSkeleton } from './UserCard';
import { Users, Search } from 'lucide-react';
import type { UserProfile } from '@/types/user';

export interface UserGridProps {
  users: UserProfile[];
  loading: boolean;
  hasMore: boolean;
  error: string | null;
  totalCount: number;
  onLoadMore: () => void;
  onRefresh: () => void;
  className?: string;
}

export function UserGrid({
  users,
  loading,
  hasMore,
  error,
  totalCount,
  onLoadMore,
  onRefresh,
  className = ''
}: UserGridProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Infinite scroll intersection observer
  const setupIntersectionObserver = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !loading) {
          onLoadMore();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px',
      }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }
  }, [hasMore, loading, onLoadMore]);

  useEffect(() => {
    setupIntersectionObserver();
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [setupIntersectionObserver]);

  // Empty state when no users found
  if (!loading && users.length === 0 && !error) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Search className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
        <p className="text-gray-500 text-center max-w-sm mb-4">
          Try adjusting your search criteria or location filters to find more travelers.
        </p>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Reset Search
        </button>
      </div>
    );
  }

  // Error state
  if (error && users.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <Users className="h-8 w-8 text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
        <p className="text-gray-500 text-center max-w-sm mb-4">{error}</p>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Results header */}
      {users.length > 0 && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-600">
              {users.length} of {totalCount > users.length ? `${totalCount}+` : totalCount} travelers
            </span>
          </div>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full">
              {error}
            </div>
          )}
        </div>
      )}

      {/* Users grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {users.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            size="medium"
            showStats={true}
            showActions={true}
            className="hover:shadow-lg transition-shadow duration-200"
          />
        ))}

        {/* Loading skeletons */}
        {loading && (
          <>
            {Array.from({ length: users.length === 0 ? 8 : 4 }).map((_, index) => (
              <UserCardSkeleton
                key={`skeleton-${index}`}
                size="medium"
                showStats={true}
                showActions={true}
              />
            ))}
          </>
        )}
      </div>

      {/* Load more trigger element */}
      {hasMore && users.length > 0 && (
        <div
          ref={loadMoreRef}
          className="flex justify-center py-8"
        >
          {loading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
              Loading more...
            </div>
          ) : (
            <button
              onClick={onLoadMore}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Load More
            </button>
          )}
        </div>
      )}

      {/* End of results message */}
      {!hasMore && users.length > 0 && (
        <div className="flex justify-center py-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-sm text-gray-500">
              You&apos;ve seen all {users.length} travelers matching your search
            </p>
          </div>
        </div>
      )}
    </div>
  );
}