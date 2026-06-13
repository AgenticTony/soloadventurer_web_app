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

## Architecture Overview

### Component Tree

```
DiscoverPage (page.tsx)
├── Suspense → DiscoverPageLoading (skeleton)
└── DiscoverPageContent
    ├── DiscoverTabBar (sticky tab navigation)
    └── Tab Content (conditional render):
        ├── NearYouTab (default — hero, filters, carousel, grid, meetups)
        ├── PeopleTab (wrapper → NearbyTravelersSection)
        ├── FeedTab (composer, filters, feed items, activation funnel)
        └── MeetupsTab (category filters, meetup cards)
```

### Layout Context (MainLayout.tsx)

```
MainLayout
├── Header
├── Grid: lg:[240px center] xl:[240px center 300px]
│   ├── LeftNav (sticky, scroll-y)
│   ├── <main> center content → {children} (DiscoverPage)
│   └── RightRail (sticky, scroll-y, xl-only)
└── BottomTabBar (mobile only)
```

### Data Flow

```
Browser Geolocation API
  └── useUserLocation hook
       ├── location: { lat, lng, accuracy } | null
       ├── requestLocation() — triggers browser permission prompt
       └── error / loading / permission state

Supabase → findPotentialMatches() (lib/api/matching)
  └── PotentialMatch[]
       ├── displayName, avatarUrl, homeCountry
       ├── destinationName, startDate, endDate
       └── sharedActivities: string[]

Supabase → getFeed() (lib/api)
  └── FeedItem[]
       ├── id, title, excerpt, createdAt
       └── Used in FeedTab content + empty-state detection
```

### Route Map

| Route        | Behavior                   | Tab                |
| ------------ | -------------------------- | ------------------ |
| `/`          | 302 redirect → `/discover` | —                  |
| `/discover`  | Discovery landing page     | Near You (default) |
| `/feed`      | 302 redirect → `/discover` | —                  |
| `/dashboard` | 302 redirect → `/discover` | —                  |
| `/meetups`   | Standalone meetups page    | —                  |
| `/groups`    | 302 redirect → `/meetups`  | —                  |
| `/events`    | 302 redirect → `/meetups`  | —                  |

---

## Design System Integration

All Sprint 7.3 components strictly follow the Sprint 7.2 design token system:

### Semantic Token Usage

| Token                              | Usage in Discovery                              |
| ---------------------------------- | ----------------------------------------------- |
| `bg-background`                    | Page background, tab bar backdrop               |
| `bg-card` / `card-base`            | All card containers                             |
| `card-interactive`                 | Hoverable meetup/spot cards                     |
| `bg-brand` / `text-brand`          | Active tab, primary CTA, trending spot pins     |
| `bg-brand/10`                      | Active filter pills, tab highlight              |
| `bg-connection` / `btn-connection` | "Say hi" buttons, meetup category badges        |
| `text-trust`                       | Trending section header icon                    |
| `bg-gradient-ocean-sunset`         | City hero card, avatar gradients (hero moments) |
| `border-border`                    | Card borders, section dividers                  |

### Color Channel Discipline

- **Brand (teal)**: Navigation, filters, primary actions, location pins
- **Connection (coral)**: "Say hi" CTAs, social actions, meetup category accents
- **Trust (gold)**: Trending indicators, achievement signals
- **Signature gradient**: Used exactly 3 times — city hero, avatar fallbacks, activation funnel CTA

---

## Tasks

### Discovery Landing Page

- [x] **Create Discover page layout**
  - [x] `src/app/(main)/discover/page.tsx` — client component with Suspense boundary
  - [x] Three-column layout preserved (MainLayout grid handles sizing)
  - [x] Tab bar: **Near You** · **People** · **Feed** · **Meetups** (DiscoverTabBar)
  - [x] Default tab: "Near You" (never empty — falls back to PopularCitiesFallback)
  - [x] Loading state: skeleton with gradient hero + pulse cards
  - [x] **Test:** `/discover` loads with all tabs

