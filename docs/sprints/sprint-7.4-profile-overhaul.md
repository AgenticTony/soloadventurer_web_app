# Sprint 7.4: Profile Page Overhaul

**SoloAdventurer Web App - Sprint 7.4**
**Duration**: 1-2 weeks
**Status**: ✅ Complete
**Dependencies**: Sprint 7.2 (design tokens, CTA verbs, nav in place), Sprint 7.3 (Discover page routes nav correctly)

---

## Sprint Goal

Redesign the profile page to serve two distinct modes: public view (for other travelers) and edit mode (for the owner). Fix header composition, surface current travel status, remove onboarding/gamification bloat, and build the other-user profile view with connection CTAs.

---

## Why This Sprint Exists

The profile page is the second-most-visited page and the single biggest trust-builder for a solo-traveler product. A professional UI/UX audit identified it as "a hybrid of profile view, profile editor, onboarding checklist, achievement dashboard, and interest-picker all stacked vertically on one endless page." It tries to do five jobs at once and does none cleanly.

---

## Architecture

### Component Decomposition (SRP)

Each component has a single responsibility:

| Component                | Responsibility                                                                |
| ------------------------ | ----------------------------------------------------------------------------- |
| `ProfileView.tsx`        | Orchestrator — composes all sub-components for own-profile                    |
| `ProfileHeader.tsx`      | Cover photo, avatar, name/handle/location, action buttons                     |
| `TravelStatus.tsx`       | Current city + heading-to status display                                      |
| `ProfileStatsBar.tsx`    | 4-stat grid with ghost card treatment for zeros                               |
| `ProfileDetailsCard.tsx` | Read-only bio, location pill, preferences, interests                          |
| `ProfileTabs.tsx`        | Tab navigation bar (Adventures, Gallery, Map, Travel Stats)                   |
| `ProfileTabContent.tsx`  | Tab content router with empty-state components                                |
| `AchievementSystem.tsx`  | Unified gamification — merged from AchievementGrid + ProfileCompletionTracker |
| `WorldMap.tsx`           | SVG travel map with visited countries, milestones, design tokens              |

### Route Structure

| Route                 | Purpose                                             |
| --------------------- | --------------------------------------------------- |
| `/profile`            | Own profile — public view mode (zero edit controls) |
| `/profile/edit`       | Edit mode — all editing in one dedicated route      |
| `/profile/[username]` | Other-user profile — "Say hi" CTA, report/block     |

### Design Token Usage

- **Brand (teal)**: Visited countries on map, stat icons, tab active state
- **Connection (coral)**: "Say hi" button on other-user profiles
- **Trust (gold)**: Verification badge, achievement progress badge
- **Surface tokens**: Card backgrounds, borders
- **Text tokens**: Primary, secondary, muted hierarchy
- **Utility classes**: `card-base`, `card-interactive`, `btn-connection`, `badge-trust`, `bg-gradient-ocean-sunset`

---

## Tasks

### View/Edit Mode Separation

- [x] **Separate view and edit modes**
  - [x] Default `/profile` is the **public view** — what other travelers see
  - [x] "Edit Profile" button in header → `/profile/edit` route
  - [x] Remove all inline edit controls from public view (checkboxes, text inputs, selects)
  - [x] Remove "View Profile" button (page IS the public view)
  - [x] Move "Upload Background" to edit-mode cover overlay (pencil on hover)
  - [x] **Test:** Public view has zero edit controls

### Header

- [x] **Fix header composition**
  - [x] Avatar: bottom-left of cover, 120px (down from 170px)
  - [x] Name + handle + location: directly right of avatar (left-aligned, not centered)
  - [x] Action buttons on right edge: "Edit Profile" (self) or "Connect" / "Say hi" (other)
  - [x] Replace "Welcome to your profile" with bio excerpt (or "Add a bio →" prompt)
  - [x] Replace gradient cover with travel photo + dark overlay
  - [x] **Test:** Header feels professional and properly aligned

### Current Travel Status

- [x] **Add "Current Travel Status" module** (highest-priority new element)
  - [x] Prominent: "Currently in: San Francisco · Heading to: Bali (Dec 15–22)"
  - [x] Ready for Supabase trip data integration
  - [x] **Test:** Shows current location and next destination

### Details Card

- [x] **Fix details card (display view)**
  - [x] Location → display as pill/tag (not inline text field)
  - [x] Travel Preferences → show selected as filled pills, hide unselected
  - [x] Interests → show selected as filled chips, hide unselected
  - [x] Remove "Bio Visibility" privacy setting → belongs in `/settings/privacy`
  - [x] Change "Member Since 2026" → "Joined April 2026" or omit
  - [x] Add prominent Bio text block at top of details card
  - [x] **Test:** Details card shows data as display, not edit controls

