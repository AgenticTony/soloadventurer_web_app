import { render, screen, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import TripEditPage from '../../../[id]/edit/page'
import { getTrip } from '@/lib/api'
import { AppError } from '@/lib/errors'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  notFound: jest.fn()
}))

jest.mock('@/lib/api', () => ({
  getTrip: jest.fn(),
  TripsApiError: jest.requireActual('@/lib/api').TripsApiError,
}))

jest.mock('@/components/features/trips/TripEditForm', () => ({
  TripEditForm: function MockTripEditForm({ trip }: { trip: { title: string } }) {
    return <div data-testid="trip-edit-form">Editing: {trip.title}</div>
  }
}))

const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn()
}

const mockTrip = {
  id: 'trip-123',
  title: 'Paris Adventure',
  description: 'An exciting adventure through Paris landmarks',
  location: 'Paris, France',
  startDate: '2024-06-01',
  endDate: '2024-06-10',
  status: 'PLANNING' as const,
  isPrivate: false,
  ownerId: 'user-123',
  owner: 'paris_explorer',
  createdAt: '2024-05-01T00:00:00Z',
  updatedAt: '2024-05-01T00:00:00Z'
}

describe('TripEditPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
  })

  it('should render loading state initially', async () => {
    ;(getTrip as jest.Mock).mockImplementation(() => new Promise(() => {})) // Never resolves

    const params = Promise.resolve({ id: 'trip-123' })
    render(<TripEditPage params={params} />)

    expect(screen.getByText('Back to Trip')).toBeInTheDocument()

    // Should show loading skeleton
    const loadingElements = screen.getAllByRole('generic')
    expect(loadingElements.some(el => el.className.includes('animate-pulse'))).toBe(true)
  })

  it('should render edit form when trip loaded', async () => {
    ;(getTrip as jest.Mock).mockResolvedValue(mockTrip)

    const params = Promise.resolve({ id: 'trip-123' })
    render(<TripEditPage params={params} />)

    await waitFor(() => {
      expect(screen.getByTestId('trip-edit-form')).toBeInTheDocument()
    })
    // The page also shows "Editing: Paris Adventure" in a span alongside the mock form
    expect(screen.getAllByText('Editing: Paris Adventure').length).toBeGreaterThanOrEqual(1)

    expect(getTrip).toHaveBeenCalledWith('trip-123')
  })

  it('should handle API errors gracefully', async () => {
    const error = new Error('Failed to load trip')
    ;(getTrip as jest.Mock).mockRejectedValue(error)

    const params = Promise.resolve({ id: 'trip-123' })
    render(<TripEditPage params={params} />)

    await waitFor(() => {
      expect(screen.getByText('Error Loading Trip')).toBeInTheDocument()
      expect(screen.getByText('Failed to load trip')).toBeInTheDocument()
      expect(screen.getByText('Try Again')).toBeInTheDocument()
    })
  })

  it('should handle 404 errors by calling notFound', async () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { notFound } = require('next/navigation')
    const error = new AppError('Trip not found')
    ;(getTrip as jest.Mock).mockRejectedValue(error)

    const params = Promise.resolve({ id: 'invalid-trip' })
    render(<TripEditPage params={params} />)

    await waitFor(() => {
      expect(notFound).toHaveBeenCalled()
    })
  })

  it('should navigate back to trip detail when back button clicked', async () => {
    ;(getTrip as jest.Mock).mockResolvedValue(mockTrip)

    const params = Promise.resolve({ id: 'trip-123' })
    render(<TripEditPage params={params} />)

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('trip-edit-form')).toBeInTheDocument()
    })

    const backButton = screen.getByText('Back to Trip')
    backButton.click()

    // handleBack is async (awaits params), so use waitFor
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/trips/trip-123')
    })
  })
})
