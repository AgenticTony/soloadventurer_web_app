No existing Part 1 file in the repo to calibrate against, so I'll match the voice, altitude, and structure specified in the brief directly. Writing the full chapter now.

# Part 8 — AI Changes Everything

## 8.1 Why AI Deserves Its Own Part

Almost every book on social product strategy was written before agents. Nir Eyal's _Hooked_ (2014) assumed the loop had a human at every node. Marty Cagan's _Inspired_ (2018) assumed a human shipped every feature, read every signal, and triaged every report. The dominant frameworks—MAU, DAU/MAU, retention curves, network-effects math—are all calibrated to a world where a "user" is an unambiguous, conscious, carbon-based account holder.

That assumption is now load-bearing and wrong.

The thesis of this part is simple and I will state it repeatedly: **AI is not a feature added to social. It changes every role in the system.** The user, the creator, the moderator, the community manager, the recommender, the graph builder, the interface—all of them can now be partially or fully automated, and in several cases already are. When you change every node in a network at once, you do not get an upgraded network. You get a different system with different economics.

This matters for two reasons. First, the core thread of this book (see Part 1): **AI does not just create content—it changes the economics of network formation itself.** Supply costs collapse. Cold-start becomes a simulation problem rather than a chicken-and-egg problem. Trust, not distribution, becomes the binding constraint. Second, the payload question we have been advancing toward—_what can be built now that could not have been built when Facebook, Instagram, or TikTok started?_—gets its sharpest answers here. Most of them are not "a better feed." They are new categories entirely.

A note on scope. I am not going to relitigate whether LLMs are intelligent. I assume you have used them and treat them as competent, cheap, fast cognitive labour. The interesting question is what happens to a social product when that labour is available at marginal-cost-zero to every participant, every operator, and every attacker simultaneously.

> **Box: What AI changes - the entire social category**
>
> - Content supply goes from scarce to effectively infinite.
> - The "user" becomes ambiguous: human, agent, or human-plus-agent.
> - Network cold-start collapses from a distribution problem to a simulation problem.
> - Trust and authenticity replace distribution as the binding constraint.
> - The interface default migrates from feed to conversation.

## 8.2 AI as a User

The first role to flip is the most basic: the entity on the other end of the connection.

For twenty years, a "user" was a person who logged in, scrolled, tapped, and occasionally posted. Bot traffic existed—Twitter's bot problem, Meta's fake-account estimates in the billions—but bots were failures to be filtered, not first-class participants. They were noise.

Agents are not noise. They browse with intent, post on behalf of principals, consume content to summarize it for a human who never visits the app, and transact on instructions. When I ask my assistant to "go read what the group said about the Lisbon trip and tell me if I need to reply," the assistant is now the user of Facebook's product, not me. The human is downstream of the interaction.

This breaks the unit economics of every metric built on the human-account assumption. DAU becomes ambiguous. Ad impressions delivered to an agent that never relays them to a human are worth something close to zero. Attention, the scarce resource the entire attention economy (see Part 2) is priced in, now has a counterfeit version.

The sharp takeaway: **traffic becomes partly non-human by default, and the platforms that survive this are the ones that price and design for it rather than deny it.** Expect an "authenticated human" layer—proof-of-personhood, biometric liveness, attended-presence signals—to become a first-class product surface. Expect "designed to be consumed by agents" to become a feature, not a bug: structured outputs, agent-readable endpoints, the social API as the product rather than the feed. Cloudflare is already reporting a majority of internet traffic as automated (Cloudflare, 2024); the question is which platforms treat that as their new user base.

## 8.3 AI as a Creator

If the user role goes ambiguous, the creator role collapses outright.

In Part 3 we treated the creator supply chain as a bottleneck: creative talent was scarce, production was expensive, distribution was gatekept. Generative AI attacks all three. The marginal cost of a competent image, a serviceable short video, a passable essay, and now a working code snippet is approaching the cost of the prompt. When supply curves like that break, the assumption underneath—_content is expensive, therefore curation is valuable_—breaks with it.

The immediate symptom is flood. Pinterest and Instagram are already awash in AI imagery; Reddit moderators report AI-generated submissions as their top moderation burden; news syndication is increasingly machine-written. The deeper symptom is a **provenance and authenticity crisis**. When a photo of an event could be real or synthetic and the cost of telling them apart rises, the default trust in _all_ media falls. This is the core of the disinformation-economics argument (Doctorow, 2024): the cheaper it is to flood the zone, the more valuable authenticated signal becomes.

