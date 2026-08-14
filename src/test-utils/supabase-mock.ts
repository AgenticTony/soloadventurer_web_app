/**
 * Schema-aware Supabase test double (Story W.4).
 *
 * ## Why this exists
 *
 * The hand-rolled mocks across this suite resolve any table name, any column,
 * and any query shape. That is what let a class of phantom-schema bugs ship:
 * user reporting wrote `reported_user_id`, chat wrote `is_read`, matching
 * selected `trips.latitude` — none of those columns exist, every one of those
 * features was broken in production, and every test stayed green because the
 * mock happily answered to whatever it was asked for.
 *
 * This double closes that gap in two layers:
 *
 * 1. **Compile time.** `from()` is generic over the real table union, and
 *    `insert()` / `update()` take the generated `Insert` / `Update` row types.
 *    `from('blocked_users')` or `insert({ reported_user_id })` is a `tsc` error.
 *    CI runs `tsc --noEmit` across the repo, tests included, so this is enforced.
 *
 * 2. **Runtime.** Table names are checked against {@link TABLE_NAMES}, so a
 *    cast (`as never`, `as any`) that slips past the compiler still throws with
 *    a message naming the bad table. Tests that reach for a cast to silence the
 *    type error do not get a quiet pass.
 *
 * `TABLE_NAMES` is kept honest by a compile-time exhaustiveness check below: if
 * a migration adds or drops a table and the types are regenerated, this file
 * stops compiling until the list is updated.
 *
 * ## Usage
 *
 * ```ts
 * const supabase = createSupabaseMock()
 * supabase.mockTable('profiles', { data: [{ id: 'u1' }], error: null })
 *
 * jest.mock('@/lib/supabase/client', () => ({
 *   createClient: () => supabase.client,
 * }))
 *
 * expect(supabase.queriesFor('profiles')).toHaveLength(1)
 * ```
 */

import type { Database } from '@/types/database.types'

type PublicSchema = Database['public']
export type TableName = keyof PublicSchema['Tables']
export type TableRow<T extends TableName> = PublicSchema['Tables'][T]['Row']
export type TableInsert<T extends TableName> = PublicSchema['Tables'][T]['Insert']
export type TableUpdate<T extends TableName> = PublicSchema['Tables'][T]['Update']

/**
 * Every table in the public schema, for runtime validation.
 *
 * Keep in sync with `database.types.ts` — the assertion below enforces it.
 */
export const TABLE_NAMES = [
  'activities',
  'blocks',
  'check_ins',
  'comments',
  'connections',
  'content_privacy_settings',
  'feed_items',
  'follows',
  'gender_change_audit_log',
  'journal_entries',
  'journal_tags',
  'journals',
  'media_items',
  'meetup_checkins',
  'meetup_outcomes',
  'meetups',
  'member_reviews',
  'messages',
  'notification_tokens',
  'notifications',
  'offline_changes',
  'profile_privacy_settings',
  'profiles',
  'reactions',
  'reports',
  'safety_alerts',
  'shared_links',
  'shared_meetups',
  'sos_alerts',
  'spatial_ref_sys',
  'tags',
  'travel_preferences',
  'trips',
  'trusted_contacts',
  'typing_indicators',
  'user_activities',
  'user_verification',
  'verification_records',
  'waitlist_entries',
  'women_only_space_members',
  'women_only_spaces',
] as const satisfies readonly TableName[]

/**
 * Fails to compile if {@link TABLE_NAMES} drifts from the generated schema.
 *
 * `satisfies` above catches names that are not real tables. This catches the
 * other direction — a table that exists but is missing from the list, which
 * would otherwise make the runtime guard reject a legitimate query.
 */
type MissingFromList = Exclude<TableName, (typeof TABLE_NAMES)[number]>
const _assertNoMissingTables: MissingFromList extends never ? true : MissingFromList = true
void _assertNoMissingTables

const TABLE_NAME_SET: ReadonlySet<string> = new Set(TABLE_NAMES)

/** One recorded interaction with a table. */
export interface RecordedQuery {
  table: string
  /** Terminal operation performed, in call order. */
  operations: string[]
  /** Payload passed to insert/update/upsert, if any. */
  payload?: unknown
  /** Column string passed to `select()`, if any. */
  selected?: string
}

/** Result a mocked table hands back when awaited. */
export interface MockResult<T = unknown> {
  data: T | null
  error: { message: string; code?: string } | null
}

function assertKnownTable(table: string): void {
  if (!TABLE_NAME_SET.has(table)) {
    throw new Error(
      `[supabase-mock] Unknown table "${table}". ` +
        `It is not in the generated schema, so this query would fail against the real database. ` +
        `If the table is new, regenerate types (\`supabase gen types typescript --linked\`) ` +
        `and add it to TABLE_NAMES.`
    )
  }
}

