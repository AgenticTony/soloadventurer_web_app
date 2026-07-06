# SoloAdventurer — Comprehensive Two-Repo Review

**Date:** 2026-07-05 · **Scope:** `SoloAdventurerWeb` (Next.js) + `SoloAdventurer_app` (Flutter + shared Supabase backend)
**Method:** every active doc read in both repos (archives inventoried); full source-tree sweeps; all 20 migrations + 12 Edge Functions reviewed; CI, loop infra, and state files verified; web jest suite executed (464/464 green), typecheck run (clean); mobile PR #10 CI checks pulled live.

---

## 1. Verdict

Both repos are **mechanically healthy and unusually well-governed** for a solo project: green CI with honest gates, a written product charter (FOUNDATIONS) that both repos cite, a versioned reward function, textbook RLS on the new Phase A backend, and no secrets in current source. The gaps are concentrated in three places:

1. **The web app has not started its acquisition mission** — it is still the pre-reframe product port, its landing page is literally unreachable, and the SEO/share/referral machinery (the viral engine) is 0% built.
2. **Documentation debt is heavy** — a large fraction of "active" docs describe dead architectures (AWS Cognito/AppSync era) or the rejected matching-app framing, including the README and the entire `docs/standards/` directory.
3. **Two pieces of in-flight work are dangling** — the unmerged FOUNDATIONS reframe branch (web) and the uncommitted pgTAP-fix migrations for red PR #10 (mobile).

---

## 2. Web repo — SoloAdventurerWeb

### 2.1 Verified healthy

- **Tests:** 464 tests / 44 suites, all passing — matches `.claude/state/baselines.json` exactly. `tsc --noEmit` clean. Zero `any`-casts in src. Only 13 TODO/FIXME.
- **Auth:** `src/lib/supabase/middleware.ts` follows the current `@supabase/ssr` pattern (getAll/setAll, `getUser()` for the auth decision, warning comment intact). Client-side `getSession()` uses are for token access, not authorization — acceptable.
- **Edge-function invoker** (`src/lib/supabase/client.ts`) is production-quality: timeout, bounded retry with backoff, 4xx no-retry.
- Dead files flagged in the old `web-architecture.md` audit (chatStore, wsClient, tailwind.config.js dup, chat page backup) were **actually cleaned up**.
- Mock data is contained: only 4 files (`cities/[slug]`, `messages`, `notifications`, `SearchOmni`).

### 2.2 Critical / major

| #   | Finding                                                                                                                                                                                                                                                                                                                                            | Evidence                      |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| W1  | **FOUNDATIONS charter not on main.** The entire reframe (charter + phase sprints + CLAUDE.md + loop infra) is one commit (`75cec9f`) on `docs/foundations-reframe` with **no open PR**.                                                                                                                                                            | `git log main..HEAD`          |
| W2  | **Landing page unreachable.** `next.config.js:33` redirects `/` → `/discover` and Next.js config redirects run **before** middleware, so every anonymous visitor is bounced `/` → `/discover` → `/sign-in`. The landing page in `src/app/page.tsx` never renders; `middleware.ts:36` root-handling is dead code. Fatal for an acquisition surface. | next.config.js, middleware.ts |
| W3  | **Zero SEO/share infrastructure.** No `sitemap.ts`, no `robots.ts`, `public/` contains only a favicon (no OG images), and only **2** metadata exports in the entire app — the root layout and, absurdly, the _private_ chat page (`chat/[conversationId]` has `generateMetadata`; the public `profile/[username]` and `cities/[slug]` have none).  | route sweep                   |
| W4  | **Route tree is still the rejected feature port.** `(main)/feed`, `chat`, `messages`, `discover`, `connections`, `meetups`, `notifications`, `saved`, `trips`, `dashboard`, `explore` — the §5-REFACTOR/§6-guardrail surface. `feed` is a live broadcast-feed page (PostComposer → PostCard), the exact §7 "do not ship" shape.                    | src/app tree                  |
| W5  | **`cities/[slug]` renders fabricated content** — a client component with hardcoded mock data (San Francisco spots, fake traveler counts, fake events) for _any_ slug. Violates §6.10 (no synthetic liquidity) and Phase E.1 ("no fabricated pages") if it ever goes public; useless for SEO as client-rendered.                                    | cities/[slug]/page.tsx        |

