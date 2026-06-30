# Phase C — Agent Layer (web)

> FOUNDATIONS §4 (L3), §9 (Phase C) · Repo: web · Safety-sensitive: NO (lead capture)
> Status: queued after Phase B.

## Goal

Web hosts the concierge **lead-capture** entry point — the top of the acquisition funnel that routes high-intent visitors to mobile install.

## Scope

**IN:** "where are you going?" lead-capture → teaser of verified people → install CTA.
**OUT:** concierge matching brain (mobile); guardian (mobile).
**Guardrails (§6):** no decorative AI; the concierge on web is acquisition-oriented, not a chatbot.

## Stories

### Story C.1 — Concierge lead-capture [needs_human: true]

- [ ] "Where are you going?" input → AI teaser of verified people in that city
- [ ] Install CTA routes to mobile (deep link)
- [ ] No real matches exposed to un-authenticated users (teaser only)

## Definition of Done / Acceptance Criteria

- [ ] Lead-capture flow live; converts to mobile install
- [ ] No PII / real matches leaked to anonymous visitors
- [ ] `npm run lint` + `typecheck` clean; jest baseline not regressed

## Dependencies

Mobile Phase C (concierge) + reputation data (Phase A).
