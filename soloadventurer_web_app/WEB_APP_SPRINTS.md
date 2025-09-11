# WEB_APP_SPRINTS.md

**SoloAdventurer – Web Application**
**Master Sprint Index** (MVP Phase)

> **Note**: This is the master sprint index. For detailed task breakdowns, see individual sprint files linked below.

---

## 📌 Sprint 1 — Foundations & Authentication

### Epic: Project Setup

* [ ] Initialize **Next.js (TypeScript)** project with App Router.
* [ ] Configure **TailwindCSS + shadcn/ui**.
* [ ] Add **Framer Motion** for animations.
* [ ] Create base layout (Topbar, LeftNav, RightRail).
* [ ] Configure **ESLint + Prettier** for code quality.
* [ ] Setup **GitHub Actions CI/CD** with Amplify Hosting.

### Epic: Authentication & Profiles

* [ ] Integrate **AWS Amplify Auth** with Cognito user pool.
* [ ] Implement sign up / sign in / sign out flows.
* [ ] Implement **JWT token storage** (httpOnly cookie or secure local storage).
* [ ] Create `/profile/setup` page for new users (bio, avatar upload, interests).
* [ ] Connect to **S3 for media uploads** (Amplify Storage with presigned URLs).
* [ ] Display basic user info in Topbar dropdown.

### Epic: Developer Tools

* [ ] Add **storybook or Ladle** for component previews.
* [ ] Setup **GraphQL codegen** to generate TS types from schema.
* [ ] Mock API with AppSync local resolver or Apollo test server.

---

## 📌 Sprint 2 — Trips & Explore Map

### Epic: Trips Management

* [ ] GraphQL schema: `Trip` type (id, userId, city, country, startDate, endDate, interests, visibility).
* [ ] Backend resolvers for CRUD (Create, Read, Update, Delete) trips.
* [ ] UI pages: `/trips` (list + add/edit form).
* [ ] Client-side form validation (React Hook Form + Zod).
* [ ] Connect trip list to current user via GraphQL query.

### Epic: Explore Map

* [ ] Integrate **Google Maps JavaScript API**.
* [ ] Traveler clustering markers by city.
* [ ] Filter travelers by date overlap (current or upcoming trips).
* [ ] UI: right rail "Who's in your city this week" widget.
* [ ] Backend resolver: query trips by city + overlapping date range.

### Epic: Interests Filtering

* [ ] Extend GraphQL `User` type with `interests[]`.
* [ ] Add filter dropdowns (interests, gender, verification tier).
* [ ] Combine filters with map query.

---

## 📌 Sprint 3 — Matching & Connections

### Epic: AI Matchmaker (MVP version)

* [ ] Implement server-side overlap scoring algorithm:
  * Date overlap score.
  * Shared interests similarity (Jaccard index).
  * Profile completion weight.
* [ ] GraphQL mutation: `getMatches(userId)` returns top 10 ranked users.
* [ ] Client UI: `/matches` page with traveler cards.

### Epic: Wave & Consent System

* [ ] GraphQL `Connection` type (id, userA, userB, status).
* [ ] Mutations: `sendWave`, `acceptWave`, `declineWave`.
* [ ] UI: "Wave" button on traveler cards.
* [ ] Connection status displayed on profile previews.
* [ ] Notifications: push toast + bell icon badge for new wave.

### Epic: Notifications System

* [ ] GraphQL subscription: listen for new waves, matches.
* [ ] In-app notifications dropdown.
* [ ] Daily digest email via SES (AWS Lambda scheduled).

---

## 📌 Sprint 4 — Messaging & Feed

### Epic: Messaging

* [ ] GraphQL `Message` type (id, threadId, senderId, text/mediaRef, createdAt).
* [ ] Subscriptions for new messages (per thread).
* [ ] UI: `/messages` with sidebar thread list + chat window.
* [ ] Input with text + media (image/file → upload to S3).
* [ ] Read receipts & "user is typing" (optional via Redis pub/sub).

### Epic: Feed

