# Testing Standards

## Testing Pyramid

### Distribution Strategy
- **60% Unit Tests**: Fast, isolated tests for individual functions and components
- **30% Component Tests**: Tests for React components with mocked dependencies
- **10% E2E Tests**: Full integration tests covering critical user journeys

### Test Goals
- **Coverage**: ≥ 80% for domain logic and GraphQL resolvers
- **Performance**: All tests complete in under 2 minutes
- **Reliability**: Flaky tests are immediately disabled and fixed

## Unit Testing Standards

### Testing Framework
- **Jest**: Test runner and assertion library
- **Testing Library**: For DOM testing utilities
- **msw**: For API mocking

### Test Structure
```typescript
// File: utils/dateUtils.test.ts
import { formatDate, isDateOverlap } from './dateUtils';

describe('dateUtils', () => {
  describe('formatDate', () => {
    it('formats date in YYYY-MM-DD format', () => {
      const date = new Date('2023-12-25T00:00:00.000Z');
      const result = formatDate(date);
      expect(result).toBe('2023-12-25');
    });

    it('handles undefined input', () => {
      const result = formatDate(undefined);
      expect(result).toBe('');
    });
  });

  describe('isDateOverlap', () => {
    it('returns true for overlapping date ranges', () => {
      const range1 = { start: new Date('2023-01-01'), end: new Date('2023-01-10') };
      const range2 = { start: new Date('2023-01-05'), end: new Date('2023-01-15') };
      
      expect(isDateOverlap(range1, range2)).toBe(true);
    });
  });
});
```

### Mocking Best Practices
```typescript
// Good: Mock external dependencies
jest.mock('aws-amplify', () => ({
  Auth: {
    currentAuthenticatedUser: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
  },
}));

// Bad: Mock implementation details
jest.mock('./someModule', () => ({
  someFunction: jest.fn(() => 'mocked result'), // Too specific
}));
```

## Component Testing Standards

### React Component Tests
```typescript
// File: components/UserCard.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserCard } from './UserCard';
import { useAuth } from '@/hooks/useAuth';

// Mock hooks
jest.mock('@/hooks/useAuth');

describe('UserCard', () => {
  const mockUser = {
    id: '123',
    name: 'John Doe',
    avatar: 'avatar.jpg',
    bio: 'Travel enthusiast',
  };

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: '456' },
      isAuthenticated: true,
    });
  });

  it('renders user information correctly', () => {
    render(<UserCard user={mockUser} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Travel enthusiast')).toBeInTheDocument();
    expect(screen.getByAltText('John Doe')).toHaveAttribute('src', 'avatar.jpg');
  });

  it('calls onWave when wave button is clicked', () => {
    const mockOnWave = jest.fn();
    render(<UserCard user={mockUser} onWave={mockOnWave} />);
    
    fireEvent.click(screen.getByRole('button', { name: /wave/i }));
    expect(mockOnWave).toHaveBeenCalledWith('123');
  });

  it('disables wave button for own profile', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: '123' }, // Same as mockUser
      isAuthenticated: true,
    });
    
    render(<UserCard user={mockUser} />);
    expect(screen.getByRole('button', { name: /wave/i })).toBeDisabled();
  });
});
```

### Testing Library Guidelines
- Test behavior, not implementation
- Use semantic queries (`getByRole`, `getByLabelText`)
- Avoid testing internal state
- Use `waitFor` for async operations
- Mock API calls with `msw`

## Integration Testing Standards

### API Integration Tests
```typescript
// File: services/api.test.ts
import { api } from './api';
import { server } from '../mocks/server';

describe('API Service', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe('getUserTrips', () => {
    it('fetches user trips successfully', async () => {
      const mockTrips = [
        { id: '1', destination: 'Paris', startDate: '2023-12-01' },
        { id: '2', destination: 'London', startDate: '2023-12-15' },
      ];

      server.use(
        rest.get('/api/trips', (req, res, ctx) => {
          return res(ctx.json(mockTrips));
        })
      );

      const result = await api.getUserTrips('123');
      expect(result).toEqual(mockTrips);
    });

    it('handles API errors', async () => {
      server.use(
        rest.get('/api/trips', (req, res, ctx) => {
          return res(ctx.status(500), ctx.json({ error: 'Server error' }));
        })
      );

      await expect(api.getUserTrips('123')).rejects.toThrow('Server error');
    });
  });
});
```

## E2E Testing Standards

