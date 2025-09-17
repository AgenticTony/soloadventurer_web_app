# Security Guidelines

**SoloAdventurer Web App**

This document outlines the security requirements and best practices for the SoloAdventurer project.

---

## 🔐 Security Principles

### Core Security Tenets
1. **Defense in Depth**: Multiple layers of security controls
2. **Least Privilege**: Minimum necessary access permissions
3. **Zero Trust**: Verify everything, trust nothing
4. **Security by Design**: Built-in, not bolted-on security
5. **Fail Securely**: Default to secure state on failure

### Security Goals
- **Confidentiality**: Protect sensitive user data
- **Integrity**: Ensure data accuracy and consistency
- **Availability**: Maintain service uptime and reliability
- **Privacy**: Respect user privacy and data protection

---

## 👥 Authentication & Authorization

### AWS Cognito Configuration

```typescript
// ✅ Secure Cognito configuration
const cognitoConfig = {
  userPoolId: process.env.COGNITO_USER_POOL_ID,
  userPoolClientId: process.env.COGNITO_CLIENT_ID,
  identityPoolId: process.env.COGNITO_IDENTITY_POOL_ID,
  region: process.env.AWS_REGION,
  
  // Security settings
  passwordPolicy: {
    minimumLength: 8,
    requireLowercase: true,
    requireNumbers: true,
    requireUppercase: true,
    requireSymbols: false,
  },
  
  // Advanced security
  advancedSecurityDataCollectionFlag: 'ENABLED',
  
  // MFA configuration
  mfaConfiguration: 'OPTIONAL',
  softwareTokenMfaConfiguration: {
    enabled: true,
  },
};
```

### JWT Token Handling

```typescript
// ✅ Secure JWT token management
interface JwtPayload {
  sub: string;
  email: string;
  'cognito:groups': string[];
  exp: number;
  iat: number;
}

class AuthService {
  private static instance: AuthService;
  
  async login(email: string, password: string): Promise<void> {
    try {
      const { CognitoUser } = await import('@aws-amplify/auth');
      const user = await CognitoUser.signIn(email, password);
      
      // Store tokens securely
      const tokens = user.getSignInUserSession()?.getIdToken().getJwtToken();
      if (tokens) {
        await this.secureStorage.setItem('auth_token', tokens);
      }
    } catch (error) {
      throw new AuthenticationError('Invalid credentials');
    }
  }
  
  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      // Verify JWT signature and claims
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      
      // Check token expiration
      if (decoded.exp * 1000 < Date.now()) {
        throw new AuthenticationError('Token expired');
      }
      
      return decoded;
    } catch (error) {
      throw new AuthenticationError('Invalid token');
    }
  }
}
```

### Protected Routes

```typescript
// ✅ Secure route protection
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  fallback = <Navigate to="/login" replace />,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!isAuthenticated) {
    return <>{fallback}</>;
  }
  
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => 
      user?.groups?.includes(role)
    );
    
    if (!hasRequiredRole) {
      return <UnauthorizedError />;
    }
  }
  
  return <>{children}</>;
};
```

---

## 🛡️ Data Security

### Input Validation

```typescript
// ✅ Comprehensive input validation
import { z } from 'zod';

// User input validation schemas
const UserProfileSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
  
  email: z.string()
    .email('Please enter a valid email address')
    .transform(email => email.toLowerCase().trim()),
  
  bio: z.string()
    .max(500, 'Bio must be less than 500 characters')
    .optional(),
  
  location: z.string()
    .max(100, 'Location must be less than 100 characters')
    .optional(),
  
  birthDate: z.date()
    .max(new Date(), 'Birth date cannot be in the future')
    .min(new Date('1900-01-01'), 'Please enter a valid birth date')
    .optional(),
});

// Sanitization utilities
export const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'u', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href', 'title', 'target'],
  });
};

export const validateUserProfile = (data: unknown): UserProfile => {
  const sanitized = {
    ...data,
    name: data.name ? sanitizeInput(data.name) : undefined,
    bio: data.bio ? sanitizeInput(data.bio) : undefined,
  };
  
  return UserProfileSchema.parse(sanitized);
};
```

