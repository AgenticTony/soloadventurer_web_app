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

    // Get API endpoint from amplify outputs
    const amplifyOutputs = await import('../../amplify_outputs.json');
    const apiEndpoint = amplifyOutputs.custom?.API?.TripsAPI?.endpoint;

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

export { TripsApiError };
export type { CreateTripInput, CreateTripResponse };