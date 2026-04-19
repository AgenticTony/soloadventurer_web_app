'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin, Calendar, Compass } from 'lucide-react'
import type { User } from '@/types/auth'

interface ProfileDetailsCardProps {
  user: Pick<User, 'bio' | 'location' | 'createdAt'> & {
    travelPreferences?: string[]
    interests?: string[]
  }
}

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35 },
  }),
}

export function ProfileDetailsCard({ user }: ProfileDetailsCardProps) {
  const hasContent =
    user.bio ||
    user.location ||
    (user.travelPreferences && user.travelPreferences.length > 0) ||
    (user.interests && user.interests.length > 0)

  if (!hasContent) return null

  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : null

  return (
    <Card className="bg-grain overflow-hidden">
      {/* Top accent bar */}
      <div className="h-1 bg-gradient-to-r from-brand via-trust to-connection" />
      <CardContent className="space-y-5 p-5">
        {/* Bio — editorial feel */}
        {user.bio && (
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
          >
            <div className="border-l-2 border-brand/30 pl-4">
              <p className="whitespace-pre-line text-sm leading-[1.7] text-foreground/90">
                {user.bio}
              </p>
            </div>
          </motion.div>
        )}

        {/* Location pill */}
        {user.location && (
          <motion.div
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex items-center gap-2"
          >
            <MapPin className="h-4 w-4 shrink-0 text-brand" />
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/8 px-3 py-1 text-xs font-semibold text-brand dark:bg-brand/15">
              {user.location}
            </span>
          </motion.div>
        )}

        {/* Travel preferences */}
        {user.travelPreferences && user.travelPreferences.length > 0 && (
          <motion.div
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
          >
            <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              <Compass className="h-3 w-3" />
              Travel Style
            </div>
            <div className="flex flex-wrap gap-1.5">
              {user.travelPreferences.map((pref) => (
                <span
                  key={pref}
                  className="rounded-lg bg-brand/8 px-2.5 py-1 text-xs font-medium text-brand dark:bg-brand/15"
                >
                  {pref}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Interests */}
        {user.interests && user.interests.length > 0 && (
          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
          >
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Interests
            </div>
            <div className="flex flex-wrap gap-1.5">
              {user.interests.map((interest) => (
                <span
                  key={interest}
                  className="rounded-lg bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
                >
                  {interest}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Joined date — subtle footer */}
        {joinedDate && (
          <motion.div
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex items-center gap-2 border-t border-border/50 pt-4 text-[11px] text-muted-foreground"
          >
            <Calendar className="h-3 w-3" />
            Joined {joinedDate}
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
