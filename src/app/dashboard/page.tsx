'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    window.location.href = '/sign-in'
  }

  return (
    <div className="bg-gray-50">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard
          </h2>
          <p className="text-gray-600">
            Welcome to your SoloAdventurer dashboard
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Profile Completion</CardTitle>
              <CardDescription>How complete is your profile?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">25%</div>
              <p className="text-sm text-gray-600">Complete your profile to get better matches</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Travel Buddies</CardTitle>
              <CardDescription>Connect with fellow travelers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">0</div>
              <p className="text-sm text-gray-600">Start exploring to find travel companions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Trips</CardTitle>
              <CardDescription>Your planned adventures</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">0</div>
              <p className="text-sm text-gray-600">Plan your first solo adventure</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with these common tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <Link href="/profile">
                <Button className="h-20 flex-col w-full">
                  <span className="text-lg mb-1">📝</span>
                  <span>Complete Profile</span>
                </Button>
              </Link>
              <Button variant="outline" className="h-20 flex-col">
                <span className="text-lg mb-1">🗺️</span>
                <span>Plan Trip</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <span className="text-lg mb-1">🔍</span>
                <span>Explore</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <span className="text-lg mb-1">💬</span>
                <span>Messages</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}