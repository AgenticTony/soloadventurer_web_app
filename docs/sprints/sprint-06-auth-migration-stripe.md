# Sprint 6: Auth Migration (Cognito → Supabase) + Stripe Payments

**SoloAdventurer Web App - Sprint 6**
**Duration**: 2-3 weeks
**Status**: 📋 Planned
**Dependencies**: Sprint 5 (Safety & Scale)

---

## 🎯 Sprint Goal

Migrate the web app from AWS Cognito to Supabase Auth (shared user database with the mobile app), integrate Stripe for web-based subscription payments, and build the pricing/account management portal. This enables the "subscribe on web, unlock in app" monetization strategy that bypasses Apple/Google 30% commission.

---

## 📋 Why This Sprint Exists

The mobile app uses Supabase Auth. The web app uses AWS Cognito. These are two completely separate user databases — a user who signs up on mobile cannot log in on the web, and vice versa. For the web purchase flow to work, both apps must share the same auth backend (Supabase).

Additionally, web-based purchases through Stripe avoid the 30% commission charged by Apple and Google for in-app purchases, making this a revenue-critical sprint.

---

## 📋 Epic Breakdown

### Epic 1: Supabase Auth Migration

Replace all AWS Cognito / Amplify auth with Supabase Auth.

#### Tasks:

- [ ] **Install Supabase dependencies**
  - [ ] Add `@supabase/supabase-js` and `@supabase/ssr` to package.json
  - [ ] Remove `aws-amplify`, `@aws-amplify/adapter-nextjs`, `@aws-amplify/ui-react` from package.json
  - [ ] Remove `aws-appsync-auth-link` and `aws-appsync-subscription-link` if unused
  - [ ] Run `npm install` to update lockfile
  - [ ] **Test:** `npm run build` succeeds with new dependencies only

- [ ] **Create Supabase client configuration**
  - [ ] Create `src/lib/supabase/client.ts` — browser-side Supabase client
  - [ ] Create `src/lib/supabase/server.ts` — server-side Supabase client with cookie handling
  - [ ] Create `src/lib/supabase/middleware.ts` — session refresh middleware
  - [ ] Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`
  - [ ] **Test:** Both clients initialize without errors
  - [ ] **Test:** Server client can read session from cookies

- [ ] **Rewrite AuthContext.tsx (Cognito → Supabase)**
  - [ ] Replace `signIn` from `aws-amplify/auth` with `supabase.auth.signInWithPassword`
  - [ ] Replace `signUp` with `supabase.auth.signUp`
  - [ ] Replace `signOut` with `supabase.auth.signOut`
  - [ ] Replace `resetPassword` with `supabase.auth.resetPasswordForEmail`
  - [ ] Replace `confirmResetPassword` with `supabase.auth.updateUser({ password })`
  - [ ] Replace `confirmSignUp` with `supabase.auth.verifyOtp`
  - [ ] Replace `resendSignUpCode` with `supabase.auth.resend`
  - [ ] Replace `getCurrentUser` / `fetchUserAttributes` with `supabase.auth.getUser()`
  - [ ] Replace `fetchAuthSession` with `supabase.auth.getSession()`
  - [ ] Use `supabase.auth.onAuthStateChange` for session listening
  - [ ] Update User type mapping to match Supabase `auth.users` schema
  - [ ] **Test:** Login works with existing Supabase user
  - [ ] **Test:** Signup creates user in Supabase `auth.users`
  - [ ] **Test:** Session persists across page refreshes
  - [ ] **Test:** Password reset flow works end-to-end

- [ ] **Update auth types**
  - [ ] Replace `COGNITO_ERROR_CODES` with Supabase error codes in `src/types/auth.ts`
  - [ ] Remove `CognitoErrorCode` type
  - [ ] Add `SUPABASE_ERROR_CODES` constant mapping common Supabase auth errors
  - [ ] **Test:** TypeScript compilation passes
  - [ ] **Test:** Auth error messages display correctly in UI

- [ ] **Update middleware.ts**
  - [ ] Replace Cognito session check with Supabase `getSession()`
  - [ ] Add Supabase auth middleware for session refresh
  - [ ] Update protected route logic to check Supabase session
  - [ ] **Test:** Unauthenticated users redirect to sign-in
  - [ ] **Test:** Authenticated users can access protected routes

- [ ] **Remove AWS Amplify infrastructure**
  - [ ] Delete `src/utils/amplifyServerUtils.ts` (if exists)
  - [ ] Delete `src/utils/authServerUtils.ts` or rewrite for Supabase
  - [ ] Delete `src/contexts/AmplifyProvider.tsx` (if exists)
  - [ ] Delete `amplify/` directory
  - [ ] Delete `__mocks__/aws-amplify/` directory
  - [ ] Remove Amplify config from `next.config.js` / `next.config.ts`
  - [ ] Clean up any Amplify-related imports across codebase
  - [ ] **Test:** `grep -r "aws-amplify" src/` returns zero results
  - [ ] **Test:** `grep -r "amplify" src/ --include="*.ts" --include="*.tsx"` returns zero results (excluding comments)

#### Acceptance Criteria:
- [ ] All auth flows work with Supabase (login, signup, logout, password reset, email verification)
- [ ] Users created in the mobile app can log in on the web
- [ ] Users created on the web can log in in the mobile app
- [ ] Session persistence works across page refreshes
- [ ] Zero AWS Amplify/Cognito dependencies remain in codebase
- [ ] `npm run build` succeeds

---

### Epic 2: Stripe Integration

Add server-side Stripe integration for subscription payments.

#### Tasks:

- [ ] **Install Stripe dependencies**
  - [ ] Add `stripe` (server-side) to package.json
  - [ ] Add `@stripe/stripe-js` (client-side) to package.json
  - [ ] Add `@stripe/react-stripe-js` to package.json
  - [ ] **Test:** Imports resolve without errors

- [ ] **Create Stripe server-side client**
  - [ ] Create `src/lib/stripe/server.ts` — initialize Stripe with secret key
  - [ ] Add `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` to `.env.local`
  - [ ] Add `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to `.env.local`
  - [ ] **Test:** Stripe client initializes without error

