'use client'

import { useState } from 'react'
import { PostComposer } from '@/components/features/feed/PostComposer'
import { PostCard } from '@/components/features/feed/PostCard'
import { UserMiniCard } from '@/components/features/users/UserMiniCard'
import { TrendingUp, Users } from 'lucide-react'

// Mock data for development
const mockUser = {
  id: '1',
  name: 'John Doe',
  username: 'johndoe',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
  location: 'San Francisco, CA',
  isVerified: true,
  stats: {
    trips: 12,
    connections: 89,
    posts: 45,
  },
}

const mockPosts = [
  {
    id: '1',
    author: {
      id: '2',
      name: 'Sarah Chen',
      username: 'sarahchen',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
      isVerified: true,
    },
    content:
      'Just discovered the most amazing hidden beach in Uluwatu! 🏖️ The sunset here is absolutely breathtaking. Fellow solo travelers, this is a must-visit spot! The water is crystal clear and perfect for swimming.',
    photos: [
      {
        id: '1',
        url: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800',
        alt: 'Beautiful beach sunset',
      },
      {
        id: '2',
        url: 'https://images.unsplash.com/photo-1454391304352-2bf4678b1a7a?w=800',
        alt: 'Crystal clear water',
      },
    ],
    location: {
      id: 'bali',
      name: 'Uluwatu',
      country: 'Indonesia',
    },
    timestamp: new Date('2024-01-15T10:00:00Z'), // Fixed timestamp
    reactions: [
      { type: 'love' as const, count: 45, hasReacted: true },
      { type: 'like' as const, count: 23 },
    ],
    commentCount: 18,
    shareCount: 5,
    isBookmarked: false,
  },
  {
    id: '2',
    author: {
      id: '3',
      name: 'Mike Johnson',
      username: 'mikej',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    },
    content:
      "Pro tip for budget travelers in Tokyo: Check out the convenience stores for amazing and affordable meals! 🍱 The quality is incredible and you can eat well for under $5. Also, don't miss the 100 yen stores for travel essentials.",
    location: {
      id: 'tokyo',
      name: 'Tokyo',
      country: 'Japan',
    },
    trip: {
      id: '1',
      name: 'Japan Adventure 2024',
    },
    timestamp: new Date('2024-01-15T07:00:00Z'), // Fixed timestamp
    reactions: [
      { type: 'like' as const, count: 67 },
      { type: 'love' as const, count: 34 },
    ],
    commentCount: 23,
    shareCount: 12,
    isBookmarked: true,
  },
  {
    id: '3',
    author: {
      id: '4',
      name: 'Emma Wilson',
      username: 'emmawilson',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
      isVerified: true,
    },
    content:
      'After 3 months of solo travel, here are my top safety tips:\n\n1. Always share your itinerary with someone back home\n2. Keep digital copies of important documents\n3. Trust your instincts - if something feels off, it probably is\n4. Join local Facebook groups for real-time advice\n5. Download offline maps before exploring\n\nStay safe out there, fellow adventurers! 💪',
    photos: [
      {
        id: '3',
        url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800',
        alt: 'Travel essentials',
      },
    ],
    timestamp: new Date('2024-01-15T04:00:00Z'), // Fixed timestamp
    reactions: [
      { type: 'like' as const, count: 89 },
      { type: 'love' as const, count: 45 },
    ],
    commentCount: 56,
    shareCount: 34,
    isBookmarked: false,
  },
]

const suggestedTravelers = [
  {
    id: '5',
    name: 'Alex Rivera',
    username: 'alexrivera',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop',
    location: 'Barcelona, Spain',
    bio: 'Digital nomad exploring Europe. Love meeting fellow travelers!',
    languages: ['English', 'Spanish', 'Portuguese'],
    travelStyles: ['Adventure', 'Cultural', 'Foodie'],
    stats: {
      trips: 23,
      connections: 156,
      posts: 89,
    },
    currentTrip: {
      id: '2',
      name: 'European Summer',
      destination: 'Barcelona → Paris → Amsterdam',
    },
  },
  {
    id: '6',
    name: 'Luna Park',
    username: 'lunapark',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop',
    location: 'Seoul, South Korea',
    bio: 'Solo female traveler | Photography enthusiast | Coffee addict ☕',
    languages: ['English', 'Korean', 'Mandarin'],
    travelStyles: ['Urban', 'Cultural', 'Solo'],
    isVerified: true,
    stats: {
      trips: 45,
      connections: 234,
      posts: 167,
    },
  },
]

