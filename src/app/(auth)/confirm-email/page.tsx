'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'

function ConfirmEmailContent() {
  const [code, setCode] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { confirmSignUp, resendSignUpCode } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Pre-fill email if passed as query param
  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await confirmSignUp(email, code)
      // After successful email confirmation, redirect to sign-in with success message
      router.push('/sign-in?confirmed=true&email=' + encodeURIComponent(email))
    } catch (err: unknown) {
      const error = err as Error
      setError(error.message || 'Confirmation failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (!email) {
      setError('Please enter your email address')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await resendSignUpCode(email)
      setError('Verification code sent! Check your email.')
    } catch (err: unknown) {
      const error = err as Error
      setError(error.message || 'Failed to resend code. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Confirm Your Email</CardTitle>
          <CardDescription>
            We&apos;ve sent a verification code to your email address
          </CardDescription>
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
              <label htmlFor="code" className="text-sm font-medium">
                Verification Code
              </label>
              <Input
                id="code"
                type="text"
                placeholder="123456"
                value={code}
                onChange={e => setCode(e.target.value)}
                required
              />
            </div>

            {error && (
              <div
                className={`text-sm ${error.includes('sent') ? 'text-green-600' : 'text-red-600'}`}
              >
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Confirming...' : 'Confirm Email'}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendCode}
                className="text-sm text-blue-600 hover:underline"
                disabled={isLoading}
              >
                Didn&apos;t receive a code? Resend
              </button>
            </div>

            <div className="text-center text-sm">
              Already confirmed?{' '}
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="text-blue-600 hover:underline"
              >
                Sign in
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ConfirmEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="text-center">
            <div className="text-lg">Loading...</div>
          </div>
        </div>
      }
    >
      <ConfirmEmailContent />
    </Suspense>
  )
}
