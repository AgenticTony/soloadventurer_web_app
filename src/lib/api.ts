import { createClient } from '@/lib/supabase/client';

// ── Error class (preserved for consumers) ─────────────────────
class TripsApiError extends Error {
  constructor(public message: string, public details?: Array<{ field: string; message: string }>) {
    super(message);
    this.name = 'TripsApiError';
  }
}

// ── Shared types ──────────────────────────────────────────────
interface CreateTripInput {
  title: string;
  startDate: string;
  endDate: string;
  isPrivate?: boolean;
}

interface CreateTripResponse {
  id: string;
}

export type FeedItem = { id: string; title: string; excerpt?: string; createdAt: string };
export type Profile = { id: string; username: string; bio?: string; avatarUrl?: string };

export interface TripCoordinates {
  latitude: number;
  longitude: number;
}

export interface Trip {
  id: string;
  title: string;
  description: string;
  location: string;
  coordinates?: TripCoordinates;
  startDate: string;
  endDate: string;
  status: 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  isPrivate: boolean;
  ownerId: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListTripsOptions {
  limit?: number;
  nextToken?: string;
}

export interface ListTripsResponse {
  items: Trip[];
  nextToken?: string;
}

// ── Helper: get authenticated Supabase client + user id ───────
async function getAuthContext() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token || !session.user) {
    throw new TripsApiError('User not authenticated');
  }
  return { supabase, userId: session.user.id };
}

// ── Feed ──────────────────────────────────────────────────────
export async function getFeed(): Promise<FeedItem[]> {
  try {
    const { supabase, userId } = await getAuthContext();

    // Query feed_items joined with the actor's profile for context
    const { data, error } = await supabase
      .from('feed_items')
      .select('id, verb, object_id, object_type, created_at, actor:profiles!feed_items_actor_id_fkey(display_name, username)')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return (data ?? []).map((item: Record<string, unknown>) => ({
      id: item.id as string,
      title: formatFeedTitle(item.verb as string, item.object_type as string, item.actor as Record<string, string>),
      excerpt: `${item.verb as string} ${item.object_type as string}`,
      createdAt: item.created_at as string,
    }));
  } catch (error) {
    if (error instanceof TripsApiError) throw error;
    console.error('Error fetching feed:', error);
    throw new TripsApiError('Failed to fetch feed');
  }
}

function formatFeedTitle(verb: string, objectType: string, actor?: Record<string, string> | null): string {
  const name = actor?.display_name || actor?.username || 'Someone';
  const action = verb === 'post' ? 'posted' : verb === 'share' ? 'shared' : verb === 'comment' ? 'commented on' : verb;
  return `${name} ${action} a ${objectType || 'update'}`;
}

// ── Profile ───────────────────────────────────────────────────
export async function getProfile(userId: string): Promise<Profile> {
  try {
    const { supabase } = await getAuthContext();

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, display_name, bio, avatar_url')
      .eq('id', userId)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      username: data.username ?? data.display_name ?? '',
      bio: data.bio ?? undefined,
      avatarUrl: data.avatar_url ?? undefined,
    };
  } catch (error) {
    if (error instanceof TripsApiError) throw error;
    console.error('Error fetching profile:', error);
    throw new TripsApiError('Failed to fetch profile');
  }
}

// ── Trips ─────────────────────────────────────────────────────
function mapTrip(row: Record<string, unknown>): Trip {
  return {
    id: row.id as string,
    title: row.name as string,
    description: (row.description as string) ?? '',
    location: (row.destination_name as string) ?? (row.destination as string) ?? '',
    coordinates: row.latitude && row.longitude
      ? { latitude: Number(row.latitude), longitude: Number(row.longitude) }
      : undefined,
    startDate: row.start_date as string,
    endDate: row.end_date as string ?? '',
    status: 'PLANNING' as const,
    isPrivate: !(row.is_public as boolean),
    ownerId: row.user_id as string,
    owner: '',
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function createTrip(tripData: CreateTripInput): Promise<CreateTripResponse> {
  try {
    const { supabase } = await getAuthContext();

    const { data, error } = await supabase.rpc('create_trip', {
      p_name: tripData.title,
      p_destination: tripData.title,
      p_start_date: tripData.startDate,
      p_end_date: tripData.endDate,
      p_is_public: !tripData.isPrivate,
      p_description: null,
    });

    if (error) throw error;

    return { id: data as string };
  } catch (error) {
    if (error instanceof TripsApiError) throw error;
    console.error('Error creating trip:', error);
    throw new TripsApiError('Failed to create trip');
  }
}

export async function getTrip(tripId: string): Promise<Trip> {
  try {
    const { supabase } = await getAuthContext();

    const { data, error } = await supabase.rpc('get_trip_by_id', { p_id: tripId });

    if (error) throw error;
    if (!data || (Array.isArray(data) && data.length === 0)) throw new TripsApiError('Trip not found');

    const row = Array.isArray(data) ? data[0] : data;
    return mapTrip(row as Record<string, unknown>);
  } catch (error) {
    if (error instanceof TripsApiError) throw error;
    throw new TripsApiError('Failed to fetch trip');
  }
}

export async function listTrips(ownerId?: string, options?: ListTripsOptions): Promise<ListTripsResponse> {
  try {
    const { supabase } = await getAuthContext();

    const limit = Math.min(options?.limit ?? 50, 100);

    const { data, error } = await supabase.rpc('list_my_trips', {
      p_limit: limit + 1,
      p_offset: 0,
    });

    if (error) throw error;

    const rows = ((data ?? []) as Record<string, unknown>[]);
    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;

    return {
      items: items.map(mapTrip),
      nextToken: hasMore ? String(items[items.length - 1]?.id) : undefined,
    };
  } catch (error) {
    if (error instanceof TripsApiError) throw error;
    throw new TripsApiError('Failed to list trips');
  }
}

export async function getMapTrips(): Promise<Trip[]> {
  try {
    const { supabase, userId } = await getAuthContext();

    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', userId)
      .not('destination', 'is', null);

    if (error) throw error;

    return ((data ?? []) as Record<string, unknown>[])
      .map(mapTrip)
      .filter(trip => trip.coordinates?.latitude && trip.coordinates?.longitude);
  } catch (error) {
    if (error instanceof TripsApiError) throw error;
    console.error('Error fetching map trips:', error);
    throw new TripsApiError('Failed to fetch map trips');
  }
}

export const getTripById = getTrip;

export { TripsApiError };
export type { CreateTripInput, CreateTripResponse };
