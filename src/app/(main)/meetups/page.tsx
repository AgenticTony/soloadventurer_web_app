import { Calendar, MapPin } from 'lucide-react'
import Link from 'next/link'

export default function MeetupsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Meetups
          </h1>
          <p className="text-lg text-muted-foreground">
            Find travelers near you and plan meetups on the road
          </p>
        </div>

        {/* Coming Soon Card */}
        <div className="card-base p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-8 h-8 text-brand" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Coming Soon
          </h2>
          <p className="text-muted-foreground mb-6">
            We&apos;re building a better way to connect with fellow travelers.
            Meetups, group events, and local hangouts — all in one place.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/discover"
              className="px-6 py-2.5 bg-brand text-brand-foreground rounded-2xl hover:bg-brand/90 transition-all duration-200 font-medium"
            >
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Find Travelers
              </span>
            </Link>
            <Link
              href="/trips"
              className="px-6 py-2.5 bg-secondary text-secondary-foreground rounded-2xl hover:bg-secondary/80 transition-all duration-200 font-medium"
            >
              Browse Trips
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
