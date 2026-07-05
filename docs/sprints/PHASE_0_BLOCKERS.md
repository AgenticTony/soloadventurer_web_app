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

- [ ] Pick analytics provider (docs-grounded)
- [ ] Instrument visits → install, share → install, referral conversion
- [ ] Privacy / consent gate (GDPR, opt-in)

### Story 0.2 — Public-page privacy / RLS audit [safety: true]

- [ ] Audit which surfaces go public (trip/profile/destination share pages)
- [ ] Ensure RLS exposes only intended fields; no PII leakage
- [ ] Confirm web uses only the publishable anon key (no service-role in web CI)

### Story 0.3 — Secrets coordination [needs_human: true] [safety: true]

- [ ] Track shared Supabase service-role key rotation (mobile-led, FOUNDATIONS §10)
- [ ] Verify web CI/env carries no service-role key

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
