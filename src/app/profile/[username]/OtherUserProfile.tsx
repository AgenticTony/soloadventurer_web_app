'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import { getProfileByUsername, TripsApiError, type PublicProfile } from '@/lib/api'
import { requestConnection } from '@/lib/api/matching'
import { ProfileLayout } from '@/components/layout/ProfileLayout'
import { ProfileHeader } from '@/components/features/profile/ProfileHeader'
import { TravelStatus } from '@/components/features/profile/TravelStatus'
import { ProfileStatsBar } from '@/components/features/profile/ProfileStatsBar'
import { ProfileDetailsCard } from '@/components/features/profile/ProfileDetailsCard'
import { WorldMap } from '@/components/features/profile/WorldMap'
import { ProfileTabs, useProfileTabs } from '@/components/features/profile/ProfileTabs'
import { ProfileTabContent } from '@/components/features/profile/ProfileTabContent'

interface OtherUserProfileProps {
  username: string
}

export function OtherUserProfile({ username }: OtherUserProfileProps) {
  const { user: currentUser } = useAuth()
  const router = useRouter()
  const { activeTab, setActiveTab } = useProfileTabs()

  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setNotFound(false)
    setError(null)
    setProfile(null)

    getProfileByUsername(username)
      .then(data => {
        if (cancelled) return
        // Viewing your own username -> go to the canonical /profile
        if (currentUser?.id && currentUser.id === data.id) {
          router.replace('/profile')
          return
        }
        setProfile(data)
      })
      .catch(err => {
        if (cancelled) return
        if (err instanceof TripsApiError && err.message === 'Profile not found') {
          setNotFound(true)
        } else {
          setError(err instanceof Error ? err.message : 'Failed to load profile')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [username, currentUser?.id, router])

  const handleConnect = async () => {
    if (!profile) return
    try {
      await requestConnection(profile.id)
      toast.success('Connection request sent')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send connection request')
    }
  }

  const handleMessage = () => {
    router.push('/chat')
  }

  if (loading) {
    return (
      <ProfileLayout>
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
          <span className="ml-3 text-muted-foreground">Loading profile…</span>
        </div>
      </ProfileLayout>
    )
  }

  if (notFound) {
    return (
      <ProfileLayout>
        <div className="py-24 text-center">
          <h1 className="mb-2 text-2xl font-bold text-foreground">Profile not found</h1>
          <p className="text-muted-foreground">
            We couldn&apos;t find a traveler named @{username}.
          </p>
        </div>
      </ProfileLayout>
    )
  }

  if (error || !profile) {
    return (
      <ProfileLayout>
        <div className="py-24 text-center">
          <h1 className="mb-2 text-2xl font-bold text-foreground">Something went wrong</h1>
          <p className="text-muted-foreground">{error ?? 'Failed to load profile'}</p>
        </div>
      </ProfileLayout>
    )
  }

  // Email is private — never exposed for another user's profile.
  const profileUser = {
    id: profile.id,
    name: profile.name,
    email: '',
    avatar: profile.avatar,
    bio: profile.bio,
    location: undefined,
    emailVerified: false,
    username: profile.username,
    coverUrl: undefined,
  }

  const visitedCountries: string[] = []

  return (
    <ProfileLayout>
      <div className="space-y-7 pb-16">
        <ProfileHeader
          user={profileUser}
          isOwnProfile={false}
          onConnect={handleConnect}
          onMessage={handleMessage}
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
