'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mountain, Camera, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { WorldMap } from '@/components/features/profile/WorldMap'
import type { ProfileTabId } from './ProfileTabs'

interface ProfileTabContentProps {
  activeTab: ProfileTabId
  isOwnProfile: boolean
  visitedCountries: string[]
  adventuresCount: number
}

export function ProfileTabContent({
  activeTab,
  isOwnProfile,
  visitedCountries,
  adventuresCount,
}: ProfileTabContentProps) {
  const router = useRouter()

  switch (activeTab) {
    case 'adventures':
      return (
        <AdventuresTab
          isOwnProfile={isOwnProfile}
          count={adventuresCount}
          onAddTrip={() => router.push('/trips')}
        />
      )
    case 'gallery':
      return (
        <GalleryTab isOwnProfile={isOwnProfile} onUpload={() => router.push('/profile/edit')} />
      )
    case 'map':
      return (
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <WorldMap visitedCountries={visitedCountries} />
        </div>
      )
    case 'stats':
      return <StatsTab visitedCountries={visitedCountries} />
    default:
      return null
  }
}

function AdventuresTab({
  isOwnProfile,
  count,
  onAddTrip,
}: {
  isOwnProfile: boolean
  count: number
  onAddTrip: () => void
}) {
  if (count === 0) {
    return (
      <div className="py-12 text-center">
        <Mountain className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-1 text-lg font-semibold text-foreground">No Adventures Yet</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          {isOwnProfile
            ? 'Start your journey by planning your first trip!'
            : "This traveler hasn't shared any adventures yet."}
        </p>
        {isOwnProfile && (
          <Button onClick={onAddTrip} size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            Plan Your First Trip
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="card-interactive animate-in">
          <CardContent className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="font-semibold text-foreground">Adventure #{i + 1}</h4>
            </div>
            <p className="text-sm text-muted-foreground">Trip details coming soon...</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function GalleryTab({ isOwnProfile, onUpload }: { isOwnProfile: boolean; onUpload: () => void }) {
  return (
    <div className="py-12 text-center">
      <Camera className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
      <h3 className="mb-1 text-lg font-semibold text-foreground">No Photos Yet</h3>
      <p className="mb-4 text-sm text-muted-foreground">
        {isOwnProfile ? 'Share your travel memories with the community!' : 'No photos shared yet.'}
      </p>
      {isOwnProfile && (
        <Button onClick={onUpload} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Upload Photos
        </Button>
      )}
    </div>
  )
}

function StatsTab({ visitedCountries }: { visitedCountries: string[] }) {
  const stats = [
    { label: 'Profile Views', value: 0 },
    { label: 'Engagement', value: 0 },
    { label: 'Connection Requests', value: 0 },
    { label: 'Countries Explored', value: visitedCountries.length },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {stats.map(stat => (
        <Card key={stat.label}>
          <CardContent className="p-4">
            <div className="mb-1 text-2xl font-bold text-foreground">{stat.value}</div>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
