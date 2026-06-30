# SoloAdventurer Web — Acquisition & Share Surface

The web front-end of **SoloAdventurer** — a vetted, AI-spined trust platform for
solo travelers (**not** a "matching app" — see the strategy docs below). Per
`docs/FOUNDATIONS.md`, the web's job is **acquisition**: public, indexable,
shareable pages (SEO + viral/referral) that convert high-intent visitors into
mobile installs. The mobile app (`/Users/anthonyforan/Desktop/SoloAdventurer_app/`)
is where the product lives (matching, meetups, safety, reputation). See `docs/PRODUCT.md`.

> **Strategy source of truth — read `docs/FOUNDATIONS.md` first.** It is the product
> charter (the reframe, the AI spine, keep/refactor/dispose, guardrails, build
> sequence) and **supersedes any older "matching-app MVP" / "companion app" framing**.
> `docs/PRODUCT.md` is the narrative/user-flows; `docs/research/platform-playbook.md`
> is the 13-part research thesis. Every PR is auditable against FOUNDATIONS.

Next.js (App Router) + Supabase (SSR auth) + Tailwind CSS. Shares a Supabase
backend with the Flutter app at `/Users/anthonyforan/Desktop/SoloAdventurer_app/`
(sibling repo — **same Supabase project**: schema, RLS policies, and Edge
Functions are shared. **A schema/RLS/migration change here affects the mobile
app, and vice versa.** This repo's loop/verifier only sees this repo — it will
NOT catch a cross-app break. Cross-check the Flutter app before any migration or
RLS-policy change.)

## Stack

- Next.js (App Router) · React + TypeScript (strict) · Tailwind + Radix UI
- Supabase (auth, db, SSR via `@supabase/ssr`, Edge Functions, Realtime)
- Jest + React Testing Library (unit) · Cypress (E2E) · Framer Motion

## Commands

- Dev server: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint` (next lint / eslint)
- Typecheck: `npm run typecheck` (tsc --noEmit)
- Unit tests: `npm test` (jest) · watch: `npm run test:watch`
- E2E: `npm run e2e` (cypress)

## Architecture

```
src/
├── app/            # App Router: (auth), (main), api/, profile/, waitlist/
├── components/     # Reusable UI (ui/, layout/, features/, map/, ...)
├── constants/  contexts/  hooks/  lib/  services/  types/  styles/
├── middleware.ts   # Supabase SSR auth — protects routes
└── __tests__/      # Co-located unit tests
```

## Key patterns

- Supabase SSR auth via `middleware.ts` — protects routes, manages redirects
- Route groups: `(auth)` public, `(main)` authenticated
- Radix primitives + Tailwind (no CSS modules) · React Hook Form
- `react-simple-maps` for map visualizations

## Rules

- **Build to `docs/FOUNDATIONS.md`.** It is the charter; its guardrails (§6: no broadcast feed, no decorative AI, no ad model, no engagement-as-north-star) and the web's acquisition role (§3.5, §7) govern every feature decision.
- TypeScript strict. Type hints everywhere.
- Tailwind for styling — no CSS modules.
- Co-located tests in `__tests__/` next to the code they cover.
- Never commit directly to `main` — always a branch + PR.
- New behaviour needs a test that would fail without it.
- Conventional commits (`feat:` / `fix:` / `chore:` / `docs:` / `refactor:`).
- Husky + lint-staged run `eslint --fix` + `prettier --write` on commit — don't fight the formatter.
- Loop/automation state files live in `.claude/state/` and are **JSON only**.
- Regression baselines live in `.claude/state/baselines.json`. Today: **464 tests / 44 suites** (jest, green, 2026-06-14, after PRs #8–#13 merged). The verifier FAILs if `npm test` drops below this without an intentional, stated removal. Bump it up when new tests land.

## Definition of done

A task is not done until the `verifier` subagent returns PASS. Run it, fix its
findings, re-run until PASS. For routine work, append `/go` to your prompt —
it self-tests, simplifies, verifies, and ships the PR.

## Docs grounding (non-negotiable for third-party APIs)

Before writing code that touches Supabase, Next.js App Router/Server
Components/SSR, Stripe, or any SDK feature, WebFetch the CURRENT official docs.
Never trust memory for API signatures, RLS policy syntax, cookie/SSR behavior,
or SDK versions. Keep the exact URLs — they go in the PR under "Sources".

## Safety-sensitive areas — flag before editing

Auth (Supabase SSR sessions, RLS policies, middleware), payments (Stripe),
and anything in safety/moderation features. Surface the risk before changing.
