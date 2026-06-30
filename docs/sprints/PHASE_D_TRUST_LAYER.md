# Phase D — Trust Layer (web)

> FOUNDATIONS §4 (L4), §9 (Phase D) · Repo: web · Safety-sensitive: YES (public trust display)
> Status: queued after Phase C.

## Goal

Web makes trust visible publicly — reputation + verified-human on public profiles, and rich OG share previews that make shares convert.

## Scope

**IN:** reputation + verified badges on public profiles; OG image previews for share pages.
**OUT:** scam detection (mobile); memory (mobile).
**Guardrails (§7):** photos shown are provenance-verified real captures; "verified human" is first-class.

## Stories

### Story D.1 — Reputation + verified-human on public profiles [safety: true]

- [ ] Reputation badges, vouch count, verified status on `/profile/[username]`
- [ ] Only signals backed by real data (§6 — no synthetic proof)

### Story D.2 — OG share previews

- [ ] Rich Open-Graph image previews for trip / profile / destination share pages
- [ ] Previews render the trust signals (the share payload, Part 3.12)

## Definition of Done / Acceptance Criteria

- [ ] Public profiles show verified reputation
- [ ] OG previews render correctly (iMessage/Slack/X check)
- [ ] `npm run lint` + `typecheck` clean; jest baseline not regressed

## Dependencies

Mobile Phase A/D (reputation data).