Two strategic consequences. First, **verification becomes a product**. Content Credentials, C2PA signatures, on-device capture attestation, creator reputation graphs—these are not features, they are the new trust substrate that attention products will be rebuilt on. Second, the bar for human creativity rises to _taste and point of view_, the things generative models are structurally bad at because they regress to the mean. The creators who win are not the ones who can produce; they are the ones whose production a model could not have generated without them. Personality, lived experience, and opinionated curation become the scarce factors.

> **Box: What AI changes - Instagram (and every visual feed)**
>
> - Infinite competent imagery destroys the scarcity that justified the feed.
> - Authenticity signals (Credentials, capture provenance) become the ranking input.
> - The creator middle collapses; winners are personality-led, not skill-led.
> - Stock and templated content businesses die first.
> - Trust becomes more valuable than reach.

## 8.4 AI as a Moderator

Every platform with user-generated content runs a moderation stack, and for the largest it is already mostly automated. Meta reports the vast majority of its enforcement actions are taken by automated systems before a human reviewer ever sees them (Meta, 2023). So in one sense AI-as-moderator is not new. What is new is the competence ceiling and the cost curve.

What changes is the **long tail**. The content that historically got through—because it was in a low-resource language, because it was contextually subtle, because it required cultural knowledge a classifier did not have—is now catchable. LLM-based moderation can reason about context, sarcasm, and dog-whistles in ways keyword lists and small classifiers could not. For a founder, this inverts the build-vs-buy calculus: the marginal cost of a competent, multilingual, context-aware moderator is now a per-token API call, not a trust-and-safety headcount.

But the limits are real and structural. Automated moderation has a persistent **false-positive** problem on edge cases, and edge cases—satire, marginalised-community speech, evolving slang—are exactly where harm concentrates. The deeper issue is **legitimacy** (see Part 9 on governance). A takedown decision made by a model is illegible to the user; you cannot meaningfully appeal a number you cannot inspect. This is the transparency-versus-safety tension that Gillespie (2018) documents, now amplified.

The practical takeaway: **automate the obvious, human-review the contested, and make appeal a first-class feature.** Platforms that treat moderation as a black box will lose the trust war to platforms whose decisions are explainable. Expect "show me why this was removed" to become a baseline expectation, not a premium feature.

## 8.5 AI as a Community Manager

The community-manager role is the unglamorous one most strategy books underweight, and it is the one AI can most credibly absorb today.

Building a community from zero is mostly labour: seeding the first hundred conversations, welcoming newcomers, connecting lurkers to relevant threads, mediating the first conflicts before they metastasize. It is high-effort, low-glamour, and it is exactly the kind of work that kills early-stage products because no founder has time for it (Fogel, 2020). Reddit's early history is famously a story of the founders seeding content under sockpuppet accounts until real users arrived (see Part 4).

An AI community manager changes the cold-start economics. It can greet every new member with a personalised message, surface three threads matched to their stated interests, nudge a lurker who has viewed five posts without commenting, summarise a 200-message argument into a neutral one-paragraph brief, and flag the moment a disagreement is escalating into a flame war. This is not theoretical—Discord bots and Slack integrations already do slices of it. What is new is doing it _well, at the level of a competent human moderator, for every community simultaneously_.

The risk is the uncanny valley. Newcomers who discover the welcoming voice was a bot feel manipulated; the onboarding nudge that is too aggressive feels like surveillance. The fix is **legibility**: name the agent, make its role explicit, and keep a human in escalation paths. The takeaway: **AI collapses the marginal cost of good community management, which means small communities can now have the onboarding quality that only Reddit-scale products could afford.** That is a genuine unbundling opportunity.

## 8.6 AI-Generated Social Graphs

This is the section where the core thread bites hardest.

Every social platform is, at its core, a graph layered on a content store. Facebook built the social graph from explicit friend requests. Twitter built the interest graph from explicit follows. TikTok's breakthrough was de-prioritising the explicit graph entirely and ranking on behavioural signal—what you watched, replayed, skipped (see Part 2). That was the first crack in the assumption that graphs require explicit human acts.

AI finishes the job. **You no longer need follows to build an interest graph.** A model can infer your interests from your messages, your reading history, your purchases, your location traces, the cadence of your replies. It can infer _connections_—two people who never explicitly connected but exchange email, attend the same small events, and message the same third party are, with high probability, a latent tie. Granovetter's (1973) "strength of weak ties" argument does not require the tie to be declared; it requires it to exist and to carry information. AI can find the undeclared ones.

