# Phase W — Web Foundation Upgrade & Guardrail Cleanup

> Source: mobile repo `docs/reports/full-project-audit-2026-07-07.md` §7 · Repo: web · Safety-sensitive: **NO** (one needs_human story)
> Status: **do BEFORE Phase A-web (public surface)** — build the acquisition surface once, on the current majors, not migrate it after.
> **Purpose:** the audit found competent mechanics serving the wrong mission on an aging base. This phase modernizes the base and removes the §6 guardrail violation so PHASE_A_PUBLIC_SURFACE builds clean.

## Goal

Upgrade the stack one major across the board (Next 15→16, React 18.2→19.2, Tailwind 3→4), fix the structural web-quality findings, and retire the broadcast-feed shape — so the public/viral surface (Phase A-web) is built once on a current, charter-compliant foundation.

## Scope

**IN:** framework upgrades; Supabase server-client + generated-types refactor; feed retirement; landing reframe; web test-depth audit (the piece the 2026-07-07 audit couldn't cover).
**OUT:** the public share pages themselves (PHASE_A_PUBLIC_SURFACE); anything mobile-lane.
**Guardrails (§3.5, §6, §7):** no broadcast feed; web is the acquisition surface; never hold a service-role key.

## Stories

### Story W.1 — Stack upgrade: Next 16 / React 19.2 / Tailwind 4

> Verified current 2026-07-07: Next 16 stable since Oct 2025 (16.2.x line; Turbopack default,
> stable React Compiler), React 19.2, Tailwind 4. Recent RSC security patches (e.g.
> CVE-2025-55184) land on the current line. Docs-ground every step (nextjs.org/docs upgrade
> guides) — do NOT rely on training memory.

- [ ] Next 15 → 16 via the official codemod (`npx @next/codemod@latest upgrade`); Node ≥ 20 already satisfied
- [ ] React 18.2 → 19.2 (+ `@types/react` 19); fix breaking changes; evaluate enabling the React Compiler
- [ ] Tailwind 3.4 → 4 (CSS-first config migration; `prettier-plugin-tailwindcss` compat check)
- [ ] `date-fns` ^2 → v4 (first-class timezones)
- [ ] Full Jest + Cypress suites green; `next build` clean; no new TS errors (`tsc --noEmit`)
- [ ] One PR per major (Next+React may share); pin doc URLs under "Sources"

### Story W.2 — Supabase server-first refactor + generated types

> Audit: data fetching is client-side `useEffect` everywhere (even pages that should be RSC);
> `api.ts` maps rows via `Record<string, unknown>` + casts; `createServerSupabaseClient` exists
> but is barely used and its cookie adapter implements `getAll` only.

- [ ] Generate DB types (`supabase gen types typescript`) into `src/types/database.types.ts`; replace the hand-rolled `Record<string, unknown>` casts in `src/lib/api.ts`
- [ ] Bring the server client up to the documented @supabase/ssr pattern (cookies `getAll`/`setAll` with the RSC try/catch); keep middleware `getUser()` as-is (already correct)
- [ ] Convert the highest-value pages to server-side data fetching (profile, trips) — the enabler for Phase A-web's SEO pages
- [ ] Type-generation step documented in the cross-repo workflow: regenerate on every mobile-repo migration (FOUNDATIONS §10 seam)

### Story W.3 — Retire the broadcast feed; reframe the landing [needs_human: true]

> Audit + FOUNDATIONS §7: `(main)/feed/page.tsx` + `PostComposer` still ship (de-linked from nav
> but URL-reachable). The landing page sells "find your perfect travel companion" — the exact
> framing FOUNDATIONS §1 rejects — with CTAs that stop at web signup.

- [ ] Remove the `/feed` route + `PostComposer` surface (backend `feed_items` stays — it is repurposed as the city-cohort substrate per §5; only the broadcast SURFACE dies)
- [ ] Redirect `/feed` → `/discover`; delete dead feed components/tests
- [ ] Rewrite landing copy to the trust-platform framing (PRODUCT §1: verified people, real meetups, reputation that travels — NOT "matching"/"companion" language) — human sign-off on copy
- [ ] Remove stale-doc contradictions: README "Facebook-inspired three-column layout", AWS/AppSync ADRs marked superseded (FOUNDATIONS §5 disposal list)
- [ ] Add `generateMetadata` + OG defaults to the root layout (title/description in trust framing)

### Story W.4 — Web test-depth audit + gap fill

> The 2026-07-07 audit could not sample web test quality (tooling outage). Close that gap, then
> fix what it finds.

- [ ] Audit the ~464 Jest tests + Cypress specs: behavior vs render-smoke, per-surface coverage map (mirror the mobile audit's method)
- [ ] Fill the two critical funnels with behavior tests: sign-up → discover, and profile view (Cypress)
- [ ] Add `error.tsx` / `loading.tsx` / `not-found.tsx` where segments lack them
- [ ] Document the coverage map in `docs/reports/web-test-audit-<date>.md`

## Definition of Done / Acceptance Criteria

- [ ] `next@16.x`, `react@19.2.x`, `tailwindcss@4.x` in package.json; suites green; build clean
- [ ] `database.types.ts` generated + consumed by `src/lib/api.ts`; zero `Record<string, unknown>` row casts remain there
- [ ] `/feed` gone (redirects to `/discover`); no `PostComposer` in the bundle; landing copy reframed + signed off
- [ ] Web test coverage map published; critical funnels behavior-tested
- [ ] No service-role key anywhere (re-verify after upgrades)

## Dependencies

None on mobile. **Gates PHASE_A_PUBLIC_SURFACE** (build the public pages on Next 16, not 15). Runs parallel with mobile PHASE_0 0.4/0.5 and PHASE_H.
