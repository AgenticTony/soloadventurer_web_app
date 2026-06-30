# Part 7 — Algorithms and the AI Stack — From Feeds to Agents

## 7.1 Intro - the algorithm layer IS the product

Growth is the metric founders brag about; retention is the metric that kills them. By Part 6 we established that the feed - infinite, personalized, frictionless - is the retention engine of the modern social product. This chapter pulls the engine apart.

Here is the claim that organizes everything that follows: **on a modern platform, the algorithm is not a feature of the product. The algorithm layer _is_ the product.** The app you download is a thin client over a ranking system. Facebook is not a website; it is a model that scores posts. TikTok is not a video player; it is a real-time predictor of your next swipe. Spotify is not a music library; it is a taste estimator that happens to emit audio. Strip the ranking away and you are left with a chronological dump nobody opens twice.

This has two consequences for founders. First, you cannot build a "feed product" without building a feed _system_ - candidate generation, retrieval, ranking, re-ranking, logging, retraining. That pipeline is the actual moat, not the UI. Second, that pipeline is now being rewritten end to end by the modern AI stack: embeddings, vector search, foundation models, agents, and reinforcement learning over long-horizon rewards. The economics of recommendation are changing, and with them the economics of network formation itself - the thread running through every chapter of this book (see Part 1).

The chapter has two halves. Half A (7.2-7.8) tears down how today's incumbent feeds actually work, platform by platform, from TikTok's interest graph to Netflix's artwork personalization. Half B (7.9-7.22) maps the AI stack that is now reshaping all of them - and reshapes _experience_, not just infrastructure. Keep one question in view throughout: **what can be built now that could not have been built when Facebook, Instagram, or TikTok started?** That is where the founder opportunity lives.

---

## 7.2 TikTok For You Page - the interest graph

TikTok did to social graphs what Google did to portals: it threw away the wrong abstraction. Every platform before it assumed you wanted to see what your _friends_ liked. TikTok assumed you wanted to see what _people with your taste_ liked - and that "people with your taste" could be inferred from milliseconds of your behavior, not from a friend request.

The For You Page runs on an interest graph, not a social graph (Guo et al., 2024; TikTok, 2020). The signals, in rough weight order:

- **Completion rate** - did you watch to the end? The single most powerful signal. A full watch beats a like.
- **Rewatch** - looping the same video is a stronger signal than a share.
- **Watch time** - raw seconds, normalized by video length.
- **Share** - weighted by _where_ (DM > story > copy link), a proxy for intent.
- **Comment** - weighted by length and sentiment, not just count.
- **Like** - weak, easily gamed, lightly weighted.
- **Negative signals** - "not interested," skip-after-1s, fast swipe.

The structural innovation is **zero-follower virality**. A creator with zero followers can post a video and reach ten million people in 24 hours, because the distribution key is _performance on a test audience_, not _accumulated subscribers_. YouTube and Instagram both eventually copied this (Shorts, Reels), which is the sincerest confession that the social graph had stopped working as a discovery engine.

> **Box: What AI changes - TikTok**
>
> - The interest graph becomes _conversational_ - you tell the feed what you want in natural language.
> - AI-generated content floods supply, forcing ranking to weight _authenticity signals_ over engagement.
> - Personal AI creators (synthetic personalities tuned to your taste) become a new content class.
> - The creator bottleneck weakens: one person + models runs a content studio.
> - Trust and provenance become scarcer - and more valuable - than content itself.

**Takeaway:** TikTok's moat is not the UI or the effects. It is a closed-loop system that turns behavior into ranking in seconds. A founder building a feed product today is competing with that loop, and the loop is now table stakes.

---

## 7.3 YouTube - deep learning, two-tower, session-based

YouTube was the first major platform to publicly admit, in a 2016 paper, that it had abandoned hand-tuned rules for deep neural networks (Covington et al., 2016). The architecture they described became the template everyone copied: a **two-stage system** of candidate generation and ranking, both neural.

**Candidate generation** is a _two-tower_ model (see 7.9). One tower ingests user history (watched videos, search queries, demographics, geography, time of day); the other ingests candidate videos. The towers output vectors; a dot product scores fit. This stage pulls ~millions of candidates down to a few hundred by similarity.

**Ranking** then scores those hundreds with a deeper model on rich features - watch time prediction, expected satisfaction, query-video relevance. YouTube famously optimizes **expected watch time**, not clicks, because clicks correlate with engagement but watch time correlates with _retention_ - the thing that keeps the session alive.

Two refinements matter. First, YouTube is **session-based**: the model conditions on what you just watched in this sitting, so a single gardening video does not permanently turn your feed into a gardening feed. Second, YouTube runs **satisfaction surveys** - it literally asks users "was this recommendation good?" - and folds those explicit signals back into training to correct the bias of pure behavioral optimization. This is a rare, honest admission that watch time alone is a flawed proxy for value (see 7.19).

