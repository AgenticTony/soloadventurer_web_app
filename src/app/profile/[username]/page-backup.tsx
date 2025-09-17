'use client'

import { useState, use } from 'react'
import { ProfileLayout } from '@/components/layout/ProfileLayout'
import { PostCard } from '@/components/features/feed/PostCard'
import { UserMiniCard } from '@/components/features/users/UserMiniCard'
import { MapPin, Globe, Calendar, Edit, Camera, Users, Bookmark } from 'lucide-react'
import { clsx } from 'clsx'

interface ProfilePageProps {
  params: Promise<{
    username: string
  }>
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const { username } = use(params)
  const [activeTab, setActiveTab] = useState('posts')

  const mockUser = {
    name: 'Sarah Chen',
    username: username,
    location: 'San Francisco, CA',
    bio: 'Adventure seeker and solo traveler exploring the world one city at a time. Always looking for the next great story to tell. 🌍✈️',
    avatar: '',
    coverImage: '',
    languages: ['English', 'Mandarin', 'Spanish'],
    travelStyles: ['Adventure', 'Cultural', 'Backpacker'],
    upcomingTrip: {
      destination: 'Costa Rica',
      date: '2024-04-01',
      duration: '2 weeks'
    },
    stats: {
      trips: 12,
      connections: 89,
      posts: 45
    },
    joinedDate: '2023-01-15'
  }

  const mockPosts = [
    {
      author: {
        name: mockUser.name,
        avatar: '',
        location: mockUser.location
      },
      content: 'Just wrapped up an amazing week in Portland! The food scene here is incredible, and I loved exploring all the hidden gardens in the city. Next stop: Seattle! 🌲',
      images: ['/api/placeholder/600/400'],
      location: 'Portland, OR',
      timestamp: '2024-03-14T16:30:00Z',
      likes: 45,
      comments: 12,
      shares: 3
    },
    {
      author: {
        name: mockUser.name,
        avatar: '',
        location: mockUser.location
      },
      content: 'Found the most amazing coffee shop in the Mission District! The barista was so friendly and gave me great local recommendations. Sometimes the best travel experiences come from talking to locals ☕️',
      images: ['/api/placeholder/400/400', '/api/placeholder/400/400'],
      location: 'San Francisco, CA',
      timestamp: '2024-03-12T10:15:00Z',
      likes: 67,
      comments: 8,
      shares: 2
    }
  ]

  const tabs = [
    { id: 'posts', label: 'Posts', icon: Camera },
    { id: 'trips', label: 'Trips', icon: Calendar },
    { id: 'photos', label: 'Photos', icon: Camera },
    { id: 'about', label: 'About', icon: Users },
    { id: 'connections', label: 'Connections', icon: Users }
  ]

  return (
    <ProfileLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
        {/* Profile Header */}
        <div className="relative">
          {/* Cover Image */}
          <div className="h-64 lg:h-80 bg-gradient-to-r from-brand-500 to-sky-500 rounded-2xl relative overflow-hidden">
            {/* Optional: Add pattern or image overlay here */}
          </div>
          
          {/* Profile Info */}
          <div className="px-6 pb-6">
            <div className="flex items-end justify-between mb-4">
              <div className="flex items-end space-x-4 -mt-12">
                {/* Avatar */}
                <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full bg-card border-4 border-card shadow-lg flex items-center justify-center">
                  <span className="text-4xl lg:text-5xl font-bold text-foreground">
                    {mockUser.name.charAt(0)}
                  </span>
                </div>
                
                <div className="pb-2">
                  <h1 className="text-2xl font-bold text-foreground">{mockUser.name}</h1>
                  <p className="text-muted-foreground">@{mockUser.username}</p>
                </div>
              </div>
              
              <button className="pb-2">
                <Edit className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Bio */}
            <p className="text-foreground mb-4">{mockUser.bio}</p>

            {/* Info Chips */}
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="flex items-center space-x-1 px-3 py-1 bg-muted rounded-full">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{mockUser.location}</span>
              </div>
              
              <div className="flex items-center space-x-1 px-3 py-1 bg-muted rounded-full">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {mockUser.languages.join(', ')}
                </span>
              </div>
              
