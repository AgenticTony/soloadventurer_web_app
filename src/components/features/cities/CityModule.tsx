'use client'

import { useState } from 'react'
import { MapPin, Users, Calendar, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CityModuleProps {
  city: {
    name: string
    country: string
    temperature: number
    weather: string
    travelersCount: number
    trendingSpots: string[]
    upcomingEvents: Array<{
      title: string
      date: string
      attendees: number
    }>
  }
  onViewCity?: () => void
}

export function CityModule({ city, onViewCity }: CityModuleProps) {
  const [selectedTab, setSelectedTab] = useState<'spots' | 'events' | 'travelers'>('spots')

  const weatherIcons: Record<string, string> = {
    sunny: '☀️',
    cloudy: '☁️',
    rainy: '🌧️',
    snowy: '❄️',
    stormy: '⛈️',
    partly_cloudy: '⛅',
  }

  const getWeatherIcon = (weather: string) => {
    const key = weather.toLowerCase().replace(' ', '_')
    return weatherIcons[key] || '🌤️'
  }

  return (
    <div className="mb-6 rounded-2xl bg-card p-4 shadow-card">
      {/* City Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="flex items-center text-lg font-semibold text-foreground">
            <MapPin className="mr-2 h-5 w-5 text-brand-500" />
            {city.name}
          </h3>
          <p className="text-sm text-muted-foreground">{city.country}</p>
        </div>

        {/* Weather Widget */}
        <div className="flex items-center space-x-2">
          <div className="text-2xl">{getWeatherIcon(city.weather)}</div>
          <div className="text-right">
            <p className="text-lg font-semibold text-foreground">{city.temperature}°F</p>
            <p className="text-xs capitalize text-muted-foreground">{city.weather}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-muted p-3 text-center">
          <Users className="mx-auto mb-1 h-5 w-5 text-brand-500" />
          <p className="text-xs text-muted-foreground">Travelers</p>
          <p className="font-semibold text-foreground">{city.travelersCount}</p>
        </div>

        <div className="rounded-xl bg-muted p-3 text-center">
          <TrendingUp className="mx-auto mb-1 h-5 w-5 text-sun-500" />
          <p className="text-xs text-muted-foreground">Hot Spots</p>
          <p className="font-semibold text-foreground">{city.trendingSpots.length}</p>
        </div>

        <div className="rounded-xl bg-muted p-3 text-center">
          <Calendar className="mx-auto mb-1 h-5 w-5 text-coral-500" />
          <p className="text-xs text-muted-foreground">Events</p>
          <p className="font-semibold text-foreground">{city.upcomingEvents.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex space-x-1 rounded-lg bg-muted p-1">
        {[
          { key: 'spots', label: 'Spots', icon: MapPin },
          { key: 'events', label: 'Events', icon: Calendar },
          { key: 'travelers', label: 'Travelers', icon: Users },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setSelectedTab(key as 'spots' | 'events' | 'travelers')}
            className={clsx(
              'flex flex-1 items-center justify-center space-x-1 rounded-md px-3 py-2 transition-colors',
              selectedTab === key
                ? 'bg-card text-brand-500 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mb-4 space-y-3">
        {selectedTab === 'spots' && (
          <div>
            <h4 className="mb-2 text-sm font-medium text-foreground">Trending Spots</h4>
            <div className="flex flex-wrap gap-2">
              {city.trendingSpots.map((spot, index) => (
                <span
                  key={index}
                  className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                >
                  {spot}
                </span>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'events' && (
          <div>
            <h4 className="mb-2 text-sm font-medium text-foreground">Upcoming Events</h4>
            <div className="space-y-2">
              {city.upcomingEvents.map((event, index) => (
                <div key={index} className="rounded-lg bg-muted p-2">
                  <p className="text-sm font-medium text-foreground">{event.title}</p>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{event.date}</span>
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{event.attendees}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'travelers' && (
          <div>
            <h4 className="mb-2 text-sm font-medium text-foreground">Active Travelers</h4>
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-muted p-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted-foreground/20">
                      <span className="text-xs font-medium text-muted-foreground">T{i}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Traveler {i}</p>
                      <p className="text-xs text-muted-foreground">Exploring now</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs text-connection hover:text-connection/80"
                  >
                    Say hi
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Button */}
      <Button
        onClick={onViewCity}
        className="w-full bg-brand-500 py-2 text-white transition-colors hover:bg-brand-600"
      >
        View City Hub
      </Button>
    </div>
  )
}

function clsx(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}
