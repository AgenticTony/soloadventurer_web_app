'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Compass, 
  User, 
  LogOut, 
  Settings, 
  HelpCircle, 
  Moon, 
  Sun,
  Plus,
  Search,
  MessageCircle,
  Bell,
  Menu,
  X
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { clsx } from 'clsx'

interface HeaderProps {
  onMenuToggle?: () => void
  isMenuOpen?: boolean
}

export function Header({ onMenuToggle, isMenuOpen = false }: HeaderProps) {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setDarkMode(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  const handleSignOut = async () => {
    try {
      await logout()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-card shadow-header border-b border-border">
      <nav className="mx-auto">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Left: Logo and Menu */}
            <div className="flex items-center gap-4">
              {/* Mobile Menu Toggle */}
              <button
                onClick={onMenuToggle}
                className="lg:hidden p-2 hover:bg-muted rounded-2xl transition-colors"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5 text-foreground" />
                ) : (
                  <Menu className="w-5 h-5 text-foreground" />
                )}
              </button>
              
              {/* Logo */}
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-sm">
                  <Compass className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="hidden sm:block text-xl font-bold text-foreground">SoloAdventurer</span>
              </Link>
            </div>

            {/* Center: Search */}
            <div className="hidden md:flex items-center flex-1 max-w-xl mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search travelers, cities, trips..."
                  className={clsx(
                    "w-full pl-10 pr-4 py-2.5 bg-muted rounded-2xl border transition-all duration-200",
                    "placeholder:text-muted-foreground text-foreground",
                    isSearchFocused
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border hover:border-border/80"
                  )}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                />
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {/* Create Button */}
              <button className="hidden sm:flex p-2.5 hover:bg-muted rounded-2xl transition-all duration-200 group">
                <Plus className="w-5 h-5 text-foreground group-hover:scale-110 transition-transform" />
              </button>
              
              {/* Messages */}
              <button className="p-2.5 hover:bg-muted rounded-2xl transition-all duration-200 relative group">
                <MessageCircle className="w-5 h-5 text-foreground group-hover:scale-110 transition-transform" />
                {isAuthenticated && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                )}
              </button>
              
              {/* Notifications */}
              <button className="p-2.5 hover:bg-muted rounded-2xl transition-all duration-200 relative group">
                <Bell className="w-5 h-5 text-foreground group-hover:scale-110 transition-transform" />
                {isAuthenticated && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-coral-500 rounded-full animate-pulse"></span>
                )}
              </button>
              
              {/* Dark Mode Toggle */}
              {mounted && (
                <button
                  onClick={toggleDarkMode}
                  className="hidden sm:flex p-2.5 hover:bg-muted rounded-2xl transition-all duration-200 group"
                  aria-label="Toggle dark mode"
                >
                  {darkMode ? (
                    <Sun className="w-5 h-5 text-foreground group-hover:scale-110 transition-transform" />
                  ) : (
                    <Moon className="w-5 h-5 text-foreground group-hover:scale-110 transition-transform" />
                  )}
                </button>
              )}
              
              {/* User Menu */}
              {isAuthenticated && user ? (
                <div className="relative ml-2">
                  <button
                    type="button"
                    className="flex items-center gap-2 p-1 rounded-2xl hover:bg-muted transition-all duration-200 group"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center ring-2 ring-border group-hover:ring-primary transition-all">
                      <span className="text-sm font-medium text-primary-foreground">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  </button>

                  {/* Dropdown menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-2xl bg-card py-2 shadow-lg ring-1 ring-border animate-in">
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-sm font-medium text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
                      </div>
                      
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        Your Profile
                      </Link>
                      
                      <Link
                        href="/settings"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        Settings & Privacy
                      </Link>
                      
                      <button
                        onClick={() => {
                          toggleDarkMode()
                          setIsUserMenuOpen(false)
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors sm:hidden"
                      >
                        {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        {darkMode ? 'Light Mode' : 'Dark Mode'}
                      </button>
                      
                      <Link
                        href="/help"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <HelpCircle className="w-4 h-4" />
                        Help & Support
                      </Link>
                      
                      <div className="my-2 border-t border-border" />
                      
                      <button
                        onClick={() => {
                          handleSignOut()
                          setIsUserMenuOpen(false)
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="/sign-in"
                    className="text-foreground hover:text-foreground/80 px-4 py-2 text-sm font-medium transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}