### Cypress Configuration
```typescript
// File: cypress/e2e/auth.cy.ts
describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('allows user to sign up', () => {
    cy.get('[data-cy="signup-tab"]').click();
    cy.get('[data-cy="email-input"]').type('test@example.com');
    cy.get('[data-cy="password-input"]').type('Password123!');
    cy.get('[data-cy="confirm-password-input"]').type('Password123!');
    cy.get('[data-cy="signup-button"]').click();
    
    cy.url().should('include', '/profile/setup');
    cy.get('[data-cy="welcome-message"]').should('contain', 'Welcome');
  });

  it('allows user to log in', () => {
    cy.get('[data-cy="email-input"]').type('test@example.com');
    cy.get('[data-cy="password-input"]').type('Password123!');
    cy.get('[data-cy="login-button"]').click();
    
    cy.url().should('include', '/dashboard');
    cy.get('[data-cy="user-menu"]').should('contain', 'Test User');
  });

  it('shows validation errors for invalid input', () => {
    cy.get('[data-cy="email-input"]').type('invalid-email');
    cy.get('[data-cy="password-input"]').type('123');
    cy.get('[data-cy="login-button"]').click();
    
    cy.get('[data-cy="email-error"]').should('contain', 'Invalid email');
    cy.get('[data-cy="password-error"]').should('contain', 'Password too short');
  });
});
```

### E2E Best Practices
- Use data attributes for selectors (`data-cy`)
- Test critical user journeys, not edge cases
- Mock external services in E2E tests
- Use realistic test data
- Clean up test data after each test

## GraphQL Testing

### Resolver Tests
```typescript
// File: resolvers/user.resolver.test.ts
import { userResolvers } from './user.resolver';
import { UserService } from '../services/UserService';

jest.mock('../services/UserService');

describe('User Resolvers', () => {
  const mockContext = {
    user: { id: '123', email: 'test@example.com' },
    dataSources: {
      userService: new UserService(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Query: me', () => {
    it('returns current user profile', async () => {
      const mockUser = {
        id: '123',
        name: 'John Doe',
        email: 'test@example.com',
      };

      (mockContext.dataSources.userService.getUserById as jest.Mock)
        .mockResolvedValue(mockUser);

      const result = await userResolvers.Query.me(null, null, mockContext);
      
      expect(result).toEqual(mockUser);
      expect(mockContext.dataSources.userService.getUserById)
        .toHaveBeenCalledWith('123');
    });
  });

  describe('Mutation: updateProfile', () => {
    it('updates user profile successfully', async () => {
      const args = {
        input: {
          name: 'Jane Doe',
          bio: 'Updated bio',
        },
      };

      const updatedUser = {
        id: '123',
        name: 'Jane Doe',
        bio: 'Updated bio',
        email: 'test@example.com',
      };

      (mockContext.dataSources.userService.updateUser as jest.Mock)
        .mockResolvedValue(updatedUser);

      const result = await userResolvers.Mutation.updateProfile(
        null,
        args,
        mockContext
      );
      
      expect(result).toEqual(updatedUser);
      expect(mockContext.dataSources.userService.updateUser)
        .toHaveBeenCalledWith('123', args.input);
    });
  });
});
```

## Test Coverage

### Coverage Configuration
```javascript
// jest.config.js
module.exports = {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    // Higher coverage for critical paths
    './src/domain/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    './src/resolvers/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
    '!src/**/index.ts',
  ],
};
```

## Performance Testing

### Load Testing with k6
```javascript
// File: k6/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 100 },  // Ramp up to 100 users
    { duration: '1m', target: 100 },   // Stay at 100 users
    { duration: '30s', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% of requests < 500ms
    http_req_failed: ['rate<0.01'],    // < 1% errors
  },
};

export default function () {
  const response = http.get('https://api.solo-adventurer.com/graphql');
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  sleep(1);
}
```

## Test Data Management

### Factory Pattern
```typescript
// File: test/factories/userFactory.ts
import { faker } from '@faker-js/faker';

export const userFactory = (overrides = {}) => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
  avatar: faker.image.avatar(),
  bio: faker.lorem.sentence(),
  interests: faker.helpers.arrayElements([
    'hiking', 'photography', 'food', 'culture', 'adventure'
  ], 3),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  ...overrides,
});

// Usage in tests
const mockUser = userFactory({ name: 'John Doe' });
```

## Continuous Integration

### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run linting
        run: npm run lint
        
      - name: Run type checking
        run: npm run typecheck
        
      - name: Run unit tests
        run: npm test -- --coverage --watchAll=false
        
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        
      - name: Run E2E tests
        run: npm run test:e2e
        if: github.event_name == 'push'
```

## Test Environment Setup

### Jest Setup
```javascript
// jest.setup.js
import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};
```