# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

- **SoloAdventurer** is a social platform built for solo travelers. It includes both a **web app** and a **mobile app**, sharing backend services and data.
- Web built with **React + Next.js (TypeScript)**. Mobile app is built in **Flutter (Dart)**.
- Core functionality: user profiles, trips, map-based discovery, matching, chat, feed, meetups, and traveler safety (verification, reporting, blocking).
- Backend: Supabase (PostgreSQL, Auth, Realtime, Storage, Edge Functions), deployed via Vercel.

## Common Commands

## Common Commands & Scripts

| Command              | What it does                       |
| -------------------- | ---------------------------------- |
| `npm run dev`        | Start local web development server |
| `npm run build`      | Build web app for production       |
| `npm run start`      | Start production server            |
| `npm run lint`       | Run ESLint checks                  |
| `npm run typecheck`  | TypeScript type checking           |
| `npm run test`       | Run unit and integration tests     |
| `npm run test:watch` | Run tests in watch mode            |
| `npm run e2e`        | Run end-to-end tests (Cypress)     |
| `npm run deploy`     | Deploy web app for production      |

### Code Quality

```bash
# Run all quality checks before committing
npm run lint && npm run typecheck && npm run test
```

## Architecture Overview

### Clean Architecture Layers

- **Web (UI)**: Next.js components, pages, hooks
- **API**: Supabase Edge Functions, direct client queries
- **Domain**: Pure TypeScript business logic
- **Infrastructure**: Supabase (PostgreSQL, Auth, Realtime, Storage)

### Key Technology Stack

- **Frontend**: Next.js 15, React 18.2, TypeScript 5.9
- **Styling**: TailwindCSS 3.4, shadcn/ui components
- **State Management**: React Context
- **API**: Supabase client (direct queries, Edge Functions, Realtime)
- **Auth**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Testing**: Jest, Testing Library, Cypress

### Project Structure

```
/src/ → source code for web app
├── app/                # Next.js App Router pages
│   ├── (main)/         # Main authenticated routes
│   └── (auth)/         # Auth routes (sign-in, signup)
├── components/         # Reusable UI components
│   ├── ui/             # Base UI components (Button, Input, etc.)
│   ├── layout/         # Layout components (Header, LeftNav, etc.)
│   ├── features/       # Feature-specific components
│   ├── moderation/     # Block/report dialogs
│   └── users/          # User cards and lists
├── contexts/           # React Context providers (Auth, Privacy, Toast)
├── hooks/              # Custom React hooks
├── lib/                # Library code
│   ├── api/            # API clients (chat, matching, connections)
│   ├── supabase/       # Supabase client & edge function invoker
│   └── websocket/      # (removed — Supabase Realtime replaces this)
├── services/           # Service layer (userService, etc.)
├── store/              # State management
├── types/              # TypeScript type definitions
└── styles/             # Global styles and theme
/docs/ → project documentation, sprint files
/public/ → static assets (favicon, icons, etc.)
```

## Supabase Architecture

### Core Data Models

- **User**: Profiles, interests, verification levels (auth via Supabase Auth)
- **Trip**: Travel itineraries with dates and locations
- **Connection**: Wave-based relationship system
- **Message**: Real-time messaging between matched users
- **Post**: Social feed content and trip check-ins
- **Report**: Safety and moderation system

### Real-time Features

- **Realtime**: Supabase Realtime channels for typing indicators, presence
- **Edge Functions**: Serverless functions for matching, connection validation
- **Notifications**: In-app and email notifications

### Edge Functions (Deployed)

- `find-potential-matches-semantic` — AI-powered composite matching
- `find-overlapping-trips` — Geographic fallback matching
- `request-connection` — Validated connection requests
- `respond-connection` — Accept/decline with chat creation

## Coding Style, Conventions & Best Practices

- **TypeScript strict**: no `any` except in rare, documented cases. Enable `strict` mode.
- **ES Modules** (`import` / `export`) preferred over CommonJS.
- Components: PascalCase naming; file names should match component names.
- Utility / helper functions in `/utils/` or `/lib/`. Business logic should live outside UI components.
- Use Supabase client for all data access. Prefer Edge Functions for validated operations.
- TailwindCSS + shadcn/ui for styling and design consistency. Use design tokens for spacing/colors.
- Accessibility should be baked in: use ARIA roles, semantic HTML, keyboard navigation.
- Code should be well tested: unit tests for logic, component tests for UI, snapshots only for stable UI primitives.
- e2e tests for major flows (auth, trip creation, matching, messaging, safety flows).

