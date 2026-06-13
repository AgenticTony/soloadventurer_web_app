'use client'

import {
  MapPin,
  Calendar,
  Mountain,
  Users,
  Sparkles,
  Navigation,
  TrendingUp,
  Camera,
  Landmark,
  UtensilsCrossed,
  ShoppingBag,
  TreePine,
  MountainSnow,
  Bike,
  Heart,
  Wine,
  Wind,
  Waves,
  Sailboat,
  Dumbbell,
  Compass,
  Globe,
  Music,
  Coffee,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { requestConnection } from '@/lib/api/matching'
import type { CompositeMatch, MatchConfidence, PotentialMatch } from '@/types/matching'
import { useState } from 'react'
import toast from 'react-hot-toast'

const activityIconMap: Record<string, LucideIcon> = {
  hiking: Mountain,
  photography: Camera,
  food: UtensilsCrossed,
  cooking: UtensilsCrossed,
  sightseeing: Landmark,
  coffee: Coffee,
  shopping: ShoppingBag,
  skiing: MountainSnow,
  climbing: TreePine,
  cycling: Bike,
  volunteering: Heart,
  nightlife: Music,
  diving: Sailboat,
  surfing: Waves,
  yoga: Dumbbell,
  museum: Landmark,
  temple: Landmark,
  restaurant: Coffee,
  camera: Camera,
}

function getActivityIcon(name: string): LucideIcon {
  const key = name.toLowerCase().trim()
  return activityIconMap[key] ?? Sparkles
}

interface MatchCardProps {
  match: PotentialMatch
  onConnect?: (matchId: string) => void
}

const matchTypeConfig: Record<string, { label: string; color: string }> = {
  geographic_overlap: { label: 'Same Destination', color: 'bg-brand/10 text-brand' },
  activity_match: { label: 'Shared Interests', color: 'bg-trust/10 text-trust' },
  combined_match: { label: 'Perfect Match', color: 'bg-connection/10 text-connection' },
}

const confidenceConfig: Record<MatchConfidence, { label: string; color: string }> = {
  high: { label: 'High', color: 'bg-brand/10 text-brand border-brand/20' },
  medium: { label: 'Medium', color: 'bg-trust/10 text-trust border-trust/20' },
  low: { label: 'Low', color: 'bg-muted text-muted-foreground border-border' },
}

function isCompositeMatch(match: PotentialMatch): match is CompositeMatch {
  return 'compositeScore' in match && 'confidence' in match
}

export function MatchCard({ match, onConnect }: MatchCardProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [connected, setConnected] = useState(false)

  const composite = isCompositeMatch(match) ? match : null
  const config = matchTypeConfig[match.matchType] ?? matchTypeConfig.geographic_overlap
  const initials = match.displayName.charAt(0).toUpperCase()

  const activityScored = composite
    ? composite.factors.activities >= 0.2
    : match.matchType === 'activity_match' || match.matchType === 'combined_match'

  async function handleConnect() {
    setIsConnecting(true)
    try {
      await requestConnection(match.userId)
      setConnected(true)
      onConnect?.(match.id)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send connection request'
      toast.error(message)
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-card-hover">
      {/* Header: Avatar + Name + Match Badge */}
      <div className="mb-4 flex items-start gap-4">
        <div className="relative flex-shrink-0">
          <div className="bg-gradient-ocean-sunset flex h-12 w-12 items-center justify-center rounded-full text-lg font-semibold text-white">
            {match.avatarUrl ? (
              <img
                src={match.avatarUrl}
                alt={match.displayName}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
          {match.isOnline && (
            <div
              className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-green-500"
              title="Online now"
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate font-semibold text-foreground">{match.displayName}</h3>
            {match.emailVerified && (
              <svg
                className="h-4 w-4 flex-shrink-0 text-brand"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-label="Email verified"
              >
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
          {match.homeCountry && (
            <p className="text-sm text-muted-foreground">{match.homeCountry}</p>
          )}
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <Badge variant="outline" className={`text-xs ${config.color} border-0`}>
              {config.label}
            </Badge>
            {composite && (
              <Badge
                variant="outline"
                className={`text-xs ${confidenceConfig[composite.confidence].color}`}
              >
                {confidenceConfig[composite.confidence].label}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Match Percentage */}
      {composite && (
        <div className="mb-4 rounded-xl border border-brand/10 bg-brand/5 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-brand" />
              <span className="text-sm font-medium text-foreground">Match Score</span>
            </div>
            <span className="text-lg font-bold text-brand">
              {Math.round(composite.matchPercentage)}%
            </span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
            <FactorBar label="Interests" value={composite.factors.semantic} />
            <FactorBar label="Dates" value={composite.factors.dateOverlap} />
            <FactorBar label="Activities" value={composite.factors.activities} />
            <FactorBar label="Destination" value={composite.factors.destination} />
          </div>
        </div>
      )}

      {/* Trip Info */}
      {match.destinationName && (
        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{match.destinationName}</span>
          </div>
          {match.startDate && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span>
                {new Date(match.startDate!).toLocaleDateString()} —{' '}
                {new Date(match.endDate!).toLocaleDateString()}
              </span>
            </div>
          )}
          {match.overlapDays > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="secondary" className="text-xs">
                <Mountain className="mr-1 h-3 w-3" />
                {match.overlapDays} day{match.overlapDays !== 1 ? 's' : ''} overlap
              </Badge>
            </div>
          )}
          {match.distanceMeters !== null && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Navigation className="h-4 w-4 flex-shrink-0" />
              <span>{formatDistance(match.distanceMeters)} away</span>
            </div>
          )}
        </div>
      )}

      {/* Shared Activities */}
      {match.sharedActivities.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {match.sharedActivities.map(activity => {
            const Icon = getActivityIcon(activity)
            const isScored = activityScored
            return (
              <span
                key={activity}
                className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${
                  isScored
                    ? 'bg-connection/10 text-connection ring-1 ring-connection/20'
                    : 'bg-brand/10 text-brand'
                }`}
              >
                <Icon className="h-3 w-3" />
                {activity}
              </span>
            )
          })}
          {composite && composite.sharedActivityCount > match.sharedActivities.length && (
            <span className="inline-flex items-center px-2 py-1 text-xs text-muted-foreground">
              +{composite.sharedActivityCount - match.sharedActivities.length} more
            </span>
          )}
        </div>
      )}

      {/* Action — connection CTA in coral */}
      <div className="flex justify-end">
        {connected ? (
          <Button variant="outline" size="sm" disabled>
            <Users className="mr-1 h-4 w-4" />
            Request Sent
          </Button>
        ) : (
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="btn-connection inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            <Users className="h-4 w-4" />
            {isConnecting ? 'Connecting...' : 'Connect'}
          </button>
        )}
      </div>
    </div>
  )
}

function FactorBar({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value * 100)
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-16 truncate text-xs text-muted-foreground">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-6 text-right text-xs font-medium text-muted-foreground">{pct}</span>
    </div>
  )
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`
  if (meters < 100000) return `${(meters / 1000).toFixed(1)}km`
  return `${Math.round(meters / 1000)}km`
}
