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
    partly_cloudy: '⛅'
  }

  const getWeatherIcon = (weather: string) => {
    const key = weather.toLowerCase().replace(' ', '_')
    return weatherIcons[key] || '🌤️'
  }

  return (
    <div className="bg-card rounded-2xl shadow-card p-4 mb-6">
      {/* City Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground text-lg flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-brand-500" />
            {city.name}
          </h3>
          <p className="text-sm text-muted-foreground">{city.country}</p>
        </div>
        
        {/* Weather Widget */}
        <div className="flex items-center space-x-2">
          <div className="text-2xl">{getWeatherIcon(city.weather)}</div>
          <div className="text-right">
            <p className="text-lg font-semibold text-foreground">{city.temperature}°F</p>
            <p className="text-xs text-muted-foreground capitalize">{city.weather}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-3 bg-muted rounded-xl">
          <Users className="w-5 h-5 mx-auto mb-1 text-brand-500" />
          <p className="text-xs text-muted-foreground">Travelers</p>
          <p className="font-semibold text-foreground">{city.travelersCount}</p>
        </div>
        
        <div className="text-center p-3 bg-muted rounded-xl">
          <TrendingUp className="w-5 h-5 mx-auto mb-1 text-sun-500" />
          <p className="text-xs text-muted-foreground">Hot Spots</p>
          <p className="font-semibold text-foreground">{city.trendingSpots.length}</p>
        </div>
        
        <div className="text-center p-3 bg-muted rounded-xl">
          <Calendar className="w-5 h-5 mx-auto mb-1 text-coral-500" />
          <p className="text-xs text-muted-foreground">Events</p>
          <p className="font-semibold text-foreground">{city.upcomingEvents.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-4 bg-muted p-1 rounded-lg">
        {[
          { key: 'spots', label: 'Spots', icon: MapPin },
          { key: 'events', label: 'Events', icon: Calendar },
          { key: 'travelers', label: 'Travelers', icon: Users }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setSelectedTab(key as 'spots' | 'events' | 'travelers')}
            className={clsx(
              "flex-1 flex items-center justify-center space-x-1 py-2 px-3 rounded-md transition-colors",
              selectedTab === key
                ? "bg-card text-brand-500 shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-3 mb-4">
        {selectedTab === 'spots' && (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">Trending Spots</h4>
            <div className="flex flex-wrap gap-2">
              {city.trendingSpots.map((spot, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-full text-xs font-medium"
                >
                  {spot}
                </span>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'events' && (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">Upcoming Events</h4>
            <div className="space-y-2">
              {city.upcomingEvents.map((event, index) => (
                <div key={index} className="p-2 bg-muted rounded-lg">
                  <p className="text-sm font-medium text-foreground">{event.title}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-muted-foreground">{event.date}</span>
                    <div className="flex items-center space-x-1">
                      <Users className="w-3 h-3 text-muted-foreground" />
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
            <h4 className="text-sm font-medium text-foreground mb-2">Active Travelers</h4>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-muted-foreground/20 flex items-center justify-center">
                      <span className="text-xs font-medium text-muted-foreground">T{i}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Traveler {i}</p>
                      <p className="text-xs text-muted-foreground">Exploring now</p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="text-xs">
                    Follow
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
        className="w-full py-2 bg-brand-500 text-white hover:bg-brand-600 transition-colors"
      >
        View City Hub
      </Button>
    </div>
  )
}

function clsx(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}