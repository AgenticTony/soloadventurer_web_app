'use client'

import { useState } from 'react'
import Image from 'next/image'
import { MapPin, MessageCircle, Globe, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface UserMiniCardProps {
  user: {
    id: string
    name: string
    username?: string
    avatar?: string
    location?: string
    bio?: string
    languages?: string[]
    travelStyles?: string[]
    upcomingTrip?: {
      destination: string
      date: string
    }
    stats?: {
      trips: number
      connections: number
      posts: number
    }
  }
  onConnect?: (userId: string) => void
  onFollow?: (userId: string) => void
  onMessage?: (userId: string) => void
  showActions?: boolean
  compact?: boolean
}

export function UserMiniCard({
  user,
  onConnect,
  onFollow,
  onMessage,
  compact = false,
}: UserMiniCardProps) {
  const handleConnectAction = onFollow ?? onConnect
  const [isConnected, setIsConnected] = useState(false)

  const handleConnect = () => {
    setIsConnected(!isConnected)
    handleConnectAction?.(user.id)
  }

  const handleMessage = () => {
    onMessage?.(user.id)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(date.getTime() - now.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays <= 7) return `In ${diffDays} days`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (compact) {
    return (
      <div className="flex items-center space-x-3 rounded-xl bg-card p-3 shadow-card transition-shadow hover:shadow-card-hover">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={user.name}
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <span className="text-sm font-medium text-foreground">{user.name.charAt(0)}</span>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-foreground">{user.name}</h3>
          {user.location && (
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{user.location}</span>
            </div>
          )}
        </div>

        {/* Action */}
        <Button
          onClick={handleConnect}
          size="sm"
          variant={isConnected ? 'outline' : 'default'}
          className={clsx(
            'flex-shrink-0',
            isConnected
              ? 'border-connection text-connection hover:bg-connection/10'
              : 'btn-connection'
          )}
        >
          {isConnected ? 'Connected' : 'Say hi'}
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-card p-4 shadow-card transition-shadow hover:shadow-card-hover">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Avatar */}
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={user.name}
              width={48}
              height={48}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <span className="text-base font-medium text-foreground">{user.name.charAt(0)}</span>
            </div>
          )}

          <div>
            <h3 className="font-semibold text-foreground">{user.name}</h3>
            {user.location && (
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{user.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      {user.stats && (
        <div className="mb-3 grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="font-semibold text-foreground">{user.stats.trips}</p>
            <p className="text-xs text-muted-foreground">Trips</p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground">{user.stats.connections}</p>
            <p className="text-xs text-muted-foreground">Connections</p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground">{user.stats.posts}</p>
            <p className="text-xs text-muted-foreground">Posts</p>
          </div>
        </div>
      )}

      {/* Travel Info */}
      {user.languages && user.languages.length > 0 && (
        <div className="mb-3">
          <div className="mb-1 flex items-center space-x-1">
            <Globe className="h-3 w-3 text-muted-foreground" />
            <p className="text-xs font-medium text-muted-foreground">Languages</p>
          </div>
          <div className="flex flex-wrap gap-1">
            {user.languages.slice(0, 3).map((language, index) => (
              <span
                key={index}
                className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground"
              >
                {language}
              </span>
            ))}
            {user.languages.length > 3 && (
              <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                +{user.languages.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {user.travelStyles && user.travelStyles.length > 0 && (
        <div className="mb-3">
          <p className="mb-1 text-xs font-medium text-muted-foreground">Travel Style</p>
          <div className="flex flex-wrap gap-1">
            {user.travelStyles.slice(0, 2).map((style, index) => (
              <span
                key={index}
                className="rounded-full bg-brand-50 px-2 py-1 text-xs font-medium text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
              >
                {style}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Trip */}
      {user.upcomingTrip && (
        <div className="mb-4 rounded-lg border border-sun-200 bg-sun-50 p-3 dark:border-sun-500/20 dark:bg-sun-500/10">
          <div className="mb-1 flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-sun-600 dark:text-sun-400" />
            <p className="text-sm font-medium text-sun-600 dark:text-sun-400">Upcoming Trip</p>
          </div>
          <p className="font-semibold text-foreground">{user.upcomingTrip.destination}</p>
          <p className="text-xs text-muted-foreground">{formatDate(user.upcomingTrip.date)}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <Button
          onClick={handleConnect}
          className={clsx(
            'flex-1',
            isConnected
              ? 'border-connection text-connection hover:bg-connection/10'
              : 'btn-connection'
          )}
          variant={isConnected ? 'outline' : 'default'}
        >
          {isConnected ? 'Connected' : 'Say hi'}
        </Button>

        <Button onClick={handleMessage} variant="outline" className="flex-1">
          <MessageCircle className="mr-1 h-4 w-4" />
          Message
        </Button>
      </div>
    </div>
  )
}

function clsx(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}
