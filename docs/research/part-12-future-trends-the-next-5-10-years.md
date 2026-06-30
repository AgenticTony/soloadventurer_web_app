# Part 12 — Future Trends — The Next 5–10 Years

Growth is the metric founders brag about; retention is the metric that kills them. The same is true for predictions. Everyone wants to call the next platform shift. Almost nobody calls it correctly, and the ones who do are usually guessing. So this part is built on a discipline the rest of the book hasn't needed: separating what we can see from what we're projecting, and labeling speculation as speculation.

The first eleven parts of this book reverse-engineered platforms that already exist. This part looks forward. The change in posture matters. Everything up to now rested on evidence: cohort curves, retention data, engagement mechanics, network-effects math (see Part 5). Forecasting is different. The honest version of it says: here is the trajectory of a force we can measure today, here is where that trajectory points if it continues, and here is where I'm just placing a bet because the curve hasn't bent yet.

## 12.1 Intro: Why a Forward-Looking Part Is Essential

You can build a great product by copying what works. You cannot build the next TikTok by copying TikTok. By the time a mechanic is legible enough to copy, the platform that owns it has already compounded its lead (see Part 3 on retention moats). The founders who built Instagram, Snapchat, and TikTok were not iterating on the previous generation's playbook — they were reading a technological shift early and building the behaviors that shift would unlock.

The shift in front of us is larger than any single platform's mechanic. AI does not just create content. It changes the economics of network formation itself — the core thread of this entire book. When matching, discovery, and introductions can be done by agents at near-zero marginal cost, the assumptions that underpinned every social platform of the last twenty years stop holding. Facebook scaled on the cost of human-to-human discovery. LinkedIn scaled on the cost of professional introductions. TikTok scaled on the cost of human content supply matched to human attention. All three costs are collapsing, simultaneously, now.

This part uses a three-tier method, and the tiers matter because founders will over-index on whichever one flatters their thesis:

- **Evidence.** Things shipping today, at scale, with measurable adoption. Agent SDKs, AI-generated content feeds, voice interfaces, content credentials. These are facts.
- **Projection.** Trajectories with a clear vector. If the cost of a token keeps falling at the rate it has for two years, certain behaviors become economically rational that aren't yet. Projection is evidence + a directional bet.
- **Speculation.** Things that require a step-change, not a continuation — brain-computer interfaces, post-smartphone social, "post-social" anything. These are labeled explicitly throughout (see 12.11). Founders who confuse speculation for projection burn capital and credibility.

The discipline is not pessimism. It is calibration. The founders who win the next decade will be the ones who place big bets on projections and small bets on speculations — not the other way around.

## 12.2 When Everyone Has an AI Assistant

The single most consequential shift of the next decade is the rise of the personal AI assistant as the default interface to digital life. This is not speculation; it is projection. The evidence is in your hands. ChatGPT, Claude, Gemini, and a long tail of specialized agents already mediate how hundreds of millions of people search, summarize, shop, and decide. The assistant is becoming the gateway, and the gateway sits between the user and every platform that wants to reach them.

This inverts the last twenty years of platform power. Google won the desktop era because it was the gateway to the web (Battelle, 2005). Facebook won the mobile era because the feed was the gateway to social attention. The assistant era's gateway is a conversational agent that knows the user's intent, history, and preferences — and it answers directly rather than routing to a list of blue links or a feed of posts. When the assistant can summarize, the search results page stops being real estate. When the assistant can buy, the product page stops being a destination.

The technical term for what happens next is **intermediation**. The layer between the user and the content layer absorbs the value. If your platform's value is "we help users discover things," and an assistant can do that discovery better, faster, and without the user ever visiting your surface — your platform has been intermediated. This is the threat facing Pinterest's discovery surface, Yelp's review surface, and a meaningful slice of Google's search surface today.

For founders, this is not purely a threat. Intermediation creates new positions on the stack:

