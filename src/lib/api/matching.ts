import { createClient } from '@/lib/supabase/client'
import { invokeEdgeFunction } from '@/lib/supabase/client'
import { AppError } from '@/lib/errors'
import type {
  Connection,
  ConnectionProfile,
  ConnectionStatus,
  CompositeMatch,
  MatchType,
  PotentialMatch,
  SemanticMatchResult,
} from '@/types/matching'
import { getMatchConfidence } from '@/types/matching'

// ── Auth helper ────────────────────────────────────────────────
async function getAuthContext() {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.user) throw new AppError('User not authenticated', 401)
  return { supabase, userId: session.user.id }
}

// ── Match Discovery (3-tier fallback) ──────────────────────────

/**
 * Find potential matches using a 3-tier fallback strategy:
 *
 * 1. **Semantic edge function** — `find-potential-matches-semantic`
 *    AI-powered composite scoring via pgvector embeddings.
 * 2. **Geographic RPC fallback** — `find-overlapping-trips`
 *    Server-side geographic overlap computation.
 * 3. **Client-side computation** — direct table queries with
 *    haversine distance and date overlap (Sprint 7 baseline).
 */
export async function findPotentialMatches(): Promise<CompositeMatch[]> {
  const { userId } = await getAuthContext()

  // Tier 1: Semantic edge function (only if explicitly enabled)
  if (process.env.NEXT_PUBLIC_SEMANTIC_MATCHING_ENABLED === 'true') {
    const semantic = await trySemanticMatch(userId)
    if (semantic) return semantic
  }

  // Tier 2: Geographic edge-function fallback (derives the caller from the JWT)
  const geographic = await tryGeographicRpc()
  if (geographic) return geographic

  // Tier 3: Client-side computation (existing Sprint 7 logic)
  return findMatchesClientSide()
}

// ── Tier 1: Semantic Edge Function ─────────────────────────────

async function trySemanticMatch(userId: string): Promise<CompositeMatch[] | null> {
  const { data, error } = await invokeEdgeFunction<SemanticMatchResult[]>(
    'find-potential-matches-semantic',
    { user_id: userId, limit: 30 }
  )

  if (error || !data || !Array.isArray(data) || data.length === 0) {
    console.warn(
      '[matching] Semantic edge function unavailable, falling back:',
      error?.message ?? 'empty response'
    )
    return null
  }

  return data
    .map(normalizeSemanticMatch)
    .sort((a, b) => (b.matchPercentage ?? 0) - (a.matchPercentage ?? 0))
}

function normalizeSemanticMatch(raw: SemanticMatchResult): CompositeMatch {
  const confidence = getMatchConfidence(raw.matchPercentage)
  const matchType = deriveMatchType(raw)

  return {
    id: `semantic-${raw.userId}-${raw.destinationName ?? 'unknown'}`,
    userId: raw.userId,
    displayName: raw.displayName,
    avatarUrl: raw.avatarUrl,
    homeCountry: raw.homeCountry,
    destinationName: raw.destinationName,
    startDate: raw.startDate,
    endDate: raw.endDate,
    overlapDays: raw.overlapDays,
    distanceMeters: raw.distanceMeters,
    matchType,
    matchScore: raw.compositeScore,
    sharedActivities: raw.sharedActivities,
    // Composite fields
    semanticScore: raw.semanticScore,
    compositeScore: raw.compositeScore,
    matchPercentage: raw.matchPercentage,
    sharedActivityCount: raw.sharedActivityCount,
    confidence,
    factors: raw.factors,
  }
}

function deriveMatchType(raw: SemanticMatchResult): MatchType {
  const { factors } = raw
  const hasStrongActivity = factors.activities >= 0.3
  const hasStrongGeo = factors.destination >= 0.5 || (raw.distanceMeters ?? Infinity) < 50_000

  if (hasStrongActivity && hasStrongGeo) return 'combined_match'
  if (hasStrongActivity) return 'activity_match'
  return 'geographic_overlap'
}

// ── Tier 2: Geographic Edge Function Fallback ──────────────────

