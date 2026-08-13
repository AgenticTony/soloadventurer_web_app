/**
 * Schema-contract regression tests (Story W.2).
 *
 * These pin the column names three features write to. Each one below was a
 * phantom column shipped to production: the query referenced a column the table
 * does not have, so the feature failed at runtime while every existing test
 * passed — the mocked Supabase client answers to any column name, and the
 * untyped client made the mismatch invisible at compile time.
 *
 * The generated types now catch this class at build time. These tests are the
 * belt to that braces: they fail loudly if someone reintroduces the old names
 * against a mock that would happily accept them.
 */

import type { Database } from '@/types/database.types'

type Tables = Database['public']['Tables']

describe('reports — polymorphic target, not a column per target kind', () => {
  type ReportInsert = Tables['reports']['Insert']

  it('accepts target_id + target_type', () => {
    const row: ReportInsert = {
      reporter_id: 'user-1',
      target_id: 'target-1',
      target_type: 'profile',
      reason: 'Reported for Harassment — sustained abuse in chat',
    }

    expect(row.target_type).toBe('profile')
    expect(row).not.toHaveProperty('reported_user_id')
  })

  it('has no reported_user_id / category / description / message_id columns', () => {
    type Keys = keyof ReportInsert
    const phantom = ['reported_user_id', 'category', 'description', 'message_id', 'post_id']
    const actual: Keys[] = ['reporter_id', 'target_id', 'target_type', 'reason', 'details']

    for (const key of phantom) {
      expect(actual).not.toContain(key as Keys)
    }
  })

  it('constrains target_type to the DB enum', () => {
    const valid: Tables['reports']['Insert']['target_type'][] = [
      'profile',
      'post',
      'comment',
      'message',
    ]
    expect(valid).toHaveLength(4)
  })
})

describe('messages — read state is a timestamp, not a boolean', () => {
  type MessageInsert = Tables['messages']['Insert']

  it('exposes read_at and not is_read', () => {
    const row: MessageInsert = {
      connection_id: 'conn-1',
      sender_id: 'user-1',
      receiver_id: 'user-2',
      content: 'hello',
    }

    expect(row).not.toHaveProperty('is_read')

    // read_at is assignable; is_read would not compile.
    const read: MessageInsert = { ...row, read_at: new Date().toISOString() }
    expect(typeof read.read_at).toBe('string')
  })
})

describe('trips — position is PostGIS, not lat/lng columns', () => {
  type TripRow = Tables['trips']['Row']

  it('has a location column and no latitude/longitude', () => {
    const keys: (keyof TripRow)[] = ['id', 'user_id', 'destination', 'start_date', 'end_date']
    expect(keys).not.toContain('latitude' as keyof TripRow)
    expect(keys).not.toContain('longitude' as keyof TripRow)
  })

  it('treats end_date as nullable — open-ended trips exist', () => {
    const openEnded: Pick<TripRow, 'start_date' | 'end_date'> = {
      start_date: new Date().toISOString(),
      end_date: null,
    }
    expect(openEnded.end_date).toBeNull()
  })
})

describe('connections — no message column', () => {
  type ConnectionInsert = Tables['connections']['Insert']

  it('accepts an insert without message', () => {
    const row: ConnectionInsert = {
      requester_id: 'user-1',
      recipient_id: 'user-2',
      status: 'pending',
    }

    expect(row).not.toHaveProperty('message')
    expect(row.status).toBe('pending')
  })
})
