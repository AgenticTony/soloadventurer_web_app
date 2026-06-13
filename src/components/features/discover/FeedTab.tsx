'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Rss,
  Camera,
  Plane,
  Lightbulb,
  TrendingUp,
  ChevronUp,
  Image as ImageIcon,
  MapPin,
  Clock,
  Smile,
} from 'lucide-react'
import { clsx } from 'clsx'
import { getFeed } from '@/lib/api'
import type { FeedItem } from '@/lib/api'

type FeedFilter = 'latest' | 'popular' | 'photos' | 'trips' | 'tips'

const FEED_FILTERS: {
  id: FeedFilter
  label: string
  icon: React.ComponentType<{ className?: string }>
}[] = [
  { id: 'latest', label: 'Latest', icon: Clock },
  { id: 'popular', label: 'Popular', icon: TrendingUp },
  { id: 'photos', label: 'Photos', icon: Camera },
  { id: 'trips', label: 'Trip Updates', icon: Plane },
  { id: 'tips', label: 'Tips', icon: Lightbulb },
]

const SUGGESTED_TRAVELERS = [
  { id: '1', name: 'Sarah Chen', location: 'Tokyo, Japan', interests: ['Photography', 'Food'] },
  { id: '2', name: 'Marco Rossi', location: 'Rome, Italy', interests: ['History', 'Architecture'] },
  { id: '3', name: 'Aisha Patel', location: 'Mumbai, India', interests: ['Yoga', 'Cooking'] },
  {
    id: '4',
    name: 'James Wilson',
    location: 'Sydney, Australia',
    interests: ['Surfing', 'Hiking'],
  },
  { id: '5', name: 'Yuki Tanaka', location: 'Kyoto, Japan', interests: ['Tea Ceremony', 'Art'] },
]

const TRENDING_POSTS = [
  { id: 't1', title: 'Hidden gems in Lisbon', author: 'TravelPro99', likes: 234 },
  { id: 't2', title: 'Solo hiking in Patagonia', author: 'WanderlustAmy', likes: 189 },
  { id: 't3', title: 'Best street food in Bangkok', author: 'FoodieNomad', likes: 156 },
]

const ROTATING_PROMPTS = [
  "What's happening in your city?",
  'Share a travel tip...',
  'Where are you headed next?',
  'Found a hidden gem? Share it!',
]

