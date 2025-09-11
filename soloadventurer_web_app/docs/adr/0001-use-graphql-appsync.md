# ADR-0001: Use AWS AppSync for GraphQL API

- **Status**: Accepted
- **Date**: 2025-09-11
- **Decision**: Use AWS AppSync as the managed GraphQL service for SoloAdventurer
- **Authors**: Architecture Team

## Context

SoloAdventurer requires a scalable, real-time API architecture to support:
- Social networking features (profiles, connections, messaging)
- Real-time features (messaging, notifications, presence)
- Mobile and web clients sharing the same API
- High performance and low latency for global users
- Security and compliance requirements for user data

## Decision

We will use **AWS AppSync** as our GraphQL service with the following architecture:

### Core Components
1. **AWS AppSync**: Managed GraphQL service
2. **Amazon Aurora**: MySQL-compatible database for persistence
3. **Amazon Cognito**: User authentication and authorization
4. **AWS Lambda**: Custom business logic resolvers
5. **Amazon ElastiCache**: Redis for caching and real-time features

### GraphQL Schema Design
```graphql
type User @model {
  id: ID!
  name: String!
  email: String!
  bio: String
  avatar: String
  interests: [String!]
  verificationLevel: VerificationLevel
  createdAt: AWSDateTime!
  updatedAt: AWSDateTime!
}

type Trip @model {
  id: ID!
  userId: ID!
  user: User! @connection(fields: ["userId"], key: "byUser")
  destination: String!
  startDate: AWSDateTime!
  endDate: AWSDateTime!
  interests: [String!]
  visibility: Visibility
  createdAt: AWSDateTime!
  updatedAt: AWSDateTime!
}

type Connection @model {
  id: ID!
  userA: ID!
  userB: ID!
  status: ConnectionStatus!
  createdAt: AWSDateTime!
  updatedAt: AWSDateTime!
}

type Message @model {
  id: ID!
  threadId: ID!
  senderId: ID!
  content: String!
  mediaUrl: String
  readAt: AWSDateTime
  createdAt: AWSDateTime!
  updatedAt: AWSDateTime!
}

enum VerificationLevel {
  EMAIL
  PHONE
  ID_VERIFIED
}

enum Visibility {
  PUBLIC
  FRIENDS_ONLY
  PRIVATE
}

enum ConnectionStatus {
  NONE
  WAVED
  MUTUAL
  BLOCKED
}
```

## Consequences

### Benefits
1. **Managed Service**: Reduced operational overhead for GraphQL infrastructure
2. **Real-time Capabilities**: Built-in WebSocket support for subscriptions
3. **Security**: Integrated with AWS IAM and Cognito for authorization
4. **Scalability**: Automatic scaling based on request volume
5. **Performance**: Global edge locations and caching
6. **Developer Experience**: Rich console, schema management, and monitoring

### Implementation Details

#### Resolver Architecture
```javascript
// Lambda Resolver Example
exports.handler = async (event) => {
  const { fieldName } = event;
  const { arguments } = event;
  const { identity } = event.requestContext;

  switch (fieldName) {
    case 'getMatches':
      return await getMatches(identity.sub, arguments);
    case 'sendWave':
      return await sendWave(identity.sub, arguments);
    case 'createTrip':
      return await createTrip(identity.sub, arguments);
    default:
      throw new Error(`Unknown field: ${fieldName}`);
  }
};
```

#### Real-time Subscriptions
```graphql
subscription OnNewWave($userId: ID!) {
  onNewWave(userId: $userId) {
    id
    fromUser {
      id
      name
      avatar
    }
    createdAt
  }
}

subscription OnNewMessage($threadId: ID!) {
  onNewMessage(threadId: $threadId) {
    id
    content
    sender {
      id
      name
    }
    createdAt
  }
}
```

#### Caching Strategy
```javascript
// Resolver with Caching
exports.handler = async (event) => {
  const cacheKey = `user:${event.arguments.userId}`;
  
  // Try cache first
  const cachedUser = await redis.get(cacheKey);
  if (cachedUser) {
    return JSON.parse(cachedUser);
  }
  
  // Cache miss - fetch from database
  const user = await getUserFromDB(event.arguments.userId);
  
  // Cache for 5 minutes
  await redis.setex(cacheKey, 300, JSON.stringify(user));
  
  return user;
};
```

### Costs
- **AppSync**: $4.00 per million queries (first 1M free)
- **Data Transfer**: Standard AWS data transfer rates
- **Lambda**: $0.20 per million requests (first 1M free)
- **Aurora**: $0.29 per GB-month storage + compute costs

