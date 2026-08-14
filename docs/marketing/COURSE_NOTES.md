# Course Notes — "Claude Code Marketing Full Course" (Nick Saraev, 6h02m)

Source: youtube.com/watch?v=yulWjh3rq28 · digested 2026-08-14 for the SoloAdventurer
zero-budget waitlist campaign. Timestamps are MM:SS from the video.

---

## Part 1 — Foundations (00:00–1:15:23)

### Welcome (00:00–3:30)

Five marketing functions the course automates: **creative generation** (images/video/audio),
**copy personalization** (newsletters, fuzzy-variable emails), **speed to lead** (instant
response to intent), **data collection/tracking/dashboards**, **automated follow-ups**. Every
build climbs the same ladder: prompt → skill → loop → cloud routine.

### Setup (3:30–7:54)

Claude chat is free; Claude Code needs a paid plan (~$20/mo). _(We already run Claude Code —
skip.)_

### Interface tour — automation-relevant only (7:54–47:17)

- **Skills (15:00):** reusable instruction sets invoked as slash commands; chain granular
  skills into one meta-skill (his YouTube stack: titles→thumbnails→descriptions→publish became
  a single command that "replaced entire roles").
- **Memory (20:00):** persistent facts — feed it positioning/audience once so every prompt
  starts pre-loaded.
- **Routines (20:45):** templated skills on schedule/webhook, running in Anthropic's cloud
  without your machine on. Max automation.
- **Slash commands (29:00):** `/loop <interval>` runs any skill on a timer; `/usage` tracks
  token spend per skill.
- **Artifacts (9:15):** self-contained shareable web pages — free hosting for dashboards.
- **Environments (22:30):** cloud envs standardize credentials so automations run anywhere.

### RACE framework (47:17–1:03:06)

**Reach → Acquire → Close → Expand.** Marketing owns Reach + Acquire only; the rest is sales.

- Reach levers: **creative volume**, **copy personalization** (inbound + outbound).
- Acquire levers: **speed to lead** (respond in ~30s; claims 300–400% lifts; one client
  $3M→$9M/month from this alone), **form simplification** (10 fields → 3–4; AI research
  replaces dropped qualification), **follow-up** (personal-feeling nurture).
- **Bottleneck theory (57:30):** a pipeline runs at its narrowest step. Doubling a
  non-bottleneck changes nothing. Diagnose first, automate only the constraint. _This is why
  our campaign order is: fix the page → distribution → only then creative volume._

### Prompts vs skills vs loops vs routines (1:03:06–1:15:23)

- Prompt: manual, every step. Skill: saved instruction set (the moment you say the same thing
  twice → skillify). Loop: skill + timer on your machine. Routine: in the cloud, runs without
  you ("$1 of tokens → $100 of deliverables").
- **Process-first (1:12):** never let AI invent the process. You own the process and the
  quality judgment; AI executes the middle. 3 steps at 80% = 51% success — minimize steps.
- Generate volume (dozens–thousands), human picks the winners.

---

## Part 2 — Creative automation (1:15:23–3:11:12)

### Ad creative process (1:15:23)

Template library of proven formats → variables (niche/offer/angle) → generate all combinations
→ human reviews and ships. **Precondition: creative must actually be your bottleneck.**
Templates sourced free from the **Facebook Ads Library** (screenshots of proven ads).

### The procedural, $0 creative path (26:00–38:00)

Claude can't generate images for free, so it builds **rules**: HTML/CSS + SVG + ImageMagick
rendering of template "bands" (logo band / headline band / negative space / product band /
CTA band), tuned via a slider web page, exported as a **JSON profile**, reused at ~80%
conformity so any product hot-swaps in. Explicit cost logic: image-gen APIs ≈ $200/batch vs
procedural ≈ free. Output: contact sheets of 50, keep the best 4.

### Prompt → skill conversion (1:42:53)

