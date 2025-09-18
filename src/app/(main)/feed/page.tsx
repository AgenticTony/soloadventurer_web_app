'use client'

import { Suspense } from 'react'
import { useQuery } from '@apollo/client'
import { PostComposer } from '@/components/features/feed/PostComposer'
import { PostCard } from '@/components/features/feed/PostCard'
import { TrendingUp } from 'lucide-react'
import { GET_USER_FEED } from '@/graphql/queries'
import type { GetUserFeedResponse, TripPost } from '@/graphql/types'


function FeedContent() {
  const { data, loading, error } = useQuery<GetUserFeedResponse>(GET_USER_FEED, {
    variables: { limit: 10 },
    errorPolicy: 'all'
  })

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
            {error.message || 'There was an error loading your feed. Please try again later.'}
          </p>
        </div>
      </div>
    )
  }

  const feedPosts = data?.getUserFeed || []

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
        {feedPosts.length === 0 ? (
          <div className="card-base p-8 text-center">
            <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No posts in your feed yet</h3>
            <p className="text-muted-foreground">
              Start following travelers or create your first post to see content here!
            </p>
          </div>
        ) : (
          feedPosts.map((post: TripPost) => (
            <PostCard
              key={post.id}
              id={post.id}
              author={{
                id: post.user.id,
                name: post.user.name,
                username: post.user.email?.split('@')[0] || post.user.name,
                avatar: post.user.avatar,
                isVerified: false
              }}
              content={post.content}
              photos={post.images?.items?.map(img => ({
                id: img.id,
                url: img.url,
                alt: img.caption || ''
              }))}
              location={post.location ? {
                id: post.location,
                name: post.location,
                country: ''
              } : undefined}
              trip={post.trip ? {
                id: post.trip.id,
                name: post.trip.title
              } : undefined}
              timestamp={post.createdAt}
              reactions={[
                { type: 'like', count: post.likes?.items?.length || 0 },
                { type: 'love', count: 0 }
              ]}
              commentCount={post.comments?.items?.length || 0}
              shareCount={0}
              isBookmarked={false}
            />
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
