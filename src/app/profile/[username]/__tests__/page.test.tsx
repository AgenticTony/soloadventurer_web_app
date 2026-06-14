import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

const getProfileByUsername = jest.fn()
const requestConnection = jest.fn()

// Keep the real TripsApiError (component uses `instanceof`); only mock the data fn.
jest.mock('@/lib/api', () => ({
  ...jest.requireActual('@/lib/api'),
  getProfileByUsername: (...args: unknown[]) => getProfileByUsername(...args),
}))
jest.mock('@/lib/api/matching', () => ({
  requestConnection: (...args: unknown[]) => requestConnection(...args),
}))
jest.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: null }) }))
jest.mock('next/navigation', () => {
  // Real useRouter returns a STABLE instance — returning a new object each call
  // would thrash any effect that lists `router` in its deps.
  const router = { push: jest.fn(), replace: jest.fn() }
  return { useRouter: () => router }
})
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn() },
}))

jest.mock('framer-motion', () => {
  const R = jest.requireActual('react')
  type MotionProps = { children?: React.ReactNode; [key: string]: unknown }
  const div = ({ children }: MotionProps) => R.createElement('div', null, children)
  return {
    motion: new Proxy({}, { get: () => div }),
    AnimatePresence: ({ children }: MotionProps) => R.createElement(R.Fragment, null, children),
  }
})

jest.mock('@/components/layout/ProfileLayout', () => ({
  ProfileLayout: ({ children }: { children: React.ReactNode }) => children,
}))
jest.mock('@/components/features/profile/ProfileHeader', () => ({
  ProfileHeader: ({
    user,
    onConnect,
    onMessage,
  }: {
    user?: { name?: string }
    onConnect?: () => void
    onMessage?: () => void
  }) => (
    <div>
      <span data-testid="profile-name">{user?.name}</span>
      <button onClick={onConnect}>Connect</button>
      <button onClick={onMessage}>Message</button>
    </div>
  ),
}))
jest.mock('@/components/features/profile/TravelStatus', () => ({ TravelStatus: () => null }))
jest.mock('@/components/features/profile/ProfileStatsBar', () => ({ ProfileStatsBar: () => null }))
jest.mock('@/components/features/profile/ProfileDetailsCard', () => ({
  ProfileDetailsCard: () => null,
}))
jest.mock('@/components/features/profile/WorldMap', () => ({ WorldMap: () => null }))
jest.mock('@/components/features/profile/ProfileTabContent', () => ({
  ProfileTabContent: () => null,
}))
jest.mock('@/components/features/profile/ProfileTabs', () => ({
  ProfileTabs: () => null,
  useProfileTabs: () => ({ activeTab: 'overview', setActiveTab: jest.fn() }),
}))

import { OtherUserProfile } from '../OtherUserProfile'
import toast from 'react-hot-toast'
import { TripsApiError } from '@/lib/api'

describe('OtherUserProfile', () => {
  beforeEach(() => {
    getProfileByUsername.mockReset()
    requestConnection.mockReset()
    ;(toast.success as jest.Mock).mockClear()
    ;(toast.error as jest.Mock).mockClear()
  })

  it('fetches the profile by username and renders the display name', async () => {
    getProfileByUsername.mockResolvedValue({ id: 'u1', name: 'Maya', username: 'wanderer' })
    render(<OtherUserProfile username="wanderer" />)
    await waitFor(() => expect(getProfileByUsername).toHaveBeenCalledWith('wanderer'))
    expect(await screen.findByTestId('profile-name')).toHaveTextContent('Maya')
  })

  it('sends a connection request when Connect is clicked', async () => {
    getProfileByUsername.mockResolvedValue({ id: 'u1', name: 'Maya', username: 'wanderer' })
    requestConnection.mockResolvedValue({ id: 'conn-1' })
    render(<OtherUserProfile username="wanderer" />)
    await screen.findByTestId('profile-name')
    fireEvent.click(screen.getByText('Connect'))
    await waitFor(() => expect(requestConnection).toHaveBeenCalledWith('u1'))
    expect(toast.success).toHaveBeenCalled()
  })

  it('renders a not-found state when the username does not exist', async () => {
    getProfileByUsername.mockRejectedValue(new TripsApiError('Profile not found'))
    render(<OtherUserProfile username="ghost" />)
    expect(await screen.findByText('Profile not found')).toBeInTheDocument()
  })
})