/**
 * Response shape of the `find-overlapping-trips` Edge Function.
 *
 * Mirrors the nested `user` / `trip` / `overlap` grouping the function returns
 * (see `supabase/functions/find-overlapping-trips/index.ts` in the mobile repo,
 * which owns the shared backend). The previous flat interface here matched
 * nothing the function ever emitted.
 */
interface OverlappingTripsResponse {
  matches: Array<{
    user: {
      id: string
      display_name: string | null
      age_range: string | null
      home_country: string | null
      gender: string | null
      gender_verified: boolean | null
    }
    trip: {
      id: string
      destination_name: string
      start_date: string
      end_date: string
    }
    overlap: {
      start_date: string | null
      end_date: string | null
      days: number
    }
    distance_meters: number | null
    matching_activities: string[]
  }>
}

/**
 * Geographic overlap via the `find-overlapping-trips` Edge Function.
 *
 * This is an Edge Function, not a database function: it was previously invoked
 * through `supabase.rpc('find-overlapping-trips')`, which can never resolve —
 * PostgREST looks up a Postgres routine and hyphens are not a legal identifier.
 * The call always errored into the catch and returned null, so this tier was
 * dead and every request fell through to the client-side tier.
 *
 * The function derives the caller from the JWT, so no user id is sent. Distance
 * is computed server-side against the PostGIS `trips.location` column, which is
 * why the client cannot do this itself.
 */
async function tryGeographicRpc(): Promise<CompositeMatch[] | null> {
  try {
    const { data, error } = await invokeEdgeFunction<OverlappingTripsResponse>(
      'find-overlapping-trips',
      { limit: 30 }
    )

    if (error || !data?.matches?.length) return null

    return data.matches.map((row): CompositeMatch => {
      const overlapDays = row.overlap?.days ?? 0
      const score = overlapDays > 0 ? Math.min(overlapDays / 7, 1) : 0
      const percentage = Math.round(score * 100)

      return {
        id: row.trip.id,
        userId: row.user.id,
        displayName: row.user.display_name ?? 'Traveler',
        avatarUrl: null,
        homeCountry: row.user.home_country ?? null,
        destinationName: row.trip.destination_name,
        startDate: row.trip.start_date,
        endDate: row.trip.end_date,
        overlapDays,
        distanceMeters: row.distance_meters ?? null,
        matchType: 'geographic_overlap' as const,
        matchScore: overlapDays > 0 ? score : null,
        sharedActivities: row.matching_activities ?? [],
        // Composite defaults (no semantic data available)
        semanticScore: 0,
        compositeScore: score,
        matchPercentage: percentage,
        sharedActivityCount: row.matching_activities?.length ?? 0,
        confidence: getMatchConfidence(percentage),
        factors: {
          semantic: 0,
          dateOverlap: score,
          activities: 0,
          destination: 0,
          age: 0,
        },
      }
    })
  } catch (err) {
    console.warn(
      '[matching] Geographic edge function unavailable, falling back to client-side:',
      err instanceof Error ? err.message : String(err)
    )
    return null
  }
}

// ── Tier 3: Client-Side Computation (Sprint 7 baseline) ───────