### World Travel Map

- [x] **Fix World Travel Map** (hero differentiator)
  - [x] Ensure SVG world map renders via react-simple-maps
  - [x] Remove duplicate stats — single progress bar + milestone pills
  - [x] Highlight current tier in milestone pills using design tokens
  - [x] Remove duplicate "Travel Map" tab — map lives in sidebar only
  - [x] Use semantic color tokens (brand for visited, surface-border for unvisited)
  - [x] **Test:** Map renders with visited countries highlighted

### Gamification + Interests

- [x] **Consolidate gamification systems**
  - [x] Merge Achievements grid + Profile Completion checklist into ONE AchievementSystem
  - [x] Locked achievements: smaller, muted, behind "View all (N locked)" toggle
  - [x] Unlocked shown as compact pills (no vibrant gradient louder than user's name)
  - [x] Weight completion: new users start at ~18% (verified + early adopter = 2/11)
  - [x] Remove "Recommend a Friend" from checklist
  - [x] Auto-dismiss entire block at 100% completion
  - [x] Hidden on other-user profiles with few achievements
  - [x] **Test:** One gamification system, auto-hides at completion

- [x] **Remove duplicate interests section**
  - [x] Remove full ActivitySelector picker from profile view
  - [x] Selected interests show as chips in details card
  - [x] Full picker in `/profile/edit` only
  - [x] **Test:** Interests appear once as chips

### Stats + Tabs

- [x] **Fix zero-value stat cards**
  - [x] Ghost/dashed card treatment for zeros with "+ Add your first..." prompt
  - [x] No vibrant gradients on zeros
  - [x] Clickable ghost cards route to appropriate add-flow
  - [x] **Test:** Zero states feel like prompts, not achievements

- [x] **Move tab group higher**
  - [x] Tabs directly below stats in 2-column layout
  - [x] Rename "Statistics" → "Travel Stats"
  - [x] Remove "Travel Map" tab (map in sidebar)
  - [x] Use underline tab pattern (not pill toggle) for professional feel
  - [x] **Test:** Tabs positioned high, content organized

### Other-User Profile

- [x] **Add other-user profile view** (`/profile/[username]`)
  - [x] Same layout structure, different header actions
  - [x] "Say hi" primary CTA (coral btn-connection style)
  - [x] "Message" secondary button
  - [x] Report/block affordance (shield icon in dropdown)
  - [x] No edit controls, no onboarding checklist, no zero stat cards
  - [x] Auto-redirect to `/profile` if viewing own username
  - [x] **Test:** Other-user profile shows connection actions, no edit UI

### Edit Route

- [x] **Build `/profile/edit` page**
  - [x] Back navigation to profile
  - [x] Avatar upload section
  - [x] Basic info form (name, bio, location)
  - [x] Travel style toggle pills
  - [x] Interests toggle pills
  - [x] Save/Cancel actions
  - [x] **Test:** Edit page has all editing in one place

---

## Verification

1. ✅ Profile defaults to public view — zero edit controls visible
2. ✅ "Edit Profile" opens `/profile/edit` with all editing
3. ✅ Header: avatar + name aligned left, cover is travel photo or gradient
4. ✅ "Currently in [city] · Heading to [destination]" module ready for data
5. ✅ Bio displays prominently at top of details card
6. ✅ Preferences/interests shown as filled pills/chips (no checkboxes)
7. ✅ World Travel Map renders with visited countries + semantic tokens
8. ✅ One gamification system (AchievementSystem), auto-dismisses at 100%
9. ✅ Zero stat cards use muted/ghost treatment with add prompts
10. ✅ Interests appear once as chips in details card
11. ✅ `/profile/[username]` shows "Say hi" CTA + report/block dropdown
12. ✅ All elements use design tokens from Sprint 7.2
13. ✅ Build passes with zero new TypeScript errors

## Known Technical Debt (Post-Sprint)

1. `ProfileView.tsx` uses stub data for `currentCity`, `headingTo`, `countriesVisited`, etc. — needs Supabase integration
2. `OtherUserProfilePage` uses stub user data — needs `UserService.getUserProfile(username)` call
3. Avatar/cover upload buttons are UI-only — need Supabase Storage integration
4. "Say hi" and "Message" buttons on other-user profile are stubs — need connection/messaging flows
5. Report/block dropdown is UI-only — needs backend endpoint
6. Profile edit save is a TODO — needs `UserService.updateUserProfile()` call
7. `ProfileCard.tsx` (legacy) and `ProfileForm.tsx` (legacy) still exist but are no longer imported from profile pages
