import type { SupabaseClient } from '@supabase/supabase-js'
import { blockUserInDb, unblockUserInDb, listBlockedUserIds } from '../moderation'

/**
 * Story 0.6 regression suite. The previous block implementation targeted
 * `blocked_users` — a table that does not exist (the real table is `blocks`)
 * — and NO test ever executed the DB branch: PrivacyContext.test.tsx ran with
 * a placeholder Supabase URL and no session, so `if (session?.user)` skipped
 * the insert entirely. A green suite proved nothing about the schema.
 *
 * These tests assert the TABLE NAMES the helper touches, so any regression to
 * a phantom table fails by name. The row-level truth (RLS, the severing
 * trigger, visibility gating) is proven by pgTAP in the mobile repo
 * (supabase/tests/database/blocks_sever_and_gate.test.sql), which runs against
 * a real database.
 */

type FromResult = {
  insert: jest.Mock
  delete: jest.Mock
  select: jest.Mock
}

function makeSupabase(overrides: Partial<Record<string, Partial<FromResult>>> = {}) {
  const calls: string[] = []
  const defaultChain = () => {
    const eq2 = jest.fn().mockResolvedValue({ data: [], error: null })
    const eq1 = jest.fn().mockReturnValue({ eq: eq2 })
    return {
      insert: jest.fn().mockResolvedValue({ error: null }),
      delete: jest.fn().mockReturnValue({ eq: eq1 }),
      select: jest
        .fn()
        .mockReturnValue({ eq: jest.fn().mockResolvedValue({ data: [], error: null }) }),
    }
  }
  const tables = new Map<string, FromResult>()
  const from = jest.fn((table: string) => {
    calls.push(table)
    if (!tables.has(table)) {
      tables.set(table, { ...defaultChain(), ...(overrides[table] ?? {}) } as FromResult)
    }
    return tables.get(table)!
  })
  return { client: { from } as unknown as SupabaseClient, from, calls, tables }
}

describe('blockUserInDb', () => {
  test('writes the block to the blocks table — never blocked_users', async () => {
    const { client, calls, tables } = makeSupabase()

    await blockUserInDb(client, 'blocker-1', 'target-1')

    expect(calls).toContain('blocks')
    expect(calls).not.toContain('blocked_users')
    expect(tables.get('blocks')!.insert).toHaveBeenCalledWith({
      blocker_id: 'blocker-1',
      blocked_id: 'target-1',
    })
  })

  test('a reason is routed to reports (target_type profile), not a blocks column', async () => {
    const { client, tables } = makeSupabase()

    const result = await blockUserInDb(client, 'blocker-1', 'target-1', 'harassing me')

    const blocksPayload = tables.get('blocks')!.insert.mock.calls[0][0]
    expect(blocksPayload).not.toHaveProperty('reason')

    const reportsPayload = tables.get('reports')!.insert.mock.calls[0][0]
    expect(reportsPayload.target_type).toBe('profile')
    expect(reportsPayload.target_id).toBe('target-1')
    expect(reportsPayload.reporter_id).toBe('blocker-1')
    expect(reportsPayload.reason).toBe('Blocked user: harassing me')
    expect(reportsPayload.reason.length).toBeGreaterThanOrEqual(10)
    expect(result.reportFiled).toBe(true)
  })

  test('no reason -> no reports row', async () => {
    const { client, calls } = makeSupabase()

    const result = await blockUserInDb(client, 'blocker-1', 'target-1')

    expect(calls).not.toContain('reports')
    expect(result.reportFiled).toBe(false)
  })

  test('duplicate block (23505) is success, other errors throw', async () => {
    const dup = makeSupabase({
      blocks: { insert: jest.fn().mockResolvedValue({ error: { code: '23505' } }) },
    })
    await expect(blockUserInDb(dup.client, 'b', 't')).resolves.toEqual({ reportFiled: false })

    const broken = makeSupabase({
      blocks: {
        insert: jest.fn().mockResolvedValue({ error: { code: '42501', message: 'denied' } }),
      },
    })
    await expect(blockUserInDb(broken.client, 'b', 't')).rejects.toBeTruthy()
  })

  test('the block stands when the reason-report fails; reportFiled is false', async () => {
    const { client } = makeSupabase({
      reports: { insert: jest.fn().mockResolvedValue({ error: { code: '42501' } }) },
    })
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    const result = await blockUserInDb(client, 'blocker-1', 'target-1', 'spam account')

    expect(result.reportFiled).toBe(false)
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })
})

describe('unblockUserInDb / listBlockedUserIds', () => {
  test('unblock deletes from blocks', async () => {
    const { client, calls } = makeSupabase()
    await unblockUserInDb(client, 'blocker-1', 'target-1')
    expect(calls).toEqual(['blocks'])
  })

  test('listing reads blocked_id from blocks', async () => {
    const { client, tables } = makeSupabase({
      blocks: {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: [{ blocked_id: 'u9' }], error: null }),
        }),
      },
    })
    await expect(listBlockedUserIds(client, 'blocker-1')).resolves.toEqual(['u9'])
    expect(tables.get('blocks')!.select).toHaveBeenCalledWith('blocked_id')
  })
})
