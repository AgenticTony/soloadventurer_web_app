import { defineBackend } from '@aws-amplify/backend';
import { Stack } from 'aws-cdk-lib';
import {
  AuthorizationType,
  CognitoUserPoolsAuthorizer,
  Cors,
  LambdaIntegration,
  RestApi,
} from 'aws-cdk-lib/aws-apigateway';
import { Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Alarm, Metric } from 'aws-cdk-lib/aws-cloudwatch';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { tripsApi } from './functions/trips-api/resource';

const getAllowedOrigins = (): string[] => {
  // Staging environment
  if (process.env.NODE_ENV === 'production' && process.env.STAGE === 'staging') {
    return [
      'https://staging.soloadventurer.com',
      'http://localhost:3000',
      'http://localhost:3001'
    ];
  }

  // Production domains (replace with actual domains when deploying)
  if (process.env.NODE_ENV === 'production') {
    return [
      'https://soloadventurer.com',
      'https://www.soloadventurer.com'
    ];
  }

  // Local development - allow all
  return Cors.ALL_ORIGINS;
};

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
const backend = defineBackend({
  auth,
  data,
  tripsApi,
});

// Create API stack
const apiStack = backend.createStack('trips-api-stack');

// Create REST API
const tripsRestApi = new RestApi(apiStack, 'TripsRestApi', {
  restApiName: 'TripsAPI',
  deploy: true,
  deployOptions: {
    stageName: 'dev',
  },
  defaultCorsPreflightOptions: {
    allowOrigins: getAllowedOrigins(),
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    allowCredentials: true,
  },
});

// Create Lambda integration
const lambdaIntegration = new LambdaIntegration(
  backend.tripsApi.resources.lambda
);

// Create Cognito authorizer
const cognitoAuth = new CognitoUserPoolsAuthorizer(apiStack, 'CognitoAuth', {
  cognitoUserPools: [backend.auth.resources.userPool],
});

// Create /trips endpoint
const tripsPath = tripsRestApi.root.addResource('trips');
tripsPath.addMethod('POST', lambdaIntegration, {
  authorizationType: AuthorizationType.COGNITO,
  authorizer: cognitoAuth,
});
tripsPath.addMethod('GET', lambdaIntegration, {
  authorizationType: AuthorizationType.COGNITO,
  authorizer: cognitoAuth,
});
const tripById = tripsPath.addResource('{id}');
tripById.addMethod('GET', lambdaIntegration, {
  authorizationType: AuthorizationType.COGNITO,
  authorizer: cognitoAuth,
});

// Grant function access to Trip table
const tripTableName = backend.data.resources.tables['Trip'].tableName;
backend.tripsApi.addEnvironment('TRIP_TABLE_NAME', tripTableName);

// Create IAM policy for API access
const apiPolicy = new Policy(apiStack, 'TripsApiPolicy', {
  statements: [
    new PolicyStatement({
      actions: ['execute-api:Invoke'],
      resources: [
        `${tripsRestApi.arnForExecuteApi('*', '/trips', 'dev')}`,
        `${tripsRestApi.arnForExecuteApi('*', '/trips/*', 'dev')}`,
      ],
    }),
  ],
});

// Attach policy to authenticated users
backend.auth.resources.authenticatedUserIamRole.attachInlinePolicy(apiPolicy);

// Grant DynamoDB access to function
backend.tripsApi.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: [
      'dynamodb:PutItem',
      'dynamodb:GetItem',
      'dynamodb:Query',
    ],
    resources: [
      backend.data.resources.tables['Trip'].tableArn,
      `${backend.data.resources.tables['Trip'].tableArn}/index/*`,
    ],
  })
);

// Add CloudWatch Alarms
const functionName = backend.tripsApi.resources.lambda.functionName;

// 5XX Error Alarm
new Alarm(apiStack, 'TripApi5XXAlarm', {
  alarmName: 'TripAPI-5XX-Errors',
  alarmDescription: 'Alert when 5XX errors > 5/min',
  metric: new Metric({
    namespace: 'AWS/ApiGateway',
    metricName: '5XXError',
    dimensionsMap: {
      ApiName: tripsRestApi.restApiName,
      Stage: 'dev',
    },
    statistic: 'Sum',
  }),
  threshold: 5,
  evaluationPeriods: 1,
});

// Lambda Duration Alarm
new Alarm(apiStack, 'TripApiDurationAlarm', {
  alarmName: 'TripAPI-Lambda-Duration',
  alarmDescription: 'Alert when Lambda p95 duration > 2s',
  metric: new Metric({
    namespace: 'AWS/Lambda',
    metricName: 'Duration',
    dimensionsMap: {
      FunctionName: functionName,
    },
    statistic: 'p95',
  }),
  threshold: 2000,
  evaluationPeriods: 2,
});

// Add outputs
backend.addOutput({
  custom: {
    API: {
      [tripsRestApi.restApiName]: {
        endpoint: tripsRestApi.url,
        region: Stack.of(tripsRestApi).region,
        apiName: tripsRestApi.restApiName,
      },
    },
  },
});
