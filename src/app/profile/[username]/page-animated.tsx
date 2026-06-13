'use client'

import { useState, use } from 'react'
import { ProfileLayout } from '@/components/layout/ProfileLayout'
import { ParallaxHero } from '@/components/ui/parallax-hero'
import { AnimatedStatCard } from '@/components/ui/animated-stat-card'
import { TravelMap } from '@/components/ui/travel-map'
import { motion } from 'framer-motion'
import {
  MapPin,
  Globe,
  Camera,
  Users,
  Mountain,
  Plane,
  Heart,
  MessageCircle,
  Share2,
  Award,
  Compass,
  Map,
  CameraIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const adventureLocations = [
  { id: '1', name: 'Bali, Indonesia', coordinates: { x: 75, y: 65 }, visits: 3 },
  { id: '2', name: 'Tokyo, Japan', coordinates: { x: 85, y: 35 }, visits: 2 },
  { id: '3', name: 'Paris, France', coordinates: { x: 50, y: 25 }, visits: 1 },
  { id: '4', name: 'New York, USA', coordinates: { x: 25, y: 35 }, visits: 4 },
  { id: '5', name: 'Rio, Brazil', coordinates: { x: 35, y: 75 }, visits: 2 },
]

const achievements = [
  { icon: Mountain, label: 'Mountain Explorer', description: 'Climbed 5+ peaks' },
  { icon: Plane, label: 'Frequent Flyer', description: '100,000+ miles' },
  { icon: Camera, label: 'Travel Photographer', description: '1000+ photos shared' },
  { icon: Users, label: 'Social Butterfly', description: 'Met 50+ travelers' },
]

interface ProfilePageProps {
  params: Promise<{
    username: string
  }>
}

export default function AdventurousProfilePage({ params }: ProfilePageProps) {
  const { username } = use(params)
  const [activeTab, setActiveTab] = useState('adventures')

  const tabs = [
    { id: 'adventures', label: 'Adventures', icon: Compass },
    { id: 'photos', label: 'Gallery', icon: CameraIcon },
    { id: 'map', label: 'Travel Map', icon: Map },
    { id: 'buddies', label: 'Travel Buddies', icon: Users },
  ]

  return (
    <ProfileLayout>
      {/* Hero Section with Parallax */}
      <ParallaxHero className="relative">
        <div className="relative z-30 px-4 text-center text-white">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: 'spring' }}
            className="relative mx-auto mb-6 h-40 w-40"
          >
            <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-br from-blue-400 to-purple-600" />
            <div className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-700 shadow-2xl">
              <span className="text-6xl font-bold">S</span>
            </div>
            <motion.div
              className="absolute -bottom-2 -right-2 rounded-full bg-green-500 p-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Award className="h-6 w-6 text-white" />
            </motion.div>
          </motion.div>

          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-4 text-5xl font-bold md:text-6xl"
          >
            Sarah Chen
          </motion.h1>

          <motion.p
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-6 text-xl opacity-90 md:text-2xl"
          >
            @{username} • Solo Adventurer
          </motion.p>

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mb-8 flex justify-center gap-4"
          >
            <Badge className="border-white/30 bg-white/20 px-4 py-2 text-white backdrop-blur-sm">
              <MapPin className="mr-1 h-4 w-4" />
              Currently in Bali
            </Badge>
            <Badge className="border-white/30 bg-white/20 px-4 py-2 text-white backdrop-blur-sm">
              <Globe className="mr-1 h-4 w-4" />
              23 Countries
            </Badge>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.9, type: 'spring' }}
            className="flex justify-center gap-4"
          >
            <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
              <Users className="mr-2 h-5 w-5" />
              Connect
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/20"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Message
            </Button>
          </motion.div>
        </div>
      </ParallaxHero>

      {/* Animated Stats Section */}
      <div className="container relative z-40 mx-auto -mt-20 px-4 py-16">
        <div className="mb-16 grid grid-cols-2 gap-4 md:grid-cols-4">
          <AnimatedStatCard
            label="Countries Visited"
            value={23}
            icon={<Globe className="h-6 w-6" />}
            color="bg-gradient-to-br from-blue-500 to-cyan-600"
          />
          <AnimatedStatCard
            label="Cities Explored"
            value={67}
            icon={<MapPin className="h-6 w-6" />}
            color="bg-gradient-to-br from-purple-500 to-pink-600"
          />
          <AnimatedStatCard
            label="Travel Buddies"
            value={156}
            icon={<Users className="h-6 w-6" />}
            color="bg-gradient-to-br from-green-500 to-teal-600"
          />
          <AnimatedStatCard
            label="Adventures"
            value={89}
            icon={<Mountain className="h-6 w-6" />}
            color="bg-gradient-to-br from-orange-500 to-red-600"
          />
        </div>

        {/* Achievement Badges */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <h2 className="mb-8 text-center text-3xl font-bold">Travel Achievements</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.label}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 1.2 + index * 0.1, type: 'spring' }}
                whileHover={{ scale: 1.05 }}
                className="group cursor-pointer rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 p-6 text-center dark:from-gray-800 dark:to-gray-900"
              >
                <div className="mb-4 inline-flex rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-4 text-white transition-transform group-hover:scale-110">
                  <achievement.icon className="h-8 w-8" />
                </div>
                <h3 className="mb-1 font-semibold">{achievement.label}</h3>
                <p className="text-sm text-muted-foreground">{achievement.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          className="mb-8"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <div className="flex justify-center">
            <div className="inline-flex rounded-full bg-muted p-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-full px-6 py-3 font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-background text-foreground shadow-lg'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <tab.icon className="mr-2 inline h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.7 }}>
          {activeTab === 'map' && (
            <div className="mb-16">
              <h2 className="mb-8 text-center text-3xl font-bold">My Travel Journey</h2>
              <TravelMap locations={adventureLocations} className="h-[500px]" />
            </div>
          )}

          {activeTab === 'adventures' && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  whileHover={{ y: -10 }}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-square overflow-hidden rounded-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600" />
                    <div className="absolute inset-0 bg-black/30 transition-colors group-hover:bg-black/50" />
                    <div className="absolute inset-0 flex flex-col justify-between p-6 text-white">
                      <div>
                        <Badge className="mb-2 border-white/30 bg-white/20 backdrop-blur-sm">
                          Adventure #{i}
                        </Badge>
                        <h3 className="mb-2 text-2xl font-bold">Epic Journey {i}</h3>
                        <p className="opacity-90">
                          An amazing adventure story that inspired many...
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span>
                          <Heart className="mr-1 inline h-4 w-4" />
                          234
                        </span>
                        <span>
                          <MessageCircle className="mr-1 inline h-4 w-4" />
                          45
                        </span>
                        <span>
                          <Share2 className="mr-1 inline h-4 w-4" />
                          12
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 * i }}
                  whileHover={{ scale: 1.05 }}
                  className="relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800"
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Camera className="h-8 w-8 text-gray-400" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'buddies' && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="rounded-2xl bg-card p-6 shadow-lg transition-shadow hover:shadow-xl"
                >
                  <div className="mb-4 flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-xl font-bold text-white">
                      B{i}
                    </div>
                    <div>
                      <h3 className="font-semibold">Buddy {i}</h3>
                      <p className="text-sm text-muted-foreground">Met in Tokyo</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary">Adventure</Badge>
                    <Badge variant="secondary">Photography</Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </ProfileLayout>
  )
}
