import { Suspense } from 'react';
import { ExploreMapContainer } from '@/components/features/ExploreMapContainer';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

function ExplorePageContent() {
  return (
    <div className="h-screen w-full">
      <ExploreMapContainer />
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

export const metadata = {
  title: 'Explore Trips | SoloAdventurer',
  description: 'Discover trips from fellow solo travelers around the world',
};