- [ ] **Create Stripe client-side client**
  - [ ] Create `src/lib/stripe/client.ts` — initialize Stripe.js with publishable key
  - [ ] Create `src/lib/stripe/elements-provider.tsx` — React context for Stripe Elements
  - [ ] **Test:** Stripe Elements render in a test component

- [ ] **Define subscription plans**
  - [ ] Create `src/lib/stripe/plans.ts` — plan definitions (Free, Explorer, Adventurer Pro)
  - [ ] Define plan features, limits, and Stripe Price IDs
  - [ ] Suggested plans:
    - **Free**: Basic matching, 5 waves/day, limited chat
    - **Explorer** ($9.99/mo): Unlimited waves, full chat, trip sharing, advanced filters
    - **Adventurer Pro** ($19.99/mo): Everything in Explorer + priority matching, verified badge, travel insurance partner discounts, API access
  - [ ] **Test:** Plan definitions render correctly in pricing page

- [ ] **Create checkout session API route**
  - [ ] Create `src/app/api/stripe/checkout/route.ts`
  - [ ] Accept `priceId` and `userId` from request body
  - [ ] Create Stripe Checkout Session with success/cancel URLs
  - [ ] Include user metadata for webhook linking
  - [ ] Return session URL for client redirect
  - [ ] **Test:** POST request creates valid checkout session
  - [ ] **Test:** Invalid priceId returns 400

- [ ] **Create customer portal API route**
  - [ ] Create `src/app/api/stripe/portal/route.ts`
  - [ ] Create Stripe Customer Portal session for billing management
  - [ ] Configure portal to allow plan changes, cancellation, payment method updates
  - [ ] Return portal URL for client redirect
  - [ ] **Test:** Authenticated user gets valid portal URL
  - [ ] **Test:** Unauthenticated request returns 401

- [ ] **Create webhook handler**
  - [ ] Create `src/app/api/stripe/webhook/route.ts`
  - [ ] Verify webhook signature with `STRIPE_WEBHOOK_SECRET`
  - [ ] Handle `checkout.session.completed` — create subscription in Supabase
  - [ ] Handle `customer.subscription.updated` — update plan in Supabase
  - [ ] Handle `customer.subscription.deleted` — downgrade to free in Supabase
  - [ ] Handle `invoice.payment_failed` — mark subscription as past_due
  - [ ] Update Supabase `profiles` table with `stripe_customer_id`, `subscription_tier`, `subscription_status`
  - [ ] **Test:** Webhook with valid signature updates Supabase
  - [ ] **Test:** Webhook with invalid signature returns 400
  - [ ] **Test:** `checkout.session.completed` creates subscription record
  - [ ] **Test:** `customer.subscription.deleted` sets tier to 'free'

- [ ] **Create premium sync API route**
  - [ ] Create `src/app/api/auth/sync-premium/route.ts`
  - [ ] Accept Supabase JWT and return current subscription status
  - [ ] Mobile app calls this to check if user has active web subscription
  - [ ] Returns `{ tier, status, expiresAt }` from Supabase
  - [ ] **Test:** Valid JWT returns correct subscription status
  - [ ] **Test:** Expired JWT returns 401

