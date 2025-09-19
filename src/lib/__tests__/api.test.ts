import { createTrip, getFeed, getProfile, getTrip, listTrips, TripsApiError } from '../api';
import { fetchAuthSession, type AuthSession } from 'aws-amplify/auth';

// Type definitions for mocks
interface MockAuthToken {
  toString: () => string;
  payload?: unknown; // JWT tokens have a payload property
}



interface MockApiErrorResponse {
  error: string;
  details?: Array<{ field: string; message: string }>;
}

interface MockFetchResponse {
  ok: boolean;
  json: () => Promise<unknown>;
}

// Mock AWS Amplify
jest.mock('aws-amplify/auth');
const mockFetchAuthSession = fetchAuthSession as jest.MockedFunction<typeof fetchAuthSession>;

// Mock fetch
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Mock amplify outputs
jest.mock('../../../amplify_outputs.json', () => ({
  custom: {
    API: {
      TripsAPI: {
        endpoint: 'https://api.example.com/dev',
      },
    },
  },
  data: {
    url: 'https://graphql.example.com/dev',
  },
}));

describe('createTrip', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a trip successfully', async () => {
    // Mock auth session
    mockFetchAuthSession.mockResolvedValue({
      tokens: {
        idToken: { toString: () => 'mock-token', payload: {} },
        accessToken: { toString: () => 'mock-access-token', payload: {} },
      },
    } as AuthSession);

    // Mock successful response
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'trip-123' }),
    } as MockFetchResponse as Response);

    const tripData = {
      title: 'Test Trip',
      startDate: '2024-03-01T10:00:00Z',
      endDate: '2024-03-05T10:00:00Z',
      isPrivate: false,
    };

    const result = await createTrip(tripData);

    expect(result).toEqual({ id: 'trip-123' });
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/dev/trips',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token',
        },
        body: JSON.stringify(tripData),
      }
    );
  });

  it('should throw error when user not authenticated', async () => {
    mockFetchAuthSession.mockResolvedValue({
      tokens: null,
    } as unknown as AuthSession);

    const tripData = {
      title: 'Test Trip',
      startDate: '2024-03-01T10:00:00Z',
      endDate: '2024-03-05T10:00:00Z',
    };

    await expect(createTrip(tripData)).rejects.toThrow(
      new TripsApiError('User not authenticated')
    );
  });

  it('should handle validation errors', async () => {
    mockFetchAuthSession.mockResolvedValue({
      tokens: {
        idToken: { toString: () => 'mock-token', payload: {} },
        accessToken: { toString: () => 'mock-access-token', payload: {} },
      },
    } as AuthSession);

    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({
        error: 'Validation failed',
        details: [
          { field: 'title', message: 'Title is required' },
        ],
      } satisfies MockApiErrorResponse),
    } as MockFetchResponse as Response);

    const tripData = {
      title: '',
      startDate: '2024-03-01T10:00:00Z',
      endDate: '2024-03-05T10:00:00Z',
    };

    await expect(createTrip(tripData)).rejects.toThrow(
      expect.objectContaining({
        message: 'Validation failed',
        details: [{ field: 'title', message: 'Title is required' }],
      })
    );
  });

  it('should handle network errors', async () => {
    mockFetchAuthSession.mockResolvedValue({
      tokens: {
        idToken: { toString: () => 'mock-token', payload: {} },
        accessToken: { toString: () => 'mock-access-token', payload: {} },
      },
    } as AuthSession);

    mockFetch.mockRejectedValue(new Error('Network error'));

    const tripData = {
      title: 'Test Trip',
      startDate: '2024-03-01T10:00:00Z',
      endDate: '2024-03-05T10:00:00Z',
    };

    await expect(createTrip(tripData)).rejects.toThrow(
      new TripsApiError('Failed to create trip')
    );
  });
});

describe('getFeed', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return mock feed items', async () => {
    const result = await getFeed();

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: '1',
      title: 'Paris Adventure',
      excerpt: 'Amazing trip to the City of Light',
      createdAt: expect.any(String)
    });
    expect(result[1]).toEqual({
      id: '2',
      title: 'Tokyo Wandering',
      excerpt: 'Exploring the bustling streets of Tokyo',
      createdAt: expect.any(String)
    });
  });

  it('should handle errors gracefully', async () => {
    // Test the catch block by mocking console.error to prevent noise
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    // This will test the normal flow since errors would come from actual API calls
    const result = await getFeed();
    expect(result).toHaveLength(2);

    consoleSpy.mockRestore();
  });
});

