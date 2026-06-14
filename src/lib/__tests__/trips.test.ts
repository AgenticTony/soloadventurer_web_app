import { tripMatchesSearch } from '@/lib/trips'
import type { Trip } from '@/lib/api'

const baseTrip: Trip = {
  id: 't1',
  title: 'Tokyo Adventure',
  description: 'Cherry blossoms and ramen',
  location: 'Tokyo, Japan',
  startDate: '2026-04-01T00:00:00Z',
  endDate: '2026-04-10T00:00:00Z',
  status: 'PLANNING',
  isPrivate: false,
  ownerId: 'u1',
  owner: '',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
}

describe('tripMatchesSearch', () => {
  it('matches every trip when the query is empty (identity filter)', () => {
    expect(tripMatchesSearch(baseTrip, '')).toBe(true)
  })

  it('treats a whitespace-only query as empty', () => {
    expect(tripMatchesSearch(baseTrip, '   ')).toBe(true)
  })

  it('matches by title, case-insensitively', () => {
    expect(tripMatchesSearch(baseTrip, 'tokyo')).toBe(true)
    expect(tripMatchesSearch(baseTrip, 'ADVENTURE')).toBe(true)
  })

  it('matches by location/destination', () => {
    expect(tripMatchesSearch(baseTrip, 'japan')).toBe(true)
  })

  it('matches by description', () => {
    expect(tripMatchesSearch(baseTrip, 'ramen')).toBe(true)
  })

  it('matches partial substrings', () => {
    expect(tripMatchesSearch(baseTrip, 'cherr')).toBe(true)
  })

  it('returns false when the query matches no field', () => {
    expect(tripMatchesSearch(baseTrip, 'paris')).toBe(false)
  })

  it('is case-insensitive and trims surrounding whitespace', () => {
    expect(tripMatchesSearch(baseTrip, '  TOKYO  ')).toBe(true)
  })
})
