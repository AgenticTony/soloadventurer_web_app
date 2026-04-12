import { createTrip, getTrip, listTrips, TripsApiError } from '../api'

// Mock Supabase client
const mockGetSession = jest.fn()
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getSession: mockGetSession,
    },
  }),
}))

// Mock environment
process.env.NEXT_PUBLIC_API_BASE = 'https://api.example.com/dev'

// Mock fetch
global.fetch = jest.fn()
const mockFetch = fetch as jest.MockedFunction<typeof fetch>

describe('createTrip', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create a trip successfully', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: 'mock-token' } },
    })

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'trip-123' }),
    } as Response)

    const tripData = {
      title: 'Test Trip',
      startDate: '2024-03-01T10:00:00Z',
      endDate: '2024-03-05T10:00:00Z',
      isPrivate: false,
    }

    const result = await createTrip(tripData)

    expect(result).toEqual({ id: 'trip-123' })
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/dev/trips',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-token',
        }),
      }),
    )
  })

  it('should throw error when user not authenticated', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
    })

    const tripData = {
      title: 'Test Trip',
      startDate: '2024-03-01T10:00:00Z',
      endDate: '2024-03-05T10:00:00Z',
    }

    await expect(createTrip(tripData)).rejects.toThrow('User not authenticated')
  })

  it('should handle validation errors', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: 'mock-token' } },
    })

    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({
        error: 'Validation failed',
        details: [{ field: 'title', message: 'Title is required' }],
      }),
    } as Response)

    const tripData = {
      title: '',
      startDate: '2024-03-01T10:00:00Z',
      endDate: '2024-03-05T10:00:00Z',
    }

    await expect(createTrip(tripData)).rejects.toThrow('Validation failed')
  })

  it('should handle network errors', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: 'mock-token' } },
    })

    mockFetch.mockRejectedValue(new Error('Network error'))

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
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: 'mock-token' } },
    })

    const mockTrip = {
      id: 'trip-123',
      title: 'Test Trip',
      description: 'A wonderful test trip',
      location: 'Paris, France',
      startDate: '2024-03-01T10:00:00Z',
      endDate: '2024-03-05T10:00:00Z',
      status: 'PLANNING',
      isPrivate: false,
      ownerId: 'user-123',
      owner: 'test_user',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    }

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockTrip,
    } as Response)

    const result = await getTrip('trip-123')

    expect(result).toEqual(mockTrip)
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/dev/trips/trip-123',
      expect.objectContaining({
        headers: { Authorization: 'Bearer mock-token' },
      }),
    )
  })

  it('should handle not found error', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: 'mock-token' } },
    })

    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Trip not found' }),
    } as Response)

    await expect(getTrip('nonexistent')).rejects.toThrow('Trip not found')
  })

  it('should handle authentication error', async () => {
    mockGetSession.mockResolvedValue({
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
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: 'mock-token' } },
    })

    const mockTrips = [
      {
        id: 'trip-1',
        title: 'Trip 1',
        description: 'First test trip',
        location: 'Rome, Italy',
        startDate: '2024-03-01T10:00:00Z',
        endDate: '2024-03-05T10:00:00Z',
        status: 'PLANNING',
        isPrivate: true,
        ownerId: 'user-123',
        owner: 'test_user',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ]

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ items: mockTrips }),
    } as Response)

    const result = await listTrips()

    expect(result).toEqual({ items: mockTrips })
  })

  it('should list other user public trips', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: 'mock-token' } },
    })

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ items: [] }),
    } as Response)

    await listTrips('other-user')

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/dev/trips?ownerId=other-user',
      expect.objectContaining({
        headers: { Authorization: 'Bearer mock-token' },
      }),
    )
  })

  it('should handle authentication error', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
    })

    await expect(listTrips()).rejects.toThrow('User not authenticated')
  })
})
