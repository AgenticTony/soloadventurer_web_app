/**
 * Application error class — single error type for the entire app.
 * Replaces the former TripsApiError and ApiError with one canonical class.
 */
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: Array<{ field: string; message: string }>
  ) {
    super(message)
    this.name = 'AppError'
  }
}
