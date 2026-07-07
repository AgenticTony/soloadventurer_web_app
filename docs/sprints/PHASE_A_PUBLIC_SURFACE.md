# Phase A (web) — Public Surface: Reputation Visible + The Viral Payload

> Source: `docs/EXECUTION_ORDER.md` step 10 + mobile `docs/reports/full-project-audit-2026-07-07.md` §7 · Repo: web · Safety-sensitive: **YES** (public exposure of user data — every story needs privacy review)
> **Purpose:** build the charter's actual web product — the public, SEO-indexable, OG-previewed front door (PRODUCT §8 "found and shared") — and surface `reputation_score` on it (execution-order step 10). This is simultaneously the **viral foundation**: every share page is an acquisition asset.
> **Audit finding this phase exists to fix:** the web app has NO public surface beyond the static landing (middleware walls everything); `/profile/[username]` is `'use client'` + auth-required — structurally invisible to search engines. **Step 10 cannot ship meaningfully until the page is public + server-rendered.**

## Goal

Anonymous visitors (and crawlers) can view a public profile with reputation, a public trip page, and a rich OG preview when either is shared — and every such page converts toward install.

## Stories

### Story A-web.1 — Public SSR profile page + reputation (execution-order step 10) [safety: true] [needs_human: true]

> Prerequisites: mobile Story 0.5 (profiles RLS repair) MERGED — public pages must ride the
> hardened projection, never the `USING (true)` hole. Mobile Story H.5's no-show dispute design
> signed off before negative signals surface publicly.

- [ ] Convert `/profile/[username]` to a server component: `createServerSupabaseClient` fetch of the **non-PII public projection** (Story 0.5's view/columns) — anonymous access allowed
- [ ] Un-wall the route: middleware allows anonymous `/profile/[username]` (keep `/profile` (own, editable) authed)
- [ ] Consume `reputation_score(user_id)` RPC: meetups completed, vouch %, review count — the PRODUCT §3 "reputation line" ("vouched for by 4 travelers") — decide with sign-off what is public vs authed-only (no-show count stays private until the dispute path exists)
- [ ] `generateMetadata`: per-profile title/description + OG image (dynamic OG via `next/og` — name, avatar, verified badge, reputation line)
- [ ] Privacy controls respected: `profile_privacy_settings` visibility gates what anonymous visitors see; a private profile renders a minimal "join to see" shell
- [ ] Cypress: anonymous visit renders profile + reputation server-side (view-source contains content); private profile leaks nothing

### Story A-web.2 — Public trip share pages + SEO plumbing [safety: true]

> The §7 client split: "public, photo-rich trip / destination / profile share pages with OG
> previews: the acquisition + SEO payload."

- [ ] Public `/trip/[id]` page for trips with `is_public = true` (server-rendered; owner name links to public profile; no precise live location — city-level only)
- [ ] `src/app/sitemap.ts` (public profiles + public trips + landing) and `robots.ts`
- [ ] Structured data (JSON-LD: Person on profiles, Trip/Event-ish on trips) on public pages
- [ ] Share actions on both pages firing `share_click` (Web Share API + copy-link fallback)
- [ ] Verify with Lighthouse/`next build` output: public pages are static/streamed SSR, not client-fetch shells

### Story A-web.3 — Install funnel goes live [needs_human: true]

> Audit: `install_click`/`share_click`/`referral_landing` are defined but NOTHING fires them —
> the landing's only CTAs are web signup. PRODUCT §8: "web sends the world to mobile."

- [ ] Install CTA block (store badges / "Get the app") on: landing hero, public profile, public trip page, post-signup screen — each firing `install_click` with surface context
- [ ] Smart app banner metadata (iOS `apple-itunes-app`, Android intent/app-links) — behind a config flag until store listings exist; waitlist CTA is the interim target 👤 (store links are Anthony's release train)
- [ ] `referral_landing` wired: `?ref=` param captured on public pages → PostHog + persisted for attribution
- [ ] Funnel dashboard: `$pageview → install_click (or waitlist_signup) → meetup_completed` visible end-to-end in the shared PostHog project

### Story A-web.4 — Viral loop 1 groundwork (pull-forward from Stage D) [safety: true] [needs_human: true]

> Execution order step 16 notes Loop 1 (trusted-contact check-in page) "can start earlier — it
> needs only the existing safety pillar." It is the strongest organic loop: every meetup shows
> the product to a non-user (the trusted contact). Groundwork only — full page ships in Stage D.

- [ ] Design doc + signed/expiring-link scheme for the trusted-contact check-in view (no PII beyond what the user explicitly shares; link TTL; revocation)
- [ ] Route + OG stub (`/checkin/[token]`) behind a feature flag — NOT enabled until mobile's contact-notification path (Story 0.4 fix) is live and the design is signed off

## Definition of Done / Acceptance Criteria

- [ ] Anonymous visitor + crawler get server-rendered public profile (with reputation) and public trip pages; view-source proves SSR
- [ ] OG preview renders correctly when a profile/trip link is pasted into a chat/social app
- [ ] sitemap.xml + robots.txt live; structured data validates
- [ ] `install_click` / `share_click` / `referral_landing` all firing with real UI attached; funnel dashboard live
- [ ] Zero PII on any public page (re-run the step-8 audit checklist against the new surfaces); privacy settings honored
- [ ] Cypress covers: anonymous profile view, private-profile shell, share action, install CTA

## Dependencies

**Hard:** web PHASE_W (build on Next 16); mobile Story 0.5 (RLS repair) for A-web.1/2; mobile H.5 dispute-design sign-off before public negative reputation.
**Soft:** store listings (A-web.3 full CTA) are Anthony's release train — waitlist interim.
This phase = execution-order steps 10 + 10b. Unblocks Stage B web (social proof) and Stage E (SEO city pages ride the same plumbing).
