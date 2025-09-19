'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Profile page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="mb-4">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
        </div>

        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Profile Error
        </h1>

        <p className="text-gray-600 mb-6">
          We couldn&apos;t load the profile information. This might be due to authentication issues or server problems.
        </p>

        {/* Error details in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
            <h3 className="text-sm font-semibold text-red-800 mb-2">Error Details:</h3>
            <p className="text-xs text-red-700 font-mono break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-red-600 mt-1">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <Button
            onClick={reset}
            variant="default"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Reload Profile
          </Button>

          <Link href="/feed">
            <Button
              variant="outline"
              className="flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              Back to Feed
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}