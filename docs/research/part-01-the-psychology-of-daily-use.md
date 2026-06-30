# Part 1 — The Psychology of Daily Use

## 1.1 Why "Daily Use" Is the Only Metric That Matters

Every social platform that has survived more than five years answers the same question with a yes: _do people come back tomorrow without being asked?_

Growth is the metric founders brag about. It is rarely the one that kills them. The thing that kills social products is silence — the slow bleed of people who tried it once, found nothing pulling them back, and never returned. Acquisition can be bought; habit cannot. By the time most teams notice their retention curve, the product is already dying, because a leaky bucket with a fast tap still runs dry.

This is why daily use — not registered users, not monthly actives, not even revenue — is the ground truth. Daily use is the behavioural footprint of a habit. A product used daily has installed itself into someone's life; a product used monthly has merely been bookmarked. The DAU/MAU ratio (the fraction of monthly users who show up on any given day) is the crudest honest signal: WhatsApp sits near 70–80%, Instagram and Snapchat in the 60s, a struggling app in the single digits. The ratio is not a vanity number — it is a stress test of whether the product has become part of the rhythm of a day.

The founders who built the addictive platforms understood something most founders don't: **attention is the byproduct of psychology, not the cause of it.** You do not retain users by asking them to pay attention. You retain them by aligning with mechanisms — reward, status, identity, belonging, curiosity — that the human brain evolved to pursue without being asked. The platforms covered in this series are, almost without exception, exercises in taking ancient drives and putting a screen in front of them.

This part is the foundation for everything that follows. Virality (Part 3) brings people to the door; network effects (Part 5) lock the door behind them; algorithms (Part 7) keep the room interesting. But none of it matters unless the brain, on day three, decides it wants to come back on day four. That decision is psychological. We start there.

> **Founder callout —** Before you build anything, write down the internal trigger. What feeling, recurring daily, will make someone open your app? If the answer is "boredom" and the app only satisfies boredom better than TikTok, you have already lost.

## 1.2 Dopamine Reward Systems

The popular story is "dopamine = pleasure." The popular story is wrong, and getting it wrong is why most attempts to engineer engagement fail.

Dopamine is the brain's _wanting_ chemical, not its _liking_ chemical. The cleaner finding comes from Wolfram Schultz's (1997) work on monkeys: dopamine neurons fire not when a reward arrives, but when a reward is _better than expected_ — the **reward prediction error**. If the brain predicts a reward and gets exactly that, dopamine is flat. If it predicts a reward and gets more (or gets it sooner), dopamine spikes. If it predicts a reward and gets less, dopamine drops below baseline. Dopamine is the signal that says _pay attention, this is better than you thought, update your model_.

This single mechanism explains why a guaranteed reward gets boring and an uncertain one does not. The fourth piece of cake is not as exciting as the first; the slot machine that always pays exactly $1 holds no one. But a feed that _might_ contain something delightful — and usually doesn't, but sometimes does — keeps the prediction error firing on every swipe. TikTok's For You Page is a prediction-error engine running at 60+ evaluations per minute.

Kent Berridge's (1996) work sharpens the clinical point. He separated "wanting" (incentive salience, dopaminergic) from "liking" (conscious pleasure, largely opioid-driven) and showed they can come apart entirely — that the system that makes you pursue something is not the system that makes you enjoy it. Addiction lives in the gap. A user can _want_ to keep scrolling while _liking_ none of it. That gap is not a bug the platforms stumbled into; for some of them, it became the design target.

**Ethical concern —** Engineering prediction-error loops against a system the user cannot voluntarily modulate is the core ethical problem of attention products. **Responsible use —** The same mechanism can reward genuinely useful behaviour (learning a skill, replying to a friend, finishing a run). The lever is not the problem; the cargo you put on it is.

## 1.3 Variable Reward Loops

Take prediction error, wrap it in a behavioural cage, and you get the single most powerful retention mechanism ever discovered.

B. F. Skinner found that rats pressing a lever for food pressed hardest, longest, and most compulsively not when food came every time, and not when it never came, but when it came _unpredictably_ — on a **variable-ratio schedule**. The rat could not stop pressing, because the next press might be the one. This is the same schedule a slot machine runs, and for the same reason: the brain cannot extinguish a behaviour whose reward is uncertain.

This is why the feed — any feed — is the dominant form of the modern internet. Each scroll is a lever press. Most scrolls return nothing of value. Some return a joke, an outrage, a message, a face you missed. The reward is variable, the interval is variable, and the cost per press is near zero. The variable-ratio schedule does the rest. Nir Eyal (2014) named this the "variable reward" phase of the Hook model, and it is the phase where most products either become habits or evaporate.