### Database Security

```typescript
// ✅ Secure database operations
class UserService {
  async createUser(userData: CreateUserInput): Promise<User> {
    // Hash sensitive data before storage
    const hashedEmail = await this.hashData(userData.email);
    
    const user = await prisma.user.create({
      data: {
        ...userData,
        email: hashedEmail,
        // PII encryption
        personalInfo: userData.personalInfo ? 
          await this.encryptData(userData.personalInfo) : null,
      },
      select: {
        id: true,
        email: false, // Exclude sensitive fields
        name: true,
        createdAt: true,
      },
    });
    
    return user;
  }
  
  private async hashData(data: string): Promise<string> {
    return crypto.createHash('sha256').update(data).digest('hex');
  }
  
  private async encryptData(data: string): Promise<string> {
    const cipher = crypto.createCipher(
      'aes-256-cbc',
      process.env.ENCRYPTION_KEY!
    );
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return encrypted;
  }
}
```

### API Security

```typescript
// ✅ Secure API client configuration
const createApolloClient = (token?: string) => {
  const authLink = setContext((_, { headers }) => {
    const token = localStorage.getItem('auth_token');
    
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
      },
    };
  });
  
  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path }) => {
        console.error(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
        );
      });
    }
    
    if (networkError) {
      console.error(`[Network error]: ${networkError}`);
      // Handle authentication errors
      if (networkError.statusCode === 401) {
        // Redirect to login
        window.location.href = '/login';
      }
    }
  });
  
  return new ApolloClient({
    link: ApolloLink.from([authLink, errorLink, httpLink]),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        errorPolicy: 'all',
      },
      mutate: {
        errorPolicy: 'all',
      },
    },
  });
};
```

---

## 🔒 File Upload Security

### Secure File Upload

```typescript
// ✅ Secure file upload with validation
interface FileUploadOptions {
  maxSize: number; // in bytes
  allowedTypes: string[];
  requireAuth: boolean;
}

export class SecureFileUploader {
  private options: FileUploadOptions;
  
  constructor(options: FileUploadOptions) {
    this.options = {
      maxSize: 5 * 1024 * 1024, // 5MB default
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
      requireAuth: true,
      ...options,
    };
  }
  
  async uploadFile(file: File, userId: string): Promise<string> {
    // Validate file
    this.validateFile(file);
    
    // Generate secure filename
    const secureFilename = this.generateSecureFilename(file, userId);
    
    // Get presigned URL from S3
    const presignedUrl = await this.getPresignedUrl(secureFilename, file.type);
    
    // Upload file directly to S3
    await this.uploadToS3(presignedUrl, file);
    
    return secureFilename;
  }
  
  private validateFile(file: File): void {
    // Check file size
    if (file.size > this.options.maxSize) {
      throw new ValidationError(`File size exceeds ${this.options.maxSize / 1024 / 1024}MB limit`);
    }
    
    // Check file type
    if (!this.options.allowedTypes.includes(file.type)) {
      throw new ValidationError(`File type ${file.type} is not allowed`);
    }
    
    // Check for malicious content
    if (file.type.startsWith('image/')) {
      this.validateImageFile(file);
    }
  }
  
  private generateSecureFilename(file: File, userId: string): string {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(16).toString('hex');
    const extension = file.name.split('.').pop();
    
    return `${userId}/${timestamp}-${randomString}.${extension}`;
  }
  
  private async getPresignedUrl(filename: string, contentType: string): Promise<string> {
    const response = await fetch('/api/upload/presigned', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: JSON.stringify({
        filename,
        contentType,
      }),
    });
    
    if (!response.ok) {
      throw new UploadError('Failed to get presigned URL');
    }
    
    const { url } = await response.json();
    return url;
  }
  
  private async uploadToS3(presignedUrl: string, file: File): Promise<void> {
    const response = await fetch(presignedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
        'x-amz-acl': 'private',
      },
      body: file,
    });
    
    if (!response.ok) {
      throw new UploadError('Failed to upload file to S3');
    }
  }
}
```

---

