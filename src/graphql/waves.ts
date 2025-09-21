import { gql } from '@apollo/client';

// Wave Queries
export const GET_WAVES_BY_USER = gql`
  query GetWavesByUser($userId: ID!, $status: WaveStatus, $limit: Int, $nextToken: String) {
    getWavesByUser(userId: $userId, status: $status, limit: $limit, nextToken: $nextToken) {
      waves {
        id
        fromUserId
        toUserId
        type
        status
        message
        tripId
        expiresAt
        isRead
        createdAt
        updatedAt
        fromUser {
          id
          name
          avatar
          location
        }
        toUser {
          id
          name
          avatar
          location
        }
        trip {
          id
          title
          startDate
          destination {
            city
            country
          }
        }
      }
      nextToken
    }
  }
`;

export const GET_MUTUAL_CONNECTIONS = gql`
  query GetMutualConnections($userId: ID!, $limit: Int, $nextToken: String) {
    getMutualConnections(userId: $userId, limit: $limit, nextToken: $nextToken) {
      id
      userOneId
      userTwoId
      connectionDate
      isActive
      createdAt
      userOne {
        id
        name
        avatar
        location
      }
      userTwo {
        id
        name
        avatar
        location
      }
      waveOne {
        id
        message
        createdAt
      }
      waveTwo {
        id
        message
        createdAt
      }
    }
  }
`;

export const GET_WAVE_STATS = gql`
  query GetWaveStats($userId: ID!) {
    getWaveStats(userId: $userId) {
      sentCount
      receivedCount
      mutualCount
      pendingCount
      todaysSentCount
    }
  }
`;

// Wave Mutations
export const SEND_WAVE = gql`
  mutation SendWave($input: SendWaveInput!) {
    sendWave(input: $input) {
      wave {
        id
        fromUserId
        toUserId
        type
        status
        message
        tripId
        expiresAt
        isRead
        createdAt
        updatedAt
        fromUser {
          id
          name
          avatar
          location
        }
        toUser {
          id
          name
          avatar
          location
        }
        trip {
          id
          title
          startDate
          destination {
            city
            country
          }
        }
      }
      isMutual
      connection {
        id
        connectionDate
        isActive
      }
    }
  }
`;

export const RESPOND_TO_WAVE = gql`
  mutation RespondToWave($input: RespondToWaveInput!) {
    respondToWave(input: $input) {
      wave {
        id
        fromUserId
        toUserId
        type
        status
        message
        tripId
        expiresAt
        isRead
        createdAt
        updatedAt
        fromUser {
          id
          name
          avatar
          location
        }
        toUser {
          id
          name
          avatar
          location
        }
      }
      isMutual
      connection {
        id
        connectionDate
        isActive
        userOne {
          id
          name
          avatar
        }
        userTwo {
          id
          name
          avatar
        }
      }
    }
  }
`;

export const MARK_WAVE_AS_READ = gql`
  mutation MarkWaveAsRead($waveId: ID!) {
    markWaveAsRead(waveId: $waveId) {
      id
      isRead
      updatedAt
    }
  }
`;

export const EXPIRE_OLD_WAVES = gql`
  mutation ExpireOldWaves {
    expireOldWaves {
      expiredCount
      message
    }
  }
`;

// Wave Subscriptions for Real-time Updates
export const ON_WAVE_RECEIVED = gql`
  subscription OnWaveReceived($userId: ID!) {
    onWaveReceived(userId: $userId) {
      id
      fromUserId
      toUserId
      type
      status
      message
      tripId
      expiresAt
      isRead
      createdAt
      updatedAt
      fromUser {
        id
        name
        avatar
        location
      }
      toUser {
        id
        name
        avatar
        location
      }
      trip {
        id
        title
        startDate
        destination {
          city
          country
        }
      }
    }
  }
`;

export const ON_WAVE_RESPONDED = gql`
  subscription OnWaveResponded($userId: ID!) {
    onWaveResponded(userId: $userId) {
      id
      fromUserId
      toUserId
      type
      status
      message
      tripId
      expiresAt
      isRead
      createdAt
      updatedAt
      fromUser {
        id
        name
        avatar
        location
      }
      toUser {
        id
        name
        avatar
        location
      }
    }
  }
`;

export const ON_MUTUAL_MATCH = gql`
  subscription OnMutualMatch($userId: ID!) {
    onMutualMatch(userId: $userId) {
      id
      userOneId
      userTwoId
      connectionDate
      isActive
      createdAt
      userOne {
        id
        name
        avatar
        location
      }
      userTwo {
        id
        name
        avatar
        location
      }
      waveOne {
        id
        message
        createdAt
      }
      waveTwo {
        id
        message
        createdAt
      }
    }
  }
`;

export const ON_WAVE_STATUS_CHANGE = gql`
  subscription OnWaveStatusChange($waveId: ID!) {
    onWaveStatusChange(waveId: $waveId) {
      id
      status
      isRead
      updatedAt
    }
  }
`;

// Fragment for reusing wave fields
export const WAVE_FRAGMENT = gql`
  fragment WaveFields on Wave {
    id
    fromUserId
    toUserId
    type
    status
    message
    tripId
    expiresAt
    isRead
    createdAt
    updatedAt
    fromUser {
      id
      name
      avatar
      location
    }
    toUser {
      id
      name
      avatar
      location
    }
    trip {
      id
      title
      startDate
      destination {
        city
        country
      }
    }
  }
`;

// Fragment for wave connection fields
export const WAVE_CONNECTION_FRAGMENT = gql`
  fragment WaveConnectionFields on WaveConnection {
    id
    userOneId
    userTwoId
    connectionDate
    isActive
    createdAt
    userOne {
      id
      name
      avatar
      location
    }
    userTwo {
      id
      name
      avatar
      location
    }
    waveOne {
      id
      message
      createdAt
    }
    waveTwo {
      id
      message
      createdAt
    }
  }
`;