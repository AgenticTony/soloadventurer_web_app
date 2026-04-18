# Sprint 7.2: Design Tokens + Color System + Nav Consolidation

**SoloAdventurer Web App - Sprint 7.2**
**Duration**: 3-5 days
**Status**: 📋 Planned
**Dependencies**: Sprint 7.1 (clean working tree, passing build)

---

## Sprint Goal

Establish the visual foundation (semantic design tokens, three-color system, warm neutrals) and fix navigation (consolidate to 5 items, kill 404s, strengthen active states). This sprint touches every page but doesn't build new pages — it upgrades the design system and nav shell.

---

## Why This Sprint Exists

All three UI/UX reviews agree: the generic cyan-on-black palette feels clinical, navigation has confusing duplicates and broken links, and there's no visual distinction between action types. Fixing the design tokens and nav first means every subsequent sprint (Discovery page, Profile, Feed) inherits the correct system.

---

## Color System

Three semantic color channels — every color means something:

| Channel | Color | Usage | Surface % |
|---------|-------|-------|-----------|
| **Brand / Navigation** | Deep Teal-Ocean `#0EA5A4` (light) / `#2DD4BF` (dark) | Logo, active nav, links, primary CTAs | ~10% |
| **Connection / Social** | Warm Coral-Sunset `#F97066` / `#FB7185` | "Say hi", "Connect", "Invite", new-message dots, match highlights | ~5% |
| **Trust / Achievement** | Golden Sand `#F5B971` / `#FBBF24` | Verification badges, achievements, premium content | ~2% |

Neutrals — warm-tinted. Dark: bg `#0B1012`, surfaces `#141A1E`, borders `#1F272C`, text `#E6E8EB`, muted `#8A949C`. Light: bg `#FAFAF7`, surfaces `#FFFFFF`, borders `#E7E5E0`, text `#1A1D1F`, muted `#6B7178`.

Signature gradient: Teal → Coral (`bg-gradient-ocean-sunset`) — hero moments ONLY.

---

## Tasks

### Design Tokens

- [ ] **Create semantic CSS custom properties**
  - [ ] `globals.css`: add `:root` (light) and `.dark` tokens: `--color-brand`, `--color-connection`, `--color-trust`, `--surface-background`, `--surface-elevated`, `--surface-border`, `--text-primary`, `--text-muted`, `--color-success`, `--color-warning`, `--color-error`
  - [ ] Update `tailwind.config.ts` to map semantic names to tokens
  - [ ] Existing `brand`, `coral`, `sun`, `ink` palettes stay as raw scales
  - [ ] **Test:** All components render identically after migration

- [ ] **Replace pure grey neutrals with warm-tinted neutrals**
  - [ ] Dark mode: bg `#0B1012`, surfaces `#141A1E`, borders `#1F272C`, muted `#8A949C`
  - [ ] Light mode tokens in `:root`: bg `#FAFAF7`, surfaces `#FFFFFF`, borders `#E7E5E0`, muted `#6B7178`
  - [ ] **Test:** Surfaces feel warm, not sterile

- [ ] **Wire coral as connection action color**
  - [ ] "Say hi" / "Connect" / "Invite" buttons → coral
  - [ ] New-message dots → coral, match highlight borders → coral
  - [ ] Adjust existing `coral` palette to warm coral `#F97066` / `#FB7185`
  - [ ] **Test:** Connection CTAs are visually distinct from nav (teal) and trust (gold)

- [ ] **Wire gold as trust/achievement color**
  - [ ] Verification badges → gold, achievements → gold accent, premium → gold
  - [ ] Reserved exclusively for earned/verified
  - [ ] **Test:** Gold appears only on trust/achievement elements

- [ ] **Add signature gradient utility**
  - [ ] `bg-gradient-ocean-sunset` (teal → coral)
  - [ ] Hero moments only (max 3 locations)
  - [ ] Replace arbitrary gradients with this or travel photos
  - [ ] **Test:** Gradient appears on hero moments only

- [ ] **Audit hardcoded hex values**
  - [ ] Grep for `bg-[#`, `text-[#`, `border-[#` in components
  - [ ] Replace with semantic tokens or Tailwind classes
  - [ ] **Test:** No hardcoded hex in component files

- [ ] **Implement light mode theme (stretch goal)**
  - [ ] Add light mode CSS variables under `:root`
  - [ ] Auto-detect via `prefers-color-scheme`
  - [ ] Add "Auto (follow system)" option in settings
  - [ ] Defer full QA if time-boxed — tokens must be in place
  - [ ] **Test:** Light/dark toggle flips all surfaces

### Navigation

- [ ] **Consolidate left nav to 5 primary items**
  - [ ] New nav: **Discover** (compass) → `/discover`, **Trips** (plane) → `/trips`, **Messages** (chat) → `/chat`, **Meetups** (calendar) → `/meetups`, **Saved** (bookmark) → `/saved`
  - [ ] Remove: Feed (→ Discover tab), City Hubs (→ Discover), Groups (→ Discover), Events & Trips (→ Meetups)
  - [ ] Keep Settings and Help as secondary links
  - [ ] Strengthen active state: filled background + left border accent in teal
  - [ ] **Test:** All 5 nav items navigate correctly, no 404s

- [ ] **Create placeholder pages for new routes**
  - [ ] `/meetups` — stub page with "Coming Soon"
  - [ ] Remove `/groups` and `/events` routes (redirect to `/meetups`)
  - [ ] **Test:** No nav link returns 404

- [ ] **Update Next.js redirects**
  - [ ] `/` → `/discover`, `/feed` → `/discover`, `/groups` → `/meetups`, `/events` → `/meetups`
  - [ ] **Test:** All redirects work

### Copy + CTA Verbs

- [ ] **Update CTA verbs**
  - [ ] Primary CTA on traveler cards: "Say hi" or "Connect" (replaces "Follow")
  - [ ] "Follow" as secondary action in overflow
  - [ ] Update UserCard, MatchCard, NearbyTravelers
  - [ ] **Test:** All traveler-facing CTAs use connection verbs

- [ ] **Update copy to wanderlust voice**
  - [ ] Replace generic SaaS copy with warm, travel-specific alternatives
  - [ ] "Discover stories from fellow travelers" → "See who else just landed in [city]"
  - [ ] "Plan and track your adventures" → "Where are you headed next?"
  - [ ] **Test:** Copy reads warm and specific

## Verification

1. `npm run build` — passes clean
2. Three semantic color channels wired: teal (nav), coral (connection), gold (trust)
3. Warm-tinted neutrals in both light and dark
4. No hardcoded hex in components
5. 5-item nav, zero 404s, active state is clear
6. All traveler CTAs say "Connect" / "Say hi"
7. Light/dark toggle works (or tokens ready)