- **Assistant-native applications.** Tools designed to be called by agents, not browsed by humans. MCP (Model Context Protocol) and similar standards are the early plumbing. The analogy is the API economy of 2008–2015, but the consumer is an agent, not a developer.
- **Vertical agents.** A general assistant is good at general tasks. Specialists win in domains where context depth matters — legal, medical, financial, creative. The vertical-agent thesis is that "ChatGPT for X" is not a feature; it is a company.
- **Agent infrastructure.** Memory, identity, permissions, payments, and reputation for agents. Nobody owns this layer yet (see 12.5).

> **Box: What AI changes — the assistant layer itself**
>
> - The default interface to the internet becomes conversational, not graphical.
> - Discovery collapses into dialogue; the "search results page" stops being prime real estate.
> - Platforms lose direct user relationships; the assistant owns the session.
> - Intent data, currently fragmented across apps, concentrates in the assistant.
> - New gatekeepers emerge — and gatekeepers extract rent.

**Takeaway:** If your product's moat is discovery or routing, assume it erodes. If your product's moat is proprietary data, relationships, or trust, it strengthens. Build for the agent as a first-class user, not an afterthought.

## 12.3 What Disappears from Today's Platforms

Some of the most familiar artifacts of the social era are artifacts of cost constraints that AI removes. When those constraints lift, the artifacts look anachronistic. Here is what is likely to fade — projection, not speculation, because the substitutes are already shipping in weak forms.

**The reverse-chronological and algorithmic feed.** The feed exists because human attention is scarce and content supply was even scarcer; you needed a ranked list to allocate attention efficiently. When supply is infinite and personalization is conversation-grade, the list stops being the right primitive. The successor is closer to a channel — a continuous, multimodal, adaptive stream the user talks to, not scrolls. We already see early versions in AI-generated TikTok-style feeds and in ChatGPT's audio mode.

**Public follower counts.** Follower counts were a proxy for reach in a world where reach was hard to measure and harder to achieve. They became status objects, then they became gameable, then they became meaningless for anyone not at the top. The replacement is not a better vanity metric; it is the disappearance of the public-facing number in favor of agent-mediated, contextual reach. You don't "have 50,000 followers." Your work reaches the 50,000 people for whom it is relevant, this week, through their agents. Follower counts were a coarse approximation of this. Agents make the approximation unnecessary.

**Manual search and typed queries.** Voice-first and intent-first interfaces are already reducing typed search among younger cohorts. Projection: typing a query into a box becomes a power-user behavior within five years, the way command-line interfaces are today — used by experts, invisible to everyone else.

**The typed interface itself.** This is the one that feels most speculative but is on the firmest behavioral ground. Younger users already prefer voice and camera to text. As multi-modal models get cheap and fast, the keyboard's role as the default input shrinks. It does not disappear. It becomes one input among several, used when precision matters.

> **Box: What AI changes — the feed**
>
> - The ranked list was a response to scarce supply; infinite supply breaks it.
> - Personalization becomes dialogue, not ranking.
> - Public metrics (followers, likes) lose signal as reach becomes contextual.
> - The scroll gives way to the conversation.
> - Attention shifts from "what's next" to "what do I want now."

**Takeaway:** Do not build the next great feed. Build the next great channel, assistant, or surface that makes feeds unnecessary. The feed is a transitional form.

## 12.4 New Behaviors That Emerge

New infrastructure produces new behaviors, and new behaviors are where companies are built. The previous sections described subtraction. This one describes addition — the things people will do that they cannot do today, or do not do because the cost is too high.

**Agent-mediated introductions.** Today, an introduction costs social capital: someone has to vouch, broker, and risk their reputation. Dunbar's number — roughly 150 stable relationships — is a cognitive limit on human social grooming (Dunbar, 1992; see Part 2). Agents can carry reputation context across introductions at near-zero cost, which does not abolish Dunbar's limit but does extend the band of "weak ties" (Granovetter, 1973) that can be productively activated. The behavior: a user tells their agent "introduce me to three people building AI-native consumer companies in Stockholm," and the agent brokers, schedules, and briefs both sides. This is a direct attack on LinkedIn's core job-to-be-done.

