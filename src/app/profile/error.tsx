'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Profile page error:', error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 text-center shadow-lg">
        <div className="mb-4">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
        </div>

        <h1 className="mb-2 text-xl font-semibold text-gray-900">Profile Error</h1>

        <p className="mb-6 text-gray-600">
          We couldn&apos;t load the profile information. This might be due to authentication issues
          or server problems.
        </p>

        {/* Error details in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-left">
            <h3 className="mb-2 text-sm font-semibold text-red-800">Error Details:</h3>
            <p className="break-all font-mono text-xs text-red-700">{error.message}</p>
            {error.digest && <p className="mt-1 text-xs text-red-600">Error ID: {error.digest}</p>}
          </div>
        )}

        <div className="flex justify-center gap-3">
          <Button onClick={reset} variant="default" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Reload Profile
          </Button>

          <Link href="/feed">
            <Button variant="outline" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Back to Feed
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
