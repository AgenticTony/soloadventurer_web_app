# SoloAdventurer Web App — Architecture & Cleanup Plan

> Compared against mobile app (`SoloAdventurer_app`) to ensure shared Supabase infrastructure is preserved.

## Shared Supabase Infrastructure

Both web and mobile apps connect to the **same Supabase project** (`zyiuajhltmxbsrqplqlx`).

### Tables (shared — do NOT modify schemas)

| Table                      | Used by Mobile          | Used by Web         |
| -------------------------- | ----------------------- | ------------------- |
| `auth.users`               | Auth + triggers         | Auth                |
| `profiles`                 | Profile CRUD            | Profile read/write  |
| `trips`                    | Trip CRUD               | Trip CRUD (via RPC) |
| `connections`              | Match/connection system | Connections page    |
| `messages`                 | Real-time chat          | Chat service        |
| `feed_items`               | Social feed             | Feed page           |
| `follows`                  | Social graph            | User follows        |
| `comments`                 | Post comments           | —                   |
| `reactions`                | Post reactions          | —                   |
| `journal_entries`          | Travel journal          | —                   |
| `media_items`              | Journal media           | —                   |
| `notifications`            | Push notifications      | —                   |
| `notification_tokens`      | FCM tokens              | —                   |
| `meetup_checkins`          | Safety check-ins        | —                   |
| `location_shares`          | Location sharing        | —                   |
| `user_activities`          | Activity prefs          | —                   |
| `content_privacy_settings` | Trigger-created         | —                   |
| `user_privacy_settings`    | Trigger-created         | —                   |
| `verification_settings`    | Trigger-created         | —                   |

### RPC Functions (shared — created for both apps)

| Function                     | Purpose            | Created by     |
| ---------------------------- | ------------------ | -------------- |
| `create_trip`                | Insert new trip    | Web (Sprint 6) |
| `get_trip_by_id`             | Get single trip    | Web (Sprint 6) |
| `list_my_trips`              | List user's trips  | Web (Sprint 6) |
| `update_my_trip`             | Update user's trip | Web (Sprint 6) |
| `delete_my_trip`             | Delete user's trip | Web (Sprint 6) |
| `find_potential_matches`     | User matching      | Mobile         |
| `get_entries_near_location`  | Journal geosearch  | Mobile         |
| `set_typing_indicator`       | Chat typing status | Mobile         |
| `clear_typing_indicator`     | Chat typing status | Mobile         |
| `get_typing_users`           | Chat typing status | Mobile         |
| `get_user_feed`              | Feed aggregation   | Mobile         |
| `get_nearby_travelers_count` | Nearby users       | Mobile         |

### Edge Functions (shared)

| Function                          | Purpose              |
| --------------------------------- | -------------------- |
| `delete-user-account`             | Account deletion     |
| `request-connection`              | Connection requests  |
| `respond-connection`              | Connection responses |
| `find-potential-matches-semantic` | AI matching          |
| `notify-new-message`              | Push notifications   |

### Triggers (shared — on `auth.users`)

| Trigger                | Function                           | Cascades to              |
| ---------------------- | ---------------------------------- | ------------------------ |
| `on_auth_user_created` | `handle_new_user()`                | Creates `profiles` row   |
| (cascading)            | `create_default_content_privacy()` | Creates privacy settings |
| (cascading)            | `create_default_privacy()`         | Creates user privacy     |
| (cascading)            | `create_default_verification()`    | Creates verification     |

---

## Web App Architecture Audit

### Issues Found

#### 1. Dead Files (safe to delete)

| File                                  | Reason                                               |
| ------------------------------------- | ---------------------------------------------------- |
| `tailwind.config.js`                  | Duplicate of `tailwind.config.ts` (identical)        |
| `src/lib/utils.ts`                    | Duplicate of `src/lib/cn.ts` (identical `cn` export) |
| `src/store/chatStore.ts`              | Not imported anywhere (legacy)                       |
| `src/store/` directory                | Empty after removing chatStore                       |
| `src/lib/websocket/wsClient.ts`       | Not imported anywhere                                |
| `src/app/(main)/chat/page.tsx.backup` | Orphaned backup                                      |

