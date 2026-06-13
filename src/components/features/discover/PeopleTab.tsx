'use client'

import { NearbyTravelersSection } from '@/components/features/matching/NearbyTravelersSection'

interface PeopleTabProps {
  userLocation?: { latitude: number; longitude: number; accuracy?: number } | null
  onRequestLocation: () => void
}

export function PeopleTab({ userLocation, onRequestLocation }: PeopleTabProps) {
  return (
    <NearbyTravelersSection userLocation={userLocation} onRequestLocation={onRequestLocation} />
  )
}
