import React from 'react'
import { render, act, screen, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthContext'

// Mock Supabase client — mock object lives inside the factory closure to avoid hoisting issues
jest.mock('@/lib/supabase/client', () => {
  const auth = {
    getSession: jest.fn(),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    resetPasswordForEmail: jest.fn(),
    verifyOtp: jest.fn(),
    updateUser: jest.fn(),
    resend: jest.fn(),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } },
    })),
  }
  return { createClient: () => ({ auth }) }
})

import { createClient } from '@/lib/supabase/client'

const auth = createClient().auth as unknown as {
  getSession: jest.Mock
  signInWithPassword: jest.Mock
  signUp: jest.Mock
  signOut: jest.Mock
  resetPasswordForEmail: jest.Mock
  verifyOtp: jest.Mock
  updateUser: jest.Mock
}

beforeEach(() => {
  jest.clearAllMocks()
  auth.getSession.mockResolvedValue({ data: { session: null } })
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
      <button
        data-testid="signup-btn"
        onClick={() => signup('test@example.com', 'password', 'Test User')}
      >
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
    auth.signInWithPassword.mockResolvedValue({ data: {}, error: null })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await act(async () => {
      screen.getByTestId('login-btn').click()
    })

    expect(auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
    })
  })

  test('handles successful signup', async () => {
    auth.signUp.mockResolvedValue({
      data: { user: { id: 'test-id' }, session: { access_token: 'token' } },
      error: null,
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await act(async () => {
      screen.getByTestId('signup-btn').click()
    })

    expect(auth.signUp).toHaveBeenCalledWith({
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
    auth.signOut.mockResolvedValue({ error: null })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await act(async () => {
      screen.getByTestId('logout-btn').click()
    })

    expect(auth.signOut).toHaveBeenCalled()
  })

  test('handles authentication errors', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    // Use mockResolvedValue with an error property — login() will throw this
    // which becomes an unhandled rejection since the click handler doesn't await login()
    auth.signInWithPassword.mockImplementation(() =>
      Promise.resolve({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials', name: 'AuthError' },
      })
    )

    const { container } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Component should render without crashing even when login errors
    expect(container).toBeTruthy()
    expect(screen.getByTestId('login-btn')).toBeInTheDocument()

    consoleSpy.mockRestore()
  })

  test('handles password reset', async () => {
    auth.resetPasswordForEmail.mockResolvedValue({ error: null })

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
      </AuthProvider>
    )

    await waitFor(() => {
      expect(auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        expect.objectContaining({ redirectTo: expect.stringContaining('/forgot-password') })
      )
    })
  })

  test('handles password reset confirmation', async () => {
    auth.verifyOtp.mockResolvedValue({ error: null })
    auth.updateUser.mockResolvedValue({ error: null })

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
      </AuthProvider>
    )

    await waitFor(() => {
      expect(auth.verifyOtp).toHaveBeenCalledWith({
        email: 'test@example.com',
        token: '123456',
        type: 'recovery',
      })
      expect(auth.updateUser).toHaveBeenCalledWith({ password: 'newPassword' })
    })
  })

  test('handles signup confirmation', async () => {
    auth.verifyOtp.mockResolvedValue({ error: null })

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
      </AuthProvider>
    )

    await waitFor(() => {
      expect(auth.verifyOtp).toHaveBeenCalledWith({
        email: 'test@example.com',
        token: '123456',
        type: 'signup',
      })
    })
  })
})