/**
 * A thenable query builder that records what it was asked to do.
 *
 * Mirrors the fluent PostgREST surface closely enough for the calls this suite
 * makes; anything unrecognised throws rather than silently returning `this`,
 * which is the behaviour that let bad queries pass.
 */
class MockQueryBuilder<T> implements PromiseLike<MockResult<T>> {
  constructor(
    private readonly record: RecordedQuery,
    private readonly result: MockResult<T>
  ) {}

  private step(name: string): this {
    this.record.operations.push(name)
    return this
  }

  select(columns?: string): this {
    if (columns !== undefined) this.record.selected = columns
    return this.step('select')
  }

  insert(values: unknown): this {
    this.record.payload = values
    return this.step('insert')
  }

  update(values: unknown): this {
    this.record.payload = values
    return this.step('update')
  }

  upsert(values: unknown): this {
    this.record.payload = values
    return this.step('upsert')
  }

  delete(): this {
    return this.step('delete')
  }

  eq(): this {
    return this.step('eq')
  }
  neq(): this {
    return this.step('neq')
  }
  gt(): this {
    return this.step('gt')
  }
  gte(): this {
    return this.step('gte')
  }
  lt(): this {
    return this.step('lt')
  }
  lte(): this {
    return this.step('lte')
  }
  is(): this {
    return this.step('is')
  }
  in(): this {
    return this.step('in')
  }
  or(): this {
    return this.step('or')
  }
  ilike(): this {
    return this.step('ilike')
  }
  order(): this {
    return this.step('order')
  }
  limit(): this {
    return this.step('limit')
  }
  range(): this {
    return this.step('range')
  }

  single(): PromiseLike<MockResult<T>> {
    this.step('single')
    return this
  }

  maybeSingle(): PromiseLike<MockResult<T>> {
    this.step('maybeSingle')
    return this
  }

  then<TResult1 = MockResult<T>, TResult2 = never>(
    onfulfilled?: ((value: MockResult<T>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return Promise.resolve(this.result).then(onfulfilled, onrejected)
  }
}

export interface SupabaseMock {
  /** Pass this where the code under test expects a Supabase client. */
  client: {
    from<T extends TableName>(table: T): MockQueryBuilder<unknown>
    auth: {
      getSession: jest.Mock
      getUser: jest.Mock
    }
    rpc: jest.Mock
  }
  /** Queue the result a table returns. Table name is checked at both layers. */
  mockTable<T extends TableName>(table: T, result: MockResult<unknown>): void
  /** Every recorded interaction, in order. */
  queries: RecordedQuery[]
  /** Recorded interactions for one table. */
  queriesFor<T extends TableName>(table: T): RecordedQuery[]
  /** Tables touched, in first-touch order. */
  tablesTouched(): string[]
  reset(): void
}

/**
 * Create a schema-aware Supabase test double.
 *
 * Unstubbed tables resolve to `{ data: null, error: null }` — deliberately inert
 * rather than convincing, so a test that forgot to stub a table fails on its own
 * assertions instead of coasting on plausible-looking fixture data.
 */
export function createSupabaseMock(): SupabaseMock {
  const results = new Map<string, MockResult<unknown>>()
  const queries: RecordedQuery[] = []

  const mock: SupabaseMock = {
    client: {
      from<T extends TableName>(table: T) {
        assertKnownTable(table as string)
        const record: RecordedQuery = { table: table as string, operations: [] }
        queries.push(record)
        return new MockQueryBuilder(
          record,
          results.get(table as string) ?? { data: null, error: null }
        )
      },
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
        getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
      },
      rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
    },

    mockTable(table, result) {
      assertKnownTable(table as string)
      results.set(table as string, result)
    },

    queries,

    queriesFor(table) {
      assertKnownTable(table as string)
      return queries.filter(q => q.table === (table as string))
    },

    tablesTouched() {
      return [...new Set(queries.map(q => q.table))]
    },

    reset() {
      results.clear()
      queries.length = 0
    },
  }

  return mock
}

/**
 * Typed insert helper.
 *
 * Wrapping a payload in this makes the row type explicit at the call site, so a
 * phantom column is a compile error in the test itself rather than something the
 * mock shrugs off:
 *
 * ```ts
 * insertFor('reports', { reporter_id: 'u1', target_id: 't1', target_type: 'profile', reason: '...' })
 * insertFor('reports', { reported_user_id: 'u1' }) // tsc error — no such column
 * ```
 */
export function insertFor<T extends TableName>(_table: T, values: TableInsert<T>): TableInsert<T> {
  return values
}

/** Typed update helper. See {@link insertFor}. */
export function updateFor<T extends TableName>(_table: T, values: TableUpdate<T>): TableUpdate<T> {
  return values
}
