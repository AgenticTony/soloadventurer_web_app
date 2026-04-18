'use client';

import { MapPin, Calendar, Mountain, Users, Sparkles, Navigation, TrendingUp,
  Camera, Landmark, UtensilsCrossed, ShoppingBag,
  TreePine, MountainSnow, Bike, Heart, Wine, Wind,
  Waves, Sailboat, Dumbbell, Compass, Globe, Music, Coffee,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { requestConnection } from '@/lib/api/matching';
import type { CompositeMatch, MatchConfidence, PotentialMatch } from '@/types/matching';
import { useState } from 'react';
import toast from 'react-hot-toast';

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
};

function getActivityIcon(name: string): LucideIcon {
  const key = name.toLowerCase().trim();
  return activityIconMap[key] ?? Sparkles;
}

interface MatchCardProps {
  match: PotentialMatch;
  onConnect?: (matchId: string) => void;
}

const matchTypeConfig: Record<string, { label: string; color: string }> = {
  geographic_overlap: { label: 'Same Destination', color: 'bg-brand/10 text-brand' },
  activity_match: { label: 'Shared Interests', color: 'bg-trust/10 text-trust' },
  combined_match: { label: 'Perfect Match', color: 'bg-connection/10 text-connection' },
};

const confidenceConfig: Record<MatchConfidence, { label: string; color: string }> = {
  high: { label: 'High', color: 'bg-brand/10 text-brand border-brand/20' },
  medium: { label: 'Medium', color: 'bg-trust/10 text-trust border-trust/20' },
  low: { label: 'Low', color: 'bg-muted text-muted-foreground border-border' },
};

function isCompositeMatch(match: PotentialMatch): match is CompositeMatch {
  return 'compositeScore' in match && 'confidence' in match;
}

export function MatchCard({ match, onConnect }: MatchCardProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connected, setConnected] = useState(false);

  const composite = isCompositeMatch(match) ? match : null;
  const config = matchTypeConfig[match.matchType] ?? matchTypeConfig.geographic_overlap;
  const initials = match.displayName.charAt(0).toUpperCase();

  const activityScored = composite ? composite.factors.activities >= 0.2 : match.matchType === 'activity_match' || match.matchType === 'combined_match';

  async function handleConnect() {
    setIsConnecting(true);
    try {
      await requestConnection(match.userId);
      setConnected(true);
      onConnect?.(match.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send connection request';
      toast.error(message);
    } finally {
      setIsConnecting(false);
    }
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-5 shadow-sm hover:shadow-card-hover transition-shadow">
      {/* Header: Avatar + Name + Match Badge */}
      <div className="flex items-start gap-4 mb-4">
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-gradient-ocean-sunset flex items-center justify-center text-white font-semibold text-lg">
            {match.avatarUrl ? (
              <img
                src={match.avatarUrl}
                alt={match.displayName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
          {match.isOnline && (
            <div
              className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-card"
              title="Online now"
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-semibold text-foreground truncate">{match.displayName}</h3>
            {match.emailVerified && (
              <svg className="w-4 h-4 text-brand flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-label="Email verified">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          {match.homeCountry && (
            <p className="text-sm text-muted-foreground">{match.homeCountry}</p>
          )}
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <Badge variant="outline" className={`text-xs ${config.color} border-0`}>
              {config.label}
            </Badge>
            {composite && (
              <Badge variant="outline" className={`text-xs ${confidenceConfig[composite.confidence].color}`}>
                {confidenceConfig[composite.confidence].label}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Match Percentage */}
      {composite && (
        <div className="mb-4 rounded-xl bg-brand/5 border border-brand/10 p-3">
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
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{match.destinationName}</span>
          </div>
          {match.startDate && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span>
                {new Date(match.startDate!).toLocaleDateString()} — {new Date(match.endDate!).toLocaleDateString()}
              </span>
            </div>
          )}
          {match.overlapDays > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="secondary" className="text-xs">
                <Mountain className="h-3 w-3 mr-1" />
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
        <div className="flex flex-wrap gap-1.5 mb-4">
          {match.sharedActivities.map((activity) => {
            const Icon = getActivityIcon(activity);
            const isScored = activityScored;
            return (
              <span
                key={activity}
                className={`inline-flex items-center gap-1 text-xs rounded-full px-2 py-1 ${
                  isScored
                    ? 'bg-connection/10 text-connection ring-1 ring-connection/20'
                    : 'bg-brand/10 text-brand'
                }`}
              >
                <Icon className="h-3 w-3" />
                {activity}
              </span>
            );
          })}
          {composite && composite.sharedActivityCount > match.sharedActivities.length && (
            <span className="inline-flex items-center text-xs text-muted-foreground px-2 py-1">
              +{composite.sharedActivityCount - match.sharedActivities.length} more
            </span>
          )}
        </div>
      )}

      {/* Action — connection CTA in coral */}
      <div className="flex justify-end">
        {connected ? (
          <Button variant="outline" size="sm" disabled>
            <Users className="h-4 w-4 mr-1" />
            Request Sent
          </Button>
        ) : (
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="btn-connection px-4 py-2 text-sm font-medium inline-flex items-center gap-1.5 disabled:opacity-50"
          >
            <Users className="h-4 w-4" />
            {isConnecting ? 'Connecting...' : 'Connect'}
          </button>
        )}
      </div>
    </div>
  );
}

function FactorBar({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value * 100);
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-muted-foreground w-16 truncate">{label}</span>
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-brand rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-medium text-muted-foreground w-6 text-right">{pct}</span>
    </div>
  );
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  if (meters < 100000) return `${(meters / 1000).toFixed(1)}km`;
  return `${Math.round(meters / 1000)}km`;
}