The variable reward has three flavours a good product blends: the **tribe** (social validation — a like, a reply), the **hunt** (searching for content — the next interesting thing), and the **self** (personal achievement — a streak, a badge, a level). The most addictive products deliver all three in one surface. Instagram delivers the tribe (likes), the hunt (Explore), and the self (followers as a score) simultaneously.

**Founder callout —** Audit any loop you build: is the reward fixed (will bore the user) or variable (will compel them)? Fixed rewards train; variable rewards hook. Use variable for habit-formation, then layer fixed rewards for the moments you want to feel earned.

## 1.4 Operant Conditioning

Skinner's larger framework is **operant conditioning**: behaviour is shaped by its consequences. Reinforcement increases a behaviour; punishment decreases it. What matters for product design is not the philosophy but the four schedules and their effects:

- **Fixed-ratio** (every Nth action rewards) — high, steady rate, pause after reward. Think "buy 10 coffees, get 1 free."
- **Variable-ratio** (unpredictable Nth) — highest, most compulsive rate, no pause. The feed. The slot machine.
- **Fixed-interval** (reward after a fixed time) — scalloped pattern, users rush near the deadline. The daily login bonus.
- **Variable-interval** (reward after unpredictable time) — slow, steady, persistent. The notification that _might_ arrive.

Every notification, like, badge, streak and ping is a reinforcer on one of these schedules. The red dot is a variable-interval cue; the streak is a fixed-ratio threat (you lose it if you skip); the feed is variable-ratio. The platforms are operant-conditioning engines, and the user is — willingly, often fondly — the subject.

The uncomfortable part is that operant conditioning does not require the subject to understand or consent to the mechanism. The rat does not know it is in a box. The user does not feel the schedule. They just feel the pull. This is why "just use willpower" fails as advice for breaking screen habits: the design is operating below the level where willpower lives (Kahneman, 2011, would locate it in System 1, the fast automatic system).

## 1.5 Habit Formation: The Hook Model

All of the above crystallizes into one diagram, and this diagram is the spine of the entire series.

**The Hook Model (Eyal, 2014):**

```
        ┌───────────────────────────────────────────────┐
        │                                               ▒
        ▼                                               ▒
  ┌───────────┐    ┌────────┐    ┌──────────────┐      ▒
  │  TRIGGER  │───▶│ ACTION │───▶│  VARIABLE    │      ▒
  │           │    │        │    │   REWARD     │      ▒
  └───────────┘    └────────┘    └──────┬───────┘      ▒
       ▲                                 │              ▒
       │                                 ▼              ▒
       │                           ┌──────────┐         ▒
       │                           │INVESTMENT│         ▒
       │                           └────┬─────┘         ▒
       └────────────────────────────────┘               ▒
       (investment loads the next trigger)              ▒
```

Four phases, looping:

1. **Trigger** — what makes the user start. _External_ triggers are pings, badges, emails ("X liked your photo"). _Internal_ triggers are feelings — boredom, loneliness, anxiety, the itch to check. The goal of every habit-forming product is to migrate the user from external triggers to internal ones, so the product is pulled for rather than pushed to.
2. **Action** — the simplest behaviour in anticipation of reward. It must be as easy as possible; Fogg's behaviour model (next) governs this.
3. **Variable Reward** — the slot-machine payoff (1.3).
4. **Investment** — the user does work (posts, follows, builds a profile, curates a playlist). This stores value, loads the next trigger ("someone replied to your post"), and — via the IKEA effect and sunk-cost logic — raises the odds of return.

The investment phase is the most underrated. It is the phase that converts a visitor into a resident. Every photo uploaded, connection made, or preference expressed is stored value the user leaves behind, and leaving it behind is the seed of the next trigger.

**B = MAP (Fogg, 2019).** Whether the action happens at all depends on the Fogg Behaviour Model: **B = M·A·P** — Behaviour happens when Motivation, Ability, and Prompt converge at once. Motivation and Ability trade off: a low-motivation action still happens if it's trivially easy (Ability high); a hard action needs high motivation. The Prompt is the trigger. The product designer's job is to push Ability up (fewer taps, less friction) so that even low-motivation users complete the action. This is why every addictive app obsessed over reducing the number of taps to its core action.

