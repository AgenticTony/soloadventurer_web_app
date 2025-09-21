'use client'

import { useState, use, useEffect } from 'react'
import { ProfileLayout } from '@/components/layout/ProfileLayout'
import {
  MapPin, Globe, Camera, Users,
  Mountain, Plane, Heart, MessageCircle, Share2,
  Award, Compass, Map, CameraIcon, Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { WaveButton } from '@/components/waves/WaveButton'
import { MutualMatchCelebration } from '@/components/waves/MutualMatchCelebration'
import { useWaves } from '@/hooks/useWaves'
import { useAuth } from '@/contexts/AuthContext'
import type { WaveWithUsers } from '@/types/wave'

interface ProfilePageProps {
  params: Promise<{
    username: string
  }>
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const { username } = use(params)
  const [activeTab, setActiveTab] = useState('adventures')
  const [showMutualCelebration, setShowMutualCelebration] = useState(false)
  const { user: currentUser } = useAuth()
  const { getWavesByUser, isConnected, respondToWave } = useWaves()

  // Mock user data - in real app, this would come from API
  const profileUser = {
    id: 'user-' + username,
    name: 'Sarah Chen',
    username: username,
    email: 'sarah@example.com',
  }

  // Get wave status between current user and profile user
  const getWaveStatus = (): {
    status: 'none' | 'sent' | 'received' | 'mutual';
    wave?: WaveWithUsers;
  } => {
    if (!currentUser || currentUser.id === profileUser.id) return { status: 'none' }

    const sentWaves = getWavesByUser(currentUser.id)
    const receivedWaves = getWavesByUser(profileUser.id)

    // Check for mutual connection
    const mutualWave = sentWaves.find(w =>
      w.toUserId === profileUser.id && w.status === 'accepted' && w.isMutual
    )
    if (mutualWave) return { status: 'mutual', wave: mutualWave }

    // Check for sent wave
    const sentWave = sentWaves.find(w =>
      w.toUserId === profileUser.id && w.status === 'pending'
    )
    if (sentWave) return { status: 'sent', wave: sentWave }

    // Check for received wave
    const receivedWave = receivedWaves.find(w =>
      w.fromUserId === profileUser.id && w.status === 'pending'
    )
    if (receivedWave) return { status: 'received', wave: receivedWave }

    return { status: 'none' }
  }

  const waveStatus = getWaveStatus()

  const handleWaveResponse = async (response: 'accepted' | 'declined') => {
    if (waveStatus.status === 'received' && waveStatus.wave) {
      try {
        await respondToWave(waveStatus.wave.id, response)
        if (response === 'accepted') {
          setShowMutualCelebration(true)
        }
      } catch (error) {
        console.error('Failed to respond to wave:', error)
      }
    }
  }

  const tabs = [
    { id: 'adventures', label: 'Adventures', icon: Compass },
    { id: 'photos', label: 'Gallery', icon: CameraIcon },
    { id: 'map', label: 'Travel Map', icon: Map },
    { id: 'buddies', label: 'Travel Buddies', icon: Users },
  ]

  const stats = [
    { label: 'Countries Visited', value: 23, icon: Globe, color: 'from-blue-500 to-cyan-600' },
    { label: 'Cities Explored', value: 67, icon: MapPin, color: 'from-purple-500 to-pink-600' },
    { label: 'Travel Buddies', value: 156, icon: Users, color: 'from-green-500 to-teal-600' },
    { label: 'Adventures', value: 89, icon: Mountain, color: 'from-orange-500 to-red-600' },
  ]

  const achievements = [
    { icon: Mountain, label: "Mountain Explorer", description: "Climbed 5+ peaks" },
    { icon: Plane, label: "Frequent Flyer", description: "100,000+ miles" },
    { icon: Camera, label: "Travel Photographer", description: "1000+ photos shared" },
    { icon: Users, label: "Social Butterfly", description: "Met 50+ travelers" },
  ]

  return (
    <ProfileLayout>
      {/* Hero Section */}
      <div className="relative h-[500px] bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative h-full flex items-center justify-center text-white px-4">
          <div className="text-center">
            {/* Avatar */}
            <div className="w-40 h-40 mx-auto mb-6 relative">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-purple-700 flex items-center justify-center shadow-2xl">
                <span className="text-6xl font-bold">S</span>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2">
                <Award className="w-6 h-6 text-white" />
              </div>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-4">Sarah Chen</h1>
            <p className="text-xl md:text-2xl mb-6 opacity-90">@{username} • Solo Adventurer</p>

            <div className="flex justify-center gap-4 mb-8">
              <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-4 py-2">
                <MapPin className="w-4 h-4 mr-1" />
                Currently in Bali
              </Badge>
              <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-4 py-2">
                <Globe className="w-4 h-4 mr-1" />
                23 Countries
              </Badge>
            </div>

            {/* Wave Status & Actions */}
            <div className="flex flex-col items-center gap-4">
              {/* Wave Status Badge */}
              {waveStatus.status === 'mutual' && (
                <Badge className="bg-purple-600/20 backdrop-blur-sm text-white border-purple-300/30 px-6 py-2 text-base">
                  <Zap className="w-5 h-5 mr-2" />
                  Mutual Connection!
                </Badge>
              )}
              {waveStatus.status === 'sent' && (
                <Badge className="bg-blue-600/20 backdrop-blur-sm text-white border-blue-300/30 px-6 py-2">
                  <div className="w-2 h-2 bg-blue-300 rounded-full mr-2 animate-pulse" />
                  Wave Sent - Waiting for Response
                </Badge>
              )}
              {waveStatus.status === 'received' && (
                <Badge className="bg-green-600/20 backdrop-blur-sm text-white border-green-300/30 px-6 py-2">
                  <div className="w-2 h-2 bg-green-300 rounded-full mr-2 animate-pulse" />
                  {profileUser.name} Waved at You!
                </Badge>
              )}
              {!isConnected && (
                <Badge className="bg-amber-600/20 backdrop-blur-sm text-white border-amber-300/30 px-4 py-2">
                  <div className="w-2 h-2 bg-amber-300 rounded-full mr-2" />
                  Offline Mode
                </Badge>
              )}

              {/* Action Buttons */}
              <div className="flex justify-center gap-4">
                {currentUser && currentUser.id !== profileUser.id && (
                  <>
                    {waveStatus.status === 'none' && (
                      <WaveButton
                        toUserId={profileUser.id}
                        size="lg"
                        variant="primary"
                        className="bg-white text-gray-900 hover:bg-gray-100 border-white"
                        onWaveSent={() => {
                          // Optimistic update handled by WaveButton and store
                        }}
                      />
                    )}
                    {waveStatus.status === 'received' && (
                      <div className="flex gap-3">
                        <Button
                          size="lg"
                          className="bg-green-600 text-white hover:bg-green-700"
                          onClick={() => handleWaveResponse('accepted')}
                        >
                          <Heart className="w-5 h-5 mr-2" />
                          Accept Wave
                        </Button>
                        <Button
                          size="lg"
                          variant="outline"
                          className="text-white border-white hover:bg-white/20"
                          onClick={() => handleWaveResponse('declined')}
                        >
                          Decline
                        </Button>
                      </div>
                    )}
                    {(waveStatus.status === 'sent' || waveStatus.status === 'mutual') && (
                      <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                        <Users className="w-5 h-5 mr-2" />
                        Connected
                      </Button>
                    )}
                  </>
                )}
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/20">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Message
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-16 -mt-20 relative">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`relative overflow-hidden rounded-2xl p-6 text-white bg-gradient-to-br ${stat.color} transform hover:scale-105 transition-transform`}
            >
              <div className="relative z-10">
                <div className="mb-4 inline-flex rounded-lg bg-white/20 p-3">
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-4xl font-bold">{stat.value}</div>
                <div className="mt-2 text-sm opacity-90">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Achievements */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Travel Achievements</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.label}
                className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 text-center cursor-pointer hover:scale-105 transition-transform"
              >
                <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white mb-4">
                  <achievement.icon className="w-8 h-8" />
                </div>
                <h3 className="font-semibold mb-1">{achievement.label}</h3>
                <p className="text-sm text-muted-foreground">{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
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
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'adventures' && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="group cursor-pointer hover:-translate-y-2 transition-transform"
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
                </div>
              ))}
            </div>
          )}

          {activeTab === 'map' && (
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-2xl h-[500px] flex items-center justify-center">
              <div className="text-center">
                <Map className="w-16 h-16 mx-auto mb-4 text-blue-500" />
                <h3 className="text-2xl font-bold mb-2">Interactive Travel Map</h3>
                <p className="text-muted-foreground">Coming soon...</p>
              </div>
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 hover:scale-105 transition-transform"
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Camera className="w-8 h-8 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'buddies' && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
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
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mutual Match Celebration */}
        {showMutualCelebration && (
          <MutualMatchCelebration
            isVisible={showMutualCelebration}
            onClose={() => setShowMutualCelebration(false)}
            user={{
              id: profileUser.id,
              name: profileUser.name,
              avatar: undefined,
              location: 'Bali, Indonesia',
            }}
          />
        )}
      </div>
    </ProfileLayout>
  )
}