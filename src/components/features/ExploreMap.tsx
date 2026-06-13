'use client'

import { useEffect, useRef, useState, memo } from 'react'
import mapboxgl from 'mapbox-gl'
import { AlertCircle, Navigation } from 'lucide-react'
import type { Trip } from '@/lib/api'
import { useGeolocation } from '@/hooks/useGeolocation'
import { UserLocationMarker } from '@/components/map/UserLocationMarker'
import { FilterPanel } from '@/components/map/FilterPanel'
import type { UseTripFiltersReturn } from '@/hooks/useTripFilters'
import {
  initializeMapbox,
  createMap,
  convertTripsToGeoJSON,
  addTripMarkers,
  MapboxError,
  DEFAULT_MAP_CONFIG,
} from '@/lib/map/mapbox'

import 'mapbox-gl/dist/mapbox-gl.css'

interface ExploreMapProps {
  trips: Trip[]
  tripFilters: UseTripFiltersReturn
}

export const ExploreMap = memo(function ExploreMap({ trips, tripFilters }: ExploreMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const geolocateControl = useRef<mapboxgl.GeolocateControl | null>(null)
  const userMarker = useRef<mapboxgl.Marker | null>(null)
  const inited = useRef(false)

  const [mapError, setMapError] = useState<string | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  const {
    position,
    loading: locationLoading,
    error: locationError,
    permission,
    requestPosition,
    clearError,
  } = useGeolocation()

  // Only construct map once - HMR-friendly
  useEffect(() => {
    if (!mapContainer.current || inited.current) return

    try {
      initializeMapbox()
      inited.current = true

      const m = createMap({
        container: mapContainer.current,
        ...DEFAULT_MAP_CONFIG,
      })

      mapRef.current = m

      // Add GeolocateControl
      try {
        geolocateControl.current = new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000,
          },
          trackUserLocation: false,
          showUserHeading: false,
          showAccuracyCircle: true,
        })

        m.addControl(geolocateControl.current, 'top-right')
      } catch (controlError) {
        console.warn('Failed to add GeolocateControl:', controlError)
      }

      m.on('load', () => {
        setMapLoaded(true)
      })
    } catch (error) {
      if (error instanceof MapboxError) {
        setMapError(error.message)
      } else {
        setMapError('Failed to initialize map')
        console.error('Map initialization error:', error)
      }
    }

    return () => {
      if (mapRef.current) {
        try {
          if (geolocateControl.current) {
            mapRef.current.removeControl(geolocateControl.current)
          }
          if (userMarker.current) {
            userMarker.current.remove()
          }
          mapRef.current.remove()
        } catch (error) {
          console.warn('Error during map cleanup:', error)
        }
      }
      mapRef.current = null
      geolocateControl.current = null
      userMarker.current = null
      inited.current = false
    }
  }, [mapContainer])

  // Separate effect for trip markers with explicit dependencies
  useEffect(() => {
    const m = mapRef.current
    if (!m || !mapLoaded) return

    if (trips.length === 0) {
      // Clear any existing markers when no trips
      const source = m.getSource('trip-markers')
      if (source) {
        m.removeLayer('trip-markers')
        m.removeSource('trip-markers')
      }
      return
    }

    const geoJSON = convertTripsToGeoJSON(trips)
    addTripMarkers(m, geoJSON)
  }, [trips, mapLoaded])

  // Center map on user location when first obtained & update filter location
  useEffect(() => {
    const m = mapRef.current
    if (!m || !position || !mapLoaded) return

    // Update filters with user location for distance filtering
    tripFilters.setUserLocation(position)

    // Only center map on first position acquisition
    if (!userMarker.current) {
      m.easeTo({
        center: [position.longitude, position.latitude],
        zoom: 12,
        duration: 1000,
      })
    }
  }, [position, mapLoaded, tripFilters])

  if (mapError) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-100">
        <div className="p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">Map Unavailable</h3>
          <p className="mb-4 text-gray-600">{mapError}</p>
          {mapError.includes('Mapbox token') && (
            <div className="text-sm text-gray-500">
              <p>To use the map feature:</p>
              <ol className="mt-2 list-inside list-decimal space-y-1">
                <li>
                  Get a free token from{' '}
                  <a
                    href="https://account.mapbox.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Mapbox
                  </a>
                </li>
                <li>Add it to your .env.local file as NEXT_PUBLIC_MAPBOX_TOKEN</li>
                <li>Restart the development server</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    )
  }

  const handleLocationClick = () => {
    clearError()
    requestPosition()
    if (geolocateControl.current) {
      geolocateControl.current.trigger()
    }
  }

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainer} className="h-full w-full" />

      {/* User location marker */}
      <UserLocationMarker map={mapRef.current} position={position} showAccuracy={true} />

      {/* Filter Panel */}
      <FilterPanel
        dateFilter={tripFilters.filters.dateFilter}
        distanceFilter={tripFilters.filters.distanceFilter}
        searchKeyword={tripFilters.filters.searchKeyword}
        resultCount={tripFilters.resultCount}
        hasUserLocation={!!position}
        onDateFilterChange={tripFilters.setDateFilter}
        onDistanceFilterChange={tripFilters.setDistanceFilter}
        onSearchKeywordChange={tripFilters.setSearchKeyword}
        onClearAllFilters={tripFilters.clearAllFilters}
      />

      {/* Manual location button */}
      <div className="absolute right-4 top-4 z-10">
        <button
          onClick={handleLocationClick}
          disabled={locationLoading}
          className="flex h-10 w-10 items-center justify-center rounded-md border-2 border-gray-300 bg-white shadow-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          title={permission === 'denied' ? 'Location access denied' : 'Find my location'}
        >
          {locationLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          ) : (
            <Navigation
              className={`h-4 w-4 ${permission === 'denied' ? 'text-red-500' : 'text-gray-700'}`}
            />
          )}
        </button>
      </div>

      {/* Location error display */}
      {locationError && (
        <div className="absolute left-4 top-4 z-10">
          <div className="max-w-xs rounded-lg border border-red-200 bg-red-50 p-3">
            <div className="flex items-start">
              <AlertCircle className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
              <div>
                <p className="text-sm font-medium text-red-800">Location Error</p>
                <p className="mt-1 text-xs text-red-600">{locationError}</p>
              </div>
              <button
                onClick={clearError}
                className="ml-2 text-red-400 hover:text-red-600"
                title="Dismiss"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* No trips message */}
      {mapLoaded && trips.length === 0 && (
        <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 transform">
          <div className="max-w-sm rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="text-center">
              <div className="mb-2 text-blue-600">
                <svg
                  className="mx-auto h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-blue-800">No trips with locations found</p>
              <p className="mt-1 text-xs text-blue-600">
                Trips will appear here when they have coordinates set
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="absolute bottom-4 right-4 z-10">
        <div className="rounded-lg bg-white/90 px-3 py-2 text-sm text-gray-600 shadow-lg backdrop-blur-sm">
          {tripFilters.resultCount} of {trips.length} {trips.length === 1 ? 'trip' : 'trips'} shown
          {position && (
            <div className="mt-1 text-xs text-green-600">
              📍 Location: {permission === 'granted' ? 'Active' : 'Inactive'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
})
