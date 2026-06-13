import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { UserCard, UserCardSkeleton } from '../UserCard'
import type { UserProfile, UserStats } from '@/types/user'

// ── Mocks for connection error toast tests ──────────────────────

const mockRequestConnection = jest.fn()
jest.mock('@/lib/api/matching', () => ({
  requestConnection: (...args: unknown[]) => mockRequestConnection(...args),
}))

const mockToastError = jest.fn()
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    error: (...args: unknown[]) => mockToastError(...args),
    success: jest.fn(),
  },
  Toaster: () => null,
}))

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

const mockCurrentUser: UserProfile = {
  id: 'current-user-id',
  name: 'Current User',
  email: 'current@example.com',
  emailVerified: true,
  bio: 'Test bio',
  avatar: undefined,
  isOnline: true,
  isVerified: false,
  stats: { tripsCount: 1, followersCount: 0, followingCount: 0, placesVisited: 0 },
}

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: mockCurrentUser }),
}))

describe('UserCard', () => {
  const mockStats: UserStats = {
    tripsCount: 12,
    followersCount: 345,
    followingCount: 123,
    placesVisited: 28,
  }

  const mockUser: UserProfile = {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    emailVerified: true,
    bio: 'Travel enthusiast exploring the world one adventure at a time.',
    avatar: 'https://example.com/avatar.jpg',
    isOnline: true,
    isVerified: true,
    stats: mockStats,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render user card with all elements', () => {
    render(<UserCard user={mockUser} />)

    expect(screen.getByRole('article')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText(mockUser.bio!)).toBeInTheDocument()
    expect(screen.getByLabelText('Verified traveler')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument() // trips count
    expect(screen.getByText('345')).toBeInTheDocument() // followers count
  })

  it('should render without stats when showStats is false', () => {
    render(<UserCard user={mockUser} showStats={false} />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.queryByText('12')).not.toBeInTheDocument()
    expect(screen.queryByText('Trips')).not.toBeInTheDocument()
  })

  it('should handle user without bio', () => {
    const userWithoutBio = { ...mockUser, bio: undefined }
    render(<UserCard user={userWithoutBio} />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.queryByText(/Travel enthusiast/)).not.toBeInTheDocument()
  })

  it('should handle unverified user', () => {
    const unverifiedUser = { ...mockUser, isVerified: false }
    render(<UserCard user={unverifiedUser} />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.queryByLabelText('Verified traveler')).not.toBeInTheDocument()
  })

  it('should show last seen for offline user', () => {
    const offlineUser = { ...mockUser, isOnline: false, lastSeen: '2h ago' }
    render(<UserCard user={offlineUser} />)

    expect(screen.getByText('Last seen 2h ago')).toBeInTheDocument()
  })

  it('should not show last seen for online user', () => {
    render(<UserCard user={mockUser} />)

    expect(screen.queryByText(/Last seen/)).not.toBeInTheDocument()
  })

  it('should render different sizes correctly', () => {
    const { rerender } = render(<UserCard user={mockUser} size="small" />)
    let container = screen.getByRole('article')
    expect(container).toHaveClass('p-3')

    rerender(<UserCard user={mockUser} size="medium" />)
    container = screen.getByRole('article')
    expect(container).toHaveClass('p-4')

    rerender(<UserCard user={mockUser} size="large" />)
    container = screen.getByRole('article')
    expect(container).toHaveClass('p-6')
  })

  it('should apply custom className', () => {
    render(<UserCard user={mockUser} className="custom-class" />)
    const container = screen.getByRole('article')
    expect(container).toHaveClass('custom-class')
  })

  it('should render skeleton when loading', () => {
    const { container } = render(<UserCard user={mockUser} isLoading={true} />)

    // The actual user name should not be visible (skeleton shows hidden placeholder)
    expect(screen.queryByDisplayValue('John Doe')).not.toBeInTheDocument()
    const article = container.querySelector('[role="article"]')
    expect(article).toHaveAttribute('aria-hidden', 'true')
  })

  // ── Connection error toast tests (Epic 2) ──────────────────────

  describe('connection actions with error handling', () => {
    it('shows Connect button when showActions=true and viewing another user', () => {
      render(<UserCard user={mockUser} showActions={true} />)

      expect(screen.getByText('Say hi')).toBeInTheDocument()
    })

    it('shows toast.error when connection request fails', async () => {
      mockRequestConnection.mockRejectedValue(new Error('Already connected with this user'))

      render(<UserCard user={mockUser} showActions={true} />)

      const connectButton = screen.getByText('Say hi')
      fireEvent.click(connectButton)

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Already connected with this user')
      })
    })

    it('shows toast.error with default message on non-Error rejection', async () => {
      mockRequestConnection.mockRejectedValue('string error')

      render(<UserCard user={mockUser} showActions={true} />)

      const connectButton = screen.getByText('Say hi')
      fireEvent.click(connectButton)

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Failed to send connection request')
      })
    })

    it('shows Message button after successful connection', async () => {
      mockRequestConnection.mockResolvedValue({ id: 'conn-1' })

      render(<UserCard user={mockUser} showActions={true} />)

      const connectButton = screen.getByText('Say hi')
      fireEvent.click(connectButton)

      await waitFor(() => {
        expect(screen.getByText('Message')).toBeInTheDocument()
      })
      expect(screen.queryByText('Say hi')).not.toBeInTheDocument()
    })

    it('shows Connecting... while request is in flight', async () => {
      let resolveConnection: (value: unknown) => void
      mockRequestConnection.mockReturnValue(
        new Promise(resolve => {
          resolveConnection = resolve
        })
      )

      render(<UserCard user={mockUser} showActions={true} />)

      const connectButton = screen.getByText('Say hi')
      fireEvent.click(connectButton)

      await waitFor(() => {
        expect(screen.getByText('Connecting...')).toBeInTheDocument()
      })

      // Resolve to clean up
      resolveConnection!({ id: 'conn-1' })
      await waitFor(() => {
        expect(screen.getByText('Message')).toBeInTheDocument()
      })
    })
  })
})

