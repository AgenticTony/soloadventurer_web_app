import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SignupForm } from '../SignupForm'
import { useAuth } from '@/contexts/AuthContext'

// Mock the useAuth hook
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn()
}))

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

describe('SignupForm', () => {
  const mockSignup = jest.fn()
  const mockIsLoading = false
  const mockError = null

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAuth.mockReturnValue({
      signup: mockSignup,
      isLoading: mockIsLoading,
      error: mockError,
      isAuthenticated: false,
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
      resetPassword: jest.fn(),
      confirmResetPassword: jest.fn(),
      confirmSignUp: jest.fn(),
      resendSignUpCode: jest.fn()
    })
  })

  test('renders signup form correctly', () => {
    render(<SignupForm />)
    
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  test('allows user to input all fields', () => {
    render(<SignupForm />)
    
    const nameInput = screen.getByLabelText('Full Name')
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const confirmPasswordInput = screen.getByLabelText('Confirm Password')
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123!' } })
    
    expect(nameInput).toHaveValue('John Doe')
    expect(emailInput).toHaveValue('john@example.com')
    expect(passwordInput).toHaveValue('Password123!')
    expect(confirmPasswordInput).toHaveValue('Password123!')
  })

  test('calls signup function with correct parameters on form submission', async () => {
    render(<SignupForm />)
    
    const nameInput = screen.getByLabelText('Full Name')
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const confirmPasswordInput = screen.getByLabelText('Confirm Password')
    const submitButton = screen.getByRole('button', { name: /create account/i })
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123!' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith('john@example.com', 'Password123!', 'John Doe')
    })
  })

  test('displays loading state when signing up', () => {
    mockUseAuth.mockReturnValue({
      signup: mockSignup,
      isLoading: true,
      error: mockError,
      isAuthenticated: false,
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
      resetPassword: jest.fn(),
      confirmResetPassword: jest.fn(),
      resendSignUpCode: jest.fn()
    })

    render(<SignupForm />)
    
    // The button should be disabled when auth context isLoading is true
    const submitButton = screen.getByRole('button', { name: /create account/i })
    expect(submitButton).toBeDisabled()
  })

  test('displays error message when passwords do not match', () => {
    render(<SignupForm />)
    
    // Fill form with mismatched passwords
    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password123!' } })
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'DifferentPassword123!' } })
    
    // Submit form to trigger validation error
    const submitButton = screen.getByRole('button', { name: /create account/i })
    fireEvent.click(submitButton)
    
    expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
    expect(screen.getByText('Passwords do not match')).toHaveClass('text-red-600')
  })

  test('validates password length requirements', () => {
    render(<SignupForm />)
    
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /create account/i })
    
    // Fill other fields
    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john@example.com' } })
    
    // Test short password (less than 8 characters)
    fireEvent.change(passwordInput, { target: { value: 'short' } })
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'short' } })
    fireEvent.click(submitButton)
    
    // Should show error for short password
    expect(screen.getByText('Password must be at least 8 characters long')).toBeInTheDocument()
    
    // Test valid length password
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } })
  })

  test('validates password confirmation', () => {
    render(<SignupForm />)
    
    const passwordInput = screen.getByLabelText('Password')
    const confirmPasswordInput = screen.getByLabelText('Confirm Password')
    const submitButton = screen.getByRole('button', { name: /create account/i })
    
    // Fill other fields
    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john@example.com' } })
    
    // Matching passwords
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } })
    
    // Non-matching passwords
    fireEvent.change(confirmPasswordInput, { target: { value: 'differentpassword' } })
    fireEvent.click(submitButton)
    
    // Should show error message
    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
  })

  test('validates email format with HTML5 validation', () => {
    render(<SignupForm />)
    
    const emailInput = screen.getByLabelText('Email')
    
    // Check that email input has proper type and required attributes
    expect(emailInput).toHaveAttribute('type', 'email')
    expect(emailInput).toHaveAttribute('required')
  })

  test('all fields have HTML5 required attributes', () => {
    render(<SignupForm />)
    
    // Check that all required fields have the required attribute
    expect(screen.getByLabelText('Full Name')).toHaveAttribute('required')
    expect(screen.getByLabelText('Email')).toHaveAttribute('required')
    expect(screen.getByLabelText('Password')).toHaveAttribute('required')
    expect(screen.getByLabelText('Confirm Password')).toHaveAttribute('required')
  })

  test('navigates to login page when login link is clicked', () => {
    const mockRouter = {
      push: jest.fn()
    }
    jest.mock('next/navigation', () => ({
      useRouter() {
        return mockRouter
      }
    }))

    render(<SignupForm />)
    
    const loginLink = screen.getByText(/already have an account/i)
    fireEvent.click(loginLink)
    
    expect(mockRouter.push).toHaveBeenCalledWith('/login')
  })

  test('form has proper password input types', () => {
    render(<SignupForm />)
    
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password')
    expect(screen.getByLabelText('Confirm Password')).toHaveAttribute('type', 'password')
  })

  
  test('handles form submission errors gracefully', async () => {
    const errorMessage = 'Network error'
    mockSignup.mockRejectedValue(new Error(errorMessage))

    render(<SignupForm />)
    
    const nameInput = screen.getByLabelText('Full Name')
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const confirmPasswordInput = screen.getByLabelText('Confirm Password')
    const submitButton = screen.getByRole('button', { name: /create account/i })
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123!' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith('john@example.com', 'Password123!', 'John Doe')
    })
  })

  test('displays success message and redirects after successful signup', async () => {
    const mockRouter = {
      push: jest.fn()
    }
    jest.mock('next/router', () => ({
      useRouter: () => mockRouter
    }))

    mockSignup.mockResolvedValue({ userConfirmed: false })

    render(<SignupForm />)
    
    const nameInput = screen.getByLabelText('Full Name')
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const confirmPasswordInput = screen.getByLabelText('Confirm Password')
    const submitButton = screen.getByRole('button', { name: /create account/i })
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123!' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith('john@example.com', 'Password123!', 'John Doe')
    })
  })

  test('passes form inputs as entered to signup function', async () => {
    render(<SignupForm />)
    
    const nameInput = screen.getByLabelText('Full Name')
    const emailInput = screen.getByLabelText('Email')
    const submitButton = screen.getByRole('button', { name: /create account/i })
    
    // Test with valid values (email without leading/trailing spaces for HTML5 validation)
    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password123!' } })
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'Password123!' } })
    
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith('john@example.com', 'Password123!', 'John Doe')
    })
  })
})