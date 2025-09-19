import { readFileSync } from 'fs'
import path from 'path'

// Read the actual GraphQL schema
const schemaPath = path.join(__dirname, '../../../amplify/data/schema.graphql')
const schemaContent = readFileSync(schemaPath, 'utf-8')

describe('GraphQL Schema Validation', () => {
  test('schema file exists and is not empty', () => {
    expect(schemaContent).toBeTruthy()
    expect(schemaContent.length).toBeGreaterThan(0)
  })

  test('schema contains required enums', () => {
    expect(schemaContent).toContain('enum TravelPace')
    expect(schemaContent).toContain('enum BudgetLevel')
    expect(schemaContent).toContain('enum AccommodationType')
    expect(schemaContent).toContain('enum DiningPreference')
    expect(schemaContent).toContain('enum ActivityType')
    expect(schemaContent).toContain('enum TripStatus')
    expect(schemaContent).toContain('enum FollowStatus')
  })

  test('schema contains required types with @model directive', () => {
    expect(schemaContent).toContain('type User @model')
    expect(schemaContent).toContain('type Trip @model')
    expect(schemaContent).toContain('type Destination @model')
    expect(schemaContent).toContain('type TripPost @model')
    expect(schemaContent).toContain('type Expense @model')
    expect(schemaContent).toContain('type ItineraryItem @model')
  })

  test('schema contains proper authorization rules', () => {
    // Check for @auth directives
    expect(schemaContent).toContain('@auth(rules: [{ allow: owner }])')
    
    // Check that all @model types have authorization
    const modelLines = schemaContent.split('\n').filter(line => line.includes('@model'))
    modelLines.forEach(line => {
      expect(line).toContain('@auth(rules:')
    })
  })

  test('schema uses AWSDateTime for timestamp fields', () => {
    expect(schemaContent).toContain('AWSDateTime!')
    
    // Check that User type has AWSDateTime fields
    expect(schemaContent).toContain('createdAt: AWSDateTime!')
    expect(schemaContent).toContain('updatedAt: AWSDateTime!')
  })

  test('schema contains proper relationships', () => {
    // Check for @hasOne relationship
    expect(schemaContent).toContain('@hasOne')
    
    // Check for @hasMany relationship
    expect(schemaContent).toContain('@hasMany')
    
    // Check for @belongsTo relationship
    expect(schemaContent).toContain('@belongsTo')
  })

  test('schema contains proper indexes', () => {
    // Check for @index directives
    expect(schemaContent).toContain('@index(name:')
    
    // Check for specific indexes
    expect(schemaContent).toContain('@index(name: "byEmail"')
    expect(schemaContent).toContain('@index(name: "byUser"')
    expect(schemaContent).toContain('@index(name: "byTrip"')
  })

  test('schema contains custom queries', () => {
    expect(schemaContent).toContain('type Query {')
    expect(schemaContent).toContain('getUserFeed:')
    expect(schemaContent).toContain('searchUsers(query: String!):')
    expect(schemaContent).toContain('searchTrips(query: String!):')
    expect(schemaContent).toContain('getTripStatistics(tripId: ID!):')
  })

  test('schema contains custom subscriptions', () => {
    expect(schemaContent).toContain('type Subscription {')
    expect(schemaContent).toContain('onTripUpdate')
    expect(schemaContent).toContain('onNewPost')
    expect(schemaContent).toContain('onNewComment')
    expect(schemaContent).toContain('onNewFollower')
  })
})