### Testing / Quality Gate Criteria

- Unit tests for all domain logic and service functions (target ≥ 80% coverage).
- Component UI tests: test props, rendering, user interactions.
- End-to-end (Cypress) tests for important flows: authentication, trip CRUD, matching & waves, messaging, safety (report/block).
- Maintain build stability: CI must catch breaking changes.
- Performance benchmarks: feed & map contexts should load under acceptable thresholds (e.g. initial map load <2 seconds; feed load <1 second for first batch).

### Security & Privacy Rules

- Secrets and credentials must _never_ be checked into version control. Use environment variables and Supabase vault.
- Media upload via presigned URLs, enforce file size/type restrictions.
- Validate all inputs at API boundary (schema validation via Zod or similar).
- Auth & Authorization: ensure operations are allowed only for the user (e.g. user cannot modify someone else's profile).
- Location data: default to city-level; more precise location only with user consent.
- Reporting & moderation flows must handle abuse or malicious usage.

## Git / Branching / Pull Request Workflow

- Branch naming: `feature/S##-T##-short-description` or `bugfix/S##-T##-short-description`. Matches sprint & task ids.
- Commit messages should follow Conventional Commits pattern (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`).
- Every PR must link to one (or more) sprint/task IDs. Use issue references (`closes #123`).
- PRs must pass CI: lint, typecheck, tests.
- Code review required before merge. Use pull-request template.

## What to Avoid / Known Pitfalls

- Avoid over-fetching data — select only the columns you need from Supabase queries.
- Avoid tightly coupling UI to specific data shapes — minimize breakage when schemas change.
- Don't skip writing tests because deadline. Tests save effort in the long run.
- Avoid large monolithic functions. Break logic into smaller functions for readability and testability.
- Avoid side effects in components; side effect logic should be in service or domain layer.

## Interaction with Claude / Usage Tips

- Reference sprint & task IDs when asking for code or changes (e.g. "Implement S4-T5: chat image upload").
- Before coding features, ask Claude to review relevant ADRs (`/docs/adr`) to ensure alignment.
- If Claude produces code that violates style or rules here, call out explicitly and request revision.
- Periodically review this file and update it when new conventions, tools, or patterns become standard (e.g. after Sprint 3, new rules about component structure might emerge).

## Reminders & Critical Rules (YOU MUST FOLLOW)

- Use Supabase client for all data access — no direct REST endpoints with auth tokens.
- No skipping of CI checks. If lint fails, PR is not ready.
- Branch names & issue linking must follow the sprint/task structure.
- Safety & verification flows are non-negotiable: users must be able to report, block, verify.

## Sprint Development

### Current Sprint Structure

- **Sprint 1**: ✅ Foundations & Authentication (Completed)
- **Sprint 2A**: ✅ Trips Backend Infrastructure (Completed)
- **Sprint 2B**: ✅ Frontend Trip Features (Completed)
- **Sprint 3**: ✅ Chat System (Completed)
- **Sprint 6**: ✅ Auth Migration to Supabase (Completed)
- **Sprint 7**: ✅ Matching & Connections (Completed)
- **Sprint 8**: 🔄 Matching Parity + Typing Indicators (In Progress)

### Task Management

- Use GitHub issue templates for bugs, features, and tasks
- Follow sprint checklists in `/docs/sprints/`
- Update sprint files with progress and completion status
- Link PRs to issues using `closes #123` format

## Key Dependencies

### Core Libraries

- `@supabase/supabase-js`: Supabase client (auth, database, realtime, storage)
- `@supabase/ssr`: Supabase SSR utilities
- `framer-motion`: Animations and transitions
- `react-hook-form`: Form handling with validation
- `zod`: Schema validation
- `tailwindcss`: Utility-first CSS framework
- `lucide-react`: Icon library

### Development Tools

- `eslint`: Code linting
- `jest`: Testing framework
- `@testing-library/react`: React testing utilities
- `typescript`: Type checking

## Environment Configuration

### Required Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Mapbox (optional, for map features)
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token
```

## Important Notes

- All data access goes through the Supabase client
- Authentication uses Supabase Auth (migrated from AWS Cognito in Sprint 6)
- Real-time features use Supabase Realtime channels
- Edge Functions handle validated operations (matching, connections)
- Safety and moderation are core requirements
- Mobile app shares the same Supabase backend
