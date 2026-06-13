'use client'

import Link from 'next/link'
import { MapPin, Users, ChevronRight, Hash, Sparkles } from 'lucide-react'
import { clsx } from 'clsx'

interface CityData {
  name: string
  country: string
  travelersCount: number
  trendingSpots: string[]
}

interface NearbyTraveler {
  id: string
  name: string
  distance: string
  isConnected?: boolean
}

interface TrendingTag {
  name: string
  postCount: number
}

interface RightRailProps {
  currentCity?: CityData
  nearbyTravelers?: NearbyTraveler[]
  trendingTags?: TrendingTag[]
}

const defaultCity: CityData = {
  name: 'San Francisco',
  country: 'United States',
  travelersCount: 234,
  trendingSpots: ['Golden Gate Bridge', "Fisherman's Wharf", 'Alcatraz Island'],
}

const defaultTravelers: NearbyTraveler[] = [
  { id: '1', name: 'Sarah Chen', distance: '0.5 miles' },
  { id: '2', name: 'Mike Johnson', distance: '1.2 miles' },
  { id: '3', name: 'Emma Wilson', distance: '2.3 miles' },
]

const defaultTags: TrendingTag[] = [
  { name: 'solotravel', postCount: 1243 },
  { name: 'hiddengems', postCount: 892 },
  { name: 'streetfood', postCount: 567 },
]

export function RightRail({
  currentCity = defaultCity,
  nearbyTravelers = defaultTravelers,
  trendingTags = defaultTags,
}: RightRailProps) {
  return (
    <aside className="no-scrollbar sticky top-16 hidden h-[calc(100vh-4rem)] overflow-y-auto xl:block">
      <div className="space-y-5 p-4">
        {/* Current City */}
        <div className="card-base p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">{currentCity.name}</h3>
            <Link href={`/cities/${currentCity.name.toLowerCase().replace(' ', '-')}`}>
              <span className="text-xs font-medium text-primary hover:text-primary/80">
                View Hub
              </span>
            </Link>
          </div>

          <p className="mb-3 text-sm text-muted-foreground">{currentCity.country}</p>

          <Link
            href="/discover"
            className="group flex items-center gap-2 text-sm font-medium text-brand transition-colors hover:text-brand/80"
          >
            <Users className="h-4 w-4" />
            <span>{currentCity.travelersCount} travelers nearby</span>
            <ChevronRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        </div>

        {/* Connect With */}
        <div className="card-base p-4">
          <div className="mb-3 rounded-xl border border-brand/10 bg-brand/5 px-3 py-2 text-center text-xs text-brand">
            All travelers verified with photo check
          </div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 font-semibold text-foreground">
              <Sparkles className="h-4 w-4 text-connection" />
              Connect With
            </h3>
            <Link href="/discover">
              <span className="text-xs font-medium text-primary hover:text-primary/80">
                See All
              </span>
            </Link>
          </div>

          <div className="space-y-3">
            {nearbyTravelers.map(traveler => (
              <div key={traveler.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-connection/10 ring-1 ring-connection/20">
                    <span className="text-xs font-medium text-connection">
                      {traveler.name
                        .split(' ')
                        .map(n => n[0])
                        .join('')}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{traveler.name}</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 text-brand" />
                      {traveler.distance}
                    </p>
                  </div>
                </div>
                <button
                  className={clsx(
                    'text-xs font-medium transition-colors',
                    traveler.isConnected
                      ? 'text-connection hover:text-connection/80'
                      : 'btn-connection rounded-lg px-2 py-1'
                  )}
                >
                  {traveler.isConnected ? 'Connected' : 'Say hi'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Trending — compact inline list */}
        <div className="px-1">
          <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Hash className="h-3 w-3" />
            Trending
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {trendingTags.map(tag => (
              <button
                key={tag.name}
                className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-brand/10 hover:text-brand"
              >
                #{tag.name}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="space-y-1 px-1 pt-2 text-xs text-muted-foreground">
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
          <p className="opacity-60">&copy; 2024 SoloAdventurer</p>
        </div>
      </div>
    </aside>
  )
}