### 2.3 Minor

- `middleware.ts:44` matcher excludes `/sign-in` + `/signup`, so the "authenticated user on auth page" redirect (line 26) never fires for them.
- `/cities` sits in the authenticated `(main)` group but isn't in `protectedRoutes` — grouping/intent mismatch.
- **No security headers**: `docs/standards/SECURITY.md` specifies CSP/HSTS/X-Frame-Options blocks, but the real `next.config.js` has no `headers()` at all.
- `next.config.js` image allowlist includes `images.unsplash.com` and `http://localhost`.
- `.env.example` still lists `NEXTAUTH_SECRET`/`NEXTAUTH_URL` (NextAuth unused).
- `package.json`: `"main": "src/index.tsx"` (nonexistent), `"license": "MIT"` on a commercial product, description = old "social platform" framing. Root-layout metadata description says "find travel companions" — pre-reframe copy.
- Gamification components (`AchievementGrid`, `AchievementSystem`, `ProfileCompletionTracker`) survive from the old model — the 2026 engagement doc and FOUNDATIONS both reject streak/badge patterns.
- 66 raw `console.*` calls in src — no logger abstraction.
- Cypress: 2 spec files exist (`auth.cy.js`, `trips.cy.js`) but **e2e is not wired into CI** (ci.yml runs typecheck/lint/test/build only).
- `scripts/__pycache__/` untracked (gitignore it). Repo-root clutter: `SoloAdventurer-handoff.zip`, 3 PNGs.

### 2.4 Documentation debt (web)

- **README.md**: AWS-account prerequisite, links to deleted docs (`docs/project/PROJECT.md`, `WEB_APP_SPRINTS*.md`, `docs/adr/*`), lists Sprint 1–8 statuses from the retired backlog.
- **docs/standards/ARCHITECTURE.md**: entirely AWS-era (Cognito, AppSync, DynamoDB GSI, Lambda, CloudFormation) — last updated 2025-09-18, two stacks ago.
- **docs/standards/CLAUDE.md**: an old duplicate agent-instructions file describing "matching, chat, feed, meetups" as core product — contradicts the real root CLAUDE.md and FOUNDATIONS.
- **docs/standards/SECURITY.md**: mixed Supabase/AWS content; CSP example still references `amazonaws.com`; recommends `getSession()` for auth decisions (current Supabase docs say `getUser()`; the actual code does it right).
- **docs/standards/TESTING.md**: describes a `tests/` directory layout + msw/faker that don't exist (tests are co-located in `src/**/__tests__`).
- **docs/ui/UI_DESIGN_SYSTEM.md**: "Facebook-inspired three-column feed layout" — the inverted shape §7 explicitly retires.
- **Root**: `SoloAdventurer_SPRINT_PLAN.md` (old mobile MVP plan) and `SoloAdventurer_ML_Matching_Plan.md` (explicit §5 DISPOSE item — "AI as Could-Have" framing) still sit at repo root.
- `docs/PRODUCT.md`, `docs/FOUNDATIONS.md`, phase sprints, `loop.md`: **current and coherent** — these are the good ones.

---

## 3. Mobile repo — SoloAdventurer_app

### 3.1 Verified healthy

