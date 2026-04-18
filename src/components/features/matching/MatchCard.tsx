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

// Map activity names and database icon_name values to Lucide React icons
// Covers both user-facing activity names and DB icon_name column values
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
  geographic_overlap: { label: 'Same Destination', color: 'bg-blue-100 text-blue-700' },
  activity_match: { label: 'Shared Interests', color: 'bg-purple-100 text-purple-700' },
  combined_match: { label: 'Perfect Match', color: 'bg-green-100 text-green-700' },
};

const confidenceConfig: Record<MatchConfidence, { label: string; color: string }> = {
  high: { label: 'High', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  medium: { label: 'Medium', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  low: { label: 'Low', color: 'bg-gray-100 text-gray-600 border-gray-200' },
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

  // Determine if activities contributed meaningfully to match score
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
    <div className="bg-card rounded-2xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
      {/* Header: Avatar + Name + Match Badge */}
      <div className="flex items-start gap-4 mb-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
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
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground truncate">{match.displayName}</h3>
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

      {/* Match Percentage — composite score display */}
      {composite && (
        <div className="mb-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Match Score</span>
            </div>
            <span className="text-lg font-bold text-blue-700">
              {Math.round(composite.matchPercentage)}%
            </span>
          </div>
          {/* Factor breakdown */}
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
                    ? 'bg-purple-100 text-purple-700 ring-1 ring-purple-200'
                    : 'bg-primary/10 text-primary'
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

      {/* Action */}
      <div className="flex justify-end">
        {connected ? (
          <Button variant="outline" size="sm" disabled>
            <Users className="h-4 w-4 mr-1" />
            Request Sent
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={handleConnect}
            disabled={isConnecting}
          >
            <Users className="h-4 w-4 mr-1" />
            {isConnecting ? 'Connecting...' : 'Connect'}
          </Button>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────

function FactorBar({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value * 100);
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-muted-foreground w-16 truncate">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all"
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
