# Code Style Standards

## TypeScript Standards

### Strict Mode Configuration
- Always use TypeScript strict mode
- No implicit `any` types allowed
- Enable `noImplicitReturns` and `noFallthroughCasesInSwitch`
- Use `exactOptionalPropertyTypes` for better type safety

### Type Definitions
```typescript
// Good
interface UserProfile {
  id: string;
  name: string;
  bio?: string; // Optional with explicit ?
  avatar: string | null; // Explicit null for missing values
}

// Bad
interface UserProfile {
  id: string;
  name: string;
  bio; // Missing type annotation
  avatar: string; // Doesn't handle null case
}
```

### Function Signatures
```typescript
// Good
const calculateDistance = (
  pointA: { lat: number; lng: number },
  pointB: { lat: number; lng: number }
): number => {
  // Implementation
};

// Bad
function calculateDistance(pointA, pointB) {
  // Missing types
}
```

## React Standards

### Component Patterns
```typescript
// Good: Functional component with explicit props
interface UserCardProps {
  user: UserProfile;
  onWave?: (userId: string) => void;
  className?: string;
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  onWave,
  className = ''
}) => {
  return (
    <div className={`user-card ${className}`}>
      {/* Component content */}
    </div>
  );
};

// Bad: Component without proper typing
export const UserCard = (props) => {
  // Untyped props
};
```

### Custom Hooks
```typescript
// Good: Custom hook with proper typing
interface UseAuthReturn {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuth = (): UseAuthReturn => {
  // Hook implementation
};
```

## ESLint Configuration

### Required Rules
```javascript
module.exports = {
  rules: {
    // TypeScript
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'error',
    
    // React
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/prop-types': 'off', // Use TypeScript instead
    
    // Import ordering
    'import/order': ['error', {
      'groups': [
        'builtin',
        'external',
        'internal',
        'parent',
        'sibling',
        'index'
      ]
    }],
    
    // Code quality
    'no-console': 'warn',
    'no-debugger': 'error',
    'prefer-const': 'error',
    'no-var': 'error'
  }
};
```

## File Naming Conventions

### Component Files
- PascalCase: `UserProfile.tsx`, `TripCard.tsx`
- Index files: `components/Profile/index.tsx`

### Utility Files
- camelCase: `dateUtils.ts`, `apiClient.ts`
- Test files: `dateUtils.test.ts`, `apiClient.test.ts`

### Type Files
- camelCase: `userTypes.ts`, `tripTypes.ts`
- Or PascalCase: `UserTypes.ts`, `TripTypes.ts`

## Import Organization

### Import Order
```typescript
// 1. Third-party imports
import React from 'react';
import { useQuery } from '@apollo/client';

// 2. Internal imports (absolute paths)
import { useAuth } from '@/hooks/useAuth';
import { UserProfile } from '@/types/userTypes';

// 3. Relative imports
import { formatDate } from './utils/dateUtils';
import styles from './ProfileCard.module.css';

// 4. Type-only imports
import type { ApolloError } from '@apollo/client';
```

### Path Aliases
```typescript
// Use absolute paths with @ alias
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

// Avoid relative imports beyond same directory
import { utils } from '../../../helpers/utils'; // Bad
import { utils } from '@/helpers/utils'; // Good
```

## CSS and Styling

### TailwindCSS Conventions
```typescript
// Good: Utility-first approach
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
  <h3 className="text-lg font-semibold text-gray-900">Title</h3>
  <Button variant="primary">Action</Button>
</div>

// Bad: Custom CSS classes
<div className="profile-header">
  <h3 className="profile-title">Title</h3>
  <Button className="profile-action">Action</Button>
</div>
```

### Component Styles
```typescript
// Component-specific CSS modules
import styles from './ProfileCard.module.css';

const ProfileCard: React.FC<ProfileCardProps> = ({ user }) => {
  return (
    <div className={styles.container}>
      <img src={user.avatar} alt={user.name} className={styles.avatar} />
      <h3 className={styles.name}>{user.name}</h3>
    </div>
  );
};
```

## Code Quality

### Error Handling
```typescript
// Good: Proper error handling
const fetchUserData = async (userId: string): Promise<UserProfile> => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch user: ${error.message}`);
    }
    throw new Error('Unknown error occurred');
  }
};

// Bad: Silent errors
const fetchUserData = async (userId: string) => {
  const response = await api.get(`/users/${userId}`); // No error handling
  return response.data;
};
```

### Async/Await Patterns
```typescript
// Good: Proper async handling
const loadUserData = async () => {
  setLoading(true);
  try {
    const user = await fetchUserData(userId);
    setUser(user);
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};

// Bad: Mixed promise styles
const loadUserData = () => {
  setLoading(true);
  fetchUserData(userId)
    .then(user => setUser(user))
    .catch(error => setError(error.message))
    .finally(() => setLoading(false));
};
```

## Testing Standards

### Test File Structure
```typescript
// Component test
import { render, screen } from '@testing-library/react';
import { UserProfile } from './UserProfile';

describe('UserProfile', () => {
  it('renders user information', () => {
    const user = { name: 'John Doe', email: 'john@example.com' };
    render(<UserProfile user={user} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
```

### Test Naming
- Use `describe` for grouping tests
- Use `it` or `test` for individual test cases
- Use descriptive test names that explain the behavior
- Group tests by feature or component

## Documentation Standards

### JSDoc Comments
```typescript
/**
 * Calculates the distance between two geographic points
 * @param pointA - First coordinate point
 * @param pointB - Second coordinate point
 * @returns Distance in kilometers
 * @throws {Error} If coordinates are invalid
 */
export const calculateDistance = (
  pointA: Coordinate,
  pointB: Coordinate
): number => {
  // Implementation
};
```

### Component Documentation
```typescript
interface UserProfileProps {
  /** The user's profile information */
  user: UserProfile;
  /** Callback when user clicks wave button */
  onWave?: (userId: string) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Displays user profile information with wave functionality
 * @example
 * <UserProfile 
 *   user={user} 
 *   onWave={handleWave} 
 *   className="custom-profile"
 * />
 */
export const UserProfile: React.FC<UserProfileProps> = ({
  user,
  onWave,
  className = ''
}) => {
  // Implementation
};
```