# Sprint 02 — Trips & Explore Map (Web)
**Dates:** 2025-10-06 → 2025-10-24  
**Goal:** Implement trip management (CRUD), connect trips to user profiles, and deliver the Explore Map with traveler clustering and filtering.  
**Outcome metric:** User can create trips, see other travelers with overlapping trips on a city map, and filter results by date and interests.

---

## Scope (What's in)
- GraphQL Trip type + resolvers
- Trip CRUD UI (list + form)
- Explore Map integration with Google Maps JS
- Traveler clustering & city-level queries
- Interest-based filters
- Right rail "Who's in your city this week" widget

## Out of scope (defer)
- Matching algorithm (Sprint 3)
- Messaging, waves
- Feed posts

## Definition of Done (DoD)
- ✅ All tasks in this file checked off  
- ✅ Linked issues closed via PRs  
- ✅ Unit tests for resolvers ≥ 80%  
- ✅ Cypress e2e test: create trip, see it appear on map, filter travelers  
- ✅ Lint/format clean, typecheck passes  
- ✅ Performance: map loads <2s with 100 travelers in city

---

## Risks & Mitigations
- Geolocation API quota → use Google Maps billing project, monitor quotas
- Over-fetching travelers → enforce date range + city filters in GraphQL
- UI performance with clusters → use marker clustering lib + pagination

---

## Tasks

| ✔ | ID | Task | Owner | Issue | AC (Acceptance Criteria) | Notes |
|---|----|------|-------|-------|---------------------------|-------|
| [ ] | S2-T1 | Extend GraphQL schema with `Trip` type | @dev1 | #201 | Schema has id, userId, city, country, startDate, endDate, interests[], visibility | Add migration for Aurora |
| [ ] | S2-T2 | Trip resolvers (CRUD) | @dev1 | #202 | Queries: getTrips(userId); Mutations: create/update/deleteTrip | Validations: date order |
| [ ] | S2-T3 | Generate TS types (codegen) for Trip | @dev1 | #203 | `npm run codegen` updates types; CI passes typecheck | Update models folder |
| [ ] | S2-T4 | Trip UI — list view (`/trips`) | @dev2 | #204 | Shows current user's trips, sorted by startDate | Responsive table/cards |
| [ ] | S2-T5 | Trip UI — form (create/edit) | @dev2 | #205 | Form with city, dates, interests[]; Zod validation | Integrates with resolvers |
| [ ] | S2-T6 | Explore Map — Google Maps JS integration | @dev3 | #206 | Map renders in `/map`; loads via API key env var | 100% Lighthouse perf |
| [ ] | S2-T7 | Traveler clustering markers | @dev3 | #207 | Cluster markers appear at city level; expand on zoom | Use @googlemaps/markerclusterer |
| [ ] | S2-T8 | Backend query — overlapping trips | @dev1 | #208 | Query returns travelers in same city with overlapping dates | Indexed on city + date |
| [ ] | S2-T9 | Filters — date & interest | @dev2 | #209 | UI filters apply to map query; travelers update live | Multi-select interests |
| [ ] | S2-T10 | Right rail widget — "Travelers in your city this week" | @dev3 | #210 | Shows top 5 travelers with avatars, wave button disabled (Sprint 3) | Subscribe to trip changes |
| [ ] | S2-T11 | Cypress e2e — create trip & see on map | @dev4 | #211 | Test covers trip creation → trip appears on map for user | Runs in CI |
| [ ] | S2-T12 | ADR-0002 — Decision on clustering lib | @arch | #212 | ADR merged with tradeoffs for marker clustering approach | Link to ARCHITECTURE.md |

---

## Test Plan
- Unit: trip resolvers (date validation, overlapping queries)
- Component: TripForm, TripList, Map component
- E2E: create trip, verify it appears on map; filter by interest/date

---

## Roll-forward Criteria
- If clustering (S2-T7) slips → still deliver basic map pins; cluster in Sprint 3
- If filters incomplete → deliver city/date filter, defer interests to Sprint 3

---

## Dependencies
- Sprint 01 authentication system completed
- Google Maps API key and billing setup
- Database schema deployed for Trip model
- AWS AppSync configured for GraphQL resolvers

---

## Blocking Issues
- Google Maps API key provisioning
- Database migration for Trip table
- Aurora indexing strategy for location queries

---

## Retro Notes
*To be completed at sprint end*