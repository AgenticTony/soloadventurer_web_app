'use client'

import { motion } from 'framer-motion'
import { Globe, MapPin, Users, Mountain, Plus, type LucideIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface StatItem {
  label: string
  value: number
  icon: LucideIcon
  addRoute: string
  addLabel: string
}

interface ProfileStatsBarProps {
  countriesVisited: number
  citiesExplored: number
  travelBuddies: number
  adventures: number
  isOwnProfile: boolean
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.3 + i * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

export function ProfileStatsBar({
  countriesVisited,
  citiesExplored,
  travelBuddies,
  adventures,
  isOwnProfile,
}: ProfileStatsBarProps) {
  const router = useRouter()

  const stats: StatItem[] = [
    {
      label: 'Countries',
      value: countriesVisited,
      icon: Globe,
      addRoute: '/trips',
      addLabel: 'First country',
    },
    {
      label: 'Cities',
      value: citiesExplored,
      icon: MapPin,
      addRoute: '/trips',
      addLabel: 'First city',
    },
    {
      label: 'Buddies',
      value: travelBuddies,
      icon: Users,
      addRoute: '/discover',
      addLabel: 'Find buddies',
    },
    {
      label: 'Adventures',
      value: adventures,
      icon: Mountain,
      addRoute: '/trips',
      addLabel: 'Plan a trip',
    },
  ]

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat, i) => {
          const hasValue = stat.value > 0

          return (
            <motion.div
              key={stat.label}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              whileHover={!hasValue && isOwnProfile ? { scale: 1.02 } : {}}
              whileTap={!hasValue && isOwnProfile ? { scale: 0.98 } : {}}
              className={`bg-grain flex flex-col items-center gap-2 rounded-2xl px-4 py-5 text-center transition-colors ${
                hasValue
                  ? 'card-base'
                  : isOwnProfile
                    ? 'cursor-pointer border-2 border-dashed border-border bg-card/50 hover:border-brand/30 hover:bg-brand/5'
                    : 'card-base opacity-50'
              }`}
              onClick={() => !hasValue && isOwnProfile && router.push(stat.addRoute)}
              role={!hasValue && isOwnProfile ? 'button' : undefined}
              tabIndex={!hasValue && isOwnProfile ? 0 : undefined}
            >
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                  hasValue ? 'bg-brand/10' : 'bg-muted'
                }`}
              >
                <stat.icon
                  className={`h-4 w-4 ${hasValue ? 'text-brand' : 'text-muted-foreground'}`}
                />
              </div>
              <span
                className={`font-display text-3xl font-bold tracking-tight ${
                  hasValue ? 'text-foreground' : 'text-muted-foreground/60'
                }`}
              >
                {stat.value}
              </span>
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </span>
              {!hasValue && isOwnProfile && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-brand">
                  <Plus className="h-3 w-3" />
                  {stat.addLabel}
                </span>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
