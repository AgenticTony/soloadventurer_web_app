import { defineFunction } from '@aws-amplify/backend';

export const tripsApi = defineFunction({
  name: 'trips-api',
  entry: './handler.ts',
});