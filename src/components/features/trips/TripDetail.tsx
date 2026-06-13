'use client'

import { useState } from 'react'
import { Calendar, MapPin, Clock, Lock, Globe, Edit, Trash2, MoreHorizontal } from 'lucide-react'
import { TripMap } from './TripMap'
import type { Trip } from '@/lib/api'

interface TripDetailProps {
  trip: Trip
  onEdit?: (tripId: string) => void
  onDelete?: (tripId: string) => void
  className?: string
}

export function TripDetail({ trip, onEdit, onDelete, className = '' }: TripDetailProps) {
  const [showActionsMenu, setShowActionsMenu] = useState(false)

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatDateShort = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getDuration = () => {
    const start = new Date(trip.startDate)
    const end = new Date(trip.endDate)
    // Calculate difference including both start and end dates
    const diffTime = end.getTime() - start.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1

    if (diffDays === 1) return '1 day'
    if (diffDays <= 14) return `${diffDays} days` // Show days up to 2 weeks
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
    if (start <= now && end >= now)
      return { label: 'Ongoing', color: 'text-brand-600 bg-brand-50 border-brand-200' }
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
      <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
        <div className="mb-6 flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground">{trip.title}</h1>
              <div className={`rounded-full border px-3 py-1 text-sm font-medium ${status.color}`}>
                {status.label}
              </div>
            </div>

            <div className="mb-4 flex items-center gap-2 text-muted-foreground">
              {trip.isPrivate ? (
                <div className="flex items-center gap-1">
                  <Lock className="h-4 w-4" />
                  <span className="text-sm">Private Trip</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  <span className="text-sm">Public Trip</span>
                </div>
              )}
            </div>

            <p className="text-sm text-muted-foreground">Created on {formatDate(trip.createdAt)}</p>
          </div>

          {/* Actions Menu */}
          <div className="relative">
            <button
              onClick={() => setShowActionsMenu(!showActionsMenu)}
              className="rounded-lg bg-muted p-2 text-muted-foreground transition-colors hover:bg-muted/80"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>

            {showActionsMenu && (
              <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-lg border border-border bg-card shadow-lg">
                <button
                  onClick={handleEdit}
                  disabled={true}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-muted-foreground transition-colors hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50"
                  title="Edit functionality coming soon"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit Trip</span>
                </button>
                <button
                  onClick={handleDelete}
                  disabled={true}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-muted-foreground transition-colors hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50"
                  title="Delete functionality coming soon"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Trip</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Trip Details Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Start Date */}
          <div className="rounded-xl bg-muted p-4">
            <div className="mb-2 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-brand-500" />
              <h3 className="font-medium text-foreground">Start Date</h3>
            </div>
            <p className="mb-1 text-sm text-muted-foreground">{formatDate(trip.startDate)}</p>
            <p className="text-xs text-muted-foreground">{formatDateShort(trip.startDate)}</p>
          </div>

          {/* End Date */}
          <div className="rounded-xl bg-muted p-4">
            <div className="mb-2 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-coral-500" />
              <h3 className="font-medium text-foreground">End Date</h3>
            </div>
            <p className="mb-1 text-sm text-muted-foreground">{formatDate(trip.endDate)}</p>
            <p className="text-xs text-muted-foreground">{formatDateShort(trip.endDate)}</p>
          </div>

          {/* Duration */}
          <div className="rounded-xl bg-muted p-4">
            <div className="mb-2 flex items-center gap-2">
              <Clock className="h-5 w-5 text-sun-500" />
              <h3 className="font-medium text-foreground">Duration</h3>
            </div>
            <p className="text-sm text-muted-foreground">{getDuration()}</p>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-brand-500" />
          <h2 className="text-xl font-semibold text-foreground">Location</h2>
        </div>

        <TripMap tripId={trip.id} />
      </div>

      {/* Trip Metadata */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <h2 className="mb-4 text-xl font-semibold text-foreground">Trip Information</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border py-2">
            <span className="text-sm font-medium text-foreground">Trip ID</span>
            <span className="font-mono text-sm text-muted-foreground">{trip.id}</span>
          </div>

          <div className="flex items-center justify-between border-b border-border py-2">
            <span className="text-sm font-medium text-foreground">Owner ID</span>
            <span className="font-mono text-sm text-muted-foreground">{trip.ownerId}</span>
          </div>

          <div className="flex items-center justify-between border-b border-border py-2">
            <span className="text-sm font-medium text-foreground">Privacy</span>
            <div className="flex items-center gap-2">
              {trip.isPrivate ? (
                <>
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Private</span>
                </>
              ) : (
                <>
                  <Globe className="h-4 w-4 text-muted-foreground" />
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
