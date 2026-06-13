export interface ItineraryItem {
  id: string
  title: string
  description?: string
  location?: string
  startTime?: string
  endTime?: string
  type: 'activity' | 'transport' | 'accommodation' | 'meal' | 'other'
  order: number
  completed?: boolean
}

export interface TripCoordinates {
  latitude: number
  longitude: number
}

export interface Trip {
  id: string
  title: string
  description: string
  location: string
  coordinates?: TripCoordinates
  startDate: string
  endDate: string
  status: 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  createdAt: string
  updatedAt: string
  owner: string
  ownerId: string
  isPrivate: boolean
  itinerary?: ItineraryItem[]
}

export interface TripPost {
  id: string
  tripId: string
  title: string
  content: string
  location?: string
  images?: string[]
  likes: string[]
  comments: PostComment[]
  createdAt: string
  updatedAt: string
  author: {
    id: string
    name: string
    email: string
  }
}

export interface PostComment {
  id: string
  content: string
  createdAt: string
  updatedAt: string
  author: {
    id: string
    name: string
    email: string
  }
}

export interface CreateTripInput {
  title: string
  description: string
  location: string
  startDate: string
  endDate: string
  isPrivate?: boolean
  itinerary?: ItineraryItem[]
}

export interface UpdateTripInput {
  id: string
  title?: string
  description?: string
  location?: string
  startDate?: string
  endDate?: string
  status?: 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  isPrivate?: boolean
  itinerary?: ItineraryItem[]
}

export interface CreatePostInput {
  tripId: string
  title: string
  content: string
  location?: string
  images?: string[]
}
