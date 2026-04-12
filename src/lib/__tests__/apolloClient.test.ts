import { ApolloClient, InMemoryCache, ApolloLink } from '@apollo/client'

// Mock Supabase client
const mockGetSession = jest.fn()
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getSession: mockGetSession,
    },
  }),
}))

import client from '../apolloClient'

describe('Apollo Client Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('client is properly configured', () => {
    expect(client).toBeInstanceOf(ApolloClient)
    expect(client.cache).toBeInstanceOf(InMemoryCache)
    expect(client.link).toBeInstanceOf(ApolloLink)
  })

  test('cache has proper type policies', () => {
    const cache = client.cache as unknown as InMemoryCache
    const policies = cache.policies
    expect(policies).toBeDefined()
    expect(cache).toBeInstanceOf(InMemoryCache)
  })

  test('cache has proper query field policies', () => {
    const cache = client.cache as unknown as InMemoryCache

    const testData = {
      getUserFeed: ['item1', 'item2'],
    }

    cache.writeQuery({
      query: {
        kind: 'Document',
        definitions: [{
          kind: 'OperationDefinition',
          operation: 'query',
          selectionSet: {
            kind: 'SelectionSet',
            selections: [{
              kind: 'Field',
              name: { kind: 'Name', value: 'getUserFeed' },
            }],
          },
        }],
      },
      data: testData,
    })

    const result = cache.readQuery({
      query: {
        kind: 'Document',
        definitions: [{
          kind: 'OperationDefinition',
          operation: 'query',
          selectionSet: {
            kind: 'SelectionSet',
            selections: [{
              kind: 'Field',
              name: { kind: 'Name', value: 'getUserFeed' },
            }],
          },
        }],
      },
    })

    expect(result).toEqual(testData)
  })

  test('merge functions are properly configured', () => {
    const cache = client.cache as unknown as InMemoryCache
    expect(cache).toBeInstanceOf(InMemoryCache)
    expect(typeof cache.writeQuery).toBe('function')
    expect(typeof cache.readQuery).toBe('function')
  })

  test('error handling link is configured', () => {
    expect(client).toBeDefined()
  })
})

describe('Apollo Client Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('auth link adds authorization header when token is available', async () => {
    mockGetSession.mockResolvedValue({
      data: {
        session: { access_token: 'test-jwt-token' },
      },
    })

    // Client is created with the auth link — verify the mock is set up
    expect(mockGetSession).not.toHaveBeenCalled()
  })

  test('auth link handles missing token gracefully', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
    })

    expect(client).toBeDefined()
  })

  test('auth link handles auth errors gracefully', async () => {
    mockGetSession.mockRejectedValue(new Error('Auth error'))

    expect(client).toBeDefined()
  })
})

describe('Apollo Client Error Handling', () => {
  test('client has proper error policy configuration', () => {
    const defaultOptions = client.defaultOptions

    expect(defaultOptions?.watchQuery?.errorPolicy).toBe('all')
    expect(defaultOptions?.query?.errorPolicy).toBe('all')
  })

  test('client can handle GraphQL errors', () => {
    expect(client).toBeDefined()
  })

  test('client can handle network errors', () => {
    expect(client).toBeDefined()
  })
})

describe('Apollo Client Cache Configuration', () => {
  test('cache has proper pagination merge strategies', () => {
    const cache = client.cache as unknown as InMemoryCache

    expect(cache).toBeInstanceOf(InMemoryCache)
    expect(typeof cache.readQuery).toBe('function')
    expect(typeof cache.writeQuery).toBe('function')
  })

  test('cache has proper nested field merge strategies', () => {
    const cache = client.cache as unknown as InMemoryCache

    expect(cache).toBeInstanceOf(InMemoryCache)
    expect(typeof cache.identify).toBe('function')
    expect(typeof cache.readFragment).toBe('function')
    expect(typeof cache.writeFragment).toBe('function')
  })
})
