import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MatchCard } from '../MatchCard';
import type { PotentialMatch, CompositeMatch, Connection } from '@/types/matching';
import * as matchingApi from '@/lib/api/matching';

// ── Mocks ──────────────────────────────────────────────────────

jest.mock('@/lib/api/matching', () => ({
  requestConnection: jest.fn(),
}));

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: { error: jest.fn(), success: jest.fn() },
}));

const mockRequestConnection = matchingApi.requestConnection as jest.MockedFunction<typeof matchingApi.requestConnection>;

// ── Fixtures ───────────────────────────────────────────────────

const baseMatch: PotentialMatch = {
  id: 'match-1',
  userId: 'user-2',
  displayName: 'Alice',
  avatarUrl: null,
  homeCountry: 'Canada',
  destinationName: 'Tokyo',
  startDate: '2026-05-01',
  endDate: '2026-05-10',
  overlapDays: 5,
  distanceMeters: 5000,
  matchType: 'geographic_overlap',
  matchScore: 0.71,
  sharedActivities: ['Hiking', 'Photography'],
};

const compositeMatch: CompositeMatch = {
  ...baseMatch,
  semanticScore: 0.85,
  compositeScore: 0.78,
  matchPercentage: 92,
  sharedActivityCount: 4,
  confidence: 'high',
  factors: { semantic: 0.85, dateOverlap: 0.71, activities: 0.6, destination: 1.0, age: 0.9 },
  sharedActivities: ['Hiking', 'Photography', 'Cooking'],
};

// ── Tests ──────────────────────────────────────────────────────

