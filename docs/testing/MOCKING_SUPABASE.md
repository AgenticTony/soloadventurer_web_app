# Mocking Supabase in tests

**Story W.4.** Written after four phantom-column bugs shipped to production with
a fully green test suite.

## The problem this solves

Every hand-rolled Supabase mock in this repo resolved **any** table name, **any**
column, and **any** query shape:

```ts
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: () => ({ select: () => ({ data: [...], error: null }) }),
  }),
}))
```

`from('blocked_users')` and `from('profiles')` are indistinguishable to that
mock. So were these, all of which ran in production against columns that do not
exist:

| Feature             | Wrote                                         | Real schema                                     | Effect                                |
| ------------------- | --------------------------------------------- | ----------------------------------------------- | ------------------------------------- |
| User reporting      | `reported_user_id`, `category`, `description` | `target_id`, `target_type`, `reason`, `details` | Nobody could report anyone            |
| Chat read receipts  | `is_read`                                     | `read_at timestamptz`                           | Unread counts and mark-as-read failed |
| Matching (tier 3)   | `trips.latitude` / `longitude`                | `location geography(Point,4326)`                | Query errored, matching threw         |
| Connection requests | `connections.message`                         | no such column                                  | Fallback path failed                  |

Each had passing tests. The mock answered to whatever it was asked for, and the
untyped client returned `any`, so nothing objected at compile time either.

## Use the schema-aware double

```ts
import { createSupabaseMock } from '@/test-utils/supabase-mock'

const supabase = createSupabaseMock()

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => supabase.client,
}))

beforeEach(() => {
  supabase.reset()
  supabase.client.auth.getSession.mockResolvedValue({
    data: { session: { user: { id: 'me' } } },
  })
})

it('reads the profile', async () => {
  supabase.mockTable('profiles', { data: { id: 'u1' }, error: null })

  await getProfileByUsername('wanderer')

  expect(supabase.tablesTouched()).toEqual(['profiles'])
})
```

### What it enforces

**At compile time** — `from()` is generic over the real table union, and the
`insertFor` / `updateFor` helpers take the generated `Insert` / `Update` row
types. CI runs `tsc --noEmit` across the repo including tests, so these fail the
build:

```ts
supabase.client.from('blocked_users') // no such table
insertFor('reports', { reported_user_id: 'u1' }) // no such column
insertFor('messages', { is_read: false }) // no such column
```

**At runtime** — table names are checked against `TABLE_NAMES`, so a cast that
slips past the compiler still throws, naming the bad table. Reaching for
`as never` to silence a type error does not buy a quiet pass.

### Assertions it makes possible

| Call                     | Answers                                            |
| ------------------------ | -------------------------------------------------- |
| `tablesTouched()`        | Which tables were queried, in order                |
| `queriesFor('profiles')` | Every interaction with one table                   |
| `.operations`            | `['select', 'eq', 'single']` — the chain, in order |
| `.selected`              | The column string passed to `select()`             |
| `.payload`               | The object passed to `insert()` / `update()`       |

An unstubbed table resolves to `{ data: null, error: null }` — deliberately
inert, not convincing. A test that forgets to stub a table should fail on its own
assertions rather than coast on plausible fixture data.

### Keeping `TABLE_NAMES` honest

A compile-time exhaustiveness check in `supabase-mock.ts` fails if the list
drifts from `database.types.ts` in either direction. After a migration:

```bash
supabase gen types typescript --linked > src/types/database.types.ts
npx tsc --noEmit   # tells you exactly which table to add or remove
```

## Migration status

| File                                                        | Status      | Note                                                                                                               |
| ----------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------ |
| `services/users/__tests__/userService.privacy.test.ts`      | ✅ Migrated | Security-relevant (PII projection); gained an assertion that it reads `profiles` and nothing else                  |
| `lib/__tests__/profile.test.ts`                             | ✅ Migrated | Dropped a module-scope query that existed only to extract a mock handle                                            |
| `lib/api/__tests__/matching.test.ts`                        | ⬜ Deferred | 44 tests, assertion-rich already. Migrate alongside the next change to `matching.ts`, not as a standalone churn PR |
| `lib/__tests__/api.test.ts`                                 | ⬜ Deferred | Has its own chain recorder that already captures calls; overlaps with this double, worth reconciling deliberately  |
| `components/features/trips/__tests__/TripEditForm.test.tsx` | ⬜ Deferred | Component test; the query surface is small                                                                         |
| `lib/api/__tests__/chat.test.ts`                            | ➖ N/A      | Mocks realtime `channel`/`removeChannel` only — no table queries                                                   |
| `contexts/__tests__/AuthContext.test.tsx`                   | ➖ N/A      | Mocks `auth` only — no table queries                                                                               |

Deferred files are not broken; they are lower-yield and carry more churn risk
than value right now. Migrate each one the next time its feature changes, so the
diff stays attached to work a reviewer is already reading.

## Related patterns worth avoiding

**Sleep-and-hope.** `await new Promise(r => setTimeout(r, 100))` to "make sure
nothing happened" proves only that nothing happened inside an arbitrary window,
and deadlocks the moment the suite uses fake timers. Assert the guard directly.

**Real-clock debounces.** `useUserSearch` debounces 300ms; its test allowed
1000ms for debounce plus resolution plus polling, and failed ~1 run in 3 under
parallel load. Use fake timers and advance explicitly.
