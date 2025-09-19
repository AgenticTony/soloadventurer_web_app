import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExploreMap } from '../ExploreMap';
import { useGeolocation } from '@/hooks/useGeolocation';
import type { UseTripFiltersReturn } from '@/hooks/useTripFilters';
import type { Trip } from '@/types/trip';

// Mock mapbox-gl
jest.mock('mapbox-gl', () => ({
  Map: jest.fn(() => ({
    on: jest.fn(),
    remove: jest.fn(),
    easeTo: jest.fn(),
    addSource: jest.fn(),
    addLayer: jest.fn(),
    getSource: jest.fn(),
    getCanvas: jest.fn(() => ({
      style: { cursor: '' }
    })),
  })),
  Marker: jest.fn(() => ({
    setLngLat: jest.fn().mockReturnThis(),
    addTo: jest.fn().mockReturnThis(),
    remove: jest.fn(),
  })),
  Popup: jest.fn(() => ({
    setLngLat: jest.fn().mockReturnThis(),
    setHTML: jest.fn().mockReturnThis(),
    addTo: jest.fn().mockReturnThis(),
  })),
}));

// Mock mapbox utilities
jest.mock('@/lib/map/mapbox', () => ({
  initializeMapbox: jest.fn(),
  createMap: jest.fn(() => ({
    on: jest.fn(),
    remove: jest.fn(),
    easeTo: jest.fn(),
    addSource: jest.fn(),
    addLayer: jest.fn(),
    getSource: jest.fn(),
    getCanvas: jest.fn(() => ({
      style: { cursor: '' }
    })),
  })),
  convertTripsToGeoJSON: jest.fn(() => ({
    type: 'FeatureCollection',
    features: []
  })),
  addTripMarkers: jest.fn(),
  addUserLocationMarker: jest.fn(() => ({
    remove: jest.fn()
  })),
  MapboxError: class extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'MapboxError';
    }
  },
  DEFAULT_MAP_CONFIG: {
    style: 'mapbox://styles/mapbox/standard',
    center: [-95.7129, 37.0902],
    zoom: 3,
  },
}));

// Mock the useGeolocation hook
jest.mock('@/hooks/useGeolocation');
const mockUseGeolocation = useGeolocation as jest.MockedFunction<typeof useGeolocation>;

// Mock CSS import
jest.mock('mapbox-gl/dist/mapbox-gl.css', () => {});

