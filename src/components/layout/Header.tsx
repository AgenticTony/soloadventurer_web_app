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
  X,
  Users,
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
    <header
      className="sticky top-0 z-50 border-b border-border bg-card shadow-header"
      role="banner"
    >
      <nav className="mx-auto" role="navigation" aria-label="Main navigation">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Left: Logo and Menu */}
            <div className="flex items-center gap-4">
              {/* Mobile Menu Toggle */}
              <button
                onClick={onMenuToggle}
                className="rounded-2xl p-2 transition-colors hover:bg-muted lg:hidden"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <X className="h-5 w-5 text-foreground" />
                ) : (
                  <Menu className="h-5 w-5 text-foreground" />
                )}
              </button>

              {/* Logo */}
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary shadow-sm">
                  <Compass className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="hidden text-xl font-bold text-foreground sm:block">
                  SoloAdventurer
                </span>
              </Link>
            </div>

            {/* Center: Search */}
            <div className="mx-8 hidden max-w-xl flex-1 items-center md:flex">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search travelers, cities, trips..."
                  className={clsx(
                    'w-full rounded-2xl border bg-muted py-2.5 pl-10 pr-4 transition-all duration-200',
                    'text-foreground placeholder:text-muted-foreground',
                    isSearchFocused
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-border hover:border-border/80'
                  )}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  aria-label="Search travelers, cities, and trips"
                />
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {/* Create Button */}
              <button
                className="group hidden rounded-2xl p-2.5 transition-all duration-200 hover:bg-muted sm:flex"
                aria-label="Create new post"
              >
                <Plus className="h-5 w-5 text-foreground transition-transform group-hover:scale-110" />
              </button>

              {/* Connections */}
              {isAuthenticated && (
                <Link
                  href="/connections"
                  className="group relative rounded-2xl p-2.5 transition-all duration-200 hover:bg-muted"
                  aria-label="Connections"
                >
                  <Users className="h-5 w-5 text-foreground transition-transform group-hover:scale-110" />
                </Link>
              )}

              {/* Messages */}
              <Link
                href="/chat"
                className="group relative rounded-2xl p-2.5 transition-all duration-200 hover:bg-muted"
                aria-label="Messages"
              >
                <MessageCircle className="h-5 w-5 text-foreground transition-transform group-hover:scale-110" />
                {isAuthenticated && (
                  <span
                    className="absolute -right-0.5 -top-0.5 h-2 w-2 animate-pulse rounded-full bg-primary"
                    aria-hidden="true"
                  ></span>
                )}
              </Link>

              {/* Notifications */}
              <button
                className="group relative rounded-2xl p-2.5 transition-all duration-200 hover:bg-muted"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5 text-foreground transition-transform group-hover:scale-110" />
                {isAuthenticated && (
                  <span
                    className="absolute -right-0.5 -top-0.5 h-2 w-2 animate-pulse rounded-full bg-coral-500"
                    aria-hidden="true"
                  ></span>
                )}
              </button>

              {/* Dark Mode Toggle */}
              {mounted && (
                <button
                  onClick={toggleDarkMode}
                  className="group hidden rounded-2xl p-2.5 transition-all duration-200 hover:bg-muted sm:flex"
                  aria-label="Toggle dark mode"
                >
                  {darkMode ? (
                    <Sun className="h-5 w-5 text-foreground transition-transform group-hover:scale-110" />
                  ) : (
                    <Moon className="h-5 w-5 text-foreground transition-transform group-hover:scale-110" />
                  )}
                </button>
              )}

              {/* User Menu */}
              {isAuthenticated && user ? (
                <div className="relative ml-2">
                  <button
                    type="button"
                    className="group flex items-center gap-2 rounded-2xl p-1 transition-all duration-200 hover:bg-muted"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    aria-expanded={isUserMenuOpen}
                    aria-haspopup="menu"
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary ring-2 ring-border transition-all group-hover:ring-primary">
                      <span className="text-sm font-medium text-primary-foreground">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  </button>

                  {/* Dropdown menu */}
                  {isUserMenuOpen && (
                    <div
                      className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-2xl bg-card py-2 shadow-lg ring-1 ring-border animate-in"
                      role="menu"
                    >
                      <div className="border-b border-border px-4 py-3">
                        <p className="text-sm font-medium text-foreground">{user.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{user.email}</p>
                      </div>

                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        Your Profile
                      </Link>

                      <Link
                        href="/connections"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Users className="h-4 w-4" />
                        <span>Connections</span>
                      </Link>

                      <Link
                        href="/settings"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        Settings & Privacy
                      </Link>

                      <button
                        onClick={() => {
                          toggleDarkMode()
                          setIsUserMenuOpen(false)
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-muted sm:hidden"
                      >
                        {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        {darkMode ? 'Light Mode' : 'Dark Mode'}
                      </button>

                      <Link
                        href="/help"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <HelpCircle className="h-4 w-4" />
                        Help & Support
                      </Link>

                      <div className="my-2 border-t border-border" />

                      <button
                        onClick={() => {
                          handleSignOut()
                          setIsUserMenuOpen(false)
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="/sign-in"
                    className="px-4 py-2 text-sm font-medium text-foreground transition-colors hover:text-foreground/80"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="rounded-2xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md"
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
