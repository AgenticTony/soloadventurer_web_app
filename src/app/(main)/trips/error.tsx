'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function TripsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to console (in production, send to error reporting service)
    console.error('Trips page error:', error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 text-center shadow-lg">
        <div className="mb-4">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
        </div>

        <h1 className="mb-2 text-xl font-semibold text-gray-900">Trips Error</h1>

        <p className="mb-6 text-gray-600">
          We encountered an error while loading your trips. This might be due to a network issue or
          temporary server problem.
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
            Try Again
          </Button>

          <Link href="/feed">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Feed
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
