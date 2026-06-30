# Part 10 — Why New Social Apps Fail

## 10.1 Intro — The Graveyard

Growth is the metric founders brag about; retention is the metric that kills them. Nowhere is that more true than in social.

For every Instagram, there are a hundred Vines, Peaches, Paths, Ellos, Meerkats, Clubhouses, and BeReals. They are not random casualties. They die of a small number of repeatable causes, and the causes are knowable in advance. The graveyard is not a mystery; it is a pattern-matching exercise most founders refuse to do because the answer is usually uncomfortable: the app shouldn't have been built, or shouldn't have been built _that way_, or shouldn't have been built _yet_.

This chapter is the negative space of the rest of the book. Parts 1 through 9 showed what makes social products work — the Hook Model, network effects, engagement loops, positioning. Part 10 inverts the lens: what kills them, and why the same six or seven failures show up decade after decade, platform shift after platform shift. Then it asks the only question that matters now: **which of these failures does AI change?**

Because here is the thesis of the back half of this book (see Part 11 onward): AI does not just create content — it changes the economics of network formation itself. Most of the reasons new social apps have historically died (empty networks, cold start, no creator supply, no retention loop) are exactly the things AI can now subsidize. That does not mean AI makes social easy. It means the failure modes shift. The founders who win the next cycle will be the ones who can tell the difference between a failure AI can fix and a failure AI merely disguises.

Let's start with the killer: the cold-start problem.

## 10.2 The Cold-Start Problem

Andrew Chen's argument, developed at length in _The Cold Start Problem_ (Chen, 2021), is that networks do not grow from a product — products grow from networks. The unit of a networked business is not the user or the feature; it is the **atomic network**, the smallest self-sustaining cluster of users who get value from each other without needing anyone else.

The lie founders tell themselves is "build it and they will come." It is the single most expensive lie in consumer software. Products do not acquire networks. Networks acquire products. A social app with a beautiful product and no atomic network is a museum exhibit: pretty, empty, dead.

The canonical atomic network is Facebook's Harvard. Not Facebook's "everyone." Harvard. A few thousand students, geographically dense, socially interconnected, sharing a single offline context (classes, dining halls, final clubs). The product worked there because the _network_ already existed there; Facebook merely digitized it. The expansion play — Stanford, Yale, every Ivy, every college, every high school, everyone — was a sequence of atomic networks, each ignited separately, each denser than the last. Metcalfe's Law (Metcalfe, 2013; see Part 4) only bites after density exists; before density, more users are just more emptiness.

> **Box: What AI changes — the cold start**
>
> - AI can seed an empty network with synthetic interlocutors, so a new user's first session is never silent.
> - Atomic networks can be assembled algorithmically — match users into micro-cohorts before launch rather than finding them post-hoc.
> - The "chicken-and-egg" of supply and demand collapses when supply is generated on demand.
> - But: synthetic density can mask the absence of real density. A network of humans-plus-bots that loses the bots dies the moment the subsidy ends.

The founder takeaway is brutal but clarifying: **do not build the product until you can name your atomic network in one sentence.** "Travelers" is not an atomic network. "Solo female travelers age 25-35 doing their first long trip to Southeast Asia, currently in Bangkok" is. If you cannot name it, you do not have a cold-start strategy; you have a hope.

## 10.3 The Empty-Network Problem

Hand in hand with cold start goes the empty-network problem — the experience of being user number 4,217 in an app built for millions. The first 1,000 users matter disproportionately because they determine whether the next 10,000 ever show up.

The mistake is to pursue breadth over density. Founders open the funnel wide, run paid acquisition, chase a TechCrunch spike, and end up with 50,000 users scattered across 40 cities, 12 languages, and zero shared context. Each user opens the app, sees no one they know and nothing relevant to them, and never returns. This is the "empty stadium" effect: the app feels dead even when the user count is not small in absolute terms.

Density beats breadth, every time. Local density — users who overlap in geography, interest, or social graph — is what produces the feeling of "people are here." Craigslist won classifieds not by being national but by being hyperlocal in city after city. Nextdoor did the same for neighborhoods. Discord took off not as a global chat app but as the place a specific Twitch streamer's community lived. The discipline is to compress your first users into the smallest possible shared space and let the density do the work.

A useful heuristic from the early-Facebook playbook: **launch one school at a time and do not open the next until the current one is saturated.** Saturation means a meaningful fraction of the target population is active and retained. For a B2C social app today, that might mean one subreddit's worth of people, one Discord's worth, one university's worth. Resist the temptation to ship globally on day one. The press cycle rewards breadth; the business rewards density.

