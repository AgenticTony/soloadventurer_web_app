# Round 2 — External-Report Comparison + GAFFL / NomadHer / Timeleft Teardown

> **Companion to:** `solo-travel-apps-competitive-teardown.md` (desk) · `solo-travel-apps-rea-technical-teardown.md` (web bundles) · `solo-travel-apps-apk-teardown.md` (Tourlina + Hostelworld binaries)
> **Inputs:** an external desk-research report (7 apps: Hostelworld, Couchsurfing, GAFFL, Meetup, BFF, NomadHer, Timeleft) provided by the founder 2026-10-11, plus a REA facts-only investigation of the three apps that report added and we had not covered: **GAFFL, NomadHer, Timeleft**.
> **Method for new apps:** same posture as the APK teardown — public-mirror XAPKs via apkeep (risks acknowledged), version-verified, REA `decode-android-resources` (apktool 3.0.3), manifest + native strings + JS-bundle/Dart string-literal extraction, windowed context checks, false positives discarded. Retrieved 2026-10-11. Evidence kept **local-only** at `artifacts/rea/` (gitignored — legal review 2026-10-11).

---

## 1. How the external report compares to our three-layer research

### 1.1 Where we agree (mutual validation)

Both independently converge on: Hostelworld's social feature list (travel plans, city/hostel chats, profiles, events, Social Pass); Meetup's organizer-pays pricing ($29.99/mo, Pro $55); Couchsurfing's membership model; BFF's selfie verification + trust controls; the **"never charge for basic connection"** principle (their Couchsurfing/GAFFL risk notes ≈ our Couchsurfing cautionary-tale lesson); phased rollout; cold-start-by-city. Notably, their "what to measure" table (plans created → accepted connections → confirmed attendance → repeat use) is nearly identical to our reward-function v0.1 inputs (FOUNDATIONS §4) — independent convergence on outcomes-not-engagement is strong validation of the charter.

### 1.2 Where the external report is better than ours

1. **Three apps we had not covered — one of them critical.** **NomadHer** is the most important omission from our set: a women-first app with manual identity verification is the *nearest trust-axis competitor* to our wedge, and our set only had Tourlina — who pivoted away from women-only (APK teardown §2.1). GAFFL (itinerary-overlap matching) and Timeleft (curated group dinners) also add format-representatives we lacked.
2. **The full Social Pass price ladder.** They publish €4.99/week, €9.99/month, €19.99/3-months, €59.99/year (one-time). We had only the entry price from the binary. **We verified their numbers exactly** from the live page (§2) — this is a real contribution.
3. **Implementation mapping.** Their data-model and RLS/Edge-Function guidance maps to our Supabase stack; none of our teardowns do implementation mapping. Useful input for sprint planning (with the caveat that several proposed tables — trips, meetups, check-ins — already exist in our schema; their report says it didn't inspect the repo, so treat its schema as proposals, not gaps).
4. **Strategy packaging:** revenue calculator, single-paid-option launch discipline, don't-sell-trust-badges rule — all consistent with our charter, well articulated.

### 1.3 Where ours goes beyond theirs

1. **Code-level evidence vs. desk-only.** Their report reads product pages; ours reads shipped code. Concrete Hostelworld items their report does not know exist: the shipped **"Hang out" badge** (our P0 gap), the **chat-gating ladder mechanics** (booking → €4.99 city chats → photo+DOB for DMs), **ephemeral chats** ("disappears when your Social Pass ends"), the Gatherings object model (event+chat+participants+join+review+report), events-as-SEO-directory, checkout A/B experiments in release builds, and the `enableAIReviewSummary` flag.
2. **The trust-axis competitive picture.** Their set omits Tourlina entirely — so they miss the in-binary finding that the *first* women-only app abandoned women-only, which is the fact that makes NomadHer the last trust-axis incumbent standing. They also miss the **noyb GDPR complaint against BFF's AI icebreakers** (a compliance blocker for our concierge in the EU).
3. **Provenance.** Their citations resolve to image-proxy URLs we can't audit; every claim in our docs carries a numbered source or an evidence ID. (Not a knock on their findings we could check — the two we tested were both accurate — but an auditable trail matters for a research file.)
4. **Business-model depth:** financial grounding (Hostelworld FY2024 €92.0M/6.9M bookings, H1 2026 chat-conversion 65→74%), vendor stacks (Sendbird, RevenueCat, Stripe+Datatrans), Mindtrip's B2B-embed + creator-commission architecture (not in their set at all), and the enshittification boundary cases (Bending Spoons/Meetup).

### 1.4 Claims from the external report, checked against evidence

| Their claim | Our check | Verdict |
|---|---|---|
| Social Pass €4.99/wk, €9.99/mo, €19.99/3mo, €59.99/yr, one-time | Live `hostelworld.com/socialpass` HTML: exact ladder incl. per-day pricing (€0.71/€0.33/€0.22/€0.16 per day) | **Verified** [E5] |
| Hostelworld FY2025: €93.8M net revenue, €19.9M adj. EBITDA | Consistent with our investor-page data (FY2024 €92.0M, €21.8M; FY2025 €93.8M) | **Consistent** (different FY than our primary pull) |
| NomadHer "manual review of identity documents and selfies" | Binary: document-verification copy + "upload a clear selfie… to guarantee your safety within the community" | **Verified in-binary** [E6] |
| GAFFL paid "Unlimited" from US$3.33/mo (long-term pricing) | Pricing is server-side; not present in the decoded binary (tier *names* are: Unlimited, Unlimited Plus) | **Unverified — plausible, check live app** |
| Timeleft "plan covers the event spot; food/drinks paid at venue" | Binary shows monthly subscription + per-event booking flows; "mostly capped at 8 GBP" price-cap string | **Partially consistent** (server-side pricing n.d.) |
| Timeleft women-only dinners Tuesdays | Binary: "**Bolt and Timeleft are teaming up for Women-only Dinners, every Monday**" | **Discrepancy** — version/date drift between their source and the 6.20.0 binary; cite ours as of build 1189 [E7] |

---

## 2. GAFFL 2.33 (build 233) — the itinerary matcher that became a travel supermarket

Native Kotlin app, 95 activities — **52 of them GAFFL's own** (the most own-feature surface we've seen in the set). Website gogaffl.com; Play: `com.gogaffl.gaffl` (190+ countries claim, "100,000+ trips started" per listing).

