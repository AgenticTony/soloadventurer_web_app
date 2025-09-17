import { gql } from '@apollo/client'

export const USER_QUERIES = gql`
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      email
      name
      avatar
      bio
      location
      emailVerified
      createdAt
      updatedAt
      travelStyle {
        id
        travelPace
        budget
        accommodationPreference
        diningPreference
        activityPreferences
      }
      preferences {
        id
        language
        currency
        timezone
        notificationSettings {
          emailNotifications
          pushNotifications
          tripReminders
          newMessages
          connectionRequests
        }
        privacySettings {
          profileVisibility
          showEmail
          showLocation
          allowMessages
        }
      }
    }
  }

  query GetUserByEmail($email: String!) {
    userByEmail(email: $email) {
      items {
        id
        email
        name
        avatar
        emailVerified
      }
    }
  }

  query ListUsers($limit: Int, $nextToken: String) {
    listUsers(limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        avatar
        bio
        location
      }
      nextToken
    }
  }
`

export const USER_MUTATIONS = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      email
      name
      emailVerified
      createdAt
      updatedAt
    }
  }

  mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      id
      name
      avatar
      bio
      location
      updatedAt
    }
  }

  mutation DeleteUser($input: DeleteUserInput!) {
    deleteUser(input: $input) {
      id
    }
  }
`

export const TRIP_QUERIES = gql`
  query GetTrip($id: ID!) {
    getTrip(id: $id) {
      id
      title
      description
      status
      startDate
      endDate
      budget
      currency
      isPublic
      user {
        id
        name
        avatar
      }
      destination {
        id
        country
        city
        state
        latitude
        longitude
        timezone
        currency
        language
      }
      travelers {
        items {
          id
          user {
            id
            name
            avatar
          }
          role
          status
          joinedAt
        }
      }
      posts {
        items {
          id
          title
          content
          location
          tags
          isPublic
          createdAt
          user {
            id
            name
            avatar
          }
        }
      }
      expenses {
        items {
          id
          category
          amount
          currency
          description
          date
          paidBy
          createdAt
        }
      }
      itinerary {
        items {
          id
          type
          title
          description
          location
          startTime
          endTime
          cost
          currency
          status
          notes
          order
        }
      }
      createdAt
      updatedAt
    }
  }

  query ListUserTrips($userId: ID!, $limit: Int, $nextToken: String) {
    listTrips(
      filter: { userId: { eq: $userId } }
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        title
        description
        status
        startDate
        endDate
        destination {
          id
          country
          city
        }
        createdAt
      }
      nextToken
    }
  }

  query GetTripStatistics($tripId: ID!) {
    getTripStatistics(tripId: $tripId) {
      totalExpenses
      averageDailyExpense
      expenseByCategory {
        category
        total
        percentage
      }
      travelersCount
      postsCount
      itineraryItemsCount
    }
  }
`

export const TRIP_MUTATIONS = gql`
  mutation CreateTrip($input: CreateTripInput!) {
    createTrip(input: $input) {
      id
      title
      description
      status
      startDate
      endDate
      budget
      currency
      isPublic
      user {
        id
        name
      }
      createdAt
    }
  }

  mutation UpdateTrip($input: UpdateTripInput!) {
    updateTrip(input: $input) {
      id
      title
      description
      status
      startDate
      endDate
      budget
      currency
      isPublic
      updatedAt
    }
  }

  mutation DeleteTrip($input: DeleteTripInput!) {
    deleteTrip(input: $input) {
      id
    }
  }
`

export const POST_QUERIES = gql`
  query GetPost($id: ID!) {
    getTripPost(id: $id) {
      id
      title
      content
      location
      tags
      isPublic
      createdAt
      updatedAt
      user {
        id
        name
        avatar
      }
      trip {
        id
        title
      }
      images {
        items {
          id
          url
          caption
          order
        }
      }
      likes {
        items {
          id
          user {
            id
            name
            avatar
          }
          createdAt
        }
      }
      comments {
        items {
          id
          content
          createdAt
          user {
            id
            name
            avatar
          }
          likes {
            items {
              id
              user {
                id
              }
            }
          }
        }
      }
    }
  }

  query ListTripPosts($tripId: ID!, $limit: Int, $nextToken: String) {
    listTripPosts(
      filter: { tripId: { eq: $tripId } }
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        title
        content
        location
        tags
        isPublic
        createdAt
        user {
          id
          name
          avatar
        }
      }
      nextToken
    }
  }

  query GetUserFeed($limit: Int, $nextToken: String) {
    getUserFeed(limit: $limit, nextToken: $nextToken) {
      id
      title
      content
      location
      tags
      isPublic
      createdAt
      user {
        id
        name
        avatar
      }
      trip {
        id
        title
      }
    }
  }
