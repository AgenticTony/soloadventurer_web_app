export interface Trip {
  id: string
  title: string
  description: string
  location: string
  startDate: string
  endDate: string
  status: 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  createdAt: string
  updatedAt: string
  owner: string
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
}

export interface UpdateTripInput {
  id: string
  title?: string
  description?: string
  location?: string
  startDate?: string
  endDate?: string
  status?: 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
}

export interface CreatePostInput {
  tripId: string
  title: string
  content: string
  location?: string
  images?: string[]
}