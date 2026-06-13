'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Compass, Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

function SignInContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, isLoading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Handle query parameters
  useEffect(() => {
    const confirmed = searchParams.get('confirmed')
    const emailParam = searchParams.get('email')

    if (confirmed === 'true') {
      setSuccessMessage('Email confirmed successfully! Please sign in to continue.')
    }

    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      await login(email, password)
      // Check if this is a new user (email just confirmed)
      const confirmed = searchParams.get('confirmed')
      // Redirect new users to profile, existing users to feed
      router.push(confirmed === 'true' ? '/profile' : '/feed')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    }
  }

  // The middleware now handles authentication redirects properly
  // No need for client-side authentication checks that can cause redirect loops

  return (
    <div className="bg-paper flex min-h-screen items-center justify-center p-4 dark:bg-background">
      <main id="main-content" className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500">
            <Compass className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">SoloAdventurer</h1>
          <p className="mt-2 text-muted-foreground">Sign in to your account</p>
        </div>

        {/* Sign In Form */}
        <div className="mb-6 rounded-2xl bg-card p-6 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted py-3 pl-10 pr-12 text-foreground placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 transform p-2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-border bg-muted text-brand-500 focus:ring-brand-500"
                />
                <span className="ml-2 text-sm text-muted-foreground">Remember me</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-brand-600 transition-colors hover:text-brand-700"
              >
                Forgot password?
              </Link>
            </div>

            {successMessage && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-500/20 dark:bg-green-500/10">
                <p className="text-sm text-green-600 dark:text-green-400">{successMessage}</p>
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-500/20 dark:bg-red-500/10">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-brand-500 py-3 font-medium text-white transition-colors hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="font-medium text-brand-600 transition-colors hover:text-brand-700"
            >
              Sign up
            </Link>
          </p>
        </div>

        {/* Social Sign In */}
        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-paper px-2 text-muted-foreground dark:bg-background">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              className="w-full rounded-xl border border-border bg-muted px-4 py-2 transition-colors hover:bg-muted/80 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading}
            >
              Google
            </button>
            <button
              className="w-full rounded-xl border border-border bg-muted px-4 py-2 transition-colors hover:bg-muted/80 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading}
            >
              Facebook
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-paper flex min-h-screen items-center justify-center dark:bg-background">
          <div className="text-center">
            <div className="text-lg">Loading...</div>
          </div>
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  )
}