**Ambient presence.** Always-on voice and presence — the Alexa/Facebook Portal vision, but actually good. A persistent channel with people you care about, where the agent manages the friction (transcription, summarization, scheduling) so the humans can just talk. Discord and iMessage are primitive versions. The behavior that emerges is low-effort, asynchronous-but-warm connection — the texture of being in the same room without being in the same room.

**Persistent digital companions.** This is where the honesty matters: the evidence for sustained human-AI companionship is real but thin, concentrated in early products (Character.AI, Replika) with retention curves that look more like games than utilities. Projection: companions get good enough that a meaningful minority of users form stable, valued relationships with them. Speculation: companions become the primary social relationship for a large population. The first is a product opportunity. The second is a societal question.

**Synthesized communities.** Today, communities are bounded by who shows up. When agents can populate a discussion with relevant perspectives, summarize threads, and match participants, the "community" becomes less a room of people and more a computed surface optimized for the individual. The risk — covered in 12.7 — is that this dissolves the shared-experience property that makes communities politically and socially functional. The opportunity is that it solves the cold-start and retention problems that kill most community products (see Part 7).

> **Box: What AI changes — introductions and community**
>
> - Introductions, historically gated by social capital, drop to near-zero cost.
> - Ambient, voice-first presence replaces scheduled, text-first connection.
> - Companions move from novelty to utility for a real user base.
> - Communities become computed, not assembled — with real upside and real risk.
> - Dunbar's limit bends but does not break.

**Takeaway:** The biggest behavioral white space is anything that reduces the social-capital cost of connection. Introductions, warm handoffs, community matching — these are the cold-start problems AI actually solves.

## 12.5 How Autonomous Agents Reshape Interaction

When agents act on behalf of humans, a second social layer forms: agents interacting with agents. This is not speculative infrastructure; it is the explicit design target of MCP, agent-to-agent protocols, and the procurement workflows already running in enterprise. The consumer version is two to five years behind, but the vector is clear.

The implication that matters most is **reputation between agents**. Human reputation is slow, narrative, and lossy — built over years through repeated interaction (Cialdini, 1984). Agent reputation must be fast, machine-readable, and transferable. The open question is whether reputation attaches to the agent, to the human principal behind the agent, or to some hybrid "verified human + agent behavior" object. This is one of the more important unresolved design problems of the decade, and the entity that solves it at scale owns a layer.

There is a relevant precedent. Metcalfe's Law and Reed's Law described the value of networks of humans (Metcalfe; Reed, 2001, as cited in Reed, 2001; see Part 5). Agent networks are not obviously subject to the same mathematics, because agents can spawn, merge, and represent multiple principals simultaneously. The network-effects curve may be steeper on the way up — and steeper on the way down, because agent relationships are easier to dissolve than human ones. This is a hypothesis, not a settled result. What is settled: whoever runs the reputation and identity layer for agents runs a network-effects business of potentially historic size.

A simple way to see the shift:

```
1995-2010:  Human  <-->  Web page        (browser as intermediary)
2010-2025:  Human  <-->  Feed / App      (platform as intermediary)
2025-2035:  Human  <-->  Agent <--> Agent <--> Human
                                ^
                          reputation layer (unowned)
```

The trust infrastructure is the unbuilt layer. Provenance (12.8), agent identity, agent liability, and agent-to-agent verification are the open problems. Each is a company. Collectively they are a stack.

> **Box: What AI changes — the social graph**
>
> - A second graph forms: agent-to-agent, parallel to the human graph.
> - Reputation must become machine-readable and transferable.
> - The network-effects math may be sharper in both directions.
> - Trust infrastructure (identity, provenance, liability) is unowned.
> - The reputation layer is a once-in-a-decade platform opportunity.

