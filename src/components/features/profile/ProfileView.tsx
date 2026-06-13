'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { listTrips } from '@/lib/api'
import type { Trip } from '@/lib/api'
import { motion } from 'framer-motion'
import { ProfileLayout } from '@/components/layout/ProfileLayout'
import { ProfileHeader } from './ProfileHeader'
import { TravelStatus } from './TravelStatus'
import { ProfileStatsBar } from './ProfileStatsBar'
import { ProfileDetailsCard } from './ProfileDetailsCard'
import { AchievementSystem } from './AchievementSystem'
import { WorldMap } from './WorldMap'
import { ProfileTabs, useProfileTabs } from './ProfileTabs'
import { ProfileTabContent } from './ProfileTabContent'

export default function ProfileViewPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { activeTab, setActiveTab } = useProfileTabs()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    listTrips(user.id, { limit: 10 })
      .then(({ items }) => setTrips(items))
      .catch(() => setTrips([]))
      .finally(() => setLoading(false))
  }, [user])

  if (!user) {
    return (
      <ProfileLayout>
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="card-base max-w-sm p-8 text-center">
            <p className="mb-4 text-muted-foreground">Please log in to view your profile.</p>
            <button
              onClick={() => router.push('/sign-in')}
              className="btn-primary rounded-xl px-6 py-2 text-sm font-medium"
            >
              Go to Login
            </button>
          </div>
        </div>
      </ProfileLayout>
    )
  }

  // TODO: Replace stubs with Supabase data
  const currentCity = null
  const headingTo = null
  const headingDates = null
  const countriesVisited: string[] = []
  const citiesExplored = 0
  const travelBuddies = 0
  const travelPreferences: string[] = []
  const interests: string[] = []

  return (
    <ProfileLayout>
      <div className="space-y-7 pb-16">
        <ProfileHeader
          user={{
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            bio: user.bio,
            location: user.location,
            emailVerified: user.emailVerified,
            username: user.email?.split('@')[0],
          }}
          isOwnProfile
          onEdit={() => router.push('/profile/edit')}
        />

        <TravelStatus currentCity={currentCity} headingTo={headingTo} headingDates={headingDates} />

        <ProfileStatsBar
          countriesVisited={countriesVisited.length}
          citiesExplored={citiesExplored}
          travelBuddies={travelBuddies}
          adventures={trips.length}
          isOwnProfile
        />

        {/* Main content area — 2-column on lg */}
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="grid gap-7 lg:grid-cols-[1fr_320px]">
            {/* Left column */}
            <div className="space-y-6">
              <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ProfileTabContent
                  activeTab={activeTab}
                  isOwnProfile
                  visitedCountries={countriesVisited}
                  adventuresCount={trips.length}
                />
              </motion.div>
            </div>

            {/* Right sidebar — staggered reveal */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.1, delayChildren: 0.4 } },
              }}
              className="space-y-6"
            >
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
                }}
              >
                <ProfileDetailsCard
                  user={{
                    bio: user.bio,
                    location: user.location,
                    createdAt: user.createdAt,
                    travelPreferences,
                    interests,
                  }}
                />
              </motion.div>

              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
                }}
              >
                <WorldMap visitedCountries={countriesVisited} className="bg-grain card-base p-4" />
              </motion.div>

              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
                }}
              >
                <AchievementSystem
                  countriesVisited={countriesVisited.length}
                  citiesExplored={citiesExplored}
                  hasProfilePhoto={!!user.avatar}
                  hasCompletedBio={!!(user.bio && user.bio.length > 10)}
                  hasCreatedTrip={trips.length > 0}
                  emailVerified={user.emailVerified || false}
                  memberSince={user.createdAt || new Date().toISOString()}
                  isOwnProfile
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </ProfileLayout>
  )
}