- **CI:** 15/17 checks green on PR #10 — analyze/format, lint, unit+widget (4487 passing / 63 signature-tracked known failures), **80% coverage gate**, Android integration tests, Android APK + iOS builds, GitGuardian, migration validation, auth-pattern compliance, breaking-change detection. This is a genuinely strong pipeline.
- **No hardcoded secrets** in `lib/` (env-driven `app_config.dart`; only doc-comment URLs).
- **Architecture:** clean feature-first layout, 20 feature modules, 1071 Dart files (203 generated). The `UnimplementedError`s (37) are almost all the standard Riverpod "override-in-bootstrap" pattern or deprecated tombstone providers pointing at `_impl` versions — bootstrap correctly overrides the 4 live ones; no runtime consumers of the tombstones.
- **Edge Functions (12):** correct security pattern throughout the sampled set — service-role key server-side only, explicit `auth.getUser(token)` verification before acting. Full safety pipeline exists (`trigger-sos`, `process-checkin`, `process-safety-alert`), plus Onfido, push, matching, embeddings.
- **RLS:** 57 policies across the two policy migrations; women-only mode enforced **server-side in RLS** (not client toggles). Phase A migration adds read-only policies + SECURITY DEFINER RPCs with `set search_path`, execute revoked from public/anon — textbook.
- **pgTAP:** `supabase/tests/database/meetups_reputation.test.sql` — 22 assertions covering schema, exact policy lists, RPC gating.
- **reward-function-v0.1.md** is a real versioned artifact and matches the shipped `reputation_score()` formula.

### 3.2 Critical / major

| #   | Finding                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Evidence                       |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| M1  | **PR #10 red on pgTAP; the fix sits uncommitted locally.** Working tree has modified `20250105...storage_buckets.sql`, modified `20250106...shared_links.sql` (subquery CHECK → RLS), and untracked `20250109500000_create_profiles.sql` (the historically-dashboard-only base table). All annotated "See issue #9", none pushed.                                                                                                                                                                                                                                                                     | git status, `gh pr checks 10`  |
| M2  | **Storage RLS now unversioned.** All per-user policies for `journal-photos`/`journal-videos`/`journal-thumbnails` are commented out of `20250105...` ("applied via dashboard in production"). Private-media security config now lives only in the dashboard — no audit trail, silent-drift risk. Verify prod actually has them; snapshot them somewhere versioned.                                                                                                                                                                                                                                    | migration file                 |
| M3  | **P0 leaked-credentials blocker still open** — service-role key + AWS/OpenAI/Resend/Twilio/PATs across ~561 commits; rotation in progress, **history never purged**. Bypasses RLS for both apps. FOUNDATIONS Phase 0 gate.                                                                                                                                                                                                                                                                                                                                                                            | CLAUDE.md, state files         |
| M4  | **`no_show` has no write path.** `meetup_outcomes.outcome` permits `'no_show'` and `reputation_score()` subtracts 1 per no-show, but no RPC ever records one — the reward doc lists it as "wired now" when it is structurally always zero. Also: no proposer-cancel RPC once a meetup is proposed/confirmed.                                                                                                                                                                                                                                                                                          | phase A migration + reward doc |
| M5  | **Sprint state is stale against shipped code.** `sprint-progress.json` says `active_sprint: PHASE_0_BLOCKERS`, Phase A 0/16 checkboxes — but PR #8 merged the Phase A migration. Spec-vs-shipped deltas: unified `events` L0 table **not** created (only `meetup_outcomes`); review gate is mutual-confirmation, not the specced `meetup_checkin` co-location proof (deliberately deferred to Phase C — but the sprint doc overstates); web phase doc names a `get_reputation` RPC that shipped as `reputation_score`; no city column/`completed_at` index for the specced north-star cohort queries. | state file vs migration        |

### 3.3 Minor