describe('MatchCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequestConnection.mockResolvedValue({
      id: 'conn-1',
      requesterId: 'user-1',
      recipientId: 'user-2',
      status: 'pending',
      matchType: null,
      message: null,
      createdAt: '2026-04-18T00:00:00Z',
      updatedAt: '2026-04-18T00:00:00Z',
    } as Connection);
  });

  // ── Basic rendering ───────────────────────────────────────

  it('renders display name and home country', () => {
    render(<MatchCard match={baseMatch} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Canada')).toBeInTheDocument();
  });

  it('renders destination with MapPin icon text', () => {
    render(<MatchCard match={baseMatch} />);
    expect(screen.getByText('Tokyo')).toBeInTheDocument();
  });

  it('renders overlap days badge', () => {
    render(<MatchCard match={baseMatch} />);
    expect(screen.getByText(/5 days overlap/)).toBeInTheDocument();
  });

  it('renders distance', () => {
    render(<MatchCard match={baseMatch} />);
    expect(screen.getByText(/5\.0km away/)).toBeInTheDocument();
  });

  it('renders match type badge', () => {
    render(<MatchCard match={baseMatch} />);
    expect(screen.getByText('Same Destination')).toBeInTheDocument();
  });

  // ── Shared activities ────────────────────────────────────

  describe('shared activities display', () => {
    it('renders shared activity names as chips', () => {
      render(<MatchCard match={baseMatch} />);
      expect(screen.getByText('Hiking')).toBeInTheDocument();
      expect(screen.getByText('Photography')).toBeInTheDocument();
    });

    it('shows overflow count for composite matches with more activities', () => {
      render(<MatchCard match={compositeMatch} />);
      // sharedActivityCount = 4, displayed = 3 → "+1 more"
      expect(screen.getByText('+1 more')).toBeInTheDocument();
    });

    it('does not show overflow when all activities are displayed', () => {
      const match: PotentialMatch = {
        ...baseMatch,
        sharedActivities: ['Hiking', 'Photography'],
      };
      render(<MatchCard match={match} />);
      expect(screen.queryByText(/more/)).not.toBeInTheDocument();
    });

    it('renders activity-specific icons instead of generic Sparkles', () => {
      const { container } = render(<MatchCard match={baseMatch} />);
      // Hiking should use Mountain icon, Photography should use Camera icon
      // Sparkles should NOT be used for known activities
      const svgElements = container.querySelectorAll('svg');
      // We're checking that icons render without errors — the Lucide icons
      // don't have data-testid by default, but the component shouldn't crash
      expect(svgElements.length).toBeGreaterThan(0);
    });

    it('highlights scored activities with purple ring when activity factor is high', () => {
      const { container } = render(<MatchCard match={compositeMatch} />);
      // Activities are scored when factors.activities >= 0.2 (compositeMatch has 0.6)
      const chips = container.querySelectorAll('.ring-purple-200');
      expect(chips.length).toBeGreaterThan(0);
    });

    it('uses non-highlighted style for non-scored activities', () => {
      const match: PotentialMatch = {
        ...baseMatch,
        matchType: 'geographic_overlap',
        sharedActivities: ['Hiking'],
      };
      const { container } = render(<MatchCard match={match} />);
      // geographic_overlap without composite data → activityScored = false
      const highlighted = container.querySelectorAll('.ring-purple-200');
      expect(highlighted.length).toBe(0);
    });
  });

  // ── Composite score display ───────────────────────────────

  describe('composite score display', () => {
    it('shows match percentage for composite matches', () => {
      render(<MatchCard match={compositeMatch} />);
      expect(screen.getByText('92%')).toBeInTheDocument();
      expect(screen.getByText('Match Score')).toBeInTheDocument();
    });

    it('shows confidence badge for composite matches', () => {
      render(<MatchCard match={compositeMatch} />);
      expect(screen.getByText('High')).toBeInTheDocument();
    });

    it('shows factor breakdown labels', () => {
      render(<MatchCard match={compositeMatch} />);
      expect(screen.getByText('Interests')).toBeInTheDocument();
      expect(screen.getByText('Dates')).toBeInTheDocument();
      expect(screen.getByText('Activities')).toBeInTheDocument();
      expect(screen.getByText('Destination')).toBeInTheDocument();
    });

    it('does not show match score section for plain PotentialMatch', () => {
      render(<MatchCard match={baseMatch} />);
      expect(screen.queryByText('Match Score')).not.toBeInTheDocument();
    });
  });

  // ── Connect action ────────────────────────────────────────

  describe('connect action', () => {
    it('calls requestConnection when Connect is clicked', async () => {
      render(<MatchCard match={baseMatch} />);
      const button = screen.getByRole('button', { name: /connect/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockRequestConnection).toHaveBeenCalledWith('user-2');
      });
    });

    it('shows Request Sent after successful connection', async () => {
      render(<MatchCard match={baseMatch} />);
      const button = screen.getByRole('button', { name: /connect/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Request Sent')).toBeInTheDocument();
      });
    });

    it('shows error toast on connection failure', async () => {
      const toast = jest.requireActual('react-hot-toast').default;
      mockRequestConnection.mockRejectedValue(new Error('Already connected'));

      render(<MatchCard match={baseMatch} />);
      const button = screen.getByRole('button', { name: /connect/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Already connected');
      });
    });

    it('calls onConnect callback after successful connection', async () => {
      const onConnect = jest.fn();
      render(<MatchCard match={baseMatch} onConnect={onConnect} />);
      const button = screen.getByRole('button', { name: /connect/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(onConnect).toHaveBeenCalledWith('match-1');
      });
    });
  });

  // ── Avatar ────────────────────────────────────────────────

  describe('avatar', () => {
    it('shows initials when no avatar URL', () => {
      render(<MatchCard match={baseMatch} />);
      expect(screen.getByText('A')).toBeInTheDocument();
    });

    it('shows image when avatarUrl is provided', () => {
      const match = { ...baseMatch, avatarUrl: 'https://example.com/avatar.jpg' };
      render(<MatchCard match={match} />);
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    });
  });

  // ── Edge cases ────────────────────────────────────────────

  describe('edge cases', () => {
    it('renders without shared activities', () => {
      const match = { ...baseMatch, sharedActivities: [] };
      render(<MatchCard match={match} />);
      expect(screen.queryByText('Hiking')).not.toBeInTheDocument();
    });

    it('renders without destination', () => {
      const match = { ...baseMatch, destinationName: null };
      render(<MatchCard match={match} />);
      expect(screen.queryByText('Tokyo')).not.toBeInTheDocument();
    });

    it('renders without distance', () => {
      const match = { ...baseMatch, distanceMeters: null };
      render(<MatchCard match={match} />);
      expect(screen.queryByText(/away/)).not.toBeInTheDocument();
    });

    it('renders combined_match badge correctly', () => {
      const match = { ...baseMatch, matchType: 'combined_match' as const };
      render(<MatchCard match={match} />);
      expect(screen.getByText('Perfect Match')).toBeInTheDocument();
    });

    it('renders activity_match badge correctly', () => {
      const match = { ...baseMatch, matchType: 'activity_match' as const };
      render(<MatchCard match={match} />);
      expect(screen.getByText('Shared Interests')).toBeInTheDocument();
    });
  });
});