`

export const POST_MUTATIONS = gql`
  mutation CreatePost($input: CreateTripPostInput!) {
    createTripPost(input: $input) {
      id
      title
      content
      location
      tags
      isPublic
      createdAt
      user {
        id
        name
      }
      trip {
        id
        title
      }
    }
  }

  mutation UpdatePost($input: UpdateTripPostInput!) {
    updateTripPost(input: $input) {
      id
      title
      content
      location
      tags
      isPublic
      updatedAt
    }
  }

  mutation DeletePost($input: DeleteTripPostInput!) {
    deleteTripPost(input: $input) {
      id
    }
  }

  mutation LikePost($input: CreatePostLikeInput!) {
    createPostLike(input: $input) {
      id
      postId
      userId
      createdAt
    }
  }

  mutation UnlikePost($input: DeletePostLikeInput!) {
    deletePostLike(input: $input) {
      id
    }
  }
`

export const EXPENSE_QUERIES = gql`
  query GetExpense($id: ID!) {
    getExpense(id: $id) {
      id
      category
      amount
      currency
      description
      date
      paidBy
      splitBetween
      createdAt
      updatedAt
      user {
        id
        name
        avatar
      }
      trip {
        id
        title
      }
      receipts {
        items {
          id
          url
          filename
          uploadedAt
        }
      }
    }
  }

  query ListTripExpenses($tripId: ID!, $limit: Int, $nextToken: String) {
    listExpenses(
      filter: { tripId: { eq: $tripId } }
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        category
        amount
        currency
        description
        date
        paidBy
        createdAt
        user {
          id
          name
          avatar
        }
      }
      nextToken
    }
  }
`

export const EXPENSE_MUTATIONS = gql`
  mutation CreateExpense($input: CreateExpenseInput!) {
    createExpense(input: $input) {
      id
      category
      amount
      currency
      description
      date
      paidBy
      splitBetween
      createdAt
      user {
        id
        name
      }
      trip {
        id
        title
      }
    }
  }

  mutation UpdateExpense($input: UpdateExpenseInput!) {
    updateExpense(input: $input) {
      id
      category
      amount
      currency
      description
      date
      paidBy
      splitBetween
      updatedAt
    }
  }

  mutation DeleteExpense($input: DeleteExpenseInput!) {
    deleteExpense(input: $input) {
      id
    }
  }
`

export const SUBSCRIPTIONS = gql`
  subscription OnTripUpdate($tripId: ID!) {
    onTripUpdate(tripId: $tripId) {
      id
      title
      status
      updatedAt
    }
  }

  subscription OnNewPost($tripId: ID!) {
    onNewPost(tripId: $tripId) {
      id
      title
      content
      location
      isPublic
      createdAt
      user {
        id
        name
        avatar
      }
    }
  }

  subscription OnNewComment($postId: ID!) {
    onNewComment(postId: $postId) {
      id
      content
      createdAt
      user {
        id
        name
        avatar
      }
    }
  }

  subscription OnNewFollower($userId: ID!) {
    onNewFollower(userId: $userId) {
      id
      followingUser {
        id
        name
        avatar
      }
      followedUser {
        id
        name
        avatar
      }
      status
      createdAt
    }
  }
`

export const SEARCH_QUERIES = gql`
  query SearchUsers($query: String!, $limit: Int) {
    searchUsers(query: $query, limit: $limit) {
      id
      name
      avatar
      bio
      location
    }
  }

  query SearchTrips($query: String!, $limit: Int) {
    searchTrips(query: $query, limit: $limit) {
      id
      title
      description
      destination {
        country
        city
      }
      user {
        id
        name
        avatar
      }
      isPublic
      createdAt
    }
  }
`