import { createTrip, TripsApiError } from '../api';
import { fetchAuthSession } from 'aws-amplify/auth';

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
}));

describe('createTrip', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a trip successfully', async () => {
    // Mock auth session
    mockFetchAuthSession.mockResolvedValue({
      tokens: {
        idToken: { toString: () => 'mock-token' },
      },
    } as any);

    // Mock successful response
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'trip-123' }),
    } as Response);

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
    } as any);

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
        idToken: { toString: () => 'mock-token' },
      },
    } as any);

    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({
        error: 'Validation failed',
        details: [
          { field: 'title', message: 'Title is required' },
        ],
      }),
    } as Response);

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
        idToken: { toString: () => 'mock-token' },
      },
    } as any);

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