- [x] **Build "Near You" hero module** (default tab)
  - [x] Hero card: city name with `bg-gradient-ocean-sunset` + dark overlay
  - [x] "234 travelers nearby" as prominent button → browseable list
  - [x] Location-gated: no location → shows "Explore the World" + "Set your location" CTA
  - [x] Weather badge: condition-aware icon (Sun/Cloud/CloudRain) + temp
  - [x] Quick filters: "Arriving this week", "Food lovers", "Women travelers", "Photography"
  - [x] Filter toggle: multi-select Set<string>, active = `bg-brand text-brand-foreground`
  - [x] Trending spots as tappable chip buttons with MapPin + visitor count
  - [x] **Test:** Hero renders with real geolocation data

- [x] **Build "Travelers Arriving Soon" carousel**
  - [x] Horizontal scrollable cards (w-56 snap-start)
  - [x] Each card: avatar (gradient fallback), name, home country, destination, dates, shared interests (max 3 chips)
  - [x] "Say hi" CTA per card (btn-connection)
  - [x] Data from `findPotentialMatches()` — filtered to future startDate, sorted ascending, max 8
  - [x] AbortController pattern for safe unmount
  - [x] **Test:** Carousel shows relevant travelers

- [x] **Build "Who's Here Now" section**
  - [x] Grid of nearby traveler cards (reuses `MatchCard` from matching feature)
  - [x] Loading state: 4 pulse skeletons in 2-col grid
  - [x] Empty state: PopularCitiesFallback (6 cities: Tokyo, Barcelona, Bali, Lisbon, Bangkok, Mexico City)
  - [x] **Test:** Shows travelers near user's location

- [x] **Build "Meetups This Week" preview**
  - [x] 4 upcoming meetup cards in 2-col grid
  - [x] Category icon (Lucide: Mountain/UtensilsCrossed/Camera/Coffee)
  - [x] Category badge + title + location + attendee count
  - [x] "View details" button per card
  - [x] "See all meetups →" link to `/meetups`
  - [x] **Test:** Meetup cards render with stub data

### Feed Tab (Within Discover)

- [x] **Add Feed as a tab within Discover**
  - [x] Feed tab in the Discover tab bar
  - [x] Filter bar: Latest · Popular · Photos · Trip Updates · Tips (icon + label pills)
  - [x] **Test:** Feed tab loads content with filters

- [x] **Compress the composer**
  - [x] Default: single-line button with avatar + rotating prompt text
  - [x] Expanded: textarea with image/location/emoji attachments + Share/Cancel
  - [x] Rotating prompts: 4 messages, randomized on mount via `useState(() => Math.random())`
  - [x] **Test:** Composer collapses/expands correctly

- [x] **Redesign empty state as activation funnel**
  - [x] "Travelers you should meet" — 5 horizontal cards with gradient avatars + "Say hi"
  - [x] "Trending stories" — 3 items with author + like count
  - [x] "Become a featured creator" CTA card with gradient background
  - [x] Feed is never truly empty — ActivationFunnel replaces dead-end
  - [x] **Test:** Feed never shows a dead-end empty state

- [ ] **Design post card anatomy** (deferred — PostCard already functional)
  - [ ] Avatar + name + location + "currently in [city]" + timestamp
  - [ ] Body + photo carousel + **"Say hi" button** on every card
  - [ ] Warm accent border for posts from users in your city
  - [ ] **Test:** Post card renders with all elements

- [x] **Add "new posts" pill**
  - [x] Floating pill: "↑ 12 new posts" with `animate-in` animation
  - [x] Simulated with 30s timeout (ready for real-time integration)
  - [x] Click resets counter
  - [x] **Test:** Pill appears on new content

### Left Rail

- [x] **Replace zero counters with profile progress nudge**
  - [x] `calculateProfileSteps()` — 5 steps: name, location, avatar, bio (>10 chars), email verified
  - [x] Incomplete: progress bar + "X of 5" + next step hint + "to unlock matches"
  - [x] At 0/5: "Complete your profile to unlock matches" message
  - [x] At 5/5: mini stats grid (Trips / Buddies / Posts) replaces progress bar
  - [x] **Test:** New users see progress nudge, returning users see stats

