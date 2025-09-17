'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to SoloAdventurer
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your journey begins here. Connect with fellow travelers and explore the world together.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8 py-3">
                Get Started
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>🌍 Find Travel Companions</CardTitle>
              <CardDescription>
                Connect with like-minded solo travelers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Match with travelers who share your interests and travel style.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🗺️ Plan Together</CardTitle>
              <CardDescription>
                Create and share travel itineraries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Collaborate on trip plans and discover new destinations together.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>💬 Stay Connected</CardTitle>
              <CardDescription>
                Chat and coordinate with your travel group
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Real-time messaging and location sharing throughout your journey.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}