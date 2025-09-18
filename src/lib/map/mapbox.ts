import mapboxgl from 'mapbox-gl';
import type { Trip } from '@/lib/api';
import type { TripFeature, TripGeoJSON, MapboxOptions } from '@/types/map';

export class MapboxError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MapboxError';
  }
}

export function validateMapboxToken(token: string | undefined): string {
  if (!token) {
    throw new MapboxError('Mapbox token is required. Please add NEXT_PUBLIC_MAPBOX_TOKEN to your environment variables.');
  }

  if (!token.startsWith('pk.')) {
    throw new MapboxError('Invalid Mapbox token format. Token should start with "pk."');
  }

  return token;
}

export function initializeMapbox(token?: string): void {
  const validToken = validateMapboxToken(token || process.env.NEXT_PUBLIC_MAPBOX_TOKEN);
  mapboxgl.accessToken = validToken;
}

export function createMap(options: Omit<MapboxOptions, 'accessToken'>): mapboxgl.Map {
  if (!mapboxgl.accessToken) {
    throw new MapboxError('Mapbox not initialized. Call initializeMapbox() first.');
  }

  return new mapboxgl.Map({
    container: options.container,
    style: options.style,
    center: options.center,
    zoom: options.zoom,
  });
}

export function convertTripsToGeoJSON(trips: Trip[]): TripGeoJSON {
  const features: TripFeature[] = trips
    .filter(trip => {
      return true;
    })
    .map(trip => {
      const mockLat = 40.7128 + (Math.random() - 0.5) * 10;
      const mockLng = -74.0060 + (Math.random() - 0.5) * 20;

      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [mockLng, mockLat],
        },
        properties: {
          id: trip.id,
          title: trip.title,
          startDate: trip.startDate,
          endDate: trip.endDate,
          isPrivate: trip.isPrivate || false,
          ownerId: trip.ownerId,
        },
      };
    });

  return {
    type: 'FeatureCollection',
    features,
  };
}

export const MAP_STYLES = {
  STANDARD: 'mapbox://styles/mapbox/standard',
  STREETS: 'mapbox://styles/mapbox/streets-v12',
  OUTDOORS: 'mapbox://styles/mapbox/outdoors-v12',
  LIGHT: 'mapbox://styles/mapbox/light-v11',
  DARK: 'mapbox://styles/mapbox/dark-v11',
  SATELLITE: 'mapbox://styles/mapbox/satellite-v9',
} as const;

export const DEFAULT_MAP_CONFIG = {
  style: MAP_STYLES.STANDARD,
  center: [-95.7129, 37.0902] as [number, number],
  zoom: 3,
} as const;

export function addTripMarkers(map: mapboxgl.Map, geoJSON: TripGeoJSON): void {
  const sourceId = 'trips';

  if (map.getSource(sourceId)) {
    (map.getSource(sourceId) as mapboxgl.GeoJSONSource).setData(geoJSON);
    return;
  }

  map.addSource(sourceId, {
    type: 'geojson',
    data: geoJSON,
    cluster: true,
    clusterMaxZoom: 14,
    clusterRadius: 50,
  });

  map.addLayer({
    id: 'clusters',
    type: 'circle',
    source: sourceId,
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': [
        'step',
        ['get', 'point_count'],
        '#51bbd6',
        100,
        '#f1f075',
        750,
        '#f28cb1'
      ],
      'circle-radius': [
        'step',
        ['get', 'point_count'],
        20,
        100,
        30,
        750,
        40
      ],
    },
  });

  map.addLayer({
    id: 'cluster-count',
    type: 'symbol',
    source: sourceId,
    filter: ['has', 'point_count'],
    layout: {
      'text-field': ['get', 'point_count_abbreviated'],
      'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
      'text-size': 12,
    },
  });

  map.addLayer({
    id: 'unclustered-point',
    type: 'circle',
    source: sourceId,
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': '#11b4da',
      'circle-radius': 8,
      'circle-stroke-width': 2,
      'circle-stroke-color': '#fff',
    },
  });

  map.on('click', 'clusters', (e) => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: ['clusters']
    });

    if (!features.length) return;

    const clusterId = features[0].properties?.cluster_id;
    const source = map.getSource(sourceId) as mapboxgl.GeoJSONSource;

    source.getClusterExpansionZoom(clusterId, (err, zoom) => {
      if (err) return;

      map.easeTo({
        center: (features[0].geometry as any).coordinates,
        zoom: zoom || 10
      });
    });
  });

  map.on('click', 'unclustered-point', (e) => {
    const coordinates = (e.features?.[0].geometry as any)?.coordinates?.slice();
    const properties = e.features?.[0].properties;

    if (!coordinates || !properties) return;

    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(`
        <div class="p-2">
          <h3 class="font-semibold">${properties.title}</h3>
          <p class="text-sm text-gray-600">
            ${new Date(properties.startDate).toLocaleDateString()} -
            ${new Date(properties.endDate).toLocaleDateString()}
          </p>
          <p class="text-xs text-gray-500 mt-1">
            ${properties.isPrivate ? 'Private' : 'Public'} trip
          </p>
        </div>
      `)
      .addTo(map);
  });

  map.on('mouseenter', 'clusters', () => {
    map.getCanvas().style.cursor = 'pointer';
  });

  map.on('mouseleave', 'clusters', () => {
    map.getCanvas().style.cursor = '';
  });

  map.on('mouseenter', 'unclustered-point', () => {
    map.getCanvas().style.cursor = 'pointer';
  });

  map.on('mouseleave', 'unclustered-point', () => {
    map.getCanvas().style.cursor = '';
  });
}

export function addUserLocationMarker(map: mapboxgl.Map, location: { latitude: number; longitude: number }): mapboxgl.Marker {
  const el = document.createElement('div');
  el.className = 'user-location-marker';
  el.style.width = '16px';
  el.style.height = '16px';
  el.style.borderRadius = '50%';
  el.style.backgroundColor = '#4285f4';
  el.style.border = '3px solid #fff';
  el.style.boxShadow = '0 0 10px rgba(66, 133, 244, 0.5)';

  return new mapboxgl.Marker(el)
    .setLngLat([location.longitude, location.latitude])
    .addTo(map);
}

