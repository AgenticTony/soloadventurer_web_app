import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserCard } from '@/components/users/UserCard';
import { MatchCard } from '@/components/features/matching/MatchCard';
import { UserMiniCard } from '@/components/features/users/UserMiniCard';
import * as matchingApi from '@/lib/api/matching';
import type { UserProfile } from '@/types/user';
import type { PotentialMatch, CompositeMatch } from '@/types/matching';

// ── Shared mocks ────────────────────────────────────────────────

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'current-user' } }),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/lib/api/matching', () => ({
  requestConnection: jest.fn().mockResolvedValue({ id: 'conn-1' }),
}));

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: { error: jest.fn(), success: jest.fn() },
}));

const mockRequestConnection = matchingApi.requestConnection as jest.Mock;

// ── Fixtures ─────────────────────────────────────────────────────

const mockUser: UserProfile = {
  id: 'user-1',
  name: 'Alice Wanderlust',
  email: 'alice@example.com',
  emailVerified: true,
  bio: 'Exploring the world',
  isOnline: true,
  isVerified: true,
  stats: { tripsCount: 12, followersCount: 345, followingCount: 123, placesVisited: 28 },
};

const miniCardUser = {
  id: 'user-1',
  name: 'Alice Wanderlust',
  bio: 'Exploring the world',
  location: 'Tokyo, Japan',
  languages: ['English', 'Japanese'],
  travelStyles: ['Backpacking', 'Cultural'],
  upcomingTrip: { destination: 'Kyoto', date: '2026-06-15' },
  stats: { trips: 12, connections: 45, posts: 8 },
};

const baseMatch: PotentialMatch = {
  id: 'match-1',
  userId: 'user-2',
  displayName: 'Bob',
  avatarUrl: null,
  homeCountry: 'Canada',
  destinationName: 'Tokyo',
  startDate: '2026-05-01',
  endDate: '2026-05-10',
  overlapDays: 5,
  distanceMeters: 5000,
  matchType: 'geographic_overlap',
  matchScore: 0.71,
  sharedActivities: ['Hiking'],
};

// ── Tests ────────────────────────────────────────────────────────