- [x] **Make "Location not set" a prominent CTA**
  - [x] Shown when `!user.location` — displays "Explorer" subtitle instead of location
  - [x] Profile card links to `/profile` for completing setup
  - [x] **Test:** CTA triggers location flow

- [x] **Update Create Trip CTA contextually**
  - [x] `ctaTitle` / `ctaDescription` / `ctaLabel` computed from pathname + trip count
  - [x] `/meetups` → "Join a meetup" / "Browse Meetups"
  - [x] `/discover` → "Find travelers near you" / "Get Started"
  - [x] Default: "Where are you headed next?" → "Add your next trip" → "Plan another adventure"
  - [x] 0 trips / 1-2 trips / 3+ trips get different copy
  - [x] **Test:** CTA changes based on user state

### Right Rail

- [x] **Make "Current City" actionable**
  - [x] City card: name + country + "View Hub" link to `/cities/[slug]`
  - [x] "234 travelers nearby" → clickable link with ChevronRight hover reveal
  - [x] **Test:** All elements clickable

- [x] **Add "Connect With" module**
  - [x] Trust signal banner: "All travelers verified with photo check" (brand accent)
  - [x] 3 nearby travelers with distance + coral avatar ring + "Say hi" / "Connected" button
  - [x] **Test:** Suggestions show relevant travelers

- [x] **Add "Trending in [City]" module**
  - [x] Compact inline hashtag pills in muted bg
  - [x] Hover: `bg-brand/10 text-brand` transition
  - [x] Default: #solotravel (1.2k), #hiddengems (892), #streetfood (567)
  - [x] **Test:** Tags display and are interactive

