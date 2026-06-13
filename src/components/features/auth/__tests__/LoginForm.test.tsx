import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LoginForm } from '../LoginForm'
import { useAuth } from '@/contexts/AuthContext'

// Mock the useAuth hook
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}))

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

describe('LoginForm', () => {
  const mockLogin = jest.fn()
  const mockIsLoading = false
  const mockError = null

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAuth.mockReturnValue({
      login: mockLogin,
      isLoading: mockIsLoading,
      error: mockError,
      isAuthenticated: false,
      user: null,
      signup: jest.fn(),
      logout: jest.fn(),
      clearAuthState: jest.fn(),
      resetPassword: jest.fn(),
      confirmResetPassword: jest.fn(),
      confirmSignUp: jest.fn(),
      resendSignUpCode: jest.fn(),
    })
  })

  test('renders login form correctly', () => {
    render(<LoginForm />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByText('Forgot your password?')).toBeInTheDocument()
  })

  test('allows user to input email and password', () => {
    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    expect(emailInput).toHaveValue('test@example.com')
    expect(passwordInput).toHaveValue('password123')
  })

  test('calls login function with correct credentials on form submission', async () => {
    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })

  test('displays loading state when logging in', async () => {
    // Mock the login function to simulate loading state
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    // Wait for loading state to appear
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled()
      expect(screen.getByText(/signing in/i)).toBeInTheDocument()
    })
  })

  test('displays error message when login fails', async () => {
    const errorMessage = 'Incorrect email or password'
    mockLogin.mockRejectedValueOnce(new Error(errorMessage))

    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
    expect(screen.getByText(errorMessage)).toHaveClass('text-red-600')
  })

  test('forgot password link is present', () => {
    render(<LoginForm />)

    const forgotPasswordLink = screen.getByText('Forgot your password?')
    expect(forgotPasswordLink).toBeInTheDocument()
  })

  test('form has HTML5 validation attributes', () => {
    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)

    // Check that inputs have required attribute
    expect(emailInput).toHaveAttribute('required')
    expect(passwordInput).toHaveAttribute('required')

    // Check that email input has proper type
    expect(emailInput).toHaveAttribute('type', 'email')
  })

  test('validates email format', () => {
    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email/i)

    // Check that email input validates format
    expect(emailInput).toHaveAttribute('type', 'email')
    expect(emailInput).toHaveAttribute('required')
  })

  test('requires password field', () => {
    render(<LoginForm />)

    const passwordInput = screen.getByLabelText(/password/i)

    // Check that password input is required
    expect(passwordInput).toHaveAttribute('required')
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  test('handles form submission errors gracefully', async () => {
    const errorMessage = 'Network error'
    mockLogin.mockRejectedValue(new Error(errorMessage))

    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })

  test('password field is of type password', () => {
    render(<LoginForm />)

    const passwordInput = screen.getByLabelText(/password/i)
    expect(passwordInput).toHaveAttribute('type', 'password')
  })
})
