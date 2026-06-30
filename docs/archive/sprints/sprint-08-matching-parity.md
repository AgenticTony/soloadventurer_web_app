# Sprint 8: Matching Parity + Typing Indicators

**SoloAdventurer Web App - Sprint 8**
**Duration**: 2-3 weeks
**Status**: 🔄 In Progress
**Dependencies**: Sprint 7 (Matching & Connections — complete)

---

## Sprint Goal

Upgrade the web matching system to match the mobile app's production implementation: semantic AI matching via edge functions, 5-factor composite scoring, validated connection requests via edge functions, and real-time typing indicators in chat.

---

## Why This Sprint Exists

Sprint 7 delivered functional matching using client-side geographic overlap computation. The mobile app uses a far more sophisticated system:

- **5-factor composite scoring** with pgvector embeddings (40% semantic, 25% date overlap, 15% activities, 10% destination, 10% age)
- **Edge functions** for connection validation, notifications, and initial chat creation
- **Fallback mechanism** from semantic → geographic matching
- **Typing indicators** via Supabase Realtime

The edge functions and RPC functions already exist in Supabase (deployed from the mobile app). The web just needs to call them.

---

## Mobile App Reference

### Edge Functions (Already Deployed)

| Function                          | Purpose                                                |
| --------------------------------- | ------------------------------------------------------ |
| `find-potential-matches-semantic` | AI-powered composite matching (params: user_id, limit) |
| `find-overlapping-trips`          | Geographic fallback matching                           |
| `request-connection`              | Validated connection request with notifications        |
| `respond-connection`              | Accept/decline with chat creation on accept            |

### Composite Scoring Weights

```
semantic:     0.40  (pgvector cosine similarity on profile embeddings)
date_overlap: 0.25  (percentage of trip dates that overlap)
activities:   0.15  (Jaccard similarity on shared activities)
destination:  0.10  (country match + exact destination match)
age:          0.10  (proximity in predefined age ranges)
```

### Mobile App Fallback Flow

1. Try `find-potential-matches-semantic` edge function
2. If it fails or returns invalid data → fall back to `find-overlapping-trips` RPC
3. If RPC also fails → fall back to local client-side computation (current Sprint 7 code)

---

## Epic Breakdown

### Epic 1: Semantic Matching Integration ✅

Replace client-side match computation with the production edge function.

#### Tasks:

- [x] **Create Supabase edge function invoker utility**
  - [x] Add `invokeEdgeFunction(name, params)` helper to `src/lib/supabase/client.ts`
  - [x] Handle auth headers, error responses, timeout
  - [x] Retry logic with exponential backoff (5xx only, not 4xx)
  - [x] Safe SDK-agnostic error extraction via `Record<string, unknown>` traversal
  - [x] **Test:** Invokes `find-potential-matches-semantic`, falls back gracefully when unavailable

- [x] **Create semantic match types**
  - [x] Add to `src/types/matching.ts`:
    - `SemanticMatchResult` — includes `semanticScore`, `compositeScore`, `matchPercentage`, `sharedActivityCount`, `factors`
    - `CompositeMatch` — extends `PotentialMatch` with composite scoring fields and `MatchFactors` breakdown
    - `MatchConfidence` — `'high' | 'medium' | 'low'` with thresholds (80%, 50%)
    - `getMatchConfidence()` utility function
  - [x] **Test:** Types match edge function response shape

- [x] **Update matching API to call edge functions**
  - [x] Update `src/lib/api/matching.ts` `findPotentialMatches()`:
    - Primary: call `find-potential-matches-semantic` edge function
    - Fallback: call `find-overlapping-trips` RPC (if available in schema)
    - Final fallback: current client-side computation (Sprint 7 baseline)
  - [x] Parse and normalize results from each source into unified `PotentialMatch[]`
  - [x] Null-safe sort on `matchPercentage`
  - [x] Collision-resistant synthetic IDs (`semantic-${userId}-${destinationName}`)
  - [x] Logged fallback warnings at each tier (no silent failures)
  - [x] **Test:** Matches returned with composite scores; all 3 tiers verified via browser

