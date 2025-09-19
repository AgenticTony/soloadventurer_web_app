import { render, screen } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import FeedPage from '../page'

// Mock the AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '1', name: 'Test User', email: 'test@example.com' },
    isAuthenticated: true,
    isLoading: false,
  })
}))

// Mock the PostComposer and PostCard components
jest.mock('@/components/features/feed/PostComposer', () => ({
  PostComposer: () => <div data-testid="post-composer">Post Composer</div>
}))

jest.mock('@/components/features/feed/PostCard', () => ({
  PostCard: ({ id }: { id: string }) => <div data-testid={`post-${id}`}>Post {id}</div>
}))

// No GraphQL mocks needed since feed is using mock data

describe('FeedPage', () => {
  it('renders feed page with empty state', () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <FeedPage />
      </MockedProvider>
    )

    expect(screen.getByText('Your Feed')).toBeInTheDocument()
    expect(screen.getByText('Discover stories from fellow travelers')).toBeInTheDocument()
    expect(screen.getByTestId('post-composer')).toBeInTheDocument()
    expect(screen.getByText('No posts in your feed yet')).toBeInTheDocument()
    expect(screen.getByText('Start following travelers or create your first post to see content here!')).toBeInTheDocument()
  })
})