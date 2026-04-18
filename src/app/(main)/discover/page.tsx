'use client';

import { Suspense, useState } from 'react';
import { useUserLocation } from '@/hooks/useUserLocation';
import { DiscoverTabBar } from '@/components/features/discover/DiscoverTabBar';
import { NearYouTab } from '@/components/features/discover/NearYouTab';
import { PeopleTab } from '@/components/features/discover/PeopleTab';
import { FeedTab } from '@/components/features/discover/FeedTab';
import { MeetupsTab } from '@/components/features/discover/MeetupsTab';
import type { DiscoverTabId } from '@/types/discover';

function DiscoverPageContent() {
  const { location, requestLocation } = useUserLocation();
  const [activeTab, setActiveTab] = useState<DiscoverTabId>('near-you');

  return (
    <div>
      <DiscoverTabBar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="py-6">
        {activeTab === 'near-you' && (
          <NearYouTab userLocation={location} onRequestLocation={requestLocation} />
        )}
        {activeTab === 'people' && (
          <PeopleTab userLocation={location} onRequestLocation={requestLocation} />
        )}
        {activeTab === 'feed' && <FeedTab />}
        {activeTab === 'meetups' && <MeetupsTab />}
      </div>
    </div>
  );
}

function DiscoverPageLoading() {
  return (
    <div>
      <div className="py-2 border-b border-border">
        <div className="flex gap-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 w-24 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
      <div className="py-6 space-y-6">
        <div className="h-48 rounded-2xl bg-gradient-ocean-sunset animate-pulse" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-9 w-24 bg-muted rounded-full animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-card border border-border animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={<DiscoverPageLoading />}>
      <DiscoverPageContent />
    </Suspense>
  );
}
