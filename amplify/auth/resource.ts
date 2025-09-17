import { defineAuth } from '@aws-amplify/backend'

/**
 * SoloAdventurer Auth (Amplify Gen 2)
 * - Email login
 * - Preferred username for handle
 * - Optional given/family name
 * - Custom attributes: bio, location, createdAt, updatedAt
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },

  userAttributes: {
    email: {
      required: true,
      mutable: true,
    },

    // Use supported attribute names instead of "name"
    preferredUsername: {
      required: false,
      mutable: true,
    },
    givenName: {
      required: false,
      mutable: true,
    },
    familyName: {
      required: false,
      mutable: true,
    },

    // Define custom attributes with "custom:" prefix
    "custom:bio": {
      dataType: 'String',
      mutable: true,
    },
    "custom:location": {
      dataType: 'String',
      mutable: true,
    },
    "custom:createdAt": {
      dataType: 'String',
      mutable: false,
    },
    "custom:updatedAt": {
      dataType: 'String',
      mutable: true,
    },
  },
})
