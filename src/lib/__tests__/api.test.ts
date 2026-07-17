import { createTrip, getTrip, listTrips } from '../api'

/**
 * Story 0.7: these tests used to mock `supabase.rpc('create_trip' | ...)` —
 * three RPCs that never existed in any migration or in prod. The mocks were
 * green while every trip operation failed live: a mock answers to any name
 * you invent. The API now uses direct `from('trips')` queries under the owner
 * RLS policies, and this suite pins the TABLE name, the query shapes, and the
 * pagination contract.
 */

// Chainable from() mock: every builder method returns the chain; terminal
// results are configured per-test via mockResult. Calls are recorded so tests
// can assert table names and arguments.
type ChainResult = { data: unknown; error: unknown }
const state = {
  result: { data: null, error: null } as ChainResult,
  fromCalls: [] as string[],
  calls: {} as Record<string, unknown[][]>,
}

function record(method: string, args: unknown[]) {
  ;(state.calls[method] ??= []).push(args)
}

jest.mock('@/lib/supabase/client', () => {
  const chain: Record<string, unknown> = {}
  const chainMethod =
    (name: string) =>
    (...args: unknown[]) => {
      record(name, args)
      return chain
    }
  for (const m of ['select', 'insert', 'eq', 'not', 'order']) chain[m] = chainMethod(m)
  // Terminals resolve with the configured result.
  for (const m of ['single', 'maybeSingle', 'range']) {
    chain[m] = (...args: unknown[]) => {
      record(m, args)
      return Promise.resolve(state.result)
    }
  }
  const from = (table: string) => {
    state.fromCalls.push(table)
    return chain
  }
  const auth = { getSession: jest.fn() }
  return { createClient: () => ({ auth, from }) }
})

import { createClient } from '@/lib/supabase/client'
const supabase = createClient()
const auth = supabase.auth as unknown as { getSession: jest.Mock }

const signedIn = () =>
  auth.getSession.mockResolvedValue({
    data: { session: { access_token: 'mock-token', user: { id: 'user-123' } } },
  })
const signedOut = () => auth.getSession.mockResolvedValue({ data: { session: null } })

beforeEach(() => {
  jest.clearAllMocks()
  state.result = { data: null, error: null }
  state.fromCalls = []
  state.calls = {}
})

const tripRow = (id: string, name: string) => ({
  id,
  name,
  description: 'd',
  destination_name: 'Rome, Italy',
  start_date: '2024-03-01T10:00:00Z',
  end_date: '2024-03-05T10:00:00Z',
  is_public: false,
  user_id: 'user-123',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
})

describe('createTrip', () => {
  it('inserts into the trips table — not the phantom create_trip RPC', async () => {
    signedIn()
    state.result = { data: { id: 'trip-123' }, error: null }

    const result = await createTrip({
      title: 'Test Trip',
      startDate: '2024-03-01T10:00:00Z',
      endDate: '2024-03-05T10:00:00Z',
      isPrivate: false,
    })

    expect(result).toEqual({ id: 'trip-123' })
    expect(state.fromCalls).toContain('trips')
    expect(state.calls.insert[0][0]).toEqual({
      user_id: 'user-123',
      name: 'Test Trip',
      destination_name: 'Test Trip',
      start_date: '2024-03-01T10:00:00Z',
      end_date: '2024-03-05T10:00:00Z',
      is_public: true,
    })
  })

  it('throws when not authenticated', async () => {
    signedOut()
    await expect(createTrip({ title: 'T', startDate: 'a', endDate: 'b' })).rejects.toThrow(
      'User not authenticated'
    )
  })

  it('wraps database errors', async () => {
    signedIn()
    state.result = { data: null, error: { message: 'Validation failed' } }
    await expect(createTrip({ title: '', startDate: 'a', endDate: 'b' })).rejects.toThrow(
      'Failed to create trip'
    )
  })
})

describe('getTrip', () => {
  it('reads the trip from the trips table', async () => {
    signedIn()
    state.result = {
      data: {
        ...tripRow('trip-123', 'Test Trip'),
        description: 'A wonderful test trip',
        destination_name: 'Paris, France',
        is_public: true,
      },
      error: null,
    }

    const result = await getTrip('trip-123')

    expect(result.id).toBe('trip-123')
    expect(result.title).toBe('Test Trip')
    expect(result.location).toBe('Paris, France')
    expect(state.fromCalls).toContain('trips')
    expect(state.calls.eq[0]).toEqual(['id', 'trip-123'])
  })

  it('maps a missing row to Trip not found', async () => {
    signedIn()
    state.result = { data: null, error: null }
    await expect(getTrip('nonexistent')).rejects.toThrow('Trip not found')
  })

  it('throws when not authenticated', async () => {
    signedOut()
    await expect(getTrip('trip-123')).rejects.toThrow('User not authenticated')
  })
})

describe('listTrips', () => {
  it('lists own trips from the trips table, filtered to the caller', async () => {
    signedIn()
    state.result = { data: [tripRow('trip-1', 'Trip 1')], error: null }

    const result = await listTrips()

    expect(result.items).toHaveLength(1)
    expect(result.items[0].title).toBe('Trip 1')
    expect(state.fromCalls).toContain('trips')
    expect(state.calls.eq[0]).toEqual(['user_id', 'user-123'])
  })

  it('throws when not authenticated', async () => {
    signedOut()
    await expect(listTrips()).rejects.toThrow('User not authenticated')
  })

  it('requests the first page at offset 0 with a peek row (range 0..limit)', async () => {
    signedIn()
    state.result = { data: [], error: null }

    await listTrips(undefined, { limit: 10 })

    // range is inclusive: 0..10 = 11 rows = page + hasMore peek.
    expect(state.calls.range[0]).toEqual([0, 10])
  })

  it('advances the page using the nextToken offset cursor (the bug this fixes)', async () => {
    signedIn()
    state.result = { data: [], error: null }

    await listTrips(undefined, { limit: 10, nextToken: '10' })

    expect(state.calls.range[0]).toEqual([10, 20])
  })

  it('returns a nextToken pointing at the next page when more rows exist', async () => {
    signedIn()
    const page = Array.from({ length: 11 }, (_, i) => tripRow(`trip-${i + 1}`, `Trip ${i + 1}`))
    state.result = { data: page, error: null }

    const result = await listTrips(undefined, { limit: 10 })

    expect(result.items).toHaveLength(10) // extra row trimmed
    expect(result.nextToken).toBe('10') // offset of the next page
  })

  it('omits nextToken on the last page', async () => {
    signedIn()
    state.result = { data: [tripRow('trip-1', 'Only Trip')], error: null }

    const result = await listTrips(undefined, { limit: 10 })

    expect(result.items).toHaveLength(1)
    expect(result.nextToken).toBeUndefined()
  })

  it('resets to the first page on a malformed nextToken', async () => {
    signedIn()
    state.result = { data: [], error: null }

    await listTrips(undefined, { limit: 10, nextToken: 'not-a-number' })

    expect(state.calls.range[0]).toEqual([0, 10])
  })
})
