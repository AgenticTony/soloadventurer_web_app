# Sprint 05 — Safety, Moderation & Scaling (Web)
**Dates:** 2025-12-08 → 2025-12-19  
**Goal:** Implement core safety tools (reporting, blocking, verification), moderation dashboard, and prepare infrastructure for scale.  
**Outcome metric:** Users can report/block content, moderators can review reports, and the app can handle 10k concurrent users with CDN + caching.

---

## Scope (What's in)
- Reporting & blocking system
- ID verification badges
- Admin/moderator dashboard
- Redis caching for hot queries
- CDN (CloudFront) for S3 media
- Load & performance testing
- Observability (logging, metrics, alerts)

## Out of scope (defer)
- Full ML-powered abuse detection (future)
- End-to-end encryption for chat (future)
- Multi-language (Sprint 6+)

## Definition of Done (DoD)
- ✅ All tasks in this file checked off  
- ✅ Linked issues closed via PRs  
- ✅ Reports flow end-to-end (user → report → moderator dashboard → resolved)  
- ✅ ID verification tier visible in profile  
- ✅ Load test simulating 10k concurrent users passes with p95 < 1s  
- ✅ CloudWatch alarms configured for API latency/error rate  

---

## Risks & Mitigations
- Abuse of reporting system → add rate limiting + severity tagging
- ID verification vendor integration delays → stub with manual upload + badge toggle
- Scaling complexity → focus on read-heavy optimizations (Redis, CDN) first

---

## Tasks

| ✔ | ID | Task | Owner | Issue | AC (Acceptance Criteria) | Notes |
|---|----|------|-------|-------|---------------------------|-------|
| [ ] | S5-T1 | GraphQL schema — `Report` type | @dev1 | #501 | Fields: id, reporterId, targetId(post/user), reason, severity, status | Indexed by reporter+target |
| [ ] | S5-T2 | Resolver: `createReport` mutation | @dev1 | #502 | Creates report, sets status=pending | Auth required |
| [ ] | S5-T3 | Resolver: `blockUser` mutation | @dev2 | #503 | Prevents userA seeing/contacting userB | Update Connection status=blocked |
| [ ] | S5-T4 | Report UI — "Report" button on posts/profiles/messages | @dev3 | #504 | Opens modal with reason dropdown | Toast feedback on submit |
| [ ] | S5-T5 | Block UI — "Block" button in profile/actions menu | @dev3 | #505 | Blocks connection + hides user from queries | Confirmation dialog |
| [ ] | S5-T6 | Verification schema & resolver | @dev2 | #506 | User.verificationLevel (none|basic|idVerified) | Mutation to upgrade tier |
| [ ] | S5-T7 | Verification UI (badge system) | @dev3 | #507 | Badge displayed on profile cards & matches | Tooltip: "ID verified" |
| [ ] | S5-T8 | Moderator dashboard (`/admin/reports`) | @dev4 | #508 | Table of reports, filter by severity/date | Requires admin role |
| [ ] | S5-T9 | Moderator actions (ban/delete) | @dev4 | #509 | Ban user disables login; delete post removes from feed | Logged to audit table |
| [ ] | S5-T10 | Redis caching layer (likes/comments counters) | @dev1 | #510 | Counters cached in Redis; fall back to Aurora | Invalidate on mutation |
| [ ] | S5-T11 | CloudFront CDN for S3 media | @dev2 | #511 | Media served via CDN URL; cache-control headers set | Verify fast loads globally |
| [ ] | S5-T12 | Load testing with k6 | @dev4 | #512 | Simulate 10k concurrent users; p95 latency <1s | Script committed to /tests/load |
| [ ] | S5-T13 | Observability: structured logs (pino), CloudWatch alarms | @dev1 | #513 | Alarms: API latency >1s, error rate >5% | Alerts to Slack/email |
| [ ] | S5-T14 | ADR-0005 — Safety & moderation architecture | @arch | #514 | Document tradeoffs (manual vs automated, scaling) | Commit to /docs/adr |

---

## Test Plan
- Unit: report/block resolvers, cache invalidation
- Component: ReportModal, Badge, AdminDashboard
- E2E: user reports → moderator sees → bans user; block hides user
- Load: k6 simulation, verify metrics in CloudWatch

---

## Roll-forward Criteria
- If verification system (S5-T6/7) slips → ship with placeholder badge; real vendor integration in Sprint 6
- If load test fails → optimize with Redis read-through + add Aurora read replica before Sprint 6

---

## Dependencies
- All previous sprints completed
- Redis ElastiCache cluster configured
- CloudFront distribution set up
- CloudWatch alarms configured
- k6 testing environment ready

---

## Blocking Issues
- ID verification vendor selection and integration
- Moderation workflow approval
- Load testing infrastructure setup
- Performance baseline establishment

---

## Retro Notes
*To be completed at sprint end*