**Habit vs. addiction.** A habit is an automatic, low-friction behaviour in service of the user's goals. An addiction is the same mechanism operating against the user's goals. The machinery is identical; the ethics turn on whether the loop serves the person or consumes them. We will return to this distinction repeatedly — it is the line the whole industry is still negotiating.

## 1.6 FOMO (Fear of Missing Out)

FOMO is the engine underneath every ephemeral feature. Its evolutionary root is deep: for a social primate, missing information about the group — who allied with whom, who was cast out, where the food moved — could be fatal. We did not evolve to tolerate being out of the loop. The brain treats social information gaps as mildly threatening.

Snapchat Stories and Instagram Stories are FOMO industrialized. The 24-hour decay does two things at once: it lowers the cost of posting (because the post is temporary, people post more freely), and it manufactures urgency (because if you don't look now, it's gone). Ephemeral content is the only format that punishes the user for _not_ showing up. A permanent post can be viewed any time; a Story creates a small daily deadline. That deadline is a fixed-interval reinforcer (1.4) wearing the costume of fun.

The dark side is now well-documented: among adolescents, FOMO correlates with anxiety, sleep disruption, and compulsive checking (Przybylski et al., 2013, formalized the construct). The platforms built the most efficient FOMO-delivery system in human history and pointed it at the demographic least equipped to resist it.

**Responsible use —** Time-decay can encourage presence over curation ("post the real thing now, not the perfect thing later"). The same mechanic that pressures a teenager can reduce the perfectionism that paralyses adult creators. The dose makes the poison.

## 1.7 Social Validation

Abraham Maslow's (1943) hierarchy placed esteem and belonging near the top — just below self-actualization. We are built to seek evidence that we are seen, valued, and accepted by the group. Mirror-neuron research and attachment theory both underline the same point: the human brain treats social approval as a primary reward, metabolically similar to other primary rewards.

The like button is the most successful single feature in the history of software, and it is a social-validation extraction device. Each like is a tiny unit of belonging, delivered as a variable-ratio reinforcer (you don't know how many you'll get). The like's quiet transformation of communication: it lets you signal attention without the effort of a reply, which maximizes the number of validation events per minute the platform can mediate.

The cost is that social currency, once quantified, becomes a scoreboard. A teenager does not just feel liked or not liked; they feel liked-by-247 vs. liked-by-1,803. The number is visible, comparable, and ranked against peers. Maslow's need didn't change; the platform made it measurable, and measurable needs become competitions.

## 1.8 Status Seeking

Robin Dunbar's (1998) **social brain hypothesis** argues the human neocortex grew large specifically to track social relationships in large groups — we are, quite literally, status-computing animals. We are wired to care where we stand.

