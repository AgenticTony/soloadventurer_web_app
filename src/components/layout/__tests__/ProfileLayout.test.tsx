import { render, screen, fireEvent } from '@testing-library/react'
import { useRouter, usePathname } from 'next/navigation'
import { ProfileLayout } from '../ProfileLayout'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}))

// Mock child components
jest.mock('../Header', () => ({
  Header: ({ onMenuToggle }: { onMenuToggle: () => void }) => (
    <div data-testid="header">
      <button onClick={onMenuToggle}>Menu</button>
    </div>
  ),
}))

jest.mock('../BottomTabBar', () => ({
  BottomTabBar: ({
    activeTab,
    onTabChange,
  }: {
    activeTab: string
    onTabChange: (tab: string) => void
  }) => (
    <div data-testid="bottom-tab-bar">
      <div data-testid="active-tab">{activeTab}</div>
      <button onClick={() => onTabChange('feed')}>Feed</button>
      <button onClick={() => onTabChange('profile')}>Profile</button>
    </div>
  ),
}))

describe('ProfileLayout', () => {
  const mockPush = jest.fn()
  const mockUsePathname = usePathname as jest.Mock
  const mockUseRouter = useRouter as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseRouter.mockReturnValue({
      push: mockPush,
    })
  })

  it('renders layout components correctly', () => {
    mockUsePathname.mockReturnValue('/profile')

    render(
      <ProfileLayout>
        <div>Profile content</div>
      </ProfileLayout>
    )

    expect(screen.getByTestId('header')).toBeInTheDocument()
    expect(screen.getByTestId('bottom-tab-bar')).toBeInTheDocument()
    expect(screen.getByText('Profile content')).toBeInTheDocument()
  })

  it('determines active tab correctly from pathname', () => {
    mockUsePathname.mockReturnValue('/profile')

    render(
      <ProfileLayout>
        <div>Profile content</div>
      </ProfileLayout>
    )

    expect(screen.getByTestId('active-tab')).toHaveTextContent('profile')
  })

  it('handles tab navigation', () => {
    mockUsePathname.mockReturnValue('/')

    render(
      <ProfileLayout>
        <div>Content</div>
      </ProfileLayout>
    )

    const profileButton = screen.getByText('Profile')
    fireEvent.click(profileButton)

    expect(mockPush).toHaveBeenCalledWith('/profile')
  })

  it('handles feed tab navigation', () => {
    mockUsePathname.mockReturnValue('/profile')

    render(
      <ProfileLayout>
        <div>Content</div>
      </ProfileLayout>
    )

    const feedButton = screen.getByText('Feed')
    fireEvent.click(feedButton)

    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('correctly maps different pathnames to tabs', () => {
    const testCases = [
      { pathname: '/', expected: 'feed' },
      { pathname: '/trips', expected: 'trips' },
      { pathname: '/cities', expected: 'cities' },
      { pathname: '/messages', expected: 'messages' },
      { pathname: '/profile', expected: 'profile' },
      { pathname: '/profile/settings', expected: 'profile' },
    ]

    testCases.forEach(({ pathname, expected }) => {
      mockUsePathname.mockReturnValue(pathname)

      const { unmount } = render(
        <ProfileLayout>
          <div>Content</div>
        </ProfileLayout>
      )

      expect(screen.getByTestId('active-tab')).toHaveTextContent(expected)
      unmount()
    })
  })
})
