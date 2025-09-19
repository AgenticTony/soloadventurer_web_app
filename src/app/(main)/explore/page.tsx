'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Dynamically import the heavy ExploreMapContainer to reduce initial bundle size
const ExploreMapContainer = dynamic(
  () => import('@/components/features/ExploreMapContainer').then(mod => ({ default: mod.ExploreMapContainer })),
  {
    loading: () => (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading map components...</p>
        </div>
      </div>
    ),
    ssr: false, // Disable SSR for client-side only components
  }
);

function ExplorePageContent() {
  return (
    <div className="h-screen w-full">
      <ErrorBoundary context="explore map">
        <ExploreMapContainer />
      </ErrorBoundary>
    </div>
  );
}


function LoadingFallback() {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Loading explore map...</p>
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ExplorePageContent />
    </Suspense>
  );
}