#### Acceptance Criteria:
- [ ] Stripe checkout creates a valid subscription
- [ ] Webhook handler syncs subscription status to Supabase
- [ ] Customer portal allows plan management
- [ ] Premium sync endpoint works for mobile app consumption
- [ ] All webhook events handled idempotently

---

### Epic 3: Pricing & Marketing Pages

Build the public-facing pricing page and plan comparison.

#### Tasks:

- [ ] **Create pricing page**
  - [ ] Create `src/app/(public)/pricing/page.tsx`
  - [ ] Three-tier plan display (Free, Explorer, Adventurer Pro)
  - [ ] Feature comparison table
  - [ ] "Subscribe" CTA buttons (redirect to Stripe Checkout)
  - [ ] Annual/monthly toggle with savings display
  - [ ] FAQ section with common questions
  - [ ] Mobile-responsive layout
  - [ ] **Test:** Pricing page renders all three plans
  - [ ] **Test:** Toggle switches between monthly/annual pricing
  - [ ] **Test:** CTA buttons redirect to correct checkout

- [ ] **Update landing page**
  - [ ] Update `src/app/page.tsx` with pricing link in navigation
  - [ ] Add "View Plans" CTA section
  - [ ] Add trust badges (secure payment, cancel anytime)
  - [ ] **Test:** Landing page links to pricing page

- [ ] **Create checkout success/cancel pages**
  - [ ] Create `src/app/(auth)/checkout/success/page.tsx` — confirmation with app download link
  - [ ] Create `src/app/(auth)/checkout/cancel/page.tsx` — retry messaging
  - [ ] **Test:** Success page shows confirmation message
  - [ ] **Test:** Cancel page shows retry CTA

#### Acceptance Criteria:
- [ ] Pricing page displays all plans with accurate feature lists
- [ ] Checkout flow redirects to Stripe and back to success page
- [ ] Pages are mobile-responsive and accessible

---

### Epic 4: Account Management & Billing

Build authenticated account management pages.

#### Tasks:

- [ ] **Create account dashboard page**
  - [ ] Create `src/app/(main)/account/page.tsx`
  - [ ] Display current plan with usage stats
  - [ ] Upgrade/downgrade CTA
  - [ ] Link to billing management (Stripe Customer Portal)
  - [ ] Link to profile settings
  - [ ] **Test:** Displays current subscription tier
  - [ ] **Test:** Free users see upgrade CTA

- [ ] **Create billing history page**
  - [ ] Create `src/app/(main)/account/billing/page.tsx`
  - [ ] List past invoices with dates and amounts
  - [ ] Download invoice PDFs
  - [ ] Update payment method button (redirects to Stripe Portal)
  - [ ] Cancel subscription button with confirmation modal
  - [ ] **Test:** Billing page shows invoice history
  - [ ] **Test:** Cancel button shows confirmation modal

- [ ] **Create account settings page**
  - [ ] Create `src/app/(main)/account/settings/page.tsx`
  - [ ] Email change with verification
  - [ ] Password change
  - [ ] Delete account with confirmation (Supabase + Stripe cleanup)
  - [ ] Export data (GDPR compliance)
  - [ ] **Test:** Password change updates credentials
  - [ ] **Test:** Delete account removes user from Supabase

- [ ] **Update profile page to show subscription badge**
  - [ ] Add verified/premium badge to profile header
  - [ ] Add plan indicator in settings sidebar
  - [ ] **Test:** Premium users see correct badge

#### Acceptance Criteria:
- [ ] Users can view and manage their subscription
- [ ] Users can cancel and receive prorated refund info
- [ ] Users can change payment method via Stripe Portal
- [ ] Account deletion cleans up both Supabase and Stripe records

---

### Epic 5: Supabase Database Schema Updates

Update the database to support subscriptions and web auth.

#### Tasks:

- [ ] **Create profiles table migration**
  - [ ] Add `stripe_customer_id` column to `profiles` table (text, nullable, unique)
  - [ ] Add `subscription_tier` column (enum: 'free', 'explorer', 'adventurer_pro', default 'free')
  - [ ] Add `subscription_status` column (enum: 'active', 'past_due', 'canceled', 'trialing', default null)
  - [ ] Add `subscription_current_period_end` column (timestamptz, nullable)
  - [ ] Create index on `stripe_customer_id` for webhook lookups
  - [ ] Create index on `subscription_tier` for feature gating queries
  - [ ] **Test:** Migration applies cleanly
  - [ ] **Test:** Existing profiles default to 'free' tier

