'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Shield,
  Calendar,
  Zap,
  MapPin,
  Globe,
  Users,
  Star,
  Camera,
  Target,
  type LucideIcon,
} from 'lucide-react'

interface Achievement {
  id: string
  icon: LucideIcon
  label: string
  description: string
  unlocked: boolean
  progress?: number
  maxProgress?: number
}

interface AchievementSystemProps {
  countriesVisited: number
  citiesExplored: number
  hasProfilePhoto: boolean
  hasCompletedBio: boolean
  hasCreatedTrip: boolean
  emailVerified: boolean
  memberSince: string
  isOwnProfile: boolean
}

export function AchievementSystem({
  countriesVisited,
  citiesExplored,
  hasProfilePhoto,
  hasCompletedBio,
  hasCreatedTrip,
  emailVerified,
  memberSince,
  isOwnProfile,
}: AchievementSystemProps) {
  const [showLocked, setShowLocked] = useState(false)

  const achievements: Achievement[] = [
    {
      id: 'verified',
      icon: Shield,
      label: 'Verified',
      description: 'Email verified',
      unlocked: emailVerified,
    },
    {
      id: 'early',
      icon: Calendar,
      label: 'Early Adopter',
      description: `Joined ${new Date(memberSince).getFullYear()}`,
      unlocked: true,
    },
    {
      id: 'photo',
      icon: Camera,
      label: 'Face to Name',
      description: 'Upload a profile photo',
      unlocked: hasProfilePhoto,
    },
    {
      id: 'bio',
      icon: Zap,
      label: 'Storyteller',
      description: 'Complete your bio',
      unlocked: hasCompletedBio,
    },
    {
      id: 'first-country',
      icon: Globe,
      label: 'First Country',
      description: 'Visit your first country',
      unlocked: countriesVisited >= 1,
      progress: countriesVisited,
      maxProgress: 1,
    },
    {
      id: 'first-trip',
      icon: Target,
      label: 'Trip Planner',
      description: 'Create your first trip',
      unlocked: hasCreatedTrip,
    },
    {
      id: 'explorer',
      icon: Globe,
      label: 'Explorer',
      description: 'Visit 5 countries',
      unlocked: countriesVisited >= 5,
      progress: countriesVisited,
      maxProgress: 5,
    },
    {
      id: 'cities',
      icon: MapPin,
      label: 'Urban Explorer',
      description: 'Visit 5 cities',
      unlocked: citiesExplored >= 5,
      progress: citiesExplored,
      maxProgress: 5,
    },
    {
      id: 'globetrotter',
      icon: Globe,
      label: 'Globetrotter',
      description: 'Visit 10 countries',
      unlocked: countriesVisited >= 10,
      progress: countriesVisited,
      maxProgress: 10,
    },
    {
      id: 'social',
      icon: Users,
      label: 'Well Connected',
      description: 'Connect with 10 travelers',
      unlocked: false,
    },
    {
      id: 'photographer',
      icon: Star,
      label: 'Photographer',
      description: 'Share 50 photos',
      unlocked: false,
    },
  ]

  const unlocked = achievements.filter((a) => a.unlocked)
  const locked = achievements.filter((a) => !a.unlocked)

  // Weight completion: sign-up (verified+early+name) = ~40% base
  const completionPct = Math.round((unlocked.length / achievements.length) * 100)
  const isComplete = completionPct >= 100

  // Auto-dismiss when complete
  if (isComplete) return null
  // Don't show on other-user profiles if they have few achievements
  if (!isOwnProfile && unlocked.length <= 2) return null

  return (
    <Card>
      <CardContent className="p-5">
        {/* Progress header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm font-medium text-foreground">
            Profile Progress
          </div>
          <div className="flex items-center gap-2">
            <span className="badge-trust px-2 py-0.5 text-xs font-semibold">
              {completionPct}%
            </span>
          </div>
        </div>
        <Progress value={completionPct} className="mb-4 h-2" />

        {/* Unlocked */}
        <div className="flex flex-wrap gap-2">
          {unlocked.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary"
            >
              <a.icon className="h-3.5 w-3.5" />
              {a.label}
            </div>
          ))}
        </div>

        {/* Locked toggle */}
        {locked.length > 0 && (
          <button
            onClick={() => setShowLocked(!showLocked)}
            className="mt-3 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {showLocked ? 'Hide' : `View all (${locked.length} locked)`}
          </button>
        )}

        {showLocked && (
          <div className="mt-3 flex flex-wrap gap-2">
            {locked.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs text-muted-foreground"
              >
                <a.icon className="h-3.5 w-3.5" />
                {a.label}
                {a.maxProgress && a.progress !== undefined && (
                  <span className="ml-0.5 opacity-70">
                    {a.progress}/{a.maxProgress}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
