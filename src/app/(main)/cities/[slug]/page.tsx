'use client'

import { useState, use } from 'react'
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

  const mockCity = {
    name: slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' '),
    country: 'United States',
    temperature: 68,
    weather: 'Partly Cloudy',
    travelersCount: 234,
    trendingSpots: [
      'Golden Gate Bridge',
      "Fisherman's Wharf",
      'Mission District',
      'Alcatraz Island',
      'Chinatown',
      'Lombard Street',
      'Union Square',
      'Golden Gate Park',
    ],
    upcomingEvents: [
      {
        title: 'Food Truck Festival',
        date: 'Mar 20, 2024',
        attendees: 45,
        location: 'Golden Gate Park',
      },
      {
        title: 'Solo Traveler Meetup',
        date: 'Mar 22, 2024',
        attendees: 12,
        location: 'Mission District',
      },
      {
        title: 'Street Art Tour',
        date: 'Mar 25, 2024',
        attendees: 28,
        location: 'Mission District',
      },
      {
        title: 'Photography Workshop',
        date: 'Mar 28, 2024',
        attendees: 15,
        location: 'Golden Gate Park',
      },
    ],
    quickFacts: {
      population: '874,000',
      bestTimeToVisit: 'Sep-Nov',
      currency: 'USD',
      language: 'English',
      timeZone: 'PST',
    },
  }

  const mockPosts = [
    {
      author: {
        name: 'Alex Rodriguez',
        avatar: '',
        location: mockCity.name,
      },
      content: `The sunset at ${mockCity.quickFacts.bestTimeToVisit === 'Sep-Nov' ? 'Baker Beach' : 'the waterfront'} was absolutely incredible tonight! The way the light hits the bridge is just magical. Can't believe I almost missed this! 🌅`,
      images: ['/api/placeholder/600/400'],
      location: mockCity.name,
      timestamp: '2024-03-15T18:30:00Z',
      likes: 89,
      comments: 15,
      shares: 4,
    },
    {
      author: {
        name: 'Maya Patel',
        avatar: '',
        location: mockCity.name,
      },
      content: `Just discovered the most amazing hidden coffee shop in the Mission! The barista gave me great local recommendations and the pastries were to die for. Sometimes the best experiences come from talking to locals ☕️`,
      images: ['/api/placeholder/400/400', '/api/placeholder/400/400'],
      location: mockCity.name,
      timestamp: '2024-03-15T14:20:00Z',
      likes: 67,
      comments: 12,
      shares: 3,
    },
  ]

  const mockTravelers = [
    {
      name: 'Emma Wilson',
      location: 'Portland, OR',
      languages: ['English', 'Spanish'],
      travelStyles: ['Backpacker', 'Adventure'],
      upcomingTrip: {
        destination: 'Costa Rica',
        date: '2024-04-01',
      },
      stats: {
        trips: 12,
        connections: 89,
        posts: 45,
      },
    },
    {
      name: 'David Chen',
      location: 'Seattle, WA',
      languages: ['English', 'Mandarin'],
      travelStyles: ['Digital Nomad', 'Cultural'],
      upcomingTrip: {
        destination: 'Portugal',
        date: '2024-04-15',
      },
      stats: {
        trips: 8,
        connections: 56,
        posts: 23,
      },
    },
    {
      name: 'Lisa Park',
      location: 'Los Angeles, CA',
      languages: ['English', 'Korean'],
      travelStyles: ['Foodie', 'Cultural'],
      upcomingTrip: {
        destination: 'Japan',
        date: '2024-05-01',
      },
      stats: {
        trips: 15,
        connections: 120,
        posts: 67,
      },
    },
  ]

  const tabs = [
    { id: 'feed', label: 'Feed', icon: MessageCircle },
    { id: 'spots', label: 'Spots', icon: MapPin },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'travelers', label: 'Travelers', icon: Users },
    { id: 'photos', label: 'Photos', icon: Camera },
  ]

  return (
    <div className="space-y-6">
      {/* City Hero */}
      <div className="relative h-64 overflow-hidden rounded-2xl bg-gradient-to-r from-brand-500 to-sky-500">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h1 className="mb-2 text-3xl font-bold">{mockCity.name}</h1>
          <p className="text-lg opacity-90">{mockCity.country}</p>
        </div>
      </div>

      {/* Quick Facts */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <div className="rounded-xl bg-card p-4 text-center shadow-card">
          <Users className="mx-auto mb-2 h-6 w-6 text-brand-500" />
          <p className="font-semibold text-foreground">{mockCity.quickFacts.population}</p>
          <p className="text-xs text-muted-foreground">Population</p>
        </div>
        <div className="rounded-xl bg-card p-4 text-center shadow-card">
          <Star className="mx-auto mb-2 h-6 w-6 text-sun-500" />
          <p className="font-semibold text-foreground">{mockCity.quickFacts.bestTimeToVisit}</p>
          <p className="text-xs text-muted-foreground">Best Time</p>
        </div>
        <div className="rounded-xl bg-card p-4 text-center shadow-card">
          <MapPin className="mx-auto mb-2 h-6 w-6 text-coral-500" />
          <p className="font-semibold text-foreground">{mockCity.quickFacts.currency}</p>
          <p className="text-xs text-muted-foreground">Currency</p>
        </div>
        <div className="rounded-xl bg-card p-4 text-center shadow-card">
          <MessageCircle className="mx-auto mb-2 h-6 w-6 text-sky-500" />
          <p className="font-semibold text-foreground">{mockCity.quickFacts.language}</p>
          <p className="text-xs text-muted-foreground">Language</p>
        </div>
        <div className="rounded-xl bg-card p-4 text-center shadow-card">
          <Calendar className="mx-auto mb-2 h-6 w-6 text-brand-500" />
          <p className="font-semibold text-foreground">{mockCity.quickFacts.timeZone}</p>
          <p className="text-xs text-muted-foreground">Time Zone</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Feed */}
        <div className="space-y-6 lg:col-span-2">
          {/* Tabs */}
          <div className="border-b border-border">
            <nav className="flex space-x-8">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    'flex items-center space-x-2 border-b-2 px-1 py-3 text-sm font-medium transition-colors',
                    activeTab === tab.id
                      ? 'border-brand-500 text-brand-600'
                      : 'border-transparent text-muted-foreground hover:border-muted-foreground hover:text-foreground'
                  )}
                >
                  <tab.icon className="h-4 w-4" />
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
                    avatar: post.author.avatar,
                  }}
                  content={post.content}
                  photos={post.images?.map((url, i) => ({
                    id: `photo-${i}`,
                    url,
                    alt: `Post image ${i + 1}`,
                  }))}
                  location={
                    post.location
                      ? {
                          id: post.location.toLowerCase().replace(/\s+/g, '-'),
                          name: post.location,
                        }
                      : undefined
                  }
                  timestamp={post.timestamp}
                  reactions={[
                    { type: 'like' as const, count: post.likes || 0 },
                    { type: 'love' as const, count: Math.floor((post.likes || 0) * 0.3) },
                  ]}
                  commentCount={post.comments || 0}
                  shareCount={post.shares || 0}
                  onReaction={(postId, reactionType) =>
                    console.log('Reaction:', postId, reactionType)
                  }
                  onComment={() => console.log('Comment on post')}
                  onShare={postId => console.log('Share:', postId)}
                  onBookmark={postId => console.log('Bookmark:', postId)}
                />
              ))}
            </div>
          )}

          {activeTab === 'spots' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Trending Spots</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {mockCity.trendingSpots.map((spot, index) => (
                  <div
                    key={index}
                    className="rounded-xl bg-card p-4 shadow-card transition-shadow hover:shadow-card-hover"
                  >
                    <h3 className="mb-2 font-semibold text-foreground">{spot}</h3>
                    <p className="text-sm text-muted-foreground">
                      Popular destination among travelers
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-sun-500" />
                        <span className="text-sm text-muted-foreground">4.8</span>
                      </div>
                      <button className="text-sm text-brand-500 hover:text-brand-600">
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
              <h2 className="text-xl font-semibold text-foreground">
                Active Travelers in {mockCity.name}
              </h2>
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
                      stats: traveler.stats,
                    }}
                    onFollow={(id: string) => console.log('Followed', id, traveler.name)}
                    onMessage={id => console.log('Message', id, traveler.name)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - City Info */}
        <div className="space-y-6">
          {/* City Module */}
          <CityModule city={mockCity} onViewCity={() => console.log('View city details')} />

          {/* Traveler Tips */}
          <div className="rounded-2xl bg-card p-4 shadow-card">
            <h3 className="mb-3 font-semibold text-foreground">Traveler Tips</h3>
            <div className="space-y-3">
              <div className="rounded-lg bg-muted p-3">
                <p className="text-sm text-foreground">
                  &quot;Best coffee in the Mission District is at Ritual Coffee Roasters!&quot;
                </p>
                <p className="mt-1 text-xs text-muted-foreground">- Alex R.</p>
              </div>
              <div className="rounded-lg bg-muted p-3">
                <p className="text-sm text-foreground">
                  &quot;Don&apos;t miss the sunset at Baker Beach - amazing Golden Gate views!&quot;
                </p>
                <p className="mt-1 text-xs text-muted-foreground">- Maya P.</p>
              </div>
              <div className="rounded-lg bg-muted p-3">
                <p className="text-sm text-foreground">
                  &quot;Use public transport - parking is expensive and hard to find.&quot;
                </p>
                <p className="mt-1 text-xs text-muted-foreground">- David C.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