- [x] **Update MatchCard to show composite scores**
  - [x] Show match percentage (e.g., "92% Match") in gradient banner
  - [x] Show match confidence badge (High/Medium/Low based on score)
  - [x] Show factor breakdown with progress bars (Interests, Dates, Activities, Destination)
  - [x] Activity overflow indicator ("+N more")
  - [x] User-facing error toast via `react-hot-toast` on connect failure
  - [x] Backwards-compatible via `isCompositeMatch` type guard
  - [x] **Test:** Card renders both composite and plain match data

- [x] **Update NearbyTravelersSection**
  - [x] Show "Best Matches" (>=80%) / "Good Matches" (>=50%) / "More Travelers" grouping by score threshold
  - [x] Sort by composite score (highest first, null-safe)
  - [x] Dynamic header: "AI-Matched Travelers" vs "Nearby Travelers"
  - [x] `useMatchGroups()` memoized hook for efficient grouping
  - [x] AbortController-based request cancellation on refresh (no race conditions)
  - [x] **Test:** Discover page shows semantic matches with grouping

---

### Epic 2: Connection Validation via Edge Functions

Replace direct table inserts with validated edge function calls.

#### Tasks:

- [x] **Update requestConnection to use edge function**
  - [x] Replace direct `supabase.from('connections').insert()` with `invokeEdgeFunction('request-connection', { recipient_id, message })`
  - [x] Handle validation errors (no active trips, recipient not found, already connected, blocked)
  - [x] Display user-friendly error messages
  - [x] **Test:** Connection request with validation

- [x] **Update respondToConnection to use edge function**
  - [x] Replace direct `supabase.from('connections').update()` with `invokeEdgeFunction('respond-connection', { connection_id, accept })`
  - [x] Edge function creates initial chat message on accept
  - [x] **Test:** Accept creates chat entry, decline updates status

- [x] **Add connection error handling UI**
  - [x] Show toast/alert for common errors: "Already connected", "User not available", "Request blocked"
  - [x] Update MatchCard and UserCard error states
  - [x] **Test:** Error messages display correctly

---

### Epic 3: Activity-Based Matching ✅

Wire shared activities into the matching display.

#### Tasks:

- [x] **Fetch shared activities in match results**
  - [x] Update `findPotentialMatches()` to include shared activities from semantic match results
  - [x] Parse `sharedActivities` array from edge function response
  - [x] Client-side Tier 3 fallback computes Jaccard similarity on `user_activities` table
  - [x] **Test:** Match results include activity overlap data

- [x] **Display shared activities on MatchCard**
  - [x] Show shared activity chips with proper Lucide icons (Mountain, Camera, etc.)
  - [x] Highlight activities that contributed to match score (purple ring when activity factor >= 0.2)
  - [x] **Test:** Activities render on match cards (28 tests in MatchCard.test.tsx)

- [x] **Add activity filter to discover page**
  - [x] Filter matches by specific activity interests
  - [x] Activity filter chip bar with toggle and clear
  - [x] Dynamic subtitle ("matching your filter" when filters active)
  - [x] Empty state with Clear Filters button
  - [x] **Test:** Filter narrows results by activity (12 tests in NearbyTravelersSection.test.tsx)

---

### Epic 4: Typing Indicators ✅

Add real-time typing status to chat.

#### Tasks:

- [x] **Create typing indicator API layer**
  - [x] Add to `src/lib/api/chat.ts`:
    - `sendTypingIndicator(connectionId, userId)` — Supabase Realtime broadcast
    - `subscribeToTypingIndicators(connectionId, userId, callback)` — listen for typing events
    - `clearTypingIndicator(connectionId, userId)` — stop typing signal
    - `createTypingDebounce(connectionId, userId)` — debounced trigger/clear/stop helper
  - [x] Debounce typing events (send every 2.5s, not every keystroke)
  - [x] Auto-clear after 5 seconds of inactivity
  - [x] Uses ephemeral Supabase Realtime broadcast channels (no DB writes)
  - [x] **Test:** 13 tests — broadcast send/clear, subscribe with own-event filter, debounce timing (chat.test.ts)

