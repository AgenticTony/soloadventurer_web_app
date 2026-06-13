'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, MapPin, Users, Calendar, Hash, Star } from 'lucide-react'

interface SearchResult {
  id: string
  type: 'user' | 'city' | 'trip' | 'post' | 'activity'
  title: string
  subtitle?: string
  description?: string
  image?: string
  url: string
  metadata?: {
    location?: string
    date?: string
    tags?: string[]
    followers?: number
    rating?: number
  }
}

interface SearchOmniProps {
  placeholder?: string
  onSearch?: (query: string) => Promise<SearchResult[]>
  onSelect?: (result: SearchResult) => void
  className?: string
  shortcut?: string[]
}

export function SearchOmni({
  placeholder = 'Search anything...',
  onSearch,
  onSelect,
  className = '',
  shortcut = ['⌘', 'K'],
}: SearchOmniProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const handleClose = () => {
    setIsOpen(false)
    setQuery('')
    setResults([])
    setSelectedIndex(0)
  }

  const handleSelectResult = useCallback(
    (result: SearchResult) => {
      onSelect?.(result)
      router.push(result.url)
      handleClose()
    },
    [onSelect, router]
  )

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open search with Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
        inputRef.current?.focus()
        return
      }

      // Close with Escape
      if (e.key === 'Escape' && isOpen) {
        handleClose()
        return
      }

      // Navigate results with arrow keys
      if (isOpen && results.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          setSelectedIndex(prev => (prev + 1) % results.length)
          return
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault()
          setSelectedIndex(prev => (prev - 1 + results.length) % results.length)
          return
        }
        if (e.key === 'Enter') {
          e.preventDefault()
          handleSelectResult(results[selectedIndex])
          return
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, selectedIndex, handleSelectResult])

  // Search for results when query changes
  useEffect(() => {
    const performSearch = async () => {
      if (!query.trim()) {
        setResults([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const searchResults = (await onSearch?.(query)) || []
        setResults(searchResults)
        setSelectedIndex(0)
      } catch (error) {
        console.error('Search failed:', error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    const debounceTimer = setTimeout(performSearch, 300)
    return () => clearTimeout(debounceTimer)
  }, [query, onSearch])

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        !inputRef.current?.contains(e.target as Node) &&
        !resultsRef.current?.contains(e.target as Node)
      ) {
        handleClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handleOpen = () => {
    setIsOpen(true)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'user':
        return <Users className="h-4 w-4 text-sky-500" />
      case 'city':
        return <MapPin className="h-4 w-4 text-brand-500" />
      case 'trip':
        return <Calendar className="h-4 w-4 text-sun-500" />
      case 'post':
        return <Hash className="h-4 w-4 text-coral-500" />
      case 'activity':
        return <Star className="h-4 w-4 text-emerald-500" />
      default:
        return <Search className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'user':
        return 'Traveler'
      case 'city':
        return 'City'
      case 'trip':
        return 'Trip'
      case 'post':
        return 'Post'
      case 'activity':
        return 'Activity'
      default:
        return 'Result'
    }
  }

  const defaultResults: SearchResult[] = [
    {
      id: 'recent-1',
      type: 'user',
      title: 'Sarah Chen',
      subtitle: '@sarahchen',
      description: 'Adventure seeker and solo traveler',
      url: '/profile/sarahchen',
      metadata: { location: 'San Francisco, CA', followers: 89 },
    },
    {
      id: 'recent-2',
      type: 'city',
      title: 'Tokyo',
      subtitle: 'Japan',
      description: 'Vibrant metropolis blending tradition and modernity',
      url: '/cities/tokyo',
      metadata: { rating: 4.8 },
    },
    {
      id: 'recent-3',
      type: 'trip',
      title: 'Costa Rica Adventure',
      subtitle: 'Apr 1-15, 2024',
      description: 'Exploring rainforests, beaches, and volcanoes',
      url: '/trips/costa-rica-adventure',
      metadata: { date: 'Upcoming' },
    },
  ]

  const displayResults = query.trim() ? results : defaultResults

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <button
          onClick={handleOpen}
          className="flex w-full items-center space-x-3 rounded-xl border border-border bg-muted px-4 py-2 text-left transition-colors hover:bg-muted/80"
        >
          <Search className="h-4 w-4 text-muted-foreground" />
          <span className="flex-1 text-muted-foreground">{placeholder}</span>
          <div className="flex items-center space-x-1">
            {shortcut.map((key, index) => (
              <kbd
                key={index}
                className="rounded border border-border bg-background px-1.5 py-0.5 text-xs font-medium text-muted-foreground"
              >
                {key}
              </kbd>
            ))}
          </div>
        </button>
      </div>

      {/* Search Modal/Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

          {/* Search Container */}
          <div className="relative mx-4 w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
            {/* Search Bar */}
            <div className="flex items-center space-x-3 border-b border-border p-4">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={placeholder}
                className="flex-1 border-none bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
                autoFocus
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="rounded-lg p-1 transition-colors hover:bg-muted"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
              <div className="flex items-center space-x-1">
                <kbd className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
                  ESC
                </kbd>
              </div>
            </div>

            {/* Results */}
            <div ref={resultsRef} className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                  <p className="text-muted-foreground">Searching...</p>
                </div>
              ) : displayResults.length > 0 ? (
                <div className="divide-y divide-border">
                  {displayResults.map((result, index) => (
                    <button
                      key={result.id}
                      onClick={() => handleSelectResult(result)}
                      className={`w-full p-4 text-left transition-colors hover:bg-muted ${
                        index === selectedIndex ? 'bg-muted' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="mt-1 flex-shrink-0">{getResultIcon(result.type)}</div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center justify-between">
                            <h3 className="truncate font-semibold text-foreground">
                              {result.title}
                            </h3>
                            <span className="rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
                              {getTypeLabel(result.type)}
                            </span>
                          </div>

                          {result.subtitle && (
                            <p className="mb-1 text-sm text-muted-foreground">{result.subtitle}</p>
                          )}

                          {result.description && (
                            <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">
                              {result.description}
                            </p>
                          )}

                          {result.metadata && (
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              {result.metadata.location && (
                                <div className="flex items-center space-x-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>{result.metadata.location}</span>
                                </div>
                              )}
                              {result.metadata.date && (
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{result.metadata.date}</span>
                                </div>
                              )}
                              {result.metadata.followers !== undefined && (
                                <div className="flex items-center space-x-1">
                                  <Users className="h-3 w-3" />
                                  <span>{result.metadata.followers} followers</span>
                                </div>
                              )}
                              {result.metadata.rating && (
                                <div className="flex items-center space-x-1">
                                  <Star className="h-3 w-3" />
                                  <span>{result.metadata.rating}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : query.trim() ? (
                <div className="p-8 text-center">
                  <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold text-foreground">No results found</h3>
                  <p className="text-muted-foreground">Try searching for something else</p>
                </div>
              ) : (
                <div className="p-8">
                  <h3 className="mb-4 text-lg font-semibold text-foreground">Quick Access</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <kbd className="rounded bg-muted px-2 py-1">↑</kbd>
                      <span>Navigate up</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <kbd className="rounded bg-muted px-2 py-1">↓</kbd>
                      <span>Navigate down</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <kbd className="rounded bg-muted px-2 py-1">↵</kbd>
                      <span>Select result</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <kbd className="rounded bg-muted px-2 py-1">ESC</kbd>
                      <span>Close search</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-border bg-muted p-3">
              <p className="text-center text-xs text-muted-foreground">
                Search across travelers, cities, trips, posts, and activities
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Default search implementation
SearchOmni.defaultProps = {
  onSearch: async (query: string): Promise<SearchResult[]> => {
    // Mock search implementation
    // In a real app, this would call your search API
    const mockResults: SearchResult[] = [
      {
        id: '1',
        type: 'user',
        title: 'Sarah Chen',
        subtitle: '@sarahchen',
        description: 'Adventure seeker and solo traveler',
        url: '/profile/sarahchen',
        metadata: { location: 'San Francisco, CA', followers: 89 },
      },
      {
        id: '2',
        type: 'city',
        title: 'Tokyo',
        subtitle: 'Japan',
        description: 'Vibrant metropolis blending tradition and modernity',
        url: '/cities/tokyo',
        metadata: { rating: 4.8 },
      },
    ]

    return mockResults.filter(
      result =>
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.description?.toLowerCase().includes(query.toLowerCase())
    )
  },
}
