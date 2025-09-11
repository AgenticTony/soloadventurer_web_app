# Sprint 01 — Foundations & Auth (Web)
**Dates:** 2025-09-15 → 2025-10-03  
**Goal:** Ship project scaffold, auth, basic profile setup, and CI/CD.  
**Outcome metric:** App boots on Amplify Hosting; user can sign up/sign in/out; profile stub saved; CI pipeline green.

## Scope (What's in)
- Next.js + TS app shell (Topbar/LeftNav/RightRail)
- Amplify + Cognito auth
- S3 uploads (avatars)
- CI/CD (GitHub Actions → Amplify Hosting)
- GraphQL codegen plumbing

## Out of scope (defer)
- Trips, Map, Matches, Messaging, Notifications

## Definition of Done (DoD)
- ✅ All tasks checked off in this file  
- ✅ Linked issues closed via PRs (`closes #123`)  
- ✅ Unit tests ≥ 80% for critical utilities, smoke e2e for auth  
- ✅ Lint/format clean; typecheck passes; Lighthouse ≥ 90 perf on shell  
- ✅ ADRs updated if new decisions made

## Risks & Mitigations
- Auth edge-cases (token refresh) → add cypress test for refresh flow
- Env secrets leakage → use SSM/Amplify envs, never .env in repo

---

## Tasks

| ✔ | ID | Task | Owner | Issue | AC (Acceptance Criteria) | Notes |
|---|----|------|-------|-------|---------------------------|-------|
| [ ] | S1-T1 | Init Next.js (TS), App Router, base layout | @dev1 | #101 | App boots locally; routes `/`, `/profile` render; no runtime errors | ESLint+Prettier configured |
| [ ] | S1-T2 | Tailwind + shadcn/ui setup | @dev1 | #102 | Components compile; dark/light tokens present | Button/Card demo page |
| [ ] | S1-T3 | Framer Motion baseline | @dev1 | #103 | Page transitions + skeleton loaders | Keep subtle; 60fps |
| [ ] | S1-T4 | Amplify init; Cognito user pool | @dev2 | #104 | Sign up/in/out works; tokens stored httpOnly | Social login toggled off (later) |
| [ ] | S1-T5 | Auth guard + session context | @dev2 | #105 | Protected routes redirect unauth users | Token refresh verified |
| [ ] | S1-T6 | Profile setup page + S3 avatar upload | @dev3 | #106 | Avatar uploads via presigned URLs; profile saved | 2MB limit, client compression |
| [ ] | S1-T7 | GraphQL codegen plumbing | @dev3 | #107 | `npm run codegen` generates TS types; CI validates drift | Schema stub committed |
| [ ] | S1-T8 | CI/CD pipeline | @dev4 | #108 | On PR: lint, test, typecheck; On main: deploy to Amplify | Status checks required |
| [ ] | S1-T9 | E2E smoke (auth) | @dev4 | #109 | Cypress: sign up/in/out happy path; artifact saved | Runs headless in CI |
| [ ] | S1-T10 | ADR-0001 (AppSync vs Apollo) | @arch | #110 | ADR merged with decision + tradeoffs | Linked from ARCHITECTURE.md |

> **How to check off:**  
> - Update this table in the PR that closes the Issue.  
> - Keep owner current; if pair-programming, list both.

---

## Test Plan
- Unit: util/date, auth helpers  
- Component: Topbar, ProfileForm  
- E2E: auth flow with email/password; avatar upload success/failure

## Roll-forward Criteria
- If S1-T6 or S1-T8 slip → they become Sprint 02 priority 0; reflect in master index

---

## Dependencies
- AWS account setup with Cognito user pool
- S3 bucket configured for media uploads
- GitHub repository with Amplify Hosting configured

---

## Blocking Issues
- None identified at sprint planning

---

## Retro Notes
*To be completed at sprint end*