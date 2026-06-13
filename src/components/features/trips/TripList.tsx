'use client'

import { useState, memo } from 'react'
import { TripCard, TripCardSkeleton } from './TripCard'
import { Button } from '@/components/ui/button'
import { useTrips } from '@/hooks/useTrips'
import { Calendar, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface TripListProps {
  className?: string
}

export const TripList = memo(function TripList({ className = '' }: TripListProps) {
  const router = useRouter()
  const { trips, loading, error, hasMore, loadMore, refresh } = useTrips()
  const [loadingMore, setLoadingMore] = useState(false)

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

  const handleTripDelete = async (tripId: string) => {
    // TODO: Implement trip deletion
    console.log('Delete trip:', tripId)
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
      {/* Trip Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {trips.map(trip => (
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