## 10.4 No Retention

A social app that acquires but does not retain is a leaky bucket. Novelty can mask the leak for a few weeks — a fresh UI, a clever hook, a viral moment — but novelty has a half-life, and when it decays the leak is all that is left.

Retention is not a feature you add in v2. It is the consequence of an engagement loop (see Part 1 and 10.7 below). Apps that fail retention almost always fail because they built a _trigger_ (a push notification, a fad, a press wave) without an _action-reward-investment_ loop to catch it. The user shows up, has a good time once, and has no reason programmed into the product to come back tomorrow.

The classic symptom is the **D1 cliff**: a sharp drop between day-0 and day-1 retention. Healthy consumer social apps aim for D1 retention above 40%; the best exceed 50-60%. If your D1 is in the teens, no amount of growth spending will save you — you are paying to acquire users who leave before they ever form a habit. Fix the loop first. Then spend on acquisition. Founders invert this constantly and go broke doing it.

> **Box: What AI changes — retention**
>
> - AI can personalize the first session so aggressively that D1 retention rises structurally, because every user sees a different, tuned app.
> - Generative content means the feed never exhausts, reducing the novelty-decay curve.
> - But: personalization can become a trap. If the app only "works" because the AI never lets you get bored, you have built a slot machine, not a relationship. Retention built on variable reward alone is brittle (Eyal, 2014; see Part 1).

## 10.5 Weak Onboarding

The first session is the entire product. Most social apps lose the user in the first 90 seconds, and the cause is almost always the same: **time-to-value is too long.**

Time-to-value is the elapsed time between app-open and the user's first "aha" — the first moment the product delivers on its promise. For Instagram it was seeing a beautiful photo from someone you care about. For Snapchat it was sending a disappearing photo and watching it vanish. For TikTok it was the algorithm nailing your taste within three swipes. Each of these happens within seconds. The onboarding _is_ the product; everything before it is friction.

Fogg's behavior model, B=MAP (Fogg, 2019; see Part 1), says behavior requires sufficient Motivation, Ability, and a Prompt at the same moment. Onboarding is where founders accidentally destroy Ability by asking for too much: fill out a profile, allow contacts, pick interests, connect Instagram, verify email. Each step is a 10-20% drop. By step five you have filtered out everyone except the highly motivated — and in social, almost no one is highly motivated on day one, because the network is empty.

The discipline: cut onboarding to the bone. Get the user to their first valuable moment with the absolute minimum of effort, then ask for more investment _after_ the reward, not before. Onboard in reverse: deliver value, then collect the profile. Most founders build it the other way around and wonder why their funnel looks like a cliff.

## 10.6 No Unique Value Proposition — the "X for Y" Trap

"The LinkedIn for dog owners." "The TikTok for finance." "The Instagram for doctors." Every social founder has pitched one of these, and every investor has tuned out.

The "X for Y" framing is diagnostic of a deeper problem: the founder cannot articulate what the product _is_ in its own terms, so they borrow a referent. The trouble is that the referent already exists, has a network effect, and will not be displaced by an analogy. Christensen's framing of the innovator's dilemma (Christensen, 1997) is relevant here but often misapplied: disruption in social rarely comes from doing the same thing cheaper. It comes from a different job-to-be-done entirely.

Snapchat did not beat Facebook by being "Facebook for teens." It beat it by being the app for ephemeral, pressure-free visual communication — a job Facebook literally could not do without breaking its own permanent-record identity model. TikTok did not beat YouTube by being "YouTube for short videos." It beat it by decoupling the social graph from the content graph entirely — a job neither YouTube nor Instagram was structured to do (see Part 2).

The test is simple: **can you state your value proposition without naming another product?** If you cannot, you do not have one. You have a clone.

## 10.7 Poor Engagement Loops — Hook-Model Breakdown

Recall the Hook Model from Part 1 (Eyal, 2014): **Trigger → Action → Variable Reward → Investment.** A social product lives or dies by whether this loop closes, and closes tightly, on every session.

Most failed social apps break the loop at the Reward or Investment stage. The Trigger fires (a notification, a curiosity), the Action is easy enough (open the app), but the Reward is thin or predictable — same content, same people, no surprise — and there is no Investment that raises the stakes of leaving. Without Investment, there is no stored value, no switching cost, no reason to come back. The user drifts.