This breaks the moat of every graph-based incumbent. The traditional network-effect defence—_users are locked in because their friends are here_—assumes the graph is expensive to reconstruct. It no longer is. A competitor with permission to read your email, calendar, and messages can reconstruct a more accurate graph of your real relationships in an afternoon than Facebook assembled over a decade of explicit acts.

The strategic implication cuts both ways. For incumbents, the explicit-graph moat is decaying. For new entrants, the cold-start problem (see Part 5)—historically the killer of social startups—becomes tractable, because you can simulate and seed a graph before you have users. **The graph is no longer the asset; the _permission to observe_ the signal that generates the graph is the asset.** That is a privacy-regulated, trust-bound asset, and it is where the next generation of moats will be built.

## 8.7 Agent-to-Agent Interaction

Here is where a genuinely new social layer appears, one with no precedent in the human-only era.

Today, agents mostly talk to humans on our behalf: "draft the reply," "book the meeting," "summarise the thread." But agents are starting to talk to _each other_. Two scheduling agents negotiating a time that works for both principals. A buying agent and a selling agent transacting within negotiated parameters. A research agent querying another agent that exposes a specialised knowledge base. This is **agent-to-agent (A2A) communication**, and it creates a substrate of social interaction that runs below human attention and at machine speed.

Why this matters for social products: the A2A layer needs discovery, identity, reputation, and trust mechanisms that look suspiciously like the ones human social networks provide. Agents need to find each other (an agent directory). They need to prove who is authorising them (delegated identity). They need to know whether another agent is trustworthy (agent reputation, possibly on-chain or credential-backed). And they need to negotiate shared protocols (the A2A equivalent of HTTP). Several of these are being standardised now.

The founder opportunity is to **build the social infrastructure for agents**—the directories, reputation systems, and negotiation protocols—not the human-facing app. This is a layer below the current social stack and most incumbents are not building for it because their entire product assumes a human is present. The crude diagram:

```
        Human layer        (today's social products)
            |                        |
    personal assistant          personal assistant
            |                        |
        ====== A2A negotiation layer (new) ======
            |                        |
       agent services           agent services
```

The takeaway: the next "social network" may not have humans as its primary nodes. It may be an agent graph that humans occasionally surface into.

## 8.8 AI Memory

The single feature that separates a chatbot from an assistant is **persistent context**. A model that remembers your projects, your preferences, your recurring conflicts, and the people in your life is not a tool you query—it is a relationship you maintain. This is the bet behind the memory features rolling out across the major assistant products.

For social products this is seismic. The reason Facebook achieved lock-in for a decade was that it held the social graph—the memory of who you knew. The reason an assistant with memory is dangerous to Facebook is that it can hold a _richer_ representation of your social life than Facebook's graph: not just who you are connected to, but who you actually talk to, what about, how often, and with what emotional valence.

The privacy implications are the obvious risk and I will not soft-pedal them. A persistent personal model that remembers everything you have ever told it is the most sensitive data structure a consumer product has ever held. It is simultaneously the most defensible asset a product can build (because it is non-portable—who would re-train a model that knows them?) and the largest liability (because a leak or a coercive subpoena is catastrophic). Loewenstein's (1994) work on the curiosity gap applies in reverse here: a system that knows you perfectly is one you cannot easily walk away from.

The takeaway for founders: **memory is the new moat, and it is built on consent.** Products that earn the right to remember—through transparency, portability guarantees, and genuine utility—will accumulate switching costs that make the old graph-based lock-in look weak. Products that abuse it will lose it to regulation and revolt.

## 8.9 Personal AI Assistants

Memory plus competence produces the assistant, and the assistant is the new front door to the internet. This is the most important strategic question in the chapter: **does the platform own the user relationship, or does the assistant?**

Consider how a user with a competent assistant actually behaves. They do not open Yelp; they ask the assistant for a restaurant. They do not search Google; they ask the assistant, which may search on their behalf. They do not browse Amazon; they describe what they want and the assistant shortlists three options. Each of these is an instance of the assistant **disintermediating the platform from the user**. The platform becomes a backend; the assistant owns the interface and the trust.

