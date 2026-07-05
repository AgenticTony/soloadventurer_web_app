# Phase A — Lay the Spine (web)

> FOUNDATIONS §4, §9 (Phase A) · Repo: web · Safety-sensitive: **YES** (RLS reads)
> Status: queued after Phase 0.

## Goal

Web consumes the new L0/reputation tables (read-only) for public profile reputation, and scaffolds the public share-page foundation. The spine data is authored in mobile; web reads it.

## Scope

**IN:** read `member_reviews` / `reputation_score` on public profiles; scaffold public trip/profile/destination share pages.
**OUT:** outcome-trained matcher (mobile Phase B); web matching UI (web ≠ duplicate mobile, §3.5).
**Guardrails (§10):** shared-backend reads cross-checked; read-only.

## Stories

### Story A.1 — Read reputation/outcomes on public profiles [safety: true]

- [ ] Consume `member_reviews` / `reputation_score` on `/profile/[username]`
- [ ] RLS-verified read-only; expose only intended fields

### Story A.2 — Public share-page scaffolding

- [ ] Foundation for public trip / profile / destination share pages (Phase E fills SEO/content)
- [ ] Server-component shell + OG metadata hooks

## Definition of Done / Acceptance Criteria

- [ ] Public profile renders reputation from real outcomes
- [ ] Share-page scaffold present; RLS read-only verified
- [ ] `npm run lint` + `typecheck` clean; jest baseline not regressed

## Dependencies

Mobile Phase A (tables exist). Fills out in Phase D/E.
