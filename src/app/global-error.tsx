'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log critical global error
    console.error('Global application error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 text-center shadow-lg">
            <div className="mb-4">
              <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
            </div>

            <h1 className="mb-2 text-xl font-semibold text-gray-900">Application Error</h1>

            <p className="mb-6 text-gray-600">
              Something went wrong with the application. Please refresh the page or contact support
              if the problem persists.
            </p>

            {/* Error details in development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-left">
                <h3 className="mb-2 text-sm font-semibold text-red-800">Error Details:</h3>
                <p className="break-all font-mono text-xs text-red-700">{error.message}</p>
                {error.digest && (
                  <p className="mt-1 text-xs text-red-600">Error ID: {error.digest}</p>
                )}
              </div>
            )}

            <div className="flex justify-center gap-3">
              <button
                onClick={reset}
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>

              <button
                onClick={() => (window.location.href = '/')}
                className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
              >
                <Home className="h-4 w-4" />
                Go Home
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