**Takeaway:** If you are an infra-oriented founder, the reputation-and-identity layer for agents is the single highest-leverage problem in the next five years. If you are a consumer founder, assume your users have agents and design the relationship for that — do not discover it later.

## 12.6 What People Spend Time on Instead of Scrolling

If the feed contracts, the time has to go somewhere. Forecasting how attention reallocates is the most consequential demand-side question in consumer tech. Here is the projection, grounded in what already converts.

**Creation over consumption.** The single strongest behavioral signal of the AI era is that creation cost is collapsing faster than consumption cost. Writing, drawing, video, code, music — the marginal cost of producing a competent artifact is falling toward zero. When consumption and creation are both cheap, the balance shifts toward creation because creation is intrinsically more rewarding (Pink, 2009; Deci & Ryan on intrinsic motivation, as cited in Ryan & Deci, 2000). We see this in the rise of Remini, CapCut, and AI art tools among cohorts that previously only consumed. The behavior: more making, less watching.

**Depth over breadth.** The feed optimized for breadth — many shallow signals from many sources. Agents that summarize and filter reduce the return on breadth and increase the return on depth. Long-form, high-signal, high-trust content wins relative to short-form, low-signal, low-trust content. This is bad news for the engagement-maximized feed and good news for newsletters, books, podcasts, and the long-form creators behind them.

**Real-world integration.** The most durable behavioral shift of the post-feed era may be the re-localization of social. For two decades, social platforms competed with physical proximity. If digital connection gets cheaper and ambient (12.4), it stops being a substitute for the physical and starts being a complement. The behavior: people use AI to find the five people in their neighborhood worth knowing, then go meet them. Local-first social products — beat-up by a decade of failures — get a second wind when matching is free.

**The re-localization thesis.** This is a projection, not a certainty. The counter-thesis is that ambient AI makes remote connection so good that physical proximity matters less, accelerating the post-geographic social trend. Both cannot be true. My bet, weakly held: re-localization wins for weak ties and community; remote-first wins for strong ties and work. The split matters because it determines which consumer products get built.

> **Box: What AI changes — time allocation**
>
> - Creation cost falls faster than consumption cost; the ratio inverts toward making.
> - Depth gains on breadth as filtering gets cheap.
> - Local matching at zero cost reopens local-first social.
> - Ambient connection complements, rather than replaces, physical proximity.
> - The feed's share of leisure time contracts for the first time in 20 years.

**Takeaway:** Build for makers, not scrollers. Build for depth, not breadth. And seriously reconsider local — the reason local social failed for fifteen years may have just been removed.

## 12.7 The Personalization Endgame

The personalization frontier has been moving in one direction for twenty years: more granular, more predictive, more individual. The endgame is hyper-personal reality — every user experiences a version of content, products, and eventually information that is optimized uniquely for them. This is technically proximate. It is socially and politically dangerous.

The shared-truth problem is the core risk. Democracy, markets, and culture all depend on a baseline of shared experience (Sunstein, 2001 on group polarization; Pariser, 2011 on filter bubbles). When two citizens live in genuinely different information environments — not different opinions about the same facts, but different facts — the substrate of collective decision-making weakens. Filter bubbles were the warning. Hyper-personalization, driven by models that can generate unlimited bespoke content, is the realized version.

The fragmentation of common experience is already measurable in media consumption. Add generative content and the fragmentation compounds. The honest read: this is the most under-discussed risk of the AI era, and it is not speculation — it is the predictable output of technologies shipping now. The only open question is the magnitude.

For founders, this creates a genuine tension. Personalization is the lever that drives engagement and retention (see Part 1 on the Hook Model). The product playbook says: personalize more. The societal calculus says: personalize too much and you dissolve the shared substrate that makes the product's host society functional. The founders who navigate this well will build products that are personalized in _form_ but anchored in _shared_ underlying reality — different presentations of the same facts, not different facts. This is hard. It is also a differentiator.

