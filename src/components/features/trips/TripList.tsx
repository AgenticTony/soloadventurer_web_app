'use client'

import { useState, useMemo, memo } from 'react'
import { TripCard, TripCardSkeleton } from './TripCard'
import { Button } from '@/components/ui/button'
import { useTrips } from '@/hooks/useTrips'
import { tripMatchesSearch } from '@/lib/trips'
import { Calendar, Plus, Search, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface TripListProps {
  className?: string
}

export const TripList = memo(function TripList({ className = '' }: TripListProps) {
  const router = useRouter()
  const { trips, loading, error, hasMore, loadMore, refresh } = useTrips()
  const [loadingMore, setLoadingMore] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Client-side search over the loaded trips. Composes on the paginated set —
  // "Load more" surfaces additional pages so a search can find later matches.
  const filteredTrips = useMemo(
    () => trips.filter(trip => tripMatchesSearch(trip, searchQuery)),
    [trips, searchQuery]
  )

  const handleLoadMore = async () => {
    setLoadingMore(true)
    await loadMore()
    setLoadingMore(false)
  }

  const handleTripView = (tripId: string) => {
    router.push(`/trips/${tripId}`)
  }

  const handleTripEdit = (tripId: string) => {
    router.push(`/trips/${tripId}/edit`)
  }

  // TODO: implement trip deletion (the trip id will be passed by TripCard's onDelete)
  const handleTripDelete = async () => {
    // After successful deletion, refresh the list
    await refresh()
  }

  if (loading && trips.length === 0) {
    return (
      <div className={`space-y-6 ${className}`}>
        {Array.from({ length: 3 }).map((_, index) => (
          <TripCardSkeleton key={index} variant="compact" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className={`py-12 text-center ${className}`}>
        <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
          <h3 className="mb-2 text-lg font-semibold text-red-800">Error Loading Trips</h3>
          <p className="mb-4 text-red-600">{error}</p>
          <Button onClick={refresh} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (trips.length === 0) {
    return (
      <div className={`py-12 text-center ${className}`}>
        <Calendar className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-semibold text-foreground">No trips found</h3>
        <p className="mb-4 text-muted-foreground">Start planning your next adventure!</p>
        <Button onClick={() => router.push('/trips/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Create Your First Trip
        </Button>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search trips by title, destination, or description"
          aria-label="Search trips"
          className="w-full rounded-2xl border border-border bg-muted py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {filteredTrips.length === 0 ? (
        <div className="py-12 text-center">
          <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold text-foreground">No matching trips</h3>
          <p className="mb-4 text-muted-foreground">
            No trips match &ldquo;{searchQuery}&rdquo;.
            {hasMore && ' Try loading more trips to expand your search.'}
          </p>
          <Button onClick={() => setSearchQuery('')} variant="outline">
            Clear Search
          </Button>
        </div>
      ) : (
        <>
          {/* Trip Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTrips.map(trip => (
              <TripCard
                key={trip.id}
                trip={{
                  id: trip.id,
                  title: trip.title,
                  destination: 'Travel Destination', // TODO: Add location field to API
                  startDate: trip.startDate,
                  endDate: trip.endDate,
                  duration: getDuration(trip.startDate, trip.endDate),
                  status: getStatus(trip.startDate, trip.endDate),
                  activities: [], // TODO: Add activities to API
                  companions: [], // TODO: Add companions to API
                  isPublic: !trip.isPrivate,
                  createdAt: trip.createdAt,
                  updatedAt: trip.createdAt,
                  description: undefined, // TODO: Add description to API
                }}
                variant="compact"
                onView={handleTripView}
                onEdit={handleTripEdit}
                onDelete={handleTripDelete}
                showActions={true}
              />
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="pt-6 text-center">
              <Button onClick={handleLoadMore} disabled={loadingMore} variant="outline">
                {loadingMore ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                    Loading...
                  </>
                ) : (
                  'Load More Trips'
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
})

// Helper functions to adapt API data to existing TripCard interface
function getDuration(startDate: string, endDate: string): string {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 1) return '1 day'
  if (diffDays < 7) return `${diffDays} days`
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `${weeks} week${weeks > 1 ? 's' : ''}`
  }
  const months = Math.floor(diffDays / 30)
  return `${months} month${months > 1 ? 's' : ''}`
}

function getStatus(
  startDate: string,
  endDate: string
): 'upcoming' | 'completed' | 'planning' | 'cancelled' {
  const now = new Date()
  const start = new Date(startDate)
  const end = new Date(endDate)

  if (start > now) return 'upcoming'
  if (start <= now && end >= now) return 'upcoming' // Show as upcoming if ongoing
  return 'completed'
}
