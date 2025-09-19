import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink, NormalizedCacheObject } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { fetchAuthSession } from 'aws-amplify/auth'
import outputs from '../../amplify_outputs.json'

export type RedirectFn = (url: string) => void

const defaultRedirect: RedirectFn = (url) => {
  if (typeof window !== 'undefined') {
    window.location.assign(url)
  }
}

export function makeApolloClient(redirect: RedirectFn = defaultRedirect): ApolloClient<NormalizedCacheObject> {
  // Note: Amplify is configured in AmplifyProvider to ensure SSR compatibility

  const httpLink = createHttpLink({
    uri: outputs.data.url,
  })

  const authLink = setContext(async (_, { headers }) => {
    try {
      const session = await fetchAuthSession()
      const token = session.tokens?.idToken?.toString()

      return {
        headers: {
          ...headers,
          authorization: token ? `Bearer ${token}` : '',
        },
      }
    } catch (e) {
      console.error('Error getting auth token:', e)
      return {
        headers,
      }
    }
  })

  const createErrorLink = (redirectFn: RedirectFn) => onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path, extensions }) => {
        console.error(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
        )

        if (extensions?.code === 'UNAUTHENTICATED') {
          redirectFn('/login')
        }
      })
    }

    if (networkError) {
      console.error(`[Network error]: ${networkError}`)
      if ('statusCode' in networkError && networkError.statusCode === 401) {
        redirectFn('/login')
      }
    }
  })

  const errorLink = createErrorLink(redirect)

  return new ApolloClient({
    link: ApolloLink.from([errorLink, authLink.concat(httpLink)]),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            getUserFeed: {
              merge: (existing = [], incoming) => {
                return [...existing, ...incoming]
              }
            },
            listTripPosts: {
              keyArgs: ['tripId'],
              merge: (existing = { items: [] }, incoming = { items: [] }) => {
                return {
                  ...incoming,
                  items: [...existing.items, ...incoming.items],
                }
              }
            }
          }
        },
        TripPost: {
          fields: {
            likes: {
              merge: (existing = [], incoming) => {
                return [...existing, ...incoming]
              }
            },
            comments: {
              merge: (existing = [], incoming) => {
                return [...existing, ...incoming]
              }
            }
          }
        },
        PostComment: {
          fields: {
            likes: {
              merge: (existing = [], incoming) => {
                return [...existing, ...incoming]
              }
            }
          }
        }
      }
    }),
    defaultOptions: {
      watchQuery: {
        errorPolicy: 'all'
      },
      query: {
        errorPolicy: 'all'
      }
    },
    ssrMode: typeof window === 'undefined'
  })
}

// Default client instance for backwards compatibility and simple usage
const client = makeApolloClient()

export default client