async function findMatchesClientSide(): Promise<CompositeMatch[]> {
  const { supabase, userId } = await getAuthContext()

  // Get current user's active trips for overlap comparison
  // No latitude/longitude here: `trips` stores position in a PostGIS
  // `location geography(Point,4326)` column, which PostgREST cannot hand back as
  // usable coordinates. Distance is therefore a server-side concern (tier 2);
  // this tier matches on date overlap and shared activities only.
  const { data: myTrips, error: myTripsError } = await supabase
    .from('trips')
    .select('destination, start_date, end_date')
    .eq('user_id', userId)
    .gte('end_date', new Date().toISOString())

  if (myTripsError) throw new AppError('Failed to fetch your trips')
  if (!myTrips || myTrips.length === 0) return []

  // Fetch current user's activity interests for overlap computation
  const myActivityIds = await fetchUserActivityIds(supabase, userId)

  // Find other users' matchable public trips
  const { data: otherTrips, error } = await supabase
    .from('trips')
    .select(
      `
      id, user_id, name, destination, start_date, end_date,
      profile:profiles!user_id(id, username, display_name, avatar_url, bio)
    `
    )
    .neq('user_id', userId)
    .eq('is_public', true)
    .gte('end_date', new Date().toISOString())
    .limit(50)

  if (error) throw new AppError('Failed to find matches')

  // Collect unique user IDs to batch-fetch their activities
  const otherUserIds = [...new Set((otherTrips ?? []).map(t => t.user_id as string))]
  const otherUserActivities = await batchFetchUserActivities(supabase, otherUserIds)

  // Fetch activity names for ID→name lookup
  const activityNameMap = await fetchActivityNameMap(supabase)

  const matches: CompositeMatch[] = []

  for (const trip of otherTrips ?? []) {
    const profile = trip.profile as unknown as Record<string, unknown> | null
    if (!profile) continue

    let maxOverlapDays = 0
    let matchType: PotentialMatch['matchType'] = 'geographic_overlap'

    for (const myTrip of myTrips) {
      // end_date is nullable in the schema; an open-ended trip has no
      // computable overlap window, so skip rather than build an Invalid Date.
      if (!myTrip.end_date || !trip.end_date) continue

      const overlapStart = new Date(
        Math.max(new Date(myTrip.start_date).getTime(), new Date(trip.start_date).getTime())
      )
      const overlapEnd = new Date(
        Math.min(new Date(myTrip.end_date).getTime(), new Date(trip.end_date).getTime())
      )

      if (overlapStart < overlapEnd) {
        const days = Math.ceil(
          (overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24)
        )
        if (days > maxOverlapDays) maxOverlapDays = days
      }
    }

    // Unavailable in this tier — see the trips select above.
    const distanceMeters: number | null = null

    // Compute shared activities for this match
    const theirIds = otherUserActivities[trip.user_id as string] ?? new Set<string>()
    const sharedIds = [...myActivityIds].filter(id => theirIds.has(id))
    const sharedActivityNames = sharedIds
      .map(id => activityNameMap.get(id))
      .filter((name): name is string => name !== undefined)

    const activityFactor = computeActivityFactor(myActivityIds, theirIds)

    if (
      activityFactor >= 0.3 &&
      ((distanceMeters !== null && distanceMeters < 50000) || maxOverlapDays > 0)
    ) {
      matchType = 'combined_match'
    } else if (activityFactor >= 0.3) {
      matchType = 'activity_match'
    } else if (distanceMeters !== null && distanceMeters < 50000) {
      matchType = 'geographic_overlap'
    } else if (maxOverlapDays > 0) {
      matchType = 'activity_match'
    } else {
      continue
    }

    const matchPct = maxOverlapDays > 0 ? Math.round(Math.min(maxOverlapDays / 7, 1) * 100) : 0

    matches.push({
      id: trip.id,
      userId: trip.user_id as string,
      displayName: (profile.display_name as string) ?? (profile.username as string) ?? 'Traveler',
      avatarUrl: (profile.avatar_url as string) ?? null,
      homeCountry: null,
      destinationName: trip.destination ?? trip.name,
      startDate: trip.start_date as string,
      endDate: trip.end_date as string,
      overlapDays: maxOverlapDays,
      distanceMeters,
      matchType,
      matchScore: maxOverlapDays > 0 ? Math.min(maxOverlapDays / 7, 1) : null,
      sharedActivities: sharedActivityNames,
      // Composite fields enriched with activity data
      semanticScore: 0,
      compositeScore: maxOverlapDays > 0 ? Math.min(maxOverlapDays / 7, 1) : 0,
      matchPercentage: matchPct,
      sharedActivityCount: sharedActivityNames.length,
      confidence: getMatchConfidence(matchPct),
      factors: {
        semantic: 0,
        dateOverlap: maxOverlapDays > 0 ? Math.min(maxOverlapDays / 7, 1) : 0,
        activities: activityFactor,
        destination: 0,
        age: 0,
      },
    })
  }

  return matches.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0))
}

