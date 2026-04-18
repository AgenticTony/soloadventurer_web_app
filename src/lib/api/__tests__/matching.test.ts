import {
  findPotentialMatches,
  requestConnection,
  respondToConnection,
} from '../matching';
import type { SemanticMatchResult } from '@/types/matching';

// ── Supabase mock ─────────────────────────────────────────────

const mockGetSession = jest.fn();
const mockFrom = jest.fn();
const mockRpc = jest.fn();
const mockFunctionsInvoke = jest.fn();

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: { getSession: mockGetSession },
    from: mockFrom,
    rpc: mockRpc,
    functions: { invoke: mockFunctionsInvoke },
  }),
  invokeEdgeFunction: jest.fn(),
}));

// Import the mocked invokeEdgeFunction so we can control it
import { invokeEdgeFunction } from '@/lib/supabase/client';
const mockInvokeEdgeFunction = invokeEdgeFunction as jest.MockedFunction<typeof invokeEdgeFunction>;

const AUTHED_SESSION = {
  data: { session: { user: { id: 'current-user' } } },
};

beforeEach(() => {
  jest.clearAllMocks();
  mockGetSession.mockResolvedValue(AUTHED_SESSION);
});

// ── findPotentialMatches — 3-tier fallback ────────────────────

describe('findPotentialMatches', () => {
  // ── Tier 1: Semantic edge function ─────────────────────────

  describe('Tier 1 — semantic edge function', () => {
    it('returns CompositeMatch[] when edge function succeeds', async () => {
      const semanticResult: SemanticMatchResult[] = [
        {
          userId: 'user-2',
          displayName: 'Bob',
          avatarUrl: null,
          homeCountry: 'USA',
          destinationName: 'Tokyo',
          startDate: '2026-04-05',
          endDate: '2026-04-12',
          overlapDays: 5,
          distanceMeters: 1000,
          semanticScore: 0.9,
          compositeScore: 0.85,
          matchPercentage: 85,
          sharedActivityCount: 2,
          sharedActivities: ['hiking', 'food'],
          factors: { semantic: 0.9, dateOverlap: 0.71, activities: 0.5, destination: 1.0, age: 0.8 },
        },
      ];

      mockInvokeEdgeFunction.mockResolvedValue({ data: semanticResult, error: null });

      const matches = await findPotentialMatches();

      expect(matches).toHaveLength(1);
      expect(matches[0].userId).toBe('user-2');
      expect(matches[0].matchPercentage).toBe(85);
      expect(matches[0].confidence).toBe('high');
      expect(matches[0].matchType).toBe('combined_match');
      expect(mockInvokeEdgeFunction).toHaveBeenCalledWith(
        'find-potential-matches-semantic',
        { user_id: 'current-user', limit: 30 },
      );
    });

    it('sorts results by matchPercentage descending', async () => {
      const results: SemanticMatchResult[] = [
        { userId: 'u1', displayName: 'A', avatarUrl: null, homeCountry: null, destinationName: null, startDate: null, endDate: null, overlapDays: 0, distanceMeters: null, semanticScore: 0.5, compositeScore: 0.5, matchPercentage: 50, sharedActivityCount: 0, sharedActivities: [], factors: { semantic: 0.5, dateOverlap: 0, activities: 0, destination: 0, age: 0 } },
        { userId: 'u2', displayName: 'B', avatarUrl: null, homeCountry: null, destinationName: null, startDate: null, endDate: null, overlapDays: 0, distanceMeters: null, semanticScore: 0.9, compositeScore: 0.9, matchPercentage: 90, sharedActivityCount: 0, sharedActivities: [], factors: { semantic: 0.9, dateOverlap: 0, activities: 0, destination: 0, age: 0 } },
      ];

      mockInvokeEdgeFunction.mockResolvedValue({ data: results, error: null });

      const matches = await findPotentialMatches();

      expect(matches[0].userId).toBe('u2'); // 90% first
      expect(matches[1].userId).toBe('u1'); // 50% second
    });

    it('derives matchType as combined_match for strong activity + geo', async () => {
      const results: SemanticMatchResult[] = [
        {
          userId: 'u1', displayName: 'A', avatarUrl: null, homeCountry: null,
          destinationName: 'Tokyo', startDate: null, endDate: null, overlapDays: 0,
          distanceMeters: 10000, semanticScore: 0.8, compositeScore: 0.8, matchPercentage: 80,
          sharedActivityCount: 0, sharedActivities: [],
          factors: { semantic: 0.8, dateOverlap: 0, activities: 0.5, destination: 0.8, age: 0 },
        },
      ];

      mockInvokeEdgeFunction.mockResolvedValue({ data: results, error: null });

      const matches = await findPotentialMatches();
      expect(matches[0].matchType).toBe('combined_match');
    });

    it('derives matchType as activity_match for strong activity only', async () => {
      const results: SemanticMatchResult[] = [
        {
          userId: 'u1', displayName: 'A', avatarUrl: null, homeCountry: null,
          destinationName: 'Tokyo', startDate: null, endDate: null, overlapDays: 0,
          distanceMeters: 100000, semanticScore: 0.7, compositeScore: 0.7, matchPercentage: 70,
          sharedActivityCount: 0, sharedActivities: [],
          factors: { semantic: 0.7, dateOverlap: 0, activities: 0.5, destination: 0.1, age: 0 },
        },
      ];

      mockInvokeEdgeFunction.mockResolvedValue({ data: results, error: null });

      const matches = await findPotentialMatches();
      expect(matches[0].matchType).toBe('activity_match');
    });

    it('derives matchType as geographic_overlap when no strong activity', async () => {
      const results: SemanticMatchResult[] = [
        {
          userId: 'u1', displayName: 'A', avatarUrl: null, homeCountry: null,
          destinationName: 'Tokyo', startDate: null, endDate: null, overlapDays: 0,
          distanceMeters: 200000, semanticScore: 0.5, compositeScore: 0.5, matchPercentage: 50,
          sharedActivityCount: 0, sharedActivities: [],
          factors: { semantic: 0.5, dateOverlap: 0, activities: 0.1, destination: 0.2, age: 0 },
        },
      ];

      mockInvokeEdgeFunction.mockResolvedValue({ data: results, error: null });

      const matches = await findPotentialMatches();
      expect(matches[0].matchType).toBe('geographic_overlap');
    });
  });

  // ── Tier 2: Geographic RPC fallback ────────────────────────

  describe('Tier 2 — geographic RPC fallback', () => {
    it('falls back to RPC when edge function returns error', async () => {
      mockInvokeEdgeFunction.mockResolvedValue({ data: null, error: { message: 'Failed' } });

      const rpcData = [{
        id: 'trip-1',
        user_id: 'user-2',
        destination: 'Paris',
        start_date: '2026-04-01',
        end_date: '2026-04-10',
        overlap_days: 3,
        distance_meters: 5000,
        display_name: 'Carol',
        avatar_url: null,
      }];

      mockRpc.mockResolvedValue({ data: rpcData, error: null });

      const matches = await findPotentialMatches();

      expect(matches).toHaveLength(1);
      expect(matches[0].userId).toBe('user-2');
      expect(matches[0].destinationName).toBe('Paris');
      expect(matches[0].overlapDays).toBe(3);
      expect(matches[0].matchType).toBe('geographic_overlap');
    });

    it('falls back further when RPC returns empty data', async () => {
      mockInvokeEdgeFunction.mockResolvedValue({ data: null, error: { message: 'Failed' } });
      mockRpc.mockResolvedValue({ data: [], error: null });

      // Tier 3 client-side also returns empty (no trips set up)
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockGte = jest.fn().mockReturnValue({ data: [], error: null });
      mockFrom.mockReturnValue({ select: mockSelect });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ gte: mockGte });

      const matches = await findPotentialMatches();
      expect(matches).toEqual([]);
    });
  });

  // ── Tier 3: Client-side computation with activity overlap ──

  describe('Tier 3 — client-side with activity overlap', () => {
    // Helper: set up mocks for Tier 3 client-side path
    function setupTier3Mocks(overrides?: {
      myTrips?: unknown[];
      otherTrips?: unknown[];
      myActivities?: unknown[];
      otherActivities?: unknown[];
      activityNames?: unknown[];
    }) {
      mockInvokeEdgeFunction.mockResolvedValue({ data: null, error: { message: 'Unavailable' } });
      mockRpc.mockResolvedValue({ data: null, error: { message: 'Unavailable' } });

      const myTrips = overrides?.myTrips ?? [
        { destination: 'Tokyo', start_date: '2026-05-01', end_date: '2026-05-10', latitude: 35.6762, longitude: 139.6503 },
      ];
      const otherTrips = overrides?.otherTrips ?? [];

      // Track how many times 'trips' is queried to differentiate my trips vs other trips
      let tripsQueryCount = 0;

      mockFrom.mockImplementation((table: string) => {
        if (table === 'trips') {
          tripsQueryCount++;
          const currentQuery = tripsQueryCount;
          // First query = my trips, second query = other trips
          const chainable = {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                gte: currentQuery === 1
                  ? jest.fn().mockResolvedValue({ data: myTrips, error: null })
                  : jest.fn(),
              }),
              neq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  gte: jest.fn().mockReturnValue({
                    limit: jest.fn().mockResolvedValue({ data: otherTrips, error: null }),
                  }),
                }),
              }),
            }),
          };
          return chainable;
        }
        if (table === 'user_activities') {
          // Create a select function that returns an object with both eq and in
          // eq resolves with myActivities, in resolves with otherActivities
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ data: overrides?.myActivities ?? [], error: null }),
              in: jest.fn().mockResolvedValue({ data: overrides?.otherActivities ?? [], error: null }),
            }),
          };
        }
        if (table === 'activities') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ data: overrides?.activityNames ?? [], error: null }),
            }),
          };
        }
        return { select: jest.fn().mockReturnValue({ eq: jest.fn().mockReturnThis() }) };
      });
    }

    it('includes shared activities in client-side match results', async () => {
      setupTier3Mocks({
        otherTrips: [{
          id: 'trip-1', user_id: 'user-2', name: 'Trip', destination: 'Tokyo',
          start_date: '2026-05-03', end_date: '2026-05-08',
          latitude: 35.68, longitude: 139.69,
          profile: { id: 'user-2', username: 'bob', display_name: 'Bob', avatar_url: null, bio: null },
        }],
        myActivities: [
          { activity_id: 'act-1' },
          { activity_id: 'act-2' },
        ],
        otherActivities: [
          { user_id: 'user-2', activity_id: 'act-1' },
          { user_id: 'user-2', activity_id: 'act-3' },
        ],
        activityNames: [
          { id: 'act-1', name: 'Hiking' },
          { id: 'act-2', name: 'Photography' },
          { id: 'act-3', name: 'Cooking' },
        ],
      });

      const matches = await findPotentialMatches();

      expect(matches.length).toBeGreaterThanOrEqual(1);
      const match = matches.find((m) => m.userId === 'user-2');
      expect(match).toBeDefined();
      expect(match!.sharedActivities).toContain('Hiking');
      expect(match!.sharedActivityCount).toBe(1);
      expect(match!.factors.activities).toBeCloseTo(1 / 3); // Jaccard: 1 shared / 3 union
    });

    it('returns empty sharedActivities when no overlap', async () => {
      setupTier3Mocks({
        otherTrips: [{
          id: 'trip-1', user_id: 'user-2', name: 'Trip', destination: 'Tokyo',
          start_date: '2026-05-03', end_date: '2026-05-08',
          latitude: 35.68, longitude: 139.69,
          profile: { id: 'user-2', username: 'bob', display_name: 'Bob', avatar_url: null, bio: null },
        }],
        myActivities: [{ activity_id: 'act-1' }],
        otherActivities: [{ user_id: 'user-2', activity_id: 'act-2' }],
        activityNames: [
          { id: 'act-1', name: 'Hiking' },
          { id: 'act-2', name: 'Photography' },
        ],
      });

      const matches = await findPotentialMatches();
      const match = matches.find((m) => m.userId === 'user-2');
      expect(match).toBeDefined();
      expect(match!.sharedActivities).toEqual([]);
      expect(match!.factors.activities).toBe(0);
    });

    it('computes activity factor as Jaccard similarity', async () => {
      // Both have 2 activities, 1 shared → Jaccard = 1/3
      setupTier3Mocks({
        otherTrips: [{
          id: 'trip-1', user_id: 'user-2', name: 'Trip', destination: 'Tokyo',
          start_date: '2026-05-03', end_date: '2026-05-08',
          latitude: 35.68, longitude: 139.69,
          profile: { id: 'user-2', username: 'bob', display_name: 'Bob', avatar_url: null, bio: null },
        }],
        myActivities: [{ activity_id: 'a' }, { activity_id: 'b' }],
        otherActivities: [
          { user_id: 'user-2', activity_id: 'a' },
          { user_id: 'user-2', activity_id: 'c' },
        ],
        activityNames: [
          { id: 'a', name: 'Hiking' },
          { id: 'b', name: 'Photography' },
          { id: 'c', name: 'Cooking' },
        ],
      });

      const matches = await findPotentialMatches();
      const match = matches.find((m) => m.userId === 'user-2');
      expect(match).toBeDefined();
      // Jaccard = intersection(1) / union(3) = 0.333...
      expect(match!.factors.activities).toBeCloseTo(1 / 3);
    });
  });

  // ── Auth guard ─────────────────────────────────────────────

  describe('authentication', () => {
    it('throws when user is not authenticated', async () => {
      mockGetSession.mockResolvedValue({ data: { session: null } });

      await expect(findPotentialMatches()).rejects.toThrow('User not authenticated');
    });
  });
});