This is the Christensen (1997) disruption pattern applied to attention itself. The incumbents that monetised the front door—Google's search results page, Meta's feed, Amazon's shelf—are at risk of being reduced to commodity suppliers to an assistant layer they do not control. The ones building their own assistant (Meta's AI across WhatsApp and Instagram, Google's Gemini) are trying to _be_ the disintermediator. The ones that are not are betting their brand still matters when a model is doing the choosing.

For founders, the opportunity is to **own a vertical assistant** in a domain where the incumbent front door is weak. Travel, health, local services, professional communities—each is a candidate. The risk is that the assistant market collapses to a few foundation-model providers and the vertical layer is thin. The defensibility comes from the data and trust loop: an assistant that has earned the right to act on your behalf in a domain is very hard to displace.

## 8.10 AI-Native Interfaces

The feed was the dominant social interface for fifteen years because it solved a specific problem: cheaply surface the best of a high-volume stream to a passive viewer. That problem is being re-solved by a model that can just _tell you_ what matters and answer follow-up questions. The feed is not dead, but it is no longer the obvious default.

The AI-native interface is **conversational**: chat as the primary surface, voice as a peer input, and the feed demoted to one of several modes the user toggles between. This is not hypothetical—ChatGPT's interface is the template, and every consumer product is being rebuilt against it. The implication for interaction design is large: the atomic unit stops being the post and becomes the _turn_. Engagement is no longer measured in scrolls and taps but in conversational depth, return frequency, and task completion.

The founder implication: **the feed-centric assumptions that governed social design for a decade are now optional.** A product can be built conversation-first, with content serving the conversation rather than the conversation serving content consumption. This favours products with a clear _job to be done_ (Christensen, 1997) over products optimised for ambient browsing. It also favours smaller, denser products over mass-audience ones—conversation scales worse than feed, which is a feature for community products and a bug for ad-funded megaplatforms.

## 8.11 Voice-First Products

Voice is the input modality that conversation-first design most naturally extends to, and it is being unlocked by the same competence shift.

For most of the smartphone era, voice products failed because speech recognition and language understanding were not good enough. They now are. The interesting products are not the real-time voice assistants (those compete with the foundation labs) but the **asynchronous, hands-free social layer**: voice notes that auto-transcribe and summarize, voice-first communities where the unit of contribution is a spoken thought, always-available coaching and companionship products. The success of async voice in markets where it was forced by literacy or typing constraints—and the breakout of real-time voice products in the last two years—indicates the surface is ready.

The founder angle: voice is **lower-friction than text for a large set of social acts**—explaining, venting, storytelling, teaching. Products that make voice contribution as low-friction as a tweet and as digestible as a post unlock contribution from demographics that never took to text: older users, drivers, the vision-impaired, anyone whose hands are busy. The risk is discoverability and moderation—voice is harder to index and harder to moderate than text—but the competence ceiling on transcription and content analysis is lifting both.

## 8.12 Ambient Computing

Voice points toward a broader shift: the move from session-based computing (you open the app, you use it, you close it) to **ambient computing**, where the product is always on, always listening in a limited sense, and surfacing the right thing at the right moment on a glanceable surface.

The substrate here is wearables—watches, earables, glasses—and the design constraint is **extreme low friction**. You do not open an app on glasses; the app appears when contextually relevant and disappears when it is not. This is a fundamentally different interaction grammar than the phone, and it is underbuilt because the incumbents' products are session-optimised.

For social products this implies a category of **glanceable, context-triggered social signal**: the friend who is nearby and free, the message that actually needs you now, the micro-update from a small group that matters in this moment. The dunbar-bounded, high-signal products (see Part 1) are the natural fit, because ambient surfaces cannot carry the volume of a feed—they can only carry what is important _right now_. The takeaway: **ambient computing favours small, high-trust networks over mass feeds.** It is a tailwind for the anti-Facebook.

## 8.13 Spatial Computing

Spatial computing—Vision Pro, Quest, the coming glasses generation—adds a third axis: **presence and physical-location-anchored content**. The distinctive social primitives here are not new feeds but new _forms of co-presence_: a conversation that feels like being in a room, content pinned to a physical place, shared spatial workspaces.

The honest assessment is that spatial social is early. The install base is small, the input problems are not fully solved, and the killer social app has not emerged. But the trajectory matters because spatial is the only modality that restores a property the phone-era social products lost: **the feeling of being in the same place as another person.** That property—presence—is the substrate of the strongest social bonds, and the products that eventually deliver it convincingly will command the kind of lock-in that the phone-era incumbents enjoyed at their peak.

