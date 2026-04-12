import { createClient } from '@/lib/supabase/client';
import { ApiError } from '../base/ApiClient';
import { Trip, CreateTripInput, CreateTripResponse, ListTripsOptions, ListTripsResponse } from './types';

function mapTrip(row: Record<string, unknown>): Trip {
  return {
    id: row.id as string,
    title: row.name as string,
    description: (row.description as string) ?? '',
    startDate: row.start_date as string,
    endDate: row.end_date as string ?? '',
    isPrivate: !(row.is_public as boolean),
    ownerId: row.user_id as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

async function getAuthContext() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new ApiError('User not authenticated', 401);
  return { supabase, userId: session.user.id };
}

export class TripService {
  async createTrip(tripData: CreateTripInput): Promise<CreateTripResponse> {
    try {
      const { supabase } = await getAuthContext();

      const { data, error } = await supabase.rpc('create_trip', {
        p_name: tripData.title,
        p_destination: tripData.title,
        p_start_date: tripData.startDate,
        p_end_date: tripData.endDate,
        p_is_public: !tripData.isPrivate,
        p_description: tripData.description ?? null,
      });

      if (error) throw new ApiError(error.message);
      return { id: data as string };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to create trip');
    }
  }

  async getTrip(tripId: string): Promise<Trip> {
    try {
      const { supabase } = await getAuthContext();
      const { data, error } = await supabase.rpc('get_trip_by_id', { p_id: tripId });
      if (error) throw new ApiError(error.message);
      if (!data || (data as unknown[]).length === 0) throw new ApiError('Trip not found');
      const row = Array.isArray(data) ? data[0] : data;
      return mapTrip(row as Record<string, unknown>);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to fetch trip');
    }
  }

  async listTrips(_ownerId?: string, options?: ListTripsOptions): Promise<ListTripsResponse> {
    try {
      const { supabase } = await getAuthContext();
      const limit = Math.min(options?.limit ?? 50, 100);

      const { data, error } = await supabase.rpc('list_my_trips', {
        p_limit: limit + 1,
        p_offset: 0,
      });

      if (error) throw new ApiError(error.message);

      const rows = ((data ?? []) as Record<string, unknown>[]);
      const hasMore = rows.length > limit;
      const items = hasMore ? rows.slice(0, limit) : rows;

      return {
        items: items.map(mapTrip),
        nextToken: hasMore ? String(items[items.length - 1]?.id) : undefined,
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to list trips');
    }
  }

  async getPublicTrips(options?: ListTripsOptions): Promise<ListTripsResponse> {
    try {
      const { supabase } = await getAuthContext();
      const limit = Math.min(options?.limit ?? 50, 100);

      const { data, error } = await supabase.rpc('list_my_trips', {
        p_limit: limit,
        p_offset: 0,
      });

      if (error) throw new ApiError(error.message);

      return {
        items: ((data ?? []) as Record<string, unknown>[]).map(mapTrip),
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to get public trips');
    }
  }

  async updateTrip(tripId: string, updates: Partial<CreateTripInput>): Promise<Trip> {
    try {
      const { supabase } = await getAuthContext();

      const { data, error } = await supabase.rpc('update_my_trip', {
        p_id: tripId,
        p_name: updates.title ?? null,
        p_description: updates.description ?? null,
        p_start_date: updates.startDate ?? null,
        p_end_date: updates.endDate ?? null,
        p_is_public: updates.isPrivate !== undefined ? !updates.isPrivate : null,
      });

      if (error) throw new ApiError(error.message);
      if (!data || (data as unknown[]).length === 0) throw new ApiError('Trip not found or not authorized');
      const row = Array.isArray(data) ? data[0] : data;
      return mapTrip(row as Record<string, unknown>);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to update trip');
    }
  }

  async deleteTrip(tripId: string): Promise<void> {
    try {
      const { supabase } = await getAuthContext();
      const { data, error } = await supabase.rpc('delete_my_trip', { p_id: tripId });
      if (error) throw new ApiError(error.message);
      if (!data) throw new ApiError('Trip not found or not authorized');
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to delete trip');
    }
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
