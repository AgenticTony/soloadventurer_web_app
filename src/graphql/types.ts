// GraphQL Types for type safety

// Updated to match actual Amplify schema
export interface User {
  id: string
  email: string
  name: string
  createdAt: string
  updatedAt: string
}

// Legacy fields for future use
export interface UserExtended extends User {
  avatar?: string
  bio?: string
  location?: string
  emailVerified?: boolean
  travelStyle?: TravelStyle
  preferences?: UserPreferences
}

export interface TravelStyle {
  id: string
  travelPace: string
  budget: string
  accommodationPreference: string
  diningPreference: string
  activityPreferences: string[]
}

export interface UserPreferences {
  id: string
  language: string
  currency: string
  timezone: string
  notificationSettings: NotificationSettings
  privacySettings: PrivacySettings
}

export interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  tripReminders: boolean
  newMessages: boolean
  connectionRequests: boolean
}

export interface PrivacySettings {
  profileVisibility: string
  showEmail: boolean
  showLocation: boolean
  allowMessages: boolean
}

// Updated to match actual Amplify schema
export interface Trip {
  id: string
  title: string
  description?: string
  startDate: string
  endDate: string
  isPrivate?: boolean
  ownerId: string
  createdAt: string
  updatedAt: string
}

// Legacy fields for future use
export interface TripExtended extends Trip {
  status?: string
  budget?: number
  currency?: string
  isPublic?: boolean
  user?: User
  destination?: Destination
  travelers?: {
    items: TripTraveler[]
  }
  posts?: {
    items: TripPost[]
  }
  expenses?: {
    items: Expense[]
  }
  itinerary?: {
    items: ItineraryItem[]
  }
}

export interface Destination {
  id: string
  country: string
  city: string
  state?: string
  latitude: number
  longitude: number
  timezone: string
  currency: string
  language: string
}

export interface TripTraveler {
  id: string
  user: User
  role: string
  status: string
  joinedAt: string
}

export interface TripPost {
  id: string
  title: string
  content: string
  location?: string
  tags: string[]
  isPublic: boolean
  createdAt: string
  updatedAt: string
  user: User
  trip: Trip
  images?: {
    items: PostImage[]
  }
  likes?: {
    items: PostLike[]
  }
  comments?: {
    items: PostComment[]
  }
}

export interface PostImage {
  id: string
  url: string
  caption?: string
  order: number
}

export interface PostLike {
  id: string
  user: User
  createdAt: string
}

export interface PostComment {
  id: string
  content: string
  createdAt: string
  user: User
  likes?: {
    items: PostLike[]
  }
}

export interface Expense {
  id: string
  category: string
  amount: number
  currency: string
  description?: string
  date: string
  paidBy: string
  splitBetween?: string[]
  createdAt: string
  updatedAt: string
  user: User
  trip: Trip
  receipts?: {
    items: Receipt[]
  }
}

export interface Receipt {
  id: string
  url: string
  filename: string
  uploadedAt: string
}

export interface ItineraryItem {
  id: string
  type: string
  title: string
  description?: string
  location?: string
  startTime: string
  endTime: string
  cost?: number
  currency?: string
  status: string
  notes?: string
  order: number
}

export interface TripStatistics {
  totalExpenses: number
  averageDailyExpense: number
  expenseByCategory: {
    category: string
    total: number
    percentage: number
  }[]
  travelersCount: number
  postsCount: number
  itineraryItemsCount: number
}

// Query and Mutation Input Types
export interface CreateUserInput {
  email: string
  name: string
  avatar?: string
  bio?: string
  location?: string
}

export interface UpdateUserInput {
  id: string
  name?: string
  avatar?: string
  bio?: string
  location?: string
}

export interface DeleteUserInput {
  id: string
}

// Updated to match actual Amplify schema
export interface CreateTripInput {
  title: string
  description?: string
  startDate: string
  endDate: string
  isPrivate?: boolean
  ownerId: string
}

export interface UpdateTripInput {
  id: string
  title?: string
  description?: string
  startDate?: string
  endDate?: string
  isPrivate?: boolean
}

export interface DeleteTripInput {
  id: string
}

export interface CreateTripPostInput {
  title: string
  content: string
  location?: string
  tags: string[]
  isPublic: boolean
  tripId: string
  userId: string
}

export interface UpdateTripPostInput {
  id: string
  title?: string
  content?: string
  location?: string
  tags?: string[]
  isPublic?: boolean
}

export interface DeleteTripPostInput {
  id: string
}

export interface CreatePostLikeInput {
  postId: string
  userId: string
}

export interface DeletePostLikeInput {
  id: string
}

export interface CreateExpenseInput {
  category: string
  amount: number
  currency: string
  description?: string
  date: string
  paidBy: string
  splitBetween?: string[]
  tripId: string
  userId: string
}

export interface UpdateExpenseInput {
  id: string
  category?: string
  amount?: number
  currency?: string
  description?: string
  date?: string
  paidBy?: string
  splitBetween?: string[]
}

export interface DeleteExpenseInput {
  id: string
}

// Query Response Types
export interface GetUserResponse {
  getUser: User
}

export interface ListUsersResponse {
  listUsers: {
    items: User[]
    nextToken?: string
  }
}

export interface GetTripResponse {
  getTrip: Trip
}

export interface ListUserTripsResponse {
  listTrips: {
    items: Trip[]
    nextToken?: string
  }
}

export interface GetUserFeedResponse {
  getUserFeed: TripPost[]
}

export interface ListTripPostsResponse {
  listTripPosts: {
    items: TripPost[]
    nextToken?: string
  }
}

export interface GetTripStatisticsResponse {
  getTripStatistics: TripStatistics
}

export interface SearchUsersResponse {
  searchUsers: User[]
}

export interface SearchTripsResponse {
  searchTrips: Trip[]
}