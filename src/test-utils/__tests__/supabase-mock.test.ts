/**
 * Tests for the schema-aware Supabase double (Story W.4).
 *
 * The point of this file is regression evidence: each phantom-schema bug that
 * reached production is replayed here, showing the old permissive mock would
 * have passed it and this one does not.
 */

import { createSupabaseMock, insertFor, TABLE_NAMES, type TableName } from '../supabase-mock'

describe('table-name validation', () => {
  it('accepts a real table', () => {
    const supabase = createSupabaseMock()
    expect(() => supabase.client.from('profiles')).not.toThrow()
  })

  it('rejects a table that does not exist, naming it', () => {
    const supabase = createSupabaseMock()

    // `blocked_users` is the exact phantom the blocking feature wrote to for
    // months. The real table is `blocks`. A permissive mock returns a builder
    // here and the test passes.
    expect(() => supabase.client.from('blocked_users' as unknown as TableName)).toThrow(
      /Unknown table "blocked_users"/
    )
  })

  it('rejects an unknown table in mockTable, not just in from()', () => {
    const supabase = createSupabaseMock()
    expect(() =>
      supabase.mockTable('user_verifications' as unknown as TableName, {
        data: [],
        error: null,
      })
    ).toThrow(/Unknown table "user_verifications"/)
  })

  it('covers every table in the generated schema', () => {
    // The compile-time assertion in supabase-mock.ts is the real guard; this
    // just makes the count visible when someone adds a migration.
    expect(TABLE_NAMES).toHaveLength(40)
    expect(new Set(TABLE_NAMES).size).toBe(TABLE_NAMES.length)
  })
})

describe('recording queries', () => {
  it('records the table, operations and payload', async () => {
    const supabase = createSupabaseMock()
    supabase.mockTable('profiles', { data: { id: 'u1' }, error: null })

    await supabase.client.from('profiles').select('id, username').eq().single()

    const [query] = supabase.queriesFor('profiles')
    expect(query.operations).toEqual(['select', 'eq', 'single'])
    expect(query.selected).toBe('id, username')
  })

  it('returns the queued result', async () => {
    const supabase = createSupabaseMock()
    supabase.mockTable('trips', { data: [{ id: 't1' }], error: null })

    const result = await supabase.client.from('trips').select('*')

    expect(result).toEqual({ data: [{ id: 't1' }], error: null })
  })

  it('returns an inert result for a table the test forgot to stub', async () => {
    const supabase = createSupabaseMock()

    const result = await supabase.client.from('meetups').select('*')

    // Deliberately empty rather than plausible: a forgotten stub should fail
    // the test's own assertions, not coast on convincing fixture data.
    expect(result).toEqual({ data: null, error: null })
  })

  it('reports which tables were touched', async () => {
    const supabase = createSupabaseMock()

    await supabase.client.from('profiles').select('id')
    await supabase.client.from('trips').select('id')
    await supabase.client.from('profiles').select('bio')

    expect(supabase.tablesTouched()).toEqual(['profiles', 'trips'])
    expect(supabase.queriesFor('profiles')).toHaveLength(2)
  })

  it('clears state on reset', async () => {
    const supabase = createSupabaseMock()
    supabase.mockTable('profiles', { data: [{ id: 'u1' }], error: null })
    await supabase.client.from('profiles').select('id')

    supabase.reset()

    expect(supabase.queries).toHaveLength(0)
    expect(await supabase.client.from('profiles').select('id')).toEqual({
      data: null,
      error: null,
    })
  })
})

describe('typed payload helpers — the four bugs that shipped', () => {
  it('accepts a correctly shaped report', () => {
    const values = insertFor('reports', {
      reporter_id: 'user-1',
      target_id: 'user-2',
      target_type: 'profile',
      reason: 'Reported for Harassment — sustained abuse in chat',
      details: 'context',
    })

    expect(values.target_type).toBe('profile')
  })

  it('accepts a message insert without a read flag', () => {
    const values = insertFor('messages', {
      connection_id: 'conn-1',
      sender_id: 'user-1',
      receiver_id: 'user-2',
      content: 'hello',
    })

    // `is_read` was the phantom; read state is the `read_at` timestamp.
    expect(values).not.toHaveProperty('is_read')
  })

  it('accepts a connection insert without a message column', () => {
    const values = insertFor('connections', {
      requester_id: 'user-1',
      recipient_id: 'user-2',
      status: 'pending',
    })

    expect(values).not.toHaveProperty('message')
  })

  /**
   * These are compile-time guarantees, verified by `tsc --noEmit` in CI rather
   * than at runtime. Uncommenting any line below must fail the type check:
   *
   *   insertFor('reports', { reported_user_id: 'u1' })   // no such column
   *   insertFor('messages', { is_read: false })          // no such column
   *   insertFor('connections', { message: 'hi' })        // no such column
   *   supabase.client.from('blocked_users')              // no such table
   *
   * Kept as documentation because a test cannot assert its own compile failure;
   * `expect-type` style assertions would be the alternative if this grows.
   */
  it('documents the compile-time guarantees', () => {
    expect(true).toBe(true)
  })
})
