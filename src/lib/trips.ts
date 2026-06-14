import type { Trip } from '@/lib/api'

/**
 * Client-side trip search predicate. Matches when the (case-insensitive,
 * trimmed) query appears in the trip's title, location, or description.
 * An empty/whitespace query matches every trip — an identity filter — so this
 * composes cleanly on top of the loaded (paginated) set without hiding trips
 * when no search is active.
 */
export function tripMatchesSearch(trip: Trip, query: string): boolean {
  const needle = query.trim().toLowerCase()
  if (!needle) return true

  const haystack = [trip.title, trip.location, trip.description]
    .filter((field): field is string => typeof field === 'string' && field.length > 0)
    .join(' ')
    .toLowerCase()

  return haystack.includes(needle)
}
