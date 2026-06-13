'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, MapPin, Filter, X, Clock, Trash2 } from 'lucide-react'
import { useGeolocation } from '@/hooks/useGeolocation'
import type { UserGeolocationPosition } from '@/hooks/useGeolocation'

export interface UserSearchProps {
  query: string
  location: UserGeolocationPosition | null
  radiusKm: number
  interests: string[]
  searchHistory: string[]
  onQueryChange: (query: string) => void
  onLocationChange: (location: UserGeolocationPosition | null) => void
  onRadiusChange: (radius: number) => void
  onInterestsChange: (interests: string[]) => void
  onClearHistory: () => void
  className?: string
}

const AVAILABLE_INTERESTS = [
  'hiking',
  'photography',
  'travel',
  'food',
  'adventure',
  'culture',
  'nature',
  'history',
  'art',
  'music',
  'sports',
  'beach',
  'mountains',
  'cities',
  'wildlife',
  'backpacking',
  'luxury',
  'budget',
  'solo',
  'family',
]

const RADIUS_OPTIONS = [
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 25, label: '25 km' },
  { value: 50, label: '50 km' },
  { value: 100, label: '100 km' },
  { value: 0, label: 'Anywhere' },
]

export function UserSearch({
  query,
  location,
  radiusKm,
  interests,
  searchHistory,
  onQueryChange,
  onLocationChange,
  onRadiusChange,
  onInterestsChange,
  onClearHistory,
  className = '',
}: UserSearchProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [interestsInput, setInterestsInput] = useState('')

  const searchInputRef = useRef<HTMLInputElement>(null)
  const historyRef = useRef<HTMLDivElement>(null)

  const {
    position,
    loading: locationLoading,
    error: locationError,
    requestPosition,
  } = useGeolocation()

  // Update location from geolocation
  useEffect(() => {
    if (position && !location) {
      onLocationChange(position)
    }
  }, [position, location, onLocationChange])

  // Handle clicks outside history dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        historyRef.current &&
        !historyRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowHistory(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLocationToggle = () => {
    if (location) {
      onLocationChange(null)
    } else if (position) {
      onLocationChange(position)
    } else {
      requestPosition()
    }
  }

  const handleAddInterest = (interest: string) => {
    if (interest && !interests.includes(interest)) {
      onInterestsChange([...interests, interest])
    }
    setInterestsInput('')
  }

  const handleRemoveInterest = (interestToRemove: string) => {
    onInterestsChange(interests.filter(i => i !== interestToRemove))
  }

  const handleHistorySelect = (historyQuery: string) => {
    onQueryChange(historyQuery)
    setShowHistory(false)
    searchInputRef.current?.focus()
  }

  const filteredSuggestedInterests = AVAILABLE_INTERESTS.filter(
    interest =>
      !interests.includes(interest) && interest.toLowerCase().includes(interestsInput.toLowerCase())
  )

  return (
    <div className={`rounded-lg border border-gray-200 bg-white p-4 ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search by name or bio..."
            value={query}
            onChange={e => onQueryChange(e.target.value)}
            onFocus={() => setShowHistory(true)}
            className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Search History Dropdown */}
        {showHistory && searchHistory.length > 0 && (
          <div
            ref={historyRef}
            className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg"
          >
            <div className="flex items-center justify-between border-b border-gray-100 p-2">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Recent Searches
              </span>
              <button
                onClick={onClearHistory}
                className="p-1 text-gray-400 hover:text-red-500"
                title="Clear history"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
            {searchHistory.map((historyQuery, index) => (
              <button
                key={index}
                onClick={() => handleHistorySelect(historyQuery)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
              >
                <Clock className="h-3 w-3 text-gray-400" />
                {historyQuery}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filter Toggle & Quick Actions */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              showFilters
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>

          <button
            onClick={handleLocationToggle}
            disabled={locationLoading}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              location
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <MapPin className="h-4 w-4" />
            {locationLoading ? 'Finding...' : location ? 'Near Me' : 'Location'}
          </button>
        </div>

        {/* Active Filter Count */}
        {(interests.length > 0 || location) && (
          <div className="text-xs text-gray-500">
            {interests.length + (location ? 1 : 0)} filter
            {interests.length + (location ? 1 : 0) !== 1 ? 's' : ''} active
          </div>
        )}
      </div>

      {/* Location Error */}
      {locationError && (
        <div className="mt-2 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-600">
          {locationError}
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
          {/* Location Radius */}
          {location && (
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">Search Radius</label>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {RADIUS_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    onClick={() => onRadiusChange(option.value)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                      radiusKm === option.value
                        ? 'bg-blue-500 text-white'
                        : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Interests */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Interests</label>

            {/* Selected Interests */}
            {interests.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {interests.map(interest => (
                  <span
                    key={interest}
                    className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700"
                  >
                    {interest}
                    <button
                      onClick={() => handleRemoveInterest(interest)}
                      className="ml-1 text-blue-500 hover:text-blue-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Add Interest Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Add an interest..."
                value={interestsInput}
                onChange={e => setInterestsInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && interestsInput.trim()) {
                    e.preventDefault()
                    handleAddInterest(interestsInput.trim().toLowerCase())
                  }
                }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Interest Suggestions */}
              {interestsInput && filteredSuggestedInterests.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-32 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                  {filteredSuggestedInterests.slice(0, 8).map(interest => (
                    <button
                      key={interest}
                      onClick={() => handleAddInterest(interest)}
                      className="w-full px-3 py-2 text-left text-sm capitalize hover:bg-gray-50"
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Suggested Interests */}
            {!interestsInput && (
              <div className="mt-2 flex flex-wrap gap-1">
                {AVAILABLE_INTERESTS.filter(i => !interests.includes(i))
                  .slice(0, 8)
                  .map(interest => (
                    <button
                      key={interest}
                      onClick={() => handleAddInterest(interest)}
                      className="rounded-full border border-gray-300 bg-white px-2 py-1 text-xs capitalize text-gray-600 hover:bg-gray-50"
                    >
                      + {interest}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
