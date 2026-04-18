# Sprint 11: Safety Hub

**SoloAdventurer Web App - Sprint 11**
**Duration**: 1-2 weeks
**Status**: 📋 Planned
**Dependencies**: Sprint 7 (Connections — for trusted contacts)

---

## Sprint Goal

Build a safety hub with SOS emergency alerts, check-in system, trusted contacts management, **and visible trust/verification affordances** — replicating the mobile app's safety features for the web, plus addressing the critical UI/UX gap where safety signals were completely absent.

### UI/UX Audit Integration

A professional UI/UX review identified safety as the single biggest gap: "Before someone DMs a stranger and agrees to meet at a restaurant in a foreign city, they need visible reassurance. I see no verification badges, no trust scores, no mutual connections, no reporting affordances, no indication of identity checks." This sprint adds those visible signals alongside the functional safety features.

---

## Why This Sprint Exists

Safety is a core feature for solo travelers. The mobile app has a comprehensive safety system:
- One-tap SOS emergency alert
- Scheduled check-ins with missed detection
- Trusted contacts management
- Real-time location sharing
- Safety status dashboard

The web app has no safety features. This sprint builds the browser-compatible equivalent.

---

## Mobile App Reference

### Safety Data Model
```
CheckIn:
  id, userId, status (pending | completed | missed | overdue),
  scheduledAt, completedAt, location { lat, lng, name },
  notes, createdAt

TrustedContact:
  id, userId, contactUserId, contactName, contactEmail, contactPhone,
  relationship, notifyOnSOS, notifyOnMissedCheckIn, createdAt

SOSAlert:
  id, userId, status (active | resolved | false_alarm),
  location { lat, lng, name }, message, createdAt, resolvedAt
```

### Key Features
- SOS button with confirmation dialog
- Scheduled check-ins (hourly, 2hr, 4hr, daily, custom)
- Missed check-in detection → auto-notify trusted contacts
- Location-based check-ins (browser Geolocation API)
- Trusted contacts can view traveler's last known location

---

## Epic Breakdown

### Epic 1: Safety Data Layer

Set up database schema and API.

#### Tasks:

- [ ] **Create safety types**
  - [ ] `src/types/safety.ts`
  - [ ] `CheckIn` — id, userId, status, scheduledAt, completedAt, location, notes
  - [ ] `CheckInStatus` — pending | completed | missed | overdue
  - [ ] `TrustedContact` — id, userId, contactUserId, contactName, email, phone, relationship, notification flags
  - [ ] `SOSAlert` — id, userId, status, location, message, timestamps
  - [ ] **Test:** Types compile without errors

- [ ] **Verify/create Supabase tables**
  - [ ] Check `check_ins`, `trusted_contacts`, `sos_alerts` tables exist (shared with mobile)
  - [ ] Verify RLS policies
  - [ ] **Test:** Can insert/query safety records

- [ ] **Create safety API layer**
  - [ ] `src/lib/api/safety.ts`
  - [ ] `triggerSOS(location?, message?)` — create SOS alert + notify trusted contacts
  - [ ] `resolveSOS(alertId)` — mark alert resolved
  - [ ] `createCheckIn(scheduledAt)` — schedule a check-in
  - [ ] `completeCheckIn(checkInId, location?, notes?)` — mark completed
  - [ ] `getCheckIns(status?)` — list check-ins
  - [ ] `getTrustedContacts()` — list trusted contacts
  - [ ] `addTrustedContact(data)` — add contact
  - [ ] `removeTrustedContact(id)` — remove contact
  - [ ] **Test:** API functions work end-to-end

---

### Epic 2: SOS Emergency System

Build the one-tap emergency alert system.

#### Tasks:

- [ ] **Build SOS button component**
  - [ ] `src/components/features/safety/SOSButton.tsx`
  - [ ] Prominent red button, always accessible (floating or in header)
  - [ ] Hold-to-confirm (3 second hold) to prevent accidental triggers
  - [ ] Confirmation dialog with optional message
  - [ ] Visual feedback (pulsing red during countdown)
  - [ ] **Test:** SOS triggers with hold confirmation

- [ ] **Build SOS alert flow**
  - [ ] Capture browser geolocation on trigger
  - [ ] Create SOS alert record in Supabase
  - [ ] Notify trusted contacts (via Supabase Realtime or edge function)
  - [ ] Show "Help is on the way" confirmation with alert ID
  - [ ] **Test:** Alert creates and contacts are notified

- [ ] **Build SOS status page**
  - [ ] `src/app/(main)/safety/sos/page.tsx`
  - [ ] Active alerts with countdown since trigger
  - [ ] Location map showing alert position
  - [ ] "I'm safe" resolve button
  - [ ] "False alarm" resolve option
  - [ ] **Test:** Alert can be resolved

---

### Epic 3: Check-In System

Build the scheduled check-in feature.

#### Tasks:

- [ ] **Build check-in scheduler**
  - [ ] `src/components/features/safety/CheckInScheduler.tsx`
  - [ ] Preset intervals: Every hour, Every 2 hours, Every 4 hours, Daily
  - [ ] Custom time picker
  - [ ] Start/stop scheduling
  - [ ] Browser notification reminders (Web Notifications API)
  - [ ] **Test:** Check-ins schedule and remind

