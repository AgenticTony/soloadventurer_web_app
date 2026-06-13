import { render, screen, fireEvent } from '@testing-library/react'
import { TripMap } from '../TripMap'

// Mock console.log to test button clicks
const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

describe('TripMap', () => {
  afterEach(() => {
    consoleSpy.mockClear()
  })

  afterAll(() => {
    consoleSpy.mockRestore()
  })

  it('should render map placeholder correctly', () => {
    render(<TripMap tripId="trip-123" />)

    expect(screen.getAllByText('San Francisco, CA')).toHaveLength(2)
    expect(screen.getByText('37.7749, -122.4194')).toBeInTheDocument()
    expect(screen.getByText('Trip Location')).toBeInTheDocument()
  })

  it('should show map controls on hover', () => {
    render(<TripMap tripId="trip-123" />)

    // Map controls should be present but initially hidden with opacity
    expect(screen.getByTitle('Expand map')).toBeInTheDocument()
    expect(screen.getByTitle('Get directions')).toBeInTheDocument()
  })

  it('should handle expand map button click', () => {
    render(<TripMap tripId="trip-123" />)

    const expandButton = screen.getByTitle('Expand map')
    fireEvent.click(expandButton)

    expect(consoleSpy).toHaveBeenCalledWith('Expand map for trip:', 'trip-123')
  })

  it('should handle get directions button click', () => {
    render(<TripMap tripId="trip-123" />)

    const directionsButton = screen.getByTitle('Get directions')
    fireEvent.click(directionsButton)

    expect(consoleSpy).toHaveBeenCalledWith('Get directions for trip:', 'trip-123')
  })

  it('should render action buttons', () => {
    render(<TripMap tripId="trip-123" />)

    expect(screen.getByText('Get Directions')).toBeInTheDocument()
    expect(screen.getByText('View Full Map')).toBeInTheDocument()
  })

  it('should handle action button clicks', () => {
    render(<TripMap tripId="trip-123" />)

    const getDirectionsBtn = screen.getByText('Get Directions')
    const viewFullMapBtn = screen.getByText('View Full Map')

    fireEvent.click(getDirectionsBtn)
    expect(consoleSpy).toHaveBeenCalledWith('Get directions for trip:', 'trip-123')

    fireEvent.click(viewFullMapBtn)
    expect(consoleSpy).toHaveBeenCalledWith('Expand map for trip:', 'trip-123')
  })

  it('should show notice about future map integration', () => {
    render(<TripMap tripId="trip-123" />)

    expect(screen.getByText('Interactive Map Coming Soon')).toBeInTheDocument()
    expect(screen.getByText(/This is a placeholder for the trip location map/)).toBeInTheDocument()
  })

  it('should display coordinates correctly', () => {
    render(<TripMap tripId="trip-123" />)

    // Check that coordinates are displayed in multiple places
    const coordinateTexts = screen.getAllByText(/37\.7749.*-122\.4194/)
    expect(coordinateTexts.length).toBeGreaterThan(0)
  })

  it('should apply custom className when provided', () => {
    const { container } = render(<TripMap tripId="trip-123" className="custom-class" />)

    expect(container.firstChild).toHaveClass('custom-class')
  })
})
