# Sprint 9: Onboarding Experience

**SoloAdventurer Web App - Sprint 9**
**Duration**: 1-2 weeks
**Status**: 📋 Planned
**Dependencies**: Sprint 7 (Activity Interests — complete), Sprint 7.5 (UI/UX Overhaul — for profile completion nudge component and warm design system)

---

## Sprint Goal

Build a first-run onboarding flow that guides new users through profile setup, interest selection, budget preferences, and destination recommendations — replicating the mobile app's onboarding experience.

---

## Why This Sprint Exists

The mobile app has a comprehensive onboarding flow that converts signups into engaged users:
- Interactive interest selection with visual chips
- Budget range selection
- Destination recommendations based on interests
- Automatic starter itinerary generation
- Profile completion tracking

The web app currently dumps users onto the homepage after signup with no guidance. This sprint creates the same guided experience.

---

## Mobile App Reference

### Onboarding Flow (5 steps)
1. **Welcome** — intro to SoloAdventurer, what to expect
2. **Travel Interests** — select from activity categories (same activities table)
3. **Budget & Style** — budget range (Budget / Mid-range / Luxury), travel style (Solo / Group / Adventure / Cultural)
4. **Destinations** — AI-recommended destinations based on interests
5. **Profile Completion** — upload photo, write bio, set home country

### Key Components
- `onboarding_screen.dart` — multi-step wizard with progress indicator
- `travel_interest_chip.dart` — interactive interest selection chips with emojis
- `generate_starter_itinerary.dart` — AI-powered trip generation from interests

---

## Epic Breakdown

### Epic 1: Onboarding Flow Infrastructure

Build the multi-step wizard shell and navigation.

#### Tasks:

- [ ] **Create onboarding route and layout**
  - [ ] `src/app/onboarding/page.tsx` — main onboarding page
  - [ ] Protected route: redirect to `/` if user has completed onboarding
  - [ ] Redirect to `/onboarding` after first signup
  - [ ] **Test:** New users land on onboarding, returning users skip

- [ ] **Build OnboardingWizard component**
  - [ ] `src/components/features/onboarding/OnboardingWizard.tsx`
  - [ ] Multi-step state machine (step 1-5)
  - [ ] Progress bar showing current step
  - [ ] Next/Back/Skip navigation
  - [ ] Prevent skip on required steps (interests, profile)
  - [ ] **Test:** Wizard advances through all steps

- [ ] **Add onboarding completion tracking**
  - [ ] Add `onboarding_completed` flag to user profile in Supabase
  - [ ] Check flag on auth state change to trigger redirect
  - [ ] Save step progress to allow resume if abandoned
  - [ ] **Test:** Onboarding state persists across sessions

---

### Epic 2: Interest & Preference Selection

Guide users to select their travel interests and preferences.

#### Tasks:

- [ ] **Build OnboardingInterests step**
  - [ ] `src/components/features/onboarding/OnboardingInterests.tsx`
  - [ ] Reuse `ActivitySelector` component from Sprint 7
  - [ ] Show minimum selection prompt ("Pick at least 3 interests")
  - [ ] Auto-save selections on next
  - [ ] **Test:** Interests saved to `user_activities` table

- [ ] **Build OnboardingPreferences step**
  - [ ] `src/components/features/onboarding/OnboardingPreferences.tsx`
  - [ ] Budget range selector: Budget / Mid-range / Luxury / No Limit
  - [ ] Travel style chips: Solo / Couple / Group / Adventure / Cultural / Relaxation
  - [ ] Save to user profile metadata
  - [ ] **Test:** Preferences persist in Supabase

- [ ] **Build OnboardingDestinations step**
  - [ ] `src/components/features/onboarding/OnboardingDestinations.tsx`
  - [ ] Show popular destinations based on selected interests
  - [ ] Search/filter destinations
  - [ ] Select 1-3 dream destinations
  - [ ] **Test:** Destinations stored in profile

---

### Epic 3: Profile Setup

Complete the user's profile with photo and bio.

#### Tasks:

- [ ] **Build OnboardingProfile step**
  - [ ] `src/components/features/onboarding/OnboardingProfile.tsx`
  - [ ] Avatar upload (crop and preview)
  - [ ] Display name input
  - [ ] Bio text area with character count
  - [ ] Home country selector
  - [ ] Save to `profiles` table
  - [ ] **Test:** Profile data saved to Supabase

- [ ] **Build OnboardingWelcome step**
  - [ ] `src/components/features/onboarding/OnboardingWelcome.tsx`
  - [ ] Welcome message with user's name
  - [ ] Summary of selected interests and destinations
  - [ ] "Start Exploring" CTA button → redirect to `/discover`
  - [ ] **Test:** Welcome shows personalized content

---

### Epic 4: Profile Completion Tracker

Show users how complete their profile is and prompt for missing info.

#### Tasks:

- [ ] **Update ProfileCompletionTracker component**
  - [ ] `src/components/features/profile/ProfileCompletionTracker.tsx` (already exists)
  - [ ] Wire to actual profile data from Supabase
  - [ ] Track: avatar, bio, interests, trips, connections, email verified
  - [ ] Show percentage and "Complete your profile" prompts
  - [ ] **From UI/UX review**: Weight tasks so new users start at ~40% (sign-up + email + name = baseline)
  - [ ] **From UI/UX review**: Remove "Recommend a Friend" from checklist (it's a growth action, not profile)
  - [ ] **From UI/UX review**: Auto-dismiss at 100% — do not show on profile page permanently
  - [ ] **From UI/UX review**: This component will be merged with the Achievements system (Sprint 7.5 Epic 8)
  - [ ] **Test:** Tracker reflects real profile state

- [ ] **Add completion nudges**
  - [ ] Banner on homepage if profile < 50% complete
  - [ ] Suggested next action (add photo, write bio, create trip)
  - [ ] Dismissable but reappears after 3 days
  - [ ] **From UI/UX review**: Completed tasks should collapse/strikethrough, not remain full-size
  - [ ] **From UI/UX review**: Do NOT place the full checklist on the profile page — slim banner only
  - [ ] **Test:** Nudge appears for incomplete profiles

---

## Verification Checklist

1. New user signup → lands on `/onboarding`
2. Interest selection → saved to `user_activities` table
3. Budget/style → saved to profile metadata
4. Avatar upload → stored in Supabase Storage
5. Onboarding complete → `onboarding_completed` flag set, redirect to `/discover`
6. Returning user → skips onboarding
7. Abandoned onboarding → resumes where left off
8. Profile tracker → shows accurate completion percentage