> **Box: What AI changes - YouTube**
>
> - Generative video collapses production cost; the candidate pool explodes.
> - The ranking model can _summarize and judge_ a video semantically instead of relying on tags and watch-time proxies.
> - Conversational search ("explain this video to me") layers above the feed.
> - Multi-modal embeddings (frame + audio + transcript) replace shallow metadata features.
> - Satisfaction can be inferred from a model rather than surveyed.

**Takeaway:** YouTube's two-stage design is the reference architecture for any feed at scale. Founders should internalize it: retrieval (cheap, broad) then ranking (expensive, precise). The cost economics of that split are why vector databases exist.

---

## 7.4 Instagram Explore - embeddings, seed accounts, hashtag graph

Instagram Explore is the textbook case of a **content-embedding + graph-hybrid** recommender. Three signals feed it:

1. **Content embeddings** - each post is encoded into a vector capturing visual and engagement features. Posts that co-occur in saves, shares, and likes sit close together in vector space.
2. **Seed-account graph** - Explore seeds from accounts you already engage with, then walks outward to "accounts similar to accounts you like." This is a graph traversal layered on top of the embedding space.
3. **Hashtag co-occurrence** - hashtags that appear together on the same posts form an implicit taxonomy the system can cluster on.

The original Explore was a curated grid; the current one is a learned surface that personalizes at the tile level. Reels imported the TikTok completion-rate/watch-time logic and now dominate the surface. The interesting failure mode: Instagram's _follow graph_ and its _interest graph_ are in tension. People follow high school friends (social obligation) but watch comedians (actual interest). The algorithm has to decide which self to serve, and most days it picks the interest self - which is why your follow graph feels increasingly decorative.

