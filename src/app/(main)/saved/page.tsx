import { Bookmark, MapPin } from 'lucide-react'
import Link from 'next/link'

export default function SavedPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Saved</h1>
          <p className="text-lg text-muted-foreground">
            Your bookmarked travelers, trips, and places
          </p>
        </div>

        <div className="card-base p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center mx-auto mb-6">
            <Bookmark className="w-8 h-8 text-brand" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">Coming Soon</h2>
          <p className="text-muted-foreground mb-6">
            Save travelers, trips, and destinations you love so you can find them later.
          </p>
          <Link
            href="/discover"
            className="px-6 py-2.5 bg-brand text-brand-foreground rounded-2xl hover:bg-brand/90 transition-all duration-200 font-medium inline-flex items-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            Find Travelers
          </Link>
        </div>
      </div>
    </div>
  )
}
