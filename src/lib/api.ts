import { fetchAuthSession } from 'aws-amplify/auth';

interface CreateTripInput {
  title: string;
  startDate: string;
  endDate: string;
  isPrivate?: boolean;
}

interface CreateTripResponse {
  id: string;
}

interface ApiError {
  error: string;
  details?: Array<{ field: string; message: string }>;
}

class TripsApiError extends Error {
  constructor(public message: string, public details?: Array<{ field: string; message: string }>) {
    super(message);
    this.name = 'TripsApiError';
  }
}

export async function createTrip(tripData: CreateTripInput): Promise<CreateTripResponse> {
  try {
    // Get auth session
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();

    if (!token) {
      throw new TripsApiError('User not authenticated');
    }

    // Get API endpoint from environment or amplify outputs
    let apiEndpoint = process.env.NEXT_PUBLIC_API_BASE;

    if (!apiEndpoint) {
      const amplifyOutputs = await import('../../amplify_outputs.json');
      apiEndpoint = amplifyOutputs.custom?.API?.TripsAPI?.endpoint;
    }

    if (!apiEndpoint) {
      throw new TripsApiError('API endpoint not configured');
    }

    const response = await fetch(`${apiEndpoint}/trips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(tripData),
    });

    if (!response.ok) {
      const errorData: ApiError = await response.json();
      throw new TripsApiError(errorData.error, errorData.details);
    }

    const result: CreateTripResponse = await response.json();
    return result;
  } catch (error) {
    if (error instanceof TripsApiError) {
      throw error;
    }

    console.error('Error creating trip:', error);
    throw new TripsApiError('Failed to create trip');
  }
}

export type FeedItem = { id: string; title: string; excerpt?: string; createdAt: string };
export type Profile = { id: string; username: string; bio?: string; avatarUrl?: string };

export async function getFeed(): Promise<FeedItem[]> {
  try {
    // Get auth session
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();

    if (!token) {
      throw new TripsApiError('User not authenticated');
    }

    // Get API endpoint
    let apiEndpoint = process.env.NEXT_PUBLIC_API_BASE;

    if (!apiEndpoint) {
      const amplifyOutputs = await import('../../amplify_outputs.json');
      apiEndpoint = amplifyOutputs.data.url; // GraphQL endpoint
    }

    if (!apiEndpoint) {
      throw new TripsApiError('API endpoint not configured');
    }

    const response = await fetch(`${apiEndpoint}/feed`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new TripsApiError(errorData.error || 'Failed to fetch feed');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof TripsApiError) {
      throw error;
    }
    console.error('Error fetching feed:', error);
    throw new TripsApiError('Failed to fetch feed');
  }
}

export async function getProfile(userId: string): Promise<Profile> {
  try {
    // Get auth session
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();

    if (!token) {
      throw new TripsApiError('User not authenticated');
    }

    // Get API endpoint
    let apiEndpoint = process.env.NEXT_PUBLIC_API_BASE;

    if (!apiEndpoint) {
      const amplifyOutputs = await import('../../amplify_outputs.json');
      apiEndpoint = amplifyOutputs.data.url;
    }

    if (!apiEndpoint) {
      throw new TripsApiError('API endpoint not configured');
    }

    const response = await fetch(`${apiEndpoint}/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new TripsApiError(errorData.error || 'Failed to fetch profile');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof TripsApiError) {
      throw error;
    }
    console.error('Error fetching profile:', error);
    throw new TripsApiError('Failed to fetch profile');
  }
}

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

export async function getTrip(tripId: string): Promise<Trip> {
  try {
    const session = await fetchAuthSession()
    const token = session.tokens?.idToken?.toString()

    if (!token) {
      throw new TripsApiError('User not authenticated')
    }

    let apiEndpoint = process.env.NEXT_PUBLIC_API_BASE
    if (!apiEndpoint) {
      const amplifyOutputs = await import('../../amplify_outputs.json')
      apiEndpoint = amplifyOutputs.custom?.API?.TripsAPI?.endpoint
    }

    if (!apiEndpoint) {
      throw new TripsApiError('API endpoint not configured')
    }

    const response = await fetch(`${apiEndpoint}/trips/${tripId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new TripsApiError(errorData.error || 'Failed to fetch trip')
    }

    return await response.json()
  } catch (error) {
    if (error instanceof TripsApiError) throw error
    throw new TripsApiError('Failed to fetch trip')
  }
}

export interface ListTripsOptions {
  limit?: number;
  nextToken?: string;
}

export interface ListTripsResponse {
  items: Trip[];
  nextToken?: string;
}

export async function listTrips(ownerId?: string, options?: ListTripsOptions): Promise<ListTripsResponse> {
  try {
    const session = await fetchAuthSession()
    const token = session.tokens?.idToken?.toString()
    if (!token) throw new TripsApiError('User not authenticated')

    let apiEndpoint = process.env.NEXT_PUBLIC_API_BASE
    if (!apiEndpoint) {
      const amplifyOutputs = await import('../../amplify_outputs.json')
      apiEndpoint = amplifyOutputs.custom?.API?.TripsAPI?.endpoint
    }

    if (!apiEndpoint) {
      throw new TripsApiError('API endpoint not configured')
    }

    const url = new URL(`${apiEndpoint}/trips`)
    if (ownerId) url.searchParams.set('ownerId', ownerId)
    if (options?.limit !== undefined) url.searchParams.set('limit', options.limit.toString())
    if (options?.nextToken) url.searchParams.set('nextToken', options.nextToken)

    const resp = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!resp.ok) {
      const data = await resp.json().catch(() => ({}))
      throw new TripsApiError(data.error || 'Request failed')
    }

    return await resp.json() as ListTripsResponse
  } catch (err) {
    if (err instanceof TripsApiError) throw err
    throw new TripsApiError('Failed to list trips')
  }
}

// Get trips with coordinates for map display
export async function getMapTrips(): Promise<Trip[]> {
  try {
    const session = await fetchAuthSession()
    const token = session.tokens?.idToken?.toString()
    if (!token) throw new TripsApiError('User not authenticated')

    let apiEndpoint = process.env.NEXT_PUBLIC_API_BASE
    if (!apiEndpoint) {
      const amplifyOutputs = await import('../../amplify_outputs.json')
      apiEndpoint = amplifyOutputs.custom?.API?.TripsAPI?.endpoint
    }

    if (!apiEndpoint) {
      throw new TripsApiError('API endpoint not configured')
    }

    const resp = await fetch(`${apiEndpoint}/trips/map`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!resp.ok) {
      const data = await resp.json().catch(() => ({}))
      throw new TripsApiError(data.error || 'Failed to fetch map trips')
    }

    const result = await resp.json() as Trip[]
    // Filter out trips without coordinates for map display
    return result.filter(trip => trip.coordinates?.latitude && trip.coordinates?.longitude)
  } catch (err) {
    if (err instanceof TripsApiError) throw err
    console.error('Error fetching map trips:', err)
    throw new TripsApiError('Failed to fetch map trips')
  }
}

// Export getTripById as alias for getTrip for consistency
export const getTripById = getTrip;

export { TripsApiError };
export type { CreateTripInput, CreateTripResponse };