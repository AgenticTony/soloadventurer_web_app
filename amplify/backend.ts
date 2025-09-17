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
import { auth } from './auth/resource';
import { data } from './data/resource';
import { tripsApi } from './functions/trips-api/resource';

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
    allowOrigins: Cors.ALL_ORIGINS,
    allowMethods: ['POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
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
    ],
    resources: [backend.data.resources.tables['Trip'].tableArn],
  })
);

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
