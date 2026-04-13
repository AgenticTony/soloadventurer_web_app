'use client'

import { useState, useEffect } from 'react'
import { ProfileLayout } from '@/components/layout/ProfileLayout'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { listTrips } from '@/lib/api'
import type { Trip } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Compass,
  CameraIcon,
  Map,
  TrendingUp,
  Globe,
  MapPin,
  Users,
  Mountain,
  Camera,
  Shield,
  Calendar,
  Award
} from 'lucide-react'
import { WorldMap } from '@/components/features/profile/WorldMap'
import { AchievementGrid } from '@/components/features/profile/AchievementGrid'
import { ProfileCompletionTracker } from '@/components/features/profile/ProfileCompletionTracker'

export default function ProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('adventures')
  const [userTrips, setUserTrips] = useState<Trip[]>([])
  const [tripsLoading, setTripsLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    setTripsLoading(true)
    listTrips(user.id, { limit: 10 })
      .then(({ items }) => setUserTrips(items))
      .catch(() => setUserTrips([]))
      .finally(() => setTripsLoading(false))
  }, [user])

  if (!user) {
    return (
      <ProfileLayout>
        <div className="flex min-h-screen items-center justify-center">
          <Card className="p-8">
            <CardContent>
              <p className="text-lg text-muted-foreground">Please log in to view your profile.</p>
              <Button onClick={() => router.push('/sign-in')} className="mt-4">
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </ProfileLayout>
    )
  }

  const tabs = [
    { id: 'adventures', label: 'My Adventures', icon: Compass },
    { id: 'photos', label: 'Photo Gallery', icon: CameraIcon },
    { id: 'map', label: 'Travel Map', icon: Map },
    { id: 'stats', label: 'Statistics', icon: TrendingUp },
  ]

  const stats = [
    { label: 'Countries Visited', value: 0, icon: Globe, color: 'from-blue-500 to-cyan-600' },
    { label: 'Cities Explored', value: 0, icon: MapPin, color: 'from-purple-500 to-pink-600' },
    { label: 'Travel Buddies', value: 0, icon: Users, color: 'from-green-500 to-teal-600' },
    { label: 'Adventures', value: userTrips.length, icon: Mountain, color: 'from-orange-500 to-red-600' },
  ]

  return (
    <ProfileLayout>
      {/* Hero Section */}
      <div className="relative h-[420px] bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500">
        <div className="absolute inset-0 bg-black/20" />

        {/* Title centered */}
        <div className="relative flex h-full items-center justify-center px-4 text-white">
          <div className="text-center">
            <h1 className="mb-2 text-4xl font-bold md:text-5xl">
              {user.name && !user.name.includes('@')
                ? user.name
                : user.email?.split('@')[0] || 'Solo Adventurer'}
            </h1>
            <p className="opacity-80">Welcome to your profile</p>
          </div>
        </div>

        {/* Bottom-right actions */}
        <div className="absolute bottom-4 right-4 z-20 flex gap-3">
          <Button
            onClick={() => router.push(`/profile/${user.email.split('@')[0]}`)}
            size="sm"
            variant="outline"
            className="border-white text-white hover:bg-white/20"
          >
            <Users className="mr-2 h-4 w-4" />
            View Profile
          </Button>
          <Button
            size="sm"
            className="border border-white/30 bg-white/20 text-white hover:bg-white/30"
          >
            <Camera className="mr-2 h-4 w-4" />
            Upload Background
          </Button>
        </div>

        {/* Avatar bottom-left overlapping next section */}
        <div className="absolute -bottom-20 left-6 z-20">
          <div className="relative h-40 w-40 overflow-hidden rounded-full shadow-2xl ring-4 ring-background">
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-400 to-purple-700">
              <span className="text-6xl font-bold text-white">
                {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </span>
            </div>
            {user.emailVerified && (
              <div className="absolute -bottom-1 -right-1 rounded-full bg-green-500 p-2 ring-2 ring-background">
                <Shield className="h-5 w-5 text-white" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container relative mx-auto -mt-10 px-4 py-16">
        {/* Bio and Achievements Grid - 50/50 Layout */}
        <div className="mb-8 grid gap-8 lg:grid-cols-2">
          {/* Bio Card - 50% Width */}
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Bio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Location */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm text-muted-foreground">Location</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    defaultValue={user.location || ''}
                    placeholder="Add your location"
                    className="w-64 rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <Button size="sm" variant="outline">
                    Save
                  </Button>
                </div>
              </div>

              {/* Member Since */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm text-muted-foreground">Member Since</span>
                </div>
                <div className="text-sm text-foreground">
                  {user.createdAt ? new Date(user.createdAt).getFullYear() : '2024'}
                </div>
              </div>

              {/* Travel Preferences */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Compass className="h-4 w-4" />
                  <span className="text-sm text-muted-foreground">Travel Preferences</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Solo', 'Budget', 'Adventure', 'Cultural'].map(pref => (
                    <label
                      key={pref}
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-sm text-foreground"
                    >
                      <input type="checkbox" className="accent-brand-500" />
                      {pref}
                    </label>
                  ))}
                </div>
              </div>

              {/* Travel Interests */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CameraIcon className="h-4 w-4" />
                  <span className="text-sm text-muted-foreground">Interests</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Food', 'Hiking', 'Photography', 'History'].map(interest => (
                    <label
                      key={interest}
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-sm text-foreground"
                    >
                      <input type="checkbox" className="accent-brand-500" />
                      {interest}
                    </label>
                  ))}
                </div>
              </div>

              {/* Privacy Setting */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm text-muted-foreground">Bio Visibility</span>
                </div>
                <select className="w-64 rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500">
                  <option value="everyone">Everyone</option>
                  <option value="connections">Connections only</option>
                  <option value="private">Only me</option>
                </select>
              </div>

              {/* World Map Section */}
              <div className="border-t pt-6">
                <WorldMap
                  visitedCountries={['USA', 'GBR', 'FRA', 'DEU', 'JPN', 'AUS']} // Sample visited countries
                  className="mt-4"
                />
              </div>

              <div className="flex justify-end">
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>

          {/* Achievements Card - 50% Width */}
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Your Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AchievementGrid
                countriesVisited={0}
                citiesExplored={0}
                hasProfilePhoto={false}
                hasCompletedBio={!!(user.bio && user.bio.length > 10)}
                hasRecommendedFriend={false}
                hasCreatedTrip={false}
                emailVerified={user.emailVerified || false}
                memberSince={user.createdAt || new Date().toISOString()}
              />
            </CardContent>
          </Card>
        </div>
        {/* Profile Completion Tracker */}
        <ProfileCompletionTracker />

        {/* Stats Grid */}
        <div className="mb-16 grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map(stat => (
            <div
              key={stat.label}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br p-6 text-white ${stat.color} transform cursor-pointer transition-transform hover:scale-105`}
            >
              <div className="relative z-10">
                <div className="mb-4 inline-flex rounded-lg bg-white/20 p-3">
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="text-4xl font-bold">{stat.value}</div>
                <div className="mt-2 text-sm opacity-90">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex justify-center">
            <div className="inline-flex rounded-full bg-muted p-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-full px-6 py-3 font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-background text-foreground shadow-lg'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <tab.icon className="mr-2 inline h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'adventures' && (
            <div>
              {tripsLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-4">
                        <div className="h-4 bg-muted rounded mb-2"></div>
                        <div className="h-3 bg-muted rounded w-2/3"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : userTrips.length === 0 ? (
                <div className="py-16 text-center">
                  <Mountain className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                  <h3 className="mb-2 text-2xl font-bold">No Adventures Yet</h3>
                  <p className="mb-6 text-muted-foreground">
                    Start your journey by sharing your first travel story!
                  </p>
                  <Button onClick={() => router.push('/trips')}>
                    <Compass className="mr-2 h-4 w-4" />
                    Plan Your First Trip
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {userTrips.map((trip) => (
                    <Card key={trip.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-lg mb-2">{trip.title}</h4>
                        {trip.description && (
                          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                            {trip.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-brand-100 text-brand-800">
                            {trip.isPrivate ? 'Private' : 'Public'}
                          </span>
                          <time className="text-xs text-muted-foreground">
                            {new Date(trip.startDate).toLocaleDateString()}
                          </time>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'map' && (
            <div className="flex h-[500px] items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
              <div className="text-center">
                <Map className="mx-auto mb-4 h-16 w-16 text-blue-500" />
                <h3 className="mb-2 text-2xl font-bold">Your Travel Map</h3>
                <p className="mb-6 text-muted-foreground">
                  Add your first destination to see it on the map!
                </p>
                <Button variant="outline">
                  <MapPin className="mr-2 h-4 w-4" />
                  Add Destination
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="py-16 text-center">
              <Camera className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
              <h3 className="mb-2 text-2xl font-bold">No Photos Yet</h3>
              <p className="mb-6 text-muted-foreground">
                Share your travel memories with the community!
              </p>
              <Button>
                <Camera className="mr-2 h-4 w-4" />
                Upload Photos
              </Button>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Views</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-2 text-3xl font-bold">0</div>
                  <p className="text-muted-foreground">People who viewed your profile this month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Engagement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-2 text-3xl font-bold">0</div>
                  <p className="text-muted-foreground">Total likes and comments on your posts</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Connection Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-2 text-3xl font-bold">0</div>
                  <p className="text-muted-foreground">Travelers wanting to connect with you</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Travel Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-2 text-3xl font-bold">0</div>
                  <p className="text-muted-foreground">
                    Complete your profile to increase your score
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </ProfileLayout>
  )
}
