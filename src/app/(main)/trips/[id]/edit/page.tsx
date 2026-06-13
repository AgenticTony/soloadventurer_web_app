'use client'

import { useState, useEffect } from 'react'
import { notFound, useRouter } from 'next/navigation'
import { TripEditForm } from '@/components/features/trips/TripEditForm'
import { getTrip, TripsApiError } from '@/lib/api'
import type { Trip } from '@/lib/api'
import { ArrowLeft, Edit } from 'lucide-react'

interface TripEditPageProps {
  params: Promise<{ id: string }>
}

export default function TripEditPage({ params }: TripEditPageProps) {
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

  const handleBack = async () => {
    const { id } = await params
    router.push(`/trips/${id}`)
  }

  const handleCancel = async () => {
    const { id } = await params
    router.push(`/trips/${id}`)
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Trip</span>
          </button>
        </div>

        <div className="animate-pulse rounded-2xl bg-card p-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="h-6 w-1/3 rounded bg-muted" />
              <div className="h-4 w-2/3 rounded bg-muted" />
            </div>
            <div className="space-y-4">
              <div className="h-10 rounded bg-muted" />
              <div className="h-24 rounded bg-muted" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-10 rounded bg-muted" />
                <div className="h-10 rounded bg-muted" />
              </div>
              <div className="h-6 w-1/2 rounded bg-muted" />
            </div>
            <div className="flex gap-4">
              <div className="h-10 flex-1 rounded bg-muted" />
              <div className="h-10 w-24 rounded bg-muted" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Trip</span>
          </button>
        </div>

        <div className="py-12 text-center">
          <div className="rounded-lg border border-red-200 bg-red-50 p-8">
            <h3 className="mb-2 text-lg font-semibold text-red-800">Error Loading Trip</h3>
            <p className="mb-4 text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
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
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Trip</span>
        </button>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Edit className="h-4 w-4" />
          <span>Editing: {trip.title}</span>
        </div>
      </div>

      <TripEditForm trip={trip} onCancel={handleCancel} />
    </div>
  )
}
