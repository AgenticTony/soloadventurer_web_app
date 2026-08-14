# Marketing Claims Contract

**Every piece of campaign copy — waitlist page, FB posts, PR pitches, directory listings —
must comply with this file.** It exists because SoloAdventurer's entire positioning is _trust_;
one overstated claim costs more than ten campaigns gain. (Charter: `docs/FOUNDATIONS.md` §6.10
bans unbacked social proof.)

Last verified against the codebase: 2026-08-14.

## ✅ TRUE TODAY — say freely

| Claim                                                                            | Backing                                                       |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Verified ID badges (government ID + selfie check)                                | Shufti Pro flow shipped in app (`verification` feature)       |
| Mutual opt-in messaging — no message lands unless both accept                    | Connections are request/accept via edge functions             |
| Women-only spaces, built in from day one                                         | Backend + matching guards shipped; charter core strategy      |
| Safety toolkit: check-ins, live location, SOS, trusted contacts, share-my-meetup | Most-built surface of the app (`safety` feature, 13 screens)  |
| AI-assisted traveler matching (semantic + trip overlap)                          | `find-potential-matches-semantic` + pgvector embeddings, live |
| Private travel journal + itinerary planner                                       | Shipped (`journal`, `travel` features)                        |
| Destination discovery with bookable experiences                                  | Viator integration shipped                                    |
| Private beta / waitlist / first 1,000 founding members                           | `waitlist_entries` live in prod, cap 1000                     |
| Free to join; iOS and Android app                                                | Flutter iOS+Android; not yet on app stores (private beta)     |
| Early members get priority access at launch                                      | Waitlist rank mechanic, by design                             |

## 🚧 ROADMAP — only with explicit "coming/plan to" framing

| Claim                                                      | Status                                                                                                                                                       |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| AI concierge (drafts first messages)                       | Phase C, not built                                                                                                                                           |
| AI guardian (meetup risk-scoring, pre-delivery moderation) | Phase C, not built                                                                                                                                           |
| Visible reputation / vouch scores                          | Reward function exists in SQL; **no client UI, zero data** — never quote a number or a "vouched for by N travelers" line                                     |
| Pro subscription purchases                                 | Paywall UI exists; payment SDK deferred — purchases are simulated. "ID verification available in Pro" is fine (tier concept is real); "buy Pro today" is not |
| Report adjudication / moderation team                      | Reports table + admin backend exist; no trust team. Say "block and report tools", never "our team monitors"                                                  |

## ❌ NEVER SAY

- Dating / swipes / "Tinder for travel" as a _description_ (the charter explicitly repudiates
  matching-app framing; "the anti-Tinder" is allowed as positioning contrast in PR only)
- Social feed / followers / content-for-scroll (feeds retired; charter §6.1)
- Partner discounts, travel perks, coupons (no partnerships exist)
- User counts, testimonials, quotes from "users", press logos (zero users; §6.10)
- Launch dates, city guarantees ("starting with" our six priority cities is the strongest
  phrasing allowed)
- "Trust team monitors around the clock"
- Engagement/usage numbers of any kind (north star is real-world meetups, not metrics)

## House style for outreach copy (from the course + charter)

Short sentences. Casual, lowercase energy. First person. **No em-dashes, no polished marketer
grammar** (reads as AI spam). One real, researched detail per message. The ask is conversation,
not signup.
