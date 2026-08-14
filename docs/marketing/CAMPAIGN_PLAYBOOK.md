# Campaign Playbook — Zero-Budget Waitlist Launch

The operating manual. Order matters; it follows bottleneck thinking (fix the funnel, then
widening the top pays). Companion files: `CLAIMS.md` (what copy may say), `LAUNCH_TRACKER.md`
(where everything is logged), `COURSE_NOTES.md` (the method this is built on). Skills:
`/fb-group-post`, `/pr-pitch`.

## Funnel and north star

```
Reach (post/pitch/listing)  →  /waitlist view  →  signup  →  referral share  →  next signup
```

North star for the campaign phase = **signups** (the product north star stays
`meetups_completed` — emitted by the app once it exists in users' hands). Everything measured
in PostHog (EU, consent-gated). Events: `$pageview`, `waitlist_signup`, `share_click`,
`referral_landing`.

## Phase order

| Phase | Channel                      | Cost          | When                                                                                      |
| ----- | ---------------------------- | ------------- | ----------------------------------------------------------------------------------------- |
| 0     | Page readiness               | done (PR #35) | shipped 2026-08-14                                                                        |
| 1     | Analytics live               | $0            | as soon as PostHog key is set in Vercel                                                   |
| 2     | Directories (BetaList first) | $0            | day 1–3 — lowest effort, evergreen                                                        |
| 3     | Facebook groups              | $0            | week 1 reactivate (already a member of 39); week 2+ staggered founder posts in tier order |
| 4     | PR outreach                  | $0            | week 2+, rolling (long lead times)                                                        |
| 5     | Product Hunt                 | $0            | gated: ≥100 signups + real testimonials                                                   |

Phases 2–4 run concurrently once started. Never let one channel's bad day stop the others.

## The weekly ritual (30 minutes, every Monday)

1. PostHog → funnel `$pageview → waitlist_signup` for the last 7 days; note conversion rate.
2. Break down by UTM source (URL params on `$pageview`). Rank channels.
3. Open `LAUNCH_TRACKER.md`, update statuses, pick **one** channel to double down on
   (the narrowest step — biggest mover, not the loudest).
4. 3 outreach actions minimum (submissions, posts, or pitches) logged in the tracker.

Rule from the course: the campaign runs at its narrowest step. If views are low → more
distribution. If views are fine but signups aren't → page problem, stop posting.

## Facebook groups — the rules that keep the channel alive

Status: already a member of **39 travel groups** (triaged in `LAUNCH_TRACKER.md`). Most were
last visited a year+ ago — an account that goes silent-for-a-year then founder-posts across
dozens of groups is the exact pattern Facebook spam detection and admins nuke. Hence:

1. **Reactivation week first.** Before any founder post in an existing group: visit it, react,
   and leave 2–3 real comments across ~7 days. Newly joined groups (the JOIN NOW list) still
   need the full 2-week participation window from join date.
2. **Stagger hard: max 1–2 founder posts per day across ALL groups**, always different text and
   angle. Never more than ~8 groups per week. Slow is the strategy — the account survives.
3. One founder post per group per week, max. Comments 3–5× more than posts.
4. Never link-drop; links live in DMs and only where rules clearly allow.
5. Every post anchored on something real from that group this week (`/fb-group-post` enforces).
6. Removal/warning = 30-day cooldown for that group; reassess the rules after. Two cooldowns in
   one week = pause all FB posting for 7 days (account-level signal).
7. Post order = tracker tier order: Tier 1 intent groups → Tier 2 women's wedge → Tier 3 →
   Tier 4 launch-city country groups. Skip the engagement-bait tier entirely.
8. Join the JOIN-NOW wedge groups (Girls LOVE Travel first) **today** — their 2-week clocks
   only start when you join.

## PR — the rules that get replies

1. One pitch at a time, from the personal Gmail, never bulk.
2. Every pitch opens with a ≤10-word detail from their recent work.
3. Offers menu: interview · early access · founder guest essay. Deliver same-day on a yes.
4. Follow up day 3 and day 7, one line each, then stop.
5. Replies are answered by hand, always (relationship moments are never automated).

## UTM conventions (attribution without any new tooling)

```
?utm_source=<site|fb_group_slug|outlet>&utm_medium=<directory|social|pr>&utm_campaign=waitlist
```

- One source string per place the link appears (e.g. `fb_group=girls-love-travel`).
- Referral links (`/r/{code}`) carry no UTMs — they're tracked via `referral_landing`.
- Review the breakdown weekly (ritual step 2).

## Asset shelf (approved copy, reuse freely — within `CLAIMS.md`)

**One-liner:** SoloAdventurer is a safety-first mobile app where solo travelers meet verified
people in the city they're in right now.

**Short blurb (directories, ≤140c):** Meet verified solo travelers in your city. ID-verified
badges, mutual opt-in messaging, safety built in. Private beta — join the first 1,000.

**Medium blurb (PH/directories):** SoloAdventurer turns "I'm traveling alone" into "I'm having
dinner with someone verified tonight." Government-ID badges, no message lands until both sides
accept, women-only spaces, safety check-ins and SOS. Free private beta for iOS and Android —
founding members get priority access in the first cities.

**Founder story (posts/pitches opener):** I spent two years traveling solo across 30
countries. The best moments were never the sights — they were the people. I built
SoloAdventurer so finding your people doesn't have to rely on luck.

**Launch cities line:** starting with New York, London, Tokyo, Barcelona, Bangkok, Lisbon.

## Product Hunt gate (Phase 5)

Open when: ≥100 signups AND ≥2 real testimonials from invited beta users. Assets to prep
2 weeks before: gallery shots, 30-second demo clip (phone screen-recording is fine), founder
commentary ready for the first 3 hours (be present the whole launch day).

## Cost ceiling

$0. No paid ads ever (charter). No paid directories, no paid tools, no boost posts. If a
channel requires money, it's out — write it in the tracker as `passed (paid)`.
