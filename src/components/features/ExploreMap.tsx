'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { AlertCircle, Navigation } from 'lucide-react';
import type { Trip } from '@/lib/api';
import { useUserLocation } from '@/hooks/useUserLocation';
import {
  initializeMapbox,
  createMap,
  convertTripsToGeoJSON,
  addTripMarkers,
  addUserLocationMarker,
  MapboxError,
  DEFAULT_MAP_CONFIG,
} from '@/lib/map/mapbox';

import 'mapbox-gl/dist/mapbox-gl.css';

interface ExploreMapProps {
  trips: Trip[];
}

export function ExploreMap({ trips }: ExploreMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null); // Persistent map reference
  const geolocateControl = useRef<mapboxgl.GeolocateControl | null>(null);
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const isInitialized = useRef(false);

  const [mapError, setMapError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const {
    location,
    loading: locationLoading,
    requestLocation,
  } = useUserLocation();

  useEffect(() => {
    if (!mapContainer.current || isInitialized.current) return;

    try {
      initializeMapbox();
      isInitialized.current = true;

      const newMap = createMap({
        container: mapContainer.current,
        ...DEFAULT_MAP_CONFIG,
      });

      map.current = newMap;
      mapInstance.current = newMap;

      // Try adding the GeolocateControl immediately
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
        });

        map.current.addControl(geolocateControl.current, 'top-right');
        console.log('GeolocateControl added successfully');
      } catch (controlError) {
        console.warn('Failed to add GeolocateControl:', controlError);
      }

      map.current.on('load', () => {
        console.log('Map load event fired, map exists:', !!map.current);
        setMapLoaded(true);
        if (map.current && trips.length > 0) {
          const geoJSON = convertTripsToGeoJSON(trips);
          addTripMarkers(map.current, geoJSON);
        }
      });

    } catch (error) {
      if (error instanceof MapboxError) {
        setMapError(error.message);
      } else {
        setMapError('Failed to initialize map');
        console.error('Map initialization error:', error);
      }
    }

    // Cleanup function
    return () => {
      console.log('Cleanup function called, map exists:', !!map.current);
      if (map.current) {
        try {
          if (geolocateControl.current) {
            map.current.removeControl(geolocateControl.current);
          }
          if (userMarker.current) {
            userMarker.current.remove();
          }
          // Don't set map.current to null immediately to avoid race conditions
          // map.current = null;
        } catch (error) {
          console.warn('Error during map cleanup:', error);
        }
      }
      geolocateControl.current = null;
      userMarker.current = null;
    };
  }, []);


  // Separate effect to handle trips updates after map is initialized
  useEffect(() => {
    if (map.current && trips.length > 0 && isInitialized.current) {
      const geoJSON = convertTripsToGeoJSON(trips);
      addTripMarkers(map.current, geoJSON);
    }
  }, [trips]);


  if (mapError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center p-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Map Unavailable</h3>
          <p className="text-gray-600 mb-4">{mapError}</p>
          {mapError.includes('Mapbox token') && (
            <div className="text-sm text-gray-500">
              <p>To use the map feature:</p>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Get a free token from <a href="https://account.mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Mapbox</a></li>
                <li>Add it to your .env.local file as NEXT_PUBLIC_MAPBOX_TOKEN</li>
                <li>Restart the development server</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    );
  }

  const handleLocationClick = () => {
    requestLocation();
    if (geolocateControl.current) {
      geolocateControl.current.trigger();
    }
  };

  // Add effect to handle location updates - wait for both map and location
  useEffect(() => {
    console.log('Location useEffect triggered:', {
      location: !!location,
      mapExists: !!map.current,
      mapInstanceExists: !!mapInstance.current,
      mapLoaded,
      isInitialized: isInitialized.current
    });

    // Use persistent mapInstance reference to avoid race conditions
    const activeMap = mapInstance.current || map.current;

    // Wait for map to be fully loaded AND location to be available
    if (activeMap && location && mapLoaded) {
      console.log('Processing location:', location);

      // Remove old marker if exists
      if (userMarker.current) {
        console.log('Removing old marker');
        userMarker.current.remove();
      }

      // Add new user location marker
      console.log('Adding new marker at:', [location.longitude, location.latitude]);
      userMarker.current = addUserLocationMarker(activeMap, location);

      // Animate map to location
      console.log('Animating map to location:', [location.longitude, location.latitude]);
      activeMap.easeTo({
        center: [location.longitude, location.latitude],
        zoom: 12,
        duration: 1000,
      });
    } else {
      console.log('Skipping location processing:', {
        mapExists: !!map.current,
        mapInstanceExists: !!mapInstance.current,
        location: !!location,
        mapLoaded,
        isInitialized: isInitialized.current
      });
    }
  }, [location, mapLoaded]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Manual location button as fallback */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={handleLocationClick}
          disabled={locationLoading}
          className="flex items-center justify-center w-10 h-10 bg-white border-2 border-gray-300 rounded-md shadow-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          title="Find my location"
        >
          {locationLoading ? (
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
          ) : (
            <Navigation className="h-4 w-4 text-gray-700" />
          )}
        </button>
      </div>

      <div className="absolute bottom-4 right-4 z-10">
        <div className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg text-sm text-gray-600">
          {trips.length} {trips.length === 1 ? 'trip' : 'trips'} shown
        </div>
      </div>
    </div>
  );
}