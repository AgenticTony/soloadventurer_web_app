'use client'

import { useState } from 'react'
import { 
  Home, 
  Compass, 
  Users, 
  MessageCircle, 
  Calendar,
  Bookmark,
  Plus,
  Menu
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
  badge?: number
}

export function BottomTabBar({ 
  activeTab = 'feed', 
  onTabChange, 
  onCreatePost,
  unreadMessages = 0,
  unreadNotifications = 0 // eslint-disable-line @typescript-eslint/no-unused-vars
}: BottomTabBarProps) {
  const [showMoreMenu, setShowMoreMenu] = useState(false)

  const mainTabs: TabItem[] = [
    { id: 'feed', label: 'Feed', icon: Home },
    { id: 'cities', label: 'Cities', icon: Compass },
    { id: 'chat', label: 'Messages', icon: MessageCircle, badge: unreadMessages },
    { id: 'buddies', label: 'Buddies', icon: Users },
  ]

  const moreTabs: TabItem[] = [
    { id: 'trips', label: 'Trips', icon: Calendar },
    { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
    { id: 'groups', label: 'Groups', icon: Users },
    { id: 'events', label: 'Events', icon: Calendar },
  ]

  const handleTabClick = (tabId: string) => {
    if (tabId === 'more') {
      setShowMoreMenu(!showMoreMenu)
    } else {
      setShowMoreMenu(false)
      onTabChange?.(tabId)
    }
  }

  return (
    <>
      {/* Main Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 lg:hidden">
        <div className="flex items-center justify-around h-16">
          {mainTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={clsx(
                "flex flex-col items-center justify-center w-16 h-full transition-colors relative",
                activeTab === tab.id
                  ? "text-brand-500"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <tab.icon className={clsx(
                  "w-5 h-5",
                  activeTab === tab.id && "animate-pulse"
                )} />
                {tab.badge && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[1rem] h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold px-1">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1">{tab.label}</span>
            </button>
          ))}

          {/* Create Post Button */}
          <button
            onClick={onCreatePost}
            className="flex flex-col items-center justify-center w-16 h-full transition-colors"
          >
            <div className="w-10 h-10 bg-brand-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-brand-600 transition-colors">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs mt-1 text-muted-foreground">Create</span>
          </button>

          {/* More Menu */}
          <button
            onClick={() => handleTabClick('more')}
            className={clsx(
              "flex flex-col items-center justify-center w-16 h-full transition-colors",
              showMoreMenu ? "text-brand-500" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Menu className="w-5 h-5" />
            <span className="text-xs mt-1">More</span>
          </button>
        </div>
      </nav>

      {/* More Menu Overlay */}
      {showMoreMenu && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setShowMoreMenu(false)}
          />
          
          {/* Menu Content */}
          <div className="fixed bottom-16 left-0 right-0 bg-card border-t border-border rounded-t-2xl z-40 lg:hidden">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">More Options</h3>
                <button
                  onClick={() => setShowMoreMenu(false)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {moreTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={clsx(
                      "flex flex-col items-center p-4 rounded-xl transition-colors",
                      activeTab === tab.id
                        ? "bg-brand-50 dark:bg-brand-500/10 text-brand-500"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <tab.icon className="w-6 h-6 mb-2" />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Spacer for mobile devices */}
      <div className="h-16 lg:hidden" />
    </>
  )
}

function clsx(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}