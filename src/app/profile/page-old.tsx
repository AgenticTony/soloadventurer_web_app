'use client'

import { useState } from 'react'
import { ProfileCard } from '@/components/features/profile/ProfileCard'
import { ProfileForm } from '@/components/features/profile/ProfileForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { ProfileLayout } from '@/components/layout/ProfileLayout'

export default function ProfilePage() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)

  if (!user) {
    return <div>Please log in to view your profile.</div>
  }

  return (
    <ProfileLayout>
      <div className="bg-gray-50 min-h-screen">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid lg:grid-cols-4 xl:grid-cols-5 gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1 xl:col-span-2">
            <ProfileCard isOwnProfile={true} onEdit={() => setIsEditing(true)} />
            
            {/* Quick Actions */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  📷 Upload Avatar
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  ✈️ Add Travel Preferences
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  🏷️ Set Travel Interests
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  🔒 Privacy Settings
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Profile Form or Content */}
          <div className="lg:col-span-3">
            {isEditing ? (
              <ProfileForm />
            ) : (
              <div className="space-y-6">
                {/* Profile Completion */}
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Completion</CardTitle>
                    <CardDescription>
                      Complete your profile to get better travel buddy matches
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '35%' }}></div>
                      </div>
                      <p className="text-sm text-gray-600">35% Complete</p>
                      
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-green-600">✓</span>
                          <span>Basic Info</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-green-600">✓</span>
                          <span>Email Verified</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">○</span>
                          <span>Travel Preferences</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">○</span>
                          <span>Profile Photo</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">○</span>
                          <span>Travel History</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">○</span>
                          <span>Interests</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Your latest actions on SoloAdventurer</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-gray-500">
                      <p>No recent activity</p>
                      <p className="text-sm mt-2">Start exploring to see your activity here!</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Travel Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle>Travel Statistics</CardTitle>
                    <CardDescription>Your travel journey so far</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-2">0</div>
                        <div className="text-sm text-gray-600">Countries Visited</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600 mb-2">0</div>
                        <div className="text-sm text-gray-600">Cities Explored</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600 mb-2">0</div>
                        <div className="text-sm text-gray-600">Travel Buddies</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-orange-600 mb-2">0</div>
                        <div className="text-sm text-gray-600">Reviews Written</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="text-center">
                  <Button onClick={() => setIsEditing(true)} size="lg">
                    Edit Profile
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
    </ProfileLayout>
  )
}