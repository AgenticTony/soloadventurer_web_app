'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import {
  signIn,
  signUp,
  signOut,
  resetPassword as resetPasswordFn,
  confirmResetPassword as confirmResetPasswordFn,
  confirmSignUp as confirmSignUpFn,
  resendSignUpCode as resendSignUpCodeFn,
  fetchAuthSession,
  getCurrentUser,
  fetchUserAttributes,
} from 'aws-amplify/auth'
import type { User, AuthContextType, AuthError } from '@/types/auth'
import { COGNITO_ERROR_CODES } from '@/types/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const currentUser = await getCurrentUser()
      const userAttributes = await fetchUserAttributes()
      const session = await fetchAuthSession()

      if (session.tokens?.idToken && currentUser) {
        const user: User = {
          id: currentUser.userId,
          email: userAttributes.email || '',
          name:
            userAttributes.name ||
            `${userAttributes.given_name || ''} ${userAttributes.family_name || ''}`.trim() ||
            userAttributes.preferred_username ||
            userAttributes.email?.split('@')[0] ||
            '',
          emailVerified: userAttributes.email_verified === 'true',
          avatar: userAttributes.picture,
          bio: userAttributes['custom:bio'],
          location: userAttributes['custom:location'],
          createdAt: userAttributes['custom:createdAt'],
          updatedAt: userAttributes['custom:updatedAt'],
        }
        setUser(user)
      }
    } catch (error) {
      // No authenticated user found, which is expected
      console.log('No authenticated user found')
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const { isSignedIn, nextStep } = await signIn({
        username: email,
        password,
      })

      if (isSignedIn) {
        await checkAuthStatus()
      } else if (nextStep.signInStep === 'CONFIRM_SIGN_UP') {
        throw new Error('Please confirm your email address before logging in')
      } else if (nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
        throw new Error('Please complete the authentication process')
      }
    } catch (error) {
      console.error('Login failed:', error)

      // Handle UserAlreadyAuthenticatedException by clearing state and retrying
      if (error instanceof Error && error.name === COGNITO_ERROR_CODES.USER_ALREADY_AUTHENTICATED) {
        try {
          await clearAuthState()
          // Retry sign-in after clearing state
          const { isSignedIn, nextStep } = await signIn({
            username: email,
            password,
          })

          if (isSignedIn) {
            await checkAuthStatus()
            return
          } else if (nextStep.signInStep === 'CONFIRM_SIGN_UP') {
            throw new Error('Please confirm your email address before logging in')
          } else if (nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
            throw new Error('Please complete the authentication process')
          }
        } catch (retryError) {
          console.error('Retry login failed:', retryError)
          if (retryError instanceof Error) {
            throw retryError
          }
          throw new Error('An unexpected error occurred during login retry')
        }
      }

      if (error instanceof Error) {
        throw error
      }
      throw new Error('An unexpected error occurred during login')
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true)
    try {
      console.log('Starting signup for:', email)
      const { isSignUpComplete, userId, nextStep } = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            preferred_username: email.split('@')[0], // Use email prefix as username
            given_name: name.split(' ')[0] || name, // First name
            family_name: name.split(' ').slice(1).join(' ') || '', // Last name
            'custom:bio': '',
            'custom:location': '',
            'custom:createdAt': new Date().toISOString(),
            'custom:updatedAt': new Date().toISOString(),
          },
          autoSignIn: true,
        },
      })

      console.log('Signup response:', { isSignUpComplete, userId, nextStep })
      return { userConfirmed: isSignUpComplete }
    } catch (error) {
      console.error('Signup error:', error)

      // Check if this is the misleading domain error but user was actually created
      if (
        error instanceof Error &&
        error.message.includes('user pool domain') &&
        error.name === 'InvalidParameterException'
      ) {
        console.log(
          'Ignoring domain error - user may have been created, prompting for verification'
        )
        // Return false to indicate user needs to confirm
        return { userConfirmed: false }
      }

      if (error instanceof Error) {
        throw error
      }
      throw new Error('An unexpected error occurred during signup')
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await signOut()
      setUser(null)
    } catch (error) {
      console.error('Logout failed:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('An unexpected error occurred during logout')
    }
  }

  const clearAuthState = async () => {
    try {
      // Try to sign out first to clear any existing session
      await signOut().catch(() => {
        // Ignore sign out errors - just clear local state
        console.log('No active session to clear')
      })
      setUser(null)
      setIsLoading(false)
    } catch (error) {
      console.error('Error clearing auth state:', error)
      setUser(null)
      setIsLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      await resetPasswordFn({ username: email })
    } catch (error) {
      console.error('Password reset failed:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('An unexpected error occurred during password reset')
    }
  }

  const confirmResetPassword = async (email: string, code: string, newPassword: string) => {
    try {
      await confirmResetPasswordFn({
        username: email,
        confirmationCode: code,
        newPassword,
      })
    } catch (error) {
      console.error('Password reset confirmation failed:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('An unexpected error occurred during password reset confirmation')
    }
  }

  const confirmSignUp = async (email: string, code: string) => {
    try {
      await confirmSignUpFn({
        username: email,
        confirmationCode: code,
      })

      // After successful confirmation, automatically sign in the user
      try {
        const { isSignedIn } = await signIn({
          username: email,
          password: '', // This will fail but we'll handle it gracefully
        })

        if (isSignedIn) {
          await checkAuthStatus()
        }
      } catch (signInError) {
        // Expected - we don't have the password here
        // User will need to sign in manually
        console.log('Auto sign-in after confirmation failed (expected)')
      }
    } catch (error) {
      console.error('Sign up confirmation failed:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('An unexpected error occurred during sign up confirmation')
    }
  }

  const resendSignUpCode = async (email: string) => {
    try {
      console.log('Resending verification code to:', email)
      const result = await resendSignUpCodeFn({ username: email })
      console.log('Resend code result:', result)
    } catch (error) {
      console.error('Resend code error:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to resend verification code')
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        clearAuthState,
        resetPassword,
        confirmResetPassword,
        confirmSignUp,
        resendSignUpCode,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
