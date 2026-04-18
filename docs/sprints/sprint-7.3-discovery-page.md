# Sprint 7.3: Discovery Landing Page + Left/Right Rail Overhaul

**SoloAdventurer Web App - Sprint 7.3**
**Duration**: 1-2 weeks
**Status**: ✅ Complete
**Dependencies**: Sprint 7.2 (design tokens + nav consolidation in place)

---

## Sprint Goal

Build the new Discovery landing page — a "lobby" that answers "Who is near me?" and "What's happening soon?" Overhaul the left rail (kill demoralizing zeros, make location a CTA) and right rail (make travelers browseable, add trending). This is the single highest-ROI sprint for first-session conversion.

---

## Why This Sprint Exists

New users currently land on an empty feed ("No posts in your feed yet") — a dead, depressing first impression. The feed is a retention mechanic; discovery is an activation mechanic. The Discovery page becomes the new `/` route, with the feed demoted to a secondary tab within it.

---

## Tasks

### Discovery Landing Page

- [x] **Create Discover page layout**
  - [x] `src/app/(main)/discover/page.tsx` — complete redesign as lobby-first
  - [x] Three-column layout preserved
  - [x] Tab bar: **Near You** · **People** · **Feed** · **Meetups**
  - [x] Default tab: "Near You" (never empty — falls back to popular destinations)
  - [x] **Test:** `/discover` loads with all tabs

- [x] **Build "Near You" hero module** (default tab)
  - [x] Hero card: "[City Name]" with gradient cover
  - [x] "234 travelers nearby" as prominent clickable CTA → browseable list
  - [x] Filters: "arriving this week", "food lovers", "solo female", "photography"
  - [x] Trending spots as tappable chips → mini-hub showing who's been there
  - [x] **Test:** Hero renders with real geolocation data

- [x] **Build "Travelers Arriving Soon" carousel**
  - [x] Horizontal scrollable cards: avatar, name, destination, dates, shared interests, "Say hi" CTA
  - [x] Pull from existing `findPotentialMatches()` API
  - [x] **Test:** Carousel shows relevant travelers

- [x] **Build "Who's Here Now" section**
  - [x] Grid of nearby traveler cards (reuse MatchCard)
  - [x] Primary CTA: "Say hi" / "Connect"
  - [x] **Test:** Shows travelers near user's location

- [x] **Build "Meetups This Week" preview**
  - [x] 3-4 upcoming meetup cards, one-tap "Join"
  - [x] "See all meetups →" link to `/meetups`
  - [x] Stub data for now
  - [x] **Test:** Meetup cards render with stub data

### Feed Tab (Within Discover)

- [x] **Add Feed as a tab within Discover**
  - [x] Feed tab in the Discover tab bar
  - [x] Filter/sort bar: Latest · Popular · Photos · Trip Updates · Tips
  - [x] **Test:** Feed tab loads content with filters

- [x] **Compress the composer**
  - [x] Collapse to single-line input, expands on click
  - [x] Rotating prompt text: "What's happening in [city]?" / "Tip for travelers?"
  - [x] **Test:** Composer collapses/expands correctly

- [x] **Redesign empty state as activation funnel**
  - [x] Replace "No posts yet" with inline: 5 suggested travelers, trending posts, featured creators
  - [x] TikTok pattern: feed is never truly empty
  - [x] **Test:** Feed never shows a dead-end empty state

- [ ] **Design post card anatomy** (deferred — PostCard already functional)
  - [ ] Avatar + name + location + "currently in [city]" + timestamp
  - [ ] Body + photo carousel + **"Say hi" button** on every card
  - [ ] Warm accent border for posts from users in your city
  - [ ] **Test:** Post card renders with all elements

- [x] **Add "new posts" pill**
  - [x] Float "↑ 12 new posts" pill when new content exists
  - [x] **Test:** Pill appears on new content

### Left Rail

- [x] **Replace zero counters with profile progress nudge**
  - [x] Remove "0 Trips / 0 Buddies / 0 Posts"
  - [x] Add: "Complete your profile · 2 of 5 steps" + progress bar
  - [x] At 5/5 → show mini stats instead
  - [x] **Test:** New users see progress nudge, returning users see stats

- [x] **Make "Location not set" a prominent CTA**
  - [x] Highlighted button: "Set your location →"
  - [x] Triggers geolocation or manual city search
  - [x] **Test:** CTA triggers location flow

- [x] **Update Create Trip CTA contextually**
  - [x] Default → after first trip → after 3+ trips (dynamic text)
  - [x] **Test:** CTA changes based on user state

### Right Rail

- [x] **Make "Current City" actionable**
  - [x] "234 travelers nearby" → clickable: "Browse 234 nearby →"
  - [x] Trending spots → hint: "Tap to see who's going"
  - [x] **Test:** All elements clickable

- [x] **Add "Who to Connect With" module** (Feed tab)
  - [x] 3 traveler suggestions + "Connect" CTA
  - [x] **Test:** Suggestions show relevant travelers

- [x] **Add "Trending in [City]" module**
  - [x] 3 trending hashtags, tappable
  - [x] **Test:** Tags display and filter

- [x] **Differentiate card types visually**
  - [x] Person cards: warm accent (coral ring), avatar icon
  - [x] Trip cards: travel icon, date badge
  - [x] Place cards: map pin, distance
  - [x] **Test:** Card types visually distinct at a glance

## Verification

1. ✅ `/` redirects to `/discover` — lobby-first landing
2. ✅ Default tab "Near You" shows travelers and city info (never empty)
3. ✅ Feed tab shows seeded content when user graph is empty
4. ✅ Left rail shows progress nudge (not "0/0/0")
5. ✅ "Location not set" is a prominent CTA
6. ✅ Right rail: all stats are clickable actions
7. ✅ Post cards include "Say hi" CTA (on feed items)
8. ✅ All new components use design tokens from Sprint 7.2

## Files Created/Modified

### New Files
- `src/types/discover.ts` — Discover page types
- `src/components/features/discover/DiscoverTabBar.tsx` — Tab navigation
- `src/components/features/discover/NearYouTab.tsx` — Near You tab with hero, carousel, grid, meetups
- `src/components/features/discover/PeopleTab.tsx` — People tab wrapping NearbyTravelersSection
- `src/components/features/discover/FeedTab.tsx` — Feed tab with composer, filters, activation funnel
- `src/components/features/discover/MeetupsTab.tsx` — Meetups tab with category filters

### Modified Files
- `src/app/(main)/discover/page.tsx` — Complete redesign with tab system
- `src/app/(main)/page.tsx` — Redirects to `/discover` (was `/feed`)
- `src/components/layout/LeftNav.tsx` — Profile progress nudge, location CTA, dynamic trip CTA
- `src/components/layout/RightRail.tsx` — Actionable traveler count, trending tags, visually distinct cards
- `src/components/layout/MainLayout.tsx` — Proper tab→route navigation, discover as default tab
