'use client'

import { useState } from 'react'
import {
  Calendar,
  MapPin,
  Clock,
  Lock,
  Globe,
  Edit,
  Trash2,
  MoreHorizontal
} from 'lucide-react'
import { TripMap } from './TripMap'
import type { Trip } from '@/lib/api'

interface TripDetailProps {
  trip: Trip
  onEdit?: (tripId: string) => void
  onDelete?: (tripId: string) => void
  className?: string
}

export function TripDetail({
  trip,
  onEdit,
  onDelete,
  className = ''
}: TripDetailProps) {
  const [showActionsMenu, setShowActionsMenu] = useState(false)

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateShort = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getDuration = () => {
    const start = new Date(trip.startDate)
    const end = new Date(trip.endDate)
    // Calculate difference including both start and end dates
    const diffTime = end.getTime() - start.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1

    if (diffDays === 1) return '1 day'
    if (diffDays <= 14) return `${diffDays} days`  // Show days up to 2 weeks
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7)
      return `${weeks} week${weeks > 1 ? 's' : ''}`
    }
    const months = Math.floor(diffDays / 30)
    return `${months} month${months > 1 ? 's' : ''}`
  }

  const getStatus = () => {
    const now = new Date()
    const start = new Date(trip.startDate)
    const end = new Date(trip.endDate)

    if (start > now) return { label: 'Upcoming', color: 'text-sun-600 bg-sun-50 border-sun-200' }
    if (start <= now && end >= now) return { label: 'Ongoing', color: 'text-brand-600 bg-brand-50 border-brand-200' }
    return { label: 'Completed', color: 'text-sky-600 bg-sky-50 border-sky-200' }
  }

  const status = getStatus()

  const handleEdit = () => {
    if (onEdit) {
      onEdit(trip.id)
    } else {
      // Default navigation to edit page
      window.location.href = `/trips/${trip.id}/edit`
    }
    setShowActionsMenu(false)
  }

  const handleDelete = () => {
    onDelete?.(trip.id)
    setShowActionsMenu(false)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-card rounded-2xl shadow-card border border-border p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground">{trip.title}</h1>
              <div className={`px-3 py-1 rounded-full text-sm font-medium border ${status.color}`}>
                {status.label}
              </div>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              {trip.isPrivate ? (
                <div className="flex items-center gap-1">
                  <Lock className="w-4 h-4" />
                  <span className="text-sm">Private Trip</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  <span className="text-sm">Public Trip</span>
                </div>
              )}
            </div>

            <p className="text-sm text-muted-foreground">
              Created on {formatDate(trip.createdAt)}
            </p>
          </div>

          {/* Actions Menu */}
          <div className="relative">
            <button
              onClick={() => setShowActionsMenu(!showActionsMenu)}
              className="p-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors text-muted-foreground"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {showActionsMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg z-10">
                <button
                  onClick={handleEdit}
                  disabled={true}
                  className="w-full px-4 py-3 text-left text-sm text-muted-foreground hover:bg-muted/50 transition-colors flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Edit functionality coming soon"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Trip</span>
                </button>
                <button
                  onClick={handleDelete}
                  disabled={true}
                  className="w-full px-4 py-3 text-left text-sm text-muted-foreground hover:bg-muted/50 transition-colors flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Delete functionality coming soon"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Trip</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Trip Details Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Start Date */}
          <div className="p-4 bg-muted rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-brand-500" />
              <h3 className="font-medium text-foreground">Start Date</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-1">{formatDate(trip.startDate)}</p>
            <p className="text-xs text-muted-foreground">{formatDateShort(trip.startDate)}</p>
          </div>

          {/* End Date */}
          <div className="p-4 bg-muted rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-coral-500" />
              <h3 className="font-medium text-foreground">End Date</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-1">{formatDate(trip.endDate)}</p>
            <p className="text-xs text-muted-foreground">{formatDateShort(trip.endDate)}</p>
          </div>

          {/* Duration */}
          <div className="p-4 bg-muted rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-sun-500" />
              <h3 className="font-medium text-foreground">Duration</h3>
            </div>
            <p className="text-sm text-muted-foreground">{getDuration()}</p>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="bg-card rounded-2xl shadow-card border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-brand-500" />
          <h2 className="text-xl font-semibold text-foreground">Location</h2>
        </div>

        <TripMap tripId={trip.id} />
      </div>

      {/* Trip Metadata */}
      <div className="bg-card rounded-2xl shadow-card border border-border p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Trip Information</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-sm font-medium text-foreground">Trip ID</span>
            <span className="text-sm text-muted-foreground font-mono">{trip.id}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-sm font-medium text-foreground">Owner ID</span>
            <span className="text-sm text-muted-foreground font-mono">{trip.ownerId}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-sm font-medium text-foreground">Privacy</span>
            <div className="flex items-center gap-2">
              {trip.isPrivate ? (
                <>
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Private</span>
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Public</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-medium text-foreground">Last Updated</span>
            <span className="text-sm text-muted-foreground">{formatDateShort(trip.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}