# Phase B — Close the Loop (web)

> FOUNDATIONS §9 (Phase B) · Repo: web · Safety-sensitive: NO
> Status: queued after Phase A.

## Goal

Web surfaces outcome-derived social proof and consumes the improved matcher only where it supports acquisition — keeping web light (not a duplicate of mobile).

## Scope

**IN:** social-proof displays from real outcomes; thin consume of improved matcher on discover.
**OUT:** heavy matching UI (mobile lane); agent surfaces (Phase C).
**Guardrails (§3.5):** web is acquisition; do not rebuild mobile's matching experience.

## Stories

### Story B.1 — Social proof on public surfaces

- [ ] "Vouched by N travelers", repeat-meetup signals, verified-human badge (read from outcomes)
- [ ] Renders only when backed by real outcome data (no fake counts — §6)

### Story B.2 — Thin matcher consume (discover)

- [ ] Discover surfaces use the improved RPCs where they aid acquisition
- [ ] Keep web matching minimal; no full match UI

## Definition of Done / Acceptance Criteria

- [ ] Social proof renders from real outcomes only
- [ ] No heavy matching UI added on web
- [ ] `npm run lint` + `typecheck` clean; jest baseline not regressed

## Dependencies

Mobile Phase A/B (outcomes + matcher).
