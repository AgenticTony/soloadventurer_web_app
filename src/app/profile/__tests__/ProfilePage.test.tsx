import { render, screen, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import ProfilePage from '../page'
import { GET_USER, LIST_USER_TRIPS } from '@/graphql/queries'

// Mock the AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      emailVerified: true,
      createdAt: '2024-01-01T00:00:00Z'
    },
    isAuthenticated: true,
    isLoading: false,
  })
}))

// Mock the layout and complex components
jest.mock('@/components/layout/ProfileLayout', () => ({
  ProfileLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}))

jest.mock('@/components/features/profile/WorldMap', () => ({
  WorldMap: () => <div data-testid="world-map">World Map</div>
}))

jest.mock('@/components/features/profile/AchievementGrid', () => ({
  AchievementGrid: () => <div data-testid="achievement-grid">Achievement Grid</div>
}))

jest.mock('@/components/features/profile/ProfileCompletionTracker', () => ({
  ProfileCompletionTracker: () => <div data-testid="profile-completion">Profile Completion</div>
}))

const userMocks = [
  {
    request: {
      query: GET_USER,
      variables: { id: '1' }
    },
    result: {
      data: {
        getUser: {
          __typename: 'User',
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          avatar: null,
          bio: 'Test bio',
          location: 'Test Location',
          emailVerified: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          travelStyle: null,
          preferences: null
        }
      }
    }
  },
  {
    request: {
      query: LIST_USER_TRIPS,
      variables: { ownerId: '1', limit: 10 }
    },
    result: {
      data: {
        listTrips: {
          __typename: 'TripConnection',
          items: [
            {
              __typename: 'Trip',
              id: '1',
              title: 'Test Trip',
              description: 'A test trip description',
              status: 'completed',
              startDate: '2024-01-01',
              endDate: '2024-01-07',
              destination: {
                __typename: 'Destination',
                id: '1',
                country: 'Test Country',
                city: 'Test City'
              },
              createdAt: '2024-01-01T00:00:00Z'
            }
          ],
          nextToken: null
        }
      }
    }
  }
]

describe('ProfilePage', () => {
  it('renders user profile with GraphQL data', async () => {
    render(
      <MockedProvider mocks={userMocks} >
        <ProfilePage />
      </MockedProvider>
    )

    // Check that user name is displayed
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument()
    })

    // Check that profile components are rendered
    expect(screen.getByTestId('world-map')).toBeInTheDocument()
    expect(screen.getByTestId('achievement-grid')).toBeInTheDocument()
    expect(screen.getByTestId('profile-completion')).toBeInTheDocument()
  })

  it('displays user trips in adventures tab', async () => {
    render(
      <MockedProvider mocks={userMocks} >
        <ProfilePage />
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Test Trip')).toBeInTheDocument()
      expect(screen.getByText('A test trip description')).toBeInTheDocument()
      expect(screen.getByText('Test City, Test Country')).toBeInTheDocument()
      expect(screen.getByText('completed')).toBeInTheDocument()
    })
  })

  it('shows correct adventure count in stats', async () => {
    render(
      <MockedProvider mocks={userMocks} >
        <ProfilePage />
      </MockedProvider>
    )

    await waitFor(() => {
      // The Adventures stat should show 1 (from the mock trip)
      const adventuresStats = screen.getByText('Adventures').closest('div')
      expect(adventuresStats).toContainHTML('1')
    })
  })

  it('handles empty trips state', async () => {
    const emptyTripsMocks = [
      userMocks[0], // Keep user data
      {
        request: {
          query: LIST_USER_TRIPS,
          variables: { ownerId: '1', limit: 10 }
        },
        result: {
          data: {
            listTrips: {
              __typename: 'TripConnection',
              items: [],
              nextToken: null
            }
          }
        }
      }
    ]

    render(
      <MockedProvider mocks={emptyTripsMocks} >
        <ProfilePage />
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('No Adventures Yet')).toBeInTheDocument()
      expect(screen.getByText('Start your journey by sharing your first travel story!')).toBeInTheDocument()
    })
  })
})