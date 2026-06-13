'use client'

import { useState } from 'react'
import { Compass, Plane, MessageCircle, Calendar, Bookmark, Plus } from 'lucide-react'

interface BottomTabBarProps {
  activeTab?: string
  onTabChange?: (tab: string) => void
  onCreatePost?: () => void
  unreadMessages?: number
  unreadNotifications?: number
}

interface TabItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  badge?: number
}

export function BottomTabBar({
  activeTab = 'discover',
  onTabChange,
  onCreatePost,
  unreadMessages = 0,
  unreadNotifications = 0,
}: BottomTabBarProps) {
  const [showCreate, setShowCreate] = useState(false)
  void unreadNotifications

  const tabs: TabItem[] = [
    { id: 'discover', label: 'Discover', icon: Compass, href: '/discover' },
    { id: 'trips', label: 'Trips', icon: Plane, href: '/trips' },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageCircle,
      href: '/chat',
      badge: unreadMessages,
    },
    { id: 'meetups', label: 'Meetups', icon: Calendar, href: '/meetups' },
    { id: 'saved', label: 'Saved', icon: Bookmark, href: '/saved' },
  ]

  const handleTabClick = (tabId: string) => {
    setShowCreate(false)
    onTabChange?.(tabId)
  }

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card lg:hidden">
        <div className="flex h-16 items-center justify-around">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={clsx(
                'relative flex h-full w-16 flex-col items-center justify-center transition-colors',
                activeTab === tab.id ? 'text-brand' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className="relative">
                <tab.icon
                  className={clsx(
                    'h-5 w-5',
                    activeTab === tab.id && 'scale-110 transition-transform'
                  )}
                />
                {tab.badge && tab.badge > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-connection px-1 text-[10px] font-bold text-connection-foreground">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </div>
              <span className={clsx('mt-1 text-xs', activeTab === tab.id && 'font-semibold')}>
                {tab.label}
              </span>

              {/* Active indicator bar */}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-brand" />
              )}
            </button>
          ))}

          {/* Create button (floating) */}
          <button
            onClick={() => {
              setShowCreate(!showCreate)
              onCreatePost?.()
            }}
            className="flex h-full w-16 flex-col items-center justify-center transition-colors"
            aria-label="Create"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-lg transition-colors hover:bg-brand/90">
              <Plus className="h-5 w-5" />
            </div>
          </button>
        </div>
      </nav>

      {/* Spacer for mobile devices */}
      <div className="h-16 lg:hidden" />
    </>
  )
}

function clsx(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