// ── requestConnection — edge function with fallback ──────────

describe('requestConnection', () => {
  const CONNECTION_ROW = {
    id: 'conn-1',
    requester_id: 'current-user',
    recipient_id: 'user-2',
    status: 'pending',
    match_type: null,
    message: null,
    created_at: '2026-04-14T00:00:00Z',
    updated_at: '2026-04-14T00:00:00Z',
    requester: { id: 'current-user', username: 'me', display_name: 'Me', avatar_url: null, bio: null },
    recipient: { id: 'user-2', username: 'bob', display_name: 'Bob', avatar_url: null, bio: null },
  };

  // ── Edge function primary path ─────────────────────────────

  describe('edge function primary path', () => {
    it('calls request-connection edge function with correct params', async () => {
      mockInvokeEdgeFunction.mockResolvedValue({ data: CONNECTION_ROW, error: null });

      await requestConnection('user-2', 'Hey there!');

      expect(mockInvokeEdgeFunction).toHaveBeenCalledWith(
        'request-connection',
        { recipient_id: 'user-2', message: 'Hey there!' },
      );
    });

    it('returns mapped Connection when edge function succeeds', async () => {
      mockInvokeEdgeFunction.mockResolvedValue({ data: CONNECTION_ROW, error: null });

      const result = await requestConnection('user-2');

      expect(result.id).toBe('conn-1');
      expect(result.requesterId).toBe('current-user');
      expect(result.recipientId).toBe('user-2');
      expect(result.status).toBe('pending');
    });

    it('calls edge function with null message when not provided', async () => {
      mockInvokeEdgeFunction.mockResolvedValue({ data: CONNECTION_ROW, error: null });

      await requestConnection('user-2');

      expect(mockInvokeEdgeFunction).toHaveBeenCalledWith(
        'request-connection',
        { recipient_id: 'user-2', message: null },
      );
    });
  });

  // ── Fallback to direct insert ──────────────────────────────

  describe('fallback to direct insert', () => {
    it('falls back on 5xx server error', async () => {
      mockInvokeEdgeFunction.mockResolvedValue({
        data: null,
        error: { message: 'Internal Server Error', status: 500 },
      });

      const mockInsert = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({ data: CONNECTION_ROW, error: null });
      mockFrom.mockReturnValue({ insert: mockInsert });
      mockInsert.mockReturnValue({ select: mockSelect });
      mockSelect.mockReturnValue({ single: mockSingle });

      const result = await requestConnection('user-2');

      expect(result.id).toBe('conn-1');
      expect(mockFrom).toHaveBeenCalledWith('connections');
    });

    it('falls back on timeout error', async () => {
      mockInvokeEdgeFunction.mockResolvedValue({
        data: null,
        error: { message: 'timed out', code: 'TIMEOUT' },
      });

      const mockInsert = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({ data: CONNECTION_ROW, error: null });
      mockFrom.mockReturnValue({ insert: mockInsert });
      mockInsert.mockReturnValue({ select: mockSelect });
      mockSelect.mockReturnValue({ single: mockSingle });

      const result = await requestConnection('user-2');
      expect(result.id).toBe('conn-1');
    });

    it('falls back on fetch/network error', async () => {
      mockInvokeEdgeFunction.mockResolvedValue({
        data: null,
        error: { message: 'Connection refused', code: 'FETCH_ERROR' },
      });

      const mockInsert = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({ data: CONNECTION_ROW, error: null });
      mockFrom.mockReturnValue({ insert: mockInsert });
      mockInsert.mockReturnValue({ select: mockSelect });
      mockSelect.mockReturnValue({ single: mockSingle });

      const result = await requestConnection('user-2');
      expect(result.id).toBe('conn-1');
    });

    it('falls back when edge function returns null data without error', async () => {
      mockInvokeEdgeFunction.mockResolvedValue({ data: null, error: null });

      const mockInsert = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({ data: CONNECTION_ROW, error: null });
      mockFrom.mockReturnValue({ insert: mockInsert });
      mockInsert.mockReturnValue({ select: mockSelect });
      mockSelect.mockReturnValue({ single: mockSingle });

      const result = await requestConnection('user-2');
      expect(result.id).toBe('conn-1');
    });

    it('throws on duplicate connection in fallback (error code 23505)', async () => {
      mockInvokeEdgeFunction.mockResolvedValue({
        data: null,
        error: { message: 'Server error', status: 500 },
      });

      const mockInsert = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: { code: '23505', message: 'duplicate key' },
      });
      mockFrom.mockReturnValue({ insert: mockInsert });
      mockInsert.mockReturnValue({ select: mockSelect });
      mockSelect.mockReturnValue({ single: mockSingle });

      await expect(requestConnection('user-2')).rejects.toThrow('Connection already exists');
    });

    it('throws on generic insert error in fallback', async () => {
      mockInvokeEdgeFunction.mockResolvedValue({
        data: null,
        error: { message: 'Server error', status: 500 },
      });

      const mockInsert = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: { code: '50000', message: 'Insert failed' },
      });
      mockFrom.mockReturnValue({ insert: mockInsert });
      mockInsert.mockReturnValue({ select: mockSelect });
      mockSelect.mockReturnValue({ single: mockSingle });

      await expect(requestConnection('user-2')).rejects.toThrow('Failed to send connection request');
    });
  });

  // ── Validation error mapping (4xx) ─────────────────────────

  describe('validation error mapping', () => {
    it('maps "already connected" to user-friendly message', async () => {
      mockInvokeEdgeFunction.mockResolvedValue({
        data: null,
        error: { message: 'Users are already connected', status: 409 },
      });

      await expect(requestConnection('user-2')).rejects.toThrow('Already connected with this user');
    });

    it('maps "already_exists" to user-friendly message', async () => {
      mockInvokeEdgeFunction.mockResolvedValue({
        data: null,
        error: { message: 'already_exists: connection found', status: 409 },
      });

      await expect(requestConnection('user-2')).rejects.toThrow('Already connected with this user');
    });

    it('maps "duplicate" to user-friendly message', async () => {
      mockInvokeEdgeFunction.mockResolvedValue({
        data: null,
        error: { message: 'Duplicate connection request', status: 409 },
      });

      await expect(requestConnection('user-2')).rejects.toThrow('Already connected with this user');
    });

    it('maps "blocked" to user-friendly message', async () => {
      mockInvokeEdgeFunction.mockResolvedValue({
        data: null,
        error: { message: 'User has blocked the requester', status: 403 },
      });

      await expect(requestConnection('user-2')).rejects.toThrow('Unable to send request — user is not available');
    });

    it('maps "not found" to user-friendly message', async () => {
      mockInvokeEdgeFunction.mockResolvedValue({
        data: null,
        error: { message: 'Recipient not found', status: 404 },
      });

      await expect(requestConnection('user-2')).rejects.toThrow('User not found');
    });

    it('maps "no active trip" to user-friendly message', async () => {
      mockInvokeEdgeFunction.mockResolvedValue({
        data: null,
        error: { message: 'Requester has no active trips', status: 400 },
      });

      await expect(requestConnection('user-2')).rejects.toThrow('You need at least one active trip to connect');
    });

    it('maps "no_trip" to user-friendly message', async () => {
      mockInvokeEdgeFunction.mockResolvedValue({
        data: null,
        error: { message: 'no_trip: user has no trips', status: 400 },
      });

      await expect(requestConnection('user-2')).rejects.toThrow('You need at least one active trip to connect');
    });

    it('maps "self" connection to user-friendly message', async () => {
      mockInvokeEdgeFunction.mockResolvedValue({
        data: null,
        error: { message: 'Cannot connect with yourself', status: 400 },
      });

      await expect(requestConnection('current-user')).rejects.toThrow('You cannot connect with yourself');
    });

    it('maps rate limit (429) to user-friendly message', async () => {
      mockInvokeEdgeFunction.mockResolvedValue({
        data: null,
        error: { message: 'Too many requests', status: 429 },
      });

      await expect(requestConnection('user-2')).rejects.toThrow('Too many requests — please try again later');
    });

    it('maps rate limit via message text to user-friendly message', async () => {
      mockInvokeEdgeFunction.mockResolvedValue({
        data: null,
        error: { message: 'Rate limit exceeded', status: 400 },
      });

      await expect(requestConnection('user-2')).rejects.toThrow('Too many requests — please try again later');
    });

    it('passes through unrecognized 4xx error message', async () => {
      mockInvokeEdgeFunction.mockResolvedValue({
        data: null,
        error: { message: 'Some unknown validation error', status: 422 },
      });

      await expect(requestConnection('user-2')).rejects.toThrow('Some unknown validation error');
    });
  });
});

