import type { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

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

export const handler: APIGatewayProxyHandler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Get user from Cognito
    const cognitoIdentityId = event.requestContext.identity.cognitoIdentityId;
    if (!cognitoIdentityId) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized' }),
      };
    }

    // Parse and validate input
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Request body is required' }),
      };
    }

    const tripInput: TripInput = JSON.parse(event.body);
    const validationErrors = validateTrip(tripInput);

    if (validationErrors.length > 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Validation failed', details: validationErrors }),
      };
    }

    // Create trip record
    const tripId = randomUUID();
    const now = new Date().toISOString();

    const tripItem = {
      id: tripId,
      ownerId: cognitoIdentityId,
      title: tripInput.title.trim(),
      startDate: tripInput.startDate,
      endDate: tripInput.endDate,
      isPrivate: tripInput.isPrivate || false,
      createdAt: now,
      updatedAt: now,
      owner: cognitoIdentityId, // For Amplify auth
    };

    // Insert into DynamoDB
    await ddbDocClient.send(
      new PutCommand({
        TableName: process.env.TRIP_TABLE_NAME,
        Item: tripItem,
      })
    );

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({ id: tripId }),
    };
  } catch (error) {
    console.error('Error creating trip:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};