- [x] **Add typing indicator UI to chat**
  - [x] Show "{Name} is typing..." below chat header when other user is typing
  - [x] Animated dots indicator with staggered CSS animation
  - [x] Auto-hide when typing stops (3s display timeout)
  - [x] **Test:** 4 tests — text rendering, dot count, styling (TypingIndicator.test.tsx)

- [x] **Integrate typing into chat input**
  - [x] Broadcast typing start on first keystroke via `useTypingIndicator` hook
  - [x] Broadcast typing stop on message send (`onTypingStop()`)
  - [x] `useTypingIndicator` hook manages full lifecycle with cleanup on unmount/connection change
  - [x] **Test:** 11 tests — trigger/clear, subscription, auto-hide, unmount cleanup, connection change (useTypingIndicator.test.ts)

---

## Post-Sprint Note

After Sprint 8 completes, Sprint 7.5 (UI/UX Overhaul) should run to:

- Commit the 47-file working tree cleanup (dead code removal from Sprints 7-8)
- Fix ESLint errors blocking `npm run build`
- Restore CI/CD pipeline (`.github/workflows/ci.yml` was deleted)
- Redesign the landing page from feed-first to discovery/lobby-first
- Consolidate navigation, fix empty states, add warm accent color
- See `sprint-07.5-ui-ux-overhaul.md` for full details

---

## Verification Checklist

1. ✅ `npx tsc --noEmit` — zero errors
2. ✅ `npx next build` — zero errors, all 22 pages generated
3. ✅ Semantic matching — `/discover` shows AI-scored matches with percentages
4. ✅ Fallback — if edge function fails, geographic matches still appear (3-tier chain verified in browser)
5. ✅ Connection validation — duplicate/blocked requests show proper errors (Epic 2)
6. ✅ Typing indicators — "User is typing..." appears in chat via Supabase Realtime broadcast (Epic 4)
7. ⬜ Cross-platform — matches scored identically to mobile app (pending edge function deployment)
8. ✅ Shared activities — match cards show overlapping interests with proper icons and activity filter (Epic 3)

---

## Files Created

| File                                                                         | Purpose                                                                                  |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `src/lib/supabase/client.ts`                                                 | Edge function invoker utility with retry, timeout, and typed error handling              |
| `src/types/matching.ts`                                                      | Semantic match types: SemanticMatchResult, CompositeMatch, MatchFactors, MatchConfidence |
| `src/components/features/matching/NearbyTravelersSection.tsx`                | Nearby travelers section with activity filter chips and grouped match display            |
| `src/components/features/matching/__tests__/MatchCard.test.tsx`              | MatchCard component tests (28 tests)                                                     |
| `src/components/features/matching/__tests__/NearbyTravelersSection.test.tsx` | NearbyTravelersSection + activity filter tests (12 tests)                                |
| `src/lib/api/__tests__/matching.test.ts`                                     | Matching API tests including Tier 3 activity overlap (43 tests)                          |
| `src/types/__tests__/matching.test.ts`                                       | Matching type validation tests                                                           |

## Files Modified

| File                                             | Change                                                                                                |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `src/lib/api/matching.ts`                        | 3-tier fallback with activity overlap; client-side computes Jaccard similarity on shared activities   |
| `src/components/features/matching/MatchCard.tsx` | Activity-specific Lucide icons, scored-activity highlighting (purple ring), composite score display   |
| `src/app/(main)/discover/page.tsx`               | Refactored to import NearbyTravelersSection from extracted component                                  |
| `src/lib/api/matching.ts`                        | Edge function integration for requestConnection and respondToConnection with fallback + error mapping |
| `src/components/users/UserCard.tsx`              | Toast error notifications on connection failures                                                      |
| `docs/sprints/sprint-08-matching-parity.md`      | This sprint plan                                                                                      |