The Investment stage is where most clones fail silently. Facebook's Investment is your social graph and your history. WhatsApp's is your phone's contact list and your group memberships. Spotify's is a decade of listening data that powers a recommendation engine you cannot rebuild elsewhere. Each of these is a _sunk cost that compounds_ — the longer you use the product, the more expensive it becomes to leave. Apps without a compounding Investment stage are rented attention, not owned retention.

The dopamine prediction-error mechanism (Schultz, 1997; see Part 1) explains why the Reward must be _variable_: predictable rewards habituate and stop driving behavior. This is why a feed that shows you the same ten friends every day stops being exciting even if those friends are lovely people. Variability — surprise, novelty, social uncertainty — is the fuel. Loops without it die of boredom before they die of churn.

## 10.8 Wrong Incentives

Social products are two-sided markets even when they pretend not to be. There are _creators_ (supply) and _consumers_ (demand), and a social app dies when either side is unpaid in the currency that matters to them.

For creators, that currency is usually one of three: **audience, money, or status.** YouTube pays in money (revenue share) and audience (recommendation). TikTok pays in audience (algorithmic distribution) and status (followers, virality). Twitter/X pays in status (followers, reply guys) and, for a small elite, money. An app that asks creators to produce content for none of these — for "exposure" to an empty network, for love of the product — will get no supply. This is why most "build a creator platform" startups fail: they want Instagram's content without Instagram's distribution or economics.

For users, the currency is value: entertainment, connection, utility, identity. An app that asks users to invest time without returning any of these is asking for charity. The incentive alignment test is unforgiving: **what does each side get, in the currency they actually want, within the first session?** If the answer is "nothing yet, but eventually," you are betting on patience you have not earned.

> **Box: What AI changes — incentives**
>
> - AI collapses the creator bottleneck: supply no longer requires human creators, so the "cold supply" problem shrinks.
> - This _devalues_ human-created content economically at the same time it increases its scarcity value socially.
> - The new creator incentive shifts from "distribution for my content" to "distribution for _me_, the verified human." Authenticity becomes the scarce good (see Part 12).

## 10.9 Copying Incumbents

You cannot win a feature-parity war against a network effect. This is the single most important sentence in this chapter for founders, and almost no one believes it until they have lost two years and a seed round proving it.

Feature parity is the temptation because it feels achievable. "We'll build everything Instagram has, plus one thing." The math looks like it works: you ship Stories, Reels, DMs, a feed, and your one differentiator (a niche community, a better filter, a cooler UI). Users try it, some even like it, and then they go back to Instagram — because that is where their friends are, where their history is, where the network density is. Your one differentiator is not enough to overcome the switching cost of leaving a network that compounds.

The only way to beat an incumbent with network effects is to compete on a **different network topology or a different job-to-be-done** — a dimension where the incumbent's network is structurally useless. Snapchat beat Facebook on ephemerality (Facebook's graph was built for permanence). TikTok beat Facebook and YouTube on interest-graph discovery (their graphs were built for social and subscription). Discord beat Slack-for-friends on real-time community (Slack was built for work). Each found an axis where the incumbent _could not follow without breaking itself._

If your strategy is "we'll be like X but better," you have already lost. Better is not a strategy. Different is.

## 10.10 Bad Timing

Timing in social is not a footnote; it is half the outcome. Too early and the infrastructure, norms, or audience is not ready. Too late and the window has closed and the incumbents have eaten the oxygen.

Path is the textbook "too early." Founded 2010, Path bet on an intimate, small-graph social network — a "personal network" capped at first at 50 friends, later 150, loosely echoing Dunbar's number (Dunbar, 1992). The idea was sound and is now widely accepted (Close Friends on Instagram, BeReal's small-graph energy, the whole "intimacy" wave). But in 2010 the world wanted _bigger_ social, not smaller. Facebook was still ascending. The smartphone camera was not yet good enough for the photo-first intimate sharing Path was built around. The product was right; the decade was wrong. Path died in 2015; the idea succeeded, just not for Path.

Too late is the more common failure. Countless "social for crypto" or "social for AI" apps launched after the incumbents had already absorbed the new substrate. The zeitgeist window — the period during which a new behavior, substrate, or norm is unsettled enough for a new product to define it — is short, often 12-24 months. Miss it and you are a clone with worse timing.

