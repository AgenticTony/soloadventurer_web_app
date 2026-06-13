import { Calendar, MapPin } from 'lucide-react'
import Link from 'next/link'

export default function MeetupsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-foreground">Meetups</h1>
          <p className="text-lg text-muted-foreground">
            Find travelers near you and plan meetups on the road
          </p>
        </div>

        {/* Coming Soon Card */}
        <div className="card-base mx-auto max-w-lg p-12 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand/10">
            <Calendar className="h-8 w-8 text-brand" />
          </div>
          <h2 className="mb-3 text-2xl font-bold text-foreground">Coming Soon</h2>
          <p className="mb-6 text-muted-foreground">
            We&apos;re building a better way to connect with fellow travelers. Meetups, group
            events, and local hangouts — all in one place.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/discover"
              className="rounded-2xl bg-brand px-6 py-2.5 font-medium text-brand-foreground transition-all duration-200 hover:bg-brand/90"
            >
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Find Travelers
              </span>
            </Link>
            <Link
              href="/trips"
              className="rounded-2xl bg-secondary px-6 py-2.5 font-medium text-secondary-foreground transition-all duration-200 hover:bg-secondary/80"
            >
              Browse Trips
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
