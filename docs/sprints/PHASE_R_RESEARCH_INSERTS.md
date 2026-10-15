# Phase R — Research Inserts (cross-repo)

> Source: `docs/research/solo-travel-apps-research-summary.md` capping the four-doc competitive series (① desk · ② web bundles · ③ decoded binaries · ④ external-report comparison + GAFFL/NomadHer/Timeleft), retrieved 2026-10-11 · Repo: **both** (most stories mobile-lane; web stories noted) · Safety-sensitive: **varies per story (flagged `[safety: true] [needs_human: true]`)** · Status: **staged 2026-10-11; stories slot into existing phases — this doc is the story file, `EXECUTION_ORDER.md` Stage A+ governs order.**
> **Mirror rule:** EXECUTION_ORDER and the mobile-lane stories must be mirrored into the mobile repo (👤 Anthony) **before any Stage A+ step starts** — 10d's dependency makes the mirror a hard gate.

## Goal

Convert the competitive-research findings into scheduled work without reordering the §9 spine: (a) a **single-city density pilot** that breaks the Phase B "wait for meetup volume" deadlock, and (b) slot-in additions to existing phases, each evidence-backed.

## Scope

**IN:** the twelve stories below + the Stage A+ insert in `EXECUTION_ORDER.md`.
**OUT:** reordering Phases 0–E; anything the research *validated but didn't change* (the whole existing plan).
**Guardrails (§6):** none of these may introduce engagement metrics, broadcast feeds, attendee-side paywalls, or charges for basic connection. Gamification stays banned — reputation is the only game.

---

## Part 1 — Stage A+ stories (the density pilot)

### Story R.1 — City/geo data source [MOBILE · backend]

Import a GeoNames-class city dataset (~150k cities: name, country, admin1, lat/lon, population) into a `cities` table, PostGIS-indexed; backfill `trips.destination_city` from trip destinations; wire the deferred north-star **city cohort**.

- **Why:** EXECUTION_ORDER step 9 deferred the city cohort because "no city source exists" (`trips.destination_city` is a dead column). The research made this the single most expensive open deferral — presence (R.2), events (R.3/R.4), and city analytics all sit on it.
- **Done when:**
  - [ ] `cities` table + migration shipped (shared Supabase project — mobile-lane migration, cross-checked against web typed consumers per the §10 seam rule)
  - [ ] `trips.destination_city` backfilled for existing trips
  - [ ] the step-9 city cohort ships
  - [ ] pgTAP coverage on the backfill
- **Est:** 2–3 d.

### Story R.2 — Real-time presence ("free tonight") [MOBILE] [safety: true] [needs_human: true]

Time-boxed openness signal on the city board: "free tonight / this afternoon + intent" (dinner, drinks, walking…), auto-expires at the window's end, one-tap off, discoverable only within the user's visibility settings. Guardian-aware: the guardian's risk context renders alongside (public-place suggestions).

- **Why (competitive urgency):** Hostelworld shipped its version — the "Hang out" badge, tagged "New!" (research ③ §3.4). Ours differentiates on the dimensions the incumbent's standing badge lacks: **time-boxed** (decays instead of noise), **intent-bearing** (matches the brain), **guardian-contexted**.
- **Design rules (from the Couchsurfing Hangouts teardown, research ① §4.2):** approximate proximity only, never exact coordinates; expiry enforced server-side (expired intents invisible); user always knows when they are visible.
- **Done when:**
  - [ ] presence signal with intent + expiry shipped behind visibility settings
  - [ ] server-side expiry proven (expired intents invisible in queries + realtime)
  - [ ] approximate-proximity disclosure reviewed (no exact coordinates leave the device)
  - [ ] one-tap "stop being visible" control tested
  - [ ] 👤 visibility/privacy sign-off recorded
- **Est:** ~1 wk.

### Story R.3 — City hosts + recurring events substrate [BOTH] [safety: true] [needs_human: true]

