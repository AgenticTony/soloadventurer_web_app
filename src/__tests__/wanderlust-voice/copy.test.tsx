import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { NearbyTravelersSection } from '@/components/features/matching/NearbyTravelersSection';
import DiscoverPage from '@/app/(main)/discover/page';
import FeedPage from '@/app/(main)/feed/page';
import TripsPage from '@/app/(main)/trips/page';
import * as matchingApi from '@/lib/api/matching';
import * as activitiesApi from '@/lib/api/activities';
import type { CompositeMatch } from '@/types/matching';

// ── Core mocks ───────────────────────────────────────────────────

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));
import { useAuth } from '@/contexts/AuthContext';
const mockUseAuth = useAuth as jest.Mock;

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: { error: jest.fn(), success: jest.fn() },
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/lib/api/matching', () => ({
  findPotentialMatches: jest.fn(),
  requestConnection: jest.fn().mockResolvedValue({ id: 'conn-1' }),
}));

jest.mock('@/lib/api/activities', () => ({
  getActivities: jest.fn(),
}));

jest.mock('@/components/features/matching/MatchCard', () => ({
  MatchCard: ({ match }: { match: { id: string } }) => (
    <div data-testid={`match-card-${match.id}`} />
  ),
}));

jest.mock('@/lib/api', () => ({
  getFeed: jest.fn().mockResolvedValue([]),
}));

jest.mock('@/hooks/useUserSearch', () => ({
  useUserSearch: () => ({
    users: [], loading: false, error: null, hasMore: false, totalCount: 0,
    filters: { query: '', location: '', radiusKm: 50, interests: [] },
    searchHistory: [],
    setQuery: jest.fn(), setLocation: jest.fn(), setRadiusKm: jest.fn(),
    setInterests: jest.fn(), loadMore: jest.fn(), refresh: jest.fn(), clearHistory: jest.fn(),
  }),
}));

jest.mock('@/hooks/useTrips', () => ({
  useTrips: () => ({ trips: [], filter: 'all', setFilter: jest.fn() }),
}));

jest.mock('@/components/features/feed/PostComposer', () => ({
  PostComposer: () => <div data-testid="post-composer" />,
}));

jest.mock('@/components/users', () => ({
  UserSearch: () => <div data-testid="user-search" />,
  UserGrid: () => <div data-testid="user-grid" />,
}));

jest.mock('@/components/features/trips/TripList', () => ({
  TripList: () => <div data-testid="trip-list" />,
}));

jest.mock('@/components/features/trips/TripFilters', () => ({
  TripFilters: () => <div data-testid="trip-filters" />,
}));

const mockFindPotentialMatches = matchingApi.findPotentialMatches as jest.Mock;
const mockGetActivities = activitiesApi.getActivities as jest.Mock;

// ── Fixtures ─────────────────────────────────────────────────────

function makeCompositeMatch(overrides: Partial<CompositeMatch> & { id: string; userId: string; displayName: string; sharedActivities: string[] }): CompositeMatch {
  return {
    avatarUrl: null, homeCountry: null, destinationName: 'Tokyo',
    startDate: '2026-05-01', endDate: '2026-05-10', overlapDays: 5,
    distanceMeters: 5000, matchType: 'geographic_overlap', matchScore: 0.5,
    semanticScore: 0, compositeScore: 0.5, matchPercentage: 50,
    sharedActivityCount: overrides.sharedActivities.length, confidence: 'medium',
    factors: { semantic: 0, dateOverlap: 0.5, activities: 0.3, destination: 0, age: 0 },
    ...overrides,
  };
}

const MATCHES: CompositeMatch[] = [
  makeCompositeMatch({ id: 'm1', userId: 'u2', displayName: 'Alice', sharedActivities: ['Hiking'] }),
  makeCompositeMatch({ id: 'm2', userId: 'u3', displayName: 'Bob', sharedActivities: ['Surfing'] }),
];