- [ ] **Create Row Level Security policies**
  - [ ] Users can read their own subscription status
  - [ ] Service role can update subscription status (for webhooks)
  - [ ] Users cannot manually update their own subscription_tier
  - [ ] **Test:** User cannot update their own subscription via client SDK
  - [ ] **Test:** Service role can update subscription via admin API

- [ ] **Update mobile app sync**
  - [ ] Mobile app reads `subscription_tier` from `profiles` table (already connected to Supabase)
  - [ ] Feature gating in mobile app checks `subscription_tier` locally
  - [ ] Mobile app calls `/api/auth/sync-premium` on app launch to verify status
  - [ ] **Test:** Mobile app correctly reflects web-purchased subscription

#### Acceptance Criteria:
- [ ] Database schema supports full subscription lifecycle
- [ ] RLS prevents client-side subscription manipulation
- [ ] Mobile app syncs premium status from web purchases

---

### Epic 6: Testing & Quality

Comprehensive testing for the auth migration and payment flow.

#### Tasks:

- [ ] **Auth migration tests**
  - [ ] Unit tests for Supabase auth helpers (`src/lib/supabase/client.ts`, `server.ts`)
  - [ ] Integration tests for login, signup, password reset, email verification
  - [ ] Update existing Cognito mock tests to use Supabase mocks
  - [ ] Test error handling for all Supabase auth error codes
  - [ ] **Test:** All auth tests pass with Supabase

- [ ] **Stripe integration tests**
  - [ ] Unit tests for plan definitions and feature gating logic
  - [ ] Integration tests for checkout session creation
  - [ ] Integration tests for webhook handler (use Stripe test webhooks)
  - [ ] Test idempotency of webhook event processing
  - [ ] Test subscription lifecycle: create → update → cancel → reactivate
  - [ ] **Test:** Full payment flow test with Stripe test mode

- [ ] **E2E tests**
  - [ ] Cypress test: User signs up on web → confirms email → logs in
  - [ ] Cypress test: User subscribes to Explorer plan → sees premium features
  - [ ] Cypress test: User cancels subscription → downgraded to free
  - [ ] Cypress test: Mobile user logs in on web with same credentials
  - [ ] **Test:** All E2E payment tests pass with Stripe test mode

- [ ] **Security testing**
  - [ ] Verify webhook signature validation (reject unsigned payloads)
  - [ ] Verify JWT validation on all API routes
  - [ ] Verify RLS policies prevent unauthorized subscription changes
  - [ ] Test CSRF protection on checkout and portal routes
  - [ ] **Test:** Security scan returns no critical findings

#### Acceptance Criteria:
- [ ] All unit and integration tests pass
- [ ] E2E tests cover complete auth and payment flows
- [ ] No critical security findings
- [ ] Test coverage > 80% for new code

---

### Epic 7: Deployment & Infrastructure

Deploy the migrated app and configure production services.

#### Tasks:

- [ ] **Configure Stripe for production**
  - [ ] Create Stripe products and prices in live mode
  - [ ] Configure webhook endpoint URL for production domain
  - [ ] Set up Stripe Customer Portal configuration
  - [ ] Add production Stripe keys to Vercel environment variables
  - [ ] **Test:** Webhook reaches production endpoint

- [ ] **Configure Supabase for production web**
  - [ ] Add web app domain to Supabase Auth → URL Configuration → Site URL
  - [ ] Add web app domain to Redirect URLs allowlist
  - [ ] Configure email templates for web app (sign up verification, password reset)
  - [ ] **Test:** Supabase auth redirects work on production domain

- [ ] **Deploy to Vercel**
  - [ ] Connect GitHub repo to Vercel project
  - [ ] Configure environment variables in Vercel dashboard
  - [ ] Set up preview deployments for PRs
  - [ ] Configure custom domain (e.g., account.soloadventurer.com or soloadventurer.com)
  - [ ] **Test:** Production deployment is live and functional
  - [ ] **Test:** Preview deployments work for PRs

- [ ] **Update mobile app configuration**
  - [ ] Add web app URL to mobile app deep links
  - [ ] Add "Manage Subscription" button in mobile app → opens web account page
  - [ ] Add "Subscribe" CTA in mobile app → opens web pricing page
  - [ ] **Test:** Mobile app links open web app correctly

- [ ] **Documentation**
  - [ ] Update `docs/standards/ARCHITECTURE.md` with Supabase Auth + Stripe architecture
  - [ ] Update `docs/standards/SECURITY.md` with payment security practices
  - [ ] Create `docs/STRIPE_INTEGRATION.md` with webhook events, plan definitions, and troubleshooting
  - [ ] Update `.env.example` with all new environment variables
  - [ ] **Test:** Documentation accurately reflects implementation