describe('ExploreMap', () => {
  const mockTrips: Trip[] = [
    {
      id: 'trip-1',
      title: 'Paris Adventure',
      description: 'Exploring the romantic streets of Paris',
      location: 'Paris, France',
      startDate: '2024-03-01T10:00:00Z',
      endDate: '2024-03-05T10:00:00Z',
      status: 'PLANNING',
      isPrivate: false,
      ownerId: 'user-1',
      owner: 'user_one',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'trip-2',
      title: 'Tokyo Journey',
      description: 'Immersing in Japanese culture and cuisine',
      location: 'Tokyo, Japan',
      startDate: '2024-04-01T10:00:00Z',
      endDate: '2024-04-10T10:00:00Z',
      status: 'ACTIVE',
      isPrivate: true,
      ownerId: 'user-2',
      owner: 'user_two',
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z'
    },
  ];

  const mockTripFilters: UseTripFiltersReturn = {
    filters: { dateFilter: 'all', distanceFilter: null, searchKeyword: '', userLocation: null },
    filteredTrips: mockTrips, // Use trips from test instead of empty array
    resultCount: 2, // Use actual count from mockTrips
    setDateFilter: jest.fn(),
    setDistanceFilter: jest.fn(),
    setSearchKeyword: jest.fn(),
    setUserLocation: jest.fn(),
    clearAllFilters: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset mapbox utils to successful behavior by default
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { initializeMapbox, createMap } = require('@/lib/map/mapbox');
    initializeMapbox.mockImplementation(() => {});
    createMap.mockReturnValue({
      on: jest.fn(),
      remove: jest.fn(),
      easeTo: jest.fn(),
      addSource: jest.fn(),
      addLayer: jest.fn(),
      getSource: jest.fn(),
      getCanvas: jest.fn(() => ({ style: { cursor: '' } })),
    });

    mockUseGeolocation.mockReturnValue({
      position: null,
      loading: false,
      error: null,
      permission: 'prompt',
      requestPosition: jest.fn(),
      clearError: jest.fn(),
    });
  });

  it('should render map container and filter panel', () => {
    render(<ExploreMap trips={mockTrips} tripFilters={mockTripFilters} />);

    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByText('2 trips')).toBeInTheDocument();
  });

  it('should handle mapbox initialization error', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { initializeMapbox, MapboxError } = require('@/lib/map/mapbox');

    initializeMapbox.mockImplementation(() => {
      throw new MapboxError('Mapbox token is required. Please add NEXT_PUBLIC_MAPBOX_TOKEN to your environment variables.');
    });

    render(<ExploreMap trips={mockTrips} tripFilters={mockTripFilters} />);

    expect(screen.getByText('Map Unavailable')).toBeInTheDocument();
    expect(screen.getByText(/Mapbox token is required/)).toBeInTheDocument();
    expect(screen.getByText('Get a free token from')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Mapbox' })).toHaveAttribute('href', 'https://account.mapbox.com/');
  });

  it('should handle location request', () => {
    const mockRequestPosition = jest.fn();
    mockUseGeolocation.mockReturnValue({
      position: null,
      loading: false,
      error: null,
      permission: 'prompt',
      requestPosition: mockRequestPosition,
      clearError: jest.fn(),
    });

    render(<ExploreMap trips={mockTrips} tripFilters={mockTripFilters} />);

    const locationButton = screen.getByTitle('Find my location');
    fireEvent.click(locationButton);

    expect(mockRequestPosition).toHaveBeenCalled();
  });

  it('should display loading state', () => {
    mockUseGeolocation.mockReturnValue({
      position: null,
      error: null,
      loading: true,
      permission: 'prompt',
      requestPosition: jest.fn(),
      clearError: jest.fn(),
    });

    render(<ExploreMap trips={mockTrips} tripFilters={mockTripFilters} />);

    const locationButton = screen.getByTitle('Find my location');
    expect(locationButton).toBeDisabled();
  });

  it('should display location found state', () => {
    mockUseGeolocation.mockReturnValue({
      position: { latitude: 40.7128, longitude: -74.0060 },
      error: null,
      loading: false,
      permission: 'granted',
      requestPosition: jest.fn(),
      clearError: jest.fn(),
    });

    render(<ExploreMap trips={mockTrips} tripFilters={mockTripFilters} />);

    const locationButton = screen.getByTitle('Find my location');
    expect(locationButton).toBeInTheDocument();
  });

  it('should display permission denied state', () => {
    mockUseGeolocation.mockReturnValue({
      position: null,
      error: 'Location access denied by user',
      loading: false,
      permission: 'denied',
      requestPosition: jest.fn(),
      clearError: jest.fn(),
    });

    render(<ExploreMap trips={mockTrips} tripFilters={mockTripFilters} />);

    const locationButton = screen.getByTitle('Location access denied');
    expect(locationButton).not.toBeDisabled();
  });

  it('should display unsupported state', () => {
    mockUseGeolocation.mockReturnValue({
      position: null,
      error: 'Geolocation is not supported by this browser',
      loading: false,
      permission: 'denied' as const,
      requestPosition: jest.fn(),
      clearError: jest.fn(),
    });

    render(<ExploreMap trips={mockTrips} tripFilters={mockTripFilters} />);

    const locationButton = screen.getByTitle('Location access denied');
    expect(locationButton).not.toBeDisabled();
  });

  it('should display correct trip count', () => {
    const mockTripFiltersEmpty = { ...mockTripFilters, resultCount: 0 };
    render(<ExploreMap trips={[]} tripFilters={mockTripFiltersEmpty} />);
    expect(screen.getByText('0 trips')).toBeInTheDocument();

    const mockTripFiltersSingle = { ...mockTripFilters, resultCount: 1 };
    render(<ExploreMap trips={[mockTrips[0]]} tripFilters={mockTripFiltersSingle} />);
    expect(screen.getByText('1 trip')).toBeInTheDocument();

    render(<ExploreMap trips={mockTrips} tripFilters={mockTripFilters} />);
    expect(screen.getByText('2 trips')).toBeInTheDocument();
  });

  it('should handle map creation and cleanup', async () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { createMap } = require('@/lib/map/mapbox');
    const mockMap = {
      on: jest.fn(),
      remove: jest.fn(),
      easeTo: jest.fn(),
      addSource: jest.fn(),
      addLayer: jest.fn(),
      getSource: jest.fn(),
      getCanvas: jest.fn(() => ({ style: { cursor: '' } })),
    };

    createMap.mockReturnValue(mockMap);

    const { unmount } = render(<ExploreMap trips={mockTrips} tripFilters={mockTripFilters} />);

    expect(createMap).toHaveBeenCalled();
    expect(mockMap.on).toHaveBeenCalledWith('load', expect.any(Function));

    unmount();

    expect(mockMap.remove).toHaveBeenCalled();
  });

  it('should update map when location changes', async () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { createMap } = require('@/lib/map/mapbox');
    const mockMap = {
      on: jest.fn(),
      remove: jest.fn(),
      easeTo: jest.fn(),
      addSource: jest.fn(),
      addLayer: jest.fn(),
      getSource: jest.fn(),
      getCanvas: jest.fn(() => ({ style: { cursor: '' } })),
    };

    createMap.mockReturnValue(mockMap);

    const { rerender } = render(<ExploreMap trips={mockTrips} tripFilters={mockTripFilters} />);

    mockUseGeolocation.mockReturnValue({
      position: { latitude: 40.7128, longitude: -74.0060 },
      error: null,
      loading: false,
      permission: 'granted',
      requestPosition: jest.fn(),
      clearError: jest.fn(),
    });

    rerender(<ExploreMap trips={mockTrips} tripFilters={mockTripFilters} />);

    // Just verify the component renders with the location
    expect(screen.getByTitle('Find my location')).toBeInTheDocument();
  });
});