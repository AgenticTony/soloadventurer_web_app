import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserGrid } from '../UserGrid';
import type { UserProfile } from '@/types/user';

// Mock Intersection Observer
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
});
window.IntersectionObserver = mockIntersectionObserver;

// Mock auth context (required by UserCard for connection actions)
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'test-user' } }),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/lib/api/matching', () => ({
  requestConnection: jest.fn().mockResolvedValue({ id: 'conn-1' }),
}));

describe('UserGrid', () => {
  const mockUsers: UserProfile[] = [
    {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      emailVerified: true,
      avatar: 'https://example.com/john.jpg',
      bio: 'Travel enthusiast',
      isOnline: true,
      isVerified: true,
      stats: {
        tripsCount: 5,
        followersCount: 100,
        followingCount: 50,
        placesVisited: 15,
      },
    },
    {
      id: 'user-2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      emailVerified: true,
      avatar: 'https://example.com/jane.jpg',
      bio: 'Adventure seeker',
      isOnline: false,
      isVerified: false,
      stats: {
        tripsCount: 3,
        followersCount: 75,
        followingCount: 30,
        placesVisited: 8,
      },
    },
  ];

  const defaultProps = {
    users: mockUsers,
    loading: false,
    hasMore: true,
    error: null,
    totalCount: 10,
    onLoadMore: jest.fn(),
    onRefresh: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render users in a grid', () => {
    render(<UserGrid {...defaultProps} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('2 of 10+ travelers')).toBeInTheDocument();
  });

  it('should show empty state when no users found', () => {
    render(
      <UserGrid
        {...defaultProps}
        users={[]}
        totalCount={0}
      />
    );

    expect(screen.getByText('No users found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your search criteria or location filters to find more travelers.')).toBeInTheDocument();
  });

  it('should show error state', () => {
    render(
      <UserGrid
        {...defaultProps}
        users={[]}
        error="Failed to load users"
      />
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Failed to load users')).toBeInTheDocument();
  });

  it('should call onRefresh when refresh button clicked in empty state', () => {
    render(
      <UserGrid
        {...defaultProps}
        users={[]}
        totalCount={0}
      />
    );

    const refreshButton = screen.getByText('Reset Search');
    fireEvent.click(refreshButton);

    expect(defaultProps.onRefresh).toHaveBeenCalled();
  });

  it('should call onRefresh when try again button clicked in error state', () => {
    render(
      <UserGrid
        {...defaultProps}
        users={[]}
        error="Failed to load users"
      />
    );

    const tryAgainButton = screen.getByText('Try Again');
    fireEvent.click(tryAgainButton);

    expect(defaultProps.onRefresh).toHaveBeenCalled();
  });

  it('should show loading skeletons when loading', () => {
    render(
      <UserGrid
        {...defaultProps}
        loading={true}
      />
    );

    // Should show existing users when loading
    expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Jane Smith')[0]).toBeInTheDocument();

    // Check that users are still visible during loading
    const allArticles = screen.getAllByRole('article');
    expect(allArticles.length).toBeGreaterThanOrEqual(2); // At least the 2 users
  });

  it('should show initial loading skeletons when no users yet', () => {
    const { container } = render(
      <UserGrid
        {...defaultProps}
        users={[]}
        loading={true}
      />
    );

    // Should show 8 loading skeletons when no users loaded yet
    const skeletons = container.querySelectorAll('[role="article"][aria-hidden="true"]');
    expect(skeletons).toHaveLength(8);
  });

  it('should show load more button when hasMore is true', () => {
    render(<UserGrid {...defaultProps} />);

    const loadMoreButton = screen.getByText('Load More');
    expect(loadMoreButton).toBeInTheDocument();
  });

  it('should call onLoadMore when load more button clicked', () => {
    render(<UserGrid {...defaultProps} />);

    const loadMoreButton = screen.getByText('Load More');
    fireEvent.click(loadMoreButton);

    expect(defaultProps.onLoadMore).toHaveBeenCalled();
  });

  it('should show loading indicator in load more section when loading', () => {
    render(
      <UserGrid
        {...defaultProps}
        loading={true}
      />
    );

    expect(screen.getByText('Loading more...')).toBeInTheDocument();
  });

  it('should show end of results message when no more users', () => {
    render(
      <UserGrid
        {...defaultProps}
        hasMore={false}
      />
    );

    expect(screen.getByText("You've seen all 2 travelers matching your search")).toBeInTheDocument();
  });

  it('should not show load more section when hasMore is false', () => {
    render(
      <UserGrid
        {...defaultProps}
        hasMore={false}
      />
    );

    expect(screen.queryByText('Load More')).not.toBeInTheDocument();
  });

  it('should display correct total count formatting', () => {
    // Test exact count
    render(
      <UserGrid
        {...defaultProps}
        users={mockUsers}
        totalCount={2}
      />
    );
    expect(screen.getByText('2 of 2 travelers')).toBeInTheDocument();

    // Test with more than current users (showing +)
    render(
      <UserGrid
        {...defaultProps}
        users={mockUsers}
        totalCount={50}
      />
    );
    expect(screen.getByText('2 of 50+ travelers')).toBeInTheDocument();
  });

  it('should show error in results header when error occurs with existing results', () => {
    render(
      <UserGrid
        {...defaultProps}
        error="Connection failed"
      />
    );

    expect(screen.getByText('Connection failed')).toBeInTheDocument();
  });

  it('should set up intersection observer for infinite scroll', () => {
    render(<UserGrid {...defaultProps} />);

    expect(mockIntersectionObserver).toHaveBeenCalled();
    expect(mockIntersectionObserver.mock.calls[0][1]).toEqual({
      threshold: 0.1,
      rootMargin: '100px',
    });
  });

  it('should apply custom className', () => {
    render(<UserGrid {...defaultProps} className="custom-grid" />);

    const container = screen.getByText('John Doe').closest('.custom-grid');
    expect(container).toBeInTheDocument();
  });

  it('should render user cards with correct props', () => {
    render(<UserGrid {...defaultProps} />);

    const userCards = screen.getAllByRole('article');

    // Should have user cards (excluding any skeleton cards)
    expect(userCards.length).toBeGreaterThanOrEqual(mockUsers.length);

    // Check that user cards have hover effect class
    const firstUserCard = userCards[0];
    expect(firstUserCard).toHaveClass('hover:shadow-lg');
  });
});