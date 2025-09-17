import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { Amplify } from 'aws-amplify'
import { fetchAuthSession } from 'aws-amplify/auth'
import outputs from '../../amplify_outputs.json'

Amplify.configure(outputs)

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

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}, Extensions: ${extensions}`
      )
      
      if (extensions?.code === 'UNAUTHENTICATED') {
        // Redirect to login page
        window.location.href = '/login'
      }
    })
  }
  
  if (networkError) {
    console.error(`[Network error]: ${networkError}`)
    if ('statusCode' in networkError && networkError.statusCode === 401) {
      // Redirect to login page
      window.location.href = '/login'
    }
  }
})

const client = new ApolloClient({
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
  }
})

export default client