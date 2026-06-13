'use client'

import { useState, useEffect, useCallback } from 'react'
import { listTrips, type Trip, type ListTripsResponse, TripsApiError } from '@/lib/api'

export interface TripsFilter {
  sortBy: 'newest' | 'oldest' | 'upcoming'
  status: 'all' | 'upcoming' | 'ongoing' | 'completed'
}

export interface UseTripsResult {
  trips: Trip[]
  loading: boolean
  error: string | null
  hasMore: boolean
  loadMore: () => Promise<void>
  refresh: () => Promise<void>
  filter: TripsFilter
  setFilter: (filter: TripsFilter) => void
}

export function useTrips(): UseTripsResult {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nextToken, setNextToken] = useState<string | undefined>()
  const [hasMore, setHasMore] = useState(false)
  const [filter, setFilter] = useState<TripsFilter>({
    sortBy: 'newest',
    status: 'all',
  })

  const loadTrips = useCallback(
    async (isRefresh = false, token?: string) => {
      try {
        if (isRefresh) {
          setLoading(true)
          setError(null)
        }

        const response: ListTripsResponse = await listTrips(undefined, {
          limit: 10,
          nextToken: token,
        })

        const sortedTrips = sortTrips(response.items, filter.sortBy)
        const filteredTrips = filterTrips(sortedTrips, filter.status)

        if (isRefresh || !token) {
          setTrips(filteredTrips)
        } else {
          setTrips(prev => [...prev, ...filteredTrips])
        }

        setNextToken(response.nextToken)
        setHasMore(!!response.nextToken)
      } catch (err) {
        const errorMessage = err instanceof TripsApiError ? err.message : 'Failed to load trips'
        setError(errorMessage)
        console.error('Error loading trips:', err)
      } finally {
        setLoading(false)
      }
    },
    [filter]
  )

  const sortTrips = (trips: Trip[], sortBy: TripsFilter['sortBy']): Trip[] => {
    const sorted = [...trips]

    switch (sortBy) {
      case 'newest':
        return sorted.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      case 'oldest':
        return sorted.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
      case 'upcoming':
        return sorted.sort(
          (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        )
      default:
        return sorted
    }
  }

  const filterTrips = (trips: Trip[], status: TripsFilter['status']): Trip[] => {
    if (status === 'all') return trips

    const now = new Date()
    return trips.filter(trip => {
      const startDate = new Date(trip.startDate)
      const endDate = new Date(trip.endDate)

      switch (status) {
        case 'upcoming':
          return startDate > now
        case 'ongoing':
          return startDate <= now && endDate >= now
        case 'completed':
          return endDate < now
        default:
          return true
      }
    })
  }

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return
    await loadTrips(false, nextToken)
  }, [hasMore, loading, nextToken, loadTrips])

  const refresh = useCallback(async () => {
    setTrips([])
    setNextToken(undefined)
    await loadTrips(true)
  }, [loadTrips])

  // Initial load
  useEffect(() => {
    loadTrips(true)
  }, [loadTrips])

  // Refresh when filter changes
  useEffect(() => {
    refresh()
  }, [filter, refresh])

  return {
    trips,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    filter,
    setFilter,
  }
}
