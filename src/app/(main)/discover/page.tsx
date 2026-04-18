'use client';

import { Suspense } from 'react';
import { UserSearch, UserGrid } from '@/components/users';
import { useUserSearch } from '@/hooks/useUserSearch';
import { NearbyTravelersSection } from '@/components/features/matching/NearbyTravelersSection';

// ── Page Content ───────────────────────────────────────────────

function DiscoverPageContent() {
  const {
    users,
    loading,
    error,
    hasMore,
    totalCount,
    filters,
    searchHistory,
    setQuery,
    setLocation,
    setRadiusKm,
    setInterests,
    loadMore,
    refresh,
    clearHistory,
  } = useUserSearch();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Discover Travelers
          </h1>
          <p className="text-lg text-gray-600">
            Find fellow adventurers, connect with locals, and discover travel companions
          </p>
        </div>

        {/* Nearby Travelers */}
        <NearbyTravelersSection />

        {/* Search Component */}
        <UserSearch
          query={filters.query}
          location={filters.location}
          radiusKm={filters.radiusKm}
          interests={filters.interests}
          searchHistory={searchHistory}
          onQueryChange={setQuery}
          onLocationChange={setLocation}
          onRadiusChange={setRadiusKm}
          onInterestsChange={setInterests}
          onClearHistory={clearHistory}
          className="mb-8"
        />

        {/* User Grid */}
        <UserGrid
          users={users}
          loading={loading}
          hasMore={hasMore}
          error={error}
          totalCount={totalCount}
          onLoadMore={loadMore}
          onRefresh={refresh}
        />
      </div>
    </div>
  );
}

// Loading fallback component
function DiscoverPageLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded-lg w-64 mb-2 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded-lg w-96 animate-pulse"></div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-8">
          <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
              <div className="h-12 bg-gray-200 rounded mb-3"></div>
              <div className="flex justify-center gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="text-center">
                    <div className="h-4 bg-gray-200 rounded w-6 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-8"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={<DiscoverPageLoading />}>
      <DiscoverPageContent />
    </Suspense>
  );
}
