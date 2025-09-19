import { render, screen, fireEvent } from '@testing-library/react'
import { TripDetail } from '../TripDetail'

// Mock TripMap component
jest.mock('../TripMap', () => ({
  TripMap: function MockTripMap({ tripId }: { tripId: string }) {
    return <div data-testid="trip-map">Map for trip: {tripId}</div>
  }
}))

// Use future dates for upcoming trip
const futureStartDate = new Date()
futureStartDate.setDate(futureStartDate.getDate() + 30)
const futureEndDate = new Date()
futureEndDate.setDate(futureEndDate.getDate() + 39)

const mockTrip = {
  id: 'trip-123',
  title: 'Paris Adventure',
  description: 'An amazing adventure through the streets of Paris',
  location: 'Paris, France',
  startDate: futureStartDate.toISOString(),
  endDate: futureEndDate.toISOString(),
  status: 'PLANNING' as const,
  isPrivate: false,
  ownerId: 'user-123',
  owner: 'travel_user',
  createdAt: '2024-05-01T00:00:00Z',
  updatedAt: '2024-05-01T00:00:00Z'
}

const mockPrivateTrip = {
  ...mockTrip,
  id: 'trip-456',
  title: 'Secret Getaway',
  isPrivate: true
}

describe('TripDetail', () => {
  it('should render trip information correctly', () => {
    render(<TripDetail trip={mockTrip} />)

    expect(screen.getByText('Paris Adventure')).toBeInTheDocument()
    expect(screen.getByText('Public Trip')).toBeInTheDocument()
    expect(screen.getByText('Upcoming')).toBeInTheDocument()

    // Check that all sections are present
    expect(screen.getByText('Start Date')).toBeInTheDocument()
    expect(screen.getByText('End Date')).toBeInTheDocument()
    expect(screen.getByText('Duration')).toBeInTheDocument()
    expect(screen.getByText('Location')).toBeInTheDocument()
    expect(screen.getByText('Trip Information')).toBeInTheDocument()

    // Check map is rendered
    expect(screen.getByTestId('trip-map')).toBeInTheDocument()
    expect(screen.getByText('Map for trip: trip-123')).toBeInTheDocument()
  })

  it('should display private trip correctly', () => {
    render(<TripDetail trip={mockPrivateTrip} />)

    expect(screen.getByText('Secret Getaway')).toBeInTheDocument()
    expect(screen.getByText('Private Trip')).toBeInTheDocument()

    // Check for lock icon
    const lockIcons = screen.getAllByText('Private')
    expect(lockIcons.length).toBeGreaterThan(0)
  })

  it('should show actions menu when clicked', () => {
    render(<TripDetail trip={mockTrip} />)

    // Find and click the actions button (three dots)
    const actionsButton = screen.getByRole('button')
    fireEvent.click(actionsButton)

    // Check that menu items appear
    expect(screen.getByText('Edit Trip')).toBeInTheDocument()
    expect(screen.getByText('Delete Trip')).toBeInTheDocument()
  })

  it('should display edit and delete buttons as disabled', () => {
    render(<TripDetail trip={mockTrip} />)

    const actionsButton = screen.getByRole('button')
    fireEvent.click(actionsButton)

    const editButton = screen.getByText('Edit Trip').closest('button')
    const deleteButton = screen.getByText('Delete Trip').closest('button')

    expect(editButton).toBeDisabled()
    expect(deleteButton).toBeDisabled()
    expect(editButton).toHaveAttribute('title', 'Edit functionality coming soon')
    expect(deleteButton).toHaveAttribute('title', 'Delete functionality coming soon')
  })

  it('should calculate duration correctly', () => {
    render(<TripDetail trip={mockTrip} />)

    // Check that duration section exists first
    expect(screen.getByText('Duration')).toBeInTheDocument()

    // Trip is 10 days (including both start and end date)
    expect(screen.getByText('10 days')).toBeInTheDocument()
  })

  it('should show trip metadata correctly', () => {
    render(<TripDetail trip={mockTrip} />)

    expect(screen.getByText('trip-123')).toBeInTheDocument()
    expect(screen.getByText('user-123')).toBeInTheDocument()
  })

  it('should handle callback functions when provided', () => {
    const onEdit = jest.fn()
    const onDelete = jest.fn()

    render(<TripDetail trip={mockTrip} onEdit={onEdit} onDelete={onDelete} />)

    const actionsButton = screen.getByRole('button')
    fireEvent.click(actionsButton)

    // Since buttons are disabled, callbacks shouldn't be called even if clicked
    const editButton = screen.getByText('Edit Trip').closest('button')
    const deleteButton = screen.getByText('Delete Trip').closest('button')

    fireEvent.click(editButton!)
    fireEvent.click(deleteButton!)

    // Callbacks should not be called since buttons are disabled
    expect(onEdit).not.toHaveBeenCalled()
    expect(onDelete).not.toHaveBeenCalled()
  })
})