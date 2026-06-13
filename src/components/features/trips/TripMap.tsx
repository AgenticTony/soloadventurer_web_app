'use client'

import React from 'react'
import { MapPin, Navigation, Maximize2 } from 'lucide-react'

interface TripMapProps {
  tripId: string
  className?: string
}

export function TripMap({ tripId, className = '' }: TripMapProps) {
  // Default coordinates for demo (San Francisco)
  const defaultLat = 37.7749
  const defaultLng = -122.4194
  const defaultLocation = 'San Francisco, CA'

  const handleExpandMap = () => {
    // TODO: Implement full-screen map view
    console.log('Expand map for trip:', tripId)
  }

  const handleGetDirections = () => {
    // TODO: Implement directions to trip location
    console.log('Get directions for trip:', tripId)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Map Container */}
      <div className="group relative h-64 overflow-hidden rounded-xl bg-muted">
        {/* Static Map Placeholder - TODO: Replace with real map */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-100 to-sky-100">
          <div className="text-center">
            <MapPin className="mx-auto mb-2 h-12 w-12 text-brand-500" />
            <p className="text-sm font-medium text-foreground">{defaultLocation}</p>
            <p className="text-xs text-muted-foreground">
              {defaultLat.toFixed(4)}, {defaultLng.toFixed(4)}
            </p>
          </div>
        </div>

        {/* Map Overlay Controls */}
        <div className="absolute right-3 top-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={handleExpandMap}
            className="rounded-lg bg-white/90 p-2 shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
            title="Expand map"
          >
            <Maximize2 className="h-4 w-4 text-muted-foreground" />
          </button>
          <button
            onClick={handleGetDirections}
            className="rounded-lg bg-white/90 p-2 shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
            title="Get directions"
          >
            <Navigation className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Map Info */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>Trip Location</span>
        </div>
        <div className="text-right">
          <p className="font-medium text-foreground">{defaultLocation}</p>
          <p className="text-xs text-muted-foreground">
            Coordinates: {defaultLat.toFixed(4)}, {defaultLng.toFixed(4)}
          </p>
        </div>
      </div>

      {/* Map Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleGetDirections}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm text-white transition-colors hover:bg-brand-600"
        >
          <Navigation className="h-4 w-4" />
          <span>Get Directions</span>
        </button>
        <button
          onClick={handleExpandMap}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-muted px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted/80"
        >
          <Maximize2 className="h-4 w-4" />
          <span>View Full Map</span>
        </button>
      </div>

      {/* Map Feature Notice */}
      <div className="rounded-lg border border-sun-200 bg-sun-50 p-3">
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-sun-600" />
          <div className="text-sm">
            <p className="font-medium text-sun-800">Interactive Map Coming Soon</p>
            <p className="mt-1 text-sun-700">
              This is a placeholder for the trip location map. Real map integration with location
              markers will be available in a future update.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
