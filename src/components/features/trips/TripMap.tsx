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
      <div className="relative bg-muted rounded-xl overflow-hidden h-64 group">
        {/* Static Map Placeholder - TODO: Replace with real map */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-100 to-sky-100 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-brand-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">{defaultLocation}</p>
            <p className="text-xs text-muted-foreground">
              {defaultLat.toFixed(4)}, {defaultLng.toFixed(4)}
            </p>
          </div>
        </div>

        {/* Map Overlay Controls */}
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleExpandMap}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-white transition-colors"
            title="Expand map"
          >
            <Maximize2 className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={handleGetDirections}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-white transition-colors"
            title="Get directions"
          >
            <Navigation className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

      </div>

      {/* Map Info */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="w-4 h-4" />
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
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors text-sm"
        >
          <Navigation className="w-4 h-4" />
          <span>Get Directions</span>
        </button>
        <button
          onClick={handleExpandMap}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors text-sm"
        >
          <Maximize2 className="w-4 h-4" />
          <span>View Full Map</span>
        </button>
      </div>

      {/* Map Feature Notice */}
      <div className="p-3 bg-sun-50 border border-sun-200 rounded-lg">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-sun-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-sun-800">Interactive Map Coming Soon</p>
            <p className="text-sun-700 mt-1">
              This is a placeholder for the trip location map. Real map integration with location markers will be available in a future update.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}