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
  onFollow?: (userId: string) => void
  onMessage?: (userId: string) => void
  showActions?: boolean
  compact?: boolean
}

export function UserMiniCard({ user, onFollow, onMessage, showActions, compact = false }: UserMiniCardProps) {
  const [isFollowing, setIsFollowing] = useState(false)

  const handleFollow = () => {
    setIsFollowing(!isFollowing)
    onFollow?.(user.id)
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
      <div className="flex items-center space-x-3 p-3 bg-card rounded-xl shadow-card hover:shadow-card-hover transition-shadow">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={user.name}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <span className="text-sm font-medium text-foreground">
                {user.name.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{user.name}</h3>
          {user.location && (
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{user.location}</span>
            </div>
          )}
        </div>

        {/* Action */}
        <Button
          onClick={handleFollow}
          size="sm"
          variant={isFollowing ? "outline" : "default"}
          className={clsx(
            "flex-shrink-0",
            isFollowing
              ? "border-brand-500 text-brand-500 hover:bg-brand-50"
              : "bg-brand-500 text-white hover:bg-brand-600"
          )}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-2xl shadow-card p-4 hover:shadow-card-hover transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          {/* Avatar */}
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={user.name}
              width={48}
              height={48}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <span className="text-base font-medium text-foreground">
                {user.name.charAt(0)}
              </span>
            </div>
          )}
          
          <div>
            <h3 className="font-semibold text-foreground">{user.name}</h3>
            {user.location && (
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>{user.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      {user.stats && (
        <div className="grid grid-cols-3 gap-3 mb-3">
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
          <div className="flex items-center space-x-1 mb-1">
            <Globe className="w-3 h-3 text-muted-foreground" />
            <p className="text-xs font-medium text-muted-foreground">Languages</p>
          </div>
          <div className="flex flex-wrap gap-1">
            {user.languages.slice(0, 3).map((language, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-muted rounded-full text-xs text-muted-foreground"
              >
                {language}
              </span>
            ))}
            {user.languages.length > 3 && (
              <span className="px-2 py-1 bg-muted rounded-full text-xs text-muted-foreground">
                +{user.languages.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {user.travelStyles && user.travelStyles.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-muted-foreground mb-1">Travel Style</p>
          <div className="flex flex-wrap gap-1">
            {user.travelStyles.slice(0, 2).map((style, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-full text-xs font-medium"
              >
                {style}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Trip */}
      {user.upcomingTrip && (
        <div className="mb-4 p-3 bg-sun-50 dark:bg-sun-500/10 rounded-lg border border-sun-200 dark:border-sun-500/20">
          <div className="flex items-center space-x-2 mb-1">
            <Calendar className="w-4 h-4 text-sun-600 dark:text-sun-400" />
            <p className="text-sm font-medium text-sun-600 dark:text-sun-400">Upcoming Trip</p>
          </div>
          <p className="font-semibold text-foreground">{user.upcomingTrip.destination}</p>
          <p className="text-xs text-muted-foreground">{formatDate(user.upcomingTrip.date)}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <Button
          onClick={handleFollow}
          className={clsx(
            "flex-1",
            isFollowing
              ? "border-brand-500 text-brand-500 hover:bg-brand-50"
              : "bg-brand-500 text-white hover:bg-brand-600"
          )}
          variant={isFollowing ? "outline" : "default"}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </Button>
        
        <Button
          onClick={handleMessage}
          variant="outline"
          className="flex-1"
        >
          <MessageCircle className="w-4 h-4 mr-1" />
          Message
        </Button>
      </div>
    </div>
  )
}

function clsx(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}