# Architecture Standards

**SoloAdventurer Web App**

This document defines the architectural standards and patterns used in the SoloAdventurer web application.

---

## 🏗 Clean Architecture

### Architecture Layers

1. **Presentation Layer (UI)**
   - Next.js components and pages
   - React hooks for state management
   - User interactions and UI logic
   - Form handling and validation

2. **Application Layer**
   - Business logic and use cases
   - API service orchestration
   - Data transformation and formatting
   - State management (React Context, Zustand)

3. **Domain Layer**
   - Core business entities and rules
   - Domain models and value objects
   - Business validation logic
   - Pure TypeScript functions

4. **Infrastructure Layer**
   - External service integrations
   - Database access and repositories
   - API clients and GraphQL resolvers
   - File storage and caching

### Dependency Flow

```
┌─────────────────┐
│  Presentation   │
│     (UI Layer)   │
└─────────────────┘
         ↓
┌─────────────────┐
│   Application   │
│    (Business)    │
└─────────────────┘
         ↓
┌─────────────────┐
│     Domain      │
│   (Core Logic)   │
└─────────────────┘
         ↓
┌─────────────────┐
│ Infrastructure  │
│  (External I/O)  │
└─────────────────┘
```

**Rule**: Dependencies should only flow inward. Infrastructure depends on Domain, not the other way around.

---

## 📁 Project Structure

### Source Code Organization

```
src/
├── components/          # Reusable UI components
│   ├── ui/            # Base shadcn/ui components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Modal.tsx
│   ├── layout/        # Layout components
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   └── features/      # Feature-specific components
│       ├── auth/
│       │   ├── LoginForm.tsx
│       │   ├── SignupForm.tsx
│       │   └── ProfileCard.tsx
│       ├── trips/
│       │   ├── TripCard.tsx
│       │   ├── TripForm.tsx
│       │   └── TripMap.tsx
│       └── chat/
│           ├── ChatWindow.tsx
│           ├── MessageList.tsx
│           └── MessageInput.tsx
├── pages/             # Next.js page routes
│   ├── dashboard/
│   ├── trips/
│   ├── profile/
│   └── chat/
├── hooks/             # Custom React hooks
│   ├── useAuth.ts
│   ├── useTrips.ts
│   ├── useChat.ts
│   └── useDebounce.ts
├── services/          # API services and clients
│   ├── auth/
│   ├── trips/
│   ├── chat/
│   └── aws/
├── utils/             # Utility functions
│   ├── validation.ts
│   ├── formatting.ts
│   ├── dateUtils.ts
│   └── constants.ts
├── types/             # TypeScript type definitions
│   ├── auth.ts
│   ├── trips.ts
│   ├── chat.ts
│   └── api.ts
└── styles/            # Global styles and theme
    ├── globals.css
    └── theme.ts
```

### Component Organization Principles

1. **Single Responsibility**: Each component should have one clear purpose
2. **Composition**: Build complex UIs from simple, reusable components
3. **Presentational vs Container**: Separate UI from business logic
4. **Feature-based organization**: Group components by feature, not type

---

## 🔧 GraphQL Architecture

### Schema-First Development

1. **Define Schema**: Write GraphQL schema in `schema.graphql`
2. **Generate Types**: Use codegen to generate TypeScript types
3. **Implement Resolvers**: Write resolver functions following the schema
4. **Optimize Queries**: Use DataLoader for N+1 prevention

### Schema Organization

```
schema.graphql
├── types/           # Core types (User, Trip, Message, etc.)
├── queries/         # Query operations
├── mutations/       # Mutation operations
├── subscriptions/   # Real-time subscriptions
└── inputs/          # Input types for mutations
```

### Data Models

#### Core Entities
- **User**: Profiles, interests, verification levels
- **Trip**: Travel itineraries with dates and locations
- **Connection**: Wave-based relationship system
- **Message**: Real-time messaging between matched users
- **Post**: Social feed content and trip check-ins
- **Report**: Safety and moderation system

#### Relationships
- User → Trip (one-to-many)
- User → Connection (many-to-many)
- Connection → Message (one-to-many)
- User → Post (one-to-many)
- User → Report (one-to-many)

---

## 🔄 State Management

### State Management Strategy

1. **Local State**: React useState for component-level state
2. **Global State**: React Context for app-wide state
3. **Server State**: Apollo Client for API data
4. **URL State**: Next.js router for navigation state
5. **Persistent State**: localStorage for user preferences

### Context Providers

```typescript
// Main providers structure
<AuthProvider>
  <ThemeProvider>
    <ToastProvider>
      <ModalProvider>
        <QueryProvider>
          {/* App Content */}
        </QueryProvider>
      </ModalProvider>
    </ToastProvider>
  </ThemeProvider>
</AuthProvider>
```

