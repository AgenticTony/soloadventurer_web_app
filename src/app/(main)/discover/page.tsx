'use client'

import { Suspense, useState } from 'react'
import { useUserLocation } from '@/hooks/useUserLocation'
import { DiscoverTabBar } from '@/components/features/discover/DiscoverTabBar'
import { NearYouTab } from '@/components/features/discover/NearYouTab'
import { PeopleTab } from '@/components/features/discover/PeopleTab'
import { FeedTab } from '@/components/features/discover/FeedTab'
import { MeetupsTab } from '@/components/features/discover/MeetupsTab'
import type { DiscoverTabId } from '@/types/discover'

function DiscoverPageContent() {
  const { location, requestLocation } = useUserLocation()
  const [activeTab, setActiveTab] = useState<DiscoverTabId>('near-you')

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
  )
}

function DiscoverPageLoading() {
  return (
    <div>
      <div className="border-b border-border py-2">
        <div className="flex gap-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 w-24 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
      <div className="space-y-6 py-6">
        <div className="bg-gradient-ocean-sunset h-48 animate-pulse rounded-2xl" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-9 w-24 animate-pulse rounded-full bg-muted" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl border border-border bg-card" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={<DiscoverPageLoading />}>
      <DiscoverPageContent />
    </Suspense>
  )
}