> **Box: What AI changes — reality itself**
>
> - Personalization reaches the individual-content level.
> - Shared experience — the substrate of democracy and markets — fragments.
> - Filter bubbles were the warning; generative content is the arrival.
> - "Different presentation of the same facts" becomes a design discipline.
> - Trust and authenticity become scarcer than content (see Part 1 thesis).

**Takeaway:** The personalization lever still works, but it has a political and social limit. The winning products will be personalized in surface and anchored in shared reality. Build the discipline in now; retrofitting it after a regulatory or reputational event is far more expensive.

## 12.8 Identity, Authenticity, and Proof

As content supply becomes infinite, scarcity moves to authenticity. The question "is this human?" becomes the load-bearing trust question of the decade, and the infrastructure to answer it is being built right now.

The technical answer is **provenance**: cryptographic content credentials that trace an artifact back to its source, human or model. The Content Authenticity Initiative (CAI), C2PA, and similar standards are the early plumbing. Apple, Adobe, Microsoft, and others have shipped implementations. The evidence base is real; adoption is early.

The behavioral question is harder. Users do not want to inspect provenance metadata on every post. The trust layer has to be ambient — a signal, a badge, a default — the way HTTPS became ambient for web security. The company that makes content authenticity as invisible and trusted as the padlock in a browser bar wins a layer of the stack.

A note on the "is this human?" framing: it is slightly wrong. The right question is "is this what it claims to be, from whom it claims to be?" A piece of AI-generated art, clearly labeled as such, from a creator I trust, is authentic. A piece of human-generated content, fraudulently attributed, is not. The human-vs-AI binary is a distraction. Provenance and attribution are the real problems.

> **Box: What AI changes — trust and authenticity**
>
> - Content supply becomes infinite; scarcity moves to authenticity.
> - "Is this human?" is the wrong question; "is this what it claims to be?" is right.
> - Cryptographic provenance (C2PA, CAI) is the early infrastructure.
> - Ambient trust signals — like HTTPS — are the design target.
> - Attribution, not human-vs-AI, is the load-bearing problem.

**Takeaway:** Trust infrastructure is being built this decade the way payments infrastructure was built in the 2000s. If you touch content, identity, or reputation, treat provenance as a first-class concern, not a compliance afterthought.

## 12.9 Governance by AI

Moderation is the unglamorous core of every platform at scale, and it is about to be automated in ways that change both the economics and the politics of platforms. This is projection grounded in current practice: the major platforms already use ML classifiers for the overwhelming majority of moderation decisions; the remaining human-reviewed edge cases are where the hardest policy and product questions live.

The trajectory points to **agent-run communities** — communities where the rules are enforced, and in some cases written, by AI. Reddit's subreddit model, Discord's server model, and the broader pattern of federated community governance all become candidates for AI moderation that is faster, cheaper, and more consistent than human moderation. The upside: communities scale without burning out their moderators. The downside: AI moderation has well-documented failure modes around context, satire, minority languages, and political edge cases (Gillespie, 2018 on the politics of platforms).

The deepest question is accountability. When an AI agent bans a user, escalates a post, or dissolves a community, who is responsible? The platform? The community owner? The model provider? The current legal answer is murky and jurisdictional. The practical answer, over the next decade, is that accountability frameworks will be built alongside the technology — and the founders who build clear, defensible accountability models will have a structural advantage as regulation arrives (the EU AI Act and similar frameworks are the leading edge).