describe('Design Tokens — Color System', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('coral as connection action color', () => {
    it('UserCard "Say hi" button uses btn-connection class (coral)', () => {
      render(<UserCard user={mockUser} showActions={true} />);
      expect(screen.getByText('Say hi')).toHaveClass('btn-connection');
    });

    it('MatchCard Connect button uses btn-connection class (coral)', () => {
      render(<MatchCard match={baseMatch} />);
      expect(screen.getByRole('button', { name: /connect/i })).toHaveClass('btn-connection');
    });

    it('UserMiniCard compact "Say hi" uses btn-connection class', () => {
      render(<UserMiniCard user={miniCardUser} compact={true} />);
      expect(screen.getByText('Say hi')).toHaveClass('btn-connection');
    });

    it('UserMiniCard full "Say hi" uses btn-connection class', () => {
      render(<UserMiniCard user={miniCardUser} compact={false} />);
      expect(screen.getByText('Say hi')).toHaveClass('btn-connection');
    });

    it('UserMiniCard connected state uses connection color tokens', () => {
      render(<UserMiniCard user={miniCardUser} compact={true} />);
      fireEvent.click(screen.getByText('Say hi'));
      expect(screen.getByText('Connected')).toBeInTheDocument();
      expect(screen.getByText('Connected').className).toContain('connection');
    });

    it('MatchCard scored activity chips use connection color', () => {
      const compositeMatch: CompositeMatch = {
        ...baseMatch,
        semanticScore: 0.85,
        compositeScore: 0.78,
        matchPercentage: 92,
        sharedActivityCount: 2,
        confidence: 'high',
        factors: { semantic: 0.85, dateOverlap: 0.71, activities: 0.6, destination: 1.0, age: 0.9 },
        sharedActivities: ['Hiking'],
      };
      const { container } = render(<MatchCard match={compositeMatch} />);
      expect(container.querySelectorAll('[class*="bg-connection"]').length).toBeGreaterThan(0);
    });
  });

  describe('gold as trust/achievement color', () => {
    it('UserCard verified badge uses badge-trust class (gold)', () => {
      const { container } = render(<UserCard user={mockUser} />);
      expect(container.querySelector('.badge-trust')).toBeInTheDocument();
    });

    it('UserCard verified badge has gold-themed class', () => {
      const { container } = render(<UserCard user={mockUser} />);
      const badge = container.querySelector('[aria-label="Verified traveler"]');
      expect(badge).toHaveClass('badge-trust');
    });

    it('unverified user has no trust badge', () => {
      const unverified = { ...mockUser, isVerified: false };
      const { container } = render(<UserCard user={unverified} />);
      expect(container.querySelector('.badge-trust')).not.toBeInTheDocument();
    });

    it('MatchCard activity match uses trust color tokens', () => {
      const match = { ...baseMatch, matchType: 'activity_match' as const };
      const { container } = render(<MatchCard match={match} />);
      expect(container.querySelector('[class*="bg-trust"]')).toBeInTheDocument();
    });
  });

  describe('teal as brand/navigation color', () => {
    it('MatchCard geographic match type uses brand color', () => {
      const { container } = render(<MatchCard match={baseMatch} />);
      expect(container.querySelector('[class*="bg-brand"]')).toBeInTheDocument();
    });

    it('MatchCard combined match type uses connection color', () => {
      const match = { ...baseMatch, matchType: 'combined_match' as const };
      const { container } = render(<MatchCard match={match} />);
      expect(container.querySelector('[class*="bg-connection"]')).toBeInTheDocument();
    });

    it('MatchCard match score bar uses brand color fill', () => {
      const compositeMatch: CompositeMatch = {
        ...baseMatch,
        semanticScore: 0.85,
        compositeScore: 0.78,
        matchPercentage: 92,
        sharedActivityCount: 2,
        confidence: 'high',
        factors: { semantic: 0.85, dateOverlap: 0.71, activities: 0.6, destination: 1.0, age: 0.9 },
        sharedActivities: ['Hiking'],
      };
      const { container } = render(<MatchCard match={compositeMatch} />);
      expect(container.querySelectorAll('[class*="bg-brand"]').length).toBeGreaterThan(0);
    });

    it('UserCard Message button uses brand color when connected', async () => {
      mockRequestConnection.mockResolvedValue({ id: 'conn-1' });
      render(<UserCard user={mockUser} showActions={true} />);
      fireEvent.click(screen.getByText('Say hi'));
      const messageButton = await screen.findByText('Message');
      expect(messageButton.className).toContain('brand');
    });
  });

  describe('signature gradient utility', () => {
    it('MatchCard avatar fallback uses ocean-sunset gradient', () => {
      const { container } = render(<MatchCard match={baseMatch} />);
      expect(container.querySelector('[class*="bg-gradient-ocean-sunset"]')).toBeInTheDocument();
    });

    it('gradient appears on hero moments only (avatar initials)', () => {
      const { container } = render(<MatchCard match={baseMatch} />);
      expect(container.querySelectorAll('[class*="bg-gradient-ocean-sunset"]')).toHaveLength(1);
    });
  });

  describe('warm-tinted neutrals', () => {
    it('UserCard uses semantic surface tokens (bg-card, border-border)', () => {
      render(<UserCard user={mockUser} />);
      const article = screen.getByRole('article');
      expect(article.className).toContain('bg-card');
      expect(article.className).toContain('border-border');
    });

    it('UserCard uses semantic text tokens (text-foreground)', () => {
      render(<UserCard user={mockUser} />);
      expect(screen.getByText('Alice Wanderlust').className).toContain('text-foreground');
    });

    it('UserCard uses muted text tokens for secondary content', () => {
      render(<UserCard user={mockUser} />);
      expect(screen.getByText('Exploring the world').className).toContain('text-muted-foreground');
    });

    it('MatchCard uses semantic surface tokens', () => {
      const { container } = render(<MatchCard match={baseMatch} />);
      expect(container.querySelector('[class*="bg-card"]')).toBeInTheDocument();
    });

    it('MatchCard uses muted text for secondary labels', () => {
      const { container } = render(<MatchCard match={baseMatch} />);
      expect(container.querySelectorAll('[class*="text-muted-foreground"]').length).toBeGreaterThan(0);
    });
  });
});
