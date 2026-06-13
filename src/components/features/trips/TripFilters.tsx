'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, CheckCircle, Filter, SortAsc, SortDesc } from 'lucide-react'
import type { TripsFilter } from '@/hooks/useTrips'

interface TripFiltersProps {
  filter: TripsFilter
  onFilterChange: (filter: TripsFilter) => void
  tripCounts?: {
    all: number
    upcoming: number
    ongoing: number
    completed: number
  }
  className?: string
}

export function TripFilters({
  filter,
  onFilterChange,
  tripCounts,
  className = '',
}: TripFiltersProps) {
  const handleSortChange = (sortBy: TripsFilter['sortBy']) => {
    onFilterChange({ ...filter, sortBy })
  }

  const handleStatusChange = (status: TripsFilter['status']) => {
    onFilterChange({ ...filter, status })
  }

  const statusOptions = [
    {
      key: 'all',
      label: 'All Trips',
      icon: <Filter className="h-4 w-4" />,
      count: tripCounts?.all,
    },
    {
      key: 'upcoming',
      label: 'Upcoming',
      icon: <Calendar className="h-4 w-4" />,
      count: tripCounts?.upcoming,
    },
    {
      key: 'ongoing',
      label: 'Ongoing',
      icon: <Clock className="h-4 w-4" />,
      count: tripCounts?.ongoing,
    },
    {
      key: 'completed',
      label: 'Completed',
      icon: <CheckCircle className="h-4 w-4" />,
      count: tripCounts?.completed,
    },
  ] as const

  const sortOptions = [
    {
      key: 'newest',
      label: 'Newest First',
      icon: <SortDesc className="h-4 w-4" />,
    },
    {
      key: 'oldest',
      label: 'Oldest First',
      icon: <SortAsc className="h-4 w-4" />,
    },
    {
      key: 'upcoming',
      label: 'By Start Date',
      icon: <Calendar className="h-4 w-4" />,
    },
  ] as const

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Status Filter */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-foreground">Filter by Status</h3>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map(option => (
            <Button
              key={option.key}
              variant={filter.status === option.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleStatusChange(option.key)}
              className="flex items-center gap-2"
            >
              {option.icon}
              <span>{option.label}</span>
              {option.count !== undefined && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {option.count}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Sort Options */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-foreground">Sort By</h3>
        <div className="flex flex-wrap gap-2">
          {sortOptions.map(option => (
            <Button
              key={option.key}
              variant={filter.sortBy === option.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSortChange(option.key)}
              className="flex items-center gap-2"
            >
              {option.icon}
              <span>{option.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Active Filters Summary */}
      {(filter.status !== 'all' || filter.sortBy !== 'newest') && (
        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span>Active filters:</span>
              <div className="flex gap-1">
                {filter.status !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    {statusOptions.find(opt => opt.key === filter.status)?.label}
                  </Badge>
                )}
                {filter.sortBy !== 'newest' && (
                  <Badge variant="secondary" className="text-xs">
                    {sortOptions.find(opt => opt.key === filter.sortBy)?.label}
                  </Badge>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFilterChange({ status: 'all', sortBy: 'newest' })}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear all
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
