import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NearbyTravelersSection } from '../NearbyTravelersSection';
import * as matchingApi from '@/lib/api/matching';
import * as activitiesApi from '@/lib/api/activities';
import type { Activity, CompositeMatch } from '@/types/matching';

// ── Mocks ──────────────────────────────────────────────────────

jest.mock('@/lib/api/matching', () => ({
  findPotentialMatches: jest.fn(),
}));

jest.mock('@/lib/api/activities', () => ({
  getActivities: jest.fn(),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/components/features/matching/MatchCard', () => ({
  MatchCard: ({ match }: { match: { id: string; displayName: string; userId: string; sharedActivities: string[] } }) => (
    <div data-testid={`match-card-${match.id}`}>
      {match.displayName} — {match.sharedActivities.join(', ')}
    </div>
  ),
}));

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: { error: jest.fn(), success: jest.fn() },
}));

const mockFindPotentialMatches = matchingApi.findPotentialMatches as jest.MockedFunction<typeof matchingApi.findPotentialMatches>;
const mockGetActivities = activitiesApi.getActivities as jest.MockedFunction<typeof activitiesApi.getActivities>;

// Get reference to the mocked useAuth
import { useAuth } from '@/contexts/AuthContext';
const mockUseAuth = useAuth as jest.Mock;

// ── Fixtures ───────────────────────────────────────────────────

