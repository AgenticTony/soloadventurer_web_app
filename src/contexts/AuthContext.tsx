'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User, AuthContextType, AuthError } from '@/types/auth'
import type { Session } from '@supabase/supabase-js'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Create a single stable Supabase instance outside the component
const supabase = createClient()

function mapSupabaseUser(session: Session | null): User | null {
  if (!session?.user) return null
  const { user } = session
  return {
    id: user.id,
    email: user.email ?? '',
    name:
      user.user_metadata?.name ??
      user.user_metadata?.full_name ??
      user.email?.split('@')[0] ??
      '',
    avatar: user.user_metadata?.avatar_url ?? user.user_metadata?.picture,
    bio: user.user_metadata?.bio ?? '',
    location: user.user_metadata?.location ?? '',
    emailVerified: user.email_confirmed_at != null,
    createdAt: user.created_at,
    updatedAt: user.updated_at ?? user.created_at,
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<AuthError | null>(null)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(mapSupabaseUser(session))
      setIsLoading(false)
    })

    // Listen for auth state changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(mapSupabaseUser(session))
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true)
      setError(null)
      try {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (authError) throw authError
        // onAuthStateChange will update user state
      } catch (err) {
        const authErr = err as AuthError
        setError(authErr)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  const signup = useCallback(
    async (email: string, password: string, name: string) => {
      setIsLoading(true)
      setError(null)
      try {
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              full_name: name,
              bio: '',
              location: '',
            },
          },
        })
        if (authError) throw authError

        // If email confirmation is required, user won't have a session yet
        const userConfirmed = !!data.session
        return { userConfirmed }
      } catch (err) {
        const authErr = err as AuthError
        setError(authErr)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
    } catch (err) {
      const authErr = err as AuthError
      setError(authErr)
      throw err
    }
  }, [supabase])

  const clearAuthState = useCallback(async () => {
    try {
      await supabase.auth.signOut()
    } catch {
      // Ignore sign out errors — just clear local state
    }
    setUser(null)
    setIsLoading(false)
  }, [supabase])

  const resetPassword = useCallback(
    async (email: string) => {
      try {
        const { error: authError } =
          await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/forgot-password`,
          })
        if (authError) throw authError
      } catch (err) {
        throw err
      }
    },
    [],
  )

  const confirmResetPassword = useCallback(
    async (email: string, code: string, newPassword: string) => {
      try {
        // Verify the OTP from the recovery email
        const { error: otpError } = await supabase.auth.verifyOtp({
          email,
          token: code,
          type: 'recovery',
        })
        if (otpError) throw otpError

        // Update the user's password
        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword,
        })
        if (updateError) throw updateError
      } catch (err) {
        throw err
      }
    },
    [],
  )

  const confirmSignUp = useCallback(
    async (email: string, code: string) => {
      try {
        const { error: authError } = await supabase.auth.verifyOtp({
          email,
          token: code,
          type: 'signup',
        })
        if (authError) throw authError
        // onAuthStateChange will update user state if auto-confirmed
      } catch (err) {
        throw err
      }
    },
    [],
  )

  const resendSignUpCode = useCallback(
    async (email: string) => {
      try {
        const { error: authError } = await supabase.auth.resend({
          type: 'signup',
          email,
        })
        if (authError) throw authError
      } catch (err) {
        throw err
      }
    },
    [],
  )

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        error,
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
