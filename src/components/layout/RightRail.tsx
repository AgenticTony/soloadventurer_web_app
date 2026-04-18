'use client'

import Link from 'next/link'
import { MapPin, Users, Calendar, Sun, Cloud, CloudRain, Plus } from 'lucide-react'
import { clsx } from 'clsx'

interface CityData {
  name: string
  country: string
  temperature: number
  weather: 'sunny' | 'cloudy' | 'rainy'
  weatherIcon: string
  travelersCount: number
  trendingSpots: string[]
}

interface NearbyTraveler {
  id: string
  name: string
  distance: string
  avatar?: string
  isConnected?: boolean
}

interface UpcomingTrip {
  id: string
  title: string
  destination: string
  dates: string
  buddiesCount?: number
}

interface RightRailProps {
  currentCity?: CityData
  nearbyTravelers?: NearbyTraveler[]
  upcomingTrips?: UpcomingTrip[]
  suggestedGroups?: Array<{
    id: string
    name: string
    membersCount: number
    category: string
  }>
}

const defaultCity: CityData = {
  name: 'San Francisco',
  country: 'United States',
  temperature: 72,
  weather: 'sunny',
  weatherIcon: '☀️',
  travelersCount: 234,
  trendingSpots: ['Golden Gate Bridge', "Fisherman's Wharf", 'Alcatraz Island'],
}

const defaultTravelers: NearbyTraveler[] = [
  { id: '1', name: 'Sarah Chen', distance: '0.5 miles' },
  { id: '2', name: 'Mike Johnson', distance: '1.2 miles' },
  { id: '3', name: 'Emma Wilson', distance: '2.3 miles' },
]

const defaultTrips: UpcomingTrip[] = [
  {
    id: '1',
    title: 'Bali Adventure',
    destination: 'Bali, Indonesia',
    dates: 'Dec 15-22, 2024',
    buddiesCount: 3,
  },
  { id: '2', title: 'Tokyo Explorer', destination: 'Tokyo, Japan', dates: 'Jan 8-15, 2025' },
]

export function RightRail({
  currentCity = defaultCity,
  nearbyTravelers = defaultTravelers,
  upcomingTrips = defaultTrips,
  suggestedGroups,
}: RightRailProps) {
  const WeatherIcon = () => {
    switch (currentCity.weather) {
      case 'cloudy':
        return <Cloud className="h-6 w-6 text-gray-400" />
      case 'rainy':
        return <CloudRain className="h-6 w-6 text-blue-400" />
      default:
        return <Sun className="text-sun-500 h-6 w-6" />
    }
  }

  return (
    <aside className="no-scrollbar sticky top-16 hidden h-[calc(100vh-4rem)] w-[320px] overflow-y-auto xl:block">
      <div className="space-y-6 p-4">
        {/* City Hub Module */}
        <div className="card-base p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Current City</h3>
            <Link href={`/cities/${currentCity.name.toLowerCase().replace(' ', '-')}`}>
              <span className="text-xs font-medium text-primary hover:text-primary/80">
                View Hub
              </span>
            </Link>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">{currentCity.name}</h4>
                <p className="text-sm text-muted-foreground">{currentCity.country}</p>
              </div>
              <div className="flex items-center gap-2">
                <WeatherIcon />
                <span className="text-lg font-medium text-foreground">
                  {currentCity.temperature}°F
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{currentCity.travelersCount} travelers nearby</span>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Trending Spots</p>
              <div className="flex flex-wrap gap-1.5">
                {currentCity.trendingSpots.map((spot, index) => (
                  <span
                    key={index}
                    className="rounded-2xl bg-muted px-3 py-1.5 text-xs text-foreground"
                  >
                    {spot}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Nearby Travelers */}
        <div className="card-base p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Nearby Travelers</h3>
            <Link href="/nearby">
              <span className="text-xs font-medium text-primary hover:text-primary/80">
                See All
              </span>
            </Link>
          </div>

          <div className="space-y-3">
            {nearbyTravelers.map(traveler => (
              <div key={traveler.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-sm font-medium text-primary">
                      {traveler.name
                        .split(' ')
                        .map(n => n[0])
                        .join('')}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{traveler.name}</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {traveler.distance}
                    </p>
                  </div>
                </div>
                <button
                  className={clsx(
                    'text-xs font-medium transition-colors',
                    traveler.isConnected
                      ? 'text-connection hover:text-connection/80'
                      : 'btn-connection px-2 py-1 rounded-lg'
                  )}
                >
                  {traveler.isConnected ? 'Connected' : 'Say hi'}
                </button>
              </div>
            ))}
          </div>

          <button className="mt-4 w-full rounded-2xl border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-all duration-200 hover:bg-muted">
            Find More Travelers
          </button>
        </div>

        {/* Upcoming Trips */}
        <div className="card-base p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Upcoming Trips</h3>
            <Link href="/trips">
              <span className="text-xs font-medium text-primary hover:text-primary/80">
                View All
              </span>
            </Link>
          </div>

          <div>
            {upcomingTrips.length > 0 ? (
              upcomingTrips.map((trip, index) => (
                <Link
                  key={trip.id}
                  href={`/trips/${trip.id}`}
                  className={`block ${index > 0 ? 'mt-2' : ''}`}
                >
                  <div className="cursor-pointer rounded-2xl bg-muted p-4 transition-colors hover:bg-muted/80">
                    <h4 className="text-sm font-medium text-foreground">{trip.title}</h4>
                    <p className="mt-2 text-xs text-muted-foreground">{trip.destination}</p>
                    <div className="mt-5 flex items-center justify-between">
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {trip.dates}
                      </p>
                      {trip.buddiesCount && (
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          {trip.buddiesCount}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="py-4 text-center">
                <p className="mb-3 text-sm text-muted-foreground">No trips planned yet</p>
                <button className="mx-auto flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all duration-200 hover:bg-primary/90">
                  <Plus className="h-4 w-4" />
                  Plan a Trip
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Suggested Groups */}
        {suggestedGroups && suggestedGroups.length > 0 && (
          <div className="card-base p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Suggested Groups</h3>
              <Link href="/groups">
                <span className="text-xs font-medium text-primary hover:text-primary/80">
                  Explore
                </span>
              </Link>
            </div>

            <div className="space-y-3">
              {suggestedGroups.slice(0, 3).map(group => (
                <div key={group.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{group.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {group.category} • {group.membersCount} members
                    </p>
                  </div>
                  <button className="text-xs font-medium text-primary hover:text-primary/80">
                    Join
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Links */}
        <div className="space-y-1 px-2 text-xs text-muted-foreground">
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            <Link href="/about" className="hover:text-foreground">
              About
            </Link>
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
            <Link href="/help" className="hover:text-foreground">
              Help
            </Link>
          </div>
          <p className="opacity-60">© 2024 SoloAdventurer</p>
        </div>
      </div>
    </aside>
  )
}
