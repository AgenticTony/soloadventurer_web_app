'use client';

import { useState, memo } from 'react';
import { Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { MapFilters } from './MapFilters';
import type { DateFilter, DistanceFilter } from '@/hooks/useTripFilters';

interface FilterPanelProps {
  dateFilter: DateFilter;
  distanceFilter: DistanceFilter;
  searchKeyword: string;
  resultCount: number;
  hasUserLocation: boolean;
  onDateFilterChange: (filter: DateFilter) => void;
  onDistanceFilterChange: (filter: DistanceFilter) => void;
  onSearchKeywordChange: (keyword: string) => void;
  onClearAllFilters: () => void;
}

export const FilterPanel = memo(function FilterPanel({
  dateFilter,
  distanceFilter,
  searchKeyword,
  resultCount,
  hasUserLocation,
  onDateFilterChange,
  onDistanceFilterChange,
  onSearchKeywordChange,
  onClearAllFilters,
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Check if any filters are active for badge display
  const hasActiveFilters =
    dateFilter !== 'all' ||
    distanceFilter !== null ||
    searchKeyword.trim() !== '';

  const activeFilterCount = [
    dateFilter !== 'all',
    distanceFilter !== null,
    searchKeyword.trim() !== '',
  ].filter(Boolean).length;

  return (
    <div className="absolute top-4 left-4 z-10 w-80 max-w-[calc(100vw-2rem)]">
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg px-4 py-3 hover:bg-white/100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Filter className="h-5 w-5 text-gray-700" />
          <div className="text-left">
            <div className="font-medium text-gray-900">Filters</div>
            <div className="text-sm text-gray-600">
              {hasActiveFilters ? (
                <span>
                  {activeFilterCount} active • {resultCount} {resultCount === 1 ? 'trip' : 'trips'}
                </span>
              ) : (
                <span>{resultCount} {resultCount === 1 ? 'trip' : 'trips'}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <div className="bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-full">
              {activeFilterCount}
            </div>
          )}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </div>
      </button>

      {/* Expanded Filter Panel */}
      {isExpanded && (
        <div className="mt-2">
          <MapFilters
            dateFilter={dateFilter}
            distanceFilter={distanceFilter}
            searchKeyword={searchKeyword}
            resultCount={resultCount}
            hasUserLocation={hasUserLocation}
            onDateFilterChange={onDateFilterChange}
            onDistanceFilterChange={onDistanceFilterChange}
            onSearchKeywordChange={onSearchKeywordChange}
            onClearAllFilters={onClearAllFilters}
          />
        </div>
      )}

      {/* Mobile: Overlay to close panel when clicking outside */}
      {isExpanded && (
        <div
          className="fixed inset-0 -z-10 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
});