---

## 🎨 UI/UX Patterns

### Design System

1. **Component Library**: shadcn/ui components as base
2. **Design Tokens**: CSS variables for consistent theming
3. **Responsive Design**: Mobile-first approach
4. **Accessibility**: WCAG 2.1 AA compliance
5. **Animation**: Framer Motion for micro-interactions

### Component Patterns

#### Presentational Components
- Pure UI components
- No business logic
- Receive props and render UI
- Examples: Button, Input, Card

#### Container Components
- Handle business logic
- Manage state and side effects
- Pass data to presentational components
- Examples: UserProfile, TripList, ChatWindow

#### Higher-Order Components
- Cross-cutting concerns
- Authentication and authorization
- Error boundaries and loading states
- Examples: withAuth, withErrorBoundary

---

## 🌐 API Integration

### GraphQL Client Configuration

```typescript
// Apollo Client setup
const client = new ApolloClient({
  link: ApolloLink.from([
    errorLink,
    authLink,
    httpLink,
    subscriptionLink,
  ]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // Field policies for cache management
        },
      },
    },
  }),
});
```

### API Service Pattern

```typescript
// Service organization
services/
├── auth/
│   ├── authService.ts
│   ├── auth.types.ts
│   └── auth.utils.ts
├── trips/
│   ├── tripService.ts
│   ├── trip.types.ts
│   └── trip.utils.ts
└── chat/
    ├── chatService.ts
    ├── chat.types.ts
    └── chat.utils.ts
```

---

## 🔒 Security Architecture

### Authentication Flow

1. **User Registration**: Cognito sign-up with email verification
2. **Login**: Cognito authentication with JWT tokens
3. **Session Management**: Token refresh and storage
4. **Protected Routes**: Middleware for route protection
5. **Authorization**: Role-based access control

### Data Security

- **Encryption**: KMS for sensitive data at rest
- **Validation**: Zod schemas for input validation
- **Sanitization**: DOMPurify for user-generated content
- **CORS**: Restricted to trusted domains
- **Rate Limiting**: API endpoint protection

---

## 📊 Performance Optimization

### Frontend Performance

1. **Code Splitting**: Next.js automatic code splitting
2. **Image Optimization**: Next.js Image component
3. **Bundle Analysis**: Regular bundle size monitoring
4. **Caching Strategy**: Browser and CDN caching
5. **Lazy Loading**: Components and images on demand

### Backend Performance

1. **Database Indexing**: Proper query optimization
2. **Caching Layer**: Redis for hot queries
3. **Connection Pooling**: Efficient database connections
4. **Query Optimization**: GraphQL query analysis
5. **Load Balancing**: Multiple application instances

---

## 🧪 Testing Strategy

### Testing Pyramid

```
         ┌─────────────┐
         │  E2E Tests  │  ← 10%
         │  (Cypress)  │
    ┌─────────────┐
    │ Integration │  ← 20%
    │   Tests     │
┌─────────────┐
│  Unit Tests │  ← 70%
│   (Jest)    │
└─────────────┘
```

### Test Organization

```
tests/
├── unit/           # Unit tests
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── utils/
├── integration/    # Integration tests
│   ├── auth/
│   ├── trips/
│   └── chat/
└── e2e/           # End-to-end tests
    ├── auth.spec.ts
    ├── trips.spec.ts
    └── chat.spec.ts
```

---

## 🚀 Deployment Architecture

### Environment Strategy

1. **Development**: Local development with hot reload
2. **Staging**: Production-like environment for testing
3. **Production**: Live production environment
4. **Feature Flags**: Gradual feature rollout

### CI/CD Pipeline

1. **Code Quality**: ESLint, TypeScript, Prettier
2. **Testing**: Unit, integration, and E2E tests
3. **Build**: Production build and optimization
4. **Deploy**: Automated deployment to environments
5. **Monitor**: Performance and error tracking

---

## 📈 Monitoring & Observability

### Application Monitoring

1. **Performance**: Core Web Vitals tracking
2. **Errors**: Sentry error tracking
3. **Analytics**: User behavior analytics
4. **Health Checks**: Application health monitoring
5. **Logging**: Structured logging with correlation IDs

### Infrastructure Monitoring

1. **AWS CloudWatch**: Metrics and logs
2. **CloudFront**: CDN performance
3. **RDS**: Database performance
4. **ElastiCache**: Redis performance
5. **CloudFormation**: Infrastructure as Code monitoring

---

**Last Updated**: [Date]  
**Maintained By**: Tech Lead  
**Review Frequency**: Quarterly