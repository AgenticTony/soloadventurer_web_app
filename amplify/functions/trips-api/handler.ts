import type { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);
const TABLE = process.env.TRIP_TABLE_NAME!;

interface TripInput {
  title: string;
  startDate: string;
  endDate: string;
  isPrivate?: boolean;
}

interface ValidationError {
  field: string;
  message: string;
}

function validateTrip(trip: TripInput): ValidationError[] {
  const errors: ValidationError[] = [];

  // Title validation
  if (!trip.title || trip.title.trim().length === 0) {
    errors.push({ field: 'title', message: 'Title is required' });
  } else if (trip.title.length > 80) {
    errors.push({ field: 'title', message: 'Title must be 80 characters or less' });
  }

  // Date validation
  if (!trip.startDate) {
    errors.push({ field: 'startDate', message: 'Start date is required' });
  } else if (!isValidISODate(trip.startDate)) {
    errors.push({ field: 'startDate', message: 'Start date must be a valid ISO date' });
  }

  if (!trip.endDate) {
    errors.push({ field: 'endDate', message: 'End date is required' });
  } else if (!isValidISODate(trip.endDate)) {
    errors.push({ field: 'endDate', message: 'End date must be a valid ISO date' });
  }

  // Date range validation
  if (trip.startDate && trip.endDate && isValidISODate(trip.startDate) && isValidISODate(trip.endDate)) {
    const startTime = new Date(trip.startDate).getTime();
    const endTime = new Date(trip.endDate).getTime();
    if (startTime > endTime) {
      errors.push({ field: 'endDate', message: 'End date must be after start date' });
    }
  }

  return errors;
}

function isValidISODate(dateString: string): boolean {
  const date = new Date(dateString);
  return date.toISOString().startsWith(dateString.split('T')[0]);
}

// Pagination helper functions
function encodeCursor(lastEvaluatedKey: any): string {
  return Buffer.from(JSON.stringify(lastEvaluatedKey)).toString('base64');
}

function decodeCursor(cursor: string): any {
  try {
    return JSON.parse(Buffer.from(cursor, 'base64').toString('utf8'));
  } catch {
    return null;
  }
}

function validateLimit(limit?: string): number {
  if (!limit) return 20;
  const parsed = parseInt(limit, 10);
  if (isNaN(parsed) || parsed < 1) return 1;
  if (parsed > 100) return 100;
  return parsed;
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'POST,GET,OPTIONS',
};

export const handler: APIGatewayProxyHandler = async (event) => {

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  if (event.httpMethod === 'POST') {
    return handleCreateTrip(event);
  }

  if (event.httpMethod === 'GET') {
    const id = event.pathParameters?.id;
    return id ? handleGetTrip(event, id) : handleListTrips(event);
  }

  return {
    statusCode: 405,
    headers: corsHeaders,
    body: JSON.stringify({ error: 'Method not allowed' }),
  };
};

// Helper functions
function ok(data: any): APIGatewayProxyResult {
  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify(data),
  };
}

function notFound(): APIGatewayProxyResult {
  return {
    statusCode: 404,
    headers: corsHeaders,
    body: JSON.stringify({ error: 'Trip not found' }),
  };
}

function unauthorized(): APIGatewayProxyResult {
  return {
    statusCode: 401,
    headers: corsHeaders,
    body: JSON.stringify({ error: 'Unauthorized' }),
  };
}

function serverError(): APIGatewayProxyResult {
  return {
    statusCode: 500,
    headers: corsHeaders,
    body: JSON.stringify({ error: 'Internal server error' }),
  };
}

function getUserId(event: APIGatewayProxyEvent): string | undefined {
  return (event.requestContext.authorizer as any)?.claims?.sub;
}

async function handleCreateTrip(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    // Get user from Cognito
    const userId = getUserId(event);
    if (!userId) return unauthorized();

    // Parse and validate input
    if (!event.body) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Request body is required' }),
      };
    }

    const tripInput: TripInput = JSON.parse(event.body);
    const validationErrors = validateTrip(tripInput);

    if (validationErrors.length > 0) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Validation failed', details: validationErrors }),
      };
    }

    // Create trip record
    const tripId = randomUUID();
    const now = new Date().toISOString();

    const tripItem = {
      id: tripId,
      ownerId: userId,
      title: tripInput.title.trim(),
      startDate: tripInput.startDate,
      endDate: tripInput.endDate,
      isPrivate: tripInput.isPrivate || false,
      createdAt: now,
      updatedAt: now,
      owner: userId, // For Amplify auth
    };

    // Insert into DynamoDB
    await ddb.send(
      new PutCommand({
        TableName: TABLE,
        Item: tripItem,
      })
    );

    return {
      statusCode: 201,
      headers: corsHeaders,
      body: JSON.stringify({ id: tripId }),
    };
  } catch (error) {
    console.error('Error creating trip:', error);
    return serverError();
  }
}

async function handleGetTrip(event: APIGatewayProxyEvent, id: string): Promise<APIGatewayProxyResult> {
  try {
    const userId = getUserId(event);
    if (!userId) return unauthorized();

    const { Item } = await ddb.send(new GetCommand({
      TableName: TABLE,
      Key: { id },
    }));

    if (!Item) return notFound();

    // deny if private and not owner
    if (Item.isPrivate === true && Item.ownerId !== userId) return notFound();

    return ok(Item);
  } catch (error) {
    console.error('Error getting trip:', error);
    return serverError();
  }
}

async function handleListTrips(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const userId = getUserId(event);
    if (!userId) return unauthorized();

    const queryOwnerId = event.queryStringParameters?.ownerId;
    const limit = validateLimit(event.queryStringParameters?.limit);
    const nextToken = event.queryStringParameters?.nextToken;

    // Decode cursor if provided
    const exclusiveStartKey = nextToken ? decodeCursor(nextToken) : undefined;
    if (nextToken && !exclusiveStartKey) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Invalid nextToken' }),
      };
    }

    const ownerId = queryOwnerId || userId;

    // Build query parameters
    const queryParams: any = {
      TableName: TABLE,
      IndexName: 'ownerId-index',
      KeyConditionExpression: 'ownerId = :o',
      ExpressionAttributeValues: { ':o': ownerId },
      Limit: limit,
    };

    if (exclusiveStartKey) {
      queryParams.ExclusiveStartKey = exclusiveStartKey;
    }

    // If querying other user's trips, filter to public only
    if (ownerId !== userId) {
      queryParams.FilterExpression = 'isPrivate = :f';
      queryParams.ExpressionAttributeValues[':f'] = false;
    }

    const result = await ddb.send(new QueryCommand(queryParams));

    // Prepare response with pagination
    const responseData: any = {
      items: result.Items || []
    };

    if (result.LastEvaluatedKey) {
      responseData.nextToken = encodeCursor(result.LastEvaluatedKey);
    }

    return ok(responseData);
  } catch (error) {
    console.error('Error listing trips:', error);
    return serverError();
  }
}