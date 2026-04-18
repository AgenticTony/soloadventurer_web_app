# Sprint 7.4: Profile Page Overhaul

**SoloAdventurer Web App - Sprint 7.4**
**Duration**: 1-2 weeks
**Status**: 📋 Planned
**Dependencies**: Sprint 7.2 (design tokens, CTA verbs, nav in place), Sprint 7.3 (Discover page routes nav correctly)

---

## Sprint Goal

Redesign the profile page to serve two distinct modes: public view (for other travelers) and edit mode (for the owner). Fix header composition, surface current travel status, remove onboarding/gamification bloat, and build the other-user profile view with connection CTAs.

---

## Why This Sprint Exists

The profile page is the second-most-visited page and the single biggest trust-builder for a solo-traveler product. A professional UI/UX audit identified it as "a hybrid of profile view, profile editor, onboarding checklist, achievement dashboard, and interest-picker all stacked vertically on one endless page." It tries to do five jobs at once and does none cleanly.

---

## Tasks

### View/Edit Mode Separation

- [ ] **Separate view and edit modes**
  - [ ] Default `/profile` is the **public view** — what other travelers see
  - [ ] "Edit Profile" button in header → `/profile/edit` route or modal
  - [ ] Remove all inline edit controls from public view (checkboxes, text inputs, selects)
  - [ ] Remove "View Profile" button (page IS the public view)
  - [ ] Move "Upload Background" to edit-mode cover overlay (pencil on hover)
  - [ ] **Test:** Public view has zero edit controls

### Header

- [ ] **Fix header composition**
  - [ ] Avatar: bottom-left of cover, 120px (down from 170px)
  - [ ] Name + handle + location: directly right of avatar (left-aligned, not centered)
  - [ ] Action buttons on right edge: "Edit Profile" (self) or "Connect" / "Say hi" (other)
  - [ ] Replace "Welcome to your profile" with bio excerpt (or "Add a bio →" prompt)
  - [ ] Replace gradient cover with travel photo + dark overlay
  - [ ] **Test:** Header feels professional and properly aligned

### Current Travel Status

- [ ] **Add "Current Travel Status" module** (highest-priority new element)
  - [ ] Prominent: "Currently in: San Francisco · Heading to: Bali (Dec 15–22)"
  - [ ] Pulled from active/upcoming trips in Supabase
  - [ ] **Test:** Shows current location and next destination

### Details Card

- [ ] **Fix details card (display view)**
  - [ ] Location → display as pill/tag (not inline text field)
  - [ ] Travel Preferences → show selected as filled pills, hide unselected
  - [ ] Interests → show selected as filled chips, hide unselected
  - [ ] Remove "Bio Visibility" privacy setting → belongs in `/settings/privacy`
  - [ ] Change "Member Since 2026" → "Joined April 2026" or omit
  - [ ] Add prominent Bio text block at top of details card
  - [ ] **Test:** Details card shows data as display, not edit controls

### World Travel Map

- [ ] **Fix World Travel Map** (hero differentiator)
  - [ ] Ensure SVG world map actually renders (currently blank rectangle)
  - [ ] Remove duplicate stats — one representation only
  - [ ] Highlight current tier in gamification pills
  - [ ] Remove duplicate "Travel Map" tab below — one map location
  - [ ] **Test:** Map renders with visited countries highlighted

### Gamification + Interests

- [ ] **Consolidate gamification systems**
  - [ ] Merge Achievements grid + Profile Completion checklist into ONE system
  - [ ] Locked achievements: smaller, muted, behind "View all (6 locked)" toggle
  - [ ] Reduce visual weight of unlocked cards (no vibrant gradient louder than user's name)
  - [ ] Weight completion so new users start at ~40% (sign-up + email + name)
  - [ ] Remove "Recommend a Friend" from checklist → separate "Invite friends" card
  - [ ] Auto-dismiss entire block at 100% completion
  - [ ] **Test:** One gamification system, auto-hides at completion

- [ ] **Remove duplicate interests section**
  - [ ] Remove full ActivitySelector picker from profile
  - [ ] Selected interests show as chips in details card
  - [ ] Full picker in `/profile/edit` or onboarding only
  - [ ] **Test:** Interests appear once as chips

### Stats + Tabs

- [ ] **Fix zero-value stat cards**
  - [ ] Hide zero cards or use muted/ghost treatment
  - [ ] No vibrant gradients on zeros
  - [ ] Show "+ Add your first [trip/country/buddy]" ghost cards
  - [ ] Eliminate data duplication
  - [ ] **Test:** Zero states feel like prompts, not achievements

- [ ] **Move tab group higher**
  - [ ] Tabs directly below bio and stats
  - [ ] Remove "Travel Map" tab → replace with "Reviews" or "About"
  - [ ] Rename "Statistics" → "Travel Stats"
  - [ ] Add "+ Add Adventure" ghost card for sparse views
  - [ ] **Test:** Tabs positioned high, content organized

### Other-User Profile

- [ ] **Add other-user profile view** (`/profile/[username]`)
  - [ ] Same layout, different header actions: "Connect" / "Say hi" primary CTA
  - [ ] "View mutual connections" secondary
  - [ ] Report/block affordance (shield icon)
  - [ ] No edit controls, no onboarding checklist, no zero stat cards
  - [ ] **Test:** Other-user profile shows connection actions, no edit UI

## Verification

1. Profile defaults to public view — zero edit controls visible
2. "Edit Profile" opens edit route/modal with all editing
3. Header: avatar + name aligned left, cover is travel photo
4. "Currently in [city] · Heading to [destination]" shows
5. Bio displays prominently at top of details card
6. Preferences/interests shown as filled pills/chips (no checkboxes)
7. World Travel Map renders with visited countries
8. One gamification system, auto-dismisses at 100%
9. Zero stat cards use muted/ghost treatment
10. Interests appear once as chips
11. `/profile/[username]` shows "Connect" CTA + report/block
12. All elements use design tokens from Sprint 7.2