// ── Activity overlap helpers ──────────────────────────────────

async function fetchUserActivityIds(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<Set<string>> {
  const { data } = await supabase
    .from('user_activities')
    .select('activity_id')
    .eq('user_id', userId)
  return new Set((data ?? []).map(r => r.activity_id as string))
}

async function batchFetchUserActivities(
  supabase: ReturnType<typeof createClient>,
  userIds: string[]
): Promise<Record<string, Set<string>>> {
  if (userIds.length === 0) return {}
  const { data } = await supabase
    .from('user_activities')
    .select('user_id, activity_id')
    .in('user_id', userIds)
  const map: Record<string, Set<string>> = {}
  for (const row of data ?? []) {
    const uid = row.user_id as string
    if (!map[uid]) map[uid] = new Set()
    map[uid].add(row.activity_id as string)
  }
  return map
}

async function fetchActivityNameMap(
  supabase: ReturnType<typeof createClient>
): Promise<Map<string, string>> {
  const { data } = await supabase.from('activities').select('id, name').eq('is_active', true)
  const map = new Map<string, string>()
  for (const row of data ?? []) {
    map.set(row.id as string, row.name as string)
  }
  return map
}

function computeActivityFactor(myIds: Set<string>, theirIds: Set<string>): number {
  if (myIds.size === 0 || theirIds.size === 0) return 0
  const intersection = [...myIds].filter(id => theirIds.has(id)).length
  const union = new Set([...myIds, ...theirIds]).size
  return union > 0 ? intersection / union : 0
}

// ── Connections ────────────────────────────────────────────────

export async function getConnections(status?: string): Promise<Connection[]> {
  const { supabase, userId } = await getAuthContext()

  let query = supabase
    .from('connections')
    .select(
      `
      *,
      requester:profiles!requester_id(id, username, display_name, avatar_url, bio),
      recipient:profiles!recipient_id(id, username, display_name, avatar_url, bio)
    `
    )
    .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
    .order('created_at', { ascending: false })
    .limit(50)

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) throw new AppError('Failed to fetch connections')

  return (data ?? []).map(mapConnection)
}

export async function requestConnection(
  recipientId: string,
  message?: string
): Promise<Connection> {
  const { userId: _requesterId } = await getAuthContext()
  void _requesterId

  // Use edge function only if semantic matching is explicitly enabled
  if (process.env.NEXT_PUBLIC_SEMANTIC_MATCHING_ENABLED === 'true') {
    const { data, error } = await invokeEdgeFunction<Record<string, unknown>>(
      'request-connection',
      { recipient_id: recipientId, message: message ?? null }
    )

    if (error) {
      if (
        !error.status ||
        error.status >= 500 ||
        error.code === 'TIMEOUT' ||
        error.code === 'FETCH_ERROR'
      ) {
        return requestConnectionFallback(recipientId, message)
      }
      throw mapConnectionError(error)
    }

    if (data) return mapConnection(data)
  }

  return requestConnectionFallback(recipientId, message)
}

/** Map edge function validation errors to user-friendly messages */
function mapConnectionError(error: { message: string; status?: number; code?: string }): AppError {
  const msg = error.message.toLowerCase()

  if (
    msg.includes('already connected') ||
    msg.includes('already_exists') ||
    msg.includes('duplicate')
  ) {
    return new AppError('Already connected with this user', 409)
  }
  if (msg.includes('blocked') || msg.includes('block')) {
    return new AppError('Unable to send request — user is not available', 403)
  }
  if (msg.includes('not found') || msg.includes('recipient')) {
    return new AppError('User not found', 404)
  }
  if (msg.includes('no active trip') || msg.includes('no_trip')) {
    return new AppError('You need at least one active trip to connect', 400)
  }
  if (msg.includes('self') || msg.includes('yourself')) {
    return new AppError('You cannot connect with yourself', 400)
  }
  if (msg.includes('rate limit') || error.status === 429) {
    return new AppError('Too many requests — please try again later', 429)
  }

  return new AppError(error.message || 'Failed to send connection request', error.status)
}

