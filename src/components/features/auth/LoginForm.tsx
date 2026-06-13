'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login, isAuthenticated, user } = useAuth()
  const router = useRouter()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('User already authenticated, redirecting to /feed')
      router.push('/feed')
    }
  }, [isAuthenticated, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await login(email, password)
      setSuccess(true)
      setError('')
      console.log('Login successful, redirecting...')
      // Try router.push first
      router.push('/feed')
      // Fallback to window.location if router doesn't work
      setTimeout(() => {
        window.location.href = '/feed'
      }, 1000)
    } catch (err: unknown) {
      const error = err as Error & { code?: string }
      console.error('Login error:', error)

      // Handle Supabase auth errors
      const msg = error.message?.toLowerCase() ?? ''
      if (msg.includes('email not confirmed')) {
        setError('Please confirm your email address before logging in')
      } else if (msg.includes('invalid login credentials')) {
        setError('Incorrect email or password')
      } else if (msg.includes('too many requests')) {
        setError('Too many attempts. Please wait a moment and try again.')
      } else {
        setError(error.message || 'Login failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Welcome Back</CardTitle>
        <CardDescription>Sign in to your SoloAdventurer account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          {success && (
            <div className="text-sm text-green-600">
              Login successful! Redirecting to your feed...
              <button
                type="button"
                onClick={() => (window.location.href = '/feed')}
                className="mt-2 block text-blue-600 hover:underline"
              >
                Click here if not redirected automatically
              </button>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => router.push('/forgot-password')}
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot your password?
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
