'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  Calendar,
  MapPin,
  Clock,
  Plane,
  Heart,
  Share,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Eye,
} from 'lucide-react'

interface TripActivity {
  id: string
  name: string
  type: string
  icon?: string
}

interface TripCompanion {
  id: string
  name: string
  avatar?: string
}

interface Trip {
  id: string
  title: string
  destination: string
  description?: string
  startDate: string
  endDate: string
  duration: string
  status: 'upcoming' | 'completed' | 'planning' | 'cancelled'
  image?: string
  coverImage?: string
  activities: TripActivity[]
  companions: TripCompanion[]
  budget?: {
    currency: string
    estimated: number
    spent?: number
  }
  tags?: string[]
  isPublic?: boolean
  isLiked?: boolean
  likesCount?: number
  viewsCount?: number
  createdAt: string
  updatedAt: string
}

interface TripCardProps {
  trip: Trip
  variant?: 'default' | 'compact' | 'detailed'
  onLike?: (tripId: string) => void
  onShare?: (tripId: string) => void
  onEdit?: (tripId: string) => void
  onDelete?: (tripId: string) => void
  onView?: (tripId: string) => void
  onCopy?: (tripId: string) => void
  showActions?: boolean
  className?: string
}

export function TripCard({
  trip,
  variant = 'default',
  onLike,
  onShare,
  onEdit,
  onDelete,
  onView,
  onCopy,
  showActions = true,
  className = '',
}: TripCardProps) {
  const [showActionsMenu, setShowActionsMenu] = useState(false)

  const getStatusColor = (status: Trip['status']) => {
    switch (status) {
      case 'upcoming':
        return 'text-sun-600 bg-sun-50 dark:bg-sun-500/10 border-sun-200 dark:border-sun-500/20'
      case 'completed':
        return 'text-brand-600 bg-brand-50 dark:bg-brand-500/10 border-brand-200 dark:border-brand-500/20'
      case 'planning':
        return 'text-sky-600 bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/20'
      case 'cancelled':
        return 'text-destructive bg-destructive/10 border-destructive/20'
      default:
        return 'text-muted-foreground bg-muted border-border'
    }
  }

  const getStatusIcon = (status: Trip['status']) => {
    switch (status) {
      case 'upcoming':
        return <Calendar className="h-4 w-4" />
      case 'completed':
        return <Plane className="h-4 w-4" />
      case 'planning':
        return <Clock className="h-4 w-4" />
      case 'cancelled':
        return <Trash2 className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    onLike?.(trip.id)
  }

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    onShare?.(trip.id)
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit?.(trip.id)
    setShowActionsMenu(false)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.(trip.id)
    setShowActionsMenu(false)
  }

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    onCopy?.(trip.id)
    setShowActionsMenu(false)
  }

  if (variant === 'compact') {
    return (
      <div
        className={`cursor-pointer overflow-hidden rounded-xl bg-card shadow-card transition-all duration-300 hover:shadow-card-hover ${className}`}
        onClick={() => onView?.(trip.id)}
      >
        <div className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="flex-1 truncate font-semibold text-foreground">{trip.title}</h3>
            <span
              className={`rounded-full border px-2 py-1 text-xs font-medium ${getStatusColor(trip.status)}`}
            >
              {trip.status}
            </span>
          </div>

          <div className="mb-2 flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span className="truncate">{trip.destination}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{trip.duration}</span>
            </div>
          </div>

          {trip.budget && (
            <div className="text-sm font-medium text-foreground">
              {trip.budget.currency} {trip.budget.estimated.toLocaleString()}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      className={`group cursor-pointer overflow-hidden rounded-2xl bg-card shadow-card transition-all duration-300 hover:shadow-card-hover ${className}`}
      onClick={() => onView?.(trip.id)}
    >
      {/* Cover Image */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-brand-500 to-sky-500">
        {trip.coverImage ? (
          <Image
            src={trip.coverImage}
            alt={trip.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500 to-sky-500 opacity-80" />
        )}

        {/* Status Badge */}
        <div className="absolute right-3 top-3">
          <div
            className={`flex items-center space-x-1 rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(trip.status)}`}
          >
            {getStatusIcon(trip.status)}
            <span className="capitalize">{trip.status}</span>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="absolute left-3 top-3 flex items-center space-x-2">
            {onLike && (
              <button
                onClick={handleLike}
                className={`rounded-lg bg-white/90 p-2 backdrop-blur-sm transition-colors hover:bg-white ${
                  trip.isLiked ? 'text-coral-500' : 'text-muted-foreground'
                }`}
              >
                <Heart className={`h-4 w-4 ${trip.isLiked ? 'fill-current' : ''}`} />
              </button>
            )}
            {onShare && (
              <button
                onClick={handleShare}
                className="rounded-lg bg-white/90 p-2 text-muted-foreground backdrop-blur-sm transition-colors hover:bg-white"
              >
                <Share className="h-4 w-4" />
              </button>
            )}
            <div className="relative">
              <button
                onClick={e => {
                  e.stopPropagation()
                  setShowActionsMenu(!showActionsMenu)
                }}
                className="rounded-lg bg-white/90 p-2 text-muted-foreground backdrop-blur-sm transition-colors hover:bg-white"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>

              {showActionsMenu && (
                <div className="absolute left-0 top-full z-10 mt-1 w-40 rounded-lg border border-border bg-card shadow-lg">
                  {onEdit && (
                    <button
                      onClick={handleEdit}
                      className="flex w-full items-center space-x-2 px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted/50"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                  )}
                  {onCopy && (
                    <button
                      onClick={handleCopy}
                      className="flex w-full items-center space-x-2 px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted/50"
                    >
                      <Copy className="h-4 w-4" />
                      <span>Copy</span>
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={handleDelete}
                      className="flex w-full items-center space-x-2 px-3 py-2 text-left text-sm text-destructive transition-colors hover:bg-muted/50"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Trip Info */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="mb-1 text-xl font-semibold text-foreground">{trip.title}</h3>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{trip.destination}</span>
          </div>
        </div>

        {/* Date and Duration */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
            </span>
          </div>
          <div className="text-sm font-medium text-foreground">{trip.duration}</div>
        </div>

        {/* Description */}
        {trip.description && (
          <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{trip.description}</p>
        )}

        {/* Tags */}
        {trip.tags && trip.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1">
            {trip.tags.map((tag, index) => (
              <span
                key={index}
                className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Activities */}
        {trip.activities.length > 0 && (
          <div className="mb-4">
            <h4 className="mb-2 text-sm font-medium text-foreground">Activities</h4>
            <div className="flex flex-wrap gap-2">
              {trip.activities.slice(0, 3).map(activity => (
                <span
                  key={activity.id}
                  className="rounded-full bg-brand-50 px-2 py-1 text-xs font-medium text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                >
                  {activity.name}
                </span>
              ))}
              {trip.activities.length > 3 && (
                <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                  +{trip.activities.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Bottom Row */}
        <div className="flex items-center justify-between">
          {/* Companions */}
          <div className="flex items-center space-x-2">
            <div className="flex -space-x-2">
              {trip.companions.slice(0, 3).map(companion => (
                <div
                  key={companion.id}
                  className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-muted text-xs text-muted-foreground"
                >
                  {companion.avatar ? (
                    <Image
                      src={companion.avatar}
                      alt={companion.name}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  ) : (
                    companion.name.charAt(0)
                  )}
                </div>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {trip.companions.length > 0
                ? `${trip.companions.length} companion${trip.companions.length > 1 ? 's' : ''}`
                : 'Solo trip'}
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-3 text-xs text-muted-foreground">
            {trip.likesCount !== undefined && (
              <div className="flex items-center space-x-1">
                <Heart className="h-3 w-3" />
                <span>{trip.likesCount}</span>
              </div>
            )}
            {trip.viewsCount !== undefined && (
              <div className="flex items-center space-x-1">
                <Eye className="h-3 w-3" />
                <span>{trip.viewsCount}</span>
              </div>
            )}
          </div>
        </div>

        {/* Budget (if available) */}
        {trip.budget && variant === 'detailed' && (
          <div className="mt-4 border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Budget</span>
              <span className="text-sm font-medium text-foreground">
                {trip.budget.currency} {trip.budget.estimated.toLocaleString()}
                {trip.budget.spent && (
                  <span className="text-muted-foreground">
                    {' '}
                    • spent {trip.budget.spent.toLocaleString()}
                  </span>
                )}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Loading skeleton for TripCard
export function TripCardSkeleton({ variant = 'default' }: { variant?: TripCardProps['variant'] }) {
  if (variant === 'compact') {
    return (
      <div className="animate-pulse rounded-xl bg-card p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="h-5 w-3/4 rounded bg-muted" />
          <div className="h-6 w-20 rounded bg-muted" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-1/2 rounded bg-muted" />
          <div className="h-4 w-1/3 rounded bg-muted" />
        </div>
      </div>
    )
  }

  return (
    <div className="animate-pulse overflow-hidden rounded-2xl bg-card">
      <div className="h-48 bg-muted" />
      <div className="space-y-4 p-6">
        <div className="space-y-2">
          <div className="h-6 w-3/4 rounded bg-muted" />
          <div className="h-4 w-1/2 rounded bg-muted" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-2/3 rounded bg-muted" />
          <div className="h-4 w-1/3 rounded bg-muted" />
        </div>
        <div className="h-16 rounded bg-muted" />
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            <div className="h-6 w-6 rounded-full border-2 border-card bg-muted" />
            <div className="h-6 w-6 rounded-full border-2 border-card bg-muted" />
            <div className="h-6 w-6 rounded-full border-2 border-card bg-muted" />
          </div>
          <div className="flex space-x-3">
            <div className="h-4 w-8 rounded bg-muted" />
            <div className="h-4 w-8 rounded bg-muted" />
          </div>
        </div>
      </div>
    </div>
  )
}