The founder question is not "is the market ready" in the abstract. It is: **what new capability or behavior has just become possible, that was not possible 18 months ago?** AI in 2024-2026 is exactly such a window. The founders who win it will be the ones who ship into the window, not the ones who write a deck about it.

## 10.11 Weak Positioning

Positioning is the answer to "what is it for?" — and most dead social apps have no answer.

The symptom is vagueness. "A new way to connect." "Where friends share moments." "The next-generation social network." None of these tell a prospective user whether the app is for them, what they would do there, or why they should care. Positioning is not a tagline; it is the slot the product occupies in the user's mental category system. If the user cannot categorize you in one phrase, they cannot retrieve you when the moment of need arrives.

Cialdini's work on influence (Cialdini, 2006) and Berger's on virality (Berger, 2013) both turn on the same observation: people share and adopt what they can describe. If your users cannot explain your product to a friend in one sentence, you have no word-of-mouth channel, which means your CAC is structurally too high to survive.

Strong positioning is specific and excludes more than it includes. "Ephemeral photo messaging for close friends" (early Snapchat) excludes permanence, public broadcasting, professional networking, and everyone who is not a close friend. That exclusion is the point. Vague positioning tries to be for everyone and ends up being for no one.

## 10.12 Lack of Communities — Solo Experiences Don't Retain

Social apps that deliver solo experiences — "useful for you, alone" — rarely retain, because they have no social immune system. The moment the novelty wears off, there is no community to miss you, pull you back, or generate new content for you.

This is the difference between Spotify (mostly solo) and Spotify Wrapped (social), between Duolingo (solo) and Duolingo Leagues (social), between a meditation app (solo, high churn) and Strava (community, high retention). The solo product can be excellent and still bleed users, because there is no _other person_ whose absence the user feels.

Communities create three things solo products cannot: **obligation** (someone is expecting you), **recognition** (someone notices when you show up), and **co-creation** (the content is generated by members, for members, for free). Apps that fail this test usually discover it too late, around the time their D30 retention prints single digits.

The prescription is not "add a community feature." It is to design the product from day one so that the user's value is mediated through other users. If the core loop can be completed alone, it will be — and the product will churn like a utility, not retain like a network.

## 10.13 Case Studies of Failure

Theory is cheap; autopsies are instructive. Here are eight failures, each with the single biggest lesson.

**Vine (monetization + acquisition).** Vine had the product (six-second looping video) and the network (early Twitter distribution) but never gave creators a way to make money. YouTube and Instagram offered revenue share and stole Vine's talent. Twitter, which acquired Vine early, underinvested and starved it. Vine died in 2017. _Lesson: in a creator economy, the side that pays the creators wins._

**Peach (no loop).** Peach launched in 2016 as a "fun, simple" social app with delightful magical commands ("gif," "draw," "shout"). It had a viral launch — everyone tried it — and then everyone left, because there was no engagement loop and no network density. It was a toy, not a habit. _Lesson: delight without a Hook loop is a one-week wonder (see Part 1)._

**Path (wrong constraint).** Path capped your social graph to enforce intimacy, but launched into an era that wanted scale. The constraint was right; the timing was wrong (see 10.10). _Lesson: being right too early is indistinguishable from being wrong._

**Ello (no network).** Ello (2014) pitched itself as the "Facebook killer" — ad-free, privacy-first, creator-friendly. It attracted a press spike and a wave of signups, then collapsed because there was no atomic network and no reason for anyone to come back. The values were appealing; the product had no density. _Lesson: values are not a network effect._

**Meerkat (platform dependency).** Meerkat launched in 2015 as the breakout live-streaming app at SXSW, built entirely on Twitter's social graph for discovery. Twitter acquired Periscope and cut Meerkat off. Meerkat died within a year. _Lesson: never build your entire acquisition channel on a platform that can revoke it. Skok's work on platform risk (Skok, 2013) is the canonical reference here._

**Clubhouse (retention collapse).** Clubhouse exploded in 2020-2021 — pandemic, locked-down elites, FOMO, exclusivity, audio. Then the world reopened, the novelty of listening to a two-hour room decayed, and there was no lightweight, repeatable engagement loop to replace the live-event high. Twitter Spaces and copycat features accelerated the decline. Valuation peaked near $4B; usage collapsed. _Lesson: event-driven novelty is not a retention strategy. The Hook loop must work at the 30-second timescale, not just the two-hour one._

