import { ApiClient, ApiError } from '../base/ApiClient';
import { Trip, CreateTripInput, CreateTripResponse, ListTripsOptions, ListTripsResponse } from './types';

export class TripService {
  constructor(private apiClient: ApiClient) {}

  /**
   * Create a new trip
   */
  async createTrip(tripData: CreateTripInput): Promise<CreateTripResponse> {
    try {
      return await this.apiClient.post<CreateTripResponse>('/trips', tripData);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to create trip');
    }
  }

  /**
   * Get a specific trip by ID
   */
  async getTrip(tripId: string): Promise<Trip> {
    try {
      return await this.apiClient.get<Trip>(`/trips/${tripId}`);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to fetch trip');
    }
  }

  /**
   * List trips with optional filtering
   */
  async listTrips(ownerId?: string, options?: ListTripsOptions): Promise<ListTripsResponse> {
    try {
      const params = new URLSearchParams();

      if (ownerId) {
        params.set('ownerId', ownerId);
      }

      if (options?.limit !== undefined) {
        params.set('limit', options.limit.toString());
      }

      if (options?.nextToken) {
        params.set('nextToken', options.nextToken);
      }

      const queryString = params.toString();
      const endpoint = queryString ? `/trips?${queryString}` : '/trips';

      return await this.apiClient.get<ListTripsResponse>(endpoint);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to list trips');
    }
  }

  /**
   * Get public trips for map display
   */
  async getPublicTrips(options?: ListTripsOptions): Promise<ListTripsResponse> {
    try {
      const params = new URLSearchParams();

      // Filter for public trips only
      params.set('isPrivate', 'false');

      if (options?.limit !== undefined) {
        params.set('limit', options.limit.toString());
      }

      if (options?.nextToken) {
        params.set('nextToken', options.nextToken);
      }

      const queryString = params.toString();
      const endpoint = `/trips?${queryString}`;

      return await this.apiClient.get<ListTripsResponse>(endpoint);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to get public trips');
    }
  }

  /**
   * Update an existing trip
   */
  async updateTrip(tripId: string, updates: Partial<CreateTripInput>): Promise<Trip> {
    try {
      return await this.apiClient.put<Trip>(`/trips/${tripId}`, updates);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to update trip');
    }
  }

  /**
   * Delete a trip
   */
  async deleteTrip(tripId: string): Promise<void> {
    try {
      await this.apiClient.delete<void>(`/trips/${tripId}`);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to delete trip');
    }
  }

  /**
   * Get trips by current user
   */
  async getMyTrips(options?: ListTripsOptions): Promise<ListTripsResponse> {
    // The API will automatically filter by the authenticated user when no ownerId is specified
    return this.listTrips(undefined, options);
  }

  /**
   * Get public trips by another user
   */
  async getUserTrips(ownerId: string, options?: ListTripsOptions): Promise<ListTripsResponse> {
    return this.listTrips(ownerId, options);
  }
}

// Create singleton instance
import { apiClient } from '../base/ApiClient';
export const tripService = new TripService(apiClient);

// Export the service class for testing
export default TripService;