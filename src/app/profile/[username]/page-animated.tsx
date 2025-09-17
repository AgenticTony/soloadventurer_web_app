'use client'

import { useState, use } from 'react'
import { ProfileLayout } from '@/components/layout/ProfileLayout'
import { AnimatedGradientBackground } from '@/components/ui/animated-gradient-background'
import { ParallaxHero } from '@/components/ui/parallax-hero'
import { AnimatedStatCard } from '@/components/ui/animated-stat-card'
import { TravelMap } from '@/components/ui/travel-map'
import { motion } from 'framer-motion'
import { 
  MapPin, Globe, Calendar, Camera, Users, Star, 
  Mountain, Plane, Heart, MessageCircle, Share2,
  Award, Compass, Map, Backpack, CameraIcon
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
  { icon: Mountain, label: "Mountain Explorer", description: "Climbed 5+ peaks" },
  { icon: Plane, label: "Frequent Flyer", description: "100,000+ miles" },
  { icon: Camera, label: "Travel Photographer", description: "1000+ photos shared" },
  { icon: Users, label: "Social Butterfly", description: "Met 50+ travelers" },
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
        <div className="relative z-30 text-center text-white px-4">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="w-40 h-40 mx-auto mb-6 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full animate-pulse" />
            <div className="relative w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-700 flex items-center justify-center shadow-2xl">
              <span className="text-6xl font-bold">S</span>
            </div>
            <motion.div
              className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Award className="w-6 h-6 text-white" />
            </motion.div>
          </motion.div>

          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-6xl font-bold mb-4"
          >
            Sarah Chen
          </motion.h1>

          <motion.p
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xl md:text-2xl mb-6 opacity-90"
          >
            @{username} • Solo Adventurer
          </motion.p>

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex justify-center gap-4 mb-8"
          >
            <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-4 py-2">
              <MapPin className="w-4 h-4 mr-1" />
              Currently in Bali
            </Badge>
            <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-4 py-2">
              <Globe className="w-4 h-4 mr-1" />
              23 Countries
            </Badge>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.9, type: "spring" }}
            className="flex justify-center gap-4"
          >
            <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
              <Users className="w-5 h-5 mr-2" />
              Connect
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/20">
              <MessageCircle className="w-5 h-5 mr-2" />
              Message
            </Button>
          </motion.div>
        </div>
      </ParallaxHero>

      {/* Animated Stats Section */}
      <div className="container mx-auto px-4 py-16 -mt-20 relative z-40">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          <AnimatedStatCard
            label="Countries Visited"
            value={23}
            icon={<Globe className="w-6 h-6" />}
            color="bg-gradient-to-br from-blue-500 to-cyan-600"
          />
          <AnimatedStatCard
            label="Cities Explored"
            value={67}
            icon={<MapPin className="w-6 h-6" />}
            color="bg-gradient-to-br from-purple-500 to-pink-600"
          />
          <AnimatedStatCard
            label="Travel Buddies"
            value={156}
            icon={<Users className="w-6 h-6" />}
            color="bg-gradient-to-br from-green-500 to-teal-600"
          />
          <AnimatedStatCard
            label="Adventures"
            value={89}
            icon={<Mountain className="w-6 h-6" />}
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
          <h2 className="text-3xl font-bold mb-8 text-center">Travel Achievements</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.label}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 1.2 + index * 0.1, type: "spring" }}
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 text-center cursor-pointer group"
              >
                <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white mb-4 group-hover:scale-110 transition-transform">
                  <achievement.icon className="w-8 h-8" />
                </div>
                <h3 className="font-semibold mb-1">{achievement.label}</h3>
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
            <div className="inline-flex p-1 bg-muted rounded-full">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-full font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-background text-foreground shadow-lg'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <tab.icon className="w-4 h-4 inline mr-2" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.7 }}
        >
          {activeTab === 'map' && (
            <div className="mb-16">
              <h2 className="text-3xl font-bold mb-8 text-center">My Travel Journey</h2>
              <TravelMap locations={adventureLocations} className="h-[500px]" />
            </div>
          )}

          {activeTab === 'adventures' && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  whileHover={{ y: -10 }}
                  className="group cursor-pointer"
                >
                  <div className="relative rounded-2xl overflow-hidden aspect-square">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600" />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors" />
                    <div className="absolute inset-0 p-6 flex flex-col justify-between text-white">
                      <div>
                        <Badge className="bg-white/20 backdrop-blur-sm border-white/30 mb-2">
                          Adventure #{i}
                        </Badge>
                        <h3 className="text-2xl font-bold mb-2">Epic Journey {i}</h3>
                        <p className="opacity-90">An amazing adventure story that inspired many...</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span><Heart className="w-4 h-4 inline mr-1" />234</span>
                        <span><MessageCircle className="w-4 h-4 inline mr-1" />45</span>
                        <span><Share2 className="w-4 h-4 inline mr-1" />12</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 * i }}
                  whileHover={{ scale: 1.05 }}
                  className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800"
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Camera className="w-8 h-8 text-gray-400" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'buddies' && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="bg-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
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