- [ ] **Build check-in completion UI**
  - [ ] `src/components/features/safety/CheckInConfirm.tsx`
  - [ ] "I'm safe" confirmation button
  - [ ] Optional: attach current location, add notes
  - [ ] One-tap confirm from notification
  - [ ] **Test:** Check-in marks as completed

- [ ] **Build check-in history**
  - [ ] Timeline view of past check-ins
  - [ ] Status indicators: ✅ completed, ⚠️ late, ❌ missed
  - [ ] Location map for each completed check-in
  - [ ] **Test:** History displays correctly

- [ ] **Implement missed check-in detection**
  - [ ] Use browser `setTimeout` or `setInterval` for countdown
  - [ ] If not confirmed within grace period (15 min) → mark as missed
  - [ ] Notify trusted contacts on missed check-in
  - [ ] Show "You missed a check-in!" alert
  - [ ] **Test:** Missed check-in triggers notification

---

### Epic 4: Trusted Contacts Management

Allow users to manage who gets notified in emergencies.

#### Tasks:

- [ ] **Build trusted contacts page**
  - [ ] `src/app/(main)/safety/contacts/page.tsx`
  - [ ] List of current trusted contacts with relationship tags
  - [ ] Add contact by email or username (must be a SoloAdventurer user)
  - [ ] Remove contact with confirmation
  - [ ] Toggle notification preferences per contact (SOS, missed check-in)
  - [ ] **Test:** Contacts CRUD works

- [ ] **Build safety dashboard**
  - [ ] `src/app/(main)/safety/page.tsx`
  - [ ] Overview: active SOS alerts, upcoming check-ins, trusted contacts count
  - [ ] Quick actions: SOS button, schedule check-in, add contact
  - [ ] Recent activity timeline
  - [ ] **Test:** Dashboard shows real safety data

---

## Verification Checklist

1. `npx tsc --noEmit` — zero errors
2. SOS trigger — creates alert, captures location, notifies contacts
3. SOS resolve — alert marked resolved with timestamp
4. Check-in schedule — reminders fire at correct intervals
5. Check-in complete — marks as completed with location
6. Missed check-in — auto-detects and notifies contacts
7. Trusted contacts — add/remove with notification toggles
8. Browser notifications — permission requested, reminders display
9. Verification badge — shown on verified profiles throughout app
10. Trust score — visible on profile and traveler cards
11. Mutual connections — displayed on match cards and profiles
12. Report/block — accessible from every profile interaction point

---

### Epic 5: Trust & Verification Affordances (From UI/UX Review)

Add visible safety signals that were identified as the biggest gap in the UI/UX audit.

#### Tasks:

- [ ] **Build verification badge component**
  - [ ] `src/components/features/safety/VerificationBadge.tsx`
  - [ ] Small shield/check icon next to user names throughout the app
  - [ ] Tooltip: "Verified identity" on hover
  - [ ] Integrate into UserCard, MatchCard, chat headers, post cards
  - [ ] **Test:** Badge renders for verified users, hidden for unverified

- [ ] **Add trust score display**
  - [ ] Trust score based on: profile completeness, verification status, trip history, connections, reviews
  - [ ] Show as small badge/indicator on traveler cards: "Trusted" / "New member"
  - [ ] Full score breakdown on profile page
  - [ ] **Test:** Trust score displays correctly

- [ ] **Add mutual connections indicator**
  - [ ] On MatchCard and UserCard: "2 mutual connections" with avatar stack
  - [ ] Query mutual connections from `connections` table (shared connections)
  - [ ] Click to expand mutual connections list
  - [ ] **Test:** Mutual connections display when they exist

- [ ] **Add visible report/block affordance**
  - [ ] Safety/report icon (shield) on every profile interaction point
  - [ ] Quick-access report dialog from: match cards, chat, profile page, feed posts
  - [ ] Already have `ReportDialog` and `BlockDialog` components — ensure they're wired up everywhere
  - [ ] **Test:** Report accessible from all interaction points

- [ ] **Add profile completeness indicator**
  - [ ] Visual indicator on traveler cards: "Profile 80% complete"
  - [ ] Users with fuller profiles get more visibility in matching
  - [ ] Encourages profile completion (ties into Sprint 9 onboarding)
  - [ ] **Test:** Completeness indicator shows accurate percentage

- [ ] **Add profile trust signals** (from profile UI/UX review)
  - [ ] Languages spoken — essential for travel matching
  - [ ] Age range — many users want to filter by peer group
  - [ ] Gender — for users preferring same-gender travel
  - [ ] Social verification (connected via Instagram / Facebook / LinkedIn)
  - [ ] Number of successful meetups / trips completed
  - [ ] Reviews/testimonials from past travel buddies
  - [ ] **Test:** Trust section visible on profile with real or seeded data

- [ ] **Build profile "Trust & Verification" section**
  - [ ] Dedicated section near top of profile page (below bio, above tabs)
  - [ ] Verification badge row: email ✓, ID ✓, social ✓ (greyed until completed)
  - [ ] Reviews summary: star rating + count ("4.8 ★ from 12 travel buddies")
  - [ ] Mutual connections preview when viewing other-user profile
  - [ ] **Test:** Trust section renders with verification status