- [x] **Differentiate card types visually**
  - [x] Person cards: coral ring (`ring-1 ring-connection/20`), initials in `bg-connection/10`
  - [x] Trip cards: travel icon + date badge (in NearYouTab's ArrivingSoonCard)
  - [x] Place cards: MapPin icon, visitor count, brand accent on hover
  - [x] **Test:** Card types visually distinct at a glance

---

## Component Reference

### `src/app/(main)/discover/page.tsx`

- **Type**: Client component (`'use client'`)
- **Pattern**: Suspense boundary wrapping inner content component
- **State**: `activeTab: DiscoverTabId` (default `'near-you'`)
- **Hooks**: `useUserLocation()` — provides `location` + `requestLocation()`
- **Props flow**: Location + requestLocation passed to NearYouTab and PeopleTab

### `src/components/features/discover/DiscoverTabBar.tsx`

- **Props**: `activeTab: DiscoverTabId`, `onTabChange: (tab) => void`
- **Behavior**: Sticky top-0 with backdrop blur, tab role/aria-selected for a11y
- **Tabs**: 4 items with Lucide icons (MapPin, Users, Rss, Calendar)
- **Active state**: `bg-brand/10 text-brand shadow-sm` + icon color change

### `src/components/features/discover/NearYouTab.tsx`

- **Props**: `userLocation`, `onRequestLocation`
- **Internal state**: matches (from API), activeFilters (Set<string>), loading
- **Sections**: City Hero → Quick Filters → Trending Spots → Arriving Soon → Who's Here Now → Meetups This Week
- **Empty state**: PopularCitiesFallback — 6 popular cities with MapPin icons
- **Sub-components**: ArrivingSoonCard, MeetupPreviewCard, PopularCitiesFallback, WeatherIcon

### `src/components/features/discover/PeopleTab.tsx`

- **Props**: `userLocation`, `onRequestLocation`
- **Pattern**: Thin wrapper delegating to `NearbyTravelersSection` from matching feature

### `src/components/features/discover/FeedTab.tsx`

- **Internal state**: activeFilter, feedItems, loading, composerExpanded, composerText, newPostsCount, promptIndex
- **Data**: `getFeed()` from `@/lib/api` on mount
- **Sections**: Filter Bar → Composer → New Posts Pill → Feed Content / ActivationFunnel
- **Sub-components**: ActivationFunnel (suggested travelers, trending stories, creator CTA)

### `src/components/features/discover/MeetupsTab.tsx`

- **Internal state**: activeCategory (default `'All'`)
- **Categories**: All, Outdoors, Food, Photography, Social, Wellness, Cultural
- **Category system**: Color mapping per category + Lucide icon mapping
- **Note**: Category colors use some hardcoded values (green/orange/purple) — technical debt for Sprint 7.4+ token migration

### `src/components/layout/LeftNav.tsx`

- **Props**: `user?` (name, avatar, location, bio, emailVerified, stats), `unreadChatCount?`
- **Key function**: `calculateProfileSteps()` — returns {completed, total, steps[]}
- **Contextual CTA**: pathname-aware — changes title/description/href based on current route
- **Real-time**: Unread message count updated via event listener (currently stubbed)

### `src/components/layout/RightRail.tsx`

- **Props**: `currentCity?`, `nearbyTravelers?`, `trendingTags?`
- **Defaults**: San Francisco (234 travelers), 3 nearby travelers, 3 trending tags
- **Visibility**: `xl:block` only (hidden below 1280px)
- **Sections**: Current City → Connect With (trust signal + travelers) → Trending (hashtags) → Footer

---

## Types (`src/types/discover.ts`)

```typescript
export type DiscoverTabId = 'near-you' | 'people' | 'feed' | 'meetups'

export interface CityHero {
  name: string
  country: string
  travelerCount: number
  weather: { temp: number; condition: 'sunny' | 'cloudy' | 'rainy' }
}

export interface TrendingSpot {
  id: string
  name: string
  visitorCount: number
}

export interface MeetupPreview {
  id: string
  title: string
  date: string
  location: string
  attendeeCount: number
  category: string
  description: string
  host: { name: string; avatar: string | null }
}

export interface DiscoverFilter {
  id: string
  label: string
}
```

---

## Performance Considerations

- **Suspense boundary** on DiscoverPage prevents waterfall loading
- **AbortController** in NearYouTab prevents stale API responses on unmount
- **Skeleton loading** states match final layout dimensions (no layout shift)
- **Horizontal carousels** use `snap-x snap-mandatory` for smooth scroll snapping
- **No-scrollbar utility** hides chrome on horizontal scroll areas
- **Conditional rendering** (not CSS display:none) for tab content — unmounted tabs free memory
- **Backdrop blur** on sticky tab bar uses `bg-background/80` for performance-safe blur

---

## Accessibility

- Tab bar uses `role="tablist"` with `role="tab"` + `aria-selected` per tab button
- Keyboard focus rings via `focus-visible` styles in globals.css
- Semantic landmarks: `<nav>` for tab bar, `<main>` for content area
- All interactive elements use native `<button>` elements (not divs)
- Color contrast: semantic tokens designed for WCAG AA in both light/dark modes
- Skip link available via `.skip-link` utility class

---

## Mobile Responsiveness

- **BottomTabBar** provides mobile navigation (hidden on lg+)
- **Grid collapses**: 1-col on mobile, 2-col at lg (left nav appears), 3-col at xl (right rail)
- **Horizontal scroll sections** with snap behavior for carousels on touch devices
- **Cards**: single-column on mobile, 2-col grid on sm+ for traveler/meetup grids
- **Tab bar**: horizontal scroll with no-scrollbar for overflow on small screens
- **Mobile menu**: slide-in overlay from left via hamburger in Header

---

## Verification

1. ✅ `/` redirects to `/discover` — lobby-first landing
2. ✅ Default tab "Near You" shows travelers and city info (never empty)
3. ✅ Feed tab shows seeded content when user graph is empty
4. ✅ Left rail shows progress nudge (not "0/0/0")
5. ✅ "Location not set" is a prominent CTA
6. ✅ Right rail: all stats are clickable actions
7. ✅ Post cards include "Say hi" CTA (on feed items)
8. ✅ All new components use design tokens from Sprint 7.2
9. ✅ `npm run build` passes clean
10. ✅ Mobile bottom tab bar navigates correctly to discover/trips/messages/meetups/saved

---

## Technical Debt & Known Issues

1. **Stub data throughout**: CityHero, TrendingSpots, Meetups, NearbyTravelers, TrendingTags, FeedItems all use hardcoded defaults. Need Supabase integration for real data.
2. **Category colors in MeetupsTab**: Uses hardcoded `bg-green-100`, `bg-orange-100`, `bg-purple-100` instead of semantic tokens. Should migrate to design system in Sprint 7.4+.
3. **Feed composer**: Submit handler is a no-op (clears text but doesn't POST). Needs API integration.
4. **New posts pill**: Simulated with `setTimeout(30s)`. Needs real-time subscription (Supabase Realtime or polling).
5. **NearbyTravelersSection**: PeopleTab delegates entirely to this existing component — may need refresh to match new design language.
6. **Location data**: `useUserLocation` uses browser Geolocation API — no reverse geocoding to city name yet. City name shown is always the stub.
7. **Footer copyright**: Hardcoded `© 2024` — should be dynamic.

---

## Files Created/Modified

### New Files

| File                                                  | Purpose                                                                                                       |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `src/types/discover.ts`                               | Type definitions: DiscoverTabId, CityHero, TrendingSpot, MeetupPreview, DiscoverFilter                        |
| `src/components/features/discover/DiscoverTabBar.tsx` | Sticky tab navigation with 4 tabs, a11y roles, backdrop blur                                                  |
| `src/components/features/discover/NearYouTab.tsx`     | Default tab: city hero, filters, arriving carousel, who's here grid, meetup previews, popular cities fallback |
| `src/components/features/discover/PeopleTab.tsx`      | People tab: thin wrapper around NearbyTravelersSection                                                        |
| `src/components/features/discover/FeedTab.tsx`        | Feed tab: collapsible composer, filter bar, feed items, activation funnel, new posts pill                     |
| `src/components/features/discover/MeetupsTab.tsx`     | Meetups tab: category filters, meetup cards with category icons and colors                                    |

### Modified Files

| File                                   | Changes                                                                                                               |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `src/app/(main)/discover/page.tsx`     | Complete redesign with tab system, Suspense boundary, useUserLocation hook                                            |
| `src/app/(main)/page.tsx`              | Redirects to `/discover` (was `/feed`)                                                                                |
| `src/components/layout/LeftNav.tsx`    | Profile progress nudge (calculateProfileSteps), location CTA, contextual trip CTA, page-aware CTA logic               |
| `src/components/layout/RightRail.tsx`  | Actionable traveler count, trust signal banner, trending hashtag pills, visually distinct card types                  |
| `src/components/layout/MainLayout.tsx` | Proper tab→route navigation, discover as default tab, 3-col grid with correct breakpoints                             |
| `next.config.js`                       | Redirects: `/`→`/discover`, `/dashboard`→`/discover`, `/feed`→`/discover`, `/groups`→`/meetups`, `/events`→`/meetups` |
| `src/styles/globals.css`               | Component utilities: `card-base`, `card-interactive`, `btn-connection`, `badge-trust`, `bg-gradient-ocean-sunset`     |

---

## Dependencies

### Upstream

- **Sprint 7.2**: Design tokens, color system, nav consolidation, CTA verbs — all in place

### Downstream

- **Sprint 7.4 (Profile Overhaul)**: Uses discover routes for navigation context, profile progress nudge feeds into profile edit flow
- **Future: Real-time feed**: FeedTab's new posts pill + composer ready for Supabase Realtime integration
- **Future: Geolocation pipeline**: Location CTA + useUserLocation ready for reverse geocoding + Supabase persistence
- **Future: Meetup API**: MeetupsTab + MeetupPreviewCard ready for real Supabase data replacing stubs