After a build converges: consolidate into a SKILL.md with trigger-condition description ("use
whenever asked for ad creative…"), test in a **fresh chat with zero context**, then portability
test on a different product. Then loop (5:59am cron batch), then cloud routine (private GitHub
repo + Google Drive connector for output).

### Direct image-gen v2 (1:55+)

Compositing ≈ 80% usable at near-zero cost; direct gen (GPT Image 2 etc.) ≈ 25% usable and
**PAID** — skipped for us.

### AI video (2:35:08)

Higgsfield (PAID). Best format: UGC-style testimonials. QA idea worth stealing: split video
into 1-second frames, AI flags malformed ones, human watches survivors. **Skipped — paid.**

### Turning builds into repeatable skills (2:59:15) — the key chapter

The exact conversion spec: inputs defined (product + influencer images) → prep → generate
candidates → **approval gate BEFORE spending credits** → produce → human oversight only at the
last step. Lessons: duration derived from word count (<22 words = 8s); cross inputs
(A×1, A×2, B×1, B×2); cap concurrency (~3) and retry serially; estimate cost before running.

---

## Part 3 — Personalized copy, speed-to-lead, tracking, follow-ups (3:11:12–6:02:49)

### Newsletters (3:11:12)

**Hard vs fuzzy variables:** hard = copied verbatim (name, city); fuzzy = hard data passed
through AI into a contextual phrase, named for the agent (`shortPlausibleReasonWhyTheySignedUp`).
Template hand-written by human; AI fills 2–3 fuzzy columns per row, **individually, never
reusing a sentence**; write to a new sheet, never touch the source; ~10 words per fuzzy value.
Signup friction capped at ~2 questions.

### Cold email + fuzzy variables (3:43:01)

Reply rates: templated 1–2% → personalized ~5% (2–2.5× revenue on pure outreach); best ever
20%+ with conference lists. Anatomy: lowercase casual "yo [name], saw {thing in common}…" —
feed AI a blurb about _yourself_ and it finds the overlap. Deliverability: never blast fake
addresses; no unsubstantiated numeric claims; **imperfect grammar beats polish — perfect
grammar + em-dashes now reads as AI spam**. He deliberately does NOT loop daily sends
(bottleneck thinking). _(Our `/pr-pitch` skill implements exactly this, manually, free.)_

### Speed to lead (4:06:22)

Respond in ~30s, not 10 minutes — the prospect is still in the same mindset. Message
principles: paraphrase their request in ≤10–15 words (shorter = more human), casual, human
signature, concrete next step with a time bound. Nuance: _too_ fast reads fake — ~30s is the
plausible zone. _(Our version: instant welcome email once Resend sender is verified — Resend
free tier 100/day.)_

### Data, tracking, dashboards (4:36:37)

Single-source-of-truth HTML dashboard ("a web design project, not a data project"). Channel
attribution = an attribution_paths table + per-channel CPL. Threshold alerts (5× drop =
critical). Deploy free on Netlify. _(Our version: PostHog EU is already the pipeline — wire
events, use free PostHog insights, UTM params per channel. No custom dashboard needed yet.)_

### Follow-ups (5:09:55)

Robust follow-up alone adds 20–30%. Architecture: CRM as a glorified sheet → daily query →
**pick from a pre-written TEMPLATE LIBRARY, never raw generation** (tone-consistent, no
catastrophic screw-ups) → check history so never the same template twice → opt-out detection
halts the sequence. Cadence: day 1, 2, 3, 7, 14, 21, 28, 56, 84. Ten soft one-line nudges.
_(Our version: waitlist nurture via email once there's a list — day 0 welcome, day 2 founder
story, day 5 referral ask, weekly until launch.)_

### Maintenance (5:35:45)

1. Logins/auth are 70% of maintenance issues — collect credentials upfront.
2. **Self-healing rule:** same error 3× → something materially changed; fix it, then update
   your own skill with a changelog entry.
3. Log errors somewhere visible — AI automations fail silently.

### When NOT to automate (6:01:35)

"Effectiveness beats efficiency." Automate data entry, first drafts, reporting. **Never final
assets, bad news, or anything where a person must feel valued** — "automation should buy you
more time with people, not replace the time you have with them." Filter: does the customer
feel this process? Is a relationship at risk? _(Our rule: the mechanical is automated; every
reply from a journalist or an excited group member is manual, always.)_

---

## What we deliberately skipped (and why)

Paid tooling throughout the course — Instantly/Apollo/Sales Nav (lead scraping + sending),
GPT Image 2 / nanobanana (image gen), Higgsfield (video), SMS/voice (Twilio + A2P). Campaign
constraint is $0; the free procedural/fuzzy-variable/manual equivalents cover Reach+Acquire.
