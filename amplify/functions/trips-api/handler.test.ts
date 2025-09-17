import { handler } from './handler';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

// Mock AWS SDK
jest.mock('@aws-sdk/client-dynamodb');
jest.mock('@aws-sdk/lib-dynamodb');

const mockPutCommand = PutCommand as jest.MockedClass<typeof PutCommand>;
const mockSend = jest.fn();
const mockDynamoDBDocumentClient = {
  send: mockSend,
};

jest.mocked(DynamoDBDocumentClient.from).mockReturnValue(mockDynamoDBDocumentClient as any);

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
    cognitoIdentityId: string | null = 'user-123'
  ): APIGatewayProxyEvent => ({
    httpMethod,
    body,
    requestContext: {
      identity: {
        cognitoIdentityId,
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
    expect(JSON.parse(result.body)).toHaveProperty('id');
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
    const event = createEvent('GET', null);

    const result = await handler(event, mockContext, () => {}) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(405);
    expect(JSON.parse(result.body)).toEqual({ error: 'Method not allowed' });
  });
});