#### Acceptance Criteria:
- [ ] Production deployment is live with working auth and payments
- [ ] Mobile app links correctly to web pricing and account pages
- [ ] All documentation updated
- [ ] Environment variables documented in `.env.example`

---

## 📊 Definition of Done

A task is considered **done** when:
- [ ] Code is written and follows project standards (ESLint, Prettier, TypeScript strict)
- [ ] All auth flows work with Supabase (no AWS dependencies remain)
- [ ] Stripe integration handles complete subscription lifecycle
- [ ] All tests pass (unit, integration, E2E)
- [ ] Code is reviewed and approved
- [ ] Security review completed (webhook signatures, JWT validation, RLS)
- [ ] Documentation is updated
- [ ] Deployed to Vercel and functional on production domain

---

## 🔧 Technical Dependencies

### External Services:
- Supabase Auth (shared with mobile app)
- Supabase Database (profiles table)
- Stripe (payments and subscriptions)
- Vercel (hosting)

### npm Packages (Adding):
- `@supabase/supabase-js`
- `@supabase/ssr`
- `stripe`
- `@stripe/stripe-js`
- `@stripe/react-stripe-js`

### npm Packages (Removing):
- `aws-amplify`
- `@aws-amplify/adapter-nextjs`
- `@aws-amplify/ui-react`
- `aws-appsync-auth-link` (if unused after migration)
- `aws-appsync-subscription-link` (if unused after migration)

### Environment Variables (New):
```
# Supabase (replace Cognito)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=  # server-side only, for webhook updates

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Plan Price IDs
STRIPE_EXPLORER_MONTHLY_PRICE_ID=
STRIPE_EXPLORER_ANNUAL_PRICE_ID=
STRIPE_ADVENTURER_PRO_MONTHLY_PRICE_ID=
STRIPE_ADVENTURER_PRO_ANNUAL_PRICE_ID=
```

---

## 🚧 Dependencies

**Requires Completion of:**
- ✅ Sprint 1: Authentication and profiles (Cognito version — this sprint replaces it)
- ✅ Sprint 5: Safety features (content moderation)

**Enables:**
- Web-based subscription purchases (bypassing 30% store commission)
- Shared auth between mobile and web apps
- Account management portal

**External Requirements:**
- Supabase project already provisioned (shared with mobile app)
- Stripe account created and verified
- Custom domain configured (optional, can use Vercel subdomain initially)

---

## 🚧 Risks & Mitigation

### Identified Risks:

| Risk | Impact | Mitigation |
|------|--------|------------|
| Cognito → Supabase data migration for existing users | Medium | Web app is pre-launch; no production users to migrate. Mobile users already on Supabase. |
| Stripe webhook reliability | High | Implement idempotent event processing + retry logic. Log all events for audit. |
| Apple/Google policy changes on web purchase links | Medium | Use standard "manage subscription" patterns approved by both platforms. No IAP circumvention language. |
| Session cookie conflicts between Supabase and old Cognito | Low | Complete removal of all Cognito code prevents conflicts |
| Mobile app sync delays | Low | Mobile app fetches premium status on launch; max delay is one app open |

---

## 📝 Notes

### Auth Migration Strategy
The web app has no production users (pre-launch), so there is no data migration needed. The mobile app already uses Supabase Auth, so migrating the web app creates a unified user base from day one.

### Payment Flow Architecture
```
User clicks "Subscribe" on web
  → POST /api/stripe/checkout (creates Stripe Checkout Session)
  → Redirect to Stripe Checkout
  → User completes payment
  → Stripe sends webhook to POST /api/stripe/webhook
  → Webhook updates Supabase profiles.subscription_tier
  → Mobile app reads subscription_tier on next launch
  → User sees premium features in mobile app
```

### Revenue Flow
```
Explorer Plan ($9.99/mo):
  Stripe processing fee: ~$0.59 (2.9% + $0.30)
  Revenue after fees: ~$9.40
  SoloAdventurer keeps: ~94% (vs 70% with IAP)

Adventurer Pro ($19.99/mo):
  Stripe processing fee: ~$0.88
  Revenue after fees: ~$19.11
  SoloAdventurer keeps: ~96% (vs 70% with IAP)
```

---

**👥 Sprint Team**: Tech Lead, 2 Developers, QA Engineer
**📅 Estimated Effort**: 2-3 weeks
**🎯 Priority**: High — enables revenue generation
