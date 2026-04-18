import { createTrip, getTrip, listTrips, TripsApiError } from '../api'

// Mock Supabase client — full mock with auth, rpc, and from() chain
jest.mock('@/lib/supabase/client', () => {
  const rpc = jest.fn()
  const from = jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(),
      })),
      not: jest.fn(),
    })),
  }))
  const auth = {
    getSession: jest.fn(),
  }
  return { createClient: () => ({ auth, rpc, from }) }
})

import { createClient } from '@/lib/supabase/client'
const supabase = createClient()
const auth = supabase.auth
const rpc = supabase.rpc as jest.Mock

describe('createTrip', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create a trip successfully', async () => {
    auth.getSession.mockResolvedValue({
      data: { session: { access_token: 'mock-token', user: { id: 'user-123' } } },
    })

    rpc.mockResolvedValue({ data: 'trip-123', error: null })

    const tripData = {
      title: 'Test Trip',
      startDate: '2024-03-01T10:00:00Z',
      endDate: '2024-03-05T10:00:00Z',
      isPrivate: false,
    }

    const result = await createTrip(tripData)

    expect(result).toEqual({ id: 'trip-123' })
    expect(rpc).toHaveBeenCalledWith('create_trip', {
      p_name: 'Test Trip',
      p_destination: 'Test Trip',
      p_start_date: '2024-03-01T10:00:00Z',
      p_end_date: '2024-03-05T10:00:00Z',
      p_is_public: true,
      p_description: null,
    })
  })

  it('should throw error when user not authenticated', async () => {
    auth.getSession.mockResolvedValue({
      data: { session: null },
    })

    const tripData = {
      title: 'Test Trip',
      startDate: '2024-03-01T10:00:00Z',
      endDate: '2024-03-05T10:00:00Z',
    }

    await expect(createTrip(tripData)).rejects.toThrow('User not authenticated')
  })

  it('should handle RPC errors', async () => {
    auth.getSession.mockResolvedValue({
      data: { session: { access_token: 'mock-token', user: { id: 'user-123' } } },
    })

    rpc.mockResolvedValue({ data: null, error: { message: 'Validation failed' } })

    const tripData = {
      title: '',
      startDate: '2024-03-01T10:00:00Z',
      endDate: '2024-03-05T10:00:00Z',
    }

    await expect(createTrip(tripData)).rejects.toThrow('Failed to create trip')
  })

  it('should handle network errors', async () => {
    auth.getSession.mockResolvedValue({
      data: { session: { access_token: 'mock-token', user: { id: 'user-123' } } },
    })

    rpc.mockRejectedValue(new Error('Network error'))

    const tripData = {
      title: 'Test Trip',
      startDate: '2024-03-01T10:00:00Z',
      endDate: '2024-03-05T10:00:00Z',
    }

    await expect(createTrip(tripData)).rejects.toThrow('Failed to create trip')
  })
})

describe('getTrip', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch trip successfully', async () => {
    auth.getSession.mockResolvedValue({
      data: { session: { access_token: 'mock-token', user: { id: 'user-123' } } },
    })

    const mockTripRow = {
      id: 'trip-123',
      name: 'Test Trip',
      description: 'A wonderful test trip',
      destination_name: 'Paris, France',
      start_date: '2024-03-01T10:00:00Z',
      end_date: '2024-03-05T10:00:00Z',
      is_public: true,
      user_id: 'user-123',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }

    rpc.mockResolvedValue({ data: mockTripRow, error: null })

    const result = await getTrip('trip-123')

    expect(result.id).toBe('trip-123')
    expect(result.title).toBe('Test Trip')
    expect(result.location).toBe('Paris, France')
    expect(rpc).toHaveBeenCalledWith('get_trip_by_id', { p_id: 'trip-123' })
  })

  it('should handle not found error', async () => {
    auth.getSession.mockResolvedValue({
      data: { session: { access_token: 'mock-token', user: { id: 'user-123' } } },
    })

    rpc.mockResolvedValue({ data: null, error: null })

    await expect(getTrip('nonexistent')).rejects.toThrow('Trip not found')
  })

  it('should handle authentication error', async () => {
    auth.getSession.mockResolvedValue({
      data: { session: null },
    })

    await expect(getTrip('trip-123')).rejects.toThrow('User not authenticated')
  })
})

describe('listTrips', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should list own trips', async () => {
    auth.getSession.mockResolvedValue({
      data: { session: { access_token: 'mock-token', user: { id: 'user-123' } } },
    })

    const mockTrips = [
      {
        id: 'trip-1',
        name: 'Trip 1',
        description: 'First test trip',
        destination_name: 'Rome, Italy',
        start_date: '2024-03-01T10:00:00Z',
        end_date: '2024-03-05T10:00:00Z',
        is_public: false,
        user_id: 'user-123',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ]

    rpc.mockResolvedValue({ data: mockTrips, error: null })

    const result = await listTrips()

    expect(result.items).toHaveLength(1)
    expect(result.items[0].title).toBe('Trip 1')
  })

  it('should handle authentication error', async () => {
    auth.getSession.mockResolvedValue({
      data: { session: null },
    })

    await expect(listTrips()).rejects.toThrow('User not authenticated')
  })
})
