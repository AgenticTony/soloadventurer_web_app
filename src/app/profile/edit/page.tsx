'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { ProfileLayout } from '@/components/layout/ProfileLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, Camera, Globe, Compass, Sparkles } from 'lucide-react'

const TRAVEL_STYLES = [
  'Solo',
  'Budget',
  'Luxury',
  'Adventure',
  'Cultural',
  'Backpacking',
  'Digital Nomad',
  'Slow Travel',
] as const

const INTEREST_OPTIONS = [
  'Hiking',
  'Photography',
  'Food & Dining',
  'History',
  'Art & Museums',
  'Water Sports',
  'Nightlife',
  'Wildlife',
  'Architecture',
  'Festivals',
  'Surfing',
  'Diving',
  'Yoga & Wellness',
  'Camping',
  'Road Trips',
] as const

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4 },
  }),
}

export default function ProfileEditPage() {
  const { user } = useAuth()
  const router = useRouter()

  const [name, setName] = useState(user?.name || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [location, setLocation] = useState(user?.location || '')
  const [travelStyles, setTravelStyles] = useState<string[]>([])
  const [interests, setInterests] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  if (!user) {
    return (
      <ProfileLayout>
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="card-base max-w-sm p-8 text-center">
            <p className="mb-4 text-muted-foreground">Please log in to edit your profile.</p>
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

  const toggleItem = (item: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item])
  }

  const handleSave = async () => {
    setSaving(true)
    // TODO: Wire to Supabase profile update
    await new Promise(r => setTimeout(r, 500))
    setSaving(false)
    router.push('/profile')
  }

  return (
    <ProfileLayout>
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        {/* Back + title */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 flex items-center gap-3"
        >
          <button
            onClick={() => router.push('/profile')}
            className="flex h-10 w-10 items-center justify-center rounded-2xl text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
            aria-label="Back to profile"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Edit Profile</h1>
            <p className="text-xs text-muted-foreground">Tell travelers who you are</p>
          </div>
        </motion.div>

        <div className="stagger-reveal space-y-6">
          {/* Avatar */}
          <Card className="bg-grain overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-brand via-trust to-connection" />
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Profile Photo
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-5">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full ring-2 ring-border">
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="bg-cover-warm flex h-full w-full items-center justify-center">
                    <span className="font-display text-3xl font-bold text-white">
                      {(user.name || user.email).charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <Button variant="outline" size="sm" className="gap-2 rounded-2xl">
                <Camera className="h-4 w-4" />
                Change photo
              </Button>
            </CardContent>
          </Card>

          {/* Basic info */}
          <Card className="bg-grain overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                <Sparkles className="mr-1.5 inline h-3.5 w-3.5 text-trust" />
                About You
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <label
                  htmlFor="edit-name"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Name
                </label>
                <Input
                  id="edit-name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  className="rounded-xl"
                />
              </div>
              <div>
                <label
                  htmlFor="edit-bio"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Bio
                </label>
                <textarea
                  id="edit-bio"
                  rows={4}
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Tell travelers about yourself and your travel style..."
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="edit-location"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Location
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="edit-location"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="City, Country"
                    className="rounded-xl pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Travel style */}
          <Card className="bg-grain overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                <Compass className="h-3.5 w-3.5 text-brand" />
                Travel Style
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {TRAVEL_STYLES.map(style => {
                  const active = travelStyles.includes(style)
                  return (
                    <motion.button
                      key={style}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleItem(style, travelStyles, setTravelStyles)}
                      className={`rounded-xl px-3.5 py-2 text-sm font-medium transition-all ${
                        active
                          ? 'bg-brand text-brand-foreground shadow-sm'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {style}
                    </motion.button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Interests */}
          <Card className="bg-grain overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Interests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map(interest => {
                  const active = interests.includes(interest)
                  return (
                    <motion.button
                      key={interest}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleItem(interest, interests, setInterests)}
                      className={`rounded-xl px-3.5 py-2 text-sm font-medium transition-all ${
                        active
                          ? 'bg-brand text-brand-foreground shadow-sm'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {interest}
                    </motion.button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pb-4 pt-2">
            <Button
              variant="outline"
              onClick={() => router.push('/profile')}
              className="rounded-2xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="gap-2 rounded-2xl shadow-md shadow-brand/20"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </ProfileLayout>
  )
}