// ── respondToConnection — edge function with fallback ────────

describe('respondToConnection', () => {
  // ── Edge function primary path ─────────────────────────────

  describe('edge function primary path', () => {
    it('calls respond-connection edge function with accept=true', async () => {
      mockInvokeEdgeFunction.mockResolvedValue({
        data: { connection_id: 'conn-1', status: 'accepted' },
        error: null,
      });

      await respondToConnection('conn-1', true);

      expect(mockInvokeEdgeFunction).toHaveBeenCalledWith(
        'respond-connection',
        { connection_id: 'conn-1', accept: true },
      );
    });

    it('calls respond-connection edge function with accept=false', async () => {
      mockInvokeEdgeFunction.mockResolvedValue({
        data: { connection_id: 'conn-1', status: 'declined' },
        error: null,
      });

      await respondToConnection('conn-1', false);

      expect(mockInvokeEdgeFunction).toHaveBeenCalledWith(
        'respond-connection',
        { connection_id: 'conn-1', accept: false },
      );
    });

    it('returns void on successful accept', async () => {
      mockInvokeEdgeFunction.mockResolvedValue({
        data: { connection_id: 'conn-1', status: 'accepted' },
        error: null,
      });

      const result = await respondToConnection('conn-1', true);
      expect(result).toBeUndefined();
    });

    it('returns void on successful decline', async () => {
      mockInvokeEdgeFunction.mockResolvedValue({
        data: { connection_id: 'conn-1', status: 'declined' },
        error: null,
      });

      const result = await respondToConnection('conn-1', false);
      expect(result).toBeUndefined();
    });
  });

  // ── Fallback to direct update ──────────────────────────────

  describe('fallback to direct update', () => {
    it('falls back on 5xx server error', async () => {
      mockInvokeEdgeFunction.mockResolvedValue({
        data: null,
        error: { message: 'Internal Server Error', status: 500 },
      });

      const mockUpdate = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockResolvedValue({ error: null });
      mockFrom.mockReturnValue({ update: mockUpdate });
      mockUpdate.mockReturnValue({ eq: mockEq });

      await respondToConnection('conn-1', true);

      expect(mockFrom).toHaveBeenCalledWith('connections');
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'accepted' }),
      );
    });

    it('falls back on timeout error', async () => {
      mockInvokeEdgeFunction.mockResolvedValue({
        data: null,
        error: { message: 'timed out', code: 'TIMEOUT' },
      });

      const mockUpdate = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockResolvedValue({ error: null });
      mockFrom.mockReturnValue({ update: mockUpdate });
      mockUpdate.mockReturnValue({ eq: mockEq });

      await respondToConnection('conn-1', false);

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'declined' }),
      );
    });

    it('falls back on fetch/network error', async () => {
      mockInvokeEdgeFunction.mockResolvedValue({
        data: null,
        error: { message: 'Connection refused', code: 'FETCH_ERROR' },
      });

      const mockUpdate = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockResolvedValue({ error: null });
      mockFrom.mockReturnValue({ update: mockUpdate });
      mockUpdate.mockReturnValue({ eq: mockEq });

      await respondToConnection('conn-1', true);
      expect(mockFrom).toHaveBeenCalledWith('connections');
    });

    it('falls back when edge function returns null data without error', async () => {
      mockInvokeEdgeFunction.mockResolvedValue({ data: null, error: null });

      const mockUpdate = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockResolvedValue({ error: null });
      mockFrom.mockReturnValue({ update: mockUpdate });
      mockUpdate.mockReturnValue({ eq: mockEq });

      await respondToConnection('conn-1', true);
      expect(mockFrom).toHaveBeenCalledWith('connections');
    });

    it('throws on update error in fallback', async () => {
      mockInvokeEdgeFunction.mockResolvedValue({
        data: null,
        error: { message: 'Server error', status: 500 },
      });

      const mockUpdate = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockResolvedValue({ error: { message: 'Update failed' } });
      mockFrom.mockReturnValue({ update: mockUpdate });
      mockUpdate.mockReturnValue({ eq: mockEq });

      await expect(respondToConnection('conn-1', true)).rejects.toThrow('Failed to respond to connection');
    });
  });

  // ── Validation error mapping (4xx) ─────────────────────────

  describe('validation error mapping', () => {
    it('maps "not found" to user-friendly message', async () => {
      mockInvokeEdgeFunction.mockResolvedValue({
        data: null,
        error: { message: 'Connection not found', status: 404 },
      });

      await expect(respondToConnection('conn-missing', true)).rejects.toThrow(
        'Connection request no longer exists',
      );
    });

    it('maps "already accepted" to user-friendly message', async () => {
      mockInvokeEdgeFunction.mockResolvedValue({
        data: null,
        error: { message: 'Connection already accepted', status: 409 },
      });

      await expect(respondToConnection('conn-1', true)).rejects.toThrow(
        'Connection has already been accepted',
      );
    });

    it('passes through unrecognized 4xx error message', async () => {
      mockInvokeEdgeFunction.mockResolvedValue({
        data: null,
        error: { message: 'Some validation failure', status: 422 },
      });

      await expect(respondToConnection('conn-1', true)).rejects.toThrow('Some validation failure');
    });
  });
});