For founders, the move is to **bet on primitives that only make sense in space**: co-located collaboration, location-anchored memory, shared spatial experiences. The mistake to avoid is porting feed-era products into a headset. The category is new; build for what is native to it.

## 8.14 Digital Twins

A quieter development with large consequences: it is now feasible to build **a model of an individual user**—their preferences, their likely responses, their price sensitivity, their propensity to churn—and to use that model to _simulate_ them.

This is the digital twin, borrowed from industrial engineering, applied to people. The application to ranking and recommendation is obvious and already underway: you do not need to A/B test on real users when you can simulate a population of twins and predict the response. The application to **cold-start** is the strategic one (see Part 5). A new social product can populate itself with simulated users, train its recommender against them, and arrive at a working ranking system before its first real user signs up. The chicken-and-egg problem—_you need users to tune the algorithm, you need the algorithm to retain users_—dissolves when you can manufacture one side of it.

The risks cluster around fidelity and ethics. A twin is a model, and models are wrong in characteristic ways; over-fitting to simulated users can produce a product that performs well in silico and badly in the wild. The ethics of modelling individuals without explicit consent are, to put it gently, unresolved. The takeaway: **simulation is the new cold-start moat, and the founders who get it right will launch products that feel impossibly well-tuned on day one.** The founders who get it wrong will ship to phantoms.

## 8.15 Autonomous Communities

Combine several of the above—AI as creator, moderator, community manager, and member—and you arrive at a genuinely novel category: **communities that are substantially or entirely AI-run.**

Picture a subreddit where the moderator is an agent that enforces the rules consistently, summarises every thread, and bans violators with explainable reasoning. Picture a Discord server that is, by design, one human and forty agents role-playing a community for the human's benefit—or a server where most "members" are agents standing in for humans who delegated their presence. Picture a support community where the expert responders are models fine-tuned on the domain, available instantly and indefinitely.

This sounds dystopian to some readers and utopian to others; both reactions are reasonable. The product question is narrower: is there demand for it? The early evidence—character-AI products, AI companion apps with massive engagement, community products experimenting with agent members—says yes, for specific use cases. Loneliness, niche expertise, and 24/7 availability are real needs that human-only communities underserve.

The binding constraint, as throughout this part, is **trust**. An autonomous community is legitimate only to the degree its members believe the agents are acting in their interest and not in the operator's. Governance becomes the product (see Part 9). The takeaway: **autonomous communities are a real category, but only the ones with legible, contestable governance will hold.**

## 8.16 Synthesis

The pattern across all fifteen roles is the same: AI does not improve a function, it _automates and re-prices_ it, and the re-pricing changes who can play.

| Role of AI              | What changes                                  | Opportunity                                                 | Risk                                               |
| ----------------------- | --------------------------------------------- | ----------------------------------------------------------- | -------------------------------------------------- |
| AI as user              | Traffic partly non-human                      | Agent-readable social APIs; proof-of-personhood             | DAU inflation; ad-fraud 2.0                        |
| AI as creator           | Content marginal cost → ~0                    | Verification and provenance products; personality-led media | Authenticity crisis; creator middle collapses      |
| AI as moderator         | Competent multilingual moderation at API cost | Moderation-as-a-service for small platforms                 | Illegible takedowns; false positives on edge cases |
| AI as community manager | Cold-start labour → near-zero                 | High-quality onboarding for tiny communities                | Uncanny-valley manipulation; surveillance feel     |
| AI-generated graphs     | Graphs inferable without explicit acts        | Reconstruct graphs from permissioned signal                 | Privacy; decay of incumbent graph moats            |
| Agent-to-agent          | A2A negotiation layer below human attention   | Agent directories, reputation, negotiation protocols        | No precedent; standardisation wars                 |
| AI memory               | Persistent personal context                   | Memory as switching-cost moat, built on consent             | Catastrophic leak / coercive access liability      |
| Personal assistants     | Assistant disintermediates the platform       | Own a vertical assistant where incumbents are weak          | Collapse to foundation-model providers             |
| AI-native interfaces    | Conversation, not feed, as default            | Job-to-be-done products over ambient browsing               | Conversation scales worse than feed                |
| Voice-first             | Hands-free contribution at text's friction    | Async voice communities; underserved demographics           | Indexing and moderation harder                     |
| Ambient computing       | Always-on, glanceable, context-triggered      | High-trust, high-signal, small networks                     | Incumbents are session-optimised                   |
| Spatial computing       | Presence; location-anchored content           | Co-presence primitives; spatial memory                      | Early; input unsolved; no killer app yet           |
| Digital twins           | Users simulatable for ranking and cold-start  | Day-one-tuned products; simulated cold-start                | Over-fitting to phantoms; consent                  |
| Autonomous communities  | Substantially AI-run social spaces            | Loneliness, niche expertise, 24/7 availability              | Legitimacy and governance; trust deficit           |

