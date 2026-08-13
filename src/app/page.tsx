import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

/**
 * Public landing page — the acquisition surface (FOUNDATIONS §5, web re-mission).
 *
 * Copy is held to the charter in §1: a vetted platform where solo travelers meet
 * *verified* people in the city they are in now, measured by whether a real
 * meetup happened and was worth repeating.
 *
 * The previous copy sold a different product — "find your perfect travel
 * companion", "our intelligent matching system" — which is the matching-app
 * framing FOUNDATIONS explicitly supersedes, and it never once mentioned
 * verification, the thing that actually differentiates this. It also claimed
 * "thousands of solo travelers already connecting", which is not true.
 *
 * `src/__tests__/wanderlust-voice/landing-copy.test.tsx` guards both.
 */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Hero */}
        <div className="mb-16 text-center">
          <h1 className="mb-6 text-5xl font-bold text-gray-900">SoloAdventurer</h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600">
            Meet verified solo travelers in the city you&apos;re in right now. Every member is
            ID-checked before they can reach you.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="px-8 py-3 text-lg">
                Get Verified
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* What the product actually is: verification → meeting → reputation */}
        <div className="mb-16 grid gap-8 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>🪪 Verified before you meet</CardTitle>
              <CardDescription>
                Government ID and a live selfie, checked against each other
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Nobody reaches you without passing identity verification first. Women can choose to
                be matched only with other verified women.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📍 People who are actually here</CardTitle>
              <CardDescription>
                Matched on the city you&apos;re in and the dates you overlap
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Not a directory of people somewhere in the world. Travelers whose trip overlaps
                yours, close enough to meet this week.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🤝 Meetups you can trust</CardTitle>
              <CardDescription>
                Share plans with a trusted contact; check in when you arrive
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Reputation is built from meetups that actually happened — not followers, not posts.
                Someone who doesn&apos;t show up carries it with them.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900">
            Travelling solo shouldn&apos;t mean meeting strangers blind.
          </h2>
          <p className="mb-8 text-lg text-gray-600">
            Verification takes a few minutes and it&apos;s free.
          </p>
          <Link href="/signup">
            <Button size="lg" className="px-12 py-4 text-lg">
              Create Free Account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