describe('UserCardSkeleton', () => {
  it('should render skeleton with stats by default', () => {
    const { container } = render(<UserCardSkeleton />)

    const articleContainer = container.querySelector('[role="article"]')
    expect(articleContainer).toHaveAttribute('aria-hidden', 'true')
    expect(articleContainer!.querySelectorAll('.animate-pulse').length).toBeGreaterThan(8) // Various skeleton elements (avatar, status, name, bio, last seen, stats)
  })

  it('should render skeleton without stats when showStats is false', () => {
    const { container } = render(<UserCardSkeleton showStats={false} />)

    const articleContainer = container.querySelector('[role="article"]')
    expect(articleContainer).toHaveAttribute('aria-hidden', 'true')
    expect(articleContainer!.querySelectorAll('.animate-pulse').length).toBeLessThan(14)
  })

  it('should render skeleton with actions when showActions is true', () => {
    const { container } = render(<UserCardSkeleton showActions={true} />)

    const articleContainer = container.querySelector('[role="article"]')
    const actionSkeletons = articleContainer!.querySelectorAll('.flex.gap-2 > .animate-pulse')
    expect(actionSkeletons).toHaveLength(2) // Follow and Message button skeletons
  })

  it('should apply different sizes correctly', () => {
    const { rerender, container } = render(<UserCardSkeleton size="small" />)
    let articleContainer = container.querySelector('[role="article"]')
    expect(articleContainer).toHaveClass('p-3')

    rerender(<UserCardSkeleton size="medium" />)
    articleContainer = container.querySelector('[role="article"]')
    expect(articleContainer).toHaveClass('p-4')

    rerender(<UserCardSkeleton size="large" />)
    articleContainer = container.querySelector('[role="article"]')
    expect(articleContainer).toHaveClass('p-6')
  })

  it('should apply custom className', () => {
    const { container } = render(<UserCardSkeleton className="custom-skeleton" />)
    const articleContainer = container.querySelector('[role="article"]')
    expect(articleContainer).toHaveClass('custom-skeleton')
  })
})