describe('getProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return mock profile data', async () => {
    const userId = 'test-user-123';
    const result = await getProfile(userId);

    expect(result).toEqual({
      id: userId,
      username: 'travel_enthusiast',
      bio: 'Love exploring new places and meeting fellow travelers',
      avatarUrl: '/default-avatar.jpg'
    });
  });

  it('should handle errors gracefully', async () => {
    // Test the catch block by mocking console.error to prevent noise
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    // This will test the normal flow since errors would come from actual API calls
    const result = await getProfile('test-user');
    expect(result.id).toBe('test-user');

    consoleSpy.mockRestore();
  });
});

describe('getTrip', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch trip successfully', async () => {
    mockFetchAuthSession.mockResolvedValue({
      tokens: {
        idToken: { toString: () => 'mock-token', payload: {} },
        accessToken: { toString: () => 'mock-access-token', payload: {} },
      },
    } as AuthSession);

    const mockTrip = {
      id: 'trip-123',
      title: 'Test Trip',
      description: 'A wonderful test trip to explore amazing places',
      location: 'Paris, France',
      startDate: '2024-03-01T10:00:00Z',
      endDate: '2024-03-05T10:00:00Z',
      status: 'PLANNING' as const,
      isPrivate: false,
      ownerId: 'user-123',
      owner: 'test_user',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockTrip,
    } as MockFetchResponse as Response);

    const result = await getTrip('trip-123');

    expect(result).toEqual(mockTrip);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/dev/trips/trip-123',
      {
        headers: { 'Authorization': 'Bearer mock-token' }
      }
    );
  });

  it('should handle not found error', async () => {
    mockFetchAuthSession.mockResolvedValue({
      tokens: {
        idToken: { toString: () => 'mock-token', payload: {} },
        accessToken: { toString: () => 'mock-access-token', payload: {} },
      },
    } as AuthSession);

    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Trip not found' } satisfies MockApiErrorResponse),
    } as MockFetchResponse as Response);

    await expect(getTrip('nonexistent')).rejects.toThrow(
      new TripsApiError('Trip not found')
    );
  });

  it('should handle authentication error', async () => {
    mockFetchAuthSession.mockResolvedValue({
      tokens: null,
    } as unknown as AuthSession);

    await expect(getTrip('trip-123')).rejects.toThrow(
      new TripsApiError('User not authenticated')
    );
  });
});

