'use client'

import { useState, useEffect, memo } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { getMapTrips } from '@/lib/api'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useTripFilters } from '@/hooks/useTripFilters'
import type { Trip } from '@/lib/api'

// Dynamically import the heavy ExploreMap component that contains Mapbox
const ExploreMap = dynamic(
  () => import('@/components/features/ExploreMap').then(mod => ({ default: mod.ExploreMap })),
  {
    loading: () => (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Initializing map...</p>
        </div>
      </div>
    ),
    ssr: false,
  }
)

export const ExploreMapContainer = memo(function ExploreMapContainer() {
  const { user, isLoading: authLoading } = useAuth()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize trip filters hook
  const tripFilters = useTripFilters(trips)

  useEffect(() => {
    async function loadTrips() {
      if (authLoading) return

      if (!user) {
        setLoading(false)
        setError('Please sign in to view trips on the map')
        return
      }

      try {
        setLoading(true)
        setError(null)
        const mapTrips = await getMapTrips()
        setTrips(mapTrips)
      } catch (err) {
        console.error('Failed to load map trips:', err)
        setError('Failed to load trips for map. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadTrips()
  }, [user, authLoading])

  if (authLoading || loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">
            {authLoading ? 'Checking authentication...' : 'Loading trips...'}
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="p-8 text-center">
          <div className="mb-4 text-blue-500">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-semibold text-gray-900">Sign In Required</h2>
          <p className="mb-4 text-gray-600">Please sign in to explore trips on the map.</p>
          <a
            href="/sign-in"
            className="inline-block rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
          >
            Sign In
          </a>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="p-8 text-center">
          <div className="mb-4 text-red-500">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.98-.833-2.75 0L3.064 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-semibold text-gray-900">Failed to Load Trips</h2>
          <p className="mb-4 text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Show empty state if no trips
  if (trips.length === 0) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="p-8 text-center">
          <div className="mb-4 text-gray-400">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 9m0 8V9m0 0V7"
              />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-semibold text-gray-900">No Public Trips Found</h2>
          <p className="mb-4 text-gray-600">There are no public trips to display on the map yet.</p>
          <Link
            href="/trips"
            className="inline-block rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
          >
            Create Your First Trip
          </Link>
        </div>
      </div>
    )
  }

  return <ExploreMap trips={tripFilters.filteredTrips} tripFilters={tripFilters} />
})
