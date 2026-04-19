'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  MapPin, Users, Navigation, ChevronRight, TrendingUp,
  Calendar, Sparkles, Sun, Cloud, CloudRain,
  Mountain, UtensilsCrossed, Camera, Coffee, Heart, Drama,
} from 'lucide-react';
import { clsx } from 'clsx';
import { MatchCard } from '@/components/features/matching/MatchCard';
import { findPotentialMatches } from '@/lib/api/matching';
import type { PotentialMatch } from '@/types/matching';
import type { CityHero, TrendingSpot, MeetupPreview, DiscoverFilter } from '@/types/discover';

const STUB_CITY: CityHero = {
  name: 'San Francisco',
  country: 'United States',
  travelerCount: 234,
  weather: { temp: 72, condition: 'sunny' },
};

const STUB_TRENDING: TrendingSpot[] = [
  { id: '1', name: 'Golden Gate Bridge', visitorCount: 42 },
  { id: '2', name: "Fisherman's Wharf", visitorCount: 38 },
  { id: '3', name: 'Alcatraz Island', visitorCount: 31 },
  { id: '4', name: 'Chinatown', visitorCount: 27 },
  { id: '5', name: 'Mission District', visitorCount: 24 },
];

const STUB_MEETUPS: MeetupPreview[] = [
  { id: '1', title: 'Sunset Hike at Lands End', date: 'Tomorrow · 5:30 PM', location: 'Lands End Trail', attendeeCount: 12, category: 'Outdoors', description: 'Scenic sunset hike along the coast', host: { name: 'Sarah Chen', avatar: null } },
  { id: '2', title: 'Foodie Meetup: Mission Tacos', date: 'Friday · 7:00 PM', location: 'La Taqueria', attendeeCount: 8, category: 'Food', description: 'Explore the best taco spots', host: { name: 'Marco Rossi', avatar: null } },
  { id: '3', title: 'Photography Walk: Chinatown', date: 'Saturday · 10 AM', location: 'Grant Avenue', attendeeCount: 15, category: 'Photography', description: 'Capture vibrant streets and alleys', host: { name: 'Yuki Tanaka', avatar: null } },
  { id: '4', title: 'Solo Travelers Coffee Chat', date: 'Sunday · 11 AM', location: 'Blue Bottle Coffee', attendeeCount: 6, category: 'Social', description: 'Meet fellow travelers over coffee', host: { name: 'James Wilson', avatar: null } },
];

const QUICK_FILTERS: DiscoverFilter[] = [
  { id: 'arriving-week', label: 'Arriving this week' },
  { id: 'food', label: 'Food lovers' },
  { id: 'female-travelers', label: 'Women travelers' },
  { id: 'photography', label: 'Photography' },
];

interface NearYouTabProps {
  userLocation?: { latitude: number; longitude: number; accuracy?: number } | null;
  onRequestLocation: () => void;
}

function WeatherIcon({ condition }: { condition: 'sunny' | 'cloudy' | 'rainy' }) {
  switch (condition) {
    case 'cloudy': return <Cloud className="h-5 w-5 text-white/80" />;
    case 'rainy': return <CloudRain className="h-5 w-5 text-white/80" />;
    default: return <Sun className="h-5 w-5 text-white/80" />;
  }
}

