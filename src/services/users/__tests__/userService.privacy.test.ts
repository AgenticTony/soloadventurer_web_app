/**
 * Story 0.2 (web) — PII projection audit fix.
 * Guards that other-user / search reads never pull email/phone/date_of_birth
 * over the wire, and never surface another user's email.
 */

const selectMock = jest.fn()
const authGetUser = jest.fn()
const authGetSession = jest.fn()

jest.mock('@/lib/supabase/client', () => {
  return {
    createClient: () => ({
      auth: { getUser: authGetUser, getSession: authGetSession },
      from: () => ({ select: selectMock }),
    }),
  }
})

import { userService } from '../userService'

const PII = ['email', 'phone', 'date_of_birth']

beforeEach(() => {
  jest.clearAllMocks()
  authGetSession.mockResolvedValue({ data: { session: { user: { id: 'me' } } } })
  authGetUser.mockResolvedValue({ data: { user: { id: 'me', email: 'me@x.io' } } })
})

describe('userService — non-PII projection (Story 0.2)', () => {
  it('searchUsers selects an explicit non-PII projection (never *)', async () => {
    // .select(cols).or(...).limit(...) → resolves
    const limit = jest.fn().mockResolvedValue({ data: [], error: null })
    const or = jest.fn(() => ({ limit }))
    selectMock.mockReturnValue({ or })

    await userService.searchUsers('maya', { limit: 5 })

    const cols = selectMock.mock.calls[0][0] as string
    expect(cols).not.toBe('*')
    for (const field of PII) expect(cols).not.toContain(field)
    expect(cols).toContain('username')
    expect(cols).toContain('avatar_url')
  })

  it('getUserProfile returns empty email for another user', async () => {
    const single = jest
      .fn()
      .mockResolvedValue({ data: { id: 'other', username: 'wanderer' }, error: null })
    const eq = jest.fn(() => ({ single }))
    selectMock.mockReturnValue({ eq })

    const profile = await userService.getUserProfile('other')

    expect(profile.email).toBe('')
    const cols = selectMock.mock.calls[0][0] as string
    for (const field of PII) expect(cols).not.toContain(field)
  })

  it('getUserProfile returns own email (from the session) for self', async () => {
    const single = jest.fn().mockResolvedValue({ data: { id: 'me', username: 'me' }, error: null })
    const eq = jest.fn(() => ({ single }))
    selectMock.mockReturnValue({ eq })

    const profile = await userService.getUserProfile('me')

    expect(profile.email).toBe('me@x.io')
  })
})
