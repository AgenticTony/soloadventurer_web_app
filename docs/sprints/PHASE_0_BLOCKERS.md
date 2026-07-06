# Phase 0 — Launch Blockers (web)

> FOUNDATIONS §9 (Phase 0) · Repo: web (acquisition surface) · Safety-sensitive: **YES**
> Status: active. Web's Phase 0 is smaller than mobile's — most blockers live in the mobile repo (shared backend). Stories are `needs_human`/`safety`.

## Goal

Stand up web analytics + the acquisition funnel north-star, audit public-page privacy (web is going more public), and coordinate the shared-backend secret rotation.

## Scope

**IN:** web product analytics (visits → install funnel); public-page privacy / RLS audit; coordinate secrets purge (shared Supabase service-role key — mobile-led).
**OUT:** backend migration (mobile lane); mobile safety hardening.
**Guardrails (§3.5, §6):** web is the acquisition surface, not a second app; never hold a service-role key.

## Stories

### Story 0.1 — Web analytics + acquisition funnel [needs_human: true]

- [x] Pick analytics provider (docs-grounded) — **PostHog** (`posthog-js`, EU Cloud), **same PostHog project as mobile** so the `visit→install→meetup_completed` funnel stitches across surfaces (decided 2026-07-06; see `docs/analytics-v0.1.md`)
- [x] Instrument visits → install, share → install, referral conversion — event taxonomy + consent-gated client shipped: `$pageview` (visit), `install_click`, `share_click`, `referral_landing`, `waitlist_signup`; `PageViewTracker` fires on route change. **Wiring the helpers into the actual CTAs is the deferred follow-up** (helpers + gate ready).
- [x] Privacy / consent gate (GDPR, opt-in) — PostHog starts `opt_out_capturing_by_default`; `ConsentBanner` (Accept/Decline) + `AnalyticsContext`; nothing captured until opt-in; `sanitize_properties` scrubs PII. Jest tests green.

### Story 0.2 — Public-page privacy / RLS audit [safety: true]

- [x] Audit which surfaces go public — only `/`, `/waitlist`, auth pages are anonymous; `/profile`, `/discover`, feed, etc. are gated in `src/middleware.ts`. Public profile/share pages are Stage A (step 10), not live yet. (Report: `docs/reports/web-privacy-rls-audit-2026-07-06.md`)
- [x] Ensure RLS exposes only intended fields; no PII leakage — **found + fixed** a PII leak: `userService.searchUsers`/`getUserProfile` used `select('*')`, pulling other users' `email`/`phone`/`date_of_birth` over the wire (profiles RLS is row-level). Now use a non-PII projection; own email comes from the session. Regression test added. **Durable backend fix (public-safe view / column REVOKE) required — mobile lane, ⚠ needs sign-off** (see report).
- [x] Confirm web uses only the publishable anon key (no service-role in web CI) — verified: all clients + edge proxy use the anon key; zero service-role references in `src/`/env/CI.

### Story 0.3 — Secrets coordination [needs_human: true] [safety: true]

- [x] Track shared Supabase service-role key rotation (mobile-led, FOUNDATIONS §10) — **still Anthony-owned / mobile-led (execution-order step 3); gates launch.** No web action.
- [x] Verify web CI/env carries no service-role key — verified clean (Story 0.2 audit).

### Story 0.4 — Fix unreachable landing page _(added 2026-07-05; review finding W2)_

- [ ] Remove the `/` → `/discover` redirect in `next.config.js` — config redirects run before middleware, so anonymous visitors never reach the public landing page (fatal for an acquisition surface). Middleware already routes authed users to `/discover`.
- [ ] Keep `/feed` + `/dashboard` redirects (they suppress guardrail-violating legacy surfaces per §7 — do NOT expose them)
- [ ] Regression test: `next.config.redirects()` contains no `source: '/'`

## Definition of Done / Acceptance Criteria

- [ ] Analytics firing; acquisition funnel instrumented
- [ ] Public-page privacy audit clean; web publishable-key-only
- [ ] `npm run lint` + `npm run typecheck` clean; jest baseline not regressed

## Dependencies

None — first. Web's real build starts at Phase A.