The Gatherings anatomy (research ③ §3.3) as our object model: **event + chat + participants + join + post-join + review + report**, group-scoped. City hosts are volunteer organizers (Wanderful chapter model) with organizer tooling; events are venue-anchored, recurring-capable, capacity-limited. City cohorts are **time-boxed and archive** (ephemerality — research ③ §3.1's "chats disappear" lesson adapted: density decays, reputation persists).

- **Explicitly out:** attendee-side charges for ordinary events (organizer-pays tooling is the Meetup-sanctioned model, later); ticketing/payments (Phase E at the earliest).
- **Done when:**
  - [ ] event + participants + chat-room object model shipped with capacity limits enforced transactionally
  - [ ] join → post-join → review → report flows wired end-to-end
  - [ ] host role + organizer tooling (create/update/cancel + notify participants) shipped
  - [ ] time-boxed cohort archiving proven (archive ≠ delete; reputation persists)
  - [ ] 👤 moderation/report sign-off for the event surface
- **Est:** 2–3 wk.

### Story R.4 — Public events directory pages [WEB] [safety: true] [needs_human: true]

Geo-hierarchical, indexable city/event pages on the web funnel — the Hostelworld `/events/:continent/:country/:city/:eventId` blueprint (research ② §2.2, 28 locales) at pilot scale: one city, real events only.

- **Guardrails:** no fake or templated events; pages must render from real `events` data (§6; the thin-programmatic-pages warning in EXECUTION_ORDER step 17 applies).
- **Done when:**
  - [ ] city/event pages server-rendered from live `events` data (no template filler)
  - [ ] 👤 privacy review: no participant PII on public pages without explicit consent
- **Est:** ~1 wk.

**Pilot discipline (Stage A+ exit):** one city (👤 decision), real users only; instrument plans created → accepted connections → event attendance → repeat (PostHog, R.10 flags). Exit = enough completed-meetup volume to justify starting Phase B (step 11).

---

## Part 2 — Slot-in additions (existing phases)

### Story R.5 — Verification ladder [MOBILE · Phase D slot] [safety: true] [needs_human: true]

Instant **selfie tier** ("Traveler-verified") below full Shufti ID: minutes-to-convert at signup; full ID remains the gate for women-only mode, meetups, and reputation actions.

- **Evidence:** all four decoded competitors ladder verification and none automate it (GAFFL social→manual ID; Tourlina admin selfie; NomadHer doc+selfie; Hostelworld photo+DOB) — research ③④.
- **Done when:**
  - [ ] selfie tier live ("Traveler-verified"); full Shufti ID unchanged as the trust gate
  - [ ] each tier's unlocked surface documented + 👤 gating-policy sign-off (decision #3)
- **Est:** ~1 wk on top of the Shufti flow (selfie capture + review state already exist from PR #31).

### Story R.6 — Pre-meetup in-app calls [MOBILE · Phase C/D slot] [safety: true] [needs_human: true]

Voice/video calls inside the app before meeting IRL — pre-screening as a safety feature (guardian-adjacent: the call happens inside the trust perimeter).

- **Evidence:** validated twice (Tourlina binary: call notifications + video icon, research ③ §2.3; BFF Groups video calls, research ①).
- **👤 Decision — build vs buy:** recommendation **buy** (Sendbird Calls / Stream / Daily-class). Precedent: Hostelworld runs group chat on Sendbird (research ②) — incumbents buy transport and spend dev on the moat. Our guardian wrapping the call is the moat.
- **Done when:**
  - [ ] 👤 build-vs-buy decision recorded (decision #2)
  - [ ] calls shipped in-app with guardian context (never a link out to third-party calling)
- **Est:** days if bought; months if built. **Blocked on the decision.**

### Story R.7 — Concierge EU/GDPR compliance gate [BOTH · **immediate — do not wait for Phase C**] [safety: true] [needs_human: true]

Design sprint + implementation gate: consent basis, transparency, and opt-out for AI-drafted messages generated from profile data, on both the mobile concierge and the web lead-capture teaser.

- **Evidence:** noyb's June 2025 GDPR complaint against Bumble's AI icebreakers targets the same design family (research ① §4.6, ④ §1.4).
- **🚨 Elevation (2026-10-11 review):** the web funnel is **already live with EU users today**. This story is therefore **immediate**, not Phase C-gated.
- **Interim guard (active now, until this story closes):** **no AI-drafted or profile-derived messaging may ship on any surface — including the live web funnel.** Static copy is fine; anything generated from user/profile data is not.
- **Done when:**
  - [ ] consent basis + transparency + opt-out design approved (👤 + legal review)
  - [ ] gate implemented on every surface that could render AI-drafted/profile-derived text
  - [ ] interim guard lifted only at 👤 sign-off
- **Est:** 2–3 d design + per-surface implementation.

### Story R.8 — Emergency-dispatch partnership tier [MOBILE · Phase D/E] [safety: true] [needs_human: true]

Professional 24/7 dispatch (Noonlight-class API/partnership) as a paid guardian feature: SOS escalates from "alert trusted contacts" to "a certified human is dispatched."

- **Evidence:** Noonlight's model — consumer freemium + B2B2C dispatch API (research ① §4.11). Strongest possible safety claim; monetizes the guardian without touching basic connection.
- **Done when:**
  - [ ] partner selected + 👤 contract/disclaimer review (an alarm is never a guaranteed emergency response)
  - [ ] dispatch tier live behind the guardian surface
- **Est:** partnership-dependent; scope after Phase D.

### Story R.9 — APM fill (Sentry-class) [BOTH · immediate small story]

Error tracking/APM on both apps. Every decoded competitor runs it (Sentry visible in Hostelworld and NomadHer bundles); we have nothing watching prod errors post-launch — PHASE_H's error spine is client-side and repo-level.

- **Done when:**
  - [ ] Sentry (or equivalent) wired on web + mobile with source maps/symbols
- **Est:** ~1 d. Do before real users.

### Story R.10 — PostHog feature flags + experiments [BOTH · with Stage A+]

Enable the already-paid-for PostHog flags/experiments and wire the density pilot's A/B surfaces: presence-signal variants, event formats, and (Phase B+) **no-show penalty tests run as experiments with controls** — the Timeleft precedent (`NO_SHOW_US_PENALTY_TEST_ID`, research ④ §4).

- **Done when:**
  - [ ] flags/experiments enabled + first pilot experiment defined with a control group
- **Est:** ~1 d setup + per-experiment wiring.

### Story R.11 — RevenueCat evaluation [MOBILE · deferred note]

Evaluate RevenueCat when the pricing ladder is built (one-time travel pass + subscription hybrid). Evidence: Tourlina runs Google Play **and Amazon** billing through one RC integration (research ③). Not needed while the current native paywall suffices. **No action now.** (No DoD checkboxes — decision note only.)

### Story R.12 — Marketing positioning updates [docs/marketing · now]

CLAIMS.md + CAMPAIGN_PLAYBOOK: name **NomadHer** (not Tourlina) as the trust-axis incumbent — they held women-only manually; we automate; add the counter-position claim **"no chat limits, no ads, ever"** (every competitor taxes connection — research summary §lesson 2); verify each new claim against the claims-vs-reality table before it ships.

- **Done when:**
  - [ ] CLAIMS.md updated + each new claim verified against the claims-vs-reality table
- **Est:** hours; docs-only.

---

## Decisions needed (👤 Anthony) — everything else is path-clear

| # | Decision | Recommendation | Needed by |
|---|---|---|---|
| 1 | Cold-start city + pilot start date | After step 10, parallel with Stage B prep; a city where you have reach | Before Stage A+ kickoff |
| 2 | Calls: build vs buy | **Buy** (Sendbird Calls / Stream / Daily) | Before R.6 scoping |
| 3 | Verification ladder gating policy | Selfie = visible/matchable; full ID = women-only + meetups + reputation actions | Before R.5 build |
| 4 | Pricing shape (directional) | Hybrid: one-time travel pass + subscription (Social Pass evidence: €4.99/wk → €59.99/yr) | Phase D/E pricing work |
| 5 | CLAIMS.md positioning update timing | Now (docs-only, fast) | Anytime |

## What the research explicitly did NOT change

The phase spine (0→A→B→C→D→E), the no-feed/no-ads/outcomes-not-engagement charter, Supabase/Flutter/pgvector/Shufti/Mapbox stack, the mobile-builds/web-consumes rule, and every open Phase 0/H/W blocker — the research *validated* all of them (summary §7). No engagement gamification, no broadcast UGC, no attendee-side paywalls, no women-only dilution — ever (summary §"Never copy").
