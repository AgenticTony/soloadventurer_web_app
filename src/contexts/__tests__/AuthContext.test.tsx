import React from 'react'
import { render, act, screen, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthContext'
import { Amplify } from 'aws-amplify'

// Mock AWS Amplify and auth functions
jest.mock('aws-amplify')
jest.mock('aws-amplify/auth', () => ({
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
  resetPassword: jest.fn(),
  confirmResetPassword: jest.fn(),
  confirmSignUp: jest.fn(),
  fetchAuthSession: jest.fn(),
  getCurrentUser: jest.fn(),
  fetchUserAttributes: jest.fn(),
}))

// Import mocked functions
import { 
  signIn as mockSignIn,
  signUp as mockSignUp,
  signOut as mockSignOut,
  resetPassword as mockResetPassword,
  confirmResetPassword as mockConfirmResetPassword,
  confirmSignUp as mockConfirmSignUp,
  fetchAuthSession as mockFetchAuthSession,
  getCurrentUser as mockGetCurrentUser,
  fetchUserAttributes as mockFetchUserAttributes,
} from 'aws-amplify/auth'
jest.mock('../../../amplify_outputs.json', () => ({
  version: '1',
  auth: {
    aws_region: 'us-east-1',
    user_pool_id: 'us-east-1_test',
    user_pool_client_id: 'test-client-id',
    identity_pool_id: 'us-east-1:test-identity-pool',
    standard_required_attributes: ['email'],
    username_attributes: ['email'],
    user_verification_types: ['email']
  },
  data: {
    aws_region: 'us-east-1',
    url: 'https://test.appsync-api.us-east-1.amazonaws.com/graphql',
    default_authorization_type: 'AMAZON_COGNITO_USER_POOLS',
    authorization_types: ['AMAZON_COGNITO_USER_POOLS']
  }
}))

const mockAmplify = Amplify as jest.Mocked<typeof Amplify>

// Setup mock implementations
beforeEach(() => {
  ;(mockSignIn as jest.Mock).mockResolvedValue({ isSignedIn: true, nextStep: undefined })
  ;(mockSignUp as jest.Mock).mockResolvedValue({ isSignUpComplete: true, nextStep: undefined })
  ;(mockSignOut as jest.Mock).mockResolvedValue({})
  ;(mockResetPassword as jest.Mock).mockResolvedValue({})
  ;(mockConfirmResetPassword as jest.Mock).mockResolvedValue({})
  ;(mockConfirmSignUp as jest.Mock).mockResolvedValue({})
  ;(mockFetchAuthSession as jest.Mock).mockResolvedValue({
    tokens: {
      idToken: {
        toString: () => 'test-jwt-token'
      }
    }
  })
  ;(mockGetCurrentUser as jest.Mock).mockResolvedValue({
    userId: 'test-user-id'
  })
  ;(mockFetchUserAttributes as jest.Mock).mockResolvedValue({
    email: 'test@example.com',
    name: 'Test User',
    email_verified: 'true'
  })

  mockAmplify.configure = jest.fn()
})

// Reset mocks after each test
afterEach(() => {
  jest.clearAllMocks()
})

// Test component that uses auth context
const TestComponent = () => {
  const { user, isAuthenticated, login, signup, logout } = useAuth()
  
  return (
    <div>
      {isAuthenticated && <div data-testid="authenticated">Authenticated</div>}
      {user && <div data-testid="user-email">{user.email}</div>}
      <button data-testid="login-btn" onClick={() => login('test@example.com', 'password')}>
        Login
      </button>
      <button data-testid="signup-btn" onClick={() => signup('test@example.com', 'password', 'Test User')}>
        Signup
      </button>
      <button data-testid="logout-btn" onClick={logout}>
        Logout
      </button>
    </div>
  )
}

describe('AuthProvider', () => {
  test('provides authentication context', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByTestId('login-btn')).toBeInTheDocument()
    expect(screen.getByTestId('signup-btn')).toBeInTheDocument()
    expect(screen.getByTestId('logout-btn')).toBeInTheDocument()
  })

  test('throws error when useAuth is used outside AuthProvider', () => {
    expect(() => {
      render(<TestComponent />)
    }).toThrow('useAuth must be used within an AuthProvider')
  })

  test('handles successful login', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    const loginBtn = screen.getByTestId('login-btn')
    
    await act(async () => {
      loginBtn.click()
    })

    expect(mockSignIn).toHaveBeenCalledWith({ username: 'test@example.com', password: 'password' })
  })

  test('handles successful signup', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    const signupBtn = screen.getByTestId('signup-btn')
    
    await act(async () => {
      signupBtn.click()
    })

    expect(mockSignUp).toHaveBeenCalledWith({
      username: 'test@example.com',
      password: 'password',
      options: {
        userAttributes: {
          email: 'test@example.com',
          name: 'Test User',
          'custom:createdAt': expect.any(String),
          'custom:updatedAt': expect.any(String)
        },
        autoSignIn: true
      }
    })
  })

  test('handles logout', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    const logoutBtn = screen.getByTestId('logout-btn')
    
    await act(async () => {
      logoutBtn.click()
    })

    expect(mockSignOut).toHaveBeenCalled()
  })

  test('handles authentication errors', async () => {
    ;(mockSignIn as jest.Mock).mockRejectedValue(new Error('Login failed'))

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    const loginBtn = screen.getByTestId('login-btn')
    
    await act(async () => {
      expect(async () => {
        loginBtn.click()
      }).rejects.toThrow('Login failed')
    })
  })

  test('handles password reset', async () => {
    const TestWrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    )

    // Since resetPassword is not exposed in TestComponent, we'll test it through a custom component
    const TestResetComponent = () => {
      const { resetPassword } = useAuth()
      
      React.useEffect(() => {
        resetPassword('test@example.com')
      }, [resetPassword])
      
      return <div>Test</div>
    }

    render(
      <TestWrapper>
        <TestResetComponent />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith({ username: 'test@example.com' })
    })
  })

  test('handles password reset confirmation', async () => {
    const TestWrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    )

    const TestConfirmResetComponent = () => {
      const { confirmResetPassword } = useAuth()
      
      React.useEffect(() => {
        confirmResetPassword('test@example.com', '123456', 'newPassword')
      }, [confirmResetPassword])
      
      return <div>Test</div>
    }

    render(
      <TestWrapper>
        <TestConfirmResetComponent />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(mockConfirmResetPassword).toHaveBeenCalledWith({
        username: 'test@example.com',
        confirmationCode: '123456',
        newPassword: 'newPassword'
      })
    })
  })

  test('handles signup confirmation', async () => {
    const TestWrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    )

    const TestConfirmSignupComponent = () => {
      const { confirmSignUp } = useAuth()
      
      React.useEffect(() => {
        confirmSignUp('test@example.com', '123456')
      }, [confirmSignUp])
      
      return <div>Test</div>
    }

    render(
      <TestWrapper>
        <TestConfirmSignupComponent />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(mockConfirmSignUp).toHaveBeenCalledWith({
        username: 'test@example.com',
        confirmationCode: '123456'
      })
    })
  })
})