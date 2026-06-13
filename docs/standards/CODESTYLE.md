# Code Style Guide

**SoloAdventurer Web App**

This document defines the coding standards and style guidelines for the SoloAdventurer project.

---

## 📝 General Principles

### Code Quality Goals

- **Readable**: Code should be self-documenting and easy to understand
- **Maintainable**: Easy to modify and extend
- **Testable**: Code should be easy to unit test
- **Performant**: Efficient without premature optimization
- **Secure**: Follow security best practices

### Guiding Philosophy

> "Code is written once but read many times. Prioritize clarity over cleverness."

---

## 🎨 TypeScript Standards

### Strict Mode Configuration

- Always use TypeScript strict mode
- No `any` types unless absolutely necessary (with documentation)
- Enable all strict type checking options
- Use explicit return types for functions

### Type Definitions

```typescript
// ✅ Good - Explicit interfaces
interface User {
  id: string
  email: string
  name: string
  avatar?: string // Optional property
  createdAt: Date
}

// ✅ Good - Type aliases for simple types
type UserId = string
type TripStatus = 'draft' | 'published' | 'archived'

// ❌ Avoid - Inline complex types
function processUser(user: { id: string; name: string; email: string }) {
  // ...
}
```

### Function Signatures

```typescript
// ✅ Good - Explicit parameter and return types
function calculateDistance(
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number {
  // Implementation
}

// ✅ Good - Async functions with proper typing
async function fetchUser(id: UserId): Promise<User> {
  const response = await api.get(`/users/${id}`)
  return response.data
}

// ❌ Avoid - Implicit any or missing return types
function processData(data) {
  return data.map(item => item.value)
}
```

---

## 🧱 React Component Standards

### Component Structure

```typescript
// ✅ Good - Well-structured component
interface UserProfileProps {
  user: User;
  onEdit?: (user: User) => void;
  className?: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  user,
  onEdit,
  className = '',
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = useCallback(() => {
    onEdit?.(user);
    setIsEditing(false);
  }, [user, onEdit]);

  return (
    <div className={`user-profile ${className}`}>
      <img src={user.avatar} alt={user.name} className="avatar" />
      <div className="user-info">
        <h2>{user.name}</h2>
        <p>{user.email}</p>
      </div>
      {onEdit && (
        <button onClick={handleEdit} className="edit-button">
          Edit Profile
        </button>
      )}
    </div>
  );
};
```

### Component Organization

1. **Imports**: Group and organize imports
2. **Type Definitions**: Component props and types
3. **Component**: Main component function
4. **Hooks**: Custom hooks and React hooks
5. **Handlers**: Event handlers and utility functions
6. **Effects**: useEffect hooks
7. **Return**: JSX return statement

### Hooks Best Practices

```typescript
// ✅ Good - Custom hook with proper typing
interface UseAuthReturn {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null)

  const login = useCallback(async (email: string, password: string) => {
    // Login logic
  }, [])

  const logout = useCallback(() => {
    // Logout logic
  }, [])

  return {
    user,
    isAuthenticated: !!user,
    login,
    logout,
  }
}
```

---

## 🎯 GraphQL Standards

### Schema Organization

```graphql
# schema.graphql
type User {
  id: ID!
  email: String!
  name: String!
  avatar: String
  createdAt: AWSDateTime!
  updatedAt: AWSDateTime!
}

type Query {
  me: User
  user(id: ID!): User
  users(filter: UserFilter, limit: Int, offset: Int): UserConnection
}

type Mutation {
  updateProfile(input: UpdateProfileInput!): User
  uploadAvatar(file: Upload!): String!
}

input UpdateProfileInput {
  name: String
  bio: String
  location: String
}
```

### Query Patterns

```typescript
// ✅ Good - Typed GraphQL queries
const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      email
      name
      avatar
      createdAt
    }
  }
`;

interface GetUserVariables {
  id: string;
}

interface GetUserData {
  user: User;
}

