'use client'

import { Suspense, useEffect, useState } from 'react'
import { PostComposer } from '@/components/features/feed/PostComposer'
import { TrendingUp } from 'lucide-react'
import { getFeed } from '@/lib/api'
import type { FeedItem } from '@/lib/api'

function FeedContent() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])

  useEffect(() => {
    const loadFeed = async () => {
      try {
        setLoading(true)
        setError(null)
        const feed = await getFeed()
        setFeedItems(feed)
      } catch (err) {
        console.error('Failed to load feed:', err)
        setError(err instanceof Error ? err.message : 'Failed to load feed')
      } finally {
        setLoading(false)
      }
    }

    loadFeed()
  }, [])

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="border-b border-border pb-4">
          <h1 className="text-2xl font-bold text-foreground">Your Feed</h1>
          <p className="mt-1 text-sm text-muted-foreground">Discover stories from fellow travelers</p>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card-base p-4 animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="border-b border-border pb-4">
          <h1 className="text-2xl font-bold text-foreground">Your Feed</h1>
          <p className="mt-1 text-sm text-muted-foreground">Discover stories from fellow travelers</p>
        </div>
        <div className="card-base p-6 text-center">
          <h3 className="text-lg font-semibold text-destructive mb-2">Unable to load feed</h3>
          <p className="text-muted-foreground">
            There was an error loading your feed. Please try again later.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold text-foreground">Your Feed</h1>
        <p className="mt-1 text-sm text-muted-foreground">Discover stories from fellow travelers</p>
      </div>

      {/* Post Composer */}
      <PostComposer />

      {/* Feed Posts */}
      <div className="space-y-6">
        {feedItems.length === 0 ? (
          <div className="card-base p-8 text-center">
            <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No posts in your feed yet</h3>
            <p className="text-muted-foreground">
              Start following travelers or create your first post to see content here!
            </p>
          </div>
        ) : (
          feedItems.map((item) => (
            <div key={item.id} className="card-base p-4">
              <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
              {item.excerpt && (
                <p className="text-muted-foreground mb-2">{item.excerpt}</p>
              )}
              <div className="text-sm text-muted-foreground">
                {new Date(item.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default function FeedPage() {
  return (
    <Suspense fallback={<div>Loading feed...</div>}>
      <FeedContent />
    </Suspense>
  )
}
