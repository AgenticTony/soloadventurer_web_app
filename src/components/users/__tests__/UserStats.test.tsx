import React from 'react';
import { render, screen } from '@testing-library/react';
import { UserStats, UserStatsSkeleton } from '../UserStats';
import type { UserStats as UserStatsType } from '@/types/user';

describe('UserStats', () => {
  const mockStats: UserStatsType = {
    tripsCount: 12,
    followersCount: 1534,
    followingCount: 789,
    placesVisited: 45,
  };

  it('should render all stat items with correct values', () => {
    render(<UserStats stats={mockStats} />);

    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('1.5K')).toBeInTheDocument(); // Formatted followers count
    expect(screen.getByText('789')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();

    expect(screen.getByText('Trips')).toBeInTheDocument();
    expect(screen.getByText('Followers')).toBeInTheDocument();
    expect(screen.getByText('Following')).toBeInTheDocument();
    expect(screen.getByText('Places')).toBeInTheDocument();
  });

  it('should format large numbers correctly', () => {
    const largeStats: UserStatsType = {
      tripsCount: 1000,
      followersCount: 1500000,
      followingCount: 2500,
      placesVisited: 999,
    };

    render(<UserStats stats={largeStats} />);

    expect(screen.getByText('1.0K')).toBeInTheDocument(); // trips
    expect(screen.getByText('1.5M')).toBeInTheDocument(); // followers
    expect(screen.getByText('2.5K')).toBeInTheDocument(); // following
    expect(screen.getByText('999')).toBeInTheDocument(); // places (under 1000)
  });

  it('should handle zero values', () => {
    const zeroStats: UserStatsType = {
      tripsCount: 0,
      followersCount: 0,
      followingCount: 0,
      placesVisited: 0,
    };

    render(<UserStats stats={zeroStats} />);

    const zeroValues = screen.getAllByText('0');
    expect(zeroValues).toHaveLength(4);
  });

  it('should render different sizes correctly', () => {
    const { rerender } = render(<UserStats stats={mockStats} size="small" />);
    let container = screen.getByRole('group');
    expect(container).toHaveClass('gap-3');

    rerender(<UserStats stats={mockStats} size="medium" />);
    container = screen.getByRole('group');
    expect(container).toHaveClass('gap-4');

    rerender(<UserStats stats={mockStats} size="large" />);
    container = screen.getByRole('group');
    expect(container).toHaveClass('gap-6');
  });

  it('should have proper accessibility attributes', () => {
    render(<UserStats stats={mockStats} />);

    const container = screen.getByRole('group');
    expect(container).toHaveAttribute('aria-label', 'User statistics');

    const tripsStat = screen.getByLabelText('12 trips taken');
    expect(tripsStat).toHaveAttribute('role', 'img');

    const followersStat = screen.getByLabelText('1534 followers');
    expect(followersStat).toHaveAttribute('role', 'img');

    const followingStat = screen.getByLabelText('Following 789 people');
    expect(followingStat).toHaveAttribute('role', 'img');

    const placesStat = screen.getByLabelText('45 places visited');
    expect(placesStat).toHaveAttribute('role', 'img');
  });

  it('should apply custom className', () => {
    render(<UserStats stats={mockStats} className="custom-stats" />);

    const container = screen.getByRole('group');
    expect(container).toHaveClass('custom-stats');
  });

  it('should render skeleton when loading', () => {
    const { container } = render(<UserStats stats={mockStats} isLoading={true} />);

    expect(screen.queryByText('12')).not.toBeInTheDocument();
    const group = container.querySelector('[role="group"]');
    expect(group).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('UserStatsSkeleton', () => {
  it('should render skeleton with 4 stat placeholders', () => {
    const { container } = render(<UserStatsSkeleton />);

    const groupContainer = container.querySelector('[role="group"]');
    expect(groupContainer).toHaveAttribute('aria-hidden', 'true');

    const skeletonElements = groupContainer!.querySelectorAll('.animate-pulse');
    expect(skeletonElements).toHaveLength(8); // 4 values + 4 labels
  });

  it('should render different sizes correctly', () => {
    const { rerender, container } = render(<UserStatsSkeleton size="small" />);
    let groupContainer = container.querySelector('[role="group"]');
    expect(groupContainer).toHaveClass('gap-3');

    rerender(<UserStatsSkeleton size="medium" />);
    groupContainer = container.querySelector('[role="group"]');
    expect(groupContainer).toHaveClass('gap-4');

    rerender(<UserStatsSkeleton size="large" />);
    groupContainer = container.querySelector('[role="group"]');
    expect(groupContainer).toHaveClass('gap-6');
  });

  it('should apply custom className', () => {
    const { container } = render(<UserStatsSkeleton className="custom-skeleton" />);

    const groupContainer = container.querySelector('[role="group"]');
    expect(groupContainer).toHaveClass('custom-skeleton');
  });

  it('should have hidden text for proper spacing', () => {
    render(<UserStatsSkeleton />);

    const hiddenValues = screen.getAllByText('000');
    expect(hiddenValues).toHaveLength(4);
    hiddenValues.forEach(element => {
      expect(element).toHaveClass('opacity-0');
    });

    const hiddenLabels = screen.getAllByText('Label');
    expect(hiddenLabels).toHaveLength(4);
    hiddenLabels.forEach(element => {
      expect(element).toHaveClass('opacity-0');
    });
  });
});