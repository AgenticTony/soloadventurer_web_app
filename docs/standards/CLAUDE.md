# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

- **SoloAdventurer** is a social platform built for solo travelers. It includes both a **web app** and a **mobile app**, sharing backend services and data.  
- Web built with **React + Next.js (TypeScript)**. Mobile app is built in **Flutter (Dart)**.  
- Core functionality: user profiles, trips, map-based discovery, matching, chat, feed, meetups, and traveler safety (verification, reporting, blocking).  
- Backend: GraphQL API (AWS AppSync or Apollo on Node.js), Auth via Cognito, Storage via S3 & CDN, relational DB (Aurora MySQL-compatible), cache layer (Redis), plus infrastructure for scaling & monitoring.

## Common Commands

## Common Commands & Scripts

| Command | What it does |
|---------|---------------|
| `npm run dev` | Start local web development server |
| `npm run build` | Build web app for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint checks |
| `npm run typecheck` | TypeScript type checking |
| `npm run test` | Run unit and integration tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run e2e` | Run end-to-end tests (Cypress) |
| `npm run codegen` | Generate TypeScript types from GraphQL schema |
| `npm run deploy` | Deploy web app via Amplify or equivalent pipeline |

### Code Quality
```bash
# Run all quality checks before committing
npm run lint && npm run typecheck && npm run test
```

## Architecture Overview

### Clean Architecture Layers
- **Web (UI)**: Next.js components, pages, hooks
- **API**: GraphQL resolvers, authentication middleware  
- **Domain**: Pure TypeScript business logic
- **Infrastructure**: AWS services, database, storage

### Key Technology Stack
- **Frontend**: Next.js 15, React 18.2, TypeScript 5.9
- **Styling**: TailwindCSS 3.4, shadcn/ui components
- **State Management**: React Context, Zustand, Apollo Client
- **API**: GraphQL with AWS AppSync
- **Auth**: AWS Amplify + Cognito
- **Database**: Amazon Aurora (MySQL-compatible)
- **Testing**: Jest, Testing Library, Cypress

### Project Structure
```
/src/ → source code for web app
├── components/          # Reusable UI components (buttons, cards, forms, widgets)
│   ├── ui/            # Base UI components (Button, Input, etc.)
│   ├── layout/        # Layout components (Header, Sidebar, etc.)
│   └── features/      # Feature-specific components
├── pages/             # Next.js page routes
├── hooks/             # Custom React hooks
├── services/          # API services and clients
├── utils/             # Utility functions
├── types/             # TypeScript type definitions
└── styles/            # Global styles and theme
/api/ → GraphQL resolvers / backend API route handlers
/lib/ → domain logic, utilities, business rules
/tests/ → unit and integration tests
/infra/ → infrastructure code / AWS configs / IaC
/docs/ → project documentation, sprint files, ADRs, architecture docs
/public/ → static assets (favicon, icons, etc.)
```

## GraphQL Architecture

### Schema-First Development
1. Define GraphQL schema in `schema.graphql`
2. Generate TypeScript types with codegen
3. Implement resolvers following the schema
4. Use Dataloader for N+1 query optimization

### Core Data Models
- **User**: Profiles, interests, verification levels
- **Trip**: Travel itineraries with dates and locations
- **Connection**: Wave-based relationship system
- **Message**: Real-time messaging between matched users
- **Post**: Social feed content and trip check-ins
- **Report**: Safety and moderation system

### Real-time Features
- **Subscriptions**: GraphQL subscriptions for real-time updates
- **Presence**: Online/offline status tracking
- **Notifications**: In-app and email notifications

## AWS Infrastructure

### Core Services
- **API**: ✅ **Hybrid Architecture** - REST API (API Gateway + Lambda) for Trips, GraphQL (AWS AppSync) for social features
- **Auth**: ✅ Amazon Cognito (user pools & identity pools) with JWT token validation
- **Database**: ✅ DynamoDB with GSI optimization (implemented), Aurora with read replicas (planned)
- **Cache**: Redis ElastiCache for hot queries (planned)
- **Storage**: S3 for media, CloudFront for CDN (planned)
- **Compute**: ✅ Lambda functions (Trips API), ECS Fargate for backend services (planned)

### Implemented Infrastructure (Sprint 2A)
- ✅ **Trips REST API**: Full CRUD operations with AWS API Gateway + Lambda + DynamoDB
- ✅ **Authentication**: Cognito JWT token validation on all endpoints
- ✅ **Performance**: DynamoDB GSI for sub-100ms query performance
- ✅ **Monitoring**: CloudWatch alarms for 5XX errors and Lambda duration
- ✅ **Testing**: Comprehensive test coverage with AWS SDK mocking patterns

### Security Architecture
- **Authentication**: Cognito JWT tokens
- **Authorization**: IAM roles + GraphQL resolvers
- **Data Encryption**: KMS for encryption at rest and in transit
- **Network Security**: VPC with private subnets, WAF

## Coding Style, Conventions & Best Practices

- **TypeScript strict**: no `any` except in rare, documented cases. Enable `strict` mode.  
- **ES Modules** (`import` / `export`) preferred over CommonJS.  
- Components: PascalCase naming; file names should match component names.  
- Utility / helper functions in `/utils/` or `/lib/`. Business logic should live outside UI components.  
- Use GraphQL schema-first. Always update schema, then regenerate types, then implement resolvers.  
- Prevent N+1 in GraphQL resolvers (use data loaders or batching).  
- TailwindCSS + shadcn/ui for styling and design consistency. Use design tokens for spacing/colors.  
- Accessibility should be baked in: use ARIA roles, semantic HTML, keyboard navigation.  
- Code should be well tested: unit tests for logic, component tests for UI, snapshots only for stable UI primitives.  
- e2e tests for major flows (auth, trip creation, matching, messaging, safety flows).

### Testing / Quality Gate Criteria

- Unit tests for all domain logic and resolver functions (target ≥ 80% coverage).  
- Component UI tests: test props, rendering, user interactions.  
- End-to-end (Cypress) tests for important flows: authentication, trip CRUD, matching & waves, messaging, safety (report/block).  
- Maintain build stability: CI must catch breaking changes.  
- Performance benchmarks: feed & map contexts should load under acceptable thresholds (e.g. initial map load <2 seconds; feed load <1 second for first batch).  

### Security & Privacy Rules

- Secrets and credentials must *never* be checked into version control. Use environment variables, AWS IAM roles, Parameter Store or Secrets Manager.  
- Media upload via presigned URLs, enforce file size/type restrictions.  
- Validate all inputs at API boundary (schema validation via Zod or similar).  
- Auth & Authorization: ensure operations are allowed only for the user (e.g. user cannot modify someone else's profile).  
- Location data: default to city-level; more precise location only with user consent.  
- Reporting & moderation flows must handle abuse or malicious usage.  

## Git / Branching / Pull Request Workflow

- Branch naming: `feature/S##-T##-short-description` or `bugfix/S##-T##-short-description`. Matches sprint & task ids.  
- Commit messages should follow Conventional Commits pattern (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`).  
- Every PR must link to one (or more) sprint/task IDs. Use issue references (`closes #123`).  
- PRs must pass CI: lint, typecheck, tests, codegen.  
- Code review required before merge. Use pull-request template.  

## What to Avoid / Known Pitfalls

- Avoid "fat" GraphQL queries that fetch many unnecessary fields → causes over-fetching.  
- Avoid tightly coupling UI to specific data shapes—if schema changes, minimize breakage.  
- Don't skip writing tests because deadline. Tests save effort in the long run.  
- Avoid large monolithic resolvers. Break logic into smaller functions for readability and testability.  
- Avoid side effects in components; side effect logic should be in service or domain layer.  

## Interaction with Claude / Usage Tips

- Reference sprint & task IDs when asking for code or changes (e.g. "Implement S4-T5: chat image upload").  
- Before coding features, ask Claude to review relevant ADRs (`/docs/adr`) to ensure alignment.  
- If Claude produces code that violates style or rules here, call out explicitly and request revision.  
- Periodically review this file and update it when new conventions, tools, or patterns become standard (e.g. after Sprint 3, new rules about component structure might emerge).  

## Reminders & Critical Rules (YOU MUST FOLLOW)

- Always update GraphQL schema first, then types, then resolvers.  
- No skipping of CI checks. If lint fails, PR is not ready.  
- Branch names & issue linking must follow the sprint/task structure.  
- Safety & verification flows are non-negotiable: users must be able to report, block, verify.

## Sprint Development

### Current Sprint Structure
- **Sprint 1**: ✅ Foundations & Authentication (Completed)
- **Sprint 2A**: ✅ Trips Backend Infrastructure (Completed)
- **Sprint 2B**: ✅ Frontend Trip Features (Completed)
  - ✅ User Discovery & Search (Advanced location-based search with 150+ mock users)
  - ✅ Trip Template System (10 diverse templates with rich metadata)
  - ✅ Trip Itinerary Management (Native drag-and-drop, full CRUD)
- **Sprint 3**: Matching & Connections (Next)
- **Sprint 4**: Messaging & Feed
- **Sprint 5**: Safety & Scaling
- **Sprint 6**: Polish & Internationalization

### Task Management
- Use GitHub issue templates for bugs, features, and tasks
- Follow sprint checklists in `/docs/sprints/`
- Update sprint files with progress and completion status
- Link PRs to issues using `closes #123` format

## Key Dependencies

### Core Libraries
- `@aws-amplify/ui-react`: AWS Amplify UI components
- `@apollo/client`: GraphQL client
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
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key

# Authentication
COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
COGNITO_CLIENT_ID=your-client-id
COGNITO_IDENTITY_POOL_ID=us-east-1:XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX

# GraphQL API
GRAPHQL_ENDPOINT=https://xxxxxxxxxxxxxxxx.appsync-api.us-east-1.amazonaws.com/graphql

# Google Maps
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

## Important Notes

- This project follows schema-first GraphQL development
- All authentication flows use AWS Cognito
- Real-time features leverage GraphQL subscriptions
- The architecture is designed for millions of concurrent users
- Safety and moderation are core requirements
- Mobile app integration is planned with shared GraphQL schema