## Founder Lens - Part 8

**What should founders copy?**
The disintermediation move. Build the assistant, the agent infrastructure, or the verification layer that sits _between_ the user and the incumbent platform, and watch the incumbent become your backend. This is the highest-leverage pattern in the chapter and it is reproducible across verticals.

**What should founders avoid?**
Shipping a feed-centric, ad-funded, mass-audience social product into a world where content supply is infinite and attention is consumed by agents. Every assumption in that sentence—feed, ads, mass—is under attack. Incumbents will fight to defend those assumptions; do not inherit them.

**What would I build differently today?**
Start from conversation, not feed. Start from a small, high-trust graph inferred from permissioned signal, not from an explicit-follower land grab. Start from voice where it lowers friction for an underserved demographic. Start from a domain where the assistant can earn the right to act, not just inform. In short, build for the roles in this chapter, not the roles in Part 1.

**What has AI changed?**
Every role in the social system—user, creator, moderator, manager, graph builder, interface—can now be partially automated. The cold-start problem is now solvable by simulation. The graph moat is decaying. Trust and authenticity, not distribution or supply, are the new binding constraints. The economics of network formation itself have changed.

**What is the opportunity?**
The layer below the current social stack: agent infrastructure, verification and provenance, vertical assistants, and the small high-trust networks that ambient and voice modalities favour. Each is underbuilt because every incumbent is optimising for a human in a session in front of a feed.

**Difficulty (1-10):** 8. The technology is available, but the product problems—legibility, consent, governance, trust—are the hard kind, and the market is moving at a speed that punishes slow iteration.

**Potential market size:**
Effectively the entire consumer-internet TAM, because the assistant layer sits in front of all of it. The agent-infrastructure layer is a new category with no clean prior market; the verification layer is a necessary tax on every content platform that survives.

**Competitive landscape:**
The foundation-model labs (OpenAI, Anthropic, Google, Meta) own the horizontal assistant and the underlying competence. Incumbents (Meta, Google) are racing to be their own disintermediator. The openings are vertical and infrastructural: where the horizontal players will not go deep, and where the incumbents cannot move fast.

**Biggest risks:**
Three, in order. First, the assistant market collapses to a few horizontal providers and the vertical layer is commoditised. Second, privacy and consent regulation (the right to be forgotten, the right to an explanation, the right to refuse being modelled) constrains the memory and twin primitives that make the whole stack defensible. Third, the authenticity crisis metastasises faster than verification infrastructure can keep up, and the entire category is regulated as a public-health problem rather than a product one.

## References (Part 8)

Christensen, C. M. (1997). _The innovator's dilemma: When new technologies cause great firms to fail._ Harvard Business School Press.

Cloudflare. (2024). _Radar report: Automated traffic share._ Cloudflare, Inc.

Doctorow, C. (2024). _The enshittification of the internet._ In _Chokepoint capitalism_ (online essays and talks). Doctorow / Beacon Press.

Eyal, N. (2014). _Hooked: How to build habit-forming products._ Portfolio.

Fogel, S. (2020). _The cold start problem: How to start, scale, and succeed with network effects._ HarperCollins / Currency. [Note: widely cited as Andrew Chen, 2021—see Part 5.]

Gillespie, T. (2018). _Custodians of the internet: Platforms, content moderation, and the hidden decisions that shape social media._ Yale University Press.

Granovetter, M. S. (1973). The strength of weak ties. _American Journal of Sociology, 78_(6), 1360–1380.

Loewenstein, G. (1994). The psychology of curiosity: A review and reinterpretation. _Psychological Bulletin, 116_(1), 75–98.

Meta. (2023). _Community standards enforcement report._ Meta Platforms, Inc.

Schultz, W. (1997). A neural substrate of prediction and reward. _Science, 275_(5306), 1593–1599. [Referenced from Part 1; dopamine prediction error.]
