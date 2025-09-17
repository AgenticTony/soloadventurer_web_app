import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            SoloAdventurer
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect with fellow solo travelers, share amazing experiences, and find your perfect travel companion.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8 py-3">
                Start Your Journey
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
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle>🌍 Discover Travelers</CardTitle>
              <CardDescription>
                Find like-minded solo travelers exploring the same destinations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Connect with travelers who share your interests and travel style through our intelligent matching system.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🗺️ Plan Adventures</CardTitle>
              <CardDescription>
                Create and share detailed travel itineraries with the community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Plan your perfect trip with interactive maps, activity suggestions, and insights from experienced travelers.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>💬 Real-time Chat</CardTitle>
              <CardDescription>
                Stay connected with your travel companions throughout your journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Chat with matched travelers, share location updates, and coordinate meetups safely and securely.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Adventure Solo?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of solo travelers already connecting through SoloAdventurer
          </p>
          <Link href="/signup">
            <Button size="lg" className="text-lg px-12 py-4">
              Create Free Account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}