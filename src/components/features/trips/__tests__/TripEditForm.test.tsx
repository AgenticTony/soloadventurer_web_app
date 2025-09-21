import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TripEditForm } from '../TripEditForm'

// Mock AWS Amplify auth
jest.mock('aws-amplify/auth', () => ({
  fetchAuthSession: jest.fn().mockResolvedValue({
    tokens: {
      idToken: {
        toString: () => 'mock-jwt-token'
      }
    }
  })
}))

// Mock the trip service
jest.mock('@/services/trips/tripService', () => ({
  tripService: {
    updateTrip: jest.fn().mockResolvedValue({ success: true })
  }
}))

// Mock the unsaved changes hook
jest.mock('@/hooks/useUnsavedChanges', () => ({
  useUnsavedChanges: jest.fn(() => ({
    confirmNavigation: jest.fn((callback) => callback())
  }))
}))

const mockTrip = {
  id: 'trip-123',
  title: 'Paris Adventure',
  description: 'A fantastic trip to explore the City of Light',
  location: 'Paris, France',
  startDate: '2024-06-01T00:00:00Z',
  endDate: '2024-06-10T00:00:00Z',
  status: 'PLANNING' as const,
  isPrivate: false,
  ownerId: 'user-123',
  owner: 'adventure_seeker',
  createdAt: '2024-05-01T00:00:00Z',
  updatedAt: '2024-05-01T00:00:00Z'
}

const mockOnCancel = jest.fn()

describe('TripEditForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render form with trip data pre-populated', () => {
    render(<TripEditForm trip={mockTrip} onCancel={mockOnCancel} />)

    expect(screen.getByDisplayValue('Paris Adventure')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2024-06-01')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2024-06-10')).toBeInTheDocument()

    // Privacy checkbox should match trip privacy
    const privateCheckbox = screen.getByRole('checkbox')
    expect(privateCheckbox).not.toBeChecked()
  })

  it('should show validation errors for invalid input', async () => {
    render(<TripEditForm trip={mockTrip} onCancel={mockOnCancel} />)

    // Clear title to make it invalid
    const titleInput = screen.getByDisplayValue('Paris Adventure')
    fireEvent.change(titleInput, { target: { value: '' } })

    // Submit form
    const submitButton = screen.getByText('Save Changes')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument()
    })
  })

  it('should show validation works for valid dates', async () => {
    render(<TripEditForm trip={mockTrip} onCancel={mockOnCancel} />)

    // Submit form with valid dates and verify Coming Soon modal appears
    const submitButton = screen.getByText('Save Changes')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Coming Soon!')).toBeInTheDocument()
    })
  })

  it('should show character count for title field', () => {
    render(<TripEditForm trip={mockTrip} onCancel={mockOnCancel} />)

    // Paris Adventure = 15 characters
    expect(screen.getByText('15/80 characters')).toBeInTheDocument()
  })

  it('should show Coming Soon modal when form is submitted', async () => {
    render(<TripEditForm trip={mockTrip} onCancel={mockOnCancel} />)

    const submitButton = screen.getByText('Save Changes')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Coming Soon!')).toBeInTheDocument()
      expect(screen.getByText(/Trip editing functionality is currently being developed/)).toBeInTheDocument()
    })
  })

  it('should close Coming Soon modal when Got it is clicked', async () => {
    render(<TripEditForm trip={mockTrip} onCancel={mockOnCancel} />)

    // Submit form to show modal
    const submitButton = screen.getByText('Save Changes')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Coming Soon!')).toBeInTheDocument()
    })

    // Click Got it to close modal
    const gotItButton = screen.getByText('Got it')
    fireEvent.click(gotItButton)

    await waitFor(() => {
      expect(screen.queryByText('Coming Soon!')).not.toBeInTheDocument()
    })
  })

  it('should call onCancel when Cancel button clicked', () => {
    render(<TripEditForm trip={mockTrip} onCancel={mockOnCancel} />)

    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)

    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('should show unsaved changes indicator when form is modified', async () => {
    render(<TripEditForm trip={mockTrip} onCancel={mockOnCancel} />)

    // Initially should not show unsaved changes
    expect(screen.queryByText('You have unsaved changes')).not.toBeInTheDocument()

    // Modify title
    const titleInput = screen.getByDisplayValue('Paris Adventure')
    fireEvent.change(titleInput, { target: { value: 'Modified Title' } })

    await waitFor(() => {
      expect(screen.getByText('You have unsaved changes')).toBeInTheDocument()
    })
  })

  it('should clear field errors when user starts typing', async () => {
    render(<TripEditForm trip={mockTrip} onCancel={mockOnCancel} />)

    // Clear title to trigger validation error
    const titleInput = screen.getByDisplayValue('Paris Adventure')
    fireEvent.change(titleInput, { target: { value: '' } })

    // Submit to show error
    const submitButton = screen.getByText('Save Changes')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument()
    })

    // Type something to clear the error
    fireEvent.change(titleInput, { target: { value: 'New Title' } })

    await waitFor(() => {
      expect(screen.queryByText('Title is required')).not.toBeInTheDocument()
    })
  })

  it('should update privacy setting correctly', () => {
    render(<TripEditForm trip={mockTrip} onCancel={mockOnCancel} />)

    const privateCheckbox = screen.getByRole('checkbox')
    expect(privateCheckbox).not.toBeChecked()

    fireEvent.click(privateCheckbox)
    expect(privateCheckbox).toBeChecked()
  })
})