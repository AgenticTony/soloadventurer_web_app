# Solo Travel Apps — APK Teardown (facts-only)

> **Companion to:** `solo-travel-apps-competitive-teardown.md` (desk research) · `solo-travel-apps-rea-technical-teardown.md` (public web bundles)
> **Question:** the same competitive question — features we don't list, and how the businesses work — answered at the deepest public-artifact layer: **the shipped Android binaries** of Tourlina and Hostelworld.
> **Retrieved:** 2026-10-11. Evidence + parsed inventories are kept **local-only** at `docs/research/artifacts/rea/` (gitignored — legal review 2026-10-11: third-party decode dumps are not committed; evidence IDs below identify each record).

---

## 1. Method, provenance, and legal posture

### 1.1 Scope discipline (facts only)

This teardown extracts **facts**: the decoded manifest (permissions, activity/service inventory, app links), string resources, and string literals embedded in compiled binaries. **No code was copied into this repo, nothing is redistributed, no authentication was bypassed, and no app was executed.** The JADX decompilation layer available in REA was deliberately **not** used — the manifest + resource layer fully answers the feature-inventory question, and staying at that layer is the defensible posture. This pass was run at the founder's explicit direction; the standing posture for future passes is documented here so it's a decision, not a drift.

### 1.2 Pipeline

```
brew install apktool                                  # apktool 3.0.3 (Java 17 present)
cargo install apkeep                                   # APK downloader (apkpure backend, risks acknowledged via apkeep's own gate)
apkeep -a de.tourlina.Tourlina  -d apk-pure -o acknowledge_dangers=true .   # XAPK bundle
apkeep -a com.hostelworld.app -d apk-pure -o acknowledge_dangers=true .

# REA (v6.4.0 CLI) resource layer — apktool resolved via REA_APKTOOL_COMMAND:
rea decode-android-resources <base.apk> --json        # manifest + metadata + projected strings
apktool d <split.apk>                                 # language/ABI splits (REA projects strings only for base)
strings -n 6 <lib/arm64-v8a/libapp.so>                # Flutter AOT snapshot string literals (Tourlina)
```

### 1.3 Provenance & verification

| Check | Tourlina | Hostelworld |
|---|---|---|
| Package (matches Play identity) | `de.tourlina.Tourlina` ✓ | `com.hostelworld.app` ✓ |
| Version (matches Play-listed current) | 2.0.23 (versionCode 606) ✓ | 9.109.0 (versionCode 670910900) ✓ |
| Distribution form | XAPK (base + en/ABI splits) | XAPK (base + xxhdpi split) |

**Provenance caveat (material):** binaries came from APKPure via apkeep — a third-party mirror that apkeep's own tooling warns has had modified-app incidents. Package names, versions, and internal consistency (Flutter/Dart, RevenueCat, Stripe SDK surface) all check out, but findings should be read as **indicative of the shipped Play builds as mirrored**, not as forensically verified Play originals. For any finding we would act on strategically (e.g., pricing), verify against the live app before committing.

---

## 2. Tourlina 2.0.23 — the binary contradicts the marketing

Tourlina is a **Flutter app** (single `de.tourlina.flutter.MainActivity`; the product lives in the Dart AOT snapshot, `libapp.so`, 27.6MB) with a **GraphQL backend** (`package:tourlina/infrastructure/graphql/operations/…`; API host `api.ng.tourlina.com` from `app_links_base`). 19 permissions; 9 activities; RevenueCat + Play Billing + an **Amazon Appstore billing proxy** (`com.revenuecat.purchases.amazon…`) — subscriptions sold beyond Google Play.

### 2.1 The women-only wedge is gone from the product itself

The Play listing said "open to all genders" (desk teardown §4.5) — the binary confirms it structurally: signup onboarding strings are `intro_sign_up_everyone_gender_headline` / `…_subline`, and matching exposes `gender_filter_everyone` / `gender_filter_men` / `gender_filter_women` as a **user preference filter**, not a platform mode. Zero `women-only`/`female-only` feature strings anywhere in the snapshot. **The first-mover women-only app is now a gendered Tinder-for-travel with a filter.** Our wedge is open in a way desk research only suspected.

