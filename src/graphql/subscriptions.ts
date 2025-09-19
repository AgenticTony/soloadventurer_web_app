import { gql } from '@apollo/client'

export const ON_TRIP_UPDATE = gql`
  subscription OnTripUpdate($tripId: ID!) {
    onTripUpdate(tripId: $tripId) {
      id
      title
      status
      updatedAt
    }
  }
`

export const ON_NEW_POST = gql`
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
`

export const ON_NEW_COMMENT = gql`
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
`

export const ON_NEW_FOLLOWER = gql`
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