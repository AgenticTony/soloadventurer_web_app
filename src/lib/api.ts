import { createClient } from '@/lib/supabase/client'
import { AppError } from '@/lib/errors'

// Backward-compatible alias
export type TripsApiError = AppError
export const TripsApiError = AppError

// ── Shared types ──────────────────────────────────────────────
interface CreateTripInput {
  title: string
  startDate: string
  endDate: string
  isPrivate?: boolean
}

interface CreateTripResponse {
  id: string
}

export type FeedItem = { id: string; title: string; excerpt?: string; createdAt: string }
export type Profile = { id: string; username: string; bio?: string; avatarUrl?: string }

export interface TripCoordinates {
  latitude: number
  longitude: number
}

export interface Trip {
  id: string
  title: string
  description: string
  location: string
  coordinates?: TripCoordinates
  startDate: string
  endDate: string
  status: 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  isPrivate: boolean
  ownerId: string
  owner: string
  createdAt: string
  updatedAt: string
}

export interface ListTripsOptions {
  limit?: number
  nextToken?: string
}

export interface ListTripsResponse {
  items: Trip[]
  nextToken?: string
}

// ── Helper: get authenticated Supabase client + user id ───────
async function getAuthContext() {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.access_token || !session.user) {
    throw new TripsApiError('User not authenticated')
  }
  return { supabase, userId: session.user.id }
}

