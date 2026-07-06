# Web Analytics & Acquisition Funnel — v0.1

> Status: **Active** · Story: Phase 0 / 0.1 (`docs/sprints/PHASE_0_BLOCKERS.md`) · execution-order step 6.
> Authority: `docs/FOUNDATIONS.md` §6 (no engagement proxy as a north star) + §3.5 (web = acquisition surface).
> Companion: the mobile repo's `docs/analytics-v0.1.md` (which locks the north-star). Same PostHog project.

## Provider (decided 2026-07-06)

**PostHog** — `posthog-js`, **EU Cloud** (`https://eu.i.posthog.com`), env-configured
(`NEXT_PUBLIC_POSTHOG_KEY` / `NEXT_PUBLIC_POSTHOG_HOST`). **Same PostHog project as
the mobile app** — that is the whole point of step 6's dependency on step 5: web
and app report into one project so PostHog stitches the full funnel across surfaces.

## The funnel

`visit → install → **meetup_completed**`

- The **web owns the top**: `$pageview` (visit), `install_click` (app-store CTA),
  `share_click`, `referral_landing`, `waitlist_signup`. See `src/lib/analytics/events.ts`.
- The **north-star is emitted by the app/backend** — `meetup_completed`, sourced from
  `meetup_outcomes.outcome = 'completed'` (mobile repo). The web never fabricates it;
  PostHog joins the web's top-of-funnel to the app's north-star by person.
- **D1/D7/D30 retention** is a PostHog dashboard insight (config, not code).

## Privacy / consent (GDPR — hard rule)

- **Opt-in only.** PostHog is initialized with `opt_out_capturing_by_default: true`
  and `capture_pageview: false` — **nothing is captured until the visitor clicks
  Accept** on the consent banner (`opt_in_capturing()`). Decline → `opt_out_capturing()`.
- PostHog persists the decision in its own cookie (the source of truth); the
  `AnalyticsContext` + `track()` wrapper also short-circuit before consent (defense
  in depth), so no event fires while consent is absent.
- **No PII.** `sanitize_properties` scrubs email/name/phone/etc.; events carry only
  pseudonymous ids + non-PII funnel props.

## NEVER inputs to a north-star (FOUNDATIONS §6)

Session length · scrolls · impressions · DAU · time-on-page. Acquisition events are
diagnostic; the north-star is a real-world outcome (a completed meetup).

## Deferred (follow-ups)

1. Wire `install_click` / `share_click` / `referral_landing` into the actual landing /
   share CTAs as those surfaces are built (event helpers + gate are ready now).
2. Configure the PostHog cross-surface funnel + D1/D7/D30 retention insights (dashboard).
3. Proxy PostHog ingestion via a Next.js rewrite (`/ingest`) to reduce ad-block loss —
   optional hardening.