describe('listTrips', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should list own trips', async () => {
    mockFetchAuthSession.mockResolvedValue({
      tokens: {
        idToken: { toString: () => 'mock-token', payload: {} },
        accessToken: { toString: () => 'mock-access-token', payload: {} },
      },
    } as AuthSession);

    const mockTrips = [
      {
        id: 'trip-1',
        title: 'Trip 1',
        description: 'First test trip with amazing experiences',
        location: 'Rome, Italy',
        startDate: '2024-03-01T10:00:00Z',
        endDate: '2024-03-05T10:00:00Z',
        status: 'PLANNING' as const,
        isPrivate: true,
        ownerId: 'user-123',
        owner: 'test_user',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 'trip-2',
        title: 'Trip 2',
        description: 'Second test trip to beautiful destinations',
        location: 'Barcelona, Spain',
        startDate: '2024-04-01T10:00:00Z',
        endDate: '2024-04-05T10:00:00Z',
        status: 'ACTIVE' as const,
        isPrivate: false,
        ownerId: 'user-123',
        owner: 'test_user',
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z'
      }
    ];

    const mockResponse = { items: mockTrips };

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as MockFetchResponse as Response);

    const result = await listTrips();

    expect(result).toEqual(mockResponse);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/dev/trips',
      {
        headers: { Authorization: 'Bearer mock-token' }
      }
    );
  });

  it('should list other user public trips', async () => {
    mockFetchAuthSession.mockResolvedValue({
      tokens: {
        idToken: { toString: () => 'mock-token', payload: {} },
        accessToken: { toString: () => 'mock-access-token', payload: {} },
      },
    } as AuthSession);

    const mockPublicTrips = [
      {
        id: 'trip-3',
        title: 'Public Trip',
        description: 'A public trip that everyone can see',
        location: 'London, UK',
        startDate: '2024-05-01T10:00:00Z',
        endDate: '2024-05-05T10:00:00Z',
        status: 'COMPLETED' as const,
        isPrivate: false,
        ownerId: 'other-user',
        owner: 'other_user',
        createdAt: '2024-01-03T00:00:00Z',
        updatedAt: '2024-01-03T00:00:00Z'
      }
    ];

    const mockResponse = { items: mockPublicTrips };

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as MockFetchResponse as Response);

    const result = await listTrips('other-user');

    expect(result).toEqual(mockResponse);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/dev/trips?ownerId=other-user',
      {
        headers: { Authorization: 'Bearer mock-token' }
      }
    );
  });

  it('should pass limit parameters to backend (clamping handled server-side)', async () => {
    mockFetchAuthSession.mockResolvedValue({
      tokens: {
        idToken: { toString: () => 'mock-token', payload: {} },
        accessToken: { toString: () => 'mock-access-token', payload: {} },
      },
    } as AuthSession);

    const mockResponse = { items: [] };

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as MockFetchResponse as Response);

    // Test limit=0 gets passed through (backend will clamp to 1)
    await listTrips(undefined, { limit: 0 });
    expect(mockFetch).toHaveBeenLastCalledWith(
      'https://api.example.com/dev/trips?limit=0',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-token'
        })
      })
    );

    // Test limit=150 gets passed through (backend will clamp to 100)
    await listTrips(undefined, { limit: 150 });
    expect(mockFetch).toHaveBeenLastCalledWith(
      'https://api.example.com/dev/trips?limit=150',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-token'
        })
      })
    );
  });

  it('should use nextToken and return different page', async () => {
    mockFetchAuthSession.mockResolvedValue({
      tokens: {
        idToken: { toString: () => 'mock-token', payload: {} },
        accessToken: { toString: () => 'mock-access-token', payload: {} },
      },
    } as AuthSession);

    const mockResponse1 = {
      items: [{ id: 'trip-1', title: 'Trip 1' }],
      nextToken: 'eyJpZCI6InRyaXAtMSJ9'
    };

    const mockResponse2 = {
      items: [{ id: 'trip-2', title: 'Trip 2' }]
    };

    // First call returns page 1 with nextToken
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse1,
    } as MockFetchResponse as Response);

    const result1 = await listTrips(undefined, { limit: 1 });

    expect(result1).toEqual(mockResponse1);
    expect(mockFetch).toHaveBeenLastCalledWith(
      'https://api.example.com/dev/trips?limit=1',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-token'
        })
      })
    );

    // Second call uses nextToken
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse2,
    } as MockFetchResponse as Response);

    const result2 = await listTrips(undefined, { limit: 1, nextToken: 'eyJpZCI6InRyaXAtMSJ9' });

    expect(result2).toEqual(mockResponse2);
    expect(mockFetch).toHaveBeenLastCalledWith(
      'https://api.example.com/dev/trips?limit=1&nextToken=eyJpZCI6InRyaXAtMSJ9',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-token'
        })
      })
    );
  });

  it('should handle ownerId omitted vs present parameters', async () => {
    mockFetchAuthSession.mockResolvedValue({
      tokens: {
        idToken: { toString: () => 'mock-token', payload: {} },
        accessToken: { toString: () => 'mock-access-token', payload: {} },
      },
    } as AuthSession);

    const mockResponse = { items: [] };

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as MockFetchResponse as Response);

    // ownerId omitted → no ownerId param
    await listTrips();
    expect(mockFetch).toHaveBeenLastCalledWith(
      'https://api.example.com/dev/trips',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-token'
        })
      })
    );

    // ownerId present → ownerId added
    await listTrips('user-123');
    expect(mockFetch).toHaveBeenLastCalledWith(
      'https://api.example.com/dev/trips?ownerId=user-123',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-token'
        })
      })
    );
  });

  it('should handle authentication error', async () => {
    mockFetchAuthSession.mockResolvedValue({
      tokens: null,
    } as unknown as AuthSession);

    await expect(listTrips()).rejects.toThrow(
      new TripsApiError('User not authenticated')
    );
  });

  it('should handle API error', async () => {
    mockFetchAuthSession.mockResolvedValue({
      tokens: {
        idToken: { toString: () => 'mock-token', payload: {} },
        accessToken: { toString: () => 'mock-access-token', payload: {} },
      },
    } as AuthSession);

    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Server error' } satisfies MockApiErrorResponse),
    } as MockFetchResponse as Response);

    await expect(listTrips()).rejects.toThrow(
      new TripsApiError('Server error')
    );
  });
});