### What the binary adds beyond the external report

- **"Trip Builder" AI** — `ai_promt_first`: *"Hi! I am Trip Builder, an AI from GAFFL to help you build your perfect trip. Ask me anything…"* — an AI trip assistant that adds "things to do, places to eat, trip notes to your upcoming trip with one click" (`ai_add`). **Metered**: `ai_pay` — *"You've reached your maximum daily limit. Please upgrade to GAFFL Unlimited Plus to get Unlimited Ch[at]"*. So GAFFL now has **three tiers visible in strings: free → Unlimited → Unlimited Plus**, with AI chat and exclusive browsing as the top-tier hooks.
- **A whole Stays + Flights booking module**: `StaysSearch/Booking/Details/Gallery/Filter`, `ReceiptActivity`, `FlightSearchActivity`, `StaysFlightsContainerActivity` — GAFFL has expanded from buddy-matching into an accommodation/flights booking surface (same "social → transactions" arc as Travello and Hostelworld; third data point that social alone doesn't pay).
- **"Become Local" — a locals marketplace** (`BecomeLocalActivity` + strings): locals offer three things — **advice** ("hidden gems of your local area"), **coffee/meetups** ("meet travelers when they are in your town"), and **couch** ("Do you have a home with extra space?… help travelers by letting th[em] stay"). GAFFL quietly re-created Couchsurfing-style hosting inside a buddy app, with locals **listings** users can like.
- **Verification ladder**: `connect_any_social_account` = "Verify Social (At Least 1)" (social-account verification as an entry rung) and `id_verification_pending` = "ID Verification (In Review)" (manual ID review rung). Cheap→expensive verification tiers — same ladder logic we specced, executed with social accounts and human review rather than an automated provider.
- Safety surface: minimal (report review/photo on Google-Places content). No SOS/check-ins. Matching = trip/itinerary-centric (`StartTripActivity`, `MyTripsActivity`, rich-text trip descriptions).

**Business model [Inferred from tiers + modules]:** freemium subscriptions (Unlimited / Unlimited Plus) + booking commissions (stays/flights) + a locals supply side. **Closest analog to our "matching + transaction" plan, one rung less trust.**

## 3. NomadHer 9.6.4 (build 509) — the last women-only incumbent, and it held the line

React Native + Stripe subscriptions + Notifee notifications; package `com.nomadher.nomadher2`; fine/coarse location, camera, **record audio** (voice messages). Play rating ~4.5.

### What the binary confirms

- **Women-only is enforced in-product, today**: onboarding copy — *"NomadHer is a safe community of women only"*; *"Membership is currently open to women only. We value your support!"*; meetup guidelines — *"Public venues, verified women only, and no selling"*; anti-bot copy — *"no bot makes it into NomadHer!"*. **The direct contrast with Tourlina's `gender_filter_everyone` pivot** (APK teardown §2.1) is now binary-verified on both sides: the wedge's two incumbents split — one abandoned it, one holds it.
- **Manual identity verification**: document-verification copy ("To verify your identity and ensure that we are being provided the correct inf[ormation]…") + selfie gate ("please make sure to upload a clear se[lftie]… to guarantee your safety within the community") — manual document+selfie review, as the external report claimed, now confirmed in code. This is **human-administered verification at small scale** — exactly the approach our automated Shufti + guardian stack is designed to out-scale.
- **Product surface**: **Travel Buddy announcements** ("Create Travel Buddy Announcement", "Travel Buddy disponible", "Searching for a Travel Buddy!", "TRAVEL BUDDY & PEOPLE", "Meet Fellow Travelers"); **geo meetups** ("New Meetup Nearby", "Find a new meetup", "meetup near you") with published guidelines; **cost-splitting groups** ("Groups are free or split at real cost"); community feed ("Share your story, ask for advice"); sponsor events (`ClickOnSponsorSessionEvent`); `IdCard` UI element; "CLOSING SOON" event states.
- **Moderation**: account-ban copy ("In response to numerous reports from fellow users, your NomadHer account has been banned due to violations of our community guidelines"), frozen-channel messaging, report flows.
- **Safety floor**: **no SOS/emergency features** (apparent "emergency" hits are Android's `application/emergencycalldata` MIME type — discarded as false positives). Safety = verification + moderation, not in-meeting tooling. **The guardian remains uncontested across every binary we've now decoded (Tourlina, Hostelworld, GAFFL, NomadHer).**

**Business model:** Stripe subscriptions (premium membership) + sponsored events/campaigns + curated experiences (per desk research: travel camps, partnerships). **This is the competitor our positioning must beat on merit: same audience, same trust promise, manual execution.** Their weaknesses vs us [Inferred]: manual verification (cost + latency), no in-meeting safety layer, no reputation system visible (buddy announcements are open, not outcome-gated), and community-feed dynamics (broadcast surface) rather than outcome-centric matching.

## 4. Timeleft 6.20.0 (build 1189) — curated group dinners, industrialized

React Native + **Expo**; Stripe + **Stripe Connect** (payout rails — consistent with paying venues/partners); Customer.io CRM; biometric support; Play-integrity license check; package `com.timeleft.app`. Scale per Play listing: **3M+ users, 200+ cities, 52 countries**.

### What the binary adds beyond the external report

- **Company-run, not community-run**: no host/ambassador program strings anywhere — Timeleft *operates* the dinners (host supply is theirs), the opposite of our city-hosts model. One format, perfected, at scale.
- **The matching stack**: a **2-minute quiz** ("Quiz de 2 min"), a *published* algorithm explainer (bundle contains the URL `timeleft.com/post/timeleft-algorithm-the-maestro-of-your-dinners/`), and themed table formats — movie lovers, work/future-of-work, **travel-explorer tables** ("Share a table, enjoy travel-inspired icebreakers").
- **Icebreakers as product**: "A fun icebreaker game", "in-app icebreakers made for tonight", per-theme question packs — the concierge-adjacent layer we specced (draft-the-first-message), executed as curated table content.
- **Venue-reveal mechanic**: "a dinner curated by Timeleft's matchmaking, in-app icebreakers, and after-dinner drinks at a bar **revealed in your app**"; "We'll reveal your meeting point before the run" — progressive disclosure of the meeting point (safety-adjacent gamification; also a no-show deterrent).
- **Women-only dinners are brand-sponsored**: "**Bolt and Timeleft are teaming up for Women-only Dinners, every Monday**" + a dedicated "Book a women-only dinner" flow and an enterprise page for the program. A ride-hailing brand **pays to sponsor women-only social programming** — direct evidence that women-first social products attract sponsorship revenue (external report said Tuesdays; the 6.20.0 binary says Monday — flagging the drift rather than reconciling it).
- **Monetization detail**: monthly subscription with strikethrough promo pricing ("{oldPrice} {price} for {duration} month"), per-event booking, "mostly capped at 8 GBP" price-cap copy, SMS phone verification at signup, and — operationally interesting — a **`NO_SHOW_US_PENALTY_TEST_ID`**: they A/B test no-show penalties. They treat reliability as an experiment; our reward function's `no-show` negative term is the same instinct.

---

## 5. What this round changes for us

1. **NomadHer replaces Tourlina as the named competitor in our narrative** — the one that held women-only. Beating them is a product argument: automated verification (minutes vs manual review), an in-meeting guardian (they have none), outcome-gated reputation (their buddy board is open), and AI-matched intent (they match by destination/date only). [Inferred]
2. **Sponsored women-only programming is proven revenue** (Bolt × Timeleft [E7]). Our women-only mode + city events is sponsorable inventory — add "women-only event sponsorship" to the Phase E revenue options.
3. **Curated-group-dinner mechanics are copyable at city scale**: 2-min quiz → themed small groups → curated icebreakers → venue reveal → post-event feedback. This is a *format* our city hosts can run as recurring programming; Timeleft proves willingness-to-pay for organized meetups ("mostly capped at 8 GBP" per seat).
4. **GAFFL's three-tier ladder (free/Unlimited/Unlimited Plus) with metered AI** is a caution and a guide: they gate AI chat and browsing behind the top tier — i.e., **they charge for connection depth** (anti-pattern per our charter), but the *metered-AI* mechanic (free daily quota → paid unlimited) is a legitimate pattern for our concierge if we ever need it.
5. **"Become Local" (GAFFL) validates our vetted-locals thesis** (PRODUCT §2: "verified travelers *and vetted locals*") — locals offering advice/meetups/hosting as a listing with likes. Ours adds what theirs lacks: verification + reputation on the local side.
6. **Verification-ladder convergence**: GAFFL (social account → manual ID), Tourlina (selfie), Hostelworld (photo+DOB → payment), NomadHer (document+selfie). Every player ladders verification; nobody but us automates it. Our P0 verification-ladder recommendation now has four industry implementations to benchmark against.
7. **No-show penalties as an A/B-tested surface** (Timeleft) — when our reward function's no-show term ships, run it as an experiment with a control, not a rule.

---

## Evidence artifacts

_All files below live in the gitignored local evidence dir (`docs/research/artifacts/rea/`) — retrievable on demand, not in git history._

| ID | File | Target | Layer |
|---|---|---|---|
| [E5] | (live fetch, not stored — `hostelworld.com/socialpass` HTML) | Social Pass pricing ladder | public page, 2026-10-11 |
| [E6] | `artifacts/rea/com.nomadher.nomadher2-res.json` | NomadHer 9.6.4 base APK (manifest + 947 native strings); JS-bundle string-literals pass | REA decode |
| [E7] | `artifacts/rea/com.timeleft.app-res.json` | Timeleft 6.20.0 base APK (manifest + 1,090 native strings); JS-bundle literals | REA decode |
| [E8] | `artifacts/rea/com.gogaffl.gaffl-res.json` | GAFFL 2.33 base APK (manifest + 1,207 native strings incl. 52 own activities) | REA decode |

Package IDs: NomadHer `com.nomadher.nomadher2` ([Play](https://play.google.com/store/apps/details?id=com.nomadher.nomadher2)); GAFFL `com.gogaffl.gaffl` ([Play](https://play.google.com/store/apps/details?id=com.gogaffl.gaffl)); Timeleft `com.timeleft.app` ([Play](https://play.google.com/store/apps/details?id=com.timeleft.app)). Same provenance caveat as the APK teardown (§1.3 there): APKPure mirrors, version-verified, indicative-not-forensic.

## Coverage & Limitations

Retrieved: 2026-10-11 · New targets chosen from the external report's set minus apps already covered.

| Check | Result | Source | Retrieved |
|---|---|---|---|
| GAFFL manifest/activities/strings | 有记录 / covered — 95 activities (52 own), 1,207 strings | E8 | 2026-10-11 |
| NomadHer manifest/strings + JS-bundle literals | 有记录 / covered — 947 native strings + RN bundle literals (verification, women-only, meetups, moderation) | E6 | 2026-10-11 |
| Timeleft manifest/strings + JS-bundle literals | 有记录 / covered — 1,090 native strings + Expo bundle literals (quiz, icebreakers, Bolt sponsorship, subscription) | E7 | 2026-10-11 |
| GAFFL live pricing ($3.33/mo claim) | 检索范围内未发现 — pricing is server-side; tier names confirmed, prices not in binary | — | — |
| Timeleft subscription prices / plan contents | 检索范围内未发现 — server-side; mechanics (striketrough promos, monthly sub) confirmed | — | — |
| Web bundles for the three sites | Not performed this round — app-first products; the APK layer carried the feature signal (marketing sites add little, per the Wanderlog lesson) | — | — |
| NomadHer iOS parity | 检索范围内未发现 — Android binary only | — | — |

Comparability notes: findings describe the mirrored builds current at retrieval (GAFFL 2.33, NomadHer 9.6.4, Timeleft 6.20.0). RN/Expo string-literal extraction sees literals, not composed screens — absence is weaker evidence than presence (relied on for NomadHer safety absence, flagged). **Redaction (2026-10-11):** competitor-embedded Google API key literals in the decoded string resources (GAFFL among them) were redacted from the committed evidence JSONs before merge (9 occurrences, 5 files; each carries a `_redaction_note`); evidence integrity otherwise unchanged.
