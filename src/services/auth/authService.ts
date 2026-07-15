import { createClient } from '@/lib/supabase/client'
import type { AuthUser, SignUpResult, SignInResult, AuthSession, UserProfile } from './types'

export class AuthService {
  async signUp(email: string, password: string, name: string): Promise<SignUpResult> {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, full_name: name },
      },
    })

    if (error) throw error

    return {
      userConfirmed: !!data.session,
      userId: data.user?.id,
    }
  }

  async signIn(email: string, password: string): Promise<SignInResult> {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    return { isSignedIn: !!data.session }
  }

  async signOut(): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  async confirmSignUp(email: string, code: string): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'signup',
    })
    if (error) throw error
  }

  async resetPassword(email: string): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) throw error
  }

  async confirmResetPassword(email: string, code: string, newPassword: string): Promise<void> {
    const supabase = createClient()
    const { error: otpError } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'recovery',
    })
    if (otpError) throw otpError

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })
    if (updateError) throw updateError
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return null

    return {
      userId: user.id,
      email: user.email ?? '',
      emailVerified: user.email_confirmed_at != null,
    }
  }

  async getSession(): Promise<AuthSession | null> {
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) return null

    return {
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      expiresAt: session.expires_at ?? undefined,
      isValid: true,
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const supabase = createClient()
    // Non-PII columns only — email/phone/date_of_birth are column-REVOKE'd from
    // the authenticated role (see the profiles PII column-privileges migration),
    // so `select('*')` would fail. Email is sourced from the auth session below.
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, bio, avatar_url, location, created_at, updated_at')
      .eq('id', userId)
      .single()

    if (error || !data) return null

    // Email is the user's own, from the session source of truth — never another
    // user's, and never read from the profiles table.
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()
    const email = authUser?.id === userId ? (authUser?.email ?? '') : ''

    return {
      userId: data.id,
      email,
      emailVerified: true,
      name: data.full_name ?? '',
      bio: data.bio ?? '',
      avatarUrl: data.avatar_url ?? null,
      location: data.location ?? '',
      createdAt: data.created_at ?? '',
      updatedAt: data.updated_at ?? '',
    }
  }
}

export const authService = new AuthService()