// ✅ Good - Using useQuery hook with proper typing
const UserProfile: React.FC<{ userId: string }> = ({ userId }) => {
  const { data, loading, error } = useQuery<GetData, GetUserVariables>(
    GET_USER,
    { variables: { id: userId } }
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return <UserProfileCard user={data!.user} />;
};
```

---

## 🎨 Styling Standards

### TailwindCSS Patterns

```typescript
// ✅ Good - Consistent utility usage
<div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-md border border-gray-200">
  <h3 className="text-lg font-semibold text-gray-900 mb-2">Card Title</h3>
  <p className="text-sm text-gray-600">Card description</p>
</div>

// ✅ Good - Component-specific classes with CSS variables
<div className="trip-card">
  <div className="trip-card__header">
    <h3 className="trip-card__title">{title}</h3>
    <span className="trip-card__date">{formatDate(date)}</span>
  </div>
  <div className="trip-card__content">
    <p className="trip-card__description">{description}</p>
  </div>
</div>
```

### CSS Custom Properties

```css
/* globals.css */
:root {
  --color-primary: 326 100% 74%;
  --color-primary-foreground: 210 40% 98%;
  --color-secondary: 210 40% 96%;
  --color-secondary-foreground: 222 84% 5%;
  --color-background: 0 0% 100%;
  --color-foreground: 222 84% 5%;

  --radius: 0.5rem;
  --spacing: 0.25rem;
}

.dark {
  --color-background: 222 84% 5%;
  --color-foreground: 210 40% 98%;
}
```

---

## 📁 File Organization

### Naming Conventions

```
✅ PascalCase for components:          UserProfile, TripCard
✅ camelCase for files:                userProfile.tsx, tripCard.tsx
✅ camelCase for functions/variables:  calculateDistance, userCount
✅ SCREAMING_SNAKE_CASE for constants: MAX_USERS, API_BASE_URL
✅ kebab-case for CSS classes:         user-profile, trip-card
✅ kebab-case for directories:        user-profile/, trip-components/
```

### Directory Structure

```
src/
├── components/
│   ├── ui/                    # Base UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Modal.tsx
│   ├── layout/                # Layout components
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   └── features/              # Feature-specific components
│       ├── auth/
│       │   ├── LoginForm.tsx
│       │   ├── SignupForm.tsx
│       │   └── ProfileCard.tsx
│       └── trips/
│           ├── TripCard.tsx
│           ├── TripForm.tsx
│           └── TripMap.tsx
```

---

## 🔧 Utility Functions

### Validation Patterns

```typescript
// ✅ Good - Zod schema validation
import { z } from 'zod'

const UserProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  location: z.string().optional(),
})

type UserProfileInput = z.infer<typeof UserProfileSchema>

const validateUserProfile = (data: unknown): UserProfileInput => {
  return UserProfileSchema.parse(data)
}
```

### Utility Functions

```typescript
// ✅ Good - Pure utility functions
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  // Haversine formula implementation
  const R = 6371 // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
```

---

## 🧪 Testing Standards

### Unit Tests

```typescript
// ✅ Good - Well-structured unit tests
describe('calculateDistance', () => {
  it('calculates distance between two points correctly', () => {
    const distance = calculateDistance(40.7128, -74.006, 34.0522, -118.2437)
    expect(distance).toBeCloseTo(3935.75, 2) // NYC to LA in km
  })

  it('returns 0 for same coordinates', () => {
    const distance = calculateDistance(40.7128, -74.006, 40.7128, -74.006)
    expect(distance).toBe(0)
  })
})
```

### Component Tests

```typescript
// ✅ Good - Component testing with Testing Library
describe('UserProfile', () => {
  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    name: 'John Doe',
    avatar: 'https://example.com/avatar.jpg',
    createdAt: new Date(),
  };

  it('renders user information correctly', () => {
    render(<UserProfile user={mockUser} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByAltText('John Doe')).toHaveAttribute('src', mockUser.avatar);
  });

  it('calls onEdit when edit button is clicked', () => {
    const mockOnEdit = jest.fn();
    render(<UserProfile user={mockUser} onEdit={mockOnEdit} />);

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(mockOnEdit).toHaveBeenCalledWith(mockUser);
  });
});
```

---

## 📝 Documentation Standards

### Code Comments

```typescript
// ✅ Good - JSDoc comments for public APIs
/**
 * Calculates the distance between two geographic coordinates using the Haversine formula.
 * @param lat1 - Latitude of first point in degrees
 * @param lng1 - Longitude of first point in degrees
 * @param lat2 - Latitude of second point in degrees
 * @param lng2 - Longitude of second point in degrees
 * @returns Distance in kilometers
 * @example
 * const distance = calculateDistance(40.7128, -74.0060, 34.0522, -118.2437);
 * console.log(distance); // ~3935.75 km
 */
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  // Implementation
}
```

### TODO Comments

```typescript
// ✅ Good - Structured TODO comments
// TODO: [Sprint-2] Implement Google Maps integration for trip visualization
// TODO: [Security] Add rate limiting for authentication endpoints
// TODO: [Performance] Optimize image loading with lazy loading
```

---

## 🔍 Code Review Checklist

### Before Submitting PR

- [ ] All TypeScript errors are resolved
- [ ] ESLint passes without warnings
- [ ] All tests pass (unit, integration, E2E)
- [ ] Code follows project style guidelines
- [ ] Performance considerations addressed
- [ ] Security implications reviewed
- [ ] Accessibility requirements met
- [ ] Documentation is updated
- [ ] Component is responsive on mobile/desktop

### Performance Considerations

- [ ] Avoid unnecessary re-renders (useMemo, useCallback)
- [ ] Optimize images and assets
- [ ] Implement proper loading states
- [ ] Use code splitting for large components
- [ ] Minimize bundle size impact

### Security Considerations

- [ ] Input validation is implemented
- [ ] XSS prevention measures in place
- [ ] Authentication/authorization checks present
- [ ] Sensitive data is properly handled
- [ ] API calls include proper error handling

---

**Last Updated**: [Date]  
**Enforced By**: ESLint, TypeScript, Prettier  
**Review Frequency**: Quarterly
