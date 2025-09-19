import { gql } from '@apollo/client'

export const GET_USER = gql`
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      email
      name
      createdAt
      updatedAt
    }
  }
`

export const GET_USER_BY_EMAIL = gql`
  query GetUserByEmail($email: String!) {
    listUsers(filter: { email: { eq: $email } }) {
      items {
        id
        email
        name
        createdAt
        updatedAt
      }
    }
  }
`

export const LIST_USERS = gql`
  query ListUsers($limit: Int, $nextToken: String) {
    listUsers(limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        email
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`

export const GET_TRIP = gql`
  query GetTrip($id: ID!) {
    getTrip(id: $id) {
      id
      title
      description
      startDate
      endDate
      isPrivate
      ownerId
      createdAt
      updatedAt
    }
  }
`

export const LIST_USER_TRIPS = gql`
  query ListUserTrips($ownerId: String!, $limit: Int, $nextToken: String) {
    listTrips(
      filter: { ownerId: { eq: $ownerId } }
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        title
        description
        startDate
        endDate
        isPrivate
        ownerId
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`

// Temporarily removed - TripStatistics type not in schema
// export const GET_TRIP_STATISTICS = gql`
//   query GetTripStatistics($tripId: ID!) {
//     getTripStatistics(tripId: $tripId) {
//       totalExpenses
//       averageDailyExpense
//       expenseByCategory {
//         category
//         total
//         percentage
//       }
//       travelersCount
//       postsCount
//       itineraryItemsCount
//     }
//   }
// `

// Temporarily removed - TripPost type not in schema
// export const GET_POST = gql`
//   query GetPost($id: ID!) {
//     getTripPost(id: $id) {
//       id
//       title
//       content
//       location
//       tags
//       isPublic
//       createdAt
//       updatedAt
//       user {
//         id
//         name
//         avatar
//       }
//       trip {
//         id
//         title
//       }
//       images {
//         items {
//           id
//           url
//           caption
//           order
//         }
//       }
//       likes {
//         items {
//           id
//           user {
//             id
//             name
//             avatar
//           }
//           createdAt
//         }
//       }
//       comments {
//         items {
//           id
//           content
//           createdAt
//           user {
//             id
//             name
//             avatar
//           }
//           likes {
//             items {
//               id
//               user {
//                 id
//               }
//             }
//           }
//         }
//       }
//     }
//   }
// `

// Temporarily removed - TripPost type not in schema
// export const LIST_TRIP_POSTS = gql`
//   query ListTripPosts($tripId: ID!, $limit: Int, $nextToken: String) {
//     listTripPosts(
//       filter: { tripId: { eq: $tripId } }
//       limit: $limit
//       nextToken: $nextToken
//     ) {
//       items {
//         id
//         title
//         content
//         location
//         tags
//         isPublic
//         createdAt
//         user {
//           id
//           name
//           avatar
//         }
//       }
//       nextToken
//     }
//   }
// `

// Temporarily removed - getUserFeed query not in schema
// export const GET_USER_FEED = gql`
//   query GetUserFeed($limit: Int, $nextToken: String) {
//     getUserFeed(limit: $limit, nextToken: $nextToken) {
//       id
//       title
//       content
//       location
//       tags
//       isPublic
//       createdAt
//       user {
//         id
//         name
//         avatar
//       }
//       trip {
//         id
//         title
//       }
//     }
//   }
// `

// Temporarily removed - Expense type not in schema
// export const GET_EXPENSE = gql`
//   query GetExpense($id: ID!) {
//     getExpense(id: $id) {
//       id
//       category
//       amount
//       currency
//       description
//       date
//       paidBy
//       splitBetween
//       createdAt
//       updatedAt
//       user {
//         id
//         name
//         avatar
//       }
//       trip {
//         id
//         title
//       }
//       receipts {
//         items {
//           id
//           url
//           filename
//           uploadedAt
//         }
//       }
//     }
//   }
// `

// Temporarily removed - Expense type not in schema
// export const LIST_TRIP_EXPENSES = gql`
//   query ListTripExpenses($tripId: ID!, $limit: Int, $nextToken: String) {
//     listExpenses(
//       filter: { tripId: { eq: $tripId } }
//       limit: $limit
//       nextToken: $nextToken
//     ) {
//       items {
//         id
//         category
//         amount
//         currency
//         description
//         date
//         paidBy
//         createdAt
//         user {
//           id
//           name
//           avatar
//         }
//       }
//       nextToken
//     }
//   }
// `

// Temporarily removed - searchUsers query not in schema
// export const SEARCH_USERS = gql`
//   query SearchUsers($query: String!, $limit: Int) {
//     searchUsers(query: $query, limit: $limit) {
//       id
//       name
//       avatar
//       bio
//       location
//     }
//   }
// `

// Temporarily removed - searchTrips query not in schema
// export const SEARCH_TRIPS = gql`
//   query SearchTrips($query: String!, $limit: Int) {
//     searchTrips(query: $query, limit: $limit) {
//       id
//       title
//       description
//       destination {
//         country
//         city
//       }
//       user {
//         id
//         name
//         avatar
//       }
//       isPublic
//       createdAt
//     }
//   }
// `