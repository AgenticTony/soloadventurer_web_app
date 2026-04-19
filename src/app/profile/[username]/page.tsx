'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { ProfileLayout } from '@/components/layout/ProfileLayout'
import { ProfileHeader } from '@/components/features/profile/ProfileHeader'
import { TravelStatus } from '@/components/features/profile/TravelStatus'
import { ProfileStatsBar } from '@/components/features/profile/ProfileStatsBar'
import { ProfileDetailsCard } from '@/components/features/profile/ProfileDetailsCard'
import { WorldMap } from '@/components/features/profile/WorldMap'
import { ProfileTabs, useProfileTabs } from '@/components/features/profile/ProfileTabs'
import { ProfileTabContent } from '@/components/features/profile/ProfileTabContent'

interface ProfilePageProps {
  params: Promise<{ username: string }>
}

export default function OtherUserProfilePage({ params }: ProfilePageProps) {
  const { username } = use(params)
  const { user: currentUser } = useAuth()
  const router = useRouter()
  const { activeTab, setActiveTab } = useProfileTabs()

  // TODO: Replace with Supabase lookup by username
  const profileUser = {
    id: 'stub-' + username,
    name: username.charAt(0).toUpperCase() + username.slice(1),
    email: `${username}@example.com`,
    avatar: undefined as string | undefined,
    bio: undefined as string | undefined,
    location: undefined as string | undefined,
    emailVerified: true,
    username,
    coverUrl: undefined as string | undefined,
  }

  const isOwnProfile = currentUser?.id === profileUser.id

  if (isOwnProfile) {
    router.push('/profile')
    return null
  }

  const visitedCountries: string[] = []

  return (
    <ProfileLayout>
      <div className="space-y-7 pb-16">
        <ProfileHeader
          user={profileUser}
          isOwnProfile={false}
          onConnect={() => {
            // TODO: Connection request flow
          }}
          onMessage={() => {
            // TODO: Open message thread
          }}
          onReport={() => {
            // TODO: Report/block flow
          }}
        />

        <TravelStatus />

        <ProfileStatsBar
          countriesVisited={0}
          citiesExplored={0}
          travelBuddies={0}
          adventures={0}
          isOwnProfile={false}
        />

        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="grid gap-7 lg:grid-cols-[1fr_320px]">
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
                  isOwnProfile={false}
                  visitedCountries={visitedCountries}
                  adventuresCount={0}
                />
              </motion.div>
            </div>

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
                    bio: profileUser.bio,
                    location: profileUser.location,
                    createdAt: undefined,
                    travelPreferences: [],
                    interests: [],
                  }}
                />
              </motion.div>

              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
                }}
              >
                <WorldMap visitedCountries={visitedCountries} className="bg-grain card-base p-4" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </ProfileLayout>
  )
}
