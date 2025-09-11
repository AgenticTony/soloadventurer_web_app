# Security Standards

## Secret Management

### Environment Variables
- **Never commit secrets** to version control
- Use AWS Systems Manager Parameter Store or Amplify environment variables
- All secrets must be encrypted at rest and in transit
- Use short-lived credentials where possible

### AWS Secrets Management
```typescript
// Good: Use Amplify for environment variables
const config = {
  aws_project_region: process.env.AWS_REGION,
  aws_cognito_identity_pool_id: process.env.COGNITO_IDENTITY_POOL_ID,
  aws_cognito_user_pool_id: process.env.COGNITO_USER_POOL_ID,
};

// Bad: Hardcoded credentials
const config = {
  aws_access_key_id: 'AKIA...',
  aws_secret_access_key: 'secret...',
};
```

## Authentication & Authorization

### JWT Token Management
```typescript
// Good: Secure token storage
export const AuthProvider: React.FC = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);

  // Use httpOnly cookies for production
  const login = async (email: string, password: string) => {
    const response = await api.login(email, password);
    // Token should be set in httpOnly cookie by backend
    setToken(response.token);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Bad: Store tokens in localStorage
localStorage.setItem('token', jwtToken); // Vulnerable to XSS
```

### Route Protection
```typescript
// Good: Route guard with proper authentication
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'admin';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole = 'user',
}) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole === 'admin' && user?.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
```

## Input Validation

### GraphQL Input Validation
```typescript
// Good: Validate all inputs with Zod
const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[a-z]/, 'Password must contain lowercase letter')
    .regex(/[0-9]/, 'Password must contain number'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  interests: z.array(z.string()).optional(),
});

export const createUserResolver = async (
  _: any,
  { input }: { input: CreateUserInput }
) => {
  const validatedInput = createUserSchema.parse(input);
  // Proceed with validated input
};
```

### File Upload Security
```typescript
// Good: Secure file upload handling
export const uploadAvatar = async (file: File): Promise<string> => {
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.');
  }

  // Validate file size (2MB max)
  const maxSize = 2 * 1024 * 1024; // 2MB
  if (file.size > maxSize) {
    throw new Error('File size must be less than 2MB');
  }

  // Generate secure filename
  const fileExtension = file.name.split('.').pop();
  const secureFileName = `${uuidv4()}.${fileExtension}`;

  // Upload to S3 with presigned URL
  const presignedUrl = await getPresignedUrl(secureFileName, file.type);
  await uploadToS3(presignedUrl, file);

  return secureFileName;
};
```

## API Security

### GraphQL Security Best Practices
```typescript
// Good: Implement rate limiting and depth limiting
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    // Validate authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      throw new AuthenticationError('Authentication required');
    }
    
    return { user: verifyToken(token) };
  },
  plugins: [
    // Rate limiting plugin
    new RateLimitPlugin({
      identify: (context) => context.user.id,
      max: 100, // 100 requests per minute
      window: '1m',
    }),
    // Query depth limiting
    new DepthLimitPlugin(5), // Max query depth of 5
  ],
});
```

### CORS Configuration
```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://solo-adventurer.com' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
        ],
      },
    ];
  },
};
```

## Data Protection

### Sensitive Data Handling
```typescript
// Good: Never log sensitive data
const logUserAction = (userId: string, action: string) => {
  logger.info('User action', {
    userId, // OK: User ID is not sensitive
    action,
    timestamp: new Date().toISOString(),
    // Never log passwords, tokens, or personal data
  });
};

// Bad: Logging sensitive data
logger.info('User login', {
  email: user.email, // Sensitive PII
  password: user.password, // Extremely sensitive
  token: user.token, // Sensitive authentication token
});
```

### Data Encryption
```typescript
// Good: Encrypt sensitive data at rest
import { encrypt, decrypt } from '@/utils/encryption';

const storeUserData = async (userData: UserData) => {
  const encryptedData = {
    ...userData,
    // Encrypt sensitive fields
    phoneNumber: encrypt(userData.phoneNumber),
    emergencyContact: encrypt(userData.emergencyContact),
  };
  
  await database.store('users', encryptedData);
};

const retrieveUserData = async (userId: string) => {
  const encryptedData = await database.get('users', userId);
  return {
    ...encryptedData,
    phoneNumber: decrypt(encryptedData.phoneNumber),
    emergencyContact: decrypt(encryptedData.emergencyContact),
  };
};
```

## XSS Prevention

