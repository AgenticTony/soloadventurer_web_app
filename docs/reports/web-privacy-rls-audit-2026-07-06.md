# Web Privacy / RLS Audit — 2026-07-06

> Phase 0 / Story 0.2 + 0.3 (`docs/sprints/PHASE_0_BLOCKERS.md`) · execution-order step 8.
> Scope: the web (acquisition) repo. Backend/RLS lives in the mobile repo (shared Supabase);
> cross-repo findings are flagged for the mobile lane.

## Summary

| Check                                                                                     | Result                                                    |
| ----------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Web holds **no service-role key** (env / code / CI)                                       | ✅ Pass                                                   |
| All Supabase clients use the **publishable anon key** only                                | ✅ Pass                                                   |
| Edge-function proxy runs **as the user** (anon key + forwarded cookies), not service-role | ✅ Pass                                                   |
| Public (anon) surface is minimal                                                          | ✅ Pass                                                   |
| Public read paths expose **only intended fields** (no PII)                                | 🚨 **Finding — fixed on web; backend follow-up required** |

## Details

### 1. No service-role key (Story 0.2/0.3) — ✅

`grep` across `src/`, `.env.example`, `.github/`, `next.config.*` finds **zero** service-role
references. `src/lib/supabase/{client,server,middleware}.ts` and the edge proxy
(`src/app/api/edge/[...functionName]/route.ts`) all use `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
The edge proxy forwards the user's auth cookies so the function runs under their identity
(RLS applies). No CI workflow references a service-role secret.

### 2. Public surface — ✅

`src/middleware.ts` gates `/feed, /profile, /messages, /trips, /notifications, /chat,
/connections, /waves, /explore, /discover, /settings, /dashboard` behind auth. The only
anonymous surfaces are `/` (landing), `/waitlist`, and the auth pages. The public
profile/share pages are **not public yet** (that's Stage A, step 10) — `/profile` is
currently in `protectedRoutes`.

### 3. 🚨 PII exposure via `select('*')` on `profiles` — FIXED (web) + backend follow-up

**Finding.** `profiles` RLS policy `"profiles: public visible to authenticated"`
(mobile `20250112000000_rls_policies.sql`) grants **full-row** SELECT of any public
profile to any authenticated user. Postgres RLS is **row-level, not column-level**, and the
`profiles` row contains `email`, `phone`, `date_of_birth`. Two web read paths selected `*`:

- `userService.searchUsers()` — user search returned every matched user's full row.
- `userService.getUserProfile(identifier)` — other-user lookup returned + surfaced `email`.

So any authenticated user could pull other users' `email` / `phone` / `date_of_birth` over
the wire (visible in the network response) — a GDPR/PII leak. (The already-correct
`getProfileByUsername` in `src/lib/api.ts`, used by the live `/profile/[username]` view,
selects only safe columns — good.)

**Fix (this PR, web).** Both methods now select an explicit non-PII projection
(`PUBLIC_PROFILE_COLUMNS` = `id, username, display_name, full_name, bio, avatar_url,
created_at, updated_at`). A user's own email is sourced from the **auth session**, never the
profiles row; other users' email is `''`. Regression test:
`src/services/users/__tests__/userService.privacy.test.ts`.

**Required backend follow-up (mobile lane, ⚠ RLS — needs sign-off).** Column narrowing on
the client is defense-in-depth, not a guarantee — RLS still permits a hand-crafted query to
read PII columns of any readable row. The durable fix belongs in the mobile repo:

1. **Preferred:** a `public_profiles` view (or SECURITY DEFINER RPC) exposing only non-PII
   columns; point web/other-user reads at it.
2. **And/or:** `REVOKE SELECT (email, phone, date_of_birth) ON profiles FROM authenticated;`
   (column-level privilege) so even `select('*')` cannot return the PII trio to non-owners.

## Story 0.3 — secrets coordination

Web CI/env carry no service-role key (§1). The shared Supabase **service-role key rotation +
git-history purge remains mobile-led / Anthony-owned** (mobile Story 0.1, execution-order
step 3) and still gates launch. No web action beyond the above.
