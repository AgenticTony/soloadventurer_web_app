// Trip types for the service layer
// These match the actual Supabase data shape used throughout the app

export interface Trip {
  id: string;
  title: string;
  description: string;
  location: string;
  coordinates?: { latitude: number; longitude: number };
  startDate: string;
  endDate: string;
  status: 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  isPrivate: boolean;
  ownerId: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTripInput {
  title: string;
  startDate: string;
  endDate: string;
  isPrivate?: boolean;
  description?: string;
}

export interface CreateTripResponse {
  id: string;
}

export interface ListTripsOptions {
  limit?: number;
  nextToken?: string;
}

export interface ListTripsResponse {
  items: Trip[];
  nextToken?: string;
}

export interface UpdateTripInput extends Partial<CreateTripInput> {}