/**
 * Fallback: direct table insert (Sprint 7 baseline).
 *
 * `message` is accepted for signature parity with the edge-function path but is
 * not persisted here — `connections` has no message column. The insert
 * previously included one, which PostgREST rejected, so this fallback failed
 * outright. Dropping it makes the fallback work; carrying the note to the
 * recipient still requires the edge-function path.
 */
async function requestConnectionFallback(
  recipientId: string,
  message?: string
): Promise<Connection> {
  const { supabase, userId } = await getAuthContext()
  void message

  const { data, error } = await supabase
    .from('connections')
    .insert({
      requester_id: userId,
      recipient_id: recipientId,
      status: 'pending',
    })
    .select(
      `
      *,
      requester:profiles!requester_id(id, username, display_name, avatar_url, bio),
      recipient:profiles!recipient_id(id, username, display_name, avatar_url, bio)
    `
    )
    .single()

  if (error) {
    if (error.code === '23505') throw new AppError('Connection already exists')
    throw new AppError('Failed to send connection request')
  }

  return mapConnection(data as Record<string, unknown>)
}

export async function respondToConnection(connectionId: string, accept: boolean): Promise<void> {
  // Use edge function only if semantic matching is explicitly enabled
  if (process.env.NEXT_PUBLIC_SEMANTIC_MATCHING_ENABLED === 'true') {
    const { data, error } = await invokeEdgeFunction<Record<string, unknown>>(
      'respond-connection',
      { connection_id: connectionId, accept }
    )

    if (error) {
      if (
        !error.status ||
        error.status >= 500 ||
        error.code === 'TIMEOUT' ||
        error.code === 'FETCH_ERROR'
      ) {
        return respondToConnectionFallback(connectionId, accept)
      }
      const msg = error.message.toLowerCase()
      if (msg.includes('already') && msg.includes('accept')) {
        throw new AppError('Connection has already been accepted', 409)
      }
      if (msg.includes('not found') || msg.includes('connection')) {
        throw new AppError('Connection request no longer exists', 404)
      }
      throw new AppError(error.message || 'Failed to respond to connection', error.status)
    }

    if (data) return
  }

  return respondToConnectionFallback(connectionId, accept)
}

/** Fallback: direct table update (Sprint 7 baseline) */
async function respondToConnectionFallback(connectionId: string, accept: boolean): Promise<void> {
  const { supabase } = await getAuthContext()

  const { error } = await supabase
    .from('connections')
    .update({ status: accept ? 'accepted' : 'declined', updated_at: new Date().toISOString() })
    .eq('id', connectionId)

  if (error) throw new AppError('Failed to respond to connection')
}

// ── Mappers ────────────────────────────────────────────────────

function mapConnection(row: Record<string, unknown>): Connection {
  return {
    id: row.id as string,
    requesterId: row.requester_id as string,
    recipientId: row.recipient_id as string,
    status: (row.status as ConnectionStatus) ?? 'pending',
    matchType: (row.match_type as MatchType) ?? null,
    message: (row.message as string) ?? null,
    createdAt: row.created_at as string,
    updatedAt: (row.updated_at as string) ?? (row.created_at as string),
    requester: mapProfile(row.requester as Record<string, unknown> | null),
    recipient: mapProfile(row.recipient as Record<string, unknown> | null),
  }
}

function mapProfile(data: Record<string, unknown> | null): ConnectionProfile | undefined {
  if (!data) return undefined
  return {
    id: data.id as string,
    username: (data.username as string) ?? null,
    displayName: (data.display_name as string) ?? null,
    avatarUrl: (data.avatar_url as string) ?? null,
    bio: (data.bio as string) ?? null,
    homeCountry: null,
  }
}

// ── Helpers ────────────────────────────────────────────────────

// haversineDistance was removed with the client-side distance calculation: it
// only ever ran on trips.latitude/longitude, columns that do not exist. Distance
// is computed server-side by find-overlapping-trips against PostGIS.
