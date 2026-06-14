import { getProfileByUsername } from '../api'

// Focused mock for the profiles-table chain: from().select().eq().maybeSingle()
jest.mock('@/lib/supabase/client', () => {
  const maybeSingle = jest.fn()
  const eq = jest.fn(() => ({ maybeSingle }))
  const select = jest.fn(() => ({ eq }))
  const from = jest.fn(() => ({ select }))
  const auth = { getSession: jest.fn() }
  return { createClient: () => ({ auth, from }) }
})

import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const auth = supabase.auth as unknown as { getSession: jest.Mock }
// every .eq().maybeSingle() resolves to the same shared mock
const maybeSingle = (
  supabase.from('profiles').select('x').eq('u', 'y') as unknown as {
    maybeSingle: jest.Mock
  }
).maybeSingle

const authedSession = {
  data: { session: { access_token: 'mock-token', user: { id: 'me' } } },
}

describe('getProfileByUsername', () => {
  beforeEach(() => jest.clearAllMocks())

  it('maps a profile row to the public profile shape', async () => {
    auth.getSession.mockResolvedValue(authedSession)
    maybeSingle.mockResolvedValue({
      data: {
        id: 'u1',
        username: 'wanderer',
        display_name: 'Maya',
        bio: 'On the road',
        avatar_url: 'https://example.com/a.png',
      },
      error: null,
    })

    const result = await getProfileByUsername('wanderer')

    expect(result).toEqual({
      id: 'u1',
      name: 'Maya',
      username: 'wanderer',
      bio: 'On the road',
      avatar: 'https://example.com/a.png',
    })
  })

  it('queries the profiles table by username', async () => {
    auth.getSession.mockResolvedValue(authedSession)
    maybeSingle.mockResolvedValue({ data: { id: 'u1', username: 'w' }, error: null })
    await getProfileByUsername('wanderer')
    expect(supabase.from).toHaveBeenCalledWith('profiles')
  })

  it('throws "Profile not found" when no row matches', async () => {
    auth.getSession.mockResolvedValue(authedSession)
    maybeSingle.mockResolvedValue({ data: null, error: null })
    await expect(getProfileByUsername('ghost')).rejects.toThrow('Profile not found')
  })

  it('throws on auth error', async () => {
    auth.getSession.mockResolvedValue({ data: { session: null } })
    await expect(getProfileByUsername('anyone')).rejects.toThrow('User not authenticated')
  })

  it('wraps a Supabase error', async () => {
    auth.getSession.mockResolvedValue(authedSession)
    maybeSingle.mockResolvedValue({ data: null, error: { message: 'RLS denied' } })
    await expect(getProfileByUsername('x')).rejects.toThrow('Failed to fetch profile')
  })

  it('falls back to username when display_name is absent', async () => {
    auth.getSession.mockResolvedValue(authedSession)
    maybeSingle.mockResolvedValue({ data: { id: 'u2', username: 'nomad' }, error: null })
    const result = await getProfileByUsername('nomad')
    expect(result.name).toBe('nomad')
  })
})