### 2.2 The paywall is fully visible — and it taxes connection

The `subscription_reminder_*` string family is the complete premium pitch list:

| String | What it gates (free tier gets…) |
|---|---|
| `subscription_reminder_unlimited_chats` / `has_unlimited_chats` | a **chats-per-week cap** (`…chats_per_week`) |
| `subscription_reminder_no_ads` | **ads in the free tier** |
| `subscription_reminder_move_location` | **location changes are paid** |
| `subscription_reminder_change_search_radius` | search radius |
| `subscription_reminder_reset_last_swipe` | undo on swipes — **swipe mechanics confirmed** (`/main/match` route + this perk) |
| `subscription_reminder_premium_support` | support |
| `subscription_reminder_all_packages` / `…_page` | pricing surface (`/main/pricing` route) |

Premium UX chrome: `_PremiumBadge`, `PremiumUserBanner`, `my_profile_premium_button`, `pricing_table_header_premium`, `premiumDaysRemaining`. Monetization = RevenueCat subscriptions (Google Play + Amazon). **This is the Couchsurfing error pattern at smaller scale: the free product taxes the core connection itself (chat caps, location moves).** It also funds our counter-position: unlimited core connection, paid trust/safety/perks.

### 2.3 Feature surface (routes + strings)

- **Journeys** = the trip entity: `/main/journeys`, `create_journey`, date-range selector, journey **preferences**, matching. Matching is journey-scoped (who's where, when) — closest analog to our trips-overlap matching, minus verification and reputation.
- **Discovery**: `/main/discover` (+ `nearby`, `results`, `search`, `discover_filter`) with `GenderFilter` and search radius.
- **Verification**: admin-gated photo verification — `admin_accountVerification`, `AttachAccountVerificationPhoto`, `ConfirmVerification`, `ResendVerification`, `signup_verify_yourself_image_title`, plus verification checks surfaced on profiles and **inside conversations** (`Conversation_users_admin_accountVerification`). Human-administered, not automated — matches the desk finding of ~48h manual checks, now confirmed structurally.
- **Trust graph**: friend requests (`acceptFriendRequest`), likes on likeable entities, block (`BlockUserInput`, with device-location serializer on the block — they capture where the blocked user was), report with reporter/suspect structures (including suspect hometown/photo).
- **Calls**: base APK defines **system call-style notifications with Answer / Answer-with-Video actions** (`call_notification_answer_action`, `call_notification_answer_video_action`) and a `icon_video_call` asset → **in-app voice/video calls exist**. Permissions `RECORD_AUDIO` + `READ_MEDIA_AUDIO` corroborate. **This closes the question our gap matrix flagged (#7): the direct wedge competitor already ships pre-meetup calls.**
- **No safety layer**: zero SOS/emergency/check-in strings. Safety = report/block only. The guardian remains uncontested in the direct set.

### 2.4 Business model (binary-level)

Freemium subscription (RevenueCat; Google + Amazon billing), ad-supported free tier, chat-cap-driven conversion. No transaction layer (no experiences/bookings surface in the binary). GraphQL API. **The model monetizes scarcity of connection — the exact inverse of our charter (FOUNDATIONS §6.3).**

---

## 3. Hostelworld 9.109.0 — the social machine, at full resolution

Native Android app (Kotlin/Compose visible), 226 activities, 23 permissions (fine+coarse location, biometric, billing). The mobile surface is **far richer than the web bundle** (REA web pass) — the app is where the social product actually lives.

### 3.1 The chat-gating ladder (the monetization spine, in strings)

User-facing copy pins the ladder exactly:

1. **`chat_rooms_non_bookers_book_to_unlock_chats` — "Book to unlock Chats"**: property chats require a booking (the commitment filter).
2. **`chat_unlock_city_chats` — "Unlock it from €4.99"**: city chats unlock at **€4.99** — the Social Pass entry price, in the binary.
3. **`chat_profile_completion_title` — "Complete your profile to access Private Chats"** + "Add a photo and your date of birth to send direct messages": **DMs are gated on photo + date of birth** — a minimum-identity bar for messaging.
4. **`chat_membership_duration_with_social_pass` — "This chat will disappear %d %s after check-out or when your Social Pass ends"**: social access is **ephemeral by design**, tied to membership/checkout. Scarcity and hygiene in one mechanism.

**Read-through for us [Inferred]:** Hostelworld runs a three-rung commitment ladder — *booking → payment (€4.99+) → profile completeness* — each rung buying more social access. Our equivalent ladder writes itself: *verified (selfie) → ID-verified → reputation-gated surfaces*, with trust rather than payment as the currency. That's the differentiated version of a mechanism the market leader has already validated.

### 3.2 Social Pass is a community-scoped subscription product, not a toggle

A 14-activity funnel: `SocialPassActivity`, **`PaywallActivity`**, `WhatsIncludedActivity`, `HowItWorksActivity`, `CommunitySelectionActivity`, `LocationRationaleActivity`/`LocationPermissionActivity`, `SameCommunityActivity`, `NoCommunityFoundActivity`, `NoAvailabilityActivity`, **`LowActivityActivity`** (an empty-state for low-density communities — they built density-aware UX), `CouponRedeemActivity`, `OrderHistoryActivity`, `ConfirmationActivity`, `PermissionsActivity`. Strings show it bundles **free local events** (sample titles: "Free rooftop Yoga," "Old town walking tour," "Karaoke night," "Local Food experience," "Laidback Jazz festival").

### 3.3 Gatherings — the events product anatomy

`GatheringsRouter/Pager/Onboarding`, `EventsCategoryActivity`, `EventDetailsPager`, `GatheringParticipants`, **`GatheringPostJoinActivity`**, `ReviewGathering`, `LeaveGathering`, `ReportGathering`, `MyGathering`, plus `TripsActivity` under gatherings. Strings: "Introduce yourself and start chatting with other travellers in this **Linkup**!", organiser notices, invite messages ("You've got an invite!"). **Each gathering = joinable event + chat room + participants + post-join flow + review + report.** This is the event→meetup pipeline we specced as P1 — now with its exact production anatomy: *event, chat, members, join, review, moderate*.

### 3.4 The "Hang out" badge — our P0 gap, already shipped

`explore_hangout_title` "Hang out" (tagged **"New!"**), `hangout_onboarding_message`: **"Get a badge that lets other travellers know you want to meet and hang out."** Status renders on chat members, replies, and reactions (`chat_members_hangout_status` etc.), and `MeetTravellersActivity` is the hub. **This is precisely the real-time openness signal our gap matrix ranked #1** — Hostelworld has shipped it as a profile/chat badge. Implication: our version must differentiate (time-boxed "free tonight" windows, intent, guardian-aware — not a standing badge that decays into noise).

### 3.5 Everything else the inventory adds

- **Chat depth**: message **reactions**, **threaded replies**, **polls** (`PollActivity`, "Conversation"), group-chat creation + add-traveller, interests-scoped chats (`ChatInterestsActivity`), members list, block/unblock/report at user *and* gathering and travel-plan and review levels.
- **Travel Plans**: a full trip entity — create/edit (dates, location, content), **recommendations**, sort, share, **Instagram share with a guide** (`TravelPlanInstagramGuideActivity`), report, delete; separate sign-in surface; "social cues" on plans and properties (`TravelPlansSocialActivity`, `PropertySocialCuesActivity`).
- **Profile richness engine**: pronouns, languages, hometown, cities, where-to-go, **TravelVibe**, **LookingFor**, interests; **`MeetTravellersRewardActivity`/`TravelPlansRewardActivity`** ("Your profile is complete and live… You're all set to meet the world") + **`MyStatisticsActivity`** — completion rewards and personal stats (gamification aimed at profile/trust data, not engagement streaks).
- **Monetization stack**: Stripe (PaymentSheet, Link, ShopPay, Google Pay, 3DS, BACS/SEPA — full international), **Datatrans** (Swiss PSP), Play Billing, saved-card Wallet, `threepi` saved-cards, **`experiment.checkout.variationA.*`** — checkout **A/B experiments shipped in release builds**.
- **Retention machinery**: Iterable (CRM/push), **`SoftwallActivity`** (soft-wall interstitials), in-app deep links, soft messages, onboarding tutorials, wishlists (full CRUD), price alerts, invites.
- **Trust artifacts**: verified-property-chat banners ("You're speaking with the property in a verified chat. Read our tips to stay safe online"), sustainability details, review filters by **age group** and language, "All female group" review tags, female-only **dorms** (accommodation, not social).
- **Privacy/security**: biometric/fingerprint app-lock, privacy settings, marketing-consent flows (GDPR hygiene).
- **What's absent**: zero SOS/emergency/check-in strings; zero women-only *social* mode; zero identity verification beyond payment identity. **The guardian wedge is uncontested at the deepest layer we can see.**

### 3.6 Mobile vs web delta (vs the REA web pass)

Web showed the SEO machine (events directory, programmatic geo tree); mobile shows the **product**: gatherings lifecycle, chat depth (reactions/replies/polls), the Social Pass funnel with pricing, the Hang-out badge, travel plans with Instagram sharing. The two surfaces are complementary by design — the same web-funnel/mobile-product split our FOUNDATIONS pillar 5 mandates.

---

## 4. What this changes (deltas to the gap matrix and roadmap)

All [Inferred], each grounded above:

1. **Gap #1 (real-time openness) is now a race.** Hostelworld shipped "Hang out" badges. Our P0 should proceed, but as **time-boxed, intent-bearing presence** ("free tonight, wants dinner"), not a standing badge — and the guardian can context it (safe-public-place suggestions).
2. **Close gap #7 (pre-meetup calls) — now validated twice** (Tourlina binary: call notifications + video icon; BFF earlier). Calls belong in the Phase B concierge surface, in-app, pre-meetup, guardian-adjacent.
3. **Design our gating ladder as trust-rungs, mirroring Hostelworld's commitment-rungs**: booking→€4.99→profile-complete becomes *selfie-verified→ID-verified→reputation-gated*. The mechanism is proven at €4.99 entry; our currency is verification instead of payment (with the subscription selling perks/dispatch/events, per charter).
4. **Copy the Gatherings anatomy for our events layer**: event + chat + participants + join + post-join + review + report is a complete, battle-tested object model for city hosts' recurring events (P1).
5. **Chat depth is table stakes**: reactions, threaded replies, polls — group-chat features Travello/BFF also carry. Our group-substrate refactor should include them (group-scoped, guardrail-compatible).
6. **Ephemerality-as-a-feature** ("chat disappears after check-out / pass end") solves retention-hygiene and density decay — consider time-boxed city cohorts that archive, matching our ephemeral-local thesis (PRODUCT §4).
7. **Tourlina's paywall taxing connection (chat caps, location moves) is the counter-position gift**: our marketing can say "no chat limits, no ads, ever" credibly because our charter already forbids it.
8. **Instagram-share guides for trips** (TravelPlanInstagramGuide) — cheap, viral, exactly our web-share pillar; adopt for trips/memories.
9. **Checkout A/B experiments in release builds + density-aware paywall empty states** (`SocialPassLowActivityActivity`) — operational maturity markers worth adopting: feature-flag discipline and density-aware subscription UX (don't show the paywall where there's no community yet — show the city-density plan instead).
10. **Stack notes**: Tourlina = Flutter + GraphQL + RevenueCat (same substrate family as ours — Flutter per CLAIMS.md); Hostelworld = Kotlin/Compose + Stripe/Datatrans + Iterable + Sendbird (web pass). Buy-not-build confirmation for chat (Sendbird) and subscriptions (RevenueCat) in this market.

---

## 5. Updated standing posture on REA + APKs

This pass supersedes the "never decompile competitor APKs" line in the two prior teardowns — replaced by a **risk-managed facts-only posture**, adopted at founder direction and documented here for consistency: public-mirror binaries, version-verified, manifest/resources/string-literals only, no code copying, no redistribution, no auth bypass, mirror-provenance caveat carried into any strategic use of findings. The JADX/class-decompilation layer remains unused by policy; escalate only if a future question genuinely requires it, and re-document if so.

## Evidence artifacts

_All files below live in the gitignored local evidence dir (`docs/research/artifacts/rea/`) — retrievable on demand, not in git history._

| ID | File | What it is |
|---|---|---|
| [A1] | `artifacts/rea/tourlina-res.json` | REA decode-android-resources evidence — Tourlina 2.0.23 base APK (manifest XML, metadata, projected strings) |
| [A2] | `artifacts/rea/tourlina-en.json` | REA decode of `config.en.apk` split (system strings only — Flutter apps carry UI strings in the Dart snapshot) |
| [A3] | `artifacts/rea/hostelworld-res.json` | REA decode evidence — Hostelworld 9.109.0 base APK (manifest + 2,000 projected strings) |
| [A4] | `artifacts/rea/apk-inventory-summary.json` | Parsed permissions/activities/services inventories for both apps |

Raw binaries and decoded trees remain in ephemeral `/tmp/solo-research/` (not committed). Dart-snapshot string extraction performed with `strings(1)` on `libapp.so` from the ABI split.

## Coverage & Limitations

Retrieved: 2026-10-11 · Targets chosen by us: the direct wedge competitor (Tourlina) and the category leader (Hostelworld), both app-first products the web pass couldn't fully reach.

| Check | Result | Source | Retrieved |
|---|---|---|---|
| Tourlina manifest/permissions/activities | 有记录 / covered | A1, A4 | 2026-10-11 |
| Tourlina UI string inventory | 有记录 / covered via Dart-snapshot string literals (63,906 strings extracted; feature families verified in context) | A1 + strings pass | 2026-10-11 |
| Hostelworld manifest (226 activities) + 2,000 strings | 有记录 / covered | A3, A4 | 2026-10-11 |
| Binary provenance (Play-original) | 源不可用 — APKPure mirror; package/version internally consistent with Play listings, but no cryptographic verification against Play originals was possible | §1.3 | 2026-10-11 |
| Social Pass price outside EUR / full tier table | 检索范围内未发现 — only the EUR entry price string ("from €4.99") is in the binary; full tier pricing requires the live paywall | A3 | 2026-10-11 |
| Tourlina call infrastructure vendor (Sendbird/Agora/etc.) | 检索范围内未发现 — call notifications + video icon confirm the feature; the SDK vendor is not identifiable from strings | A1 | 2026-10-11 |
| JADX class-level decompilation | Not performed — policy (§1.1) | — | — |
| Couchsurfing / BFF / Travello APKs | 检索范围内未发现 (not attempted) — two-app scope fixed in advance; BFF/Travello add marginal signal over web+desk findings | — | — |

Comparability notes: Tourlina findings describe v2.0.23 (build 606); Hostelworld v9.109.0 (build 670910900) — both the current mirrored releases at retrieval time; features may differ in later builds. Flutter string-literal extraction sees literals, not composed UI — absence of a string is weaker evidence than presence (noted where relied on, §2.1, §3.5). **Redaction (2026-10-11):** competitor-embedded Google API key literals present in the decoded string resources were redacted from the committed evidence JSONs before merge (each file carries a `_redaction_note`); evidence integrity otherwise unchanged.
