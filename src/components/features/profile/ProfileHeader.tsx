'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Pencil,
  Camera,
  Shield,
  MapPin,
  UserPlus,
  MessageCircle,
  Flag,
  MoreHorizontal,
  ChevronDown,
} from 'lucide-react'
import type { User } from '@/types/auth'

interface ProfileHeaderProps {
  user: Pick<User, 'id' | 'name' | 'email' | 'avatar' | 'bio' | 'location' | 'emailVerified'> & {
    username?: string
    coverUrl?: string
  }
  isOwnProfile: boolean
  onEdit?: () => void
  onConnect?: () => void
  onMessage?: () => void
  onReport?: () => void
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

export function ProfileHeader({
  user,
  isOwnProfile,
  onEdit,
  onConnect,
  onMessage,
  onReport,
}: ProfileHeaderProps) {
  const router = useRouter()
  const coverRef = useRef<HTMLInputElement>(null)
  const [showActions, setShowActions] = useState(false)
  const [bioExpanded, setBioExpanded] = useState(false)

  const displayName =
    user.name && !user.name.includes('@')
      ? user.name
      : user.email?.split('@')[0] || 'Solo Adventurer'

  const initials = displayName.charAt(0).toUpperCase()
  const handle = user.username || user.email?.split('@')[0] || ''
  const bioIsLong = (user.bio?.length ?? 0) > 120

  return (
    <div className="relative">
      {/* ── Cover ── */}
      <div className="relative h-52 overflow-hidden sm:h-64 md:h-72">
        {user.coverUrl ? (
          <>
            <img
              src={user.coverUrl}
              alt="Cover"
              className="h-full w-full object-cover mask-letterbox"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
          </>
        ) : (
          <div className="bg-cover-warm h-full w-full">
            {/* Subtle geometric decoration */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute right-8 top-8 h-32 w-32 rounded-full border-2 border-white/40" />
              <div className="absolute right-20 top-16 h-48 w-48 rounded-full border border-white/20" />
              <div className="absolute -bottom-4 -left-4 h-40 w-40 rounded-full bg-white/5" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          </div>
        )}

        {/* Edit cover overlay */}
        {isOwnProfile && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            onClick={() => coverRef.current?.click()}
            className="absolute bottom-4 right-4 z-20 flex items-center gap-2 rounded-2xl bg-foreground/60 px-4 py-2 text-xs font-medium text-background backdrop-blur-md transition-all hover:bg-foreground/80"
          >
            <Camera className="h-3.5 w-3.5" />
            Change cover
          </motion.button>
        )}
        <input
          ref={coverRef}
          type="file"
          accept="image/*"
          className="hidden"
          aria-label="Upload cover photo"
        />
      </div>

      {/* ── Profile info — asymmetric overlap ── */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="relative flex flex-col gap-4 pb-5 sm:flex-row sm:items-end sm:gap-8">
          {/* Avatar — dramatic overlap */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="-mt-20 sm:-mt-24"
          >
            <div className="relative">
              <div className="h-[120px] w-[120px] overflow-hidden rounded-full ring-[3px] ring-background shadow-xl sm:h-[128px] sm:w-[128px]">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-cover-warm">
                    <span className="font-display text-5xl font-bold text-white">{initials}</span>
                  </div>
                )}
              </div>
              {user.emailVerified && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring', stiffness: 400, damping: 15 }}
                  className="absolute -bottom-0.5 -right-0.5 rounded-full bg-trust p-1.5 ring-[3px] ring-background"
                >
                  <Shield className="h-3.5 w-3.5 text-trust-foreground" />
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Name + handle + location — editorial typesetting */}
          <motion.div
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="min-w-0 flex-1 pt-3 sm:pb-1"
          >
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {displayName}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              {handle && (
                <span className="font-medium text-muted-foreground">@{handle}</span>
              )}
              {user.location && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-brand" />
                  {user.location}
                </span>
              )}
            </div>

            {/* Bio — editorial excerpt */}
            {user.bio ? (
              <div className="mt-3">
                <p className={`text-sm leading-relaxed text-text-secondary ${!bioExpanded && bioIsLong ? 'line-clamp-2' : ''}`}>
                  {user.bio}
                </p>
                {bioIsLong && (
                  <button
                    onClick={() => setBioExpanded(!bioExpanded)}
                    className="mt-1 flex items-center gap-0.5 text-xs font-medium text-primary transition-colors hover:text-primary/80"
                  >
                    {bioExpanded ? 'Less' : 'Read more'}
                    <ChevronDown className={`h-3 w-3 transition-transform ${bioExpanded ? 'rotate-180' : ''}`} />
                  </button>
                )}
              </div>
            ) : (
              isOwnProfile && (
                <motion.button
                  custom={2}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  onClick={onEdit}
                  className="mt-3 rounded-xl border border-dashed border-primary/30 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:border-primary/60 hover:bg-primary/5"
                >
                  + Add a bio
                </motion.button>
              )
            )}
          </motion.div>

          {/* Action buttons */}
          <motion.div
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex shrink-0 items-center gap-2 sm:pb-1"
          >
            {isOwnProfile ? (
              <Button
                onClick={() => onEdit?.() ?? router.push('/profile/edit')}
                variant="outline"
                size="sm"
                className="gap-1.5 rounded-2xl"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit Profile
              </Button>
            ) : (
              <>
                <Button
                  onClick={onConnect}
                  size="sm"
                  className="btn-connection gap-1.5 rounded-2xl shadow-md shadow-connection/20"
                >
                  <UserPlus className="h-4 w-4" />
                  Say hi
                </Button>
                <Button
                  onClick={onMessage}
                  variant="outline"
                  size="sm"
                  className="gap-1.5 rounded-2xl"
                >
                  <MessageCircle className="h-4 w-4" />
                  Message
                </Button>
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-2xl"
                    onClick={() => setShowActions(!showActions)}
                    aria-label="More actions"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                  <AnimatePresence>
                    {showActions && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full z-30 mt-2 w-48 rounded-2xl border border-border bg-card p-1.5 shadow-xl"
                      >
                        <button
                          onClick={() => {
                            onReport?.()
                            setShowActions(false)
                          }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-destructive transition-colors hover:bg-destructive/10"
                        >
                          <Flag className="h-4 w-4" />
                          Report / Block
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
