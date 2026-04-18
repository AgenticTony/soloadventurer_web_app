'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Users,
  Calendar,
  Bookmark,
  Settings,
  HelpCircle,
  MapPin,
  MessageCircle,
  Plane
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
    stats?: {
      trips: number
      connections: number
      posts: number
    }
  }
  unreadChatCount?: number
}

export function LeftNav({ user, unreadChatCount = 0 }: LeftNavProps) {
  const pathname = usePathname()
  const [realTimeUnreadCount, setRealTimeUnreadCount] = useState(unreadChatCount)

  // Update real-time unread count when props change
  useEffect(() => {
    setRealTimeUnreadCount(unreadChatCount)
  }, [unreadChatCount])

  // WebSocket message listener for real-time updates
  useEffect(() => {
    // In a real implementation, listen for WebSocket messages
    // and update unread count accordingly
    const handleNewMessage = (event: unknown) => {
      if (event && typeof event === 'object' && 'type' in event && event.type === 'new_message' && 'isRead' in event && !event.isRead) {
        setRealTimeUnreadCount(prev => prev + 1)
      }
    }

    // This would be implemented with actual WebSocket listeners
    // window.addEventListener('websocket-message', handleNewMessage)
    // return () => window.removeEventListener('websocket-message', handleNewMessage)
  }, [])
  
  const navItems: NavItem[] = [
    { id: 'feed', label: 'Feed', icon: Home, href: '/' },
    { id: 'trips', label: 'Trips', icon: Plane, href: '/trips' },
    { id: 'cities', label: 'City Hubs', icon: MapPin, href: '/cities' },
    { id: 'messages', label: 'Messages', icon: MessageCircle, href: '/chat' },
    { id: 'groups', label: 'Groups', icon: Users, href: '/groups' },
    { id: 'events', label: 'Events & Trips', icon: Calendar, href: '/events' },
    { id: 'saved', label: 'Saved', icon: Bookmark, href: '/saved' },
  ]

  const quickLinks: NavItem[] = [
    { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
    { id: 'help', label: 'Help & Support', icon: HelpCircle, href: '/help' },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <aside className="hidden lg:block w-[280px] sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto no-scrollbar">
      <div className="p-4 space-y-6">
        {/* User Mini Card */}
        {user && (
          <div className="p-4 card-base">
            <Link href="/profile" className="block">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-base font-medium text-primary-foreground">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{user.name}</h3>
                  {user.location && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {user.location}
                    </p>
                  )}
                </div>
              </div>
              
              {user.stats && (
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-foreground">{user.stats.trips}</p>
                    <p className="text-xs text-muted-foreground">Trips</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-foreground">{user.stats.connections}</p>
                    <p className="text-xs text-muted-foreground">Buddies</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-foreground">{user.stats.posts}</p>
                    <p className="text-xs text-muted-foreground">Posts</p>
                  </div>
                </div>
              )}
            </Link>
          </div>
        )}

        {/* Main Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.id}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group",
                  active
                    ? "bg-primary/10 text-primary dark:bg-primary/20"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className={clsx(
                  "w-5 h-5 transition-transform group-hover:scale-110",
                  active && "text-primary"
                )} />
                <span className="font-medium">{item.label}</span>
                {item.id === 'messages' && (
                  <div className="ml-auto flex items-center gap-2">
                    {realTimeUnreadCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="text-xs min-w-[1.25rem] h-5 flex items-center justify-center px-1.5"
                      >
                        {realTimeUnreadCount > 99 ? '99+' : realTimeUnreadCount}
                      </Badge>
                    )}
                    {!realTimeUnreadCount && (
                      <div className="w-2 h-2 bg-green-500 rounded-full" title="Connected" />
                    )}
                  </div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Quick Links */}
        <div className="pt-6 border-t border-border">
          <div className="space-y-1">
            {quickLinks.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 group"
              >
                <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Create Trip CTA */}
        <div className="card-base p-4">
          <h4 className="font-semibold text-foreground mb-2">Ready to explore?</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Plan your next solo adventure
          </p>
          <button className="w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 transition-all duration-200 font-medium shadow-sm hover:shadow-md">
            Create Trip
          </button>
        </div>
      </div>
    </aside>
  )
}