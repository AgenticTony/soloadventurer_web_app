'use client';

import { useState, useMemo, useCallback } from 'react';
import type { Trip } from '@/lib/api';

export type DateFilter = 'all' | 'upcoming' | 'past' | 'current';
export type DistanceFilter = 5 | 10 | 25 | 50 | null;

export interface TripFiltersState {
  dateFilter: DateFilter;
  distanceFilter: DistanceFilter;
  searchKeyword: string;
  userLocation: { latitude: number; longitude: number } | null;
}

export interface UseTripFiltersReturn {
  filters: TripFiltersState;
  filteredTrips: Trip[];
  resultCount: number;
  setDateFilter: (filter: DateFilter) => void;
  setDistanceFilter: (filter: DistanceFilter) => void;
  setSearchKeyword: (keyword: string) => void;
  setUserLocation: (location: { latitude: number; longitude: number } | null) => void;
  clearAllFilters: () => void;
}

const initialFilters: TripFiltersState = {
  dateFilter: 'all',
  distanceFilter: null,
  searchKeyword: '',
  userLocation: null,
};

// Helper function to check if a trip is within distance
function isWithinDistance(
  tripCoords: { latitude: number; longitude: number },
  userCoords: { latitude: number; longitude: number },
  maxDistanceMiles: number
): boolean {
  // Haversine formula for calculating distance between two points
  const R = 3959; // Earth's radius in miles
  const dLat = ((userCoords.latitude - tripCoords.latitude) * Math.PI) / 180;
  const dLon = ((userCoords.longitude - tripCoords.longitude) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((tripCoords.latitude * Math.PI) / 180) *
    Math.cos((userCoords.latitude * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance <= maxDistanceMiles;
}

// Get trip coordinates from trip data
function getTripCoordinates(trip: Trip): { latitude: number; longitude: number } | null {
  if (trip.coordinates?.latitude && trip.coordinates?.longitude) {
    return {
      latitude: trip.coordinates.latitude,
      longitude: trip.coordinates.longitude
    };
  }
  return null;
}

export function useTripFilters(trips: Trip[]): UseTripFiltersReturn {
  const [filters, setFilters] = useState<TripFiltersState>(initialFilters);

  // Memoized filtered trips - only recalculates when trips or filters change
  const filteredTrips = useMemo(() => {
    const now = new Date();

    return trips.filter((trip) => {
      // Date filter
      if (filters.dateFilter !== 'all') {
        const startDate = new Date(trip.startDate);
        const endDate = new Date(trip.endDate);

        switch (filters.dateFilter) {
          case 'upcoming':
            if (startDate <= now) return false;
            break;
          case 'past':
            if (endDate >= now) return false;
            break;
          case 'current':
            if (startDate > now || endDate < now) return false;
            break;
        }
      }

      // Distance filter
      if (filters.distanceFilter && filters.userLocation) {
        const tripCoords = getTripCoordinates(trip);
        if (!tripCoords || !isWithinDistance(tripCoords, filters.userLocation, filters.distanceFilter)) {
          return false;
        }
      }

      // Search keyword filter
      if (filters.searchKeyword.trim()) {
        const keyword = filters.searchKeyword.toLowerCase().trim();
        const searchText = `${trip.title} ${trip.description || ''}`.toLowerCase();
        if (!searchText.includes(keyword)) {
          return false;
        }
      }

      return true;
    });
  }, [trips, filters]);

  // Memoized result count
  const resultCount = useMemo(() => filteredTrips.length, [filteredTrips]);

  // Stable callback functions
  const setDateFilter = useCallback((filter: DateFilter) => {
    setFilters(prev => ({ ...prev, dateFilter: filter }));
  }, []);

  const setDistanceFilter = useCallback((filter: DistanceFilter) => {
    setFilters(prev => ({ ...prev, distanceFilter: filter }));
  }, []);

  const setSearchKeyword = useCallback((keyword: string) => {
    setFilters(prev => ({ ...prev, searchKeyword: keyword }));
  }, []);

  const setUserLocation = useCallback((location: { latitude: number; longitude: number } | null) => {
    setFilters(prev => ({ ...prev, userLocation: location }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  return {
    filters,
    filteredTrips,
    resultCount,
    setDateFilter,
    setDistanceFilter,
    setSearchKeyword,
    setUserLocation,
    clearAllFilters,
  };
}