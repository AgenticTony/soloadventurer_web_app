'use client'

import { useState, useEffect } from 'react'
import { Header } from './Header'
import { LeftNav } from './LeftNav'
import { RightRail } from './RightRail'
import { BottomTabBar } from './BottomTabBar'
import { useAuth } from '@/contexts/AuthContext'
import { usePathname } from 'next/navigation'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user, isAuthenticated } = useAuth()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  // Get active tab from pathname
  const getActiveTab = () => {
    if (pathname === '/') return 'feed'
    if (pathname.startsWith('/trips')) return 'trips'
    if (pathname.startsWith('/cities')) return 'cities'
    if (pathname.startsWith('/messages')) return 'messages'
    if (pathname.startsWith('/groups')) return 'groups'
    if (pathname.startsWith('/events')) return 'events'
    if (pathname.startsWith('/saved')) return 'saved'
    return 'feed'
  }

  const handleTabChange = (tab: string) => {
    // This would be handled by navigation in a real app
    console.log('Navigate to:', tab)
  }

  const handleCreatePost = () => {
    // This would open a post composer modal
    console.log('Open post composer')
  }

  // Mock user data for development
  const mockUser = isAuthenticated
    ? {
        name: user?.name || 'John Doe',
        location: 'San Francisco, CA',
        stats: {
          trips: 12,
          connections: 89,
          posts: 45,
        },
      }
    : undefined

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header
        onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMenuOpen={isMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div className="mx-auto max-w-[1920px]">
        <div className="flex gap-6">
          {/* Mobile Menu Overlay */}
          {isMobileMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <div className="fixed inset-y-0 left-0 z-40 w-[280px] bg-card duration-200 animate-in slide-in-from-left lg:hidden">
                <div className="pt-20">
                  <LeftNav user={mockUser} />
                </div>
              </div>
            </>
          )}

          {/* Left Navigation (Desktop) */}
          <div className="hidden w-[280px] flex-shrink-0 lg:block">
            <LeftNav user={mockUser} />
          </div>

          {/* Center Content - Feed Area */}
          <main className="mx-auto min-w-0 max-w-2xl flex-1 border-x border-border">
            <div className="p-4 pb-20 lg:pb-4">{children}</div>
          </main>

          {/* Right Rail (Desktop) */}
          <div className="hidden w-[320px] flex-shrink-0 xl:block">
            <RightRail />
          </div>
        </div>
      </div>

      {/* Bottom Tab Bar (Mobile) */}
      <BottomTabBar
        activeTab={getActiveTab()}
        onTabChange={handleTabChange}
        onCreatePost={handleCreatePost}
        unreadMessages={3}
        unreadNotifications={7}
      />
    </div>
  )
}