const ACTIVITIES: Activity[] = [
  { id: 'act-1', name: 'Hiking', description: null, category: 'outdoor', iconName: 'hiking', isActive: true, isLocationSpecific: false, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: 'act-2', name: 'Photography', description: null, category: 'creative', iconName: 'camera', isActive: true, isLocationSpecific: false, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: 'act-3', name: 'Cooking', description: null, category: 'food', iconName: 'cooking', isActive: true, isLocationSpecific: false, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: 'act-4', name: 'Surfing', description: null, category: 'water_sports', iconName: 'surfing', isActive: true, isLocationSpecific: false, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
];

function makeCompositeMatch(overrides: Partial<CompositeMatch> & { id: string; userId: string; displayName: string; sharedActivities: string[] }): CompositeMatch {
  return {
    avatarUrl: null,
    homeCountry: null,
    destinationName: 'Tokyo',
    startDate: '2026-05-01',
    endDate: '2026-05-10',
    overlapDays: 5,
    distanceMeters: 5000,
    matchType: 'geographic_overlap',
    matchScore: 0.5,
    semanticScore: 0,
    compositeScore: 0.5,
    matchPercentage: 50,
    sharedActivityCount: overrides.sharedActivities.length,
    confidence: 'medium',
    factors: { semantic: 0, dateOverlap: 0.5, activities: 0.3, destination: 0, age: 0 },
    ...overrides,
  };
}

const MATCHES: CompositeMatch[] = [
  makeCompositeMatch({
    id: 'match-1',
    userId: 'user-2',
    displayName: 'Alice',
    homeCountry: 'Canada',
    matchType: 'combined_match',
    sharedActivities: ['Hiking', 'Photography'],
  }),
  makeCompositeMatch({
    id: 'match-2',
    userId: 'user-3',
    displayName: 'Bob',
    homeCountry: 'USA',
    destinationName: 'Paris',
    matchType: 'activity_match',
    sharedActivities: ['Cooking', 'Surfing'],
  }),
  makeCompositeMatch({
    id: 'match-3',
    userId: 'user-4',
    displayName: 'Carol',
    homeCountry: 'UK',
    destinationName: 'Berlin',
    overlapDays: 0,
    matchType: 'geographic_overlap',
    sharedActivities: ['Hiking'],
  }),
];

// ── Tests ──────────────────────────────────────────────────────

describe('NearbyTravelersSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: { id: 'current-user' } });
    mockFindPotentialMatches.mockResolvedValue(MATCHES);
    mockGetActivities.mockResolvedValue(ACTIVITIES);
  });

  // ── Basic rendering ───────────────────────────────────────

  it('renders match cards for all matches', async () => {
    render(<NearbyTravelersSection onRequestLocation={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByTestId('match-card-match-1')).toBeInTheDocument();
      expect(screen.getByTestId('match-card-match-2')).toBeInTheDocument();
      expect(screen.getByTestId('match-card-match-3')).toBeInTheDocument();
    });
  });

  it('shows traveler count in subtitle', async () => {
    render(<NearbyTravelersSection onRequestLocation={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/3 travelers heading your way/)).toBeInTheDocument();
    });
  });

  // ── Activity filter chips ─────────────────────────────────

  /** Helper: find activity chip button by name (collapsed quick chips) */
  function findActivityChip(name: string) {
    return screen.getAllByRole('button').find(
      (b) => b.textContent?.trim() === name,
    );
  }

  describe('activity filter chips', () => {
    it('renders filter chips from activities', async () => {
      render(<NearbyTravelersSection onRequestLocation={jest.fn()} />);

      await waitFor(() => {
        // Collapsed view shows top 4 activity chips
        expect(findActivityChip('Hiking')).toBeDefined();
        expect(findActivityChip('Photography')).toBeDefined();
        expect(findActivityChip('Cooking')).toBeDefined();
        expect(findActivityChip('Surfing')).toBeDefined();
      });
    });

    it('filters matches when an activity chip is selected', async () => {
      render(<NearbyTravelersSection onRequestLocation={jest.fn()} />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('match-card-match-1')).toBeInTheDocument();
      });

      // Click "Cooking" chip — only Bob has Cooking
      const cookingButton = findActivityChip('Cooking');
      expect(cookingButton).toBeDefined();
      fireEvent.click(cookingButton!);

      await waitFor(() => {
        expect(screen.getByTestId('match-card-match-2')).toBeInTheDocument();
        expect(screen.queryByTestId('match-card-match-1')).not.toBeInTheDocument();
        expect(screen.queryByTestId('match-card-match-3')).not.toBeInTheDocument();
      });
    });

    it('shows "Clear" button when filters are active', async () => {
      render(<NearbyTravelersSection onRequestLocation={jest.fn()} />);

      await waitFor(() => {
        expect(screen.getByTestId('match-card-match-1')).toBeInTheDocument();
      });

      const cookingButton = findActivityChip('Cooking');
      fireEvent.click(cookingButton!);

      // Open filter panel to see the clear button
      const filtersButton = screen.getAllByRole('button').find(
        (b) => b.textContent?.includes('Filters'),
      );
      fireEvent.click(filtersButton!);

      await waitFor(() => {
        expect(screen.getByText(/Clear all filters/)).toBeInTheDocument();
      });
    });

    it('clears all filters when Clear button is clicked', async () => {
      render(<NearbyTravelersSection onRequestLocation={jest.fn()} />);

      await waitFor(() => {
        expect(screen.getByTestId('match-card-match-1')).toBeInTheDocument();
      });

      // Open filter panel first
      const filtersButton = screen.getAllByRole('button').find(
        (b) => b.textContent?.includes('Filters'),
      );
      fireEvent.click(filtersButton!);

      // Select "Cooking" filter from expanded panel
      const cookingButton = screen.getAllByRole('button').find(
        (b) => b.textContent?.trim() === 'Cooking',
      );
      fireEvent.click(cookingButton!);

      await waitFor(() => {
        expect(screen.queryByTestId('match-card-match-1')).not.toBeInTheDocument();
      });

      // Click Clear all filters
      const clearButton = screen.getByText(/Clear all filters/);
      fireEvent.click(clearButton);

      await waitFor(() => {
        expect(screen.getByTestId('match-card-match-1')).toBeInTheDocument();
        expect(screen.getByTestId('match-card-match-2')).toBeInTheDocument();
        expect(screen.getByTestId('match-card-match-3')).toBeInTheDocument();
      });
    });

    it('shows "matching your filter" subtitle when filters active', async () => {
      render(<NearbyTravelersSection onRequestLocation={jest.fn()} />);

      await waitFor(() => {
        expect(screen.getByText(/3 travelers heading your way/)).toBeInTheDocument();
      });

      const cookingButton = findActivityChip('Cooking');
      fireEvent.click(cookingButton!);

      await waitFor(() => {
        expect(screen.getByText(/1 traveler matching your interests/)).toBeInTheDocument();
      });
    });

    it('shows empty state with Clear Filters button when filter yields no results', async () => {
      // Create matches with non-overlapping activities
      const noMatchData: CompositeMatch[] = [
        makeCompositeMatch({
          id: 'match-x',
          userId: 'user-x',
          displayName: 'Dave',
          sharedActivities: ['Hiking'],
        }),
      ];
      mockFindPotentialMatches.mockResolvedValue(noMatchData);

      render(<NearbyTravelersSection onRequestLocation={jest.fn()} />);

      await waitFor(() => {
        expect(screen.getByTestId('match-card-match-x')).toBeInTheDocument();
      });

      // Open full filter panel to access Surfing (5th activity)
      const filtersButton = screen.getAllByRole('button').find(
        (b) => b.textContent?.includes('Filters'),
      );
      fireEvent.click(filtersButton!);

      // Select "Surfing" — Dave doesn't have it
      const surfingButton = screen.getAllByRole('button').find(
        (b) => b.textContent?.trim() === 'Surfing',
      );
      fireEvent.click(surfingButton!);

      await waitFor(() => {
        expect(screen.getByText('No matches for selected activities')).toBeInTheDocument();
        expect(screen.getByText('Clear Filters')).toBeInTheDocument();
      });
    });
  });

  // ── Empty/error states ────────────────────────────────────

  describe('empty and error states', () => {
    it('shows empty state when no matches found', async () => {
      mockFindPotentialMatches.mockResolvedValue([]);
      render(<NearbyTravelersSection onRequestLocation={jest.fn()} />);

      await waitFor(() => {
        expect(screen.getByText('No travelers nearby yet')).toBeInTheDocument();
      });
    });

    it('shows error state on fetch failure', async () => {
      mockFindPotentialMatches.mockRejectedValue(new Error('Network error'));
      render(<NearbyTravelersSection onRequestLocation={jest.fn()} />);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
        expect(screen.getByText('Try Again')).toBeInTheDocument();
      });
    });

    it('returns null when user is not authenticated', () => {
      mockUseAuth.mockReturnValue({ user: null });
      const { container } = render(<NearbyTravelersSection onRequestLocation={jest.fn()} />);
      expect(container.innerHTML).toBe('');
    });
  });

  // ── Refresh ───────────────────────────────────────────────

  describe('refresh', () => {
    it('calls findPotentialMatches again on refresh', async () => {
      render(<NearbyTravelersSection onRequestLocation={jest.fn()} />);

      await waitFor(() => {
        expect(mockFindPotentialMatches).toHaveBeenCalledTimes(1);
      });

      const refreshButton = screen.getByText('Refresh');
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(mockFindPotentialMatches).toHaveBeenCalledTimes(2);
      });
    });
  });
});
