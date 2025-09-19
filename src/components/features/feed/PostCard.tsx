'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  Heart,
  MessageCircle,
  Share2,
  MapPin,
  Clock,
  MoreHorizontal,
  Bookmark,
  ThumbsUp,
} from 'lucide-react'

interface PostCardProps {
  id: string
  author: {
    id: string
    name: string
    username: string
    avatar?: string
    isVerified?: boolean
  }
  content: string
  photos?: Array<{
    id: string
    url: string
    alt?: string
  }>
  location?: {
    id: string
    name: string
    country?: string
  }
  trip?: {
    id: string
    name: string
  }
  timestamp: Date | string
  reactions: Array<{
    type: 'like' | 'love'
    count: number
    hasReacted?: boolean
  }>
  commentCount: number
  shareCount: number
  isBookmarked?: boolean
  onReaction?: (postId: string, reactionType: string) => void
  onComment?: () => void
  onShare?: (postId: string) => void
  onBookmark?: (postId: string) => void
}

export function PostCard({
  id,
  author,
  content,
  photos,
  location,
  timestamp,
  reactions,
  commentCount,
  shareCount,
  isBookmarked,
  onReaction,
  onComment,
  onShare,
  onBookmark,
}: PostCardProps) {
  const [bookmarked, setBookmarked] = useState(isBookmarked || false)

  const handleReaction = (reactionType: string) => {
    onReaction?.(id, reactionType)
  }

  const handleBookmark = () => {
    setBookmarked(!bookmarked)
    onBookmark?.(id)
  }

  const formatTimestamp = (timestamp: Date | string) => {
    const now = new Date()
    const postTime = timestamp instanceof Date ? timestamp : new Date(timestamp)
    const diffInHours = Math.floor((now.getTime() - postTime.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`

    // Use consistent date format to avoid hydration issues
    const day = postTime.getDate()
    const month = postTime.getMonth() + 1
    const year = postTime.getFullYear()
    return `${month}/${day}/${year}`
  }

  const renderPhotoGrid = () => {
    if (!photos || photos.length === 0) return null

    if (photos.length === 1) {
      return (
        <div className="mt-3 overflow-hidden rounded-xl">
          <Image
            src={photos[0].url}
            alt={photos[0].alt || 'Post image'}
            width={800}
            height={400}
            className="h-auto max-h-[400px] w-full object-cover"
          />
        </div>
      )
    }

    if (photos.length === 2) {
      return (
        <div className="mt-3 grid grid-cols-2 gap-1 overflow-hidden rounded-xl">
          {photos.map((photo, index) => (
            <div key={photo.id} className="aspect-square">
              <Image
                src={photo.url}
                alt={photo.alt || `Post image ${index + 1}`}
                width={400}
                height={400}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      )
    }

    if (photos.length === 3) {
      return (
        <div className="mt-3 grid grid-cols-2 gap-1 overflow-hidden rounded-xl">
          <div className="row-span-2">
            <Image
              src={photos[0].url}
              alt={photos[0].alt || 'Post image 1'}
              width={400}
              height={800}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="aspect-square">
            <Image
              src={photos[1].url}
              alt={photos[1].alt || 'Post image 2'}
              width={400}
              height={400}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="aspect-square">
            <Image
              src={photos[2].url}
              alt={photos[2].alt || 'Post image 3'}
              width={400}
              height={400}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      )
    }

    if (photos.length === 4) {
      return (
        <div className="mt-3 grid grid-cols-2 gap-1 overflow-hidden rounded-xl">
          {photos.map((photo, index) => (
            <div key={photo.id} className="aspect-square">
              <Image
                src={photo.url}
                alt={photo.alt || `Post image ${index + 1}`}
                width={400}
                height={400}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      )
    }

    // For more than 4 images, show first 4 with overlay
    return (
      <div className="mt-3 grid grid-cols-2 gap-1 overflow-hidden rounded-xl">
        {photos.slice(0, 4).map((photo, index) => (
          <div key={photo.id} className="relative aspect-square">
            <Image
              src={photo.url}
              alt={photo.alt || `Post image ${index + 1}`}
              width={400}
              height={400}
              className="h-full w-full object-cover"
            />
            {index === 3 && photos.length > 4 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <span className="text-lg font-bold text-white">+{photos.length - 4}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="mb-4 rounded-2xl bg-card p-4 shadow-card">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <span className="text-sm font-medium text-foreground">{author.name.charAt(0)}</span>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{author.name}</h3>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              {location && (
                <div className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span>{location.name}</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{formatTimestamp(timestamp)}</span>
              </div>
            </div>
          </div>
        </div>

        <button className="rounded-lg p-2 transition-colors hover:bg-muted">
          <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      {/* Content */}
      <div className="mb-3">
        <p className="leading-relaxed text-foreground">{content}</p>
      </div>

      {/* Photo Grid */}
      {renderPhotoGrid()}

      {/* Stats */}
      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <span>{reactions.reduce((sum, r) => sum + r.count, 0)} reactions</span>
          <span>{commentCount} comments</span>
          <span>{shareCount} shares</span>
        </div>
      </div>

      {/* Reaction Buttons */}
      <div className="mt-3 flex items-center justify-around border-t border-border pt-3">
        {reactions.map(reaction => (
          <button
            key={reaction.type}
            onClick={() => handleReaction(reaction.type)}
            className={clsx(
              'flex items-center space-x-2 rounded-lg px-4 py-2 transition-colors',
              reaction.hasReacted
                ? 'text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            {reaction.type === 'love' ? (
              <Heart className={clsx('h-5 w-5', reaction.hasReacted && 'fill-current')} />
            ) : (
              <ThumbsUp className={clsx('h-5 w-5', reaction.hasReacted && 'fill-current')} />
            )}
            <span className="font-medium">{reaction.count}</span>
          </button>
        ))}

        <button
          onClick={onComment}
          className="flex items-center space-x-2 rounded-lg px-4 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="font-medium">Comment</span>
        </button>

        <button
          onClick={() => onShare?.(id)}
          className="flex items-center space-x-2 rounded-lg px-4 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Share2 className="h-5 w-5" />
          <span className="font-medium">Share</span>
        </button>

        <button
          onClick={handleBookmark}
          className={clsx(
            'flex items-center space-x-2 rounded-lg px-4 py-2 transition-colors',
            bookmarked
              ? 'text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <Bookmark className={clsx('h-5 w-5', bookmarked && 'fill-current')} />
          <span className="font-medium">Save</span>
        </button>
      </div>
    </div>
  )
}

function clsx(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}
