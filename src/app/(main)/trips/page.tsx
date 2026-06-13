'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TripList } from '@/components/features/trips/TripList'
import { TripFilters } from '@/components/features/trips/TripFilters'
import { useTrips } from '@/hooks/useTrips'
import { Calendar, MapPin, Plus, Filter } from 'lucide-react'

export default function TripsPage() {
  const router = useRouter()
  const [showFilters, setShowFilters] = useState(false)
  const { trips, filter, setFilter } = useTrips()

  // Calculate trip counts for filter badges
  const getTripCounts = () => {
    const now = new Date()
    return {
      all: trips.length,
      upcoming: trips.filter(trip => new Date(trip.startDate) > now).length,
      ongoing: trips.filter(trip => {
        const start = new Date(trip.startDate)
        const end = new Date(trip.endDate)
        return start <= now && end >= now
      }).length,
      completed: trips.filter(trip => new Date(trip.endDate) < now).length,
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Trips</h1>
          <p className="text-muted-foreground">Where are you headed next?</p>
        </div>
        <button
          onClick={() => router.push('/trips/new')}
          className="flex items-center space-x-2 rounded-xl bg-brand px-4 py-2 text-brand-foreground transition-colors hover:bg-brand/90"
        >
          <Plus className="h-4 w-4" />
          <span>New Trip</span>
        </button>
      </div>

      {/* Trip Planner Card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Plan Your Next Adventure</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-muted p-4">
            <Calendar className="mb-2 h-6 w-6 text-brand-500" />
            <h3 className="mb-1 font-medium text-foreground">Destination</h3>
            <p className="text-sm text-muted-foreground">Where do you want to go?</p>
          </div>
          <div className="rounded-xl bg-muted p-4">
            <MapPin className="mb-2 h-6 w-6 text-sun-500" />
            <h3 className="mb-1 font-medium text-foreground">Dates</h3>
            <p className="text-sm text-muted-foreground">When are you traveling?</p>
          </div>
          <div className="rounded-xl bg-muted p-4">
            <Filter className="mb-2 h-6 w-6 text-coral-500" />
            <h3 className="mb-1 font-medium text-foreground">Activities</h3>
            <p className="text-sm text-muted-foreground">What do you want to do?</p>
          </div>
        </div>
      </div>

      {/* Trip Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-xl bg-card p-4 text-center shadow-card">
          <p className="text-2xl font-bold text-foreground">{trips.length}</p>
          <p className="text-sm text-muted-foreground">Total Trips</p>
        </div>
        <div className="rounded-xl bg-card p-4 text-center shadow-card">
          <p className="text-2xl font-bold text-foreground">{getTripCounts().upcoming}</p>
          <p className="text-sm text-muted-foreground">Upcoming</p>
        </div>
        <div className="rounded-xl bg-card p-4 text-center shadow-card">
          <p className="text-2xl font-bold text-foreground">{getTripCounts().ongoing}</p>
          <p className="text-sm text-muted-foreground">Ongoing</p>
        </div>
        <div className="rounded-xl bg-card p-4 text-center shadow-card">
          <p className="text-2xl font-bold text-foreground">{getTripCounts().completed}</p>
          <p className="text-sm text-muted-foreground">Completed</p>
        </div>
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">My Trips</h2>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 rounded-lg bg-muted px-4 py-2 transition-colors hover:bg-muted/80"
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="rounded-lg border border-border bg-card p-6">
          <TripFilters filter={filter} onFilterChange={setFilter} tripCounts={getTripCounts()} />
        </div>
      )}

      {/* Trip List */}
      <TripList />
    </div>
  )
}
