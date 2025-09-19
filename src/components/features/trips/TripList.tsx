'use client';

import { useState, memo } from 'react';
import { TripCard, TripCardSkeleton } from './TripCard';
import { Button } from '@/components/ui/button';
import { useTrips } from '@/hooks/useTrips';
import { Calendar, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TripListProps {
  className?: string;
}

export const TripList = memo(function TripList({ className = '' }: TripListProps) {
  const router = useRouter();
  const { trips, loading, error, hasMore, loadMore, refresh } = useTrips();
  const [loadingMore, setLoadingMore] = useState(false);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    await loadMore();
    setLoadingMore(false);
  };

  const handleTripView = (tripId: string) => {
    router.push(`/trips/${tripId}`);
  };

  const handleTripEdit = (tripId: string) => {
    router.push(`/trips/${tripId}/edit`);
  };

  const handleTripDelete = async (tripId: string) => {
    // TODO: Implement trip deletion
    console.log('Delete trip:', tripId);
    // After successful deletion, refresh the list
    await refresh();
  };

  if (loading && trips.length === 0) {
    return (
      <div className={`space-y-6 ${className}`}>
        {Array.from({ length: 3 }).map((_, index) => (
          <TripCardSkeleton key={index} variant="compact" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Trips</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={refresh} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No trips found</h3>
        <p className="text-muted-foreground mb-4">
          Start planning your next adventure!
        </p>
        <Button onClick={() => router.push('/trips/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Create Your First Trip
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Trip Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {trips.map((trip) => (
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
        <div className="text-center pt-6">
          <Button
            onClick={handleLoadMore}
            disabled={loadingMore}
            variant="outline"
          >
            {loadingMore ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2" />
                Loading...
              </>
            ) : (
              'Load More Trips'
            )}
          </Button>
        </div>
      )}
    </div>
  );
});

// Helper functions to adapt API data to existing TripCard interface
function getDuration(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return '1 day';
  if (diffDays < 7) return `${diffDays} days`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''}`;
  }
  const months = Math.floor(diffDays / 30);
  return `${months} month${months > 1 ? 's' : ''}`;
}

function getStatus(startDate: string, endDate: string): 'upcoming' | 'completed' | 'planning' | 'cancelled' {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start > now) return 'upcoming';
  if (start <= now && end >= now) return 'upcoming'; // Show as upcoming if ongoing
  return 'completed';
}