export function FeedTab() {
  const [activeFilter, setActiveFilter] = useState<FeedFilter>('latest')
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [composerExpanded, setComposerExpanded] = useState(false)
  const [composerText, setComposerText] = useState('')
  const [newPostsCount, setNewPostsCount] = useState(0)
  const [promptIndex] = useState(() => Math.floor(Math.random() * ROTATING_PROMPTS.length))

  useEffect(() => {
    getFeed()
      .then(setFeedItems)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (feedItems.length > 0) {
      const timer = setTimeout(() => setNewPostsCount(12), 30000)
      return () => clearTimeout(timer)
    }
  }, [feedItems.length])

  const handleSubmitPost = useCallback(() => {
    if (composerText.trim()) {
      setComposerText('')
      setComposerExpanded(false)
    }
  }, [composerText])

  const isEmpty = feedItems.length === 0 && !loading

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-1">
        {FEED_FILTERS.map(filter => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={clsx(
              'inline-flex flex-shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-all',
              activeFilter === filter.id
                ? 'bg-brand/10 text-brand'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <filter.icon className="h-3.5 w-3.5" />
            {filter.label}
          </button>
        ))}
      </div>

      {/* Collapsed Composer */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {composerExpanded ? (
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand/10">
                <span className="text-sm font-medium text-brand">U</span>
              </div>
              <div className="flex-1">
                <textarea
                  autoFocus
                  placeholder={ROTATING_PROMPTS[promptIndex]}
                  value={composerText}
                  onChange={e => setComposerText(e.target.value)}
                  className="min-h-[80px] w-full resize-none bg-transparent p-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  rows={3}
                />
                <div className="flex items-center justify-between border-t border-border pt-2">
                  <div className="flex items-center gap-2">
                    <button className="rounded-lg p-2 transition-colors hover:bg-muted">
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button className="rounded-lg p-2 transition-colors hover:bg-muted">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button className="rounded-lg p-2 transition-colors hover:bg-muted">
                      <Smile className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setComposerExpanded(false)
                        setComposerText('')
                      }}
                      className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitPost}
                      disabled={!composerText.trim()}
                      className="btn-connection px-4 py-1.5 text-sm disabled:opacity-50"
                    >
                      Share
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setComposerExpanded(true)}
            className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-muted/50"
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand/10">
              <span className="text-sm font-medium text-brand">U</span>
            </div>
            <span className="text-sm text-muted-foreground">{ROTATING_PROMPTS[promptIndex]}</span>
          </button>
        )}
      </div>

      {/* New Posts Pill */}
      {newPostsCount > 0 && (
        <button
          onClick={() => setNewPostsCount(0)}
          className="mx-auto flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-medium text-brand-foreground shadow-md transition-colors animate-in hover:bg-brand/90"
        >
          <ChevronUp className="h-4 w-4" />
          {newPostsCount} new posts
        </button>
      )}

      {/* Feed Content */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card-base animate-pulse p-4">
              <div className="mb-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div className="flex-1">
                  <div className="mb-1 h-4 w-24 rounded bg-muted" />
                  <div className="h-3 w-32 rounded bg-muted" />
                </div>
              </div>
              <div className="h-20 rounded-lg bg-muted" />
            </div>
          ))}
        </div>
      ) : isEmpty ? (
        <ActivationFunnel />
      ) : (
        <div className="space-y-4">
          {feedItems.map(item => (
            <div key={item.id} className="card-base p-4">
              <h3 className="mb-1 font-semibold text-foreground">{item.title}</h3>
              {item.excerpt && <p className="mb-2 text-sm text-muted-foreground">{item.excerpt}</p>}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
                <button className="btn-connection px-3 py-1 text-xs">Say hi</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ActivationFunnel() {
  return (
    <div className="space-y-6">
      {/* Suggested Travelers */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <TrendingUp className="h-4 w-4 text-brand" />
          Travelers you should meet
        </h3>
        <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
          {SUGGESTED_TRAVELERS.map(t => (
            <div
              key={t.id}
              className="w-44 flex-shrink-0 rounded-2xl border border-border bg-card p-4 text-center"
            >
              <div className="bg-gradient-ocean-sunset mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full font-semibold text-white">
                {t.name.charAt(0)}
              </div>
              <p className="text-sm font-semibold text-foreground">{t.name}</p>
              <p className="mb-2 text-xs text-muted-foreground">{t.location}</p>
              <div className="mb-3 flex flex-wrap justify-center gap-1">
                {t.interests.map(i => (
                  <span key={i} className="rounded-full bg-brand/10 px-2 py-0.5 text-xs text-brand">
                    {i}
                  </span>
                ))}
              </div>
              <button className="btn-connection w-full rounded-xl px-3 py-1.5 text-xs">
                Say hi
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Stories */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Rss className="h-4 w-4 text-connection" />
          Trending stories
        </h3>
        <div className="space-y-2">
          {TRENDING_POSTS.map(post => (
            <div
              key={post.id}
              className="flex cursor-pointer items-center justify-between rounded-xl border border-border bg-card p-3 transition-colors hover:bg-muted/50"
            >
              <div>
                <p className="text-sm font-medium text-foreground">{post.title}</p>
                <p className="text-xs text-muted-foreground">by {post.author}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                {post.likes}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Creator CTA */}
      <div className="bg-gradient-ocean-sunset rounded-2xl p-5 text-white">
        <h3 className="mb-1 font-semibold">Become a featured creator</h3>
        <p className="mb-3 text-sm text-white/80">
          Share your adventures and inspire other solo travelers
        </p>
        <button className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-brand transition-colors hover:bg-white/90">
          Start Sharing
        </button>
      </div>
    </div>
  )
}
