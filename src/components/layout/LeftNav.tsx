'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Compass,
  Plane,
  MessageCircle,
  Calendar,
  Bookmark,
  Settings,
  HelpCircle,
  MapPin,
  Sparkles,
} from 'lucide-react'
import { clsx } from 'clsx'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect } from 'react'

interface NavItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  href: string
}

interface LeftNavProps {
  user?: {
    name: string
    avatar?: string
    location?: string
    bio?: string
    emailVerified?: boolean
    stats?: {
      trips: number
      connections: number
      posts: number
    }
  }
  unreadChatCount?: number
}

function calculateProfileSteps(u: NonNullable<LeftNavProps['user']>): {
  completed: number
  total: number
  steps: { label: string; done: boolean }[]
} {
  const steps = [
    { label: 'Add your name', done: !!u.name && !u.name.includes('@') },
    { label: 'Set location', done: !!u.location },
    { label: 'Add a photo', done: !!u.avatar },
    { label: 'Write a bio', done: !!u.bio && u.bio.length > 10 },
    { label: 'Verify email', done: !!u.emailVerified },
  ]
  return { completed: steps.filter(s => s.done).length, total: steps.length, steps }
}

export function LeftNav({ user, unreadChatCount = 0 }: LeftNavProps) {
  const pathname = usePathname()
  const [realTimeUnreadCount, setRealTimeUnreadCount] = useState(unreadChatCount)

  useEffect(() => {
    setRealTimeUnreadCount(unreadChatCount)
  }, [unreadChatCount])

  useEffect(() => {
    const handleNewMessage = (event: unknown) => {
      if (
        event &&
        typeof event === 'object' &&
        'type' in event &&
        event.type === 'new_message' &&
        'isRead' in event &&
        !event.isRead
      ) {
        setRealTimeUnreadCount(prev => prev + 1)
      }
    }
    void handleNewMessage
  }, [])

  const navItems: NavItem[] = [
    { id: 'discover', label: 'Discover', icon: Compass, href: '/discover' },
    { id: 'trips', label: 'Trips', icon: Plane, href: '/trips' },
    { id: 'messages', label: 'Messages', icon: MessageCircle, href: '/chat' },
    { id: 'meetups', label: 'Meetups', icon: Calendar, href: '/meetups' },
    { id: 'saved', label: 'Saved', icon: Bookmark, href: '/saved' },
  ]

  const quickLinks: NavItem[] = [
    { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
    { id: 'help', label: 'Help & Support', icon: HelpCircle, href: '/help' },
  ]

  const isActive = (href: string) => {
    if (href === '/discover')
      return pathname === '/' || pathname === '/discover' || pathname === '/feed'
    if (href === '/meetups')
      return pathname === '/meetups' || pathname === '/groups' || pathname === '/events'
    return pathname.startsWith(href)
  }

  const profileComplete = user ? calculateProfileSteps(user) : null
  const isProfileComplete = profileComplete
    ? profileComplete.completed === profileComplete.total
    : false
  const hasTrips = (user?.stats?.trips ?? 0) > 0
  const tripCount = user?.stats?.trips ?? 0

  const tripCTA = hasTrips
    ? tripCount >= 3
      ? "Plan another adventure — you're a pro!"
      : 'Add your next trip'
    : 'Where are you headed next?'

  const tripDescription = hasTrips
    ? `${tripCount} trip${tripCount !== 1 ? 's' : ''} planned`
    : 'Plan your first solo adventure'

  // Contextual CTA based on current page
  const isDiscover = pathname === '/' || pathname === '/discover' || pathname === '/feed'
  const isMeetups = pathname === '/meetups'
  const ctaTitle = isMeetups ? 'Join a meetup' : isDiscover ? 'Find travelers near you' : tripCTA
  const ctaDescription = isMeetups
    ? 'Meet fellow explorers in person'
    : isDiscover
      ? 'Set your location to get started'
      : tripDescription
  const ctaHref = isMeetups ? '/meetups' : isDiscover ? '/discover' : '/trips/new'
  const ctaLabel = isMeetups
    ? 'Browse Meetups'
    : isDiscover
      ? 'Get Started'
      : hasTrips
        ? 'Add Trip'
        : 'Create Trip'

  return (
    <aside className="no-scrollbar sticky top-16 hidden h-[calc(100vh-4rem)] overflow-y-auto lg:block">
      <div className="space-y-6 p-4">
        {/* User Mini Card */}
        {user && (
          <div className="card-base p-4">
            <Link href="/profile" className="block">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary">
                  <span className="text-base font-medium text-primary-foreground">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold text-foreground">{user.name}</h3>
                  {user.location ? (
                    <p className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {user.location}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Explorer</p>
                  )}
                </div>
              </div>

              {/* Profile Progress or Mini Stats */}
              <div className="border-t border-border pt-3">
                {isProfileComplete && user.stats ? (
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-lg font-bold text-foreground">{user.stats.trips}</p>
                      <p className="text-xs text-muted-foreground">Trips</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-foreground">{user.stats.connections}</p>
                      <p className="text-xs text-muted-foreground">Buddies</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-foreground">{user.stats.posts}</p>
                      <p className="text-xs text-muted-foreground">Posts</p>
                    </div>
                  </div>
                ) : profileComplete && profileComplete.completed > 0 ? (
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground">Profile</span>
                      <span className="text-xs font-semibold text-brand">
                        {profileComplete.completed} of {profileComplete.total}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-brand transition-all duration-500"
                        style={{
                          width: `${(profileComplete.completed / profileComplete.total) * 100}%`,
                        }}
                      />
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {profileComplete.steps.find(s => !s.done)?.label} to unlock matches
                    </p>
                  </div>
                ) : (
                  <p className="text-center text-xs text-muted-foreground">
                    Complete your profile to unlock matches
                  </p>
                )}
              </div>
            </Link>
          </div>
        )}

        {/* Main Navigation — 5 primary items */}
        <nav className="space-y-1">
          {navItems.map(item => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.id}
                href={item.href}
                className={clsx(
                  'group relative flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-200',
                  active
                    ? 'bg-brand/10 font-semibold text-brand'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-brand" />
                )}
                <item.icon
                  className={clsx(
                    'h-5 w-5 transition-transform group-hover:scale-110',
                    active ? 'text-brand' : ''
                  )}
                />
                <span className="font-medium">{item.label}</span>
                {item.id === 'messages' && (
                  <div className="ml-auto flex items-center gap-2">
                    {realTimeUnreadCount > 0 && (
                      <Badge className="flex h-5 min-w-[1.25rem] items-center justify-center border-0 bg-connection px-1.5 text-xs text-connection-foreground">
                        {realTimeUnreadCount > 99 ? '99+' : realTimeUnreadCount}
                      </Badge>
                    )}
                    {!realTimeUnreadCount && (
                      <div className="h-2 w-2 rounded-full bg-brand" title="Connected" />
                    )}
                  </div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Quick Links */}
        <div className="border-t border-border pt-6">
          <div className="space-y-1">
            {quickLinks.map(item => (
              <Link
                key={item.id}
                href={item.href}
                className="group flex items-center gap-3 rounded-2xl px-4 py-3 text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground"
              >
                <item.icon className="h-5 w-5 transition-transform group-hover:scale-110" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Contextual CTA */}
        <div className="card-base p-4">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-trust" />
            <h4 className="font-semibold text-foreground">{ctaTitle}</h4>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">{ctaDescription}</p>
          <Link
            href={ctaHref}
            className="block w-full rounded-2xl bg-brand px-4 py-2.5 text-center font-medium text-brand-foreground shadow-sm transition-all duration-200 hover:bg-brand/90 hover:shadow-md"
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    </aside>
  )
}
