# Sprint 12: Stripe Subscriptions + AI Features

**SoloAdventurer Web App - Sprint 12**
**Duration**: 2-3 weeks
**Status**: 📋 Planned
**Dependencies**: Sprint 8 (Matching Parity — for feature gating), Sprint 10 (Journal — for AI features)

---

## Sprint Goal

Implement Stripe-powered subscriptions with tiered plans and feature gates, plus integrate AI-powered features including personalized recommendations and travel assistance.

---

## Why This Sprint Exists

### Subscriptions
The mobile app has a complete subscription UI with tiered plans (Free / Explorer / Adventurer / VIP) but uses mock payment processing. Both apps need real Stripe integration.

### AI Features
The mobile app has partial AI integration:
- Recommendation service using OpenAI
- Semantic matching via pgvector embeddings (Sprint 8)
- Personalized destination recommendations

Both apps need:
- Real AI-powered recommendations
- Travel assistant chatbot
- Smart itinerary suggestions

---

## Mobile App Reference

### Subscription Tiers
| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | 5 matches/day, basic chat, 3 journal entries/month |
| **Explorer** | $9.99/mo | 20 matches/day, full chat, unlimited journal, see who liked you |
| **Adventurer** | $19.99/mo | Unlimited matches, AI recommendations, priority support, PDF export |
| **VIP** | $39.99/mo | Everything + verified badge, advanced filters, early features |

### AI Integration
- OpenAI API (via OpenRouter) for recommendations
- pgvector embeddings for semantic search
- `recommendation_service.dart` — personalized destination/activity suggestions
- `personalized_recommendation_service.dart` — context-aware travel tips

---

## Epic Breakdown

### Epic 1: Stripe Subscription Infrastructure

Set up the payment backend and webhook handling.

#### Tasks:

- [ ] **Configure Stripe**
  - [ ] Create Stripe account and get API keys
  - [ ] Create products and prices for each tier in Stripe dashboard
  - [ ] Add `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY` to environment
  - [ ] **Test:** Stripe keys connect successfully

- [ ] **Create subscription API routes**
  - [ ] `src/app/api/stripe/checkout/route.ts` — create checkout session
  - [ ] `src/app/api/stripe/webhook/route.ts` — handle Stripe webhooks
  - [ ] `src/app/api/stripe/portal/route.ts` — customer portal for managing subscription
  - [ ] `src/app/api/stripe/subscription/route.ts` — get current subscription status
  - [ ] **Test:** Checkout session creates and webhook receives events

- [ ] **Create subscription database schema**
  - [ ] `subscriptions` table: userId, stripeCustomerId, stripeSubscriptionId, tier, status, currentPeriodEnd
  - [ ] RLS policies for user-owned subscriptions
  - [ ] Sync subscription status from Stripe webhooks
  - [ ] **Test:** Subscription status persists in Supabase

---

### Epic 2: Subscription UI

Build the paywall, pricing page, and feature gates.

#### Tasks:

- [ ] **Build pricing page**
  - [ ] `src/app/(main)/pricing/page.tsx`
  - [ ] Tier cards with feature comparison table
  - [ ] Highlighted recommended tier
  - [ ] Monthly/annual toggle with savings
  - [ ] Checkout CTA buttons → redirect to Stripe Checkout
  - [ ] **Test:** Pricing page displays all tiers

- [ ] **Build paywall component**
  - [ ] `src/components/features/subscription/Paywall.tsx`
  - [ ] Shown when free user hits a premium feature
  - [ ] Feature name, description, upgrade CTA
  - [ ] "Upgrade to see who liked you" / "Upgrade for unlimited matches"
  - [ ] **Test:** Paywall triggers on gated features

- [ ] **Build feature gate hook**
  - [ ] `src/hooks/useSubscription.ts`
  - [ ] `useFeatureGate(feature)` — returns { allowed, tier, upgrade }
  - [ ] Features: `unlimited_matches`, `see_who_liked_you`, `ai_recommendations`, `verified_badge`, `advanced_filters`, `pdf_export`, `unlimited_journal`
  - [ ] **Test:** Gate blocks free users, allows premium

- [ ] **Build subscription management**
  - [ ] `src/app/(main)/settings/subscription/page.tsx`
  - [ ] Current plan display with renewal date
  - [ ] Upgrade/downgrade buttons → Stripe Customer Portal
  - [ ] Cancel subscription flow
  - [ ] **Test:** User can manage their subscription

---

### Epic 3: AI-Powered Recommendations

Integrate AI for personalized travel suggestions.

#### Tasks:

- [ ] **Create AI service layer**
  - [ ] `src/lib/api/ai.ts`
  - [ ] `getRecommendations(interests, destinations, budget)` — get personalized suggestions
  - [ ] `getDestinationInsights(destination)` — local tips and recommendations
  - [ ] `generateItinerary(destination, dates, interests)` — smart itinerary generation
  - [ ] Call via Supabase edge function or direct OpenAI API
  - [ ] **Test:** Recommendations return relevant suggestions

- [ ] **Build recommendations page**
  - [ ] `src/app/(main)/recommendations/page.tsx`
  - [ ] Personalized destination suggestions based on profile
  - [ ] Activity recommendations for upcoming trips
  - [ ] "Travelers like you also went to..." section
  - [ ] Premium gate for AI features
  - [ ] **Test:** Recommendations display with real AI data

- [ ] **Build AI travel assistant**
  - [ ] `src/components/features/ai/TravelAssistant.tsx`
  - [ ] Chat-based interface for travel questions
  - [ ] Context-aware: knows user's trips, interests, connections
  - [ ] "What should I pack for Tokyo in April?"
  - [ ] "Find me a hiking buddy in Patagonia"
  - [ ] Premium feature gate
  - [ ] **Test:** Assistant responds with relevant travel advice

---

### Epic 4: Smart Features

Add AI-enhanced features throughout the app.

#### Tasks:

- [ ] **Smart itinerary generator**
  - [ ] `src/components/features/ai/ItineraryGenerator.tsx`
  - [ ] Input: destination, dates, interests, budget
  - [ ] Output: day-by-day itinerary with activities, restaurants, tips
  - [ ] Save as trip or journal entry
  - [ ] Premium feature gate
  - [ ] **Test:** Itinerary generates for given destination

- [ ] **AI-powered trip matching explanation**
  - [ ] Show "Why we matched you" on MatchCard
  - [ ] "You both love hiking and are going to Tokyo in the same week"
  - [ ] Generated from match score factors
  - [ ] **Test:** Match explanations display correctly

- [ ] **Smart journal prompts**
  - [ ] After completing a trip, suggest journal prompts
  -   "How was the food in Bangkok?"
  -   "What surprised you most about Tokyo?"
  - [ ] Auto-suggest tags based on photos and content
  - [ ] **Test:** Prompts appear after trip completion

---

## Verification Checklist

1. `npx tsc --noEmit` — zero errors
2. Stripe checkout — user can subscribe to a paid tier
3. Webhook sync — subscription status updates in Supabase
4. Feature gates — free users blocked from premium features
5. Pricing page — all tiers display with correct features
6. Subscription management — upgrade, downgrade, cancel work
7. AI recommendations — personalized suggestions based on profile
8. Travel assistant — responds with context-aware travel advice
9. Itinerary generator — produces day-by-day plans
10. Cross-platform — subscription status shared between web and mobile