Signalling theory (Veblen's _conspicuous consumption_, 1899) explains how status is communicated: we display costly, hard-to-fake signals so others can infer our rank. On social platforms the signals are virtual but the logic is identical. Reddit karma, LinkedIn endorsements, Twitter follower counts, GitHub commit streaks, Strava segment records, Foursquare mayorships — each is a public, comparable status signal. The platform's job is to make the signal legible (a single number everyone understands) and the competition continuous (there is always someone above you).

The platforms that flourished gave users a **status ladder to climb and a way to display altitude.** The ones that struggled often failed to offer either. A social product without a status dimension is a party where no one can tell who matters — and people eventually stop coming to that party.

**Founder callout —** Define your status currency early and explicitly. What is the number people will brag about? If you can't name it in one word, your users can't optimise for it, and a currency users can't optimise is a currency that doesn't motivate.

## 1.9 Identity Building

E. Tory Higgins's (1987) **self-discrepancy theory** distinguishes the _actual self_ (who you are), the _ideal self_ (who you want to be), and the _ought self_ (who you feel you should be). People are motivated to close the gaps, and they experience affect when the gaps are wide.

A profile is a self-discrepancy engine. It is the user's curated bid for the ideal self — the version of themselves they want others to see. Instagram is ideal-self theatre; LinkedIn is professional ideal-self theatre; even Reddit, pseudonymous, is an ideal-self theatre for the intellect or wit. The platform supplies the stage, the props (filters, bios, badges), and the audience. The user supplies the performance.

This is why onboarding is identity-critical: an empty profile is an undefined self, and undefined selves do not retain. Every good product's empty state nudges the user to _become_ someone on the platform — pick a username, add a photo, state an interest. These are not form fields; they are identity-seeding rituals. Hazel Markus's concept of **"possible selves"** (Markus & Nurius, 1986) captures the pull: people are motivated by the vision of who they could become, and a platform that lets them glimpse and build that future self gains enormous traction.

## 1.10 Tribal Behaviour

Henri Tajfel's **social identity theory** (Tajfel & Turner, 1979) showed that people sort themselves into in-groups and out-groups with minimal provocation, and that belonging to an in-group produces real psychological rewards while hostility to the out-group hardens identity. We are tribal animals operating tribal software.

Subreddits, Discord servers, stan accounts, and niche communities are tribes. They provide the strongest form of retention in the entire social stack: identity fusion with a group. A user who "is a member of r/something" or "is part of this server" has fused the platform into their identity, and leaving is no longer just deleting an app — it is leaving a people. This is why Discord's switching costs are so brutal (Part 5): the cost is social, and social costs are the highest costs there are.

The shadow of tribalism is polarization. In-group favoritism plus algorithmic amplification (Part 7) plus identity-protective cognition produces echo chambers, outrage spirals, and the slow disintegration of shared reality. The mechanism that makes a community sticky is the same mechanism that makes it hostile to outsiders and hermetic to contrary evidence. Every founder building community features is building a tool that can become a tribe — and tribes have edges.

## 1.11 Curiosity Gaps

George Loewenstein's (1994) **information gap theory** defines curiosity as the aversive feeling produced by a gap between what you know and what you want to know. Crucially, the gap must be _perceivable_ — you have to know there's something you don't know. The mind treats an open information gap as an itch and will work to scratch it.

This is the entire economics of clickbait. "You won't believe…" opens a gap. "1 of 9" carousels open nine small gaps and make you scratch each one. Headlines that withhold the key fact, thumbnails with arrows pointing at something off-screen, "the reason will shock you" — all are gap-engineering. TikTok's autoplay-to-the-next-video is a continuous gap-machine: each video resolves the last gap and opens the next in the same gesture.

The ethical line is whether you open a gap you intend to _honor_. A good teacher opens a curiosity gap and then delivers genuine insight. A clickbait farm opens a gap and delivers a letdown — which trains the user to stop trusting gaps, eroding the very mechanism. Responsible products open gaps and close them with real value; extractive ones burn the mechanism for short-term clicks.

## 1.12 Completion Bias

The **Zeigarnik effect** (Zeigarnik, 1927) — named after Bluma Zeigarnik's observation that people remember interrupted tasks better than completed ones — describes the mind's tendency to hold open unfinished business. An incomplete thing nags. (The original experimental record is messier than the pop-science version, but the broader principle — partly-done tasks occupy attention — is robust and heavily exploited.)

Progress bars, partly-filled profiles ("70% complete — add a photo!"), Duolingo's lesson trees with one greyed-out node, and the unread-count badge are all completion-bias triggers. The genius of the streak (Snapchat, Duolingo, Wordle, GitHub) is that it converts the _future_ into an incomplete task: once you have a 47-day streak, day 48 is a task the universe has opened and you cannot close it except by acting. Breaking the streak would register a loss, and Kahneman's (2011) **loss aversion** tells us losses feel roughly twice as bad as equivalent gains feel good — so the streak is doing double duty as completion bias _and_ loss aversion.

This is why streaks are the single most powerful retention mechanic in the consumer-software toolkit, and also why they are the most coercive. A user maintaining a streak for fear of loss is not, strictly, exercising free choice about whether to open the app today.

## 1.13 Infinite Novelty

The brain rewards novelty directly. A new stimulus — a new face, a new sound, a new idea — produces a dopaminergic response because novelty _might_ matter (it might be food, threat, or opportunity). The mechanism is evolutionary: in a familiar environment, the novel thing is the thing worth investigating.

Infinite scroll and the algorithmic feed weaponize this by guaranteeing that the next stimulus is always novel. You literally cannot run out of new. This is the deepest reason short-video feeds are more compulsive than anything before them: the novelty-to-effort ratio is the highest the medium has ever achieved — a thumb-flick delivers an entirely new three-dimensional stimulus (visual, audio, concept). Aza Raskin, who designed infinite scroll, has publicly expressed regret over its human cost; he built it to solve a real UX problem (pagination friction) and did not foresee that removing the "stop signal" would remove the brain's natural exit cue.

Without a stop signal, the brain's satiety mechanism — the thing that makes you stop eating a good meal — never triggers for content. You are never "full" of scrolling, because each item is novel. The only thing that ends a session is external interruption: a bus arrives, a battery dies, sleep wins. This is not a flaw in the design from the platform's perspective; it is the design.

## 1.14 Attention Economics

All of these mechanisms feed into one market: the market for attention.

Herbert Simon (1971) made the foundational observation that drives the entire attention economy: _"a wealth of information creates a poverty of attention."_ Information is abundant and nearly free; the scarce resource is the human capacity to attend to it. Therefore, in any information-rich environment, attention is what gets allocated, priced, and competed for. The platforms are not selling content or connections — they are brokering attention, and reselling it to advertisers.

This is the **attention war**: every product, every app, every notification, every red dot is a bid for the same finite, biological resource — the seconds of conscious focus a human has in a day. The platforms that won are the ones that captured the most seconds, and they captured them by deploying every mechanism in this chapter in combination. Dopamine, variable reward, operant conditioning, the Hook loop, FOMO, validation, status, identity, tribe, curiosity, completion, and novelty are not thirteen separate tricks; they are thirteen layers of the same stack, each making the others more effective.

The strategic implication for builders is uncomfortable: in a zero-sum attention market, growing your product's share often means taking it from somewhere — someone's sleep, someone's work, someone's friendships, someone else's app. The ethical builder has to decide not just _whether_ to compete for attention but _for what_, and _at what cost_. We return to this in Part 6 (Economics) and Part 8 (AI), because the answers get harder, not easier, from here.

## 1.15 Key Takeaways & Synthesis

The thirteen principles are not a menu; they are a layered system. The table below maps each to its evolutionary root, how platforms exploit it, its ethical weight, and its responsible-use form.

| Principle                   | Evolutionary "why"                  | Platform exploitation          | Ethical concern                   | Responsible use                          |
| --------------------------- | ----------------------------------- | ------------------------------ | --------------------------------- | ---------------------------------------- |
| Dopamine (prediction error) | Learn what exceeds expectations     | Variable-ratio feeds           | Compulsion without pleasure       | Reward genuinely useful actions          |
| Variable reward             | Pursue uncertain high-value payoffs | Slot-machine feeds, loot boxes | Behavioral addiction              | Blend variable w/ fixed, earned rewards  |
| Operant conditioning        | Repeat reinforced behavior          | Notifications, badges, streaks | Operates below conscious control  | Make schedules transparent/controllable  |
| Habit formation (Hook)      | Automate recurring behavior         | Closed internal-trigger loops  | Manufactured dependency           | Build loops that serve user goals        |
| FOMO                        | Track group survival info           | 24-hour ephemeral content      | Anxiety, esp. in teens            | Use decay to lower perfectionism         |
| Social validation           | Seek group belonging                | Quantified like scoreboards    | Worth tied to a number            | Validation for substance, not surface    |
| Status seeking              | Track social rank                   | Public karma/follower counts   | Zero-sum status competition       | Multi-dimensional, non-rankable status   |
| Identity building           | Approach ideal self                 | Curated profile theater        | Idealized-self anxiety            | Identity tools that close real gaps      |
| Tribal behavior             | In-group cohesion                   | Walled communities             | Polarization, out-group hostility | Bridges between tribes, porous edges     |
| Curiosity gaps              | Investigate the unknown             | Clickbait, "1 of N"            | Trust erosion, wasted attention   | Honor gaps with genuine payoff           |
| Completion bias             | Finish started tasks                | Streaks, progress bars         | Loss-aversion coercion            | Progress that's forgiving, not punitive  |
| Infinite novelty            | Attend to new stimuli               | Infinite scroll, autoplay      | No satiety, no stop signal        | Built-in breaks, natural stopping points |
| Attention economics         | Allocate finite focus               | Maximize seconds captured      | Zero-sum extraction               | Compete for attention _for_ the user     |

**The one-line synthesis:** _A social product becomes daily-used when it converts an ancient, recurring drive into a low-friction, variably-rewarded, identity-relevant loop that the user pulls for rather than is pushed to._

### Founder Lens — Part 1

**What should founders copy?**
The Hook loop as a design checklist, full stop. Every consumer product should be auditable against the four phases — what's the internal trigger, how easy is the action, where's the variable reward, what's the investment that loads the next trigger? If you can't fill all four, you don't have a habit, you have a feature. Copy also the obsession with Ability (Fogg): the single highest-leverage work in early consumer product is removing taps, not adding features.

**What should founders avoid?**
Borrowing the addictive mechanics without borrowing the substance. A red-dot notification, a streak, and an infinite feed bolted onto a thin product will burn users out fast and earn you the worst of both worlds — churn _and_ reputational damage. Avoid status currencies that are zero-sum and single-dimensional (one global leaderboard); they create a few winners and a mass of losers who leave.

**What would I build differently today?**
I'd design the _stop signal_ as a feature, not a missing piece. A product that helps users spend _better_ time rather than _more_ time is increasingly defensible — both because users are waking up to attention costs and because regulators are. I'd make status multi-dimensional and non-obvious (many local ladders, not one global rank). And I'd make the loop's variable reward pay out in _competence or connection_, not just content.

**What has AI changed?**
The reward layer is no longer bottlenecked by human content production. A feed can be infinitely novel without humans making it, because generative AI fills the supply side. This supercharges 1.2 (prediction error) and 1.13 (infinite novelty) — and sharply raises the addiction risk. It also enables _personalized_ variable rewards tuned to each user's specific prediction-error profile, which is a step-change in loop potency (covered fully in Parts 7 and 8). The ethical stakes in this chapter roughly double in an AI-native world.

**What is the opportunity?**
The opportunity is the mirror image of the incumbents' weakness: the major platforms optimized for _more time_. A product that wins on _time well spent_ — that uses these same psychological mechanisms in service of the user's actual goals (learning, fitness, real relationships, deep work) — is wide open. The mechanics aren't evil; the cargo on the lever is. Put better cargo on the lever.

**Difficulty (1–10):** 8. Building a habit-forming loop is hard; building one that's habit-forming _and_ good for the user is genuinely difficult, because the addictive mechanics and the ethical-responsibility constraints pull in opposite directions. Most teams optimize for one and sacrifice the other.

**Potential market size:** Effectively the entire consumer-internet TAM. Whichever product becomes the first "time-well-spent" default at scale defines a new category. The incumbents have shown the ceiling (trillions in value) for _less ethical_ versions; the addressable market for a more ethical one is not smaller — it's just unserved.

**Competitive landscape:** Brutal at the layer of "another feed." Wide open at the layer of "a product that helps me spend my attention well." The competitors are not each other; they are TikTok, Instagram, YouTube, and sleep. You are fighting for the same seconds.

**Biggest risks:** (1) You build something genuinely habit-forming and _unethical_, and the attention-regulation wave (EU DSA, kids' safety laws, design-code regulation) lands on you. (2) You build something ethical but not habit-forming enough to retain, and you die of the silent bleed described in 1.1. The narrow path is habit _plus_ ethics — which is the central design problem of the next decade of social products, and the reason this playbook exists.

---

### References (Part 1)

Berridge, K. C. (1996). Food reward: Brain substrates of wanting and liking. _Neuroscience & Biobehavioral Reviews, 20_(1), 1–25.

Dunbar, R. I. M. (1998). The social brain hypothesis. _Evolutionary Anthropology, 6_(5), 178–190.

Eyal, N. (2014). _Hooked: How to build habit-forming products_. Portfolio.

Fogg, B. J. (2019). _Tiny habits: The small changes that change everything_. Houghton Mifflin Harcourt.

Higgins, E. T. (1987). Self-discrepancy: A theory relating self and affect. _Psychological Review, 94_(3), 319–340.

Kahneman, D. (2011). _Thinking, fast and slow_. Farrar, Straus and Giroux.

Loewenstein, G. (1994). The psychology of curiosity: A review and reinterpretation. _Psychological Bulletin, 116_(1), 75–98.

Markus, H., & Nurius, P. (1986). Possible selves. _American Psychologist, 41_(9), 954–969.

Maslow, A. H. (1943). A theory of human motivation. _Psychological Review, 50_(4), 370–396.

Przybylski, A. K., Murayama, K., DeHaan, C. R., & Gladwell, V. (2013). Motivational, emotional, and behavioral correlates of fear of missing out. _Computers in Human Behavior, 29_(4), 1841–1848.

Schultz, W. (1997). A neural substrate of prediction and reward. _Science, 275_(5306), 1593–1599.

Simon, H. A. (1971). Designing organizations for an information-rich world. In M. Greenberger (Ed.), _Computers, communications, and the public interest_ (pp. 37–72). Johns Hopkins University Press.

Tajfel, H., & Turner, J. C. (1979). An integrative theory of intergroup conflict. In W. G. Austin & S. Worchel (Eds.), _The social psychology of intergroup relations_ (pp. 33–47). Brooks/Cole.

Veblen, T. (1899). _The theory of the leisure class_. Macmillan.

Zeigarnik, B. (1927). Das Behalten erledigter und unerledigter Handlungen [The retention of completed and uncompleted activities]. _Psychologische Forschung, 9_(1), 1–85.

---

---