**Takeaway:** A graph alone is brittle (your friends' taste is not your taste). Embeddings alone are cold (you need engagement to seed them). The winning systems combine both: embeddings for content similarity, graph for trust and seed signal.

---

## 7.5 Facebook Feed - EdgeRank to MSI to ML

Facebook's feed is the cautionary tale of the genre. It began with **EdgeRank** (2010-2013): a simple formula of _affinity × weight × decay_. Affinity = how often you interact with the poster; weight = post type (photos > status); decay = recency. It was legible, predictable, and - by modern standards - primitive.

EdgeRank was replaced by **ML ranking** (~2014 onward): hundreds of signals fed into a model predicting engagement probability. So far, so normal. The pivotal decision came in **2018**, when Facebook pivoted the optimization target to **Meaningful Social Interactions (MSI)** - comments and shares between people, especially over public content (Facebook, 2018; see also Part 9 on network health). The stated goal was to make the feed feel more social again.

The unintended consequences are now well documented. Optimizing for _comments_ disproportionately rewards content that provokes outrage, because outrage is the emotion most likely to produce a comment (see also Part 1 on emotional triggers, and Part 10 on virality mechanics). A wave of independent analyses linked the MSI shift to rising political polarization and a surge in outrage-driven Pages. The lesson is the cruelest one in product: **the metric you optimize is the behavior you get, whether you intended it or not.** Rewarding comments does not produce "meaningful social interaction"; it produces whatever produces comments.

> **Box: What AI changes - Facebook**
>
> - The MSI failure becomes diagnosable in real time: LLMs can classify _quality_ of interaction, not just count it.
> - Generative comment farms force a return to verified-identity and provenance layers.
> - Personal AI companions (Meta AI) compete with the feed itself for time-on-platform.
> - Group discovery moves from graph-walk to semantic search ("find me a group about X").
> - The social graph's value drops as synthetic accounts dilute identity signals.

**Takeaway:** Ranking systems amplify the value system encoded in their reward function. Choose the reward as carefully as you would choose a co-founder - because it will, in effect, run the company.

---

## 7.6 Spotify - collaborative filtering, audio features, taste

Spotify is the platform that proved recommendation _itself_ can be the core product loop, not just a feed optimization. Three techniques, layered:

- **Collaborative filtering via matrix factorization.** Spotify's earliest engine (acquired with the Echo Nest team) factorized a user × track co-listening matrix. If you and I overlap on 30 tracks, the system infers we share latent taste factors and recommends tracks you played that I have not. This is classic item-item collaborative filtering (Sarwar et al., 2001), and it works stunningly well for music - because taste in music is unusually transferable between similar listeners.
- **Audio features.** Echo Nest's analysis broke each track into features - tempo, key, energy, danceability, acousticness, valence - letting the system recommend _sonically similar_ tracks even with zero co-listening data. This is content-based filtering (7.11), and it solves the cold-start problem for brand-new releases that no one has heard yet.
- **NLP of blogs and text.** Spotify crawled music blogs and press to build a semantic understanding of artists and genres, enriching the embedding space with cultural context.

The flagship expression of all this is **Discover Weekly** - a personalized mixtape that feels eerily accurate, which it achieves by combining all three signals (collaborative + audio + text). Discover Weekly is, for many users, the single feature that makes them a Spotify subscriber rather than an Apple Music subscriber. Recommendation _as_ retention.

> **Box: What AI changes - Spotify**
>
> - AI-generated music floods the catalog, threatening the collaborative-filtering signal (no one has heard it yet, so co-listening data is thin).
> - Conversational playlisting ("make me a running mix that builds over 30 minutes") replaces static recommendation.
> - Personal AI DJs voice the surface and adapt in real time to skip behavior.
> - Taste embeddings can be derived from any text the user produces, not just listening history.
> - The DJ becomes an agent that acts on the catalog, not just a ranker over it.

**Takeaway:** Spotify shows that recommendation quality is itself a moat - users will pay for it. If you can make "it just knows what I want" the defining experience of your product, you own the category.

---

## 7.7 Netflix - context-aware, bandits, artwork personalization

Netflix is the masterclass in _contextual_ recommendation and in a technique most founders overlook: **artwork personalization**. The same movie is shown with different thumbnail images to different users, chosen by bandit algorithms running A/B selection per user (Gomez-Uribe & Hunt, 2015). If you watch a lot of romantic comedies, _Pulp Fiction_ gets a thumbnail featuring Uma Thurman and John Travolta dancing. If you watch action, it gets the gun-in-the-car thumbnail. Same film, different sell. Netflix estimates this single optimization meaningfully lifts play probability.

The catalog ranking itself is **context-aware**: time of day, device, day of week, and whether you're in a household profile all shift recommendations. Friday night on the TV gets different candidates than Tuesday morning on a phone. Netflix also leans heavily on **bandit algorithms** (7.18) to explore new titles - trading off showing you something proven vs. something the system needs to learn about.

The famous Netflix Prize (2006-2009) popularized matrix factorization for collaborative filtering (Koren et al., 2009), but Netflix later found that pure rating prediction was a weak proxy for actual streaming satisfaction - people rate _aspirationally_ (they rate documentaries five stars) and watch _comfortably_ (they actually rewatch sitcoms). Ratings were a bad reward; watch behavior was the truth. They abandoned star ratings for thumbs in 2017.

**Takeaway:** Don't ask users what they want; watch what they do. And don't underestimate presentation as a recommendation surface - the _thumbnail_ is a recommender, the _title_ is a recommender, the _ordering_ is a recommender. Every pixel that gates a click is a model.

---

## 7.8 The cold-start problem

Every recommender hits the same wall: a new user has no history, and a new item has no engagement. This is the **cold-start problem**, and it is the single most under-discussed risk for new feed products. Incumbents solve it three ways:

1. **Content-based bootstrapping.** For new items, fall back to metadata and content features (Spotify's audio features; a video's frames and audio; a post's text). Content-based filtering (7.11) needs no engagement history, only item features.
2. **Exploration/exploitation.** Use bandit algorithms (7.18) to deliberately show the new item to a spread of users, sacrificing some short-term engagement to learn its true performance. This is the multi-armed bandit trade-off: exploit what works, explore what might.
3. **Onboarding signal.** Ask the user for seeds at signup - interests, follows, a few swipes. TikTok famously gives every new user a calibrated test feed within seconds and treats the first session as pure exploration.

TikTok's specific cold-start innovation is _creator-side_: a new video is shown to a small test pool of users stratified by interest cluster. If watch-time and completion clear a threshold, it graduates to a bigger pool, and so on up. This is why zero-follower virality works - the video, not the creator, is the unit of distribution. **The implication for founders:** you cannot defer cold-start. If your model needs a million users before it works, you don't have a product, you have a research project.

**Takeaway:** Design for cold-start on day one. Pick an item representation that works with zero users (content features), and an exploration loop that learns fast. The first 100 users should already be getting value, or you won't get to 1,000.

---

The first half answered _how the feeds work_. The second half answers _what is replacing them_ - and, more importantly, _what this lets a founder build that was impossible five years ago_. Read the rest with the payload question in hand.

## 7.9 Embedding vectors - word2vec, item2vec, two-tower

An **embedding** is a learned vector representation where _similarity in the vector space corresponds to similarity in meaning or behavior_. word2vec (Mikolov et al., 2013) showed that you could train a neural net to predict words from context and, as a side effect, produce vectors where `king - man + woman ≈ queen`. Same idea generalizes to anything: **item2vec** embeds products, songs, or videos by treating a user's session as a "sentence" and items as "words" (Barkan & Koenigstein, 2016).

The architecture that powers modern retrieval is the **two-tower model**: one tower embeds the user (history, context), the other embeds the candidate item. At serving time, you compute the user vector once, then do a fast nearest-neighbor search over pre-computed item vectors (7.12). This is why YouTube, Pinterest, and Spotify all converge on two-tower for candidate generation - it scales to billions of items because the expensive neural work is done offline.

> **Box: What AI changes - Embeddings**
>
> - Foundation models produce strong embeddings _out of the box_ - no training data required to bootstrap.
> - Multi-modal embeddings (text + image + audio in one space) unify recommendation across content types.
> - A founder can stand up a usable semantic recommender in a weekend, not a quarter.
> - Embeddings make _zero-shot_ personalization possible: the first session already works.

**Takeaway:** Embeddings are the load-bearing abstraction of the modern stack. If you understand one thing in this chapter, understand this: similarity in a learned vector space is the substrate on which retrieval, ranking, and now LLM-based reasoning all operate.

## 7.10 Collaborative filtering - user-user, item-item, matrix factorization

Collaborative filtering (CF) is the oldest useful technique in this book, and still one of the best. The idea: _people who agreed in the past will agree in the future_. Two flavors:

- **User-user**: find users similar to you, recommend what they liked that you haven't seen.
- **Item-item**: find items similar to ones you liked, recommend those. Amazon made this famous ("customers who bought this also bought"; Linden et al., 2003).

Both are solved elegantly by **matrix factorization** (Sarwar et al., 2001; Koren et al., 2009): factorize the giant sparse user × item matrix into two low-rank matrices whose product approximates the original. Each user and item gets a latent vector; the dot product predicts affinity. The Netflix Prize turned this into a sport.

CF's strength is that it captures _taste transfer_ - things similar people like that you'd never have found via metadata. Its weakness is cold-start: a new item has no co-engagement, so CF cannot recommend it. This is why every production system combines CF with content-based (7.11) - CF for the known head of the catalog, content features for the long tail and new releases.

**Takeaway:** CF is cheap, interpretable, and remarkably effective for taste-based domains (music, video, books). Use it as your baseline. But never ship CF alone - it dies on new content and new users.

## 7.11 Content-based filtering - metadata, features, limits

Content-based filtering recommends items _similar in their features_ to ones you liked, ignoring what other users did. If you watched three action movies starring Keanu Reeves, it recommends more action movies starring Keanu Reeves. The features can be explicit metadata (genre, cast, director) or learned from the content itself (Spotify's audio features, image embeddings of video frames, text embeddings of a post).

The advantage: it works on day one, with one user and one item. It is the cold-start solution. The disadvantage: it is fundamentally _conservative_. It can only recommend more of what you already like. It cannot make the surprising jump that CF makes ("people who like X also like Y, even though X and Y look nothing alike"). Pure content-based filtering produces a feed that feels like a mirror - accurate, and slightly suffocating.

**Takeaway:** Content-based is your bootstrapper and your cold-start backstop. CF and semantic embeddings are your taste-transfer engine. You need both, and the art is in the blend.

## 7.12 Retrieval - ANN, FAISS, ScaNN, vector databases

Once you have embeddings, you need to search them at scale. Exact nearest-neighbor over a billion vectors is infeasible, so we use **approximate nearest neighbor (ANN)** algorithms - trade a little accuracy for a lot of speed. The open-source standards: **FAISS** (Facebook AI, 2017), **ScaNN** (Google, 2020), and HNSW (Malkov & Yashunin, 2018). On top of these sit the **vector databases** - Pinecone, Weaviate, Milvus, pgvector in Postgres - which package ANN with CRUD, filtering, and hybrid query.

This matters for founders because **retrieval has been commoditized**. In 2016 you needed an ML infrastructure team to build a million-vector recommender. In 2026 you need `pip install` and a managed cluster. The cost of building the candidate-generation stage of a YouTube-class system has dropped by orders of magnitude. What has _not_ been commoditized is the _quality of your embeddings_ and the _quality of your ranking_ - and, increasingly, the quality of the _agent loop_ sitting on top.

**Takeaway:** Don't build ANN infrastructure. Do build a sharp understanding of which embedding model and which distance metric fit your domain. Cosine similarity over generic text embeddings will get you 60% of the way; the last 40% is domain-tuning, and that 40% is your differentiation.

## 7.13 Semantic + hybrid retrieval - keyword, dense, knowledge graphs

Pure vector ("dense") retrieval is magical for fuzzy semantic match - "uplifting instrumental music" finds a playlist - but it can miss the obvious. Pure keyword (BM25) retrieval finds exact term match but misses synonymy and intent. Modern systems are **hybrid**: combine BM25 keyword scores with dense vector scores, often with a learned re-ranker on top.

Add a **knowledge graph** and you get something more powerful still: the system knows that "Kendrick Lamar" is a hip-hop artist signed to TDE, featured on a Beyoncé track, and headlined Coachella - so a query about "artists like Kendrick at festivals" can traverse the graph rather than rely on lexical or vector coincidence. Knowledge graphs encode _structured relationships_ that dense embeddings blur together.

**Takeaway:** Hybrid retrieval (keyword + dense + graph) is the new default for any product where users both search _and_ browse. The feed and the search bar are converging into one surface - the conversational discovery surface (7.14).

## 7.14 LLMs in recommendation - generative retrieval, conversational discovery

This is where the stack starts changing the product itself. Three LLM-native patterns are emerging:

- **Generative retrieval.** Instead of retrieving from an index, the model _generates_ the item identifier directly (e.g., P5; Geng et al., 2022). The recommender is a language model that has "memorized" the catalog as tokens.
- **Conversational discovery.** The user describes what they want in natural language ("a short, funny video about cooking for one") and the system returns candidates matched semantically. The feed becomes a dialogue, not a stream.
- **Semantic candidate matching.** LLMs produce richer item and user representations than shallow models, enabling matching on _intent_ rather than _co-occurrence_.

The product shift: the feed was a _prediction_ of what you want; the LLM feed is a _conversation_ about what you want. Prediction is passive; conversation is active. This is the single biggest UX change in discovery since the infinite scroll, and incumbents are only beginning to ship it.

> **Box: What AI changes - the feed itself**
>
> - The feed becomes _askable_: users describe intent, models retrieve.
> - "For You" becomes "For You, Right Now, Given What You Just Said."
> - Recommendation quality is no longer bounded by tagging or co-engagement data.
> - Discovery moves from passive scroll to active dialogue - higher intent, higher conversion.
> - The unit of personalization shifts from the user to the _session_ and even the _turn_.

**Takeaway:** Conversational discovery is the wedge. If TikTok won passive prediction, the next platform wins active conversation. Founders building a feed product in 2026 should be asking whether their feed is talkable - because the ones that aren't will feel like landlines next to smartphones.

## 7.15 RAG and memory architectures

**Retrieval-augmented generation (RAG)** solved the LLM memory problem: instead of baking knowledge into weights, fetch it from a vector store at query time and stuff it into the context window. The same pattern, applied to a _user_, produces **personal long-term memory** - a vector index of everything the product knows about you (your tastes, your goals, your past conversations, your constraints) that the model retrieves from on every turn.

This is the technical substrate of a _personal AI_. A Spotify DJ that remembers you have a marathon in three weeks and adapts your running mixes accordingly. A feed companion that remembers you stopped watching a show and asks why. Memory turns a recommender from a _stateless predictor_ into a _stateful agent_ with a model of you. This was structurally impossible with pure feed-ranking architectures - they had no place to put a goal.

**Takeaway:** RAG for personal memory is the difference between a "smart feed" and an "AI that knows you." The latter is what builds the next retention curve. Founders should design their user-memory schema as carefully as their database schema - it _is_ the personalization system.

## 7.16 Agent workflows, tool use, and MCP

If Parts 1-6 were about _feeds_, this section is about the thing that _replaces_ feeds in the most aggressive possible scenario: **agents**. An agent is an LLM that can call tools - retrieve from a database, search the web, call an API, run code, take an action - in service of a goal. A feed shows you things; an agent _does things for you_.

A recommendation agent can: search the catalog, filter by your constraints (budget, location, time), cross-reference reviews, draft a shortlist, and execute (book it, save it, share it). Multi-agent systems specialize this - one agent retrieves, one ranks, one critiques, one acts. Anthropic's **Model Context Protocol (MCP)** is standardizing how models call external tools and data sources, the way HTTP standardized how browsers talk to servers. If MCP achieves even half of HTTP's reach, the implication is large: **every product becomes a tool an agent can call.**

This reframes competition. Today platforms compete for your _attention_ (time on feed). In an agent world, they compete for _selection_ - did the agent pick your tool? The agent layer becomes the new ranking surface, and the ranking is performed by a model reasoning over your goal, not by a feed predicting your swipe. This is the deepest sense in which AI changes the economics of network formation: the locus of optimization moves from the _user's attention_ to the _agent's choice_.

> **Box: What AI changes - the agent layer**
>
> - The unit of competition shifts from attention to _agent selection_.
> - Platforms must expose themselves as tools (MCP), or be bypassed by agents.
> - The feed is replaced by an agent that acts on your behalf across many surfaces.
> - Ranking moves from "what will you click" to "what will achieve your goal."
> - Distribution becomes _agentic_: agents recommend agents, the way friends used to recommend products.

**Takeaway:** This is the payload. _What can be built now that could not have been built when Facebook, Instagram, or TikTok started?_ **An agent-native product.** A product whose core loop is not "show me things" but "do things for me, and learn my taste as you do." None of the incumbents were architected for this; all of them are trying to retrofit it. That gap is the founder opportunity the rest of this book is pointing at.

## 7.17 Reasoning and planning models - system-2 recommenders

Current feed rankers are **system-1**: fast, pattern-matching, prediction-from-history (Kahneman, 2011). The newest class of models - reasoning models that think in steps before answering - enables **system-2 recommenders**: ones that can _plan over your goals_. "I'm training for a half-marathon in October and I want to cook more" is not a query a watch-time ranker can satisfy. It requires the model to reason: decompose the goal, retrieve across domains, sequence the recommendations, trade off today against the plan.

This is the difference between a _recommender_ and an _advisor_. A recommender optimizes the next click; an advisor optimizes your week. The product surface changes with it: no longer an infinite feed but a _plan_ - a structured, revisable set of recommendations tied to a goal you stated. None of this was possible with supervised learning over engagement logs. It is possible now.

**Takeaway:** The frontier is goal-aware recommendation. If your product can hold a user's goal in memory and reason toward it across sessions, you are no longer competing with TikTok for attention - you are competing for _intent_, which is far more valuable.

## 7.18 RLHF and reinforcement learning - bandits to SlateQ

Reinforcement learning is where the long-horizon rewards live. The progression:

- **Multi-armed bandits** - balance exploring new content vs. exploiting proven winners. Essential for cold-start and freshness.
- **Contextual bandits** - the bandit conditions on user context, so different users get different explore/exploit trade-offs. Most modern newsfeed systems are contextual bandits at heart (Li et al., 2010).
- **SlateQ** - Google's framework for optimizing _slates_ of recommendations with reinforcement learning over long-horizon reward (Ie et al., 2019). Instead of picking the single best item, optimize the whole list for long-term user value.
- **RLHF** (reinforcement learning from human feedback) - the technique that aligned ChatGPT (Christiano et al., 2017; Ouyang et al., 2022). Applied to recommenders, it lets you align ranking to _what humans actually value_ - not just what they click.

The reason this matters: every engagement-optimized system eventually hits the **engagement trap** (7.19) - it learns to provoke, not to satisfy. RLHF and long-horizon RL are the technical paths out of that trap, because they let you optimize for _satisfaction over weeks_ rather than _clicks over minutes_. Facebook's MSI pivot (7.5) was an attempt to fix this with a hand-tuned reward; RLHF is the way to fix it with a _learned_ one.

**Takeaway:** The reward function is the product. Long-horizon RL and RLHF are how you build a feed that retains users for years instead of burning them out in weeks. Most founders underweight this because it is hard; that is exactly why it is a moat.

## 7.19 Watch-time optimization - proxy for satisfaction?

Here is the uncomfortable truth at the center of the modern feed: **every incumbent optimizes a proxy, and the proxy is rotten.** Watch time is not satisfaction. Clicks are not value. Comments are not "meaningful social interaction." Every engagement metric correlates with the thing you want, then diverges from it at exactly the moment your product starts to succeed at scale.

The divergence is well documented. Optimizing watch time produces a feed that is _addictive but regretful_ - users feel worse after using the product, even as session length climbs (see Part 1 on dopamine and the prediction error; Montoya et al., on problematic use). Optimizing comments produces outrage (7.5). Optimizing for engagement in general produces _whatever produces engagement_, which is empirically not the same as whatever produces wellbeing (see also Part 12 on ethics, and Pariser, 2011).

The AI-stack answer is not "optimize wellbeing directly" - that is hard to measure. It is to optimize **long-horizon retention and stated satisfaction jointly**, using RLHF and the explicit satisfaction signals YouTube began collecting years ago. The structural opportunity for a founder: build a feed whose reward function is _come back next week feeling good_, not _stay an extra ten minutes tonight feeling bad_. The incumbents are constrained by their installed reward functions; you are not.

**Takeaway:** The metric is the moat. If you can credibly optimize for wellbeing-adjacent long-term reward, you have a story users will defect to. This is not ethics decoration; it is product strategy.

## 7.20 Feedback loops - filter bubbles, echo chambers, polarization

A recommender is a closed loop: it shows you things, you react, it learns, it shows you more. Left unchecked, this loop produces a **filter bubble** (Pariser, 2011) - a narrowing of exposure that amplifies prior beliefs. The mathematical version is **homogenization**: the system converges on a small region of the content space because that region reliably produces engagement from you.

The social consequence - **echo chambers** and **polarization** - is the externality that makes recommendation a governance problem, not just an engineering one (see Part 9 on network health, Part 10 on virality). A feed that shows you only agreeing views radicalizes them; a feed that never shows you anything challenging is boring. The design problem is to introduce **productive diversity** - content that stretches the user without losing them.

Technically this is solved in the **re-ranking** stage (7.21): inject diversity constraints, freshness rules, and "explore" quotas into the final list. SlateQ-style long-horizon RL can also learn that _some_ exposure to novel content improves long-term retention, even at short-term engagement cost. The interesting founder angle: a product that _markets_ its diversity - "we will not trap you in a bubble" - has a value proposition no incumbent can easily copy, because their installed reward functions are built to trap.

**Takeaway:** Filter bubbles are not a bug; they are the steady state of an engagement-optimized recommender. Countering them is a re-ranking and reward-design problem, and a genuine product wedge for a new entrant.

## 7.21 Ranking and re-ranking - pointwise, pairwise, listwise, diversity

Ranking is where the business rules live. Three mathematical framings:

- **Pointwise** - score each candidate independently, sort by score. Simple, fast, ignores list composition.
- **Pairwise** - optimize the relative order of pairs (used in learning-to-rank; e.g., RankNet). Better for "which should come first."
- **Listwise** - optimize a metric over the whole list (NDCG, MAP). Best for slate quality, most expensive.

After the ranker scores the list, a **re-ranker** applies hard constraints: diversity (don't show five videos from the same creator), freshness (boost new posts), business rules (demote borderline content, promote monetized inventory), and editorial rules (guarantee a minimum proportion of follows over suggestions). Re-ranking is where values get encoded - and where the MSI-style catastrophes either happen or are prevented.

**Takeaway:** Ranking is the science; re-ranking is the politics. Every feed product will, at scale, contain a re-ranking layer that expresses the company's values. Design it explicitly, own it publicly, and instrument it - because the day your re-ranker causes a scandal is the day you wished you'd thought about it earlier.

## 7.22 The full pipeline - annotated

The complete modern recommendation pipeline, with the AI-stack additions marked `[AI]`:

```
                +------------------+
                |   USER + CONTEXT |   (session, time, device, goal [AI])
                +--------+---------+
                         |
                         v
+--------------------+   |   +----------------------------+
| CANDIDATE          |<--+   | RETRIEVAL [AI]             |
| GENERATION [AI]    |       | - ANN / FAISS / ScaNN      |
| - two-tower        |       | - hybrid: keyword + dense  |
| - item2vec/CB      |       | - knowledge graph          |
| - collaborative    |       | - generative retrieval     |
+---------+----------+       +-------------+--------------+
          |                                |
          +----------------+---------------+
                           v
              +------------------------+
              | RANKING [AI]           |
              | - pointwise/pairwise   |
              | - LLM semantic match   |
              | - expected watch time  |
              +-----------+------------+
                          v
              +------------------------+
              | RE-RANKING             |
              | - diversity / freshness|
              | - business rules       |
              | - RLHF-aligned values  |
              +-----------+------------+
                          v
              +------------------------+
              | SERVE                   |
              | - feed / agent [AI]     |
              | - conversational [AI]   |
              +-----------+------------+
                          v
              +------------------------+
              | LOG                     |
              | - behavior + explicit   |
              | - satisfaction [AI]     |
              +-----------+------------+
                          v
              +------------------------+
              | TRAIN / FINE-TUNE [AI]  |
              | - RLHF, contextual      |
              |   bandits, SlateQ       |
              | - update embeddings     |
              +-----------+------------+
                          |
                          +---> back to CANDIDATE GEN
```

Read the loop: every serve produces a log, every log trains the model, every model change shifts what gets served. This is the closed loop that makes the algorithm _the product_. The `[AI]` annotations mark where the modern stack inserts - and every insertion changes not just the plumbing but the _experience_: generative retrieval makes the feed askable; LLM ranking makes it semantic; RLHF makes it value-aware; the agent layer makes it _active_. A feed becomes a companion. That is the arc.

---

## Founder Lens - Part 7

**What should founders copy?**
The two-stage architecture (candidate generation + ranking) is the universal template - copy it unapologetically. So is the closed loop of serve-log-train: any feed product without that loop is a museum piece. TikTok's behavior-to-ranking latency (seconds) is the bar; build for that, not for nightly batch.

**What should founders avoid?**
Optimizing a raw engagement proxy (watch time, clicks, comments) as your north star. Facebook's MSI disaster (7.5) is the warning: the metric you optimize is the behavior you get, and engagement metrics reliably produce outrage and burnout. Also avoid building your own ANN infrastructure (7.12) - that is a 2016 problem, and it will eat your roadmap.

**What would I build differently today?**
I would not build a feed at all in the classical sense. I would build an **agent** with personal long-term memory (7.15) over a domain, optimized for stated goals (7.17) and long-horizon satisfaction (7.18-7.19), exposed through conversation (7.14) and action (7.16). The feed is the passive incumbent; the agent is the active successor. Start at the successor.

**What has AI changed?**
Three things, each structural. First, embeddings and retrieval are commoditized - a usable recommender is a weekend, not a quarter (7.9, 7.12). Second, LLMs make discovery _conversational_ and _goal-aware_, which the feed cannot be (7.14, 7.17). Third, agents change the unit of competition from attention to _selection_ - the model picks the tool, not the user picking the post (7.16). The locus of optimization moves from the user's attention to the agent's choice.

**What is the opportunity?**
Agent-native products in verticals incumbents cannot retrofit: a training advisor, a travel planner, a shopping agent, a learning companion - each with persistent memory, real tool use, and a reward function optimized for long-term wellbeing rather than session length. Every category TikTok-style feeds dominate is vulnerable to an agent that _does the thing_ instead of _showing you things about the thing_.

**Difficulty (1-10):** 8. The ML is commoditized; the hard parts are the agent loop (memory, tool use, evaluation), the reward design (long-horizon satisfaction is genuinely hard to measure), and the cold-start (7.8). Doable, but it is a real systems problem, not an API call.

**Potential market size:**
Displacing any of the major feed categories (music, video, commerce, knowledge) is a 10B+ opportunity. The agent layer on top of all of them - the "operating system for taste and intent" - is a category-defining play, plausibly larger than any single feed business, because it sits across feeds rather than within one.

**Competitive landscape:**
Incumbents (Meta, Google, ByteDance, Spotify, Netflix) own the data and the distribution, and are retrofitting agents hard. But they are constrained by installed reward functions, installed UIs, and installed business models (advertising, which depends on attention, which agents reduce). Open-source models and commoditized retrieval lower the barrier to enter. The moat for a new entrant is _reward design_ and _agent quality_, not infrastructure.

**Biggest risks:**
Reward misspecification - you will, like Facebook, get the behavior you optimize for, and it may not be the behavior you wanted. Cold-start - if the agent is not useful in session one, you never get the data to make it useful. And incumbents - if one of them ships the agent-native UX first and well, they can smother you with distribution. Mitigate by picking a vertical they will not prioritize and a reward function they cannot copy.

---

## References (Part 7)

Barkan, O., & Koenigstein, N. (2016). Item2Vec: Neural item embedding for collaborative filtering. _IEEE 26th International Workshop on Machine Learning for Signal Processing (MLSP)_.

Berger, J. (2013). _Contagious: Why things catch on._ Simon & Schuster.

Christiano, P. F., Leike, J., Brown, T., Martic, M., Legg, S., & Amodei, D. (2017). Deep reinforcement learning from human preferences. _Advances in Neural Information Processing Systems, 30._

Cialdini, R. B. (2001). _Influence: Science and practice_ (4th ed.). Allyn & Bacon.

Covington, P., Adams, J., & Sargin, E. (2016). Deep neural networks for YouTube recommendations. _Proceedings of the 10th ACM Conference on Recommender Systems_, 191-198.

Eyal, N. (2014). _Hooked: How to build habit-forming products._ Portfolio.

Facebook. (2018, January 11). _Bringing people closer together._ Newsroom update, Meta.

Fogg, B. J. (2019). _Tiny habits: The small changes that change everything._ Houghton Mifflin Harcourt.

Geng, S., Tan, J., Liu, S., Li, J., & Bao, Z. (2022). Recommendation as language processing (P5). _Advances in Neural Information Processing Systems, 35._

Gomez-Uribe, C. A., & Hunt, N. (2015). The Netflix recommender system: Algorithms, business value, and innovation. _ACM Transactions on Management Information Systems, 6_(4), 1-19.

Guo, S., et al. (2024). TikTok's recommender system. _TikTok Engineering Blog / arXiv preprint._

Ie, E., Hsieh, C., Chandrasekhar, L., et al. (2019). SlateQ: A tractable decomposition for reinforcement learning with recommendation sets. _Proceedings of the 28th International Joint Conference on Artificial Intelligence (IJCAI)._

Johnson, S. (2010). _Where good ideas come from: The natural history of innovation._ Riverhead Books.

Kahneman, D. (2011). _Thinking, fast and slow._ Farrar, Straus and Giroux.

Koren, Y., Bell, R., & Volinsky, C. (2009). Matrix factorization techniques for recommender systems. _Computer, 42_(8), 30-37.

Li, L., Chu, W., Langford, J., & Schapire, R. E. (2010). A contextual-bandit approach to personalized news article recommendation. _Proceedings of the 19th International Conference on World Wide Web (WWW)._

Linden, G., Smith, B., & York, J. (2003). Amazon.com recommendations: Item-to-item collaborative filtering. _IEEE Internet Computing, 7_(1), 76-80.

Malkov, Y. A., & Yashunin, D. A. (2018). Efficient and robust approximate nearest neighbor search using Hierarchical Navigable Small World graphs. _IEEE Transactions on Pattern Analysis and Machine Intelligence, 42_(4), 824-836.

Mikolov, T., Sutskever, I., Chen, K., Corrado, G., & Dean, J. (2013). Distributed representations of words and phrases and their compositionality. _Advances in Neural Information Processing Systems, 26._

Ouyang, L., Wu, J., Jiang, X., et al. (2022). Training language models to follow instructions with human feedback (InstructGPT). _Advances in Neural Information Processing Systems, 35._

Pariser, E. (2011). _The filter bubble: What the Internet is hiding from you._ Penguin Press.

Sarwar, B., Karypis, G., Konstan, J., & Riedl, J. (2001). Item-based collaborative filtering recommendation algorithms. _Proceedings of the 10th International Conference on World Wide Web (WWW),_ 285-295.

Schultz, W. (1997). A neural substrate of prediction and reward. _Science, 275_(5306), 1593-1599.

TikTok. (2020, June 18). _How TikTok recommends videos #ForYou._ TikTok Newsroom.
