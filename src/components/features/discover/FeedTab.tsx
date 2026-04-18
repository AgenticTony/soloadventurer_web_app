'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Rss, Camera, Plane, Lightbulb, TrendingUp, ChevronUp,
  Image as ImageIcon, MapPin, Clock, Smile,
} from 'lucide-react';
import { clsx } from 'clsx';
import { getFeed } from '@/lib/api';
import type { FeedItem } from '@/lib/api';

type FeedFilter = 'latest' | 'popular' | 'photos' | 'trips' | 'tips';

const FEED_FILTERS: { id: FeedFilter; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'latest', label: 'Latest', icon: Clock },
  { id: 'popular', label: 'Popular', icon: TrendingUp },
  { id: 'photos', label: 'Photos', icon: Camera },
  { id: 'trips', label: 'Trip Updates', icon: Plane },
  { id: 'tips', label: 'Tips', icon: Lightbulb },
];

const SUGGESTED_TRAVELERS = [
  { id: '1', name: 'Sarah Chen', location: 'Tokyo, Japan', interests: ['Photography', 'Food'] },
  { id: '2', name: 'Marco Rossi', location: 'Rome, Italy', interests: ['History', 'Architecture'] },
  { id: '3', name: 'Aisha Patel', location: 'Mumbai, India', interests: ['Yoga', 'Cooking'] },
  { id: '4', name: 'James Wilson', location: 'Sydney, Australia', interests: ['Surfing', 'Hiking'] },
  { id: '5', name: 'Yuki Tanaka', location: 'Kyoto, Japan', interests: ['Tea Ceremony', 'Art'] },
];

const TRENDING_POSTS = [
  { id: 't1', title: 'Hidden gems in Lisbon', author: 'TravelPro99', likes: 234 },
  { id: 't2', title: 'Solo hiking in Patagonia', author: 'WanderlustAmy', likes: 189 },
  { id: 't3', title: 'Best street food in Bangkok', author: 'FoodieNomad', likes: 156 },
];

const ROTATING_PROMPTS = [
  "What's happening in your city?",
  'Share a travel tip...',
  'Where are you headed next?',
  'Found a hidden gem? Share it!',
];

export function FeedTab() {
  const [activeFilter, setActiveFilter] = useState<FeedFilter>('latest');
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [composerExpanded, setComposerExpanded] = useState(false);
  const [composerText, setComposerText] = useState('');
  const [newPostsCount, setNewPostsCount] = useState(0);
  const [promptIndex] = useState(() => Math.floor(Math.random() * ROTATING_PROMPTS.length));

  useEffect(() => {
    getFeed()
      .then(setFeedItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (feedItems.length > 0) {
      const timer = setTimeout(() => setNewPostsCount(12), 30000);
      return () => clearTimeout(timer);
    }
  }, [feedItems.length]);

  const handleSubmitPost = useCallback(() => {
    if (composerText.trim()) {
      setComposerText('');
      setComposerExpanded(false);
    }
  }, [composerText]);

  const isEmpty = feedItems.length === 0 && !loading;

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {FEED_FILTERS.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={clsx(
              'flex-shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-all',
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
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {composerExpanded ? (
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-brand">U</span>
              </div>
              <div className="flex-1">
                <textarea
                  autoFocus
                  placeholder={ROTATING_PROMPTS[promptIndex]}
                  value={composerText}
                  onChange={(e) => setComposerText(e.target.value)}
                  className="w-full min-h-[80px] p-2 bg-transparent resize-none focus:outline-none text-foreground placeholder:text-muted-foreground text-sm"
                  rows={3}
                />
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                      <Smile className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setComposerExpanded(false); setComposerText(''); }}
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
            className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center flex-shrink-0">
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
          className="mx-auto flex items-center gap-1.5 bg-brand text-brand-foreground rounded-full px-4 py-2 text-sm font-medium shadow-md hover:bg-brand/90 transition-colors animate-in"
        >
          <ChevronUp className="h-4 w-4" />
          {newPostsCount} new posts
        </button>
      )}

      {/* Feed Content */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card-base p-4 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 bg-muted rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-24 mb-1" />
                  <div className="h-3 bg-muted rounded w-32" />
                </div>
              </div>
              <div className="h-20 bg-muted rounded-lg" />
            </div>
          ))}
        </div>
      ) : isEmpty ? (
        <ActivationFunnel />
      ) : (
        <div className="space-y-4">
          {feedItems.map((item) => (
            <div key={item.id} className="card-base p-4">
              <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
              {item.excerpt && <p className="text-sm text-muted-foreground mb-2">{item.excerpt}</p>}
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
  );
}

function ActivationFunnel() {
  return (
    <div className="space-y-6">
      {/* Suggested Travelers */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-brand" />
          Travelers you should meet
        </h3>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {SUGGESTED_TRAVELERS.map((t) => (
            <div key={t.id} className="flex-shrink-0 w-44 bg-card rounded-2xl border border-border p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-ocean-sunset flex items-center justify-center text-white font-semibold">
                {t.name.charAt(0)}
              </div>
              <p className="text-sm font-semibold text-foreground">{t.name}</p>
              <p className="text-xs text-muted-foreground mb-2">{t.location}</p>
              <div className="flex flex-wrap justify-center gap-1 mb-3">
                {t.interests.map((i) => (
                  <span key={i} className="text-xs bg-brand/10 text-brand rounded-full px-2 py-0.5">{i}</span>
                ))}
              </div>
              <button className="btn-connection px-3 py-1.5 text-xs w-full rounded-xl">Say hi</button>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Stories */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Rss className="h-4 w-4 text-connection" />
          Trending stories
        </h3>
        <div className="space-y-2">
          {TRENDING_POSTS.map((post) => (
            <div key={post.id} className="flex items-center justify-between bg-card rounded-xl border border-border p-3 hover:bg-muted/50 transition-colors cursor-pointer">
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
      <div className="rounded-2xl bg-gradient-ocean-sunset p-5 text-white">
        <h3 className="font-semibold mb-1">Become a featured creator</h3>
        <p className="text-sm text-white/80 mb-3">Share your adventures and inspire other solo travelers</p>
        <button className="bg-white text-brand px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/90 transition-colors">
          Start Sharing
        </button>
      </div>
    </div>
  );
}