**BeReal (novelty decay).** BeReal (2022) asked users to post one unedited photo per day at a random moment. The honesty angle was fresh, the small-graph intimacy resonated, and growth was explosive among Gen Z. Then the novelty decayed — same notification, same photo, same friends, every day — and the variable-reward engine that drives TikTok was absent. _Lesson: a single clever mechanic is a feature, not a network. Without a compounding Investment stage, the curve always bends down (see 10.7)._

**Mastodon (UX friction).** Mastodon is the longest-running "we are the anti-Twitter" play, decentralized and federated. Its values resonate strongly with a dedicated minority, but its onboarding friction — picking a server, understanding federation, rebuilding a graph across instances — has kept it a niche for over a decade despite multiple tailwinds (Twitter exoduses, Elon-era churn). _Lesson: values plus friction equals niche. Onboarding friction is not a filter for "real" users; it is a tax on growth that compounds (see 10.5)._

> **Box: What AI changes — the failure set**
>
> - Vine's failure (creator economics) is now compressible: AI lets platforms pay creators in distribution even when money is thin.
> - Peach and BeReal's failure (no loop) is patchable: AI can supply variable reward endlessly.
> - Meerkat's failure (platform dependency) is now _worse_, not better — AI distribution is even more concentrated.
> - Clubhouse's failure (retention) is the one AI cannot fake; you still need a real social substrate.

## 10.14 Common Failure Patterns

| Failure mode        | Symptom                           | Root cause                                 | Example                   |
| ------------------- | --------------------------------- | ------------------------------------------ | ------------------------- |
| Cold start          | Great product, no users           | No atomic network identified               | Ello                      |
| Empty network       | Users open, see nothing, leave    | Breadth over density; no local cohort      | Most clone apps           |
| No retention        | High acquisition, D1 in teens     | No engagement loop; novelty only           | Peach                     |
| Weak onboarding     | First-session drop-off            | Long time-to-value; too many steps         | Mastodon                  |
| No UVP              | "X for Y" pitch; undifferentiated | No distinct job-to-be-done                 | Path (vs. FB scale era)   |
| Broken Hook loop    | Trigger fires, reward thins       | No variable reward or investment stage     | BeReal                    |
| Wrong incentives    | Creators won't supply             | No audience, money, or status currency     | Vine                      |
| Copying incumbents  | Feature parity, no network        | Competing head-on with network effects     | Countless                 |
| Bad timing          | Right idea, wrong year            | Too early or too late for substrate/norms  | Path (too early)          |
| Weak positioning    | "What is it for?" has no answer   | Vague identity, mental slot undefined      | Generic "social" startups |
| No community        | Solo utility, high churn          | Value not mediated through other users     | Meditation apps           |
| Platform dependency | Acquired channel revoked          | Built entirely on another platform's graph | Meerkat                   |

```
            THE SOCIAL APP FAILURE TREE
                     [Launch]
                        |
        +---------------+---------------+
        |                               |
   No atomic network?            Weak onboarding?
   (Cold start)                  (Time-to-value)
        |                               |
        v                               v
   Empty network                  D1 cliff
        |                               |
        +---------------+---------------+
                        |
                  Survives first week?
                        |
        +---------------+---------------+
        |               |               |
   No loop?        No UVP?         No community?
   (Hook breaks)   (Clone trap)    (Solo churn)
        |               |               |
        v               v               v
   Novelty decays   Out-competed    D30 single digits
                        |
                        v
                   [The Graveyard]
```

## 10.15 Anti-Pattern Checklist

Before you ship, run this list honestly. If you cannot answer "no" to each, do not ship.

1. **"We're the X for Y."** If your pitch names another product, you do not have a value proposition — you have a clone with a target market.
2. **"Everyone is a potential user."** Then no one is. Name the atomic network in one sentence.
3. **"We'll fix retention in v2."** Retention is the product. If it is not designed into the loop on day one, v2 never ships.
4. **"Onboarding takes 3 minutes."** That is three minutes too long. Cut to under 30 seconds to first value.
5. **"Creators will come once we have users."** They will not. The side that pays the creators, wins.
6. **"We'll build the network later."** Networks are not built; they are ignited. If you cannot ignite one now, the product is premature.
7. **"We'll be like Instagram but better."** Better is not a strategy. Different is.
8. **"The platform won't cut us off."** Assume it will. Build a graph you own.
9. **"Timing is on our side."** Verify. Is the capability 12-24 months new? If it is older, the window may be closed.
10. **"Our values will retain users."** Values attract a minority. Loops retain a majority.

