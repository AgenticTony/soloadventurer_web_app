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
  Eye
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
  className = ''
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
        return <Calendar className="w-4 h-4" />
      case 'completed':
        return <Plane className="w-4 h-4" />
      case 'planning':
        return <Clock className="w-4 h-4" />
      case 'cancelled':
        return <Trash2 className="w-4 h-4" />
      default:
        return <Calendar className="w-4 h-4" />
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
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
        className={`bg-card rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer overflow-hidden ${className}`}
        onClick={() => onView?.(trip.id)}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-foreground truncate flex-1">
              {trip.title}
            </h3>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(trip.status)}`}
            >
              {trip.status}
            </span>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{trip.destination}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{trip.duration}</span>
            </div>
          </div>

          {trip.budget && (
            <div className="text-sm text-foreground font-medium">
              {trip.budget.currency} {trip.budget.estimated.toLocaleString()}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      className={`bg-card rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer overflow-hidden group ${className}`}
      onClick={() => onView?.(trip.id)}
    >
      {/* Cover Image */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-brand-500 to-sky-500">
        {trip.coverImage ? (
          <Image
            src={trip.coverImage}
            alt={trip.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500 to-sky-500 opacity-80" />
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getStatusColor(trip.status)}`}
          >
            {getStatusIcon(trip.status)}
            <span className="capitalize">{trip.status}</span>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="absolute top-3 left-3 flex items-center space-x-2">
            {onLike && (
              <button
                onClick={handleLike}
                className={`p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors ${
                  trip.isLiked ? 'text-coral-500' : 'text-muted-foreground'
                }`}
              >
                <Heart className={`w-4 h-4 ${trip.isLiked ? 'fill-current' : ''}`} />
              </button>
            )}
            {onShare && (
              <button
                onClick={handleShare}
                className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors text-muted-foreground"
              >
                <Share className="w-4 h-4" />
              </button>
            )}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowActionsMenu(!showActionsMenu)
                }}
                className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors text-muted-foreground"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              
              {showActionsMenu && (
                <div className="absolute left-0 top-full mt-1 w-40 bg-card border border-border rounded-lg shadow-lg z-10">
                  {onEdit && (
                    <button
                      onClick={handleEdit}
                      className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-muted/50 transition-colors flex items-center space-x-2"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                  )}
                  {onCopy && (
                    <button
                      onClick={handleCopy}
                      className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-muted/50 transition-colors flex items-center space-x-2"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={handleDelete}
                      className="w-full px-3 py-2 text-left text-sm text-destructive hover:bg-muted/50 transition-colors flex items-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4" />
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
          <h3 className="text-xl font-semibold text-foreground mb-1">
            {trip.title}
          </h3>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{trip.destination}</span>
          </div>
        </div>

        {/* Date and Duration */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
          </div>
          <div className="text-sm font-medium text-foreground">
            {trip.duration}
          </div>
        </div>

        {/* Description */}
        {trip.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {trip.description}
          </p>
        )}

        {/* Tags */}
        {trip.tags && trip.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {trip.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-muted rounded-full text-xs text-muted-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Activities */}
        {trip.activities.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-foreground mb-2">Activities</h4>
            <div className="flex flex-wrap gap-2">
              {trip.activities.slice(0, 3).map((activity) => (
                <span
                  key={activity.id}
                  className="px-2 py-1 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-full text-xs font-medium"
                >
                  {activity.name}
                </span>
              ))}
              {trip.activities.length > 3 && (
                <span className="px-2 py-1 bg-muted rounded-full text-xs text-muted-foreground">
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
              {trip.companions.slice(0, 3).map((companion) => (
                <div
                  key={companion.id}
                  className="w-6 h-6 rounded-full bg-muted border-2 border-card flex items-center justify-center text-xs text-muted-foreground"
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
                : 'Solo trip'
              }
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-3 text-xs text-muted-foreground">
            {trip.likesCount !== undefined && (
              <div className="flex items-center space-x-1">
                <Heart className="w-3 h-3" />
                <span>{trip.likesCount}</span>
              </div>
            )}
            {trip.viewsCount !== undefined && (
              <div className="flex items-center space-x-1">
                <Eye className="w-3 h-3" />
                <span>{trip.viewsCount}</span>
              </div>
            )}
          </div>
        </div>

        {/* Budget (if available) */}
        {trip.budget && variant === 'detailed' && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Budget</span>
              <span className="text-sm font-medium text-foreground">
                {trip.budget.currency} {trip.budget.estimated.toLocaleString()}
                {trip.budget.spent && (
                  <span className="text-muted-foreground">
                    {' '}• spent {trip.budget.spent.toLocaleString()}
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
      <div className="bg-card rounded-xl p-4 animate-pulse">
        <div className="flex items-center justify-between mb-2">
          <div className="h-5 bg-muted rounded w-3/4" />
          <div className="h-6 bg-muted rounded w-20" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-1/2" />
          <div className="h-4 bg-muted rounded w-1/3" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-2xl overflow-hidden animate-pulse">
      <div className="h-48 bg-muted" />
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <div className="h-6 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-2/3" />
          <div className="h-4 bg-muted rounded w-1/3" />
        </div>
        <div className="h-16 bg-muted rounded" />
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            <div className="w-6 h-6 bg-muted rounded-full border-2 border-card" />
            <div className="w-6 h-6 bg-muted rounded-full border-2 border-card" />
            <div className="w-6 h-6 bg-muted rounded-full border-2 border-card" />
          </div>
          <div className="flex space-x-3">
            <div className="h-4 bg-muted rounded w-8" />
            <div className="h-4 bg-muted rounded w-8" />
          </div>
        </div>
      </div>
    </div>
  )
}