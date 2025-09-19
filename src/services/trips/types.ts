// Core Trip interfaces
export interface Trip {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  isPrivate?: boolean;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

// Trip creation input
export interface CreateTripInput {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  isPrivate?: boolean;
}

// Trip creation response
export interface CreateTripResponse {
  id: string;
  message?: string;
}

// Trip listing options
export interface ListTripsOptions {
  limit?: number;
  nextToken?: string;
}

// Trip listing response
export interface ListTripsResponse {
  items: Trip[];
  nextToken?: string;
  count?: number;
}

// Trip update input
export interface UpdateTripInput extends Partial<CreateTripInput> {
  // Allow partial updates of all creation fields
}

// Trip filter options (for future use)
export interface TripFilters {
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  isPrivate?: boolean;
  search?: string;
}

// Trip statistics (for future use)
export interface TripStats {
  totalTrips: number;
  upcomingTrips: number;
  completedTrips: number;
  publicTrips: number;
  privateTrips: number;
}