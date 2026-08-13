/**
 * Story 0.2 (web) — PII projection audit fix.
 * Guards that other-user / search reads never pull email/phone/date_of_birth
 * over the wire, and never surface another user's email.
 *
 * Story W.4: migrated to the schema-aware double. The previous mock's
 * `from: () => ({ select, update })` ignored the table name entirely, so these
 * tests proved the projection was non-PII without ever proving it was read from
 * `profiles`. The double now validates the table and records it, so a query
 * repointed at the wrong table fails here instead of in production.
 */

import { createSupabaseMock } from '@/test-utils/supabase-mock'

const supabase = createSupabaseMock()

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => supabase.client,
}))

import { userService } from '../userService'

const PII = ['email', 'phone', 'date_of_birth']

/** Column string the service passed to the select under test. */
function selectedColumns(): string {
  const withSelect = supabase.queriesFor('profiles').find(q => q.selected !== undefined)
  if (!withSelect?.selected) {
    throw new Error('No select() against profiles was recorded')
  }
  return withSelect.selected
}

beforeEach(() => {
  jest.clearAllMocks()
  supabase.reset()
  supabase.client.auth.getSession.mockResolvedValue({
    data: { session: { user: { id: 'me' } } },
  })
  supabase.client.auth.getUser.mockResolvedValue({
    data: { user: { id: 'me', email: 'me@x.io' } },
  })
})

describe('userService — non-PII projection (Story 0.2)', () => {
  it('searchUsers selects an explicit non-PII projection (never *)', async () => {
    supabase.mockTable('profiles', { data: [], error: null })

    await userService.searchUsers('maya', { limit: 5 })

    const cols = selectedColumns()
    expect(cols).not.toBe('*')
    for (const field of PII) expect(cols).not.toContain(field)
    expect(cols).toContain('username')
    expect(cols).toContain('avatar_url')
  })

  it('searchUsers reads from profiles and nothing else', async () => {
    supabase.mockTable('profiles', { data: [], error: null })

    await userService.searchUsers('maya', { limit: 5 })

    // The old mock could not see this: it answered for any table name.
    expect(supabase.tablesTouched()).toEqual(['profiles'])
  })

  it('getUserProfile returns empty email for another user', async () => {
    supabase.mockTable('profiles', {
      data: { id: 'other', username: 'wanderer' },
      error: null,
    })

    const profile = await userService.getUserProfile('other')

    expect(profile.email).toBe('')
    const cols = selectedColumns()
    for (const field of PII) expect(cols).not.toContain(field)
  })

  it('getUserProfile returns own email (from the session) for self', async () => {
    supabase.mockTable('profiles', { data: { id: 'me', username: 'me' }, error: null })

    const profile = await userService.getUserProfile('me')

    expect(profile.email).toBe('me@x.io')
  })

  it('updateUserProfile returns own email from the session and never selects PII', async () => {
    supabase.mockTable('profiles', {
      data: { id: 'me', username: 'me', display_name: 'Me' },
      error: null,
    })

    const profile = await userService.updateUserProfile({ name: 'Me' })

    expect(profile.email).toBe('me@x.io')
    const cols = selectedColumns()
    expect(cols).not.toBe('*')
    for (const field of PII) expect(cols).not.toContain(field)
  })

  it('updateUserProfile writes only known profile columns', async () => {
    supabase.mockTable('profiles', {
      data: { id: 'me', username: 'me', display_name: 'Me' },
      error: null,
    })

    await userService.updateUserProfile({ name: 'Me', bio: 'hi' })

    const update = supabase.queriesFor('profiles').find(q => q.operations.includes('update'))
    const payload = update?.payload as Record<string, unknown>

    expect(Object.keys(payload)).toEqual(
      expect.arrayContaining(['display_name', 'full_name', 'bio', 'updated_at'])
    )
    for (const field of PII) expect(payload).not.toHaveProperty(field)
  })
})
