'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import type { UserGeolocationPosition } from '@/hooks/useGeolocation';

interface UserLocationMarkerProps {
  map: mapboxgl.Map | null;
  position: UserGeolocationPosition | null;
  showAccuracy?: boolean;
}

export function UserLocationMarker({ map, position, showAccuracy = true }: UserLocationMarkerProps) {
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const accuracyCircleRef = useRef<string | null>(null);

  useEffect(() => {
    if (!map || !position) {
      // Clean up existing marker and accuracy circle
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      if (accuracyCircleRef.current && map) {
        if (map.getLayer(accuracyCircleRef.current)) {
          map.removeLayer(accuracyCircleRef.current);
        }
        if (map.getSource(accuracyCircleRef.current)) {
          map.removeSource(accuracyCircleRef.current);
        }
        accuracyCircleRef.current = null;
      }
      return;
    }

    // Create marker element
    const el = document.createElement('div');
    el.className = 'user-location-marker';
    el.style.width = '16px';
    el.style.height = '16px';
    el.style.borderRadius = '50%';
    el.style.backgroundColor = '#4285f4';
    el.style.border = '3px solid #fff';
    el.style.boxShadow = '0 0 10px rgba(66, 133, 244, 0.5)';
    el.style.cursor = 'pointer';

    // Remove existing marker
    if (markerRef.current) {
      markerRef.current.remove();
    }

    // Add new marker
    markerRef.current = new mapboxgl.Marker(el)
      .setLngLat([position.longitude, position.latitude])
      .addTo(map);

    // Add accuracy circle if enabled and accuracy is available
    if (showAccuracy && position.accuracy && position.accuracy > 0) {
      const sourceId = 'user-location-accuracy';
      const layerId = 'user-location-accuracy-circle';

      // Remove existing accuracy circle
      if (accuracyCircleRef.current && map) {
        if (map.getLayer(accuracyCircleRef.current)) {
          map.removeLayer(accuracyCircleRef.current);
        }
        if (map.getSource(accuracyCircleRef.current)) {
          map.removeSource(accuracyCircleRef.current);
        }
      }

      // Create circle geometry based on accuracy
      const center = [position.longitude, position.latitude];
      const radiusInMeters = position.accuracy;
      const earthRadius = 6371008.8; // Earth's radius in meters

      // Convert radius from meters to degrees (approximate)
      const radiusInDegrees = (radiusInMeters / earthRadius) * (180 / Math.PI);

      // Create circle points
      const points = 64;
      const coordinates = [];

      for (let i = 0; i < points; i++) {
        const angle = (i * 360) / points;
        const angleRad = (angle * Math.PI) / 180;

        const lat = center[1] + radiusInDegrees * Math.cos(angleRad);
        const lng = center[0] + radiusInDegrees * Math.sin(angleRad) / Math.cos((center[1] * Math.PI) / 180);

        coordinates.push([lng, lat]);
      }

      // Close the polygon
      coordinates.push(coordinates[0]);

      const accuracySource = {
        type: 'geojson' as const,
        data: {
          type: 'Feature' as const,
          geometry: {
            type: 'Polygon' as const,
            coordinates: [coordinates],
          },
          properties: {},
        },
      };

      // Add source and layer
      map.addSource(sourceId, accuracySource);

      map.addLayer({
        id: layerId,
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': '#4285f4',
          'fill-opacity': 0.1,
        },
      });

      map.addLayer({
        id: `${layerId}-border`,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': '#4285f4',
          'line-opacity': 0.3,
          'line-width': 1,
        },
      });

      accuracyCircleRef.current = sourceId;
    }

    // Cleanup function
    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      if (accuracyCircleRef.current && map) {
        const sourceId = accuracyCircleRef.current;
        const layerId = 'user-location-accuracy-circle';

        if (map.getLayer(layerId)) {
          map.removeLayer(layerId);
        }
        if (map.getLayer(`${layerId}-border`)) {
          map.removeLayer(`${layerId}-border`);
        }
        if (map.getSource(sourceId)) {
          map.removeSource(sourceId);
        }
        accuracyCircleRef.current = null;
      }
    };
  }, [map, position, showAccuracy]);

  // This component doesn't render anything directly - it manages map layers
  return null;
}