## Founder Lens — Part 10

**What should founders copy?**
Copy the discipline, not the features. Copy Facebook's atomic-network sequencing (one Harvard at a time). Copy TikTok's obsession with time-to-first-value (under three swipes). Copy YouTube's creator economics (pay the supply side in real currency). Do not copy the surface — the surface is the part network effects make uncopyable.

**What should founders avoid?**
Avoid feature parity against incumbents, "X for Y" positioning, broad-launch acquisition before density, onboarding that asks for investment before delivering reward, and any acquisition channel you do not own (per Skok, 2013). Most of all, avoid shipping a product that has a Trigger but no Reward and no Investment — that is the Hook loop with two of four stages missing (Eyal, 2014).

**What would I build differently today?**
I would design the atomic network before the product. I would name the smallest cohort that can ignite, design the Hook loop on paper before writing code, and budget for creator supply on day one rather than treating it as a later-stage problem. I would ship to one community, not to the App Store. And I would treat onboarding as the entire product, with every other feature subordinate to time-to-first-value.

**What has AI changed?**
AI changes the failure modes, not the fundamentals. The empty-network problem is now subsidizable with synthetic supply and conversational AI. The cold-start problem is now partially solvable through algorithmic cohort assembly. The creator-supply problem shrinks. But — and this is the whole thesis of the back half of this book — AI does _not_ solve the retention problem at the level of real human relationships, it does not solve platform dependency, and it does not solve the absence of a real social substrate. It makes the easy parts of social cheap and leaves the hard parts exactly as hard.

**What is the opportunity?**
The opportunity is to build social products where AI subsidizes the failures that killed the last generation (empty networks, cold supply, novelty decay) while investing brutally in the parts AI cannot fake: real human density, real community obligation, real identity, real trust (see Parts 11 and 12). The winners of the next cycle will look like networks of humans glued together by AI infrastructure, not networks of humans replaced by AI content.

**Difficulty (1-10):** 8. Social is the hardest category in consumer software. AI lowers some barriers and raises others (authenticity, trust, moderation). Net: still extremely hard, with a new failure mode (synthetic-density illusion) added to the old ones.

**Potential market size:**
Unchanged at the top of the funnel — billions of humans are social. The addressable opportunity for a _new_ social product in the AI era is large precisely because the incumbents are vulnerable to a substrate shift (see Part 13), but it is winner-take-most, as it has always been.

**Competitive landscape:**
Brutal and bifurcated. Incumbents (Meta, ByteDance, Tencent, Discord) have insurmountable network effects on the existing graph topologies. The only openings are on topologies they cannot occupy without breaking themselves — same as it has ever been. New entrants competing on AI-native social (character AI, companion apps, AI-mediated small groups) are early and unsettled. The window is open but narrowing.

**Biggest risks:**
Three, in order. First, **synthetic-density illusion**: building an app that "works" only because AI fills the network, then discovering the network is not real when the subsidy ends. Second, **platform dependency**, which is now worse than in the Meerkat era because distribution is more concentrated. Third, **trust collapse**: in a world of infinite AI content, the scarce good is authenticity, and a single fake-content scandal can end a social product overnight (see Part 12). The founders who win will treat trust as the core feature, not a moderation afterthought.

## References (Part 10)

Berger, J. (2013). _Contagious: Why things catch on._ Simon & Schuster.

Chen, A. (2021). _The cold start problem: How to start and scale network effects._ HarperBusiness.

Christensen, C. M. (1997). _The innovator's dilemma: When new technologies cause great firms to fail._ Harvard Business School Press.

Cialdini, R. B. (2006). _Influence: The psychology of persuasion_ (Revised ed.). Harper Business.

Dunbar, R. I. M. (1992). Neocortex size as a constraint on group size in the Hominidae. _Journal of Human Evolution, 22_(6), 469-493.

Eyal, N. (2014). _Hooked: How to build habit-forming products._ Portfolio.

Fogg, B. J. (2019). _Tiny habits: The small changes that change everything._ Houghton Mifflin Harcourt.

Metcalfe, B. (2013). Metcalfe's law after 40 years of Ethernet. _Computer, 46_(12), 26-31.

Schultz, W. (1997). Dopamine neurons and the neural substrate of learning and motivation. _Nature Reviews Neuroscience, 3_(2), 121-133.

Skok, D. (2013, November 5). _Navigating the risks of platform dependence._ For Entrepreneurs. https://www.forentrepreneurs.com