### React XSS Protection
```typescript
// Good: Use React's built-in XSS protection
const UserPost: React.FC<{ post: Post }> = ({ post }) => {
  return (
    <div className="post">
      <h3>{post.title}</h3>
      {/* React automatically escapes content */}
      <p>{post.content}</p>
      {/* For HTML content, use DOMPurify */}
      <div 
        dangerouslySetInnerHTML={{ 
          __html: DOMPurify.sanitize(post.htmlContent) 
        }} 
      />
    </div>
  );
};

// Bad: Directly injecting HTML
const BadComponent = ({ content }) => (
  <div dangerouslySetInnerHTML={{ __html: content }} /> // XSS risk
);
```

### Content Security Policy
```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self'",
              "connect-src 'self' https://api.solo-adventurer.com",
              "frame-ancestors 'none'",
              "form-action 'self'",
            ].join('; '),
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};
```

## SQL Injection Prevention

### Parameterized Queries
```typescript
// Good: Use parameterized queries
const getUserTrips = async (userId: string, limit: number) => {
  const query = `
    SELECT * FROM trips 
    WHERE user_id = ? 
    ORDER BY created_at DESC 
    LIMIT ?
  `;
  
  const [trips] = await database.execute(query, [userId, limit]);
  return trips;
};

// Bad: String concatenation (SQL injection risk)
const getUserTrips = async (userId: string, limit: number) => {
  const query = `SELECT * FROM trips WHERE user_id = '${userId}' LIMIT ${limit}`;
  // Vulnerable to SQL injection
  return await database.execute(query);
};
```

## CSRF Protection

### CSRF Token Implementation
```typescript
// Good: Implement CSRF protection
const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  const csrfToken = req.cookies['XSRF-TOKEN'];
  const requestToken = req.headers['x-xsrf-token'];
  
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
    if (!csrfToken || !requestToken || csrfToken !== requestToken) {
      return res.status(403).json({ error: 'Invalid CSRF token' });
    }
  }
  
  next();
};

// Set CSRF token in cookie
app.use((req, res, next) => {
  if (!req.cookies['XSRF-TOKEN']) {
    const token = generateCSRFToken();
    res.cookie('XSRF-TOKEN', token, {
      httpOnly: false, // Allow JavaScript to read
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
  }
  next();
});
```

## Security Testing

### Security Test Cases
```typescript
// File: tests/security/auth.test.ts
describe('Authentication Security', () => {
  it('should reject invalid JWT tokens', async () => {
    const invalidToken = 'invalid.token.here';
    const response = await request(app)
      .get('/api/me')
      .set('Authorization', `Bearer ${invalidToken}`);
    
    expect(response.status).toBe(401);
  });

  it('should enforce rate limiting on login attempts', async () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123',
    };

    // Make 10 requests quickly
    const requests = Array(10).fill().map(() => 
      request(app).post('/api/login').send(loginData)
    );

    const responses = await Promise.all(requests);
    const lastResponse = responses[responses.length - 1];
    
    expect(lastResponse.status).toBe(429); // Too Many Requests
  });

  it('should validate file upload types', async () => {
    const maliciousFile = Buffer.from('malicious content');
    const response = await request(app)
      .post('/api/upload')
      .attach('file', maliciousFile, 'malicious.exe');
    
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Invalid file type');
  });
});
```

## Security Monitoring

### Security Event Logging
```typescript
// Good: Log security events
const securityLogger = {
  logAuthenticationAttempt: (email: string, success: boolean, ip: string) => {
    logger.info('Authentication attempt', {
      type: 'auth',
      email: success ? email : 'REDACTED', // Redact email on failure
      success,
      ip,
      timestamp: new Date().toISOString(),
      userAgent: 'REDACTED', // Don't log user agent
    });
  },

  logSecurityEvent: (eventType: string, userId: string, details: any) => {
    logger.warn('Security event', {
      type: eventType,
      userId,
      details,
      timestamp: new Date().toISOString(),
    });
  },
};

// Usage
securityLogger.logAuthenticationAttempt(
  email,
  isAuthenticated,
  request.ip
);
```

## Incident Response

### Security Incident Response Plan
1. **Detection**: Monitor security events and alerts
2. **Assessment**: Evaluate impact and scope
3. **Containment**: Isolate affected systems
4. **Eradication**: Remove threats and vulnerabilities
5. **Recovery**: Restore normal operations
6. **Lessons Learned**: Update security measures

### Security Checklist
- [ ] Regular security audits and penetration testing
- [ ] Dependency vulnerability scanning
- [ ] Security training for all developers
- [ ] Incident response plan documented and tested
- [ ] Regular backup and restore testing
- [ ] Security headers properly configured
- [ ] Input validation on all user inputs
- [ ] Proper authentication and authorization
- [ ] Secure password storage and handling
- [ ] Regular security updates and patching