> **Box: What AI changes — governance**
>
> - Moderation, already mostly automated, becomes near-total.
> - Communities can be agent-run end-to-end, at near-zero marginal cost.
> - Context, satire, and edge cases remain hard — and politically charged.
> - Accountability (who is liable for an agent's decision?) is unresolved.
> - Regulation arrives faster than the technology matures.

**Takeaway:** If you are building a community product (see Part 7), assume AI moderation is table stakes within three years. Spend your real design effort on the accountability model and the human-appeal layer — that is where trust is won or lost.

## 12.10 The Economics Flip

This is the part of the forecast with the highest stakes and the lowest certainty, and it deserves to be stated bluntly. The advertising model that funded the social era depends on humans browsing, seeing ads, and being influenced. If agents do the browsing and the buying, the ad model collapses.

This is not a future problem. It is a present problem in early form. When an agent summarizes a product category and recommends one option, the sponsored results, the comparison pages, and the affiliate links in between are bypassed. The economic logic of attention monetization — the logic that funded Google, Facebook, and every ad-supported social platform — assumes a human in the loop looking at surfaces. Remove the human from the loop and the surfaces stop being monetizable.

What replaces attention monetization? Three candidates, each with real problems:

1. **Agent payola.** Agents are paid to recommend. This is the direct successor to advertising and inherits all its trust problems, faster. Regulators will be aggressive; users will be cynical. Likely to exist, unlikely to be the dominant model.
2. **Subscription and transaction fees.** Users pay for the agent and the underlying services. Clean economics; regressive access. Works for the top of the market; struggles for the mass market that the ad model served.
3. **Outcome-based monetization.** Agents take a cut of transactions they enable. This is closest to the affiliate model, but compressed and agent-native. Plausible, but requires the trust and reputation layer from 12.5 to function.

The most likely outcome is a mix, with subscription and outcome-based dominating at the top of the market and a degraded, agent-payola-flavored ad model persisting at the bottom. The founder implication: do not assume ad revenue will fund your AI-native consumer product. Assume you need a monetization model that works when the user never sees a page.

> **Box: What AI changes — the ad model**
>
> - Agents that browse and buy bypass the surfaces ads live on.
> - Attention monetization, the funding engine of the social era, weakens.
> - Subscription and outcome-based models gain share.
> - Agent payola is the sleazy successor; regulators will be aggressive.
> - The business model of consumer AI is unsolved at the mass market.

**Takeaway:** The ad-funded consumer playbook is on borrowed time. If your product's unit economics assume advertising, pressure-test them against a world where the user's agent never loads your page. Most products fail this test.

## 12.11 Speculative Futures (Label Clearly)

Everything above is projection — grounded in current trajectories. What follows is speculation — things that require a step-change, not a continuation. Treat these as low-probability, high-impact scenarios worth thinking about, not building against today.

**Post-smartphone social.** The smartphone has been the substrate of social computing for fifteen years. Wearables, glasses, and ambient devices could displace it. Speculation: the form factor changes the behaviors. Voice-first, camera-first, and eventually neural-input devices produce social primitives that do not map onto feeds, posts, or profiles. Probability over ten years: low-to-mid. The smartphone is a remarkably sticky form factor; the Apple Vision Pro and similar devices have not yet found a mass-market social behavior.

**Brain-computer interfaces.** Neuralink, Synchron, and the broader BCI field are real, but consumer-grade, non-medical BCIs at scale are well beyond a ten-year horizon for social applications. Speculation only. The interesting question if it arrives: what does a social primitive look like when input is faster than typing and output is direct to cognition? We do not know. Nobody does.

**Fully synthetic celebrities and communities.** AI-generated personas with consistent identities, backstories, and relationships, followed by audiences that may or may not know they are synthetic. The Lil Miquela prototype is years old; the technology is now far past it. Speculation: synthetic celebrities become a real cultural category within five years (this is closer to projection than the others on this list). Fully synthetic _communities_ — where most participants are agents — is deeper speculation with real risks (12.7).

**Persistent spatial worlds.** The metaverse thesis, revisited with AI-generated content. The speculation is not whether spatial computing arrives — it will, in some form — but whether it becomes a _social_ substrate or remains a gaming and productivity substrate. Probability of mass-market social spatial worlds in ten years: low. The behavioral pull of spatial presence is real but the form factor and friction are not solved.

**The "post-social" possibility.** The deepest speculation in this book. If agents satisfy the jobs that social platforms currently satisfy — connection, status, identity, belonging (see Part 2 on Maslow and social needs; Tajfel & Turner, 1979 on identity) — then "social media" as a category may contract rather than evolve. People still have social needs; they may meet them through agents, small groups, and re-localized community (12.6) rather than through broadcast platforms. This is the scenario in which the next decade does not produce a new Facebook but produces the conditions in which the Facebook category itself shrinks. Probability: genuinely uncertain. It is the scenario most incumbents are least prepared for.

**Takeaway:** Speculation is for placing small bets and staying intellectually honest, not for raising a Series A. If you are founding a company on one of these, your problem is not the vision — it is the timing.

## 12.12 Scenario Table

The table below summarizes the chapter's projections with explicit confidence levels. Read confidence as: _how much would I bet on this, not how loudly I'd argue for it._

| Trend                                     | Evidence Today                                              | 5-10 Year Projection                                              | Confidence                    |
| ----------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------- |
| AI assistant as default interface         | ChatGPT/Claude/Gemini at scale; MCP standard shipping       | Assistant mediates majority of discovery and routing decisions    | **High**                      |
| Decline of the feed                       | AI-generated feeds; conversation interfaces shipping        | Feed contracts; channel/conversation primitives replace it        | **Mid-High**                  |
| Agent-mediated introductions              | Vertical agents in enterprise; LinkedIn's decline in signal | Introduction cost drops to near-zero; new social products emerge  | **Mid**                       |
| Agent-to-agent social graph               | MCP, agent protocols, enterprise procurement agents         | Parallel reputation/identity layer forms; unowned today           | **Mid**                       |
| Provenance / "is this human?"             | C2PA, CAI, Apple/Adobe implementations                      | Ambient trust layer becomes standard; new trust companies         | **Mid-High**                  |
| Re-localization of social                 | Weak; local social has failed for 15 years                  | Local-first social gets a second wind IF matching cost hits zero  | **Low-Mid**                   |
| Hyper-personalization & shared-truth risk | Filter bubbles; generative content at scale                 | Fragmentation of common experience; regulatory response           | **High (risk), Low (timing)** |
| Collapse of attention monetization        | Agents summarizing product searches                         | Ad model weakens meaningfully; subscription + outcome models gain | **Mid-High**                  |
| AI-run community governance               | Platforms use ML moderation already                         | Agent-run communities normalize; accountability frameworks built  | **Mid**                       |
| Persistent AI companions                  | Character.AI, Replika; retention looks game-like            | Companions become utility for a meaningful minority               | **Mid**                       |
| Post-smartphone social                    | Vision Pro, wearables; no mass behavior yet                 | Form factor shifts; new social primitives emerge                  | **Low**                       |
| Brain-computer interfaces for social      | Medical-grade BCIs; no consumer use case                    | Not material to social in 10 years                                | **Very Low**                  |
| "Post-social" scenario                    | Early signs of feed fatigue; younger cohorts                | Social-media category contracts rather than evolves               | **Low-Mid**                   |

The confidence column is the most important part of this table. A founder who treats a Low-confidence trend as High-confidence builds the wrong company. A founder who treats a High-confidence trend as someone else's problem gets intermediated.

## Founder Lens - Part 12

**What should founders copy?**
The discipline of separating evidence from projection from speculation. The incumbents you are attacking are not separating them; they are treating all of it as noise. That is your edge. Copy the layering method: build on evidence, bet on projection, option on speculation.

**What should founders avoid?**
Do not build a better feed. Do not build a product whose unit economics assume human browsing and ad monetization. Do not raise a Series A on a speculative timeline (BCIs, post-smartphone). And do not assume the personalization lever has no limit — the shared-truth problem is a real product risk, not just a societal one.

**What would I build differently today?**
Every consumer product should be designed with an agent as a first-class user from day one — an API surface for agents, a reputation model, a provenance story. The cost of adding this later, after an incumbent defines the standard, is the difference between being a platform and being a tenant.

**What has AI changed?**
The economics of network formation itself. Discovery, matching, introductions, content supply, and moderation — the five cost structures that defined the social era — are all collapsing simultaneously. This is not an incremental change to one platform's mechanic; it is a change to the substrate under all of them.

**What is the opportunity?**
Three layers, in order of clarity: (1) the agent reputation/identity/provenance layer — infrastructure, unowned, network-effects business; (2) vertical, assistant-native applications that own a job-to-be-done the general assistants do badly; (3) local-first and depth-first consumer products that the feed era could not sustain. Each is a different company with a different founder profile.

**Difficulty (1-10):** 9. This is the hardest part of the book to build against because the winning move requires reading a curve that has not bent yet. Building on evidence is safe; building on projection is where the returns are, and where most of the failures are.

**Potential market size:**
Effectively the entire consumer-internet market is in play. The assistant layer alone is a winner-take-most platform opportunity comparable to search or mobile OS. The vertical layers are each multi-billion-dollar categories. The trust/provenance layer is a foundational standard play.

**Competitive landscape:**
The incumbents (OpenAI, Anthropic, Google, Meta, Apple, Microsoft) are fighting for the assistant layer and the agent infrastructure. They will likely own the horizontal plumbing. The opportunity for independent founders is vertical: agents and applications that own a domain, a relationship, or a trust standard the horizontals will not specialize into.

**Biggest risks:**
Timing (building a projection before the curve bends), regulation (the EU AI Act and successors will shape what is buildable), the shared-truth backlash (a political event that suddenly makes personalization a liability), and the ad-model collapse hitting before the replacement monetization is ready. The last one is a macro risk that takes down a generation of consumer startups with it.

## References (Part N)

Battelle, J. (2005). _The search: How Google and its rivals rewrote the rules of business and transformed our culture_. Portfolio.

Cialdini, R. B. (1984). _Influence: The psychology of persuasion_. Harper Business.

Deci, E. L., & Ryan, R. M. (2000). The "what" and "why" of goal pursuits: Human needs and the self-determination of behavior. _Psychological Inquiry, 11_(4), 227–268.

Dunbar, R. I. M. (1992). Neocortex size as a constraint on group size in the primates. _Journal of Human Evolution, 22_(6), 469–493.

Eyal, N. (2014). _Hooked: How to build habit-forming products_. Portfolio.

Fogg, B. J. (2019). _Tiny habits: The small changes that change everything_. Houghton Mifflin Harcourt.

Gillespie, T. (2018). _Custodians of the Internet: Platforms, content moderation, and the hidden decisions that shape social media_. Yale University Press.

Granovetter, M. S. (1973). The strength of weak ties. _American Journal of Sociology, 78_(6), 1360–1380.

Pariser, E. (2011). _The filter bubble: What the Internet is hiding from you_. Penguin Press.

Pink, D. H. (2009). _Drive: The surprising truth about what motivates us_. Riverhead Books.

Reed, D. P. (2001, September 7). That sneaky exponential — Beyond Metcalfe's law to the power of community building. _Reed's Law_.

Ryan, R. M., & Deci, E. L. (2000). Self-determination theory and the facilitation of intrinsic motivation, social development, and well-being. _American Psychologist, 55_(1), 68–78.

Schultz, W. (1997). A neural substrate of prediction and reward. _Science, 275_(5306), 1593–1599.

Sunstein, C. R. (2001). _Republic.com_. Princeton University Press.

Tajfel, H., & Turner, J. C. (1979). An integrative theory of intergroup conflict. In W. G. Austin & S. Worchel (Eds.), _The social psychology of intergroup relations_ (pp. 33–47). Brooks/Cole.
