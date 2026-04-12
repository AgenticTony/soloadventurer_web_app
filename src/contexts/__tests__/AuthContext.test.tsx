import React from 'react'
import { render, act, screen, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthContext'

// Mock the Supabase client
const mockGetSession = jest.fn()
const mockSignInWithPassword = jest.fn()
const mockSignUp = jest.fn()
const mockSignOut = jest.fn()
const mockResetPasswordForEmail = jest.fn()
const mockVerifyOtp = jest.fn()
const mockUpdateUser = jest.fn()
const mockResend = jest.fn()
const mockOnAuthStateChange = jest.fn(() => ({
  data: { subscription: { unsubscribe: jest.fn() } },
}))

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getSession: mockGetSession,
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      signOut: mockSignOut,
      resetPasswordForEmail: mockResetPasswordForEmail,
      verifyOtp: mockVerifyOtp,
      updateUser: mockUpdateUser,
      resend: mockResend,
      onAuthStateChange: mockOnAuthStateChange,
    },
  }),
}))

beforeEach(() => {
  jest.clearAllMocks()
  mockGetSession.mockResolvedValue({ data: { session: null } })
})

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
      </AuthProvider>,
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
    mockSignInWithPassword.mockResolvedValue({ data: {}, error: null })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    await act(async () => {
      screen.getByTestId('login-btn').click()
    })

    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
    })
  })

  test('handles successful signup', async () => {
    mockSignUp.mockResolvedValue({
      data: { user: { id: 'test-id' }, session: { access_token: 'token' } },
      error: null,
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    await act(async () => {
      screen.getByTestId('signup-btn').click()
    })

    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
      options: {
        data: {
          name: 'Test User',
          full_name: 'Test User',
          bio: '',
          location: '',
        },
      },
    })
  })

  test('handles logout', async () => {
    mockSignOut.mockResolvedValue({ error: null })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    await act(async () => {
      screen.getByTestId('logout-btn').click()
    })

    expect(mockSignOut).toHaveBeenCalled()
  })

  test('handles authentication errors', async () => {
    mockSignInWithPassword.mockRejectedValue(new Error('Invalid login credentials'))

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    await act(async () => {
      screen.getByTestId('login-btn').click()
    })
  })

  test('handles password reset', async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null })

    const TestResetComponent = () => {
      const { resetPassword } = useAuth()
      React.useEffect(() => {
        resetPassword('test@example.com')
      }, [resetPassword])
      return <div>Test</div>
    }

    render(
      <AuthProvider>
        <TestResetComponent />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(mockResetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        expect.objectContaining({ redirectTo: expect.stringContaining('/forgot-password') }),
      )
    })
  })

  test('handles password reset confirmation', async () => {
    mockVerifyOtp.mockResolvedValue({ error: null })
    mockUpdateUser.mockResolvedValue({ error: null })

    const TestConfirmResetComponent = () => {
      const { confirmResetPassword } = useAuth()
      React.useEffect(() => {
        confirmResetPassword('test@example.com', '123456', 'newPassword')
      }, [confirmResetPassword])
      return <div>Test</div>
    }

    render(
      <AuthProvider>
        <TestConfirmResetComponent />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(mockVerifyOtp).toHaveBeenCalledWith({
        email: 'test@example.com',
        token: '123456',
        type: 'recovery',
      })
      expect(mockUpdateUser).toHaveBeenCalledWith({ password: 'newPassword' })
    })
  })

  test('handles signup confirmation', async () => {
    mockVerifyOtp.mockResolvedValue({ error: null })

    const TestConfirmSignupComponent = () => {
      const { confirmSignUp } = useAuth()
      React.useEffect(() => {
        confirmSignUp('test@example.com', '123456')
      }, [confirmSignUp])
      return <div>Test</div>
    }

    render(
      <AuthProvider>
        <TestConfirmSignupComponent />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(mockVerifyOtp).toHaveBeenCalledWith({
        email: 'test@example.com',
        token: '123456',
        type: 'signup',
      })
    })
  })
})
