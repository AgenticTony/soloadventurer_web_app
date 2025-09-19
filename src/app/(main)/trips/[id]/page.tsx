'use client'

import { useState, useEffect } from 'react'
import { notFound, useRouter } from 'next/navigation'
import { TripDetail } from '@/components/features/trips/TripDetail'
import { getTrip, TripsApiError } from '@/lib/api'
import type { Trip } from '@/lib/api'
import { ArrowLeft } from 'lucide-react'

interface TripDetailPageProps {
  params: Promise<{ id: string }>
}

export default function TripDetailPage({ params }: TripDetailPageProps) {
  const router = useRouter()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadTrip() {
      try {
        const { id } = await params
        setLoading(true)
        setError(null)

        const tripData = await getTrip(id)
        setTrip(tripData)
      } catch (err) {
        if (err instanceof TripsApiError) {
          if (err.message.includes('not found') || err.message.includes('404')) {
            notFound()
          }
          setError(err.message)
        } else {
          setError('Failed to load trip')
        }
      } finally {
        setLoading(false)
      }
    }

    loadTrip()
  }, [params])

  const handleBack = () => {
    router.push('/trips')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Trips</span>
          </button>
        </div>

        <div className="bg-card rounded-2xl p-8 animate-pulse">
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-48 bg-muted rounded" />
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-2/3" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Trips</span>
          </button>
        </div>

        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Trip</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!trip) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Trips</span>
        </button>
      </div>

      <TripDetail trip={trip} />
    </div>
  )
}