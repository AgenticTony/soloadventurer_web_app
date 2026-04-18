# Sprint 7.3: Discovery Landing Page + Left/Right Rail Overhaul

**SoloAdventurer Web App - Sprint 7.3**
**Duration**: 1-2 weeks
**Status**: 📋 Planned
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

- [ ] **Create Discover page layout**
  - [ ] `src/app/(main)/discover/page.tsx` — complete redesign as lobby-first
  - [ ] Three-column layout preserved
  - [ ] Tab bar: **Near You** · **People** · **Feed** · **Meetups**
  - [ ] Default tab: "Near You" (never empty — falls back to popular destinations)
  - [ ] **Test:** `/discover` loads with all tabs

- [ ] **Build "Near You" hero module** (default tab)
  - [ ] Hero card: "[City Name]" with cover image / map preview
  - [ ] "234 travelers nearby" as prominent clickable CTA → browseable list
  - [ ] Filters: "arriving this week", "interested in food", "solo female travelers"
  - [ ] Trending spots as tappable chips → mini-hub showing who's been there
  - [ ] **Test:** Hero renders with real geolocation data

- [ ] **Build "Travelers Arriving Soon" carousel**
  - [ ] Horizontal scrollable cards: avatar, name, destination, dates, shared interests, "Say hi" CTA
  - [ ] Pull from existing `findPotentialMatches()` API
  - [ ] **Test:** Carousel shows relevant travelers

- [ ] **Build "Who's Here Now" section**
  - [ ] Grid of nearby traveler cards (reuse MatchCard)
  - [ ] Primary CTA: "Say hi" / "Connect"
  - [ ] **Test:** Shows travelers near user's location

- [ ] **Build "Meetups This Week" preview**
  - [ ] 3-4 upcoming meetup cards, one-tap "Join"
  - [ ] "See all meetups →" link to `/meetups`
  - [ ] Stub data for now
  - [ ] **Test:** Meetup cards render with stub data

### Feed Tab (Within Discover)

- [ ] **Add Feed as a tab within Discover**
  - [ ] Feed tab in the Discover tab bar
  - [ ] Filter/sort bar: Latest · Popular · Photos · Trip Updates · Tips
  - [ ] **Test:** Feed tab loads content with filters

- [ ] **Compress the composer**
  - [ ] Collapse to single-line input, expands on click
  - [ ] Rotating prompt text: "What's happening in [city]?" / "Tip for travelers?"
  - [ ] **Test:** Composer collapses/expands correctly

- [ ] **Redesign empty state as activation funnel**
  - [ ] Replace "No posts yet" with inline: 5 suggested travelers, trending posts, featured creators
  - [ ] TikTok pattern: feed is never truly empty
  - [ ] **Test:** Feed never shows a dead-end empty state

- [ ] **Design post card anatomy**
  - [ ] Avatar + name + location + "currently in [city]" + timestamp
  - [ ] Body + photo carousel + **"Say hi" button** on every card
  - [ ] Warm accent border for posts from users in your city
  - [ ] **Test:** Post card renders with all elements

- [ ] **Add "new posts" pill**
  - [ ] Float "↑ 12 new posts" pill when new content exists
  - [ ] **Test:** Pill appears on new content

### Left Rail

- [ ] **Replace zero counters with profile progress nudge**
  - [ ] Remove "0 Trips / 0 Buddies / 0 Posts"
  - [ ] Add: "Complete your profile · 2 of 5 steps" + progress bar
  - [ ] At 5/5 → show mini stats instead
  - [ ] **Test:** New users see progress nudge, returning users see stats

- [ ] **Make "Location not set" a prominent CTA**
  - [ ] Highlighted button: "Set your location →"
  - [ ] Triggers geolocation or manual city search
  - [ ] **Test:** CTA triggers location flow

- [ ] **Update Create Trip CTA contextually**
  - [ ] Default → after first trip → after 3+ trips (dynamic text)
  - [ ] **Test:** CTA changes based on user state

### Right Rail

- [ ] **Make "Current City" actionable**
  - [ ] "234 travelers nearby" → clickable: "Browse 234 nearby →"
  - [ ] Trending spots → hint: "Tap to see who's going"
  - [ ] **Test:** All elements clickable

- [ ] **Add "Who to Connect With" module** (Feed tab)
  - [ ] 3 traveler suggestions + "Connect" CTA
  - [ ] **Test:** Suggestions show relevant travelers

- [ ] **Add "Trending in [City]" module**
  - [ ] 3 trending hashtags, tappable
  - [ ] **Test:** Tags display and filter

- [ ] **Differentiate card types visually**
  - [ ] Person cards: warm accent, avatar icon
  - [ ] Trip cards: travel icon, date badge
  - [ ] Place cards: map pin, distance
  - [ ] **Test:** Card types visually distinct at a glance

## Verification

1. `/` redirects to `/discover` — lobby-first landing
2. Default tab "Near You" shows travelers and city info (never empty)
3. Feed tab shows seeded content when user graph is empty
4. Left rail shows progress nudge (not "0/0/0")
5. "Location not set" is a prominent CTA
6. Right rail: all stats are clickable actions
7. Post cards include "Say hi" CTA
8. All new components use design tokens from Sprint 7.2
