/**
 * Story W.4: migrated to the schema-aware double.
 *
 * The previous mock built a fixed `from().select().eq().maybeSingle()` chain
 * that answered for any table name, and shared one `maybeSingle` across every
 * call. It also had to reach through `from('profiles').select('id').eq('id','y')`
 * at module scope just to get a handle on the resolver — a query made purely to
 * extract a mock, which the strict double replaces with `mockTable`.
 */

import { getProfileByUsername } from '../api'
import { createSupabaseMock } from '@/test-utils/supabase-mock'

const supabase = createSupabaseMock()

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => supabase.client,
}))

const authedSession = {
  data: { session: { access_token: 'mock-token', user: { id: 'me' } } },
}

describe('getProfileByUsername', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    supabase.reset()
  })

  it('maps a profile row to the public profile shape', async () => {
    supabase.client.auth.getSession.mockResolvedValue(authedSession)
    supabase.mockTable('profiles', {
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
    supabase.client.auth.getSession.mockResolvedValue(authedSession)
    supabase.mockTable('profiles', { data: { id: 'u1', username: 'w' }, error: null })

    await getProfileByUsername('wanderer')

    expect(supabase.tablesTouched()).toEqual(['profiles'])
    expect(supabase.queriesFor('profiles')[0].operations).toContain('maybeSingle')
  })

  it('throws "Profile not found" when no row matches', async () => {
    supabase.client.auth.getSession.mockResolvedValue(authedSession)
    supabase.mockTable('profiles', { data: null, error: null })

    await expect(getProfileByUsername('ghost')).rejects.toThrow('Profile not found')
  })

  it('throws on auth error', async () => {
    supabase.client.auth.getSession.mockResolvedValue({ data: { session: null } })

    await expect(getProfileByUsername('anyone')).rejects.toThrow('User not authenticated')
  })

  it('wraps a Supabase error', async () => {
    supabase.client.auth.getSession.mockResolvedValue(authedSession)
    supabase.mockTable('profiles', { data: null, error: { message: 'RLS denied' } })

    await expect(getProfileByUsername('x')).rejects.toThrow('Failed to fetch profile')
  })

  it('falls back to username when display_name is absent', async () => {
    supabase.client.auth.getSession.mockResolvedValue(authedSession)
    supabase.mockTable('profiles', { data: { id: 'u2', username: 'nomad' }, error: null })

    const result = await getProfileByUsername('nomad')

    expect(result.name).toBe('nomad')
  })
})
