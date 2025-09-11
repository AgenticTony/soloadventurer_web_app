# Sprint 04 — Messaging & Feed (Web)
**Dates:** 2025-11-17 → 2025-12-05  
**Goal:** Deliver real-time messaging system and core feed functionality (posts + check-ins).  
**Outcome metric:** Users with a mutual connection can exchange real-time messages, see trip check-ins and posts in a feed, and interact (like/comment).

---

## Scope (What's in)
- Messaging (threads, messages, subscriptions)
- File uploads in chat (images)
- Feed with posts, trip check-ins, meetups
- Likes & comments
- Right rail: "Upcoming meetups in your city"
- Presence indicator (online/offline status)

## Out of scope (defer)
- Push notifications (mobile-only)
- Feed ranking algorithm (later phase)
- Advanced media types (video, audio in chat)

## Definition of Done (DoD)
- ✅ All tasks in this file checked off  
- ✅ Linked issues closed via PRs  
- ✅ Unit tests for resolvers ≥ 80%  
- ✅ E2E test: two users mutual → open chat → exchange messages in real time  
- ✅ Feed loads in <1s with 50 posts  
- ✅ Lighthouse perf ≥90 on feed page  

---

## Risks & Mitigations
- Real-time scale: mitigate with GraphQL subscriptions (AppSync) + Redis pub/sub fallback
- Media upload abuse: enforce size/type limits + AV scan lambda
- Feed complexity: start with chronological order; defer ranking to future sprint

---

## Tasks

| ✔ | ID | Task | Owner | Issue | AC (Acceptance Criteria) | Notes |
|---|----|------|-------|-------|---------------------------|-------|
| [ ] | S4-T1 | GraphQL schema — `Message` type | @dev1 | #401 | Fields: id, threadId, senderId, text/mediaRef, createdAt | Indexed by threadId |
| [ ] | S4-T2 | GraphQL schema — `Thread` type | @dev1 | #402 | Thread created on mutual connection; participants[ ] | Unique per pair |
| [ ] | S4-T3 | Message resolvers (CRUD + subscription) | @dev2 | #403 | `sendMessage`, `getMessages`, `onNewMessage` | Real-time via AppSync |
| [ ] | S4-T4 | Chat UI (`/messages`) | @dev3 | #404 | Sidebar with threads, chat window, scrollable history | Responsive layout |
| [ ] | S4-T5 | Chat input with text + image upload | @dev3 | #405 | Upload image → S3 → message with mediaRef | Limit 5MB; show thumbnail |
| [ ] | S4-T6 | Read receipts + typing indicator | @dev2 | #406 | SeenAt field; "User is typing" via subscription | Optional; Redis pub/sub |
| [ ] | S4-T7 | Feed schema — `Post` type | @dev1 | #407 | Fields: id, authorId, type(status|photo|meetup), content, createdAt | Link to Trip if check-in |
| [ ] | S4-T8 | Mutations: `createPost`, `likePost`, `commentPost` | @dev1 | #408 | Returns updated post with counts | Validation: max 280 chars for status |
| [ ] | S4-T9 | Feed UI (`/`) | @dev3 | #409 | Infinite scroll, chronological order | Skeleton loaders |
| [ ] | S4-T10 | Feed item: trip check-ins | @dev2 | #410 | Auto-post created when trip start date hits | Resolver + cron Lambda |
| [ ] | S4-T11 | Meetups in feed | @dev2 | #411 | Meetup posts with RSVP button | RSVP updates attendee list |
| [ ] | S4-T12 | Likes & comments UI | @dev3 | #412 | Like button toggles; comment input expands | Counts update live |
| [ ] | S4-T13 | Right rail widget — upcoming meetups | @dev4 | #413 | Shows next 5 meetups in user's city | Sorted by time |
| [ ] | S4-T14 | Presence tracking (online/offline) | @dev4 | #414 | Green dot on active users in chat | Tracked via Redis expiry |
| [ ] | S4-T15 | Cypress e2e — messaging flow | @dev4 | #415 | Mutual users → open thread → exchange 3 messages | Passes in CI |
| [ ] | S4-T16 | Cypress e2e — feed flow | @dev4 | #416 | Create post → appears in feed; like + comment → counts update | Passes in CI |
| [ ] | S4-T17 | ADR-0004 — Decision on presence tracking | @arch | #417 | Doc tradeoffs (Redis TTL vs AppSync presence API) | Commit to adr folder |

---

## Test Plan
- Unit: resolvers for messages, threads, posts
- Component: ChatWindow, FeedItem, CommentForm
- E2E: two users chat in real time; feed shows new post; like/comment update instantly

---

## Roll-forward Criteria
- If presence tracking (S4-T14) slips → deliver core chat without green dot; defer to Sprint 5
- If meetup RSVP incomplete → deliver basic post, defer RSVP logic to Sprint 5

---

## Dependencies
- Sprint 03 matching and connections completed
- AWS AppSync subscriptions configured
- Redis ElastiCache for presence tracking
- S3 bucket configured for media uploads
- Lambda functions for scheduled tasks

---

## Blocking Issues
- Real-time subscription performance testing
- Media upload security scanning
- Feed performance optimization with large datasets

---

## Retro Notes
*To be completed at sprint end*