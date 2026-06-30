# Part 13 — The Founder's Framework

## 13.1 Intro — From Theory to Practice

Twelve chapters ago we set out a single question: _What can be built now that could not have been built when Facebook, Instagram, or TikTok started?_

We have walked through the Hook Model and dopamine prediction error (Part 1). Through virality, network effects, and the economics of attention (Parts 2, 5). Through retention, monetization, and community (Parts 4, 6, 11). Through the AI supply shock that bends every one of those curves (Parts 7, 8, 9). Through the anti-patterns that kill social startups (Part 10) and the safety surface that defines the next decade (Part 12).

Growth is the metric founders brag about; retention is the metric that kills them. The discipline that separates the few who survive from the many who do not is not insight — it is _evaluation_. The ability to look at an idea, a roadmap, or a shipped product and say, honestly, where it is strong, where it is fragile, and where it is quietly dead.

This capstone pulls the entire series into one tool: the Founder's Evaluation Framework. Eleven dimensions. A 0–3 rubric per dimension. A weighted total. And, most importantly, the judgment to know when a low score on one dimension is fatal and when a high score on another can carry the rest.

The core thread of this book — that AI does not just create content but changes the economics of network formation itself — runs through every dimension. A product that scores well on the 2010 playbook but ignores AI leverage is not a 2026 opportunity. It is an obituary waiting to happen.

This part is meant to be used, not just read. Score your idea. Score your competitor. Score your shipped product. Then decide whether to build, pivot, or stop.

---

## 13.2 The Founder's Evaluation Framework — Overview

The framework evaluates any consumer social product — incumbent or startup, idea or shipped app — across eleven dimensions. Each dimension has been covered in depth earlier in the book. Here we collapse them into a scorable instrument.

```
        ┌─────────────────────────────────────────────┐
        │        THE FOUNDER'S EVALUATION FRAMEWORK    │
        ├─────────────────────────────────────────────┤
        │  1. Virality            (Part 2)             │
        │  2. Retention           (Parts 1, 4)         │
        │  3. Daily usefulness    (Part 4)             │
        │  4. Habit potential     (Part 1)             │
        │  5. Network effects     (Part 5)             │
        │  6. Monetization        (Part 6)             │
        │  7. Switching costs     (Part 5)             │
        │  8. Defensibility       (Parts 5, 8)         │
        │  9. Community strength  (Part 11)            │
        │ 10. AI leverage         (Parts 7, 8)         │
        │ 11. Sustainability      (Part 12)            │
        └─────────────────────────────────────────────┘
```

**How to score.** Each dimension is scored 0–3.

- **0 — Absent.** The product does not have this property and has no path to it.
- **1 — Weak.** The property exists in trace amounts; a competitor could remove it in a sprint.
- **2 — Present.** The property is real, observable, and contributes to the product's staying power.
- **3 — Dominant.** This property is a structural advantage; it is the reason the product wins.

Maximum raw score: 33. We weight three dimensions (retention, network effects, AI leverage) at 1.5× because, in 2026, those are the dimensions that compound. The weighted maximum is 42 (see the scoring matrix in 13.14).

Two rules before you start:

1. **Score the shipped product, not the pitch deck.** Anyone can claim virality. Score the behavior you can observe.
2. **Score relative to the category.** A "3" in daily usefulness for a travel app looks different from a "3" for a messaging app. The bar is the best-in-class for that underlying need.

The framework is a forcing function for honesty. Use it that way.

---

## 13.3 Virality

**What it measures.** The product's capacity to acquire new users through existing users — K-factor, viral cycle time, and the psychological triggers that make sharing feel like the user's idea (see Part 2; Berger, 2013).

**How to score.**

