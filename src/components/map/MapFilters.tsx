'use client'

import { useState, useEffect, useMemo, memo } from 'react'
import { Search, Calendar, MapPin, X } from 'lucide-react'
import type { DateFilter, DistanceFilter } from '@/hooks/useTripFilters'

interface MapFiltersProps {
  dateFilter: DateFilter
  distanceFilter: DistanceFilter
  searchKeyword: string
  resultCount: number
  hasUserLocation: boolean
  onDateFilterChange: (filter: DateFilter) => void
  onDistanceFilterChange: (filter: DistanceFilter) => void
  onSearchKeywordChange: (keyword: string) => void
  onClearAllFilters: () => void
}

// Debounce hook for search input
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export const MapFilters = memo(function MapFilters({
  dateFilter,
  distanceFilter,
  searchKeyword,
  resultCount,
  hasUserLocation,
  onDateFilterChange,
  onDistanceFilterChange,
  onSearchKeywordChange,
  onClearAllFilters,
}: MapFiltersProps) {
  const [searchInput, setSearchInput] = useState(searchKeyword)
  const debouncedSearch = useDebounce(searchInput, 300)

  // Update search keyword when debounced value changes
  useEffect(() => {
    onSearchKeywordChange(debouncedSearch)
  }, [debouncedSearch, onSearchKeywordChange])

  // Sync internal search state with external prop
  useEffect(() => {
    if (searchKeyword !== searchInput) {
      setSearchInput(searchKeyword)
    }
  }, [searchKeyword, searchInput])

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return dateFilter !== 'all' || distanceFilter !== null || searchKeyword.trim() !== ''
  }, [dateFilter, distanceFilter, searchKeyword])

  const dateFilterOptions: { value: DateFilter; label: string }[] = [
    { value: 'all', label: 'All Trips' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'current', label: 'Current' },
    { value: 'past', label: 'Past' },
  ]

  const distanceFilterOptions: { value: DistanceFilter; label: string }[] = [
    { value: null, label: 'Any Distance' },
    { value: 5, label: 'Within 5 mi' },
    { value: 10, label: 'Within 10 mi' },
    { value: 25, label: 'Within 25 mi' },
    { value: 50, label: 'Within 50 mi' },
  ]

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white/95 p-4 shadow-lg backdrop-blur-sm">
      {/* Search */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Search className="h-4 w-4" />
          Search Trips
        </label>
        <div className="relative">
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search by title or description..."
            className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-4 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Date Filter */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Calendar className="h-4 w-4" />
          When
        </label>
        <div className="grid grid-cols-2 gap-2">
          {dateFilterOptions.map(option => (
            <button
              key={option.value}
              onClick={() => onDateFilterChange(option.value)}
              className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                dateFilter === option.value
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Distance Filter */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <MapPin className="h-4 w-4" />
          Distance
          {!hasUserLocation && (
            <span className="text-xs text-gray-500">(enable location first)</span>
          )}
        </label>
        <div className="grid grid-cols-1 gap-2">
          {distanceFilterOptions.map(option => (
            <button
              key={option.value || 'null'}
              onClick={() => onDistanceFilterChange(option.value)}
              disabled={!hasUserLocation && option.value !== null}
              className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                distanceFilter === option.value
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results and Clear */}
      <div className="flex items-center justify-between border-t border-gray-200 pt-2">
        <div className="text-sm text-gray-600">
          {resultCount} {resultCount === 1 ? 'trip' : 'trips'} found
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearAllFilters}
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  )
})
