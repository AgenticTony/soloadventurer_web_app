import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'

// Isolate TripList's search behaviour from its data source + card rendering.
jest.mock('@/hooks/useTrips', () => ({
  useTrips: () => ({
    trips: [
      {
        id: 't1',
        title: 'Tokyo Adventure',
        description: 'ramen',
        location: 'Tokyo',
        startDate: '2026-04-01T00:00:00Z',
        endDate: '2026-04-10T00:00:00Z',
        status: 'PLANNING',
        isPrivate: false,
        ownerId: 'u',
        owner: '',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
      {
        id: 't2',
        title: 'Paris Getaway',
        description: 'croissant',
        location: 'Paris',
        startDate: '2026-05-01T00:00:00Z',
        endDate: '2026-05-10T00:00:00Z',
        status: 'PLANNING',
        isPrivate: false,
        ownerId: 'u',
        owner: '',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
    ],
    loading: false,
    error: null,
    hasMore: false,
    loadMore: jest.fn(),
    refresh: jest.fn(),
  }),
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

// Render just the title so assertions can see which trips survived the filter.
jest.mock('@/components/features/trips/TripCard', () => ({
  TripCard: ({ trip }: { trip: { title: string } }) => <div>{trip.title}</div>,
  TripCardSkeleton: () => <div>skeleton</div>,
}))

import { TripList } from '@/components/features/trips/TripList'

describe('TripList search', () => {
  it('renders all trips when no search is active', () => {
    render(<TripList />)
    expect(screen.getByText('Tokyo Adventure')).toBeInTheDocument()
    expect(screen.getByText('Paris Getaway')).toBeInTheDocument()
  })

  it('filters the list as the user types', () => {
    render(<TripList />)
    fireEvent.change(screen.getByLabelText('Search trips'), {
      target: { value: 'tokyo' },
    })
    expect(screen.getByText('Tokyo Adventure')).toBeInTheDocument()
    expect(screen.queryByText('Paris Getaway')).not.toBeInTheDocument()
  })

  it('shows a no-matches state, then clears back to all trips', () => {
    render(<TripList />)
    fireEvent.change(screen.getByLabelText('Search trips'), {
      target: { value: 'nowhere' },
    })
    expect(screen.getByText(/No matching trips/)).toBeInTheDocument()
    expect(screen.queryByText('Tokyo Adventure')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Clear Search' }))
    expect(screen.getByText('Tokyo Adventure')).toBeInTheDocument()
    expect(screen.getByText('Paris Getaway')).toBeInTheDocument()
  })
})
