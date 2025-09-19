// Export service instance and class
export { tripService, TripService } from './tripService';

// Export all types
export type {
  Trip,
  CreateTripInput,
  CreateTripResponse,
  ListTripsOptions,
  ListTripsResponse,
  UpdateTripInput,
  TripFilters,
  TripStats,
} from './types';

// Export API error for consumers
export { ApiError } from '../base/ApiClient';