// ── Feed ──────────────────────────────────────────────────────
export async function getFeed(): Promise<FeedItem[]> {
  try {
    const { supabase, userId } = await getAuthContext()

    // Query feed_items joined with the actor's profile for context
    const { data, error } = await supabase
      .from('feed_items')
      .select(
        'id, verb, object_id, object_type, created_at, actor:profiles!feed_items_actor_id_fkey(display_name, username)'
      )
      .eq('owner_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error

    return (data ?? []).map((item: Record<string, unknown>) => ({
      id: item.id as string,
      title: formatFeedTitle(
        item.verb as string,
        item.object_type as string,
        item.actor as Record<string, string>
      ),
      excerpt: `${item.verb as string} ${item.object_type as string}`,
      createdAt: item.created_at as string,
    }))
  } catch (error) {
    if (error instanceof TripsApiError) throw error
    console.error('Error fetching feed:', error)
    throw new TripsApiError('Failed to fetch feed')
  }
}

function formatFeedTitle(
  verb: string,
  objectType: string,
  actor?: Record<string, string> | null
): string {
  const name = actor?.display_name || actor?.username || 'Someone'
  const action =
    verb === 'post'
      ? 'posted'
      : verb === 'share'
        ? 'shared'
        : verb === 'comment'
          ? 'commented on'
          : verb
  return `${name} ${action} a ${objectType || 'update'}`
}

// ── Profile ───────────────────────────────────────────────────
export async function getProfile(userId: string): Promise<Profile> {
  try {
    const { supabase } = await getAuthContext()

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, display_name, bio, avatar_url')
      .eq('id', userId)
      .single()

    if (error) throw error

    return {
      id: data.id,
      username: data.username ?? data.display_name ?? '',
      bio: data.bio ?? undefined,
      avatarUrl: data.avatar_url ?? undefined,
    }
  } catch (error) {
    if (error instanceof TripsApiError) throw error
    console.error('Error fetching profile:', error)
    throw new TripsApiError('Failed to fetch profile')
  }
}

/** Public profile fields for viewing another user by username. */
export interface PublicProfile {
  id: string
  name: string
  username: string
  bio?: string
  avatar?: string
}

/**
 * Look up another user's public profile by username. Throws `TripsApiError`
 * ('Profile not found') when the username doesn't exist. Email and other
 * private fields are intentionally NOT selected — the viewer only ever sees
 * public profile data (RLS enforces this server-side too).
 */
export async function getProfileByUsername(username: string): Promise<PublicProfile> {
  try {
    const { supabase } = await getAuthContext()

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, display_name, bio, avatar_url')
      .eq('username', username)
      .maybeSingle()

    if (error) throw error
    if (!data) throw new TripsApiError('Profile not found')

    return {
      id: data.id as string,
      name: (data.display_name as string | undefined) ?? username,
      username: username,
      bio: data.bio as string | undefined,
      avatar: data.avatar_url as string | undefined,
    }
  } catch (error) {
    if (error instanceof TripsApiError) throw error
    console.error('Error fetching profile by username:', error)
    throw new TripsApiError('Failed to fetch profile')
  }
}

// ── Trips ─────────────────────────────────────────────────────
function mapTrip(row: Record<string, unknown>): Trip {
  return {
    id: row.id as string,
    title: row.name as string,
    description: (row.description as string) ?? '',
    location: (row.destination_name as string) ?? (row.destination as string) ?? '',
    coordinates:
      row.latitude && row.longitude
        ? { latitude: Number(row.latitude), longitude: Number(row.longitude) }
        : undefined,
    startDate: row.start_date as string,
    endDate: (row.end_date as string) ?? '',
    status: 'PLANNING' as const,
    isPrivate: !(row.is_public as boolean),
    ownerId: row.user_id as string,
    owner: '',
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

export async function createTrip(tripData: CreateTripInput): Promise<CreateTripResponse> {
  try {
    const { supabase, userId } = await getAuthContext()

    // Story 0.7: this called a `create_trip` RPC that never existed — no
    // migration defines it and prod does not have it. Direct insert under the
    // owner RLS policy ("Users can insert own trips") is the real path.
    const { data, error } = await supabase
      .from('trips')
      .insert({
        user_id: userId,
        name: tripData.title,
        destination_name: tripData.title,
        start_date: tripData.startDate,
        end_date: tripData.endDate,
        is_public: !tripData.isPrivate,
      })
      .select('id')
      .single()

    if (error) throw error

    return { id: data.id as string }
  } catch (error) {
    if (error instanceof TripsApiError) throw error
    console.error('Error creating trip:', error)
    throw new TripsApiError('Failed to create trip')
  }
}

export async function getTrip(tripId: string): Promise<Trip> {
  try {
    const { supabase } = await getAuthContext()

    // Story 0.7: `get_trip_by_id` RPC never existed. RLS decides visibility
    // (own trips + public trips), same as the RPC was imagined to.
    const { data, error } = await supabase.from('trips').select('*').eq('id', tripId).maybeSingle()

    if (error) throw error
    if (!data) throw new TripsApiError('Trip not found')

    return mapTrip(data as Record<string, unknown>)
  } catch (error) {
    if (error instanceof TripsApiError) throw error
    throw new TripsApiError('Failed to fetch trip')
  }
}

/**
 * The `nextToken` is an opaque offset cursor — the row offset of the next page.
 * A missing or malformed token resets to page 0 rather than throwing.
 */
function parseNextOffset(nextToken?: string): number {
  if (!nextToken) return 0
  const n = Number.parseInt(nextToken, 10)
  return Number.isFinite(n) && n > 0 ? n : 0
}

export async function listTrips(
  ownerId?: string,
  options?: ListTripsOptions
): Promise<ListTripsResponse> {
  try {
    const { supabase, userId } = await getAuthContext()

    const limit = Math.min(options?.limit ?? 50, 100)
    const offset = parseNextOffset(options?.nextToken)

    // Story 0.7: `list_my_trips` RPC never existed. Same contract: the
    // caller's own trips, newest first, offset-paged with a peek row
    // (range is inclusive, so offset..offset+limit fetches limit+1 rows).
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit)

    if (error) throw error

    const rows = (data ?? []) as Record<string, unknown>[]
    const hasMore = rows.length > limit
    const items = hasMore ? rows.slice(0, limit) : rows

    return {
      items: items.map(mapTrip),
      nextToken: hasMore ? String(offset + limit) : undefined,
    }
  } catch (error) {
    if (error instanceof TripsApiError) throw error
    throw new TripsApiError('Failed to list trips')
  }
}

export async function getMapTrips(): Promise<Trip[]> {
  try {
    const { supabase, userId } = await getAuthContext()

    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', userId)
      .not('destination', 'is', null)

    if (error) throw error

    return ((data ?? []) as Record<string, unknown>[])
      .map(mapTrip)
      .filter(trip => trip.coordinates?.latitude && trip.coordinates?.longitude)
  } catch (error) {
    if (error instanceof TripsApiError) throw error
    console.error('Error fetching map trips:', error)
    throw new TripsApiError('Failed to fetch map trips')
  }
}

export const getTripById = getTrip

export type { CreateTripInput, CreateTripResponse }