type Post = {
  id: string
  author: {
    id: string
    name: string
    username: string
    avatar?: string
    isVerified?: boolean
  }
  content: string
  photos?: Array<{
    id: string
    url: string
    alt?: string
  }>
  location?: {
    id: string
    name: string
    country?: string
  }
  trip?: {
    id: string
    name: string
  }
  timestamp: Date | string
  reactions: Array<{
    type: 'like' | 'love'
    count: number
    hasReacted?: boolean
  }>
  commentCount: number
  shareCount: number
  isBookmarked?: boolean
}

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>(mockPosts)

  const handleNewPost = (content: string, images?: File[], location?: string) => {
    const newPost: Post = {
      id: Date.now().toString(),
      author: {
        id: mockUser.id,
        name: mockUser.name,
        username: mockUser.username,
        avatar: mockUser.avatar,
        isVerified: mockUser.isVerified,
      },
      content: content,
      photos: [], // Would handle file upload in real app
      location: location
        ? { id: location.toLowerCase().replace(/\s+/g, '-'), name: location }
        : undefined,
      timestamp: new Date(),
      reactions: [],
      commentCount: 0,
      shareCount: 0,
      isBookmarked: false,
    }
    setPosts([newPost, ...posts])
  }

  const handleReaction = (postId: string, reactionType: string) => {
    setPosts(
      posts.map(post => {
        if (post.id === postId) {
          const updatedReactions = post.reactions.map(r => {
            if (r.type === reactionType) {
              return {
                ...r,
                count: r.hasReacted ? r.count - 1 : r.count + 1,
                hasReacted: !r.hasReacted,
              }
            }
            return r
          })

          // Add new reaction if it doesn't exist
          if (!updatedReactions.find(r => r.type === reactionType)) {
            updatedReactions.push({
              type: reactionType as 'like' | 'love',
              count: 1,
              hasReacted: true,
            })
          }

          return { ...post, reactions: updatedReactions }
        }
        return post
      })
    )
  }

  const handleBookmark = (postId: string) => {
    setPosts(
      posts.map(post => (post.id === postId ? { ...post, isBookmarked: !post.isBookmarked } : post))
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold text-foreground">Your Feed</h1>
        <p className="mt-1 text-sm text-muted-foreground">Discover stories from fellow travelers</p>
      </div>

      {/* Post Composer */}
      <PostComposer user={mockUser} onPost={handleNewPost} />

      {/* Trending Topics */}
      <div className="card-base p-4">
        <div className="mb-3 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground">Trending in Travel</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-2xl bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
            #DigitalNomadLife
          </span>
          <span className="rounded-2xl bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
            #BaliAdventures
          </span>
          <span className="rounded-2xl bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
            #SoloTravelTips
          </span>
          <span className="rounded-2xl bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
            #BudgetTravel
          </span>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-8">
        {posts.map(post => (
          <PostCard
            key={post.id}
            {...post}
            onReaction={handleReaction}
            onComment={() => console.log('Comment functionality')}
            onShare={id => console.log('Share:', id)}
            onBookmark={handleBookmark}
          />
        ))}
      </div>

      {/* Suggested Travelers */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground">Travelers You May Know</h2>
        </div>

        {suggestedTravelers.map(traveler => (
          <UserMiniCard
            key={traveler.id}
            user={traveler}
            showActions
            onFollow={id => console.log('Follow:', id)}
            onMessage={id => console.log('Message:', id)}
          />
        ))}
      </div>

      {/* Load More */}
      <div className="py-8 text-center">
        <button className="rounded-2xl bg-muted px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/80">
          Load More Posts
        </button>
      </div>
    </div>
  )
}
