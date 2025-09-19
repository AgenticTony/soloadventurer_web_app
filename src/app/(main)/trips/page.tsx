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
            <p className="text-muted-foreground">Plan and track your adventures</p>
          </div>
          <button
            onClick={() => router.push('/trips/new')}
            className="flex items-center space-x-2 px-4 py-2 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Trip</span>
          </button>
        </div>

        {/* Trip Planner Card */}
        <div className="p-6 bg-card rounded-2xl shadow-card border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">Plan Your Next Adventure</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted rounded-xl">
              <Calendar className="w-6 h-6 text-brand-500 mb-2" />
              <h3 className="font-medium text-foreground mb-1">Destination</h3>
              <p className="text-sm text-muted-foreground">Where do you want to go?</p>
            </div>
            <div className="p-4 bg-muted rounded-xl">
              <MapPin className="w-6 h-6 text-sun-500 mb-2" />
              <h3 className="font-medium text-foreground mb-1">Dates</h3>
              <p className="text-sm text-muted-foreground">When are you traveling?</p>
            </div>
            <div className="p-4 bg-muted rounded-xl">
              <Filter className="w-6 h-6 text-coral-500 mb-2" />
              <h3 className="font-medium text-foreground mb-1">Activities</h3>
              <p className="text-sm text-muted-foreground">What do you want to do?</p>
            </div>
          </div>
        </div>

        {/* Trip Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-card rounded-xl shadow-card">
            <p className="text-2xl font-bold text-foreground">{trips.length}</p>
            <p className="text-sm text-muted-foreground">Total Trips</p>
          </div>
          <div className="text-center p-4 bg-card rounded-xl shadow-card">
            <p className="text-2xl font-bold text-foreground">{getTripCounts().upcoming}</p>
            <p className="text-sm text-muted-foreground">Upcoming</p>
          </div>
          <div className="text-center p-4 bg-card rounded-xl shadow-card">
            <p className="text-2xl font-bold text-foreground">{getTripCounts().ongoing}</p>
            <p className="text-sm text-muted-foreground">Ongoing</p>
          </div>
          <div className="text-center p-4 bg-card rounded-xl shadow-card">
            <p className="text-2xl font-bold text-foreground">{getTripCounts().completed}</p>
            <p className="text-sm text-muted-foreground">Completed</p>
          </div>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">My Trips</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-card border border-border rounded-lg p-6">
            <TripFilters
              filter={filter}
              onFilterChange={setFilter}
              tripCounts={getTripCounts()}
            />
          </div>
        )}

        {/* Trip List */}
        <TripList />
      </div>
  )
}