# Phase E — Scale (web) — web's largest phase

> FOUNDATIONS §9 (Phase E), §3, §9.13 · Repo: web · Safety-sensitive: varies
> Status: queued after Phase D. This is where web earns its keep: the SEO + referral acquisition engine.

## Goal

Turn web into the acquisition engine: indexable destination/city intent pages that capture search demand, a referral landing surface, and public trip share pages — all funneling to mobile install.

## Scope

**IN:** SEO content engine (destination/city pages); referral landing; indexable public share pages.
**OUT:** the product loop (mobile).
**Guardrails (§3, §9.13):** search is the founder-accessible discovery primitive; content loop + SEO loop are web-only growth mechanics mobile cannot run.

## Stories

### Story E.1 — SEO content engine [needs_human: true]

- [ ] Destination/city intent pages ("solo travel in Lisbon", "meet travelers in Bangkok")
- [ ] Indexable, server-rendered, ranking-oriented; funnel to install
- [ ] Content grounded in real trip/destination data (no fabricated pages)

### Story E.2 — Referral landing [needs_human: true]

- [ ] The referral loop's conversion surface (Part 3.14)
- [ ] Status/utility reward framing, not cash (§3)

### Story E.3 — Indexable public trip share pages

- [ ] Public trip pages rank and capture intent (content loop, Part 3.16)
- [ ] Privacy-first: only public trips indexed

## Definition of Done / Acceptance Criteria

- [ ] SEO pages live + indexable; ranking tracked
- [ ] Referral landing converts
- [ ] Public trip pages indexable, privacy-safe
- [ ] `npm run lint` + `typecheck` clean; jest baseline not regressed

## Dependencies

Phases A–D (reputation + share foundation). Ongoing/content-driven.