- **0:** No native sharing mechanic; growth requires paid acquisition.
- **1:** Sharing exists but is friction-heavy or one-sided (export-to-social only).
- **2:** Built-in viral loop with short cycle time; invites, content, or status sharing drive measurable K.
- **3:** Inherently viral — the product is more valuable when shared, and the share is the experience (e.g., BeReal's simultaneous capture, Wordle's grid share, TikTok's sound remix).

**What good looks like.** Cycle time under 24 hours. A K-factor that exceeds 1 on a cohort basis before paid spend. Share triggers that exploit social currency, emotion, or practical value (Berger, 2013), not a "share" button bolted on.

> **Box: What AI changes — Virality**
>
> - AI personalizes the share: every invite becomes a 1:1 message, not a broadcast.
> - Agent-to-agent sharing emerges — your AI introduces you to mine.
> - The creative bottleneck on viral content collapses; supply is infinite.
> - Viral cycle time compresses as AI pre-drafts the invite.

**Takeaway.** If your product is not more valuable when shared, you do not have virality — you have marketing. Score accordingly.

---

## 13.4 Retention

**What it measures.** The decay curve of user engagement — D1, D7, D30 — and the completeness of the Hook (trigger, action, variable reward, investment) described in Part 1 (Eyal, 2014).

**How to score.**

- **0:** D1 below 20%; no observable hook.
- **1:** D1 of 20–35%; partial hook (e.g., action without variable reward).
- **2:** D1 above 40%, D7 above 20%, D30 above 10% — a complete hook exists.
- **3:** Retention curves that flatten, not just decay — D30 above 25% with a visible plateau, meaning the product has become a habit.

**What good looks like.** A flattening curve, not a particular number on a particular day. The best consumer products plateau at 20%+ of first-day users still active a month later (see Part 1). The plateau is the signal of a habit; the slope is the signal of a novelty.

**Takeaway.** Retention is the dimension that compounds against every other. A product with weak retention cannot realize its virality, its network effects, or its monetization. If you score a 1 here, every other score is suspect.

---

## 13.5 Daily Usefulness

**What it measures.** The frequency of the underlying need the product serves. A meditation app serves a daily need; a wedding-registry app serves a need that occurs once in a lifetime (see Part 4; Christensen's jobs-to-be-done, 2016).

**How to score.**

- **0:** Need arises less than monthly.
- **1:** Monthly to weekly.
- **2:** Weekly to multiple times per week.
- **3:** Daily, or driven by an external trigger (push, calendar, social) that creates daily sessions.

**What good looks like.** The need is real, frequent, and already part of the user's life — you are routing an existing flow, not manufacturing one. WhatsApp won because messaging was already the most frequent thing people did with a phone.

**Takeaway.** You cannot fix a low-frequency product with great execution. Pick a high-frequency need or accept a niche.

---

## 13.6 Habit Potential

**What it measures.** Whether the product can achieve the B=MAP condition (Fogg, 2019) — sufficient Motivation, Ability, and Prompt — and whether the cue is consistent enough to drive automatic behavior.

**How to score.**

- **0:** No consistent cue; the user must remember to open the app.
- **1:** External cue exists (notification) but no internal trigger.
- **2:** Internal trigger forms — an emotion or situation cues the app (boredom → TikTok; anxiety → Slack).
- **3:** The cue is automatic and tied to identity — the behavior is who the user is, not what they do.

**What good looks like.** An internal trigger loop (Eyal, 2014). The user opens the app in response to an internal state the product did not create and does not need to pay to surface.

**Takeaway.** Notifications are not habits. Habits are what remain when you turn notifications off.

---

## 13.7 Network Effects

**What it measures.** The type (direct, indirect, data, protocol, belief), strength, and defensibility of the network (see Part 5; Metcalfe's law, Reed's law).

**How to score.**

- **0:** No network effect; value is constant or decreases with users.
- **1:** Weak direct effect — more users = marginally more value, but easily substituted.
- **2:** Strong direct or data network effect with a measurable slope.
- **3:** Multi-sided, multi-type compounding effect (e.g., Uber's two-sided market plus data plus local density) that widens the moat with every cohort.

**What good looks like.** Value that grows faster than the user base. Local clustering. A cost of defection that rises with tenure (see switching costs, 13.9).

> **Box: What AI changes — Network effects**
>
> - Data network effects compound faster as AI extracts signal from smaller cohorts.
> - Personal AI agents form transient networks on the user's behalf.
> - "Belief" networks weaken as AI floods them with synthetic participants.
> - The unit of the network shifts from the user to the (user + their AI).

**Takeaway.** A network effect that does not strengthen with AI data leverage is a 2010 moat. Score it down.

---

## 13.8 Monetization

**What it measures.** Willingness to pay, ad-model suitability, and transaction potential (see Part 6).

**How to score.**

- **0:** No monetization path; users will not pay and advertisers will not buy.
- **1:** One fragile path (ad-only, with thin intent).
- **2:** A clear path with proven willingness to pay or strong ad intent (e.g., search, marketplaces).
- **3:** Multiple complementary paths — subscription, transaction, and ads — that reinforce each other.

**What good looks like.** A revenue model matched to the product's native behavior. LinkedIn monetizes recruitment because its core behavior is professional identity; it would not monetize as well as a photo feed.

**Takeaway.** Do not bolt on a business model. Match the model to the behavior, or the behavior will migrate to a product whose model fits.

---

## 13.9 Switching Costs

**What it measures.** The cost — in data, relationships, reputation, and relearned habit — of leaving the product for a substitute (see Part 5; Shapiro & Varian, 1999).

**How to score.**

- **0:** Zero switching cost; one tap to leave.
- **1:** Mild data cost (re-upload, re-follow).
- **2:** Relationship or reputation cost — leaving means losing an audience, a graph, or a score.
- **3:** Multi-layer lock-in — data, relationships, reputation, and habit together make departure punitive.

**What good looks like.** The longer a user stays, the harder it is to leave. The product's value is the user's accumulated investment, not just its feature set.

**Takeaway.** Switching costs are the quietest moat. Founders under-invest in them because they are invisible until the user tries to leave.

---

## 13.10 Defensibility

**What it measures.** The depth of the moat and the incumbent's likely response time (see Parts 5, 8).

**How to score.**

- **0:** No moat; a clone ships in 90 days.
- **1:** Feature moat only; incumbents can copy in a release cycle.
- **2:** Structural moat — network, data, brand, or regulatory — that takes an incumbent years to replicate.
- **3:** Multiple structural moats that compound; an incumbent could not replicate without unwinding its own business model (e.g., open-source protocol vs. a closed ad network).

**What good looks like.** The product gets _harder_ to attack as it grows, not easier. The moat deepens with use.

**Takeaway.** If your defensibility deck is "we move fast," you have no defensibility. Speed is a startup's starting position, not its moat.

---

## 13.11 Community Strength

**What it measures.** Group identity, the leverage of moderators and power users, and the density of user-to-user interaction that the platform does not mediate (see Part 11; Tajfel & Turner, 1979, on social identity; Dunbar, 1992, on group-size limits).

**How to score.**

- **0:** No community; users relate only to the product.
- **1:** Comments and reactions, but no durable groups.
- **2:** Persistent groups with shared identity and emergent norms.
- **3:** Community is the product — the software is scaffolding for relationships the platform cannot reproduce (e.g., Discord servers, Reddit subcultures, Strava clubs).

**What good looks like.** A user who would stay for the community even if every feature were cloned. Mods and power users who operate as unpaid, motivated labor because the community is theirs.

**Takeaway.** Community is the one asset AI cannot synthesize at scale — yet. Treat it as the load-bearing wall.

---

## 13.12 AI Leverage

**What it measures.** Whether AI is woven into the product's flywheel: data flywheel depth, agent integration, and personalization that improves with use (see Parts 7, 8).

**How to score.**

- **0:** AI absent or decorative (a chatbot nobody uses).
- **1:** AI used for a discrete task (summarization, tagging) but not in the core loop.
- **2:** AI in the core loop — personalization, generation, or matching that demonstrably improves with user data.
- **3:** The product is impossible without AI — the flywheel of usage → data → better AI → more usage is the engine, and the experience could not exist in 2015.

**What good looks like.** A retention curve that improves as the AI learns the user. A cost-to-serve that drops as the AI absorbs support, moderation, and content creation.

> **Box: What AI changes — AI Leverage itself**
>
> - The flywheel runs at machine speed, not human speed.
> - Agents become first-class users — they generate, moderate, and refer.
> - Personalization moves from recommendation to co-creation.
> - The "cold start" problem shrinks because an AI can simulate an empty network.

**Takeaway.** In 2026, "AI-native" is a 3 here or it is a marketing label. The dimension that most separates the next generation from the last.

---

## 13.13 Long-Term Sustainability

**What it measures.** Ethical durability and regulatory exposure (see Part 12; Tufekci, 2017; Lanier, 2018; Doctorow, 2022).

**How to score.**

- **0:** The model is extractive, opaque, and one regulation away from collapse.
- **1:** Compliance is reactive; ethics is a press release.
- **2:** The model is defensible in the EU's DSA, DMA, and AI Act regime; user interests and incentives broadly align.
- **3:** The product is _more_ durable because of its ethics — trust is the moat, and the regulatory tailwind is real.

**What good looks like.** A business model that survives the next ten years of platform regulation without a structural rewrite. Users who would defend the product in public because it treats them as participants, not inventory.

**Takeaway.** In the 2010s, ethics was a cost. In the 2020s, it is a moat. Score it as such.

---

## 13.14 Scoring Matrix

Apply weights, then sum. The three weighted dimensions are the ones that compound in an AI-native world.

| Dimension             | Weight | Raw (0–3)   | Weighted         |
| --------------------- | ------ | ----------- | ---------------- |
| 1. Virality           | 1.0    | \_\_\_      | \_\_\_           |
| 2. Retention          | 1.5    | \_\_\_      | \_\_\_           |
| 3. Daily usefulness   | 1.0    | \_\_\_      | \_\_\_           |
| 4. Habit potential    | 1.0    | \_\_\_      | \_\_\_           |
| 5. Network effects    | 1.5    | \_\_\_      | \_\_\_           |
| 6. Monetization       | 1.0    | \_\_\_      | \_\_\_           |
| 7. Switching costs    | 1.0    | \_\_\_      | \_\_\_           |
| 8. Defensibility      | 1.0    | \_\_\_      | \_\_\_           |
| 9. Community strength | 1.0    | \_\_\_      | \_\_\_           |
| 10. AI leverage       | 1.5    | \_\_\_      | \_\_\_           |
| 11. Sustainability    | 1.0    | \_\_\_      | \_\_\_           |
| **Total**             |        | **/33 raw** | **/42 weighted** |

**Thresholds (weighted):**

- **>32 — Strong.** Build. The product has compounding advantages in the dimensions that matter most in 2026.
- **25–32 — Promising.** Build with a named fix on the weakest dimension. Do not start until you can say which dimension will move from 1 to 2 in the first six months.
- **18–25 — Weak.** Do not build as-is. Pivot to a higher-scoring version of the same insight, or shelve.
- **<18 — Dead.** The math does not work. The idea is a feature, a hobby, or a mistake.

**The veto rule.** A score of 0 on Retention, Network Effects, or AI leverage is a _veto_ — regardless of total. No product survives a structural zero on the dimensions that compound.

---

## 13.15 The Founder's Pre-Build Checklist

Thirty yes/no questions. Answer before you write a line of code.

1. Does an underlying need occur daily in the user's life, independent of my product?
2. Can I name the internal trigger — the emotion or situation — that opens the app?
3. Is the core action completable in under two minutes?
4. Does the user invest something on day one that raises the cost of leaving?
5. Is the reward variable — does the user not know exactly what they will get?
6. Does the product get more valuable when shared with one specific other person?
7. Can a new user reach an "aha" moment in their first session?
8. Is there a measurable behavior that predicts D30 retention?
9. Does my AI demonstrably improve with each user's data, within the first week?
10. Could the product exist in 2015? (If yes, score yourself down.)
11. Does the network effect strengthen faster than the user base grows?
12. Is there a role for the user that AI cannot fill — identity, relationship, judgment?
13. Does the business model match the native behavior, not fight it?
14. Would a user pay for this if ads disappeared tomorrow?
15. Does the product create content, relationships, or data that cannot be exported?
16. Could a clone shipped by Meta in 90 days fail to take my users? Why, specifically?
17. Is there a community that would survive if my software went down for a week?
18. Are mods, curators, or power users doing unpaid labor because they love it?
19. Does the product treat users as participants, not inventory?
20. Could I explain the data flow to a regulator without flinching?
21. Is the default privacy posture opt-in, not opt-out?
22. Does the product have a shutdown plan for the data if it fails?
23. Have I named the one dimension I will move from 1 to 2 in six months?
24. Do I have a falsifiable retention target before launch — a curve I will hit or kill?
25. Is the viral cycle time under 24 hours if I rely on organic growth?
26. Is the cost-to-serve low enough that AI support scales without a team explosion?
27. Have I checked the sibling risk — does a feature in another app break my core loop?
28. Does the product make a user's life better in a way they would describe in their own words?
29. If I succeed at scale, does the world get better or worse?
30. Would I want my own family to be heavy users?

Score yourself. More than five "no" answers means you are not ready to build. The questions you cannot answer are the product work you have not done.

---

## 13.16 Worked Example — An AI-Native Learning Community for Software Engineers

**The hypothetical.** "Compile" — an AI-native community where software engineers learn in small, persistent cohorts, with a personal AI tutor that learns each engineer's stack, mistakes, and goals, and routes them to peers solving the same problems.

We score it across all eleven dimensions.

| Dimension             | Raw       | Weight | Weighted    | Notes                                                                      |
| --------------------- | --------- | ------ | ----------- | -------------------------------------------------------------------------- |
| 1. Virality           | 2         | 1.0    | 2.0         | Peer invites native; cycle time ~3 days; not inherently viral like Wordle. |
| 2. Retention          | 3         | 1.5    | 4.5         | Daily learning need; complete hook; plateau likely.                        |
| 3. Daily usefulness   | 3         | 1.0    | 3.0         | Engineers learn daily; high-frequency need.                                |
| 4. Habit potential    | 3         | 1.0    | 3.0         | Internal trigger (stuck/frustrated) → tutor; identity-tied.                |
| 5. Network effects    | 2         | 1.5    | 3.0         | Data + peer matching; not yet multi-sided.                                 |
| 6. Monetization       | 3         | 1.0    | 3.0         | High willingness to pay (career ROI); sub + B2B.                           |
| 7. Switching costs    | 2         | 1.0    | 2.0         | Tutor memory + cohort; rises with tenure.                                  |
| 8. Defensibility      | 2         | 1.0    | 2.0         | Data flywheel real; incumbents (Coursera, Udemy) slower.                   |
| 9. Community strength | 3         | 1.0    | 3.0         | Cohort identity; peers are the moat.                                       |
| 10. AI leverage       | 3         | 1.5    | 4.5         | Impossible in 2015; flywheel is the engine.                                |
| 11. Sustainability    | 2         | 1.0    | 2.0         | Clear data story; some platform-risk on model providers.                   |
| **Total**             | **28/33** |        | **32.0/42** |                                                                            |

**Verdict: Strong (just over the 32 bar).**

Where it wins: the dimensions that compound (retention, AI leverage) are at the ceiling. The daily need is real and frequent. The community is the asset AI cannot synthesize.

Where it is fragile: virality is only a 2 — growth will need paid + community-led, not pure viral. Defensibility is a 2 — a focused incumbent with AI could compress the lead. Sustainability is a 2 — dependent on model providers and exposed to B2B channel conflict if it scales into enterprise L&D.

**The named fix.** Move network effects from 2 to 3 within twelve months by adding a two-sided element — companies posting real problems and paying for solutions, turning the community into a marketplace, not just a classroom. That single move lifts the weighted total above 33 and widens the moat against any pure-learning incumbent.

This is what the framework is for: not a verdict, but a map of the next move.

---

## 13.17 Anti-Pattern Checklist — Red Flags That Kill Social Startups

From Part 10, distilled. Any one of these is a reason to stop.

1. **The "social network for X" pitch.** Unless X has a daily need, a unique identity, and a graph that does not already live on LinkedIn or Discord, there is no network — only a database.
2. **Cold-start without a single-player wedge.** A network product that is useless at 1, 10, or 1,000 users will never reach the density it needs.
3. **Vanity-virality.** Shares that do not convert to activated users. A high K-factor with a high churn rate is a leak, not a loop.
4. **Growth without retention.** Funnels that pour users in the top and out the bottom. You are renting attention, not building a business.
5. **The engagement trap.** Optimizing for time-on-app when the underlying need is served in two minutes. You will lose to the product that respects the user's time.
6. **Borrowed-graph dependency.** Building on a single platform's API for your core graph. The platform will change the terms; you will die on the schedule of someone else's roadmap.
7. **AI as decoration.** A chatbot that does not change the core loop. In 2026, decorative AI is a tell that the team does not understand the shift.
8. **Monetization mismatch.** Ads on a product built for trust; subscriptions on a product built for breadth. The model will bleed the behavior.
9. **Community without consent.** Using user data to build community the user did not ask for. The backlash is faster and costlier than the growth.
10. **No falsifiable kill metric.** "We will see what sticks" is not a strategy. If you cannot name the curve you must hit to continue, you will continue past the point you should have stopped.

---

## 13.18 Closing Principles — Ten Commandments for the Next Social Platform

1. **Earn the daily open.** If the product is not opened daily without a notification, it is not a habit. Everything else is downstream.
2. **Match the model to the behavior.** The business model and the user behavior are the same system. A mismatch kills both.
3. **Design the leaving, not just the joining.** Switching costs built on real investment, not on holding data hostage.
4. **Make AI the engine, not the paint.** If the product could exist without AI, it is not AI-native.
5. **Grow the network faster than the user base.** Value-per-user must rise with scale, or you have audience, not a network.
6. **Treat community as the load-bearing wall.** The one asset AI cannot fabricate at scale. Invest in it before you need it.
7. **Make trust the moat.** In a world of infinite synthetic content, provenance and relationship are the scarce goods.
8. **Build for the regulator as a user.** The DSA, DMA, and AI Act are not headwinds to manage — they are design constraints to meet.
9. **Name the dimension you will move.** A roadmap that does not move a specific framework score is activity, not strategy.
10. **Build what could not have been built before.** If your product is a faster horse for a 2010 behavior, you are building the past. The opportunity is the shift, not the increment.

---

## 13.19 Final Reflections — The Ethical Responsibility of Builders

A platform at scale is not a neutral instrument. It shapes attention, relationships, and — increasingly — reality itself (Tufekci, 2017; Lanier, 2018; Doctorow, 2022). The founders who built the last generation of social products did not, for the most part, intend the harms that followed. They optimized for a metric, and the metric did not capture the cost.

The next generation does not have that excuse. The patterns are documented — in this book and elsewhere. The failure modes are known. The choice to repeat them is now a choice.

The framework in this part is not morally neutral. It weights sustainability and community alongside virality and monetization because a product that scores high on the first two and low on the last is, on a long enough horizon, the more durable business. Trust compounds; extraction decays.

The payload question — _what can be built now that could not have been built before?_ — has two answers. One is a more efficient addiction machine. The other is a platform that uses AI to make people more capable, more connected, and more themselves. The technology permits both. The choice is the founder's. There is no algorithm that makes it for you.

Build accordingly.

---

## 13.20 Appendix A — Recommended Reading (Annotated)

- **Eyal, N. (2014).** _Hooked: How to Build Habit-Forming Products._ The operating manual for the Hook Model. Read it before you build a loop.
- **Fogg, B. J. (2019).** _Tiny Habits._ The B=MAP model. The clearest account of behavior change applied to product.
- **Christensen, C. M. (2016).** _Competing Against Luck._ Jobs-to-be-done theory. The cure for feature-thinking.
- **Chen, A. (2024).** _The Cold Start Problem._ The canonical text on network effects and the cold-start phase.
- **Cagan, M. (2018).** _Inspired._ How the best product teams build. The organizational complement to this framework.
- **Cialdini, R. (2016).** _Pre-Suasion._ Influence as a design problem. Foundational for virality and onboarding.
- **Berger, J. (2013).** _Contagious._ The STEPPS framework for why things spread. Empirical, not anecdotal.
- **Dunbar, R. I. M. (1992).** Neocortex size and social group size. The cognitive ceiling on community. Read it before you design groups.
- **Kahneman, D. (2011).** _Thinking, Fast and Slow._ The reference for prediction error, loss aversion, and the asymmetries the Hook exploits.
- **Tufekci, Z. (2017).** _Twitter and Tear Gas._ The political externalities of platforms. Required reading for sustainability.
- **Lanier, J. (2018).** _Ten Arguments for Deleting Your Social Media Accounts Right Now._ The sharpest internal critique of the ad-engagement model.
- **Doctorow, C. (2022).** _Chokepoint Capitalism._ How platforms capture value, and the case for user-side leverage.
- **Skok, D. (2013).** _Unlocking the Virality Cycle._ (Online essay series.) The original SaaS framing of viral coefficient and cycle time.
- **Gurley, B. (2013).** _All Markets Are Not Created Equal._ (Above the Crowd blog.) The 10x network-effect advantage and why market choice dominates execution.

---

## 13.21 Appendix B — Consolidated Bibliography

Berridge, K. C., & Robinson, T. E. (1998). What is the role of dopamine in reward: Hedonic impact, reward learning, or incentive salience? _Brain Research Reviews, 28_(3), 309–369.

Berger, J. (2013). _Contagious: Why things catch on._ Simon & Schuster.

Buckels, E. E., Paulhus, D. L., & Trapnell, P. D. (2014). Trolls just want to have fun. _Personality and Individual Differences, 67,_ 97–102.

Cagan, M. (2018). _Inspired: How to create tech products customers love_ (2nd ed.). Wiley.

Chen, A. (2024). _The cold start problem: How to start and scale network effects._ Harper Business.

Christensen, C. M. (1997). _The innovator's dilemma._ Harvard Business School Press.

Christensen, C. M., Hall, T., Dillon, K., & Duncan, D. S. (2016). _Competing against luck: The story of innovation and customer choice._ HarperBusiness.

Cialdini, R. B. (2016). _Pre-suasion: A revolutionary way to influence and persuade._ Simon & Schuster.

Doctorow, C. (2022). _Chokepoint capitalism._ Beacon Press.

Dunbar, R. I. M. (1992). Neocortex size as a constraint on group size in the primates. _Journal of Human Evolution, 22_(6), 469–493.

Eyal, N. (2014). _Hooked: How to build habit-forming products._ Portfolio.

Fogg, B. J. (2019). _Tiny habits: The small changes that change everything._ Houghton Mifflin Harcourt.

Granovetter, M. S. (1973). The strength of weak ties. _American Journal of Sociology, 78_(6), 1360–1380.

Higgins, E. T. (1987). Self-discrepancy: A theory relating self and affect. _Psychological Review, 94_(3), 319–340.

Kahneman, D. (2011). _Thinking, fast and slow._ Farrar, Straus and Giroux.

Lanier, J. (2018). _Ten arguments for deleting your social media accounts right now._ Henry Holt.

Loewenstein, G. (1994). The psychology of curiosity: A review and reinterpretation. _Psychological Bulletin, 116_(1), 75–98.

Maslow, A. H. (1943). A theory of human motivation. _Psychological Review, 50_(4), 370–396.

Metcalfe, B. (2013). Metcalfe's law after 40 years of Ethernet. _Computer, 46_(12), 26–31.

Pariser, E. (2011). _The filter bubble: What the Internet is hiding from you._ Penguin Press.

Reed, D. P. (2001). The law of the pack. _Harvard Business Review, 79_(2), 23–24.

Schultz, W. (1997). A neural substrate of prediction and reward. _Science, 275_(5306), 1593–1599.

Shapiro, C., & Varian, H. R. (1999). _Information rules: A strategic guide to the network economy._ Harvard Business School Press.

Simon, H. A. (1971). Designing organizations for an information-rich world. In _Computers, communications, and the public interest_ (pp. 37–72). Johns Hopkins University Press.

Skok, D. (2013). _Unlocking the virality cycle._ https://www.forentrepreneurs.com/viral-loop/

Tajfel, H., & Turner, J. C. (1979). An integrative theory of intergroup conflict. In W. G. Austin & S. Worchel (Eds.), _The social psychology of intergroup relations_ (pp. 33–47). Brooks/Cole.

Tufekci, Z. (2017). _Twitter and tear gas: The power and fragility of networked protest._ Yale University Press.

Veblen, T. (1899). _The theory of the leisure class._ Macmillan.

---

## Founder Lens — Part 13 (and the Book)

**What should founders copy?**
The discipline. The Hook Model's completeness, the cold-start's single-player wedge, the community's unpaid mods, the model-behavior match. Copy the _structure_ of the great products — the mechanisms, not the surfaces. WhatsApp copied the structure of the address book; a thousand clones copied the surface of WhatsApp and died.

**What should founders avoid?**
The engagement-at-all-costs optimization function. The borrowed-graph dependency. The "social network for X" pitch with no daily need. And — in 2026 — the temptation to call any product with a chatbot "AI-native." Decorative AI is the new "mobile-first" press release: a tell that the team does not understand the shift.

**What would I build differently today?**
I would start from the AI leverage dimension and build outward. The question is no longer "what graph can I assemble?" but "what graph can an AI assemble on my user's behalf that could not have been assembled before?" Every other dimension is easier to score well on if the product is genuinely AI-native from the first line of code.

**What has AI changed?**
The economics of network formation. Content supply is infinite. The cold-start problem shrinks because an AI can simulate density. The unit of the network is the user-plus-their-AI, not the user alone. And — crucially — trust, provenance, and authentic relationship become scarcer than content. That inversion is the opportunity.

**What is the opportunity?**
Platforms that use AI to make people more capable and more connected, not merely more engaged. Learning communities with personal tutors at zero marginal cost. Marketplaces where agents transact on behalf of users with aligned incentives. Niche graphs that a 2010 platform could never have served profitably. The long tail of social products, now economically viable.

**Difficulty (1-10):** 9. Building a durable social product is among the hardest things in consumer technology. The framework does not make it easy; it makes the difficulty legible. The founders who win are the ones who score honestly, fix the lowest dimension, and ship before the incumbent notices.

**Potential market size:** Effectively the entire consumer internet. Every category Facebook, Instagram, TikTok, YouTube, Reddit, LinkedIn, Snapchat, Pinterest, and Discord serve is open to recombination by an AI-native challenger. The total addressable attention is unchanged; the share that is contestable has expanded sharply.

**Competitive landscape:** Saturated on the supply of apps, underserved on the supply of trust. The incumbents have distribution, capital, and data; they lack the willingness to cannibalize their own ad-engagement models. A focused AI-native challenger that treats users as participants, not inventory, has a narrow but real window.

**Biggest risks:** Regulatory whiplash that punishes new entrants more than incumbents (who can absorb compliance costs). Model-provider dependency that turns "AI-native" into "OpenAI-dependent." And the ethical risk — the most serious — that the founder builds a more efficient addiction machine rather than a more capable human. The framework scores sustainability precisely because that risk is now the dominant one.

---

## References (Part 13)

Berger, J. (2013). _Contagious: Why things catch on._ Simon & Schuster.

Cagan, M. (2018). _Inspired: How to create tech products customers love_ (2nd ed.). Wiley.

Chen, A. (2024). _The cold start problem: How to start and scale network effects._ Harper Business.

Christensen, C. M., Hall, T., Dillon, K., & Duncan, D. S. (2016). _Competing against luck: The story of innovation and customer choice._ HarperBusiness.

Doctorow, C. (2022). _Chokepoint capitalism._ Beacon Press.

Dunbar, R. I. M. (1992). Neocortex size as a constraint on group size in the primates. _Journal of Human Evolution, 22_(6), 469–493.

Eyal, N. (2014). _Hooked: How to build habit-forming products._ Portfolio.

Fogg, B. J. (2019). _Tiny habits: The small changes that change everything._ Houghton Mifflin Harcourt.

Lanier, J. (2018). _Ten arguments for deleting your social media accounts right now._ Henry Holt.

Schultz, W. (1997). A neural substrate of prediction and reward. _Science, 275_(5306), 1593–1599.

Shapiro, C., & Varian, H. R. (1999). _Information rules: A strategic guide to the network economy._ Harvard Business School Press.

Tajfel, H., & Turner, J. C. (1979). An integrative theory of intergroup conflict. In W. G. Austin & S. Worchel (Eds.), _The social psychology of intergroup relations_ (pp. 33–47). Brooks/Cole.

Tufekci, Z. (2017). _Twitter and tear gas: The power and fragility of networked protest._ Yale University Press.
