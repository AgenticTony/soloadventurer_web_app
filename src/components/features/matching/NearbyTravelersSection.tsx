'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MatchCard } from '@/components/features/matching/MatchCard';
import { findPotentialMatches } from '@/lib/api/matching';
import { getActivities } from '@/lib/api/activities';
import type { Activity, CompositeMatch, PotentialMatch } from '@/types/matching';
import { Plane, Compass, RefreshCw, Star, Sparkles, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

function isCompositeMatch(m: PotentialMatch): m is CompositeMatch {
  return 'compositeScore' in m && 'confidence' in m;
}

function hasSemanticResults(matches: PotentialMatch[]): boolean {
  return matches.length > 0 && matches.some(isCompositeMatch);
}

export function NearbyTravelersSection() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<PotentialMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivityIds, setSelectedActivityIds] = useState<Set<string>>(new Set());
  const abortRef = useRef<AbortController | null>(null);

  const fetchMatches = useCallback(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);
    findPotentialMatches()
      .then((results) => {
        if (!controller.signal.aborted) {
          setMatches(results);
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setError(err.message ?? 'Failed to find matches');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });
  }, []);

  useEffect(() => {
    getActivities()
      .then(setActivities)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    fetchMatches();
    return () => {
      abortRef.current?.abort();
    };
  }, [user, fetchMatches]);

  const handleRefresh = () => {
    fetchMatches();
  };

  const filteredMatches = useMemo(() => {
    if (selectedActivityIds.size === 0) return matches;

    const nameToId = new Map(activities.map((a) => [a.name.toLowerCase(), a.id]));

    return matches.filter((match) => {
      const matchActivityIds = match.sharedActivities
        .map((name) => nameToId.get(name.toLowerCase()))
        .filter((id): id is string => id !== undefined);
      return matchActivityIds.some((id) => selectedActivityIds.has(id));
    });
  }, [matches, selectedActivityIds, activities]);

  const toggleActivityFilter = useCallback((activityId: string) => {
    setSelectedActivityIds((prev) => {
      const next = new Set(prev);
      if (next.has(activityId)) next.delete(activityId);
      else next.add(activityId);
      return next;
    });
  }, []);

  const clearActivityFilters = useCallback(() => {
    setSelectedActivityIds(new Set());
  }, []);

  const { bestMatches, goodMatches, otherMatches } = useMatchGroups(filteredMatches);

  if (!user) return null;

  const isSemantic = hasSemanticResults(matches);

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10">
            {isSemantic ? (
              <Sparkles className="h-5 w-5 text-brand" />
            ) : (
              <Plane className="h-5 w-5 text-brand" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {isSemantic ? 'AI-Matched Travelers' : 'Travelers Near You'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {filteredMatches.length > 0
                ? `${filteredMatches.length} traveler${filteredMatches.length !== 1 ? 's' : ''}${selectedActivityIds.size > 0 ? ' matching your interests' : ' heading your way'}`
                : selectedActivityIds.size > 0
                  ? 'No travelers match the selected activities'
                  : 'See who else just landed nearby'}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {activities.length > 0 && (
        <ActivityFilterBar
          activities={activities}
          selectedIds={selectedActivityIds}
          onToggle={toggleActivityFilter}
          onClear={clearActivityFilters}
        />
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-56 rounded-2xl bg-card border border-border animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-connection/20 bg-connection/5 p-6 text-center">
          <p className="text-connection mb-3">{error}</p>
          <Button variant="outline" size="sm" onClick={handleRefresh}>Try Again</Button>
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
          <Compass className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {selectedActivityIds.size > 0 ? 'No matches for selected activities' : 'No travelers nearby yet'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {selectedActivityIds.size > 0
              ? 'Try removing some filters or refresh for new results'
              : 'Create a trip to discover travelers heading to the same destination'}
          </p>
          {selectedActivityIds.size > 0 && (
            <Button variant="outline" size="sm" className="mt-3" onClick={clearActivityFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      ) : isSemantic ? (
        <MatchGroupList bestMatches={bestMatches} goodMatches={goodMatches} otherMatches={otherMatches} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </section>
  );
}

function ActivityFilterBar({
  activities,
  selectedIds,
  onToggle,
  onClear,
}: {
  activities: Activity[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onClear: () => void;
}) {
  if (activities.length === 0) return null;

  return (
    <div className="mb-4 flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1 text-sm text-muted-foreground mr-1">
        <Filter className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Filter:</span>
      </div>
      {activities.map((activity) => {
        const isSelected = selectedIds.has(activity.id);
        return (
          <button
            key={activity.id}
            type="button"
            onClick={() => onToggle(activity.id)}
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${
              isSelected
                ? 'bg-brand/10 text-brand border-brand/20'
                : 'bg-card text-muted-foreground border-border hover:bg-muted'
            }`}
            aria-pressed={isSelected}
          >
            {activity.name}
          </button>
        );
      })}
      {selectedIds.size > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted transition-all"
          aria-label="Clear all activity filters"
        >
          <X className="h-3 w-3" />
          Clear
        </button>
      )}
    </div>
  );
}

function MatchGroupList({
  bestMatches,
  goodMatches,
  otherMatches,
}: {
  bestMatches: CompositeMatch[];
  goodMatches: CompositeMatch[];
  otherMatches: PotentialMatch[];
}) {
  return (
    <div className="space-y-8">
      {bestMatches.length > 0 && (
        <MatchGroup title="Best Matches" icon={<Star className="h-4 w-4 text-trust" />} matches={bestMatches} />
      )}
      {goodMatches.length > 0 && (
        <MatchGroup title="Good Matches" icon={<Sparkles className="h-4 w-4 text-brand" />} matches={goodMatches} />
      )}
      {otherMatches.length > 0 && (
        <MatchGroup title="More Travelers" icon={<Plane className="h-4 w-4 text-muted-foreground" />} matches={otherMatches} />
      )}
    </div>
  );
}

function MatchGroup({ title, icon, matches }: { title: string; icon: React.ReactNode; matches: PotentialMatch[] }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <span className="text-xs text-muted-foreground">({matches.length})</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </div>
  );
}

function useMatchGroups(matches: PotentialMatch[]) {
  return useMemo(() => {
    const semantic: CompositeMatch[] = [];
    const nonSemantic: PotentialMatch[] = [];

    for (const m of matches) {
      if (isCompositeMatch(m)) {
        semantic.push(m);
      } else {
        nonSemantic.push(m);
      }
    }

    const bestMatches = semantic.filter((m) => m.matchPercentage >= 80);
    const goodMatches = semantic.filter((m) => m.matchPercentage >= 50 && m.matchPercentage < 80);
    const otherMatches = [
      ...semantic.filter((m) => m.matchPercentage < 50),
      ...nonSemantic,
    ];

    return { bestMatches, goodMatches, otherMatches };
  }, [matches]);
}
