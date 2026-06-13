'use client'

import { useState } from 'react'
import {
  Calendar,
  MapPin,
  Users,
  ChevronRight,
  Mountain,
  UtensilsCrossed,
  Camera,
  Coffee,
  Heart,
  Drama,
} from 'lucide-react'
import { clsx } from 'clsx'
import Link from 'next/link'
import type { MeetupPreview } from '@/types/discover'

const STUB_MEETUPS: MeetupPreview[] = [
  {
    id: '1',
    title: 'Sunset Hike at Lands End',
    date: 'Tomorrow · 5:30 PM',
    location: 'Lands End Trail, SF',
    attendeeCount: 12,
    category: 'Outdoors',
    description: 'Scenic sunset hike along the coast. All fitness levels welcome!',
    host: { name: 'Sarah Chen', avatar: null },
  },
  {
    id: '2',
    title: 'Foodie Meetup: Mission Tacos',
    date: 'Friday · 7:00 PM',
    location: 'La Taqueria, Mission',
    attendeeCount: 8,
    category: 'Food',
    description: 'Explore the best taco spots in the Mission. Come hungry!',
    host: { name: 'Marco Rossi', avatar: null },
  },
  {
    id: '3',
    title: 'Photography Walk: Chinatown',
    date: 'Saturday · 10:00 AM',
    location: 'Grant Avenue, Chinatown',
    attendeeCount: 15,
    category: 'Photography',
    description: "Capture the vibrant streets and hidden alleys of SF's Chinatown.",
    host: { name: 'Yuki Tanaka', avatar: null },
  },
  {
    id: '4',
    title: 'Solo Travelers Coffee Chat',
    date: 'Sunday · 11:00 AM',
    location: 'Blue Bottle, Hayes Valley',
    attendeeCount: 6,
    category: 'Social',
    description: 'Meet fellow solo travelers over artisan coffee. Share stories and tips!',
    host: { name: 'James Wilson', avatar: null },
  },
  {
    id: '5',
    title: 'Morning Yoga in Golden Gate Park',
    date: 'Next Mon · 7:00 AM',
    location: 'Sharon Meadow, GG Park',
    attendeeCount: 20,
    category: 'Wellness',
    description: 'Start your week with outdoor yoga. Bring your own mat!',
    host: { name: 'Aisha Patel', avatar: null },
  },
  {
    id: '6',
    title: 'Language Exchange Night',
    date: 'Next Wed · 6:30 PM',
    location: 'The Language Exchange, SoMa',
    attendeeCount: 14,
    category: 'Cultural',
    description: 'Practice languages and meet people from around the world.',
    host: { name: 'Lisa Chang', avatar: null },
  },
]

const CATEGORIES = ['All', 'Outdoors', 'Food', 'Photography', 'Social', 'Wellness', 'Cultural']

const CATEGORY_COLORS: Record<string, string> = {
  Outdoors: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Food: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  Photography: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  Social: 'bg-brand/10 text-brand',
  Wellness: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  Cultural: 'bg-trust/10 text-trust',
}

const CATEGORY_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  Outdoors: Mountain,
  Food: UtensilsCrossed,
  Photography: Camera,
  Social: Coffee,
  Wellness: Heart,
  Cultural: Drama,
}

export function MeetupsTab() {
  const [activeCategory, setActiveCategory] = useState('All')

  const filtered =
    activeCategory === 'All'
      ? STUB_MEETUPS
      : STUB_MEETUPS.filter(m => m.category === activeCategory)

  return (
    <div className="space-y-4">
      {/* Category Filter */}
      <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={clsx(
              'flex-shrink-0 rounded-full px-3.5 py-2 text-sm font-medium transition-all',
              activeCategory === cat
                ? 'bg-brand text-brand-foreground'
                : 'border border-border bg-card text-muted-foreground hover:bg-muted'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Meetup Cards */}
      <div className="space-y-3">
        {filtered.map(meetup => (
          <div key={meetup.id} className="card-interactive group cursor-pointer p-5">
            <div className="mb-3 flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-connection/10 text-connection">
                {(() => {
                  const Icon = CATEGORY_ICON[meetup.category] || Calendar
                  return <Icon className="h-5 w-5" />
                })()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-start justify-between">
                  <span
                    className={clsx(
                      'rounded-full px-2.5 py-1 text-xs font-medium',
                      CATEGORY_COLORS[meetup.category] || 'bg-muted text-muted-foreground'
                    )}
                  >
                    {meetup.category}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {meetup.date}
                  </span>
                </div>
                <h4 className="mb-1 text-base font-semibold text-foreground transition-colors group-hover:text-brand">
                  {meetup.title}
                </h4>
                <p className="mb-3 text-sm text-muted-foreground">{meetup.description}</p>
              </div>
            </div>

            <div className="mb-4 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {meetup.location}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {meetup.attendeeCount} going
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-3">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand/10 text-xs font-medium text-brand">
                  {meetup.host.name.charAt(0)}
                </div>
                <span className="text-xs text-muted-foreground">Hosted by {meetup.host.name}</span>
              </div>
              <button className="btn-connection px-4 py-2 text-sm font-medium">View details</button>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2 text-center">
        <Link
          href="/meetups"
          className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
        >
          See all meetups <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
