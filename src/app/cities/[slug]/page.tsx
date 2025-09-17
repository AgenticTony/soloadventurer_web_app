'use client'

import { useState, use } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { CityModule } from '@/components/features/cities/CityModule'
import { PostCard } from '@/components/features/feed/PostCard'
import { UserMiniCard } from '@/components/features/users/UserMiniCard'
import { MapPin, Star, Calendar, Users, Camera, MessageCircle } from 'lucide-react'
import { clsx } from 'clsx'

interface CityPageProps {
  params: Promise<{
    slug: string
  }>
}

export default function CityPage({ params }: CityPageProps) {
  const { slug } = use(params)
  const [activeTab, setActiveTab] = useState('feed')

  const mockUser = {
    name: 'Sarah Chen',
    avatar: '',
    location: 'San Francisco, CA'
  }

  const mockCity = {
    name: slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    country: 'United States',
    temperature: 68,
    weather: 'Partly Cloudy',
    travelersCount: 234,
    trendingSpots: [
      'Golden Gate Bridge',
      'Fisherman\'s Wharf',
      'Mission District',
      'Alcatraz Island',
      'Chinatown',
      'Lombard Street',
      'Union Square',
      'Golden Gate Park'
    ],
    upcomingEvents: [
      {
        title: 'Food Truck Festival',
        date: 'Mar 20, 2024',
        attendees: 45,
        location: 'Golden Gate Park'
      },
      {
        title: 'Solo Traveler Meetup',
        date: 'Mar 22, 2024',
        attendees: 12,
        location: 'Mission District'
      },
      {
        title: 'Street Art Tour',
        date: 'Mar 25, 2024',
        attendees: 28,
        location: 'Mission District'
      },
      {
        title: 'Photography Workshop',
        date: 'Mar 28, 2024',
        attendees: 15,
        location: 'Golden Gate Park'
      }
    ],
    quickFacts: {
      population: '874,000',
      bestTimeToVisit: 'Sep-Nov',
      currency: 'USD',
      language: 'English',
      timeZone: 'PST'
    }
  }

  const mockPosts = [
    {
      author: {
        name: 'Alex Rodriguez',
        avatar: '',
        location: mockCity.name
      },
      content: `The sunset at ${mockCity.quickFacts.bestTimeToVisit === 'Sep-Nov' ? 'Baker Beach' : 'the waterfront'} was absolutely incredible tonight! The way the light hits the bridge is just magical. Can't believe I almost missed this! 🌅`,
      images: ['/api/placeholder/600/400'],
      location: mockCity.name,
      timestamp: '2024-03-15T18:30:00Z',
      likes: 89,
      comments: 15,
      shares: 4
    },
    {
      author: {
        name: 'Maya Patel',
        avatar: '',
        location: mockCity.name
      },
      content: `Just discovered the most amazing hidden coffee shop in the Mission! The barista gave me great local recommendations and the pastries were to die for. Sometimes the best experiences come from talking to locals ☕️`,
      images: ['/api/placeholder/400/400', '/api/placeholder/400/400'],
      location: mockCity.name,
      timestamp: '2024-03-15T14:20:00Z',
      likes: 67,
      comments: 12,
      shares: 3
    }
  ]

  const mockTravelers = [
    {
      name: 'Emma Wilson',
      location: 'Portland, OR',
      languages: ['English', 'Spanish'],
      travelStyles: ['Backpacker', 'Adventure'],
      upcomingTrip: {
        destination: 'Costa Rica',
        date: '2024-04-01'
      },
      stats: {
        trips: 12,
        connections: 89,
        posts: 45
      }
    },
    {
      name: 'David Chen',
      location: 'Seattle, WA',
      languages: ['English', 'Mandarin'],
      travelStyles: ['Digital Nomad', 'Cultural'],
      upcomingTrip: {
        destination: 'Portugal',
        date: '2024-04-15'
      },
      stats: {
        trips: 8,
        connections: 56,
        posts: 23
      }
    },
    {
      name: 'Lisa Park',
      location: 'Los Angeles, CA',
      languages: ['English', 'Korean'],
      travelStyles: ['Foodie', 'Cultural'],
      upcomingTrip: {
        destination: 'Japan',
        date: '2024-05-01'
      },
      stats: {
        trips: 15,
        connections: 120,
        posts: 67
      }
    }
  ]

  const tabs = [
    { id: 'feed', label: 'Feed', icon: MessageCircle },
    { id: 'spots', label: 'Spots', icon: MapPin },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'travelers', label: 'Travelers', icon: Users },
    { id: 'photos', label: 'Photos', icon: Camera }
  ]

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* City Hero */}
        <div className="relative h-64 bg-gradient-to-r from-brand-500 to-sky-500 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h1 className="text-3xl font-bold mb-2">{mockCity.name}</h1>
            <p className="text-lg opacity-90">{mockCity.country}</p>
          </div>
        </div>

        {/* Quick Facts */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-card rounded-xl shadow-card">
            <Users className="w-6 h-6 text-brand-500 mx-auto mb-2" />
            <p className="font-semibold text-foreground">{mockCity.quickFacts.population}</p>
            <p className="text-xs text-muted-foreground">Population</p>
          </div>
          <div className="text-center p-4 bg-card rounded-xl shadow-card">
            <Star className="w-6 h-6 text-sun-500 mx-auto mb-2" />
            <p className="font-semibold text-foreground">{mockCity.quickFacts.bestTimeToVisit}</p>
            <p className="text-xs text-muted-foreground">Best Time</p>
          </div>
          <div className="text-center p-4 bg-card rounded-xl shadow-card">
            <MapPin className="w-6 h-6 text-coral-500 mx-auto mb-2" />
            <p className="font-semibold text-foreground">{mockCity.quickFacts.currency}</p>
            <p className="text-xs text-muted-foreground">Currency</p>
          </div>
          <div className="text-center p-4 bg-card rounded-xl shadow-card">
            <MessageCircle className="w-6 h-6 text-sky-500 mx-auto mb-2" />
            <p className="font-semibold text-foreground">{mockCity.quickFacts.language}</p>
            <p className="text-xs text-muted-foreground">Language</p>
          </div>
          <div className="text-center p-4 bg-card rounded-xl shadow-card">
            <Calendar className="w-6 h-6 text-brand-500 mx-auto mb-2" />
            <p className="font-semibold text-foreground">{mockCity.quickFacts.timeZone}</p>
            <p className="text-xs text-muted-foreground">Time Zone</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="border-b border-border">
              <nav className="flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={clsx(
                      "py-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2",
                      activeTab === tab.id
                        ? "border-brand-500 text-brand-600"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                    )}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'feed' && (
              <div className="space-y-4">
                {mockPosts.map((post, index) => (
                  <PostCard
                    key={index}
                    id={`post-${index}`}
                    author={{
                      id: `author-${index}`,
                      name: post.author.name,
                      username: `author-${index}`,
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

            {activeTab === 'spots' && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Trending Spots</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {mockCity.trendingSpots.map((spot, index) => (
                    <div key={index} className="p-4 bg-card rounded-xl shadow-card hover:shadow-card-hover transition-shadow">
                      <h3 className="font-semibold text-foreground mb-2">{spot}</h3>
                      <p className="text-sm text-muted-foreground">Popular destination among travelers</p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-sun-500" />
                          <span className="text-sm text-muted-foreground">4.8</span>
                        </div>
                        <button className="text-brand-500 hover:text-brand-600 text-sm">
                          Learn More
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'travelers' && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Active Travelers in {mockCity.name}</h2>
                <div className="space-y-4">
                  {mockTravelers.map((traveler, index) => (
                    <UserMiniCard
                      key={index}
                      user={{
                        id: `traveler-${index}`,
                        name: traveler.name,
                        username: traveler.name.toLowerCase().replace(/\s+/g, ''),
                        location: traveler.location,
                        languages: traveler.languages,
                        travelStyles: traveler.travelStyles,
                        upcomingTrip: traveler.upcomingTrip,
                        stats: traveler.stats
                      }}
                      onFollow={(id) => console.log('Followed', id, traveler.name)}
                      onMessage={(id) => console.log('Message', id, traveler.name)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - City Info */}
          <div className="space-y-6">
            {/* City Module */}
            <CityModule
              city={mockCity}
              onViewCity={() => console.log('View city details')}
            />

            {/* Traveler Tips */}
            <div className="p-4 bg-card rounded-2xl shadow-card">
              <h3 className="font-semibold text-foreground mb-3">Traveler Tips</h3>
              <div className="space-y-3">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-foreground">
                    &quot;Best coffee in the Mission District is at Ritual Coffee Roasters!&quot;
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">- Alex R.</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-foreground">
                    &quot;Don&apos;t miss the sunset at Baker Beach - amazing Golden Gate views!&quot;
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">- Maya P.</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-foreground">
                    &quot;Use public transport - parking is expensive and hard to find.&quot;
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">- David C.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
