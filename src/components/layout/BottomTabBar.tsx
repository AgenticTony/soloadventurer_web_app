'use client'

import { useState } from 'react'
import {
  Compass,
  Plane,
  MessageCircle,
  Calendar,
  Bookmark,
  Plus,
} from 'lucide-react'

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
    { id: 'messages', label: 'Messages', icon: MessageCircle, href: '/chat', badge: unreadMessages },
    { id: 'meetups', label: 'Meetups', icon: Calendar, href: '/meetups' },
    { id: 'saved', label: 'Saved', icon: Bookmark, href: '/saved' },
  ]

  const handleTabClick = (tabId: string) => {
    setShowCreate(false)
    onTabChange?.(tabId)
  }

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 lg:hidden">
        <div className="flex items-center justify-around h-16">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={clsx(
                "flex flex-col items-center justify-center w-16 h-full transition-colors relative",
                activeTab === tab.id
                  ? "text-brand"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <tab.icon className={clsx(
                  "w-5 h-5",
                  activeTab === tab.id && "scale-110 transition-transform"
                )} />
                {tab.badge && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[1rem] h-4 bg-connection rounded-full flex items-center justify-center text-[10px] text-connection-foreground font-bold px-1">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </div>
              <span className={clsx(
                "text-xs mt-1",
                activeTab === tab.id && "font-semibold"
              )}>{tab.label}</span>

              {/* Active indicator bar */}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-brand rounded-full" />
              )}
            </button>
          ))}

          {/* Create button (floating) */}
          <button
            onClick={() => {
              setShowCreate(!showCreate)
              onCreatePost?.()
            }}
            className="flex flex-col items-center justify-center w-16 h-full transition-colors"
            aria-label="Create"
          >
            <div className="w-10 h-10 bg-brand rounded-full flex items-center justify-center text-brand-foreground shadow-lg hover:bg-brand/90 transition-colors">
              <Plus className="w-5 h-5" />
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
