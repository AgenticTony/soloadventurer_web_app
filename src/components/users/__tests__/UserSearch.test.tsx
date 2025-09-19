import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserSearch } from '../UserSearch';
import { useGeolocation } from '@/hooks/useGeolocation';

// Mock the useGeolocation hook
jest.mock('@/hooks/useGeolocation');
const mockUseGeolocation = useGeolocation as jest.MockedFunction<typeof useGeolocation>;

describe('UserSearch', () => {
  const defaultProps = {
    query: '',
    location: null,
    radiusKm: 10,
    interests: [],
    searchHistory: [],
    onQueryChange: jest.fn(),
    onLocationChange: jest.fn(),
    onRadiusChange: jest.fn(),
    onInterestsChange: jest.fn(),
    onClearHistory: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGeolocation.mockReturnValue({
      position: null,
      loading: false,
      error: null,
      permission: 'prompt',
      requestPosition: jest.fn(),
      clearError: jest.fn(),
    });
  });

  it('should render search input', () => {
    render(<UserSearch {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText('Search by name or bio...');
    expect(searchInput).toBeInTheDocument();
  });

  it('should handle search input changes', () => {
    render(<UserSearch {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText('Search by name or bio...');
    fireEvent.change(searchInput, { target: { value: 'test query' } });

    expect(defaultProps.onQueryChange).toHaveBeenCalledWith('test query');
  });

  it('should show search history when focused', () => {
    const propsWithHistory = {
      ...defaultProps,
      searchHistory: ['previous search', 'another search'],
    };

    render(<UserSearch {...propsWithHistory} />);

    const searchInput = screen.getByPlaceholderText('Search by name or bio...');
    fireEvent.focus(searchInput);

    expect(screen.getByText('Recent Searches')).toBeInTheDocument();
    expect(screen.getByText('previous search')).toBeInTheDocument();
    expect(screen.getByText('another search')).toBeInTheDocument();
  });

  it('should handle history item selection', () => {
    const propsWithHistory = {
      ...defaultProps,
      searchHistory: ['selected search'],
    };

    render(<UserSearch {...propsWithHistory} />);

    const searchInput = screen.getByPlaceholderText('Search by name or bio...');
    fireEvent.focus(searchInput);

    const historyItem = screen.getByText('selected search');
    fireEvent.click(historyItem);

    expect(defaultProps.onQueryChange).toHaveBeenCalledWith('selected search');
  });

  it('should toggle filters panel', () => {
    render(<UserSearch {...defaultProps} />);

    const filtersButton = screen.getByText('Filters');
    expect(screen.queryByText('Search Radius')).not.toBeInTheDocument();

    fireEvent.click(filtersButton);
    expect(screen.getByText('Interests')).toBeInTheDocument();
  });

  it('should handle location toggle', () => {
    mockUseGeolocation.mockReturnValue({
      position: { latitude: 40.7128, longitude: -74.0060 },
      loading: false,
      error: null,
      permission: 'granted',
      requestPosition: jest.fn(),
      clearError: jest.fn(),
    });

    render(<UserSearch {...defaultProps} />);

    const locationButton = screen.getByText('Location');
    fireEvent.click(locationButton);

    expect(defaultProps.onLocationChange).toHaveBeenCalledWith({
      latitude: 40.7128,
      longitude: -74.0060,
    });
  });

  it('should show location loading state', () => {
    mockUseGeolocation.mockReturnValue({
      position: null,
      loading: true,
      error: null,
      permission: 'prompt',
      requestPosition: jest.fn(),
      clearError: jest.fn(),
    });

    render(<UserSearch {...defaultProps} />);

    expect(screen.getByText('Finding...')).toBeInTheDocument();
  });

  it('should display location error', () => {
    mockUseGeolocation.mockReturnValue({
      position: null,
      loading: false,
      error: 'Location access denied',
      permission: 'denied',
      requestPosition: jest.fn(),
      clearError: jest.fn(),
    });

    render(<UserSearch {...defaultProps} />);

    expect(screen.getByText('Location access denied')).toBeInTheDocument();
  });

  it('should handle radius selection when location is enabled', () => {
    const propsWithLocation = {
      ...defaultProps,
      location: { latitude: 40.7128, longitude: -74.0060 },
    };

    render(<UserSearch {...propsWithLocation} />);

    // Open filters
    const filtersButton = screen.getByText('Filters');
    fireEvent.click(filtersButton);

    // Select 25km radius
    const radiusButton = screen.getByText('25 km');
    fireEvent.click(radiusButton);

    expect(defaultProps.onRadiusChange).toHaveBeenCalledWith(25);
  });

  it('should add interests from suggestions', () => {
    render(<UserSearch {...defaultProps} />);

    // Open filters
    const filtersButton = screen.getByText('Filters');
    fireEvent.click(filtersButton);

    // Click on a suggested interest
    const hikingButton = screen.getByText('+ hiking');
    fireEvent.click(hikingButton);

    expect(defaultProps.onInterestsChange).toHaveBeenCalledWith(['hiking']);
  });

  it('should add interests via input', () => {
    render(<UserSearch {...defaultProps} />);

    // Open filters
    const filtersButton = screen.getByText('Filters');
    fireEvent.click(filtersButton);

    // Type in interest input
    const interestInput = screen.getByPlaceholderText('Add an interest...');
    fireEvent.change(interestInput, { target: { value: 'custom interest' } });
    fireEvent.keyDown(interestInput, { key: 'Enter' });

    expect(defaultProps.onInterestsChange).toHaveBeenCalledWith(['custom interest']);
  });

  it('should remove selected interests', () => {
    const propsWithInterests = {
      ...defaultProps,
      interests: ['hiking', 'photography'],
    };

    render(<UserSearch {...propsWithInterests} />);

    // Open filters
    const filtersButton = screen.getByText('Filters');
    fireEvent.click(filtersButton);

    // Find and click remove button for hiking
    const hikingTag = screen.getByText('hiking').parentElement;
    const removeButton = hikingTag?.querySelector('button');

    expect(removeButton).toBeInTheDocument();
    if (removeButton) {
      fireEvent.click(removeButton);
    }

    expect(defaultProps.onInterestsChange).toHaveBeenCalledWith(['photography']);
  });

  it('should show interest suggestions when typing', async () => {
    render(<UserSearch {...defaultProps} />);

    // Open filters
    const filtersButton = screen.getByText('Filters');
    fireEvent.click(filtersButton);

    // Type partial interest
    const interestInput = screen.getByPlaceholderText('Add an interest...');
    fireEvent.change(interestInput, { target: { value: 'hik' } });

    await waitFor(() => {
      expect(screen.getByText('hiking')).toBeInTheDocument();
    });
  });

  it('should clear search history', () => {
    const propsWithHistory = {
      ...defaultProps,
      searchHistory: ['search 1', 'search 2'],
    };

    render(<UserSearch {...propsWithHistory} />);

    // Focus input to show history
    const searchInput = screen.getByPlaceholderText('Search by name or bio...');
    fireEvent.focus(searchInput);

    // Click clear history button
    const clearButton = screen.getByTitle('Clear history');
    fireEvent.click(clearButton);

    expect(defaultProps.onClearHistory).toHaveBeenCalled();
  });

  it('should show active filter count', () => {
    const propsWithFilters = {
      ...defaultProps,
      interests: ['hiking', 'photography'],
      location: { latitude: 40.7128, longitude: -74.0060 },
    };

    render(<UserSearch {...propsWithFilters} />);

    expect(screen.getByText('3 filters active')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<UserSearch {...defaultProps} className="custom-search" />);

    const searchContainer = container.querySelector('.custom-search');
    expect(searchContainer).toBeInTheDocument();
  });
});