- `Viator.json` at repo root: a ~100k-token single-line API dump committed to git — move to fixtures or gitignore.
- Migration timestamps mix `2025xxxx` and `2026xxxx` epochs (functional, confusing).
- Country-coarse heuristic (`0.5` same-country weight) still live in `find-potential-matches-semantic/index.ts:78` — known §5/Phase B refactor target; fine for now, banned "in production" by §6.5.
- Docs clutter: `Error_Reduction_Plan.md.bak`, `RIVERPOD_3_MIGRATION_AUDIT.md.bak`, stale `docs/reports/BUILD_ISSUES_REPORT.md` + `INCOMPLETE_TASKS.md` (Jan 2026, long resolved — archive them), `docs/architecture/ARCHITECTURE.md` still says AWS Cognito.
- CLAUDE.md says "~286 test files"; actual 249.
- Open issue #3 (Android release-APK cascade) parked since 2026-06-13.
- 63 known-failing tests carried as accepted debt (honest and signature-gated, but it's still 63 red tests — schedule a burn-down).
- `docs/archive/examples/` contains macOS `._*` resource-fork files.

---

## 4. Cross-repo & governance

- **FOUNDATIONS mirrors match** (formatting-only diff; mobile copy correctly declares the web copy canonical).
- **Backend ownership is clean:** all migrations/functions live in the mobile repo; web has no `supabase/` dir and its CI carries no service-role key (per baselines note). The `web_integration` section in mobile's sprint state is a genuinely good coupling map, though its `coupled_sprints` list references the _retired_ sprint IDs (6.7, 4.5, 1B…) rather than phases.
- **Loop infra:** both repos have the triage→implementer→verifier→PR loop. Web `triage.json` is empty (never run post-reframe). **Web `.claude/agents/verifier.md` has no read-only constraint** — the mobile CLAUDE.md explicitly warns the verifier once destroyed source via `git checkout`; the web agent file lacks that wall.
- **Web CI has no e2e gate** despite Cypress specs existing; mobile CI is far more complete than web CI (web: typecheck/lint/test/build only).
- **ScreenGap.md** (mobile root) is useful competitive research — its verification/safety gap analysis aligns with the trust thesis; its "match 130–160 screens" framing does not (§1 rejects feature-parity thinking). Treat as input, not spec.

---

## 5. Priority actions

**This week (small, unblocking):**

1. Open + merge the reframe PR (`docs/foundations-reframe` → main). (W1)
2. Commit/push the three local migrations in the mobile repo; get PR #10's pgTAP green; merge. Unblocks all `supabase/**` work. (M1)
3. Delete the `/` → `/discover` redirect (and `/feed`, `/dashboard` legacy redirects) from `next.config.js`; fix the middleware matcher. The landing page becomes reachable. (W2)
4. Add a read-only wall to the web verifier agent. (§4)

**Phase 0 (the charter's own gate):** 5. Verify prod storage RLS policies exist; version a snapshot. (M2) 6. Finish credential rotation + history purge. (M3) 7. Analytics + `meetups_completed` north-star instrumentation (both repos' Story 0.1/0.3 — nothing is measured today).

**Phase A follow-through (mobile):** 8. Add `report_no_show` (and proposer-cancel) RPCs so reward v0.1 is fully realizable; reconcile the reward doc. (M4) 9. Update sprint state to reflect shipped Phase A; fix the `get_reputation`/`reputation_score` naming drift in the web phase doc; decide on the unified `events` table (spec it or de-spec it). (M5)

**The viral engine (web — pull forward from Phase E where dependencies allow):** 10. Real `profile/[username]` + trip share pages with `generateMetadata`, OG images, JSON-LD; sitemap.ts + robots.ts. (W3) 11. Replace `cities/[slug]` mock with real-data, server-rendered destination pages — or park it behind a flag until data exists. (W5) 12. Referral landing + attribution links (Story E.2) — depends only on Phase A data, not B–D. 13. Retire/gate the `(main)` feature port; kill `/feed` as a broadcast surface per §7. (W4)

**Hygiene sweep (either repo, one PR each):** 14. Web: rewrite README; archive/rewrite `docs/standards/*` + UI doc; delete root SPRINT_PLAN + ML plan; drop NextAuth env vars; fix package.json metadata; gitignore `__pycache__`; add security headers per your own SECURITY.md. 15. Mobile: archive the Jan-2026 reports + `.bak` files; move/ignore Viator.json; correct test-file count in CLAUDE.md; wire Cypress into web CI or delete the specs.

---

## 6. What's genuinely good (keep doing this)

- The FOUNDATIONS charter + PRODUCT narrative + versioned reward function are an unusually disciplined strategy layer — most teams never write this down, let alone make PRs auditable against it.
- Phase A shipped as **schema + RLS + RPCs + pgTAP first, ML later** — exactly what the charter ordered.
- Honest CI: signature-keyed known-failure gate instead of deleted tests; coverage gate at 80%; breaking-change detection; auth-pattern compliance check.
- Edge Functions consistently verify the caller's JWT before acting with service-role powers.
- Women-only mode enforced in RLS, not client code.
- Cross-repo coupling is documented (`web_integration` map) rather than tribal knowledge.
