import { gql } from '@apollo/client'

export const CREATE_USER = gql`
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
`

export const UPDATE_USER = gql`
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
`

export const DELETE_USER = gql`
  mutation DeleteUser($input: DeleteUserInput!) {
    deleteUser(input: $input) {
      id
    }
  }
`

export const CREATE_TRIP = gql`
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
`

export const UPDATE_TRIP = gql`
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
`

export const DELETE_TRIP = gql`
  mutation DeleteTrip($input: DeleteTripInput!) {
    deleteTrip(input: $input) {
      id
    }
  }
`

export const CREATE_POST = gql`
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
`

export const UPDATE_POST = gql`
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
`

export const DELETE_POST = gql`
  mutation DeletePost($input: DeleteTripPostInput!) {
    deleteTripPost(input: $input) {
      id
    }
  }
`

export const LIKE_POST = gql`
  mutation LikePost($input: CreatePostLikeInput!) {
    createPostLike(input: $input) {
      id
      postId
      userId
      createdAt
    }
  }
`

export const UNLIKE_POST = gql`
  mutation UnlikePost($input: DeletePostLikeInput!) {
    deletePostLike(input: $input) {
      id
    }
  }
`

export const CREATE_EXPENSE = gql`
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
`

export const UPDATE_EXPENSE = gql`
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
`

export const DELETE_EXPENSE = gql`
  mutation DeleteExpense($input: DeleteExpenseInput!) {
    deleteExpense(input: $input) {
      id
    }
  }
`