* [ ] GraphQL `Post` type (status, photo, meetup).
* [ ] Mutations: `createPost`, `likePost`, `commentPost`.
* [ ] Feed page `/` with infinite scroll (paginated GraphQL query).
* [ ] Show trip check-ins as posts (auto-generated from Trip start date).
* [ ] Right rail widget: "Upcoming meetups in your city".

### Epic: Realtime Presence

* [ ] Track online/offline state in Redis.
* [ ] Subscription: show green dot on active users in chat.

---

## 📌 Sprint 5 — Safety, Moderation & Scaling Prep

### Epic: Safety Features

* [ ] GraphQL `Report` type (reporterId, targetId, reason, severity).
* [ ] UI: Report button on profiles, posts, messages.
* [ ] Block user mutation.
* [ ] ID verification integration (stub for AWS Rekognition / 3rd party).
* [ ] Display verification badge in profile UI.

### Epic: Moderation Tools

* [ ] Admin dashboard `/admin/reports`.
* [ ] Filter reports by severity/date.
* [ ] Moderator actions: ban user, delete post.

### Epic: Scaling & Perf

* [ ] Implement **Redis cache layer** for hot queries (likes, counts).
* [ ] Add **CloudFront CDN** in front of S3 media.
* [ ] Load testing with k6 (simulate 10k concurrent users).
* [ ] Optimize GraphQL resolvers with dataloaders.
* [ ] Set up CloudWatch alarms for latency/error metrics.

---

## 📌 Sprint 6 (Optional) — Polish & Internationalization

* [ ] Implement i18n (react-i18next) with English + test second language.
* [ ] UI/UX polish (accessibility audit, ARIA roles, keyboard nav).
* [ ] Add skeleton loaders + micro animations for smoother UX.
* [ ] Dark mode support (Tailwind theme switch).
* [ ] SEO optimization for landing/profile pages.

---

## 🔧 Developer Notes

* **Run lint/format before commits:** `npm run lint && npm run format`.
* **GraphQL schema-first dev:** always update schema → regenerate types → update resolvers.
* **Use feature branches** (`feature/trips-map`) → PR → code review before merge.
* **Test coverage goal:** ≥80% for backend resolvers & critical UI flows.
* **Security:** never expose AWS keys in code; use Amplify/SSM for env vars.

---

## 📊 Sprint Timeline & Dependencies

| Sprint | Duration | Key Dependencies | Critical Path |
|--------|----------|------------------|---------------|
| 1 | 4 weeks | AWS account setup, Cognito config | Authentication flow |
| 2 | 5 weeks | Google Maps API key, database schema | Trip management |
| 3 | 5 weeks | User data, interests data | Matching algorithm |
| 4 | 6 weeks | Realtime infrastructure (Redis, subscriptions) | Messaging system |
| 5 | 4 weeks | Monitoring setup, moderation workflows | Safety features |

---

## 🎯 Success Metrics

### Sprint 1
- [ ] User can sign up and complete profile setup
- [ ] Authentication flow works across all pages
- [ ] Basic layout is responsive and accessible

### Sprint 2
- [ ] Users can create and manage trips
- [ ] Map displays travelers with clustering
- [ ] Filters work for interests and dates

### Sprint 3
- [ ] Matching algorithm returns relevant users
- [ ] Wave system works bidirectionally
- [ ] Notifications display in real-time

### Sprint 4
- [ ] Messaging works between matched users
- [ ] Feed displays posts with infinite scroll
- [ ] Realtime presence indicators work

### Sprint 5
- [ ] Safety features (report, block) work
- [ ] Admin can moderate content
- [ ] System handles 10k concurrent users

---

## 🚀 Next Steps

1. **Infrastructure Setup**: Configure AWS services (Cognito, AppSync, S3, Lambda)
2. **Database Schema**: Finalize GraphQL schema and database design
3. **Developer Environment**: Set up local development environment
4. **CI/CD Pipeline**: Configure GitHub Actions with Amplify Hosting
5. **Testing Strategy**: Implement unit, integration, and E2E tests

---

This sprint plan ensures **developers know exactly what to build, in what order, and how it ties into the system architecture**.