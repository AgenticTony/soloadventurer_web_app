import { Bookmark, MapPin } from 'lucide-react'
import Link from 'next/link'

export default function SavedPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-foreground">Saved</h1>
          <p className="text-lg text-muted-foreground">
            Your bookmarked travelers, trips, and places
          </p>
        </div>

        <div className="card-base mx-auto max-w-lg p-12 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand/10">
            <Bookmark className="h-8 w-8 text-brand" />
          </div>
          <h2 className="mb-3 text-2xl font-bold text-foreground">Coming Soon</h2>
          <p className="mb-6 text-muted-foreground">
            Save travelers, trips, and destinations you love so you can find them later.
          </p>
          <Link
            href="/discover"
            className="inline-flex items-center gap-2 rounded-2xl bg-brand px-6 py-2.5 font-medium text-brand-foreground transition-all duration-200 hover:bg-brand/90"
          >
            <MapPin className="h-4 w-4" />
            Find Travelers
          </Link>
        </div>
      </div>
    </div>
  )
}
