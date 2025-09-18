'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { listTrips } from '@/lib/api';
import { ExploreMap } from '@/components/features/ExploreMap';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import type { Trip } from '@/lib/api';

export function ExploreMapContainer() {
  const { user, isLoading: authLoading } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTrips() {
      if (authLoading) return;

      if (!user) {
        setLoading(false);
        setError('Please sign in to view trips on the map');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const tripsResponse = await listTrips();
        setTrips(tripsResponse.items);
      } catch (err) {
        console.error('Failed to load trips for explore page:', err);
        setError('Failed to load trips. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadTrips();
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">
            {authLoading ? 'Checking authentication...' : 'Loading trips...'}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="text-blue-500 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Sign In Required</h2>
          <p className="text-gray-600 mb-4">
            Please sign in to explore trips on the map.
          </p>
          <a
            href="/sign-in"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors inline-block"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="text-red-500 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.98-.833-2.75 0L3.064 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Trips</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return <ExploreMap trips={trips} />;
}