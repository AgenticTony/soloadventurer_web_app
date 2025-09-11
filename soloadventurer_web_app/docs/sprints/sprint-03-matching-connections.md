# Sprint 03 — Matching & Connections (Web)
**Dates:** 2025-10-27 → 2025-11-14  
**Goal:** Implement AI-based traveler matching, wave consent system, and in-app notifications.  
**Outcome metric:** User can view matches, send/receive waves, accept connections, and get notified of events in real time.

---

## Scope (What's in)
- Matching service (date + interests overlap scoring)
- GraphQL Connections type + mutations
- UI for Matches page
- Wave → Mutual connection → Messaging unlock (stubbed)
- Notifications (in-app + email digest)

## Out of scope (defer)
- Messaging/chat implementation (Sprint 4)
- Feed integration
- Push notifications (mobile-only)

## Definition of Done (DoD)
- ✅ All tasks in this file checked off  
- ✅ Linked issues closed via PRs  
- ✅ Unit tests for match scoring ≥ 80%  
- ✅ E2E test: two users overlap → appear in matches → wave → mutual → notification received  
- ✅ Lint/format clean, typecheck passes  
- ✅ Performance: match query returns <500ms for 1k users in city

---

## Risks & Mitigations
- Matching performance with large datasets → use indexed queries + precomputed similarity
- Notification spam → rate limit waves & batch email digests
- Connection state race conditions → enforce unique Connection per user pair in DB

---

## Tasks

| ✔ | ID | Task | Owner | Issue | AC (Acceptance Criteria) | Notes |
|---|----|------|-------|-------|---------------------------|-------|
| [ ] | S3-T1 | GraphQL schema — `Connection` type | @dev1 | #301 | Fields: id, userA, userB, status(enum: none|waved|mutual|blocked) | Indexed by userA+userB |
| [ ] | S3-T2 | Mutations: `sendWave`, `acceptWave`, `declineWave` | @dev1 | #302 | Only one active connection per pair; validation included | Return updated status |
| [ ] | S3-T3 | Resolver: prevent duplicate waves | @dev1 | #303 | Sending wave to same user twice → error | Covered in unit test |
| [ ] | S3-T4 | Matching algorithm MVP | @dev2 | #304 | Overlap = date range + shared interests; ranked score | Jaccard index + weight |
| [ ] | S3-T5 | GraphQL query: `getMatches(userId)` | @dev2 | #305 | Returns ranked list of top 10 matches | Sorted by score |
| [ ] | S3-T6 | Matches UI (`/matches`) | @dev3 | #306 | Card list of suggested travelers with overlap % | Responsive grid |
| [ ] | S3-T7 | Wave button UI on traveler cards | @dev3 | #307 | Button changes to "Waved" after click; disables repeat | Toast feedback shown |
| [ ] | S3-T8 | Notification schema & resolvers | @dev4 | #308 | Events: waveReceived, waveAccepted, matchSuggested | Subscription enabled |
| [ ] | S3-T9 | In-app notifications dropdown | @dev4 | #309 | Bell icon with badge; list of events; mark-as-read | Polling fallback |
| [ ] | S3-T10 | Daily digest email (AWS SES + Lambda) | @dev2 | #310 | Sends email summary of new waves/matches | Opt-out toggle in settings |
| [ ] | S3-T11 | Cypress e2e — wave flow | @dev4 | #311 | Simulate 2 users: send wave → accept → verify mutual & notification | Headless run in CI |
| [ ] | S3-T12 | ADR-0003 — Matching algorithm decision | @arch | #312 | Document algorithm, weights, future AI plans | Commit to adr folder |

---

## Test Plan
- Unit: connection resolvers (status transitions, duplicate prevention)
- Unit: matching algorithm scoring logic
- Component: MatchCard, WaveButton, NotificationsDropdown
- E2E: overlap scenario → appears in matches; wave → mutual → notification visible

---

## Roll-forward Criteria
- If email digest (S3-T10) slips → still deliver in-app notifications; email moves to Sprint 4
- If match scoring incomplete → deliver simple overlap check (city + date), defer interest weighting

---

## Dependencies
- Sprint 02 trip management completed
- User interests data available
- AWS SES configured for email sending
- Real-time subscriptions working in AppSync

---

## Blocking Issues
- Performance optimization for matching algorithm
- Email template design and approval
- Real-time subscription testing infrastructure

---

## Retro Notes
*To be completed at sprint end*