#### 2. Duplicate Trip Logic (SRP violation)

`src/lib/api.ts` and `src/services/trips/tripService.ts` both implement identical Supabase trip CRUD.

- `api.ts` has **14 consumers** (trip pages, hooks, maps, feed)
- `tripService.ts` has **2 consumers** (TripCreationForm, TripEditForm)

**Fix:** Re-export from api.ts through the service layer.

#### 3. Duplicate Types

Trip types defined in 3 places: `src/lib/api.ts`, `src/services/trips/types.ts`, `src/types/trip.ts`
User types defined in 3 places: `src/types/auth.ts`, `src/types/user.ts`, `src/services/users/types.ts`

**Fix:** Single source of truth in `src/types/`, re-export elsewhere.

#### 4. Duplicate Error Classes

- `TripsApiError` in `src/lib/api.ts`
- `ApiError` in `src/services/base/ApiClient.ts`

**Fix:** Single `AppError` in `src/lib/errors.ts`.

#### 5. Old API Pattern Still Active (not dead — migration targets)

These use the REST `apiClient` pattern and will break without `NEXT_PUBLIC_API_BASE`:

- `src/lib/api/connections.ts` → used by connections page
- `src/lib/api/messages.ts` → used by chat service
- `src/lib/api/moderation.ts` → used by PrivacyContext, Report/Block dialogs

These are **not** dead code — they're consumed by active components. They need Supabase migration next, not deletion.

#### 6. GraphQL/Apollo Layer (active for waves only)

The waves feature uses Apollo/GraphQL which hits a non-existent endpoint. The 404s are silenced. This whole unit should migrate to Supabase Realtime:

- `src/graphql/` — GraphQL operations
- `src/lib/apolloClient.ts` — Apollo client
- `src/lib/api/waves.ts` — WaveAPI class
- `src/stores/waveStore.ts` — Zustand wave store
- `src/app/providers/ApolloProvider.tsx` — Provider

---

## Mobile vs Web Architecture Comparison

| Aspect               | Mobile (Flutter)                              | Web (Next.js)                                  |
| -------------------- | --------------------------------------------- | ---------------------------------------------- |
| **State management** | Riverpod 3.0                                  | React Context + Zustand                        |
| **Architecture**     | Clean Architecture (domain/data/presentation) | Feature-based (contexts/services/components)   |
| **Auth**             | `supabase_flutter`                            | `@supabase/ssr` (cookie-based)                 |
| **API pattern**      | Direct Supabase queries + RPC                 | Mixed: RPC + direct queries + REST (migrating) |
| **Realtime**         | Supabase Realtime channels                    | Not yet implemented                            |
| **Offline**          | SQLite/Drift + sync                           | Not implemented                                |
| **Error handling**   | Centralized custom exceptions                 | Mixed (TripsApiError, ApiError)                |
| **Type safety**      | Domain entities + data models                 | TypeScript interfaces                          |
| **Feature scope**    | Full (journal, safety, matching, etc.)        | Partial (auth, trips, profiles, feed, chat)    |

### Key Differences

1. Mobile has many more features (journal, safety, verification, recommendations, subscriptions)
2. Mobile uses Clean Architecture with repository pattern; web is flatter
3. Mobile is offline-first; web is online-only
4. Both share the same Supabase database and RPC functions
5. Mobile uses Realtime extensively; web doesn't yet

---

## Cleanup Actions (Safe — Won't Affect Mobile)

These changes only affect the web app codebase. No Supabase schemas, RPC functions, triggers, or shared infrastructure will be modified.

1. Delete dead files listed above
2. Consolidate trip logic (api.ts as source, tripService.ts as re-export)
3. Consolidate types (src/types/ as single source)
4. Consolidate error classes (src/lib/errors.ts)
5. Leave old API modules (connections, messages, moderation) intact — migration targets
6. Leave GraphQL/Apollo layer intact — waves feature still uses it
7. Verify with `npm run build` after each step
