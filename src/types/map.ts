import type { Trip } from '@/lib/api';

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface GeolocationState {
  location: UserLocation | null;
  error: string | null;
  loading: boolean;
  permission: 'prompt' | 'granted' | 'denied' | 'unsupported';
}

export interface TripFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    isPrivate: boolean;
    ownerId: string;
  };
}

export interface TripGeoJSON {
  type: 'FeatureCollection';
  features: TripFeature[];
}

export interface MapboxOptions {
  container: string | HTMLElement;
  style: string;
  center: [number, number];
  zoom: number;
  accessToken: string;
}

export interface ClusterFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: {
    cluster: boolean;
    cluster_id: number;
    point_count: number;
    point_count_abbreviated: string;
  };
}