## 🌐 Web Security

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
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.amazonaws.com https://*.amazoncognito.com",
              "frame-src 'none'",
              "object-src 'none'",
              "base-uri 'self'",
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
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)',
          },
        ],
      },
    ];
  },
};
```

### CSRF Protection

```typescript
// ✅ CSRF token management
class CsrfService {
  private static instance: CsrfService;
  
  async getCsrfToken(): Promise<string> {
    const response = await fetch('/api/csrf-token', {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new SecurityError('Failed to get CSRF token');
    }
    
    const { token } = await response.json();
    return token;
  }
  
  async addCsrfToRequest(url: string, options: RequestInit): Promise<RequestInit> {
    const token = await this.getCsrfToken();
    
    return {
      ...options,
      headers: {
        ...options.headers,
        'X-CSRF-Token': token,
      },
    };
  }
}

// Usage in forms
const csrfService = new CsrfService();

const handleSubmit = async (event: React.FormEvent) => {
  event.preventDefault();
  
  const formData = new FormData(event.target as HTMLFormElement);
  
  const response = await fetch('/api/submit', {
    method: 'POST',
    body: formData,
    ...await csrfService.addCsrfToRequest('/api/submit', {
      credentials: 'include',
    }),
  });
};
```

---

## 🔍 Security Monitoring

### Error Tracking

```typescript
// ✅ Secure error tracking with Sentry
import * as Sentry from '@sentry/nextjs';

// Initialize Sentry with security context
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  
  // Security settings
  beforeSend(event) {
    // Filter out sensitive information
    if (event.request && event.request.headers) {
      delete event.request.headers['Authorization'];
      delete event.request.headers['Cookie'];
    }
    
    // Sanitize URLs
    if (event.request && event.request.url) {
      event.request.url = event.request.url.replace(/token=[^&]*/, 'token=[REDACTED]');
    }
    
    return event;
  },
  
  // Security integrations
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.OnUncaughtException(),
    new Sentry.Integrations.OnUnhandledRejection(),
  ],
});

// Security event logging
export const logSecurityEvent = (event: SecurityEvent): void => {
  Sentry.withScope((scope) => {
    scope.setTag('security', 'true');
    scope.setExtra('event_details', event);
    scope.setLevel(event.severity);
    
    Sentry.captureMessage(event.message, event.severity);
  });
};
```

### Security Headers

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // HSTS (HTTPS only)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.amazonaws.com https://*.amazoncognito.com",
      "frame-src 'none'",
      "object-src 'none'",
    ].join('; ')
  );
  
  return response;
}
```

---

## 🚨 Security Checklist

### Development Security
- [ ] Input validation implemented on all user inputs
- [ ] Output encoding for XSS prevention
- [ ] Secure password handling implemented
- [ ] Session management properly configured
- [ ] Error messages don't leak sensitive information
- [ ] Dependencies are regularly updated and scanned

### Deployment Security
- [ ] Environment variables are properly secured
- [ ] SSL/TLS certificates are valid and configured
- [ ] Security headers are properly set
- [ ] Database connections are encrypted
- [ ] Backup and recovery procedures are in place
- [ ] Logging and monitoring are configured

### Operational Security
- [ ] Access controls are implemented and reviewed
- [ ] Security patches are applied promptly
- [ ] Security incidents have defined response procedures
- [ ] Regular security audits and penetration testing
- [ ] Security training for team members
- [ ] Incident response plan is documented and tested

---

## 📋 Incident Response

### Security Incident Procedure

1. **Detection**: Monitor security alerts and unusual activity
2. **Assessment**: Evaluate the severity and impact
3. **Containment**: Isolate affected systems
4. **Eradication**: Remove the threat and vulnerabilities
5. **Recovery**: Restore normal operations
6. **Lessons Learned**: Document and improve procedures

### Emergency Contacts
- **Security Team**: security@soloadventurer.com
- **Technical Lead**: tech-lead@soloadventurer.com
- **Legal Counsel**: legal@soloadventurer.com

---

**Last Updated**: [Date]  
**Security Team**: security@soloadventurer.com  
**Review Frequency**: Monthly