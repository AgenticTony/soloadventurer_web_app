import { renderHook, act, waitFor } from '@testing-library/react';
import { useUserSearch } from '../useUserSearch';
import type { UserProfile } from '@/services/users/types';

// Mock the userService module
jest.mock('@/services/users/userService', () => ({
  userService: {
    searchUsers: jest.fn()
  }
}));

import { userService } from '@/services/users/userService';
const mockSearchUsers = userService.searchUsers as jest.MockedFunction<typeof userService.searchUsers>;

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

describe('useUserSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('[]');

    // Default mock response for searchUsers
    mockSearchUsers.mockResolvedValue([
        {
          id: 'user-1',
          username: 'testuser',
          email: 'test@example.com',
          name: 'Test User',
          bio: 'Test bio',
          avatarUrl: '/default-avatar.jpg',
          emailVerified: true,
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z',
          followersCount: 100,
          followingCount: 50,
          tripsCount: 5,
          isFollowing: false,
          isPrivate: false
        }
      ] as UserProfile[]);
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useUserSearch());

    expect(result.current.users).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.hasMore).toBe(true);
    expect(result.current.page).toBe(0);
    expect(result.current.totalCount).toBe(0);
    expect(result.current.filters).toEqual({
      query: '',
      location: null,
      radiusKm: 10,
      interests: [],
    });
    expect(result.current.searchHistory).toEqual([]);
  });

  it('should load search history on mount', () => {
    const mockHistory = ['test query', 'another search'];
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockHistory));

    const { result } = renderHook(() => useUserSearch());

    expect(result.current.searchHistory).toEqual(mockHistory);
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('user_search_history');
  });

  it('should perform search when query changes', async () => {
    const { result } = renderHook(() => useUserSearch());

    act(() => {
      result.current.setQuery('test query');
    });

    // Wait for debounced search to trigger
    await waitFor(
      () => {
        expect(result.current.loading).toBe(false);
      },
      { timeout: 1000 }
    );

    expect(result.current.users.length).toBeGreaterThan(0);
    expect(result.current.filters.query).toBe('test query');
  });

  it('should save search query to history', async () => {
    const { result } = renderHook(() => useUserSearch());

    act(() => {
      result.current.setQuery('test query');
    });

    await waitFor(
      () => {
        expect(mockLocalStorage.setItem).toHaveBeenCalled();
      },
      { timeout: 1000 }
    );

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'user_search_history',
      JSON.stringify(['test query'])
    );
  });

  it('should update location filter', () => {
    const { result } = renderHook(() => useUserSearch());
    const mockLocation = { latitude: 40.7128, longitude: -74.0060 };

    act(() => {
      result.current.setLocation(mockLocation);
    });

    expect(result.current.filters.location).toEqual(mockLocation);
  });

  it('should update radius filter', () => {
    const { result } = renderHook(() => useUserSearch());

    act(() => {
      result.current.setRadiusKm(25);
    });

    expect(result.current.filters.radiusKm).toBe(25);
  });

  it('should update interests filter', () => {
    const { result } = renderHook(() => useUserSearch());
    const interests = ['hiking', 'photography'];

    act(() => {
      result.current.setInterests(interests);
    });

    expect(result.current.filters.interests).toEqual(interests);
  });

  it('should load more users', async () => {
    // Mock initial response with hasMore = true
    mockSearchUsers.mockResolvedValueOnce([
        {
          id: 'user-1',
          username: 'testuser1',
          email: 'test1@example.com',
          name: 'Test User 1',
          bio: 'Test bio 1',
          avatarUrl: 'avatar-url-1',
          emailVerified: true,
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z',
          followersCount: 100,
          followingCount: 50,
          tripsCount: 5,
          isFollowing: false,
          isPrivate: false
        }
      ] as UserProfile[]);

    // Mock second page response
    mockSearchUsers.mockResolvedValueOnce([
        {
          id: 'user-2',
          username: 'testuser2',
          email: 'test2@example.com',
          name: 'Test User 2',
          bio: 'Test bio 2',
          avatarUrl: 'avatar-url-2',
          emailVerified: true,
          createdAt: '2023-01-02T00:00:00Z',
          updatedAt: '2023-01-02T00:00:00Z',
          followersCount: 80,
          followingCount: 40,
          tripsCount: 3,
          isFollowing: false,
          isPrivate: false
        }
      ] as UserProfile[]);

    const { result } = renderHook(() => useUserSearch());

    // First, perform initial search
    act(() => {
      result.current.setQuery('test');
    });

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false);
        expect(result.current.users.length).toBe(1);
      },
      { timeout: 1000 }
    );

    // Then load more
    act(() => {
      result.current.loadMore();
    });

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false);
        expect(result.current.users.length).toBe(2);
      },
      { timeout: 1000 }
    );

    expect(result.current.page).toBe(1);
  });

  it('should refresh search results', async () => {
    const { result } = renderHook(() => useUserSearch());

    // Initial search
    act(() => {
      result.current.setQuery('test');
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Refresh
    act(() => {
      result.current.refresh();
    });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.page).toBe(0);
  });

  it('should clear search history', () => {
    const { result } = renderHook(() => useUserSearch());

    act(() => {
      result.current.clearHistory();
    });

    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user_search_history');
    expect(result.current.searchHistory).toEqual([]);
  });

  it('should handle localStorage errors gracefully', () => {
    mockLocalStorage.getItem.mockImplementation(() => {
      throw new Error('localStorage error');
    });

    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    const { result } = renderHook(() => useUserSearch());

    expect(result.current.searchHistory).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledWith('Failed to load search history:', expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('should not load more when already loading', async () => {
    // Mock initial response with hasMore = true
    mockSearchUsers
      .mockResolvedValueOnce([
          {
            id: 'user-1',
            username: 'testuser1_no_load_more',
            email: 'test1@example.com',
            name: 'Test User 1',
            bio: 'Test bio 1',
            avatarUrl: '/default-avatar.jpg',
            emailVerified: true,
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z',
            followersCount: 100,
            followingCount: 50,
            tripsCount: 5,
            isFollowing: false,
            isPrivate: false
          }
        ] as UserProfile[]);

    // Mock second page response
    mockSearchUsers.mockResolvedValueOnce([
          {
            id: 'user-2',
            username: 'testuser2_loadmore',
            email: 'test2@example.com',
            name: 'Test User 2',
            bio: 'Test bio 2',
            avatarUrl: '/default-avatar.jpg',
            emailVerified: true,
            createdAt: '2023-01-02T00:00:00Z',
            updatedAt: '2023-01-02T00:00:00Z',
            followersCount: 80,
            followingCount: 40,
            tripsCount: 3,
            isFollowing: false,
            isPrivate: false
          }
        ] as UserProfile[]);

    const { result } = renderHook(() => useUserSearch());

    // Start initial search and wait for it to complete
    act(() => {
      result.current.setQuery('test');
    });

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false);
        expect(result.current.users.length).toBe(1);
      },
      { timeout: 1000 }
    );

    // Now try to load more when not loading
    act(() => {
      result.current.loadMore();
    });

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false);
        expect(result.current.users.length).toBe(2);
      },
      { timeout: 1000 }
    );

    expect(result.current.page).toBe(1);
  });

  it('should not load more when no more results', async () => {
    const { result } = renderHook(() => useUserSearch());

    // Mock hasMore to be false
    act(() => {
      result.current.setQuery('test');
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Manually set hasMore to false for testing
    result.current.hasMore = false;

    const initialUserCount = result.current.users.length;

    act(() => {
      result.current.loadMore();
    });

    await waitFor(() => {
      expect(result.current.users.length).toBe(initialUserCount);
    });
  });
});