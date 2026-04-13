import {
  createTrip as apiCreateTrip,
  getTrip as apiGetTrip,
  listTrips as apiListTrips,
  getMapTrips as apiGetMapTrips,
  TripsApiError,
} from '@/lib/api';
import type { Trip, CreateTripInput, CreateTripResponse, ListTripsOptions, ListTripsResponse } from './types';

export class TripService {
  async createTrip(tripData: CreateTripInput): Promise<CreateTripResponse> {
    return apiCreateTrip(tripData);
  }

  async getTrip(tripId: string): Promise<Trip> {
    return apiGetTrip(tripId);
  }

  async listTrips(ownerId?: string, options?: ListTripsOptions): Promise<ListTripsResponse> {
    return apiListTrips(ownerId, options);
  }

  async getMapTrips(): Promise<Trip[]> {
    return apiGetMapTrips();
  }

  async getPublicTrips(options?: ListTripsOptions): Promise<ListTripsResponse> {
    return apiListTrips(undefined, options);
  }

  async updateTrip(_tripId: string, _updates: Partial<CreateTripInput>): Promise<Trip> {
    // TODO: Implement via Supabase RPC (update_my_trip)
    throw new Error('updateTrip not yet implemented for Supabase');
  }

  async deleteTrip(_tripId: string): Promise<void> {
    // TODO: Implement via Supabase RPC (delete_my_trip)
    throw new Error('deleteTrip not yet implemented for Supabase');
  }

  async getMyTrips(options?: ListTripsOptions): Promise<ListTripsResponse> {
    return this.listTrips(undefined, options);
  }

  async getUserTrips(ownerId: string, options?: ListTripsOptions): Promise<ListTripsResponse> {
    return this.listTrips(ownerId, options);
  }
}

export const tripService = new TripService();
export default TripService;
