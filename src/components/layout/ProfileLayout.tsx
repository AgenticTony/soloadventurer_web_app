'use client'

import { Header } from './Header'
import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { BottomTabBar } from './BottomTabBar'

interface ProfileLayoutProps {
  children: React.ReactNode
}

export function ProfileLayout({ children }: ProfileLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Get active tab from pathname
  const getActiveTab = () => {
    if (pathname === '/') return 'feed'
    if (pathname.startsWith('/trips')) return 'trips'
    if (pathname.startsWith('/cities')) return 'cities'
    if (pathname.startsWith('/messages')) return 'messages'
    if (pathname.startsWith('/groups')) return 'groups'
    if (pathname.startsWith('/events')) return 'events'
    if (pathname.startsWith('/saved')) return 'saved'
    if (pathname.startsWith('/profile')) return 'profile'
    return 'feed'
  }

  const handleTabChange = (tab: string) => {
    const route = `/${tab === 'feed' ? '' : tab}`
    if (pathname !== route) router.push(route)
  }

  const handleCreatePost = () => {
    router.push('/create')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header
        onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMenuOpen={isMobileMenuOpen}
      />

      {/* Main Content Area - Full width */}
      <main className="min-h-[calc(100vh-4rem)]">
        <div className="pb-20 lg:pb-0">{children}</div>
      </main>

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
