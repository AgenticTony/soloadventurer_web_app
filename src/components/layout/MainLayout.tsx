'use client'

import { useState, useEffect } from 'react'
import { Header } from './Header'
import { LeftNav } from './LeftNav'
import { RightRail } from './RightRail'
import { BottomTabBar } from './BottomTabBar'
import { useAuth } from '@/contexts/AuthContext'
import { usePathname, useRouter } from 'next/navigation'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user, isAuthenticated } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
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
    if (pathname === '/' || pathname.startsWith('/discover') || pathname === '/feed') return 'discover'
    if (pathname.startsWith('/trips')) return 'trips'
    if (pathname.startsWith('/cities')) return 'cities'
    if (pathname.startsWith('/messages') || pathname.startsWith('/chat')) return 'messages'
    if (pathname.startsWith('/groups') || pathname.startsWith('/events') || pathname.startsWith('/meetups')) return 'meetups'
    if (pathname.startsWith('/saved')) return 'saved'
    return 'discover'
  }

  const tabRoutes: Record<string, string> = {
    discover: '/discover',
    feed: '/discover',
    trips: '/trips',
    cities: '/discover',
    messages: '/chat',
    meetups: '/meetups',
    groups: '/meetups',
    events: '/meetups',
    saved: '/saved',
  }

  const handleTabChange = (tab: string) => {
    const route = tabRoutes[tab]
    if (route) router.push(route)
  }

  const handleCreatePost = () => {
    // This would open a post composer modal
    console.log('Open post composer')
  }

  // Basic user data from auth context
  const userData = isAuthenticated
    ? {
        name: user?.name || 'Traveler',
        location: user?.location || '',
        bio: user?.bio || '',
        emailVerified: user?.emailVerified ?? false,
        avatar: user?.avatar,
        stats: {
          trips: 0,
          connections: 0,
          posts: 0,
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
        <div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(680px,1fr)] xl:grid-cols-[240px_minmax(680px,1fr)_300px] gap-6">
          {/* Mobile Menu Overlay */}
          {isMobileMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <div className="fixed inset-y-0 left-0 z-40 w-[280px] bg-card duration-200 animate-in slide-in-from-left lg:hidden">
                <div className="pt-20">
                  <LeftNav user={userData} />
                </div>
              </div>
            </>
          )}

          {/* Left Navigation (Desktop) */}
          <div className="hidden lg:block">
            <LeftNav user={userData} />
          </div>

          {/* Center Content */}
          <main id="main-content" className="min-w-0 w-full border-x border-border">
            <div className="p-4 pb-20 lg:pb-4">{children}</div>
          </main>

          {/* Right Rail (Desktop) */}
          <div className="hidden xl:block">
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