export function NearYouTab({ userLocation, onRequestLocation }: NearYouTabProps) {
  const [matches, setMatches] = useState<PotentialMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const abortRef = useRef<AbortController | null>(null);

  const fetchMatches = useCallback(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setIsLoading(true);

    findPotentialMatches()
      .then((results) => {
        if (!controller.signal.aborted) setMatches(results);
      })
      .catch(() => {})
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchMatches();
    return () => { abortRef.current?.abort(); };
  }, [fetchMatches]);

  const toggleFilter = (id: string) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const arrivingSoon = matches
    .filter((m) => m.startDate && new Date(m.startDate) > new Date())
    .sort((a, b) => (a.startDate! > b.startDate! ? 1 : -1))
    .slice(0, 8);

  const hereNow = matches.slice(0, 6);
  const city = STUB_CITY;
  const hasLocation = !!userLocation;

  return (
    <div className="space-y-8">
      {/* ── City Hero Card ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-ocean-sunset">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative p-6 sm:p-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="h-5 w-5 text-white/80" />
                <span className="text-sm font-medium text-white/80">{hasLocation ? city.name : 'Your city'}</span>
              </div>
              <h2 className="text-3xl font-bold text-white tracking-tight">
                {hasLocation ? city.name : 'Explore the World'}
              </h2>
            </div>
            {hasLocation && (
              <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl px-3 py-2">
                <WeatherIcon condition={city.weather.condition} />
                <span className="text-lg font-semibold text-white">{city.weather.temp}°F</span>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3">
            {hasLocation ? (
              <button className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors text-white font-semibold px-5 py-3 rounded-xl">
                <Users className="h-5 w-5" />
                {city.travelerCount.toLocaleString()} travelers nearby
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={onRequestLocation}
                className="inline-flex items-center gap-2 bg-white text-brand font-semibold px-5 py-3 rounded-xl hover:bg-white/90 transition-colors"
              >
                <Navigation className="h-4 w-4" />
                Set your location
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Quick Filters ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-medium text-muted-foreground mr-1">Filter:</span>
        {QUICK_FILTERS.map((filter) => {
          const isActive = activeFilters.has(filter.id);
          return (
            <button
              key={filter.id}
              onClick={() => toggleFilter(filter.id)}
              className={clsx(
                'inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-all',
                isActive
                  ? 'bg-brand text-brand-foreground shadow-sm'
                  : 'bg-card border border-border text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* ── Trending Spots ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-4 w-4 text-trust" />
          <h3 className="text-sm font-semibold text-foreground">Trending Spots</h3>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {STUB_TRENDING.map((spot) => (
            <button
              key={spot.id}
              className="flex-shrink-0 inline-flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2.5 text-sm hover:bg-muted hover:border-brand/20 transition-all group"
            >
              <MapPin className="h-3.5 w-3.5 text-brand" />
              <span className="font-medium text-foreground">{spot.name}</span>
              <span className="text-xs text-muted-foreground">{spot.visitorCount}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Travelers Arriving Soon ── */}
      {arrivingSoon.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand" />
              <h3 className="text-sm font-semibold text-foreground">Arriving Soon</h3>
            </div>
            <button className="text-xs font-medium text-brand hover:underline">View all</button>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 scroll-smooth snap-x snap-mandatory">
            {arrivingSoon.map((t) => (
              <ArrivingSoonCard key={t.id} traveler={t} />
            ))}
          </div>
        </div>
      )}

      {/* ── Who's Here Now ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-foreground">
            Who&apos;s Here Now
            {hereNow.length > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">({hereNow.length})</span>
            )}
          </h3>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-48 rounded-2xl bg-card border border-border animate-pulse" />
            ))}
          </div>
        ) : hereNow.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {hereNow.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        ) : (
          <PopularCitiesFallback />
        )}
      </div>

      {/* ── Meetups This Week ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-connection" />
            <h3 className="text-sm font-semibold text-foreground">Meetups This Week</h3>
          </div>
          <a href="/meetups" className="text-xs font-medium text-brand hover:underline flex items-center gap-1">
            See all meetups <ChevronRight className="h-3 w-3" />
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {STUB_MEETUPS.map((meetup) => (
            <MeetupPreviewCard key={meetup.id} meetup={meetup} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ArrivingSoonCard({ traveler }: { traveler: PotentialMatch }) {
  const initials = traveler.displayName.charAt(0).toUpperCase();

  return (
    <div className="flex-shrink-0 w-56 snap-start bg-card rounded-2xl border border-border p-4 hover:shadow-card-hover transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-ocean-sunset flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
          {traveler.avatarUrl ? (
            <img src={traveler.avatarUrl} alt={traveler.displayName} className="w-full h-full rounded-full object-cover" />
          ) : initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground truncate">{traveler.displayName}</p>
          {traveler.homeCountry && (
            <p className="text-xs text-muted-foreground truncate">{traveler.homeCountry}</p>
          )}
        </div>
      </div>

      {traveler.destinationName && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
          <MapPin className="h-3 w-3 flex-shrink-0 text-brand" />
          <span className="truncate">{traveler.destinationName}</span>
        </div>
      )}
      {traveler.startDate && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
          <Calendar className="h-3 w-3 flex-shrink-0" />
          <span>{new Date(traveler.startDate).toLocaleDateString()}</span>
        </div>
      )}
      {traveler.sharedActivities.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {traveler.sharedActivities.slice(0, 3).map((a) => (
            <span key={a} className="text-xs bg-brand/10 text-brand rounded-full px-2 py-0.5">{a}</span>
          ))}
        </div>
      )}
      <button className="w-full btn-connection py-2 text-sm font-medium">
        Say hi
      </button>
    </div>
  );
}

const CATEGORY_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  Outdoors: Mountain,
  Food: UtensilsCrossed,
  Photography: Camera,
  Social: Coffee,
  Wellness: Heart,
  Cultural: Drama,
};

function MeetupPreviewCard({ meetup }: { meetup: MeetupPreview }) {
  return (
    <div className="card-interactive p-4 group cursor-pointer">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-connection/10 flex items-center justify-center flex-shrink-0 text-connection">
          {(() => { const Icon = CATEGORY_ICON[meetup.category] || Calendar; return <Icon className="h-5 w-5" />; })()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <span className="text-xs font-medium text-connection bg-connection/10 px-2 py-0.5 rounded-full">
              {meetup.category}
            </span>
            <span className="text-xs text-muted-foreground">{meetup.date}</span>
          </div>
          <h4 className="text-sm font-semibold text-foreground mb-1 group-hover:text-brand transition-colors">
            {meetup.title}
          </h4>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {meetup.location}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              {meetup.attendeeCount}
            </div>
          </div>
        </div>
      </div>
      <button className="mt-3 w-full py-2 rounded-xl text-sm font-medium bg-brand/10 text-brand hover:bg-brand/20 transition-colors">
        View details
      </button>
    </div>
  );
}

function PopularCitiesFallback() {
  const cities = [
    { name: 'Tokyo', icon: 'Tower', travelers: '1.2k' },
    { name: 'Barcelona', icon: 'Castle', travelers: '894' },
    { name: 'Bali', icon: 'Palm', travelers: '756' },
    { name: 'Lisbon', icon: 'Bridge', travelers: '623' },
    { name: 'Bangkok', icon: 'Temple', travelers: '589' },
    { name: 'Mexico City', icon: 'Taco', travelers: '412' },
  ];

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-3">
        Popular cities for solo travelers — tap to explore
      </p>
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
        {cities.map((city) => (
          <button
            key={city.name}
            className="flex-shrink-0 w-36 bg-card border border-border rounded-2xl p-4 text-center hover:border-brand/30 hover:shadow-card-hover transition-all group"
          >
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-brand/10 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-brand" />
            </div>
            <p className="text-sm font-semibold text-foreground group-hover:text-brand transition-colors">{city.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{city.travelers} travelers</p>
          </button>
        ))}
      </div>
    </div>
  );
}
