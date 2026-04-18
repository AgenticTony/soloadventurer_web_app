# Sprint 7: Matching & Connections (Supabase)

**SoloAdventurer Web App - Sprint 7**
**Duration**: 2-3 weeks
**Status**: ✅ Complete
**Dependencies**: Sprint 6 (Auth Migration — complete)

---

## Sprint Goal

Implement the matching and connections feature for the web app, replicating the mobile app's Supabase-native pattern. Travelers with overlapping trips and shared interests can discover each other, connect, and chat.

---

## Why This Sprint Exists

The web app previously had a "waves" feature built on GraphQL/Apollo that was non-functional (the GraphQL endpoint didn't exist). This was removed in the Sprint 6 cleanup. The mobile app has a mature matching system that uses Supabase directly — RPC functions, edge functions, and the `connections` table. This sprint replicates that pattern for the web.

Both apps will share the same `connections`, `trips`, `activities`, `user_activities`, and `messages` tables in Supabase. A match made on mobile is visible on web and vice versa.

---

## Mobile App Reference (Source of Truth)

### Supabase Tables Used
| Table | Purpose |
|-------|---------|
| `trips` | User travel plans (already connected) |
| `connections` | Match records with status (pending/accepted/declined/blocked) |
| `activities` | Available activity types (coffee, hiking, sightseeing, etc.) |
| `user_activities` | User's selected activity interests |
| `messages` | Chat messages between matched users |

### Supabase RPC Functions
| Function | Purpose | Status |
|----------|---------|--------|
| `find_potential_matches` | Geographic overlap matching (params: user_id, radius_km) | Not in schema cache — implemented client-side |
| `set_typing_indicator` | Chat typing status (params: p_chat_id, p_user_id) | Not yet implemented |
| `clear_typing_indicator` | Clear typing status | Not yet implemented |
| `get_typing_users` | Get who's typing in a chat | Not yet implemented |

### Supabase Edge Functions
| Function | Purpose | Status |
|----------|---------|--------|
| `find-potential-matches-semantic` | AI-powered interest matching | Not yet implemented |
| `request-connection` | Send connection request | Implemented via direct table insert |
| `respond-connection` | Accept/decline connection | Implemented via direct table update |
| `notify-new-message` | Push notification for new message | Not yet implemented |

### Connection Entity Fields
```
id, userAId, userBId, matchType (geographicOverlap | activityMatch | combinedMatch),
status (pending | accepted | declined | blocked),
overlapStartDate, overlapEndDate, overlapDays, distanceMeters,
matchScore, semanticScore, sharedActivityCount, isActive, createdAt,
matchedUserProfile: { id, firstName, ageRange, homeCountry, gender, avatarUrl, trip }
```

### Mobile App Screens
1. **Matches Screen** — card list of nearby travelers with destination, dates, overlap days, activity chips, match type badges
2. **Chat List Screen** — conversations with matched users
3. **Chat Screen** — real-time messaging with typing indicators

---

## Implementation Notes

### RPC Functions Not Available
The planned RPC functions (`find_potential_matches`, `get_nearby_travelers_count`) are not in our Supabase schema cache, so match discovery is implemented via direct table queries with client-side overlap computation. This uses the `trips` table with date range comparisons and haversine distance calculation.

### Edge Functions Replaced with Direct Queries
Connection requests and responses are implemented as direct Supabase table inserts/updates rather than edge function calls, since the edge functions are not configured for our project.

---

## Epic Breakdown

### Epic 1: Activity Interests System ✅

Allow users to select activity preferences used for matching.

#### Tasks:

- [x] **Create activity types and API layer**
  - [x] Add `Activity`, `UserActivity`, `Connection`, `ConnectionProfile`, `PotentialMatch` types to `src/types/matching.ts`
  - [x] Create `src/lib/api/activities.ts` with Supabase queries for `activities` and `user_activities` tables
  - [x] Functions: `getActivities()`, `getUserActivities(userId?)`, `setUserActivities(activityIds[])`
  - Atomic swap pattern for user_activities (delete all + insert new)

- [x] **Build ActivitySelector component**
  - [x] `src/components/features/matching/ActivitySelector.tsx`
  - Category-grouped activity chips (Outdoor, Food & Drink, Creative, Culture, Social, etc.)
  - Icon mapping from DB `icon_name` values to Lucide React icons
  - Multi-select with visual selected state per category color
  - Save button calls `setUserActivities` with change detection
  - Loading skeleton state

- [x] **Add activities to profile page**
  - [x] Integrated into `src/app/profile/page.tsx` below achievements section
  - Loads existing selections on mount
  - Persists across page refresh

---

### Epic 2: Match Discovery ✅

Find and display potential matches based on overlapping trips and shared interests.

#### Tasks:

- [x] **Create matching API layer**
  - [x] Add `Connection`, `ConnectionProfile`, `PotentialMatch`, `ConnectionStatus`, `MatchType` types to `src/types/matching.ts`
  - [x] Create `src/lib/api/matching.ts` with:
    - `findPotentialMatches()` — queries `trips` table, computes date overlaps and haversine distances client-side
    - `getConnections(status?)` — queries `connections` table with joined profile data
    - `requestConnection(recipientId, message?)` — inserts into `connections`
    - `respondToConnection(connectionId, accept)` — updates `connections` status
  - Matches sorted by match score (overlap days / 7, capped at 1.0)

- [x] **Build MatchCard component**
  - [x] `src/components/features/matching/MatchCard.tsx`
  - User avatar with gradient fallback
  - Name, home country
  - Trip destination with MapPin icon
  - Date range with Calendar icon
  - Overlap days badge with Mountain icon
  - Distance indicator with Navigation icon
  - Match type badge: "Same Destination" (blue) / "Shared Interests" (purple) / "Perfect Match" (green)
  - Shared activities as chips
  - Connect button with loading/connected states

- [x] **Build NearbyTravelersSection on Discover page**
  - [x] Added to `src/app/(main)/discover/page.tsx` above existing UserSearch
  - `NearbyTravelersSection` component with refresh button
  - Grid of MatchCard components
  - Empty state: "Create a trip to discover travelers"
  - Error state with retry
  - Loading skeleton

- [ ] **Build MatchDetail dialog/sheet**
  - Not yet implemented (deferred — MatchCard has inline connect button)

---

### Epic 3: Connection Management ✅

Send, accept, decline, and manage connections.

#### Tasks:

- [x] **Create connection API functions**
  - [x] In `src/lib/api/matching.ts`:
    - `requestConnection(recipientId, message?)` — direct table insert into `connections`
    - `respondToConnection(connectionId, accept)` — direct table update
    - `getConnections(status?)` — queries `connections` with joined `profiles` data
  - Duplicate detection via Supabase unique constraint (error code 23505)

- [x] **Rebuild Connections page** (`/connections`)
  - [x] `src/app/(main)/connections/page.tsx` — full rewrite from REST/mock to Supabase
  - Tabs: All, Pending, Connected (pill-style tab bar)
  - Stats cards: Connected count, Pending Incoming, Pending Outgoing
  - Connection cards with avatar, name, bio, date, status badge
  - Incoming requests: Accept/Decline buttons
  - Accepted connections: Message button → navigates to `/chat`
  - Outgoing pending: "Awaiting response" indicator
  - Loading, empty, and error states

- [ ] **Build connection request notifications**
  - Not yet implemented (deferred to future sprint)

---

### Epic 4: Real-time Chat with Matches ✅

Chat with connected users via Supabase Realtime.

#### Tasks:

- [x] **Create chat API layer**
  - [x] `src/lib/api/chat.ts` with:
    - `getChatConversations()` — derives conversations from accepted connections, fetches last message + unread count
    - `getMessages(connectionId, options?)` — queries `messages` table with auto-read-marking
    - `sendMessage(connectionId, content)` — inserts into `messages` with auto-detected receiver
    - `subscribeToMessages(connectionId, callback)` — Supabase Realtime postgres_changes INSERT listener
    - `subscribeToAllMessages(userId, callback)` — global message listener for all conversations

- [x] **Rebuild Chat page** (`/chat`)
  - [x] `src/app/(main)/chat/page.tsx` — full rewrite from Allotment/WebSocket to Supabase
  - Chat list sidebar: conversation list with avatar, name, last message preview, timestamp, unread badge
  - Chat area: message bubbles (sent = blue, received = gray), timestamps, auto-scroll
  - Message input with Enter-to-send
  - Search conversations filter
  - Responsive: sidebar hidden on mobile when chat open, back button to return
  - Empty states: no conversations, no messages yet
  - Real-time: new messages appear instantly via Supabase Realtime subscriptions

- [ ] **Typing indicators**
  - Not yet implemented (requires `set_typing_indicator` / `get_typing_users` RPC or Supabase Realtime presence)

---

### Epic 5: Navigation & Integration ✅

Wire everything into the main navigation flow.

#### Tasks:

- [x] **Update Header navigation**
  - [x] `src/components/layout/Header.tsx` — replaced Waves icon with Users icon for connections link
  - [x] Messages button now links to `/chat` (was a non-functional button)
  - [x] Dropdown menu updated: Connections uses Users icon

- [x] **Update UserCard component**
  - [x] `src/components/users/UserCard.tsx` — added working Connect button
  - Connect button calls `requestConnection()` from matching API
  - After connecting, shows Message button → navigates to `/chat`

- [x] **Navigation already wired**
  - [x] LeftNav: already had Messages link pointing to `/chat`
  - [x] BottomTabBar: already had Chat tab pointing to `/chat`

- [ ] **Update user profile pages**
  - Profile view pages (`/profile/[username]`) already have Connect/Message buttons from Sprint 6 cleanup

---

## Architecture Decisions

### API Pattern
All matching queries use the same pattern as the mobile app:
- **Direct table queries** for match discovery, connections, and messages (RPC functions not available in schema cache)
- **Supabase Realtime** for live chat messages (replacing WebSocket)
- **Client-side computation** for date overlap and haversine distance matching

### No New GraphQL/Apollo
This feature is built entirely on Supabase — no reintroduction of Apollo or GraphQL.

### Shared Tables
The web app reads/writes the same Supabase tables as the mobile app. No new tables needed.

---

## Files Created

| File | Purpose |
|------|---------|
| `src/types/matching.ts` | Types: Activity, UserActivity, Connection, ConnectionProfile, PotentialMatch, ConnectionStatus, MatchType |
| `src/lib/api/activities.ts` | Supabase CRUD for activities and user_activities tables |
| `src/lib/api/matching.ts` | Match discovery, connection management (findPotentialMatches, getConnections, requestConnection, respondToConnection) |
| `src/lib/api/chat.ts` | Chat messaging with Supabase Realtime subscriptions |
| `src/components/features/matching/ActivitySelector.tsx` | Category-grouped activity chip selector |
| `src/components/features/matching/MatchCard.tsx` | Match display card with connect action |
| `docs/sprints/sprint-07-matching-supabase.md` | This sprint plan |

## Files Modified

| File | Change |
|------|--------|
| `src/app/profile/page.tsx` | Added ActivitySelector component |
| `src/app/(main)/discover/page.tsx` | Added NearbyTravelersSection with MatchCard grid |
| `src/app/(main)/connections/page.tsx` | Full rewrite: REST/mock → Supabase queries |
| `src/app/(main)/chat/page.tsx` | Full rewrite: Allotment/WebSocket → Supabase Realtime |
| `src/components/layout/Header.tsx` | Waves→Users icon, Messages links to /chat |
| `src/components/users/UserCard.tsx` | Working Connect/Message buttons |
| `src/types/connection.ts` | Fixed `any` → `unknown` lint error |
| `src/lib/api/moderation.ts` | Fixed `any` → `unknown` lint errors |
| `src/services/users/userService.ts` | Fixed `let` → removed unused variable |

---

## Verification Checklist

1. ✅ `npx tsc --noEmit` — zero TypeScript errors
2. ✅ `npm run dev` — app starts clean
3. ✅ Activity selection — user can pick interests, saved to `user_activities`
4. ✅ Match discovery — `/discover` shows travelers with overlapping trips
5. ✅ Connection request — send request via Supabase insert, appears in pending
6. ✅ Connection accept — accept request, both users see "Connected"
7. ✅ Real-time chat — messages appear via Supabase Realtime postgres_changes
8. ⬜ Typing indicators — not yet implemented (requires RPC or Realtime presence)
9. ✅ Cross-platform — same Supabase tables shared with mobile app
10. ⬜ Block/report — moderation API exists but not wired into connections flow
11. ✅ Empty states — proper messaging when no trips, no matches, no messages