// ── Tests ────────────────────────────────────────────────────────

describe('Wanderlust Voice — Copy Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: { id: 'current-user' } });
    mockFindPotentialMatches.mockResolvedValue(MATCHES);
    mockGetActivities.mockResolvedValue([]);
  });

  describe('Discover page copy', () => {
    it('uses "Discover" heading', () => {
      render(<DiscoverPage />);
      expect(screen.getByRole('heading', { level: 1, name: 'Discover' })).toBeInTheDocument();
    });

    it('uses wanderlust subtitle about landing in city', () => {
      render(<DiscoverPage />);
      expect(screen.getByText(/See who else just landed in your city/)).toBeInTheDocument();
    });

    it('mentions "travel buddy" in subtitle', () => {
      render(<DiscoverPage />);
      expect(screen.getByText(/travel buddy/)).toBeInTheDocument();
    });
  });

  describe('NearbyTravelersSection copy', () => {
    it('uses "Travelers Near You" heading', async () => {
      render(<NearbyTravelersSection />);
      await waitFor(() => {
        expect(screen.getByText('Travelers Near You')).toBeInTheDocument();
      });
    });

    it('uses "heading your way" for match subtitle', async () => {
      render(<NearbyTravelersSection />);
      await waitFor(() => {
        expect(screen.getByText(/heading your way/)).toBeInTheDocument();
      });
    });

    it('uses "matching your interests" when filters are active', async () => {
      mockGetActivities.mockResolvedValue([
        { id: 'a1', name: 'Hiking', description: null, category: 'outdoor', iconName: 'hiking', isActive: true, isLocationSpecific: false, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
      ]);
      render(<NearbyTravelersSection />);

      await waitFor(() => {
        expect(screen.getByText(/Hiking/)).toBeInTheDocument();
      });

      const buttons = screen.getAllByRole('button');
      const hikingButton = buttons.find(b => b.textContent === 'Hiking' && b.getAttribute('aria-pressed') !== null);
      if (hikingButton) {
        fireEvent.click(hikingButton);
        await waitFor(() => {
          expect(screen.getByText(/matching your interests/)).toBeInTheDocument();
        });
      }
    });

    it('uses "See who else just landed nearby" for empty state', async () => {
      mockFindPotentialMatches.mockResolvedValue([]);
      render(<NearbyTravelersSection />);
      await waitFor(() => {
        expect(screen.getByText('See who else just landed nearby')).toBeInTheDocument();
      });
    });

    it('uses "No travelers nearby yet" for empty heading', async () => {
      mockFindPotentialMatches.mockResolvedValue([]);
      render(<NearbyTravelersSection />);
      await waitFor(() => {
        expect(screen.getByText('No travelers nearby yet')).toBeInTheDocument();
      });
    });
  });

  describe('Feed page copy', () => {
    it('uses "Traveler Stories" heading', async () => {
      render(<FeedPage />);
      await waitFor(() => {
        expect(screen.getByText('Traveler Stories')).toBeInTheDocument();
      });
    });

    it('uses "See what fellow adventurers are up to" subtitle', async () => {
      render(<FeedPage />);
      await waitFor(() => {
        expect(screen.getByText('See what fellow adventurers are up to')).toBeInTheDocument();
      });
    });

    it('uses "No stories yet" for empty feed', async () => {
      render(<FeedPage />);
      await waitFor(() => {
        expect(screen.getByText('No stories yet')).toBeInTheDocument();
      });
    });
  });

  describe('Trips page copy', () => {
    it('uses "Where are you headed next?" subtitle', () => {
      render(<TripsPage />);
      expect(screen.getByText('Where are you headed next?')).toBeInTheDocument();
    });

    it('uses "New Trip" button', () => {
      render(<TripsPage />);
      expect(screen.getByText('New Trip')).toBeInTheDocument();
    });
  });
});