### Monitoring and Observability
```javascript
// CloudWatch Metrics
const metrics = new CloudWatchMetrics();

exports.handler = async (event) => {
  const startTime = Date.now();
  
  try {
    const result = await processRequest(event);
    
    // Record success metric
    metrics.putMetricData({
      MetricName: 'ResolverSuccess',
      Value: 1,
      Unit: 'Count',
      Dimensions: [
        { Name: 'ResolverName', Value: event.fieldName }
      ]
    });
    
    // Record latency
    metrics.putMetricData({
      MetricName: 'ResolverLatency',
      Value: Date.now() - startTime,
      Unit: 'Milliseconds',
      Dimensions: [
        { Name: 'ResolverName', Value: event.fieldName }
      ]
    });
    
    return result;
  } catch (error) {
    // Record error metric
    metrics.putMetricData({
      MetricName: 'ResolverError',
      Value: 1,
      Unit: 'Count',
      Dimensions: [
        { Name: 'ResolverName', Value: event.fieldName },
        { Name: 'ErrorType', Value: error.constructor.name }
      ]
    });
    
    throw error;
  }
};
```

## Alternatives Considered

### 1. Apollo Server with AWS ECS
**Pros:**
- Full control over the GraphQL server
- Custom caching and optimization
- Language flexibility (Node.js, Python, etc.)

**Cons:**
- Higher operational overhead
- Need to manage WebSocket connections manually
- More complex scaling and monitoring
- Higher infrastructure costs

### 2. Hasura with PostgreSQL
**Pros:**
- Automatic GraphQL generation from database schema
- Real-time capabilities out of the box
- Good performance for simple queries

**Cons:**
- Less flexibility for complex business logic
- PostgreSQL dependency (we chose Aurora MySQL)
- Limited AWS integration
- Vendor lock-in to Hasura ecosystem

### 3. REST API with AWS API Gateway
**Pros:**
- Simple and widely adopted
- Good performance for simple CRUD operations
- Easy to implement and maintain

**Cons:**
- No built-in real-time capabilities
- Multiple round trips for related data
- No schema validation at the API level
- Harder to evolve API over time

## Implementation Timeline

### Phase 1: Core Schema (Week 1-2)
- Define GraphQL schema for User, Trip, Connection types
- Set up AppSync API with basic resolvers
- Configure Cognito integration for authentication
- Implement basic CRUD operations

### Phase 2: Real-time Features (Week 3-4)
- Implement WebSocket subscriptions for messaging
- Add real-time notifications
- Configure caching strategies
- Set up monitoring and alerting

### Phase 3: Advanced Features (Week 5-6)
- Implement matching algorithm resolvers
- Add file upload functionality
- Optimize query performance
- Implement rate limiting and security measures

## Migration Strategy

### From Existing Systems
1. **Database Migration**: Migrate existing user data to Aurora
2. **API Gateway**: Implement AppSync alongside existing REST API
3. **Client Migration**: Gradually migrate clients to GraphQL
4. **Decommission**: Remove old REST API after full migration

### Rollback Plan
1. **Database**: Keep backups of original data
2. **API**: Maintain REST API as fallback
3. **Monitoring**: Monitor error rates and performance
4. **Gradual Rollout**: Use feature flags for controlled rollout

## Testing Strategy

### Unit Tests
```javascript
// Resolver Unit Test
describe('getMatches Resolver', () => {
  it('should return matches based on overlapping trips', async () => {
    const event = {
      fieldName: 'getMatches',
      arguments: { userId: '123' },
      requestContext: { identity: { sub: '123' } }
    };
    
    const result = await handler(event);
    
    expect(result).toHaveLength(3);
    expect(result[0].matchScore).toBeGreaterThan(0.8);
  });
});
```

### Integration Tests
```javascript
// Full GraphQL Integration Test
describe('GraphQL API Integration', () => {
  it('should handle complete user flow', async () => {
    // Create user
    const createUserResponse = await graphqlClient.request(CREATE_USER, {
      input: { name: 'John Doe', email: 'john@example.com' }
    });
    
    // Create trip
    const createTripResponse = await graphqlClient.request(CREATE_TRIP, {
      input: { destination: 'Paris', startDate: '2023-12-01', endDate: '2023-12-10' }
    });
    
    // Get matches
    const matchesResponse = await graphqlClient.request(GET_MATCHES);
    
    expect(matchesResponse.matches).toHaveLength(1);
    expect(matchesResponse.matches[0].user.name).toBe('John Doe');
  });
});
```

## Future Considerations

### Scalability
- Monitor query complexity and implement query depth limits
- Consider implementing dataloader for N+1 query optimization
- Plan for multi-region deployment if needed

### Performance
- Implement caching strategies for frequently accessed data
- Optimize database queries with proper indexing
- Consider implementing a CDN for static assets

### Security
- Implement rate limiting for API endpoints
- Add query complexity analysis to prevent expensive queries
- Regular security audits and penetration testing

## Conclusion

AWS AppSync provides the best balance of features, scalability, and operational efficiency for SoloAdventurer's GraphQL API needs. The managed service approach allows us to focus on building features rather than managing infrastructure, while still providing the flexibility and performance required for a social networking application.

The decision to use AppSync aligns with our overall AWS-first strategy and provides a solid foundation for building real-time, scalable features that will delight our users.