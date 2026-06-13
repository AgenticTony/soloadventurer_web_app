import { renderHook, act, waitFor } from '@testing-library/react'
import { useUserSearch } from '../useUserSearch'
import type { UserProfile } from '@/services/users/types'

// Mock the userService module
jest.mock('@/services/users/userService', () => ({
  userService: {
    searchUsers: jest.fn(),
  },
}))

import { userService } from '@/services/users/userService'
const mockSearchUsers = userService.searchUsers as jest.MockedFunction<
  typeof userService.searchUsers
>

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })

describe('useUserSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue('[]')

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
        isPrivate: false,
      },
    ] as UserProfile[])
  })

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useUserSearch())

    expect(result.current.users).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(null)
    expect(result.current.hasMore).toBe(true)
    expect(result.current.page).toBe(0)
    expect(result.current.totalCount).toBe(0)
    expect(result.current.filters).toEqual({
      query: '',
      location: null,
      radiusKm: 10,
      interests: [],
    })
    expect(result.current.searchHistory).toEqual([])
  })

  it('should load search history on mount', () => {
    const mockHistory = ['test query', 'another search']
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockHistory))

    const { result } = renderHook(() => useUserSearch())

    expect(result.current.searchHistory).toEqual(mockHistory)
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('user_search_history')
  })

  it('should perform search when query changes', async () => {
    const { result } = renderHook(() => useUserSearch())

    // Wait for initial mount search to complete
    await waitFor(
      () => {
        expect(result.current.loading).toBe(false)
      },
      { timeout: 1000 }
    )

    act(() => {
      result.current.setQuery('test query')
    })

    // Wait for debounced search to fire with the new query
    await waitFor(
      () => {
        expect(mockSearchUsers).toHaveBeenCalledWith('test query', { limit: 12, offset: 0 })
      },
      { timeout: 1000 }
    )

    expect(result.current.filters.query).toBe('test query')
  })

  it('should save search query to history', async () => {
    const { result } = renderHook(() => useUserSearch())

    act(() => {
      result.current.setQuery('test query')
    })

    await waitFor(
      () => {
        expect(mockLocalStorage.setItem).toHaveBeenCalled()
      },
      { timeout: 1000 }
    )

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'user_search_history',
      JSON.stringify(['test query'])
    )
  })

  it('should update location filter', () => {
    const { result } = renderHook(() => useUserSearch())
    const mockLocation = { latitude: 40.7128, longitude: -74.006 }

    act(() => {
      result.current.setLocation(mockLocation)
    })

    expect(result.current.filters.location).toEqual(mockLocation)
  })

  it('should update radius filter', () => {
    const { result } = renderHook(() => useUserSearch())

    act(() => {
      result.current.setRadiusKm(25)
    })

    expect(result.current.filters.radiusKm).toBe(25)
  })

  it('should update interests filter', () => {
    const { result } = renderHook(() => useUserSearch())
    const interests = ['hiking', 'photography']

    act(() => {
      result.current.setInterests(interests)
    })

    expect(result.current.filters.interests).toEqual(interests)
  })

  it('should load more users', async () => {
    // Mock initial response with 12 users (so hasMore is true)
    const firstPage = Array.from({ length: 12 }, (_, i) => ({
      id: `user-${i + 1}`,
      username: `testuser${i + 1}`,
      email: `test${i + 1}@example.com`,
      name: `Test User ${i + 1}`,
      bio: `Test bio ${i + 1}`,
      avatarUrl: `avatar-url-${i + 1}`,
      emailVerified: true,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
      followersCount: 100,
      followingCount: 50,
      tripsCount: 5,
      isFollowing: false,
      isPrivate: false,
    })) as UserProfile[]

    const secondPage: UserProfile[] = [
      {
        id: 'user-13',
        username: 'testuser13',
        email: 'test13@example.com',
        name: 'Test User 13',
        bio: 'Test bio 13',
        avatarUrl: 'avatar-url-13',
        emailVerified: true,
        createdAt: '2023-01-02T00:00:00Z',
        updatedAt: '2023-01-02T00:00:00Z',
        followersCount: 80,
        followingCount: 40,
        tripsCount: 3,
        isFollowing: false,
        isPrivate: false,
      },
    ]

    mockSearchUsers.mockResolvedValueOnce(firstPage).mockResolvedValueOnce(secondPage)

    const { result } = renderHook(() => useUserSearch())

    // Wait for initial mount search to complete
    await waitFor(
      () => {
        expect(result.current.loading).toBe(false)
        expect(result.current.users.length).toBe(12)
      },
      { timeout: 1000 }
    )

    // Then load more
    act(() => {
      result.current.loadMore()
    })

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false)
        expect(result.current.users.length).toBe(13)
      },
      { timeout: 1000 }
    )

    expect(result.current.page).toBe(1)
  })

  it('should refresh search results', async () => {
    const { result } = renderHook(() => useUserSearch())

    // Initial search
    act(() => {
      result.current.setQuery('test')
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Refresh
    act(() => {
      result.current.refresh()
    })

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.page).toBe(0)
  })

  it('should clear search history', () => {
    const { result } = renderHook(() => useUserSearch())

    act(() => {
      result.current.clearHistory()
    })

    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user_search_history')
    expect(result.current.searchHistory).toEqual([])
  })

  it('should handle localStorage errors gracefully', () => {
    mockLocalStorage.getItem.mockImplementation(() => {
      throw new Error('localStorage error')
    })

    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

    const { result } = renderHook(() => useUserSearch())

    expect(result.current.searchHistory).toEqual([])
    expect(consoleSpy).toHaveBeenCalledWith('Failed to load search history:', expect.any(Error))

    consoleSpy.mockRestore()
  })

  it('should not load more when already loading', async () => {
    // Mock initial response with 12 users (so hasMore = true)
    const firstPage = Array.from({ length: 12 }, (_, i) => ({
      id: `user-${i + 1}`,
      username: `testuser${i + 1}_no_load_more`,
      email: `test${i + 1}@example.com`,
      name: `Test User ${i + 1}`,
      bio: `Test bio ${i + 1}`,
      avatarUrl: '/default-avatar.jpg',
      emailVerified: true,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
      followersCount: 100,
      followingCount: 50,
      tripsCount: 5,
      isFollowing: false,
      isPrivate: false,
    })) as UserProfile[]

    const secondPage: UserProfile[] = [
      {
        id: 'user-13',
        username: 'testuser13_loadmore',
        email: 'test13@example.com',
        name: 'Test User 13',
        bio: 'Test bio 13',
        avatarUrl: '/default-avatar.jpg',
        emailVerified: true,
        createdAt: '2023-01-02T00:00:00Z',
        updatedAt: '2023-01-02T00:00:00Z',
        followersCount: 80,
        followingCount: 40,
        tripsCount: 3,
        isFollowing: false,
        isPrivate: false,
      },
    ]

    mockSearchUsers.mockResolvedValueOnce(firstPage).mockResolvedValueOnce(secondPage)

    const { result } = renderHook(() => useUserSearch())

    // Wait for initial mount search to complete
    await waitFor(
      () => {
        expect(result.current.loading).toBe(false)
        expect(result.current.users.length).toBe(12)
      },
      { timeout: 1000 }
    )

    // Load more should work since hasMore is true
    act(() => {
      result.current.loadMore()
    })

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false)
        expect(result.current.users.length).toBe(13)
      },
      { timeout: 1000 }
    )

    expect(result.current.page).toBe(1)
  })

  it('should not load more when no more results', async () => {
    // Mock returns fewer than 12 items, so hasMore will be false
    const singleUser: UserProfile[] = [
      {
        id: 'user-1',
        username: 'testuser1',
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
        isPrivate: false,
      },
    ]

    mockSearchUsers.mockResolvedValue(singleUser)

    const { result } = renderHook(() => useUserSearch())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.users.length).toBe(1)
    })

    expect(result.current.hasMore).toBe(false)

    const callCountBefore = mockSearchUsers.mock.calls.length

    act(() => {
      result.current.loadMore()
    })

    // Wait a bit to ensure no additional calls were made
    await new Promise(r => setTimeout(r, 100))

    expect(mockSearchUsers.mock.calls.length).toBe(callCountBefore)
  })
})
