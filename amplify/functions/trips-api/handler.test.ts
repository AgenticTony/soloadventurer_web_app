import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

jest.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: jest.fn(() => ({})),
}));

// Create mockSend first so it can be shared
const mockSend = jest.fn();

jest.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: {
    from: jest.fn(() => ({
      send: mockSend
    }))
  },
  PutCommand: jest.fn(),
  GetCommand: jest.fn(),
  QueryCommand: jest.fn(),
}));

// Now import handler after mocks are set up
import { handler } from './handler';
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

// Mock environment
process.env.TRIP_TABLE_NAME = 'test-trip-table';

describe('trips-api handler', () => {
  const mockContext: Context = {} as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createEvent = (
    httpMethod: string,
    body: string | null,
    userId: string | null = 'user-123',
    pathParameters?: { [key: string]: string },
    queryStringParameters?: { [key: string]: string }
  ): APIGatewayProxyEvent => ({
    httpMethod,
    body,
    pathParameters,
    queryStringParameters,
    requestContext: {
      authorizer: userId ? {
        claims: {
          sub: userId,
        },
      } : null,
      identity: {
        cognitoIdentityId: userId,
      },
    },
  } as any);

  it('should create a trip successfully', async () => {
    mockSend.mockResolvedValue({});

    const event = createEvent(
      'POST',
      JSON.stringify({
        title: 'Test Trip',
        startDate: '2024-03-01T10:00:00Z',
        endDate: '2024-03-05T10:00:00Z',
        isPrivate: false,
      })
    );

    const result = await handler(event, mockContext, () => {}) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(201);
    const responseBody = JSON.parse(result.body);
    expect(responseBody).toHaveProperty('id');
    expect(mockSend).toHaveBeenCalledWith(expect.any(PutCommand));
  });

  it('should return 401 for unauthenticated requests', async () => {
    const event = createEvent(
      'POST',
      JSON.stringify({ title: 'Test Trip' }),
      null
    );

    const result = await handler(event, mockContext, () => {}) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(401);
    expect(JSON.parse(result.body)).toEqual({ error: 'Unauthorized' });
  });

  it('should validate required title', async () => {
    const event = createEvent(
      'POST',
      JSON.stringify({
        startDate: '2024-03-01T10:00:00Z',
        endDate: '2024-03-05T10:00:00Z',
      })
    );

    const result = await handler(event, mockContext, () => {}) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(400);
    const body = JSON.parse(result.body);
    expect(body.error).toBe('Validation failed');
    expect(body.details).toContainEqual({
      field: 'title',
      message: 'Title is required',
    });
  });

  it('should validate title length', async () => {
    const event = createEvent(
      'POST',
      JSON.stringify({
        title: 'A'.repeat(81),
        startDate: '2024-03-01T10:00:00Z',
        endDate: '2024-03-05T10:00:00Z',
      })
    );

    const result = await handler(event, mockContext, () => {}) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(400);
    const body = JSON.parse(result.body);
    expect(body.details).toContainEqual({
      field: 'title',
      message: 'Title must be 80 characters or less',
    });
  });

  it('should validate date range', async () => {
    const event = createEvent(
      'POST',
      JSON.stringify({
        title: 'Test Trip',
        startDate: '2024-03-05T10:00:00Z',
        endDate: '2024-03-01T10:00:00Z',
      })
    );

    const result = await handler(event, mockContext, () => {}) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(400);
    const body = JSON.parse(result.body);
    expect(body.details).toContainEqual({
      field: 'endDate',
      message: 'End date must be after start date',
    });
  });

  it('should handle OPTIONS request', async () => {
    const event = createEvent('OPTIONS', null);

    const result = await handler(event, mockContext, () => {}) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(200);
    expect(result.headers).toHaveProperty('Access-Control-Allow-Origin');
  });

  it('should handle invalid HTTP method', async () => {
    const event = createEvent('DELETE', null);

    const result = await handler(event, mockContext, () => {}) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(405);
    expect(JSON.parse(result.body)).toEqual({ error: 'Method not allowed' });
  });

  describe('GET /trips/{id}', () => {
    it('should get trip by id successfully', async () => {
      const mockTrip = {
        id: 'trip-123',
        title: 'Test Trip',
        description: 'A comprehensive test trip for API validation',
        location: 'Berlin, Germany',
        ownerId: 'user-123',
        owner: 'test_owner',
        isPrivate: false,
        startDate: '2024-03-01T10:00:00Z',
        endDate: '2024-03-05T10:00:00Z',
        status: 'PLANNING',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      };

      mockSend.mockResolvedValue({ Item: mockTrip });

      const event = createEvent('GET', null, 'user-123', { id: 'trip-123' });
      const result = await handler(event, mockContext, () => {}) as APIGatewayProxyResult;

      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toEqual(mockTrip);
      expect(mockSend).toHaveBeenCalledWith(expect.any(GetCommand));
    });

    it('should return 404 for non-existent trip', async () => {
      mockSend.mockResolvedValue({ Item: null });

      const event = createEvent('GET', null, 'user-123', { id: 'nonexistent' });
      const result = await handler(event, mockContext, () => {}) as APIGatewayProxyResult;

      expect(result.statusCode).toBe(404);
      expect(JSON.parse(result.body)).toEqual({ error: 'Trip not found' });
    });

    it('should return 404 for private trip by non-owner', async () => {
      const mockTrip = {
        id: 'trip-123',
        title: 'Private Trip',
        description: 'A private trip for testing access control',
        location: 'Vienna, Austria',
        ownerId: 'other-user',
        owner: 'other_owner',
        isPrivate: true,
        startDate: '2024-03-01T10:00:00Z',
        endDate: '2024-03-05T10:00:00Z',
        status: 'ACTIVE',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      };

      mockSend.mockResolvedValue({ Item: mockTrip });

      const event = createEvent('GET', null, 'user-123', { id: 'trip-123' });
      const result = await handler(event, mockContext, () => {}) as APIGatewayProxyResult;

      expect(result.statusCode).toBe(404);
      expect(JSON.parse(result.body)).toEqual({ error: 'Trip not found' });
    });

    it('should allow owner to access private trip', async () => {
      const mockTrip = {
        id: 'trip-123',
        title: 'Private Trip',
        description: 'Owner-accessible private trip for testing',
        location: 'Munich, Germany',
        ownerId: 'user-123',
        owner: 'trip_owner',
        isPrivate: true,
        startDate: '2024-03-01T10:00:00Z',
        endDate: '2024-03-05T10:00:00Z',
        status: 'COMPLETED',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      };

      mockSend.mockResolvedValue({ Item: mockTrip });

      const event = createEvent('GET', null, 'user-123', { id: 'trip-123' });
      const result = await handler(event, mockContext, () => {}) as APIGatewayProxyResult;

      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toEqual(mockTrip);
    });

    it('should allow access to public trip by non-owner', async () => {
      const mockTrip = {
        id: 'trip-123',
        title: 'Public Trip',
        description: 'A public trip accessible to everyone',
        location: 'Prague, Czech Republic',
        ownerId: 'other-user',
        owner: 'public_traveler',
        isPrivate: false,
        startDate: '2024-03-01T10:00:00Z',
        endDate: '2024-03-05T10:00:00Z',
        status: 'ACTIVE',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      };

      mockSend.mockResolvedValue({ Item: mockTrip });

      const event = createEvent('GET', null, 'user-123', { id: 'trip-123' });
      const result = await handler(event, mockContext, () => {}) as APIGatewayProxyResult;

      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toEqual(mockTrip);
    });

    it('should return 401 for unauthenticated request', async () => {
      const event = createEvent('GET', null, null, { id: 'trip-123' });
      const result = await handler(event, mockContext, () => {}) as APIGatewayProxyResult;

      expect(result.statusCode).toBe(401);
      expect(JSON.parse(result.body)).toEqual({ error: 'Unauthorized' });
    });
  });

  describe('GET /trips', () => {
    it('should list own trips', async () => {
      const mockTrips = [
        {
          id: 'trip-1',
          title: 'Trip 1',
          description: 'First trip in the user collection',
          location: 'Zurich, Switzerland',
          ownerId: 'user-123',
          owner: 'collection_owner',
          isPrivate: true,
          startDate: '2024-03-01T10:00:00Z',
          endDate: '2024-03-05T10:00:00Z',
          status: 'PLANNING',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 'trip-2',
          title: 'Trip 2',
          description: 'Second trip in the user collection',
          location: 'Stockholm, Sweden',
          ownerId: 'user-123',
          owner: 'collection_owner',
          isPrivate: false,
          startDate: '2024-04-01T10:00:00Z',
          endDate: '2024-04-05T10:00:00Z',
          status: 'ACTIVE',
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z'
        }
      ];

      mockSend.mockResolvedValue({ Items: mockTrips });

      const event = createEvent('GET', null, 'user-123');
      const result = await handler(event, mockContext, () => {}) as APIGatewayProxyResult;

      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toEqual({ items: mockTrips });
      expect(mockSend).toHaveBeenCalledWith(expect.any(QueryCommand));
    });

    it('should list other user public trips only', async () => {
      const mockPublicTrips = [
        {
          id: 'trip-3',
          title: 'Public Trip',
          description: 'A publicly accessible trip by another user',
          location: 'Copenhagen, Denmark',
          ownerId: 'other-user',
          owner: 'another_traveler',
          isPrivate: false,
          startDate: '2024-05-01T10:00:00Z',
          endDate: '2024-05-05T10:00:00Z',
          status: 'COMPLETED',
          createdAt: '2024-01-03T00:00:00Z',
          updatedAt: '2024-01-03T00:00:00Z'
        }
      ];

      mockSend.mockResolvedValue({ Items: mockPublicTrips });

      const event = createEvent('GET', null, 'user-123', undefined, { ownerId: 'other-user' });
      const result = await handler(event, mockContext, () => {}) as APIGatewayProxyResult;

      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toEqual({ items: mockPublicTrips });
      expect(mockSend).toHaveBeenCalledWith(expect.any(QueryCommand));
    });

    it('should return 401 for unauthenticated request', async () => {
      const event = createEvent('GET', null, null);
      const result = await handler(event, mockContext, () => {}) as APIGatewayProxyResult;

      expect(result.statusCode).toBe(401);
      expect(JSON.parse(result.body)).toEqual({ error: 'Unauthorized' });
    });

    it('should handle empty results', async () => {
      mockSend.mockResolvedValue({ Items: [] });

      const event = createEvent('GET', null, 'user-123');
      const result = await handler(event, mockContext, () => {}) as APIGatewayProxyResult;

      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toEqual({ items: [] });
    });
  });
});