describe('GraphQL Schema Structure', () => {
  test('User type has all required fields', () => {
    expect(schemaContent).toContain('id: ID!')
    expect(schemaContent).toContain('email: String!')
    expect(schemaContent).toContain('name: String!')
    expect(schemaContent).toContain('emailVerified: Boolean!')
    expect(schemaContent).toContain('createdAt: AWSDateTime!')
    expect(schemaContent).toContain('updatedAt: AWSDateTime!')
  })

  test('Trip type has all required fields', () => {
    expect(schemaContent).toContain('title: String!')
    expect(schemaContent).toContain('status: TripStatus!')
    expect(schemaContent).toContain('startDate: AWSDateTime!')
    expect(schemaContent).toContain('endDate: AWSDateTime!')
    expect(schemaContent).toContain('isPublic: Boolean!')
  })

  test('TripPost type has proper relationships', () => {
    expect(schemaContent).toContain('images: [PostImage] @hasMany')
    expect(schemaContent).toContain('likes: [PostLike] @hasMany')
    expect(schemaContent).toContain('comments: [PostComment] @hasMany')
  })

  test('Expense type has proper structure', () => {
    expect(schemaContent).toContain('category: String!')
    expect(schemaContent).toContain('amount: Float!')
    expect(schemaContent).toContain('currency: String!')
    expect(schemaContent).toContain('description: String!')
    expect(schemaContent).toContain('date: AWSDateTime!')
    expect(schemaContent).toContain('receipts: [ExpenseReceipt] @hasMany')
  })

  test('ItineraryItem type has proper structure', () => {
    expect(schemaContent).toContain('type: String!')
    expect(schemaContent).toContain('title: String!')
    expect(schemaContent).toContain('startTime: AWSDateTime!')
    expect(schemaContent).toContain('status: String!')
  })
})

describe('GraphQL Schema Relationships', () => {
  test('User-Trip relationship is properly defined', () => {
    expect(schemaContent).toContain('trips: [Trip] @hasMany')
    expect(schemaContent).toContain('user: User @belongsTo')
  })

  test('Trip-Destination relationship is properly defined', () => {
    expect(schemaContent).toContain('destination: Destination! @hasOne')
    expect(schemaContent).toContain('trip: Trip @belongsTo')
  })

  test('Post-Comment relationship is properly defined', () => {
    expect(schemaContent).toContain('replies: [PostComment] @hasMany')
    expect(schemaContent).toContain('parentComment: PostComment @belongsTo')
  })

  test('Post-Like relationship is properly defined', () => {
    expect(schemaContent).toContain('likes: [PostLike] @hasMany')
    expect(schemaContent).toContain('post: TripPost @belongsTo')
    expect(schemaContent).toContain('user: User @belongsTo')
  })
})

describe('GraphQL Schema Input Types', () => {
  test('TravelStyleInput type exists', () => {
    expect(schemaContent).toContain('input TravelStyleInput {')
    expect(schemaContent).toContain('travelPace:')
    expect(schemaContent).toContain('budget:')
    expect(schemaContent).toContain('accommodationPreference:')
  })
})

describe('GraphQL Schema Custom Types', () => {
  test('NotificationSettings type exists', () => {
    expect(schemaContent).toContain('type NotificationSettings {')
    expect(schemaContent).toContain('emailNotifications: Boolean!')
    expect(schemaContent).toContain('pushNotifications: Boolean!')
    expect(schemaContent).toContain('tripReminders: Boolean!')
  })

  test('PrivacySettings type exists', () => {
    expect(schemaContent).toContain('type PrivacySettings {')
    expect(schemaContent).toContain('profileVisibility: String!')
    expect(schemaContent).toContain('showEmail: Boolean!')
    expect(schemaContent).toContain('showLocation: Boolean!')
  })

  test('TripStatistics type exists', () => {
    expect(schemaContent).toContain('type TripStatistics {')
    expect(schemaContent).toContain('totalExpenses: Float!')
    expect(schemaContent).toContain('averageDailyExpense: Float!')
    expect(schemaContent).toContain('expenseByCategory: [ExpenseByCategory]')
  })

  test('ExpenseByCategory type exists', () => {
    expect(schemaContent).toContain('type ExpenseByCategory {')
    expect(schemaContent).toContain('category: String!')
    expect(schemaContent).toContain('total: Float!')
    expect(schemaContent).toContain('percentage: Float!')
  })
})