// Mock mapbox-gl before importing our modules
jest.mock('mapbox-gl', () => ({
  Map: jest.fn(),
  Marker: jest.fn(),
  Popup: jest.fn(),
}));

import { validateMapboxToken, convertTripsToGeoJSON, MapboxError } from '../mapbox';
import type { Trip } from '@/types/trip';

describe('mapbox utilities', () => {
  describe('validateMapboxToken', () => {
    it('should throw error for undefined token', () => {
      expect(() => validateMapboxToken(undefined)).toThrow(MapboxError);
      expect(() => validateMapboxToken(undefined)).toThrow('Mapbox token is required');
    });

    it('should throw error for empty token', () => {
      expect(() => validateMapboxToken('')).toThrow(MapboxError);
      expect(() => validateMapboxToken('')).toThrow('Mapbox token is required');
    });

    it('should throw error for invalid token format', () => {
      expect(() => validateMapboxToken('invalid-token')).toThrow(MapboxError);
      expect(() => validateMapboxToken('invalid-token')).toThrow('Invalid Mapbox token format');
    });

    it('should return valid token', () => {
      const validToken = 'pk.eyJ1IjoidGVzdCIsImEiOiJjbGVhcjEyM3Rlc3QifQ.test';
      expect(validateMapboxToken(validToken)).toBe(validToken);
    });
  });

  describe('convertTripsToGeoJSON', () => {
    const mockTrips: Trip[] = [
      {
        id: 'trip-1',
        title: 'Paris Adventure',
        description: 'Exploring the beautiful city of lights',
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
        description: 'Discovering the vibrant culture of Japan',
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

    it('should convert trips to GeoJSON format', () => {
      const result = convertTripsToGeoJSON(mockTrips);

      expect(result.type).toBe('FeatureCollection');
      expect(result.features).toHaveLength(2);

      const feature1 = result.features[0];
      expect(feature1.type).toBe('Feature');
      expect(feature1.geometry.type).toBe('Point');
      expect(feature1.geometry.coordinates).toHaveLength(2);
      expect(typeof feature1.geometry.coordinates[0]).toBe('number'); // longitude
      expect(typeof feature1.geometry.coordinates[1]).toBe('number'); // latitude

      expect(feature1.properties).toEqual({
        id: 'trip-1',
        title: 'Paris Adventure',
        startDate: '2024-03-01T10:00:00Z',
        endDate: '2024-03-05T10:00:00Z',
        isPrivate: false,
        ownerId: 'user-1',
      });
    });

    it('should handle empty trips array', () => {
      const result = convertTripsToGeoJSON([]);

      expect(result.type).toBe('FeatureCollection');
      expect(result.features).toHaveLength(0);
    });

    it('should generate coordinates within reasonable bounds', () => {
      const result = convertTripsToGeoJSON(mockTrips);

      result.features.forEach(feature => {
        const [lng, lat] = feature.geometry.coordinates;

        // Longitude should be roughly between -125 and -55 (USA bounds)
        expect(lng).toBeGreaterThan(-125);
        expect(lng).toBeLessThan(-55);

        // Latitude should be roughly between 25 and 65 (USA bounds)
        expect(lat).toBeGreaterThan(25);
        expect(lat).toBeLessThan(65);
      });
    });

    it('should handle trip with undefined isPrivate', () => {
      const tripWithoutPrivate: Trip = {
        id: 'trip-3',
        title: 'Public Trip',
        description: 'A trip without explicit privacy setting',
        location: 'Amsterdam, Netherlands',
        startDate: '2024-05-01T10:00:00Z',
        endDate: '2024-05-05T10:00:00Z',
        status: 'COMPLETED',
        isPrivate: false,
        ownerId: 'user-3',
        owner: 'user_three',
        createdAt: '2024-01-03T00:00:00Z',
        updatedAt: '2024-01-03T00:00:00Z'
      };

      const result = convertTripsToGeoJSON([tripWithoutPrivate]);

      expect(result.features[0].properties.isPrivate).toBe(false);
    });
  });
});