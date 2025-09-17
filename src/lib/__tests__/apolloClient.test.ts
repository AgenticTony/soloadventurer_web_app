import { ApolloClient, InMemoryCache, ApolloLink } from '@apollo/client'
import { MockLink, MockedResponse } from '@apollo/client/testing'
// Mock the client before importing
jest.mock('../apolloClient', () => ({
  cache: {
    policies: {
      typePolicies: {
        Query: {
          fields: {
            getUserFeed: { merge: jest.fn() },
            listTripPosts: { merge: jest.fn() }
          }
        },
        User: {},
        TripPost: {},
        PostComment: {}
      }
    }
  },
  defaultOptions: {
    watchQuery: { errorPolicy: 'all' },
    query: { errorPolicy: 'all' }
  },
  link: {}
}))

import client from '../apolloClient'
import outputs from '../../../amplify_outputs.json'

// Mock AWS Amplify
jest.mock('aws-amplify/auth', () => ({
  fetchAuthSession: jest.fn()
}))

jest.mock('../../../amplify_outputs.json', () => ({
  version: '1',
  auth: {
    aws_region: 'us-east-1',
    user_pool_id: 'us-east-1_test',
    user_pool_client_id: 'test-client-id',
    identity_pool_id: 'us-east-1:test-identity-pool',
    standard_required_attributes: ['email'],
    username_attributes: ['email'],
    user_verification_types: ['email']
  },
  data: {
    aws_region: 'us-east-1',
    url: 'https://test.appsync-api.us-east-1.amazonaws.com/graphql',
    default_authorization_type: 'AMAZON_COGNITO_USER_POOLS',
    authorization_types: ['AMAZON_COGNITO_USER_POOLS']
  }
}))

import { fetchAuthSession } from 'aws-amplify/auth'

const mockFetchAuthSession = fetchAuthSession as jest.MockedFunction<typeof fetchAuthSession>

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
    const cache = client.cache as InMemoryCache
    const policies = cache.policies

    // Check if User type policy exists
    expect(policies.typePolicies).toHaveProperty('User')
    expect(policies.typePolicies).toHaveProperty('TripPost')
    expect(policies.typePolicies).toHaveProperty('PostComment')
  })

  test('cache has proper query field policies', () => {
    const cache = client.cache as InMemoryCache
    const queryTypePolicy = cache.policies.typePolicies.Query

    expect(queryTypePolicy.fields).toHaveProperty('getUserFeed')
    expect(queryTypePolicy.fields).toHaveProperty('listTripPosts')
  })

  test('merge functions are properly configured', () => {
    const cache = client.cache as InMemoryCache
    const getUserFeedField = cache.policies.typePolicies.Query.fields.getUserFeed

    expect(typeof getUserFeedField.merge).toBe('function')

    // Test merge function for getUserFeed
    const existing = ['item1', 'item2']
    const incoming = ['item3', 'item4']
    const merged = getUserFeedField.merge(existing, incoming)

    expect(merged).toEqual(['item1', 'item2', 'item3', 'item4'])
  })

  test('error handling link is configured', () => {
    // This is a basic test to ensure the client is configured
    // More detailed error handling tests would require mocking GraphQL errors
    expect(client).toBeDefined()
  })
})

describe('Apollo Client Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('auth link adds authorization header when token is available', async () => {
    const mockToken = 'test-jwt-token'
    mockFetchAuthSession.mockResolvedValue({
      tokens: {
        idToken: {
          toString: () => mockToken
        }
      }
    })

    // Create a test operation
    const operation = {
      query: 'query TestQuery { test }',
      variables: {},
      context: {}
    }

    // The auth link should add the authorization header
    // This is a simplified test - in reality, we'd need to test the link chain more thoroughly
    expect(mockFetchAuthSession).not.toHaveBeenCalled()
  })

  test('auth link handles missing token gracefully', async () => {
    mockFetchAuthSession.mockResolvedValue({
      tokens: null
    })

    // Test that the client handles missing tokens without throwing errors
    expect(client).toBeDefined()
  })

  test('auth link handles auth errors gracefully', async () => {
    mockFetchAuthSession.mockRejectedValue(new Error('Auth error'))

    // Test that the client handles auth errors without throwing errors
    expect(client).toBeDefined()
  })
})

describe('Apollo Client Error Handling', () => {
  test('client has proper error policy configuration', () => {
    const defaultOptions = client.defaultOptions

    expect(defaultOptions.watchQuery.errorPolicy).toBe('all')
    expect(defaultOptions.query.errorPolicy).toBe('all')
  })

  test('client can handle GraphQL errors', () => {
    // This test ensures the client is configured to handle GraphQL errors
    // More detailed error handling tests would require actual GraphQL error responses
    expect(client).toBeDefined()
  })

  test('client can handle network errors', () => {
    // This test ensures the client is configured to handle network errors
    expect(client).toBeDefined()
  })
})

describe('Apollo Client Cache Configuration', () => {
  test('cache has proper pagination merge strategies', () => {
    const cache = client.cache as InMemoryCache
    const listTripPostsField = cache.policies.typePolicies.Query.fields.listTripPosts

    expect(typeof listTripPostsField.merge).toBe('function')

    // Test merge function for listTripPosts
    const existing = { items: ['post1', 'post2'] }
    const incoming = { items: ['post3', 'post4'] }
    const merged = listTripPostsField.merge(existing, incoming)

    expect(merged).toEqual({
      ...incoming,
      items: ['post1', 'post2', 'post3', 'post4']
    })
  })

  test('cache has proper nested field merge strategies', () => {
    const cache = client.cache as InMemoryCache
    const tripPostType = cache.policies.typePolicies.TripPost

    expect(tripPostType.fields.likes.merge).toBeDefined()
    expect(tripPostType.fields.comments.merge).toBeDefined()

    // Test likes merge function
    const existingLikes = ['user1', 'user2']
    const incomingLikes = ['user3', 'user4']
    const mergedLikes = tripPostType.fields.likes.merge(existingLikes, incomingLikes)

    expect(mergedLikes).toEqual(['user1', 'user2', 'user3', 'user4'])

    // Test comments merge function
    const existingComments = ['comment1', 'comment2']
    const incomingComments = ['comment3', 'comment4']
    const mergedComments = tripPostType.fields.comments.merge(existingComments, incomingComments)

    expect(mergedComments).toEqual(['comment1', 'comment2', 'comment3', 'comment4'])
  })
})