              <div className="flex items-center space-x-1 px-3 py-1 bg-brand-50 dark:bg-brand-500/10 rounded-full">
                <Calendar className="w-4 h-4 text-brand-500" />
                <span className="text-sm text-brand-600 dark:text-brand-400">
                  {mockUser.upcomingTrip.destination} • {mockUser.upcomingTrip.duration}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex space-x-6 text-center">
              <div>
                <p className="font-semibold text-foreground">{mockUser.stats.trips}</p>
                <p className="text-sm text-muted-foreground">Trips</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">{mockUser.stats.connections}</p>
                <p className="text-sm text-muted-foreground">Connections</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">{mockUser.stats.posts}</p>
                <p className="text-sm text-muted-foreground">Posts</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  "py-3 px-1 border-b-2 font-medium text-sm transition-colors",
                  activeTab === tab.id
                    ? "border-brand-500 text-brand-600"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                )}
              >
                <tab.icon className="w-4 h-4 inline mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {activeTab === 'posts' && (
            <div className="lg:col-span-2 space-y-4">
              {mockPosts.map((post, index) => (
                <PostCard
                  key={index}
                  id={`post-${index}`}
                  author={{
                    id: `author-${index}`,
                    name: post.author.name,
                    username: mockUser.username,
                    avatar: post.author.avatar
                  }}
                  content={post.content}
                  photos={post.images?.map((url, i) => ({ id: `photo-${i}`, url, alt: `Post image ${i + 1}` }))}
                  location={post.location ? { id: post.location.toLowerCase().replace(/\s+/g, '-'), name: post.location } : undefined}
                  timestamp={post.timestamp}
                  reactions={[
                    { type: 'like' as const, count: post.likes || 0 },
                    { type: 'love' as const, count: Math.floor((post.likes || 0) * 0.3) }
                  ]}
                  commentCount={post.comments || 0}
                  shareCount={post.shares || 0}
                  onReaction={(postId, reactionType) => console.log('Reaction:', postId, reactionType)}
                  onComment={() => console.log('Comment on post')}
                  onShare={(postId) => console.log('Share:', postId)}
                  onBookmark={(postId) => console.log('Bookmark:', postId)}
                />
              ))}
            </div>
          )}
          
          {/* Sidebar for posts tab */}
          {activeTab === 'posts' && (
            <div className="lg:col-span-1 space-y-4">
              {/* User Stats Card */}
              <div className="p-6 bg-card rounded-2xl shadow-card border border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Travel Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Countries Visited</span>
                    <span className="font-semibold text-foreground">23</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Cities Explored</span>
                    <span className="font-semibold text-foreground">67</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Miles Traveled</span>
                    <span className="font-semibold text-foreground">45,892</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Photos Shared</span>
                    <span className="font-semibold text-foreground">234</span>
                  </div>
                </div>
              </div>
              
              {/* Travel Buddies */}
              <div className="p-6 bg-card rounded-2xl shadow-card border border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Travel Buddies</h3>
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-muted border-2 border-card flex items-center justify-center"
                    >
                      <span className="text-xs font-medium">U{i}</span>
                    </div>
                  ))}
                  <div className="w-10 h-10 rounded-full bg-muted border-2 border-card flex items-center justify-center">
                    <span className="text-xs font-medium">+12</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'trips' && (
            <div className="lg:col-span-3 space-y-4">
              <div className="p-6 bg-card rounded-2xl shadow-card border border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Upcoming Trips</h3>
                  <button className="text-brand-500 hover:text-brand-600">
                    Plan New Trip
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div className="p-4 bg-sun-50 dark:bg-sun-500/10 rounded-xl border border-sun-200 dark:border-sun-500/20">
                    <h4 className="font-semibold text-foreground">Costa Rica Adventure</h4>
                    <p className="text-sm text-muted-foreground">Apr 1-15, 2024 • 2 weeks</p>
                    <p className="text-sm text-sun-600 dark:text-sun-400 mt-2">
                      Exploring rainforests, beaches, and volcanoes
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="lg:col-span-2 space-y-4">
              <div className="p-6 bg-card rounded-2xl shadow-card border border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">About</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Travel Style</h4>
                    <div className="flex flex-wrap gap-2">
                      {mockUser.travelStyles.map((style, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-full text-sm font-medium"
                        >
                          {style}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-foreground mb-2">Languages</h4>
                    <div className="flex flex-wrap gap-2">
                      {mockUser.languages.map((language, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-muted rounded-full text-sm text-muted-foreground"
                        >
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-foreground mb-2">Member Since</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(mockUser.joinedDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProfileLayout>
  )
}
