'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Heart, MessageCircle, Share, ZoomIn } from 'lucide-react'

interface PhotoGridProps {
  photos: Array<{
    id: string
    url: string
    caption?: string
    likes: number
    comments: number
    timestamp: string
    location?: string
  }>
  onLike?: (photoId: string) => void
  onComment?: (photoId: string) => void
  onShare?: (photoId: string) => void
  onView?: (photoId: string) => void
  className?: string
}

export function PhotoGrid({
  photos,
  onLike,
  onComment,
  onShare,
  onView,
  className = '',
}: PhotoGridProps) {
  const [hoveredPhoto, setHoveredPhoto] = useState<string | null>(null)

  const getGridItemClass = (index: number, total: number) => {
    if (total === 1) return 'col-span-2 row-span-2'
    if (total === 2) return 'col-span-1 row-span-2'
    if (total === 3) return index === 0 ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1'
    if (total === 4) return 'col-span-1 row-span-1'
    return 'col-span-1 row-span-1'
  }

  const handleLike = (photoId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onLike?.(photoId)
  }

  const handleComment = (photoId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onComment?.(photoId)
  }

  const handleShare = (photoId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onShare?.(photoId)
  }

  return (
    <div className={`grid grid-cols-2 gap-1 md:gap-2 ${className}`}>
      {photos.map((photo, index) => (
        <div
          key={photo.id}
          className={`group relative cursor-pointer overflow-hidden rounded-lg ${getGridItemClass(index, photos.length)} bg-muted`}
          onMouseEnter={() => setHoveredPhoto(photo.id)}
          onMouseLeave={() => setHoveredPhoto(null)}
          onClick={() => onView?.(photo.id)}
        >
          {/* Photo */}
          <div className="relative aspect-square h-full w-full">
            <Image
              src={photo.url}
              alt={photo.caption || 'Photo'}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          </div>

          {/* Overlay */}
          <div
            className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${hoveredPhoto === photo.id ? 'opacity-100' : 'opacity-0'} `}
          >
            <div className="absolute inset-0 flex flex-col justify-between p-3">
              {/* Top Actions */}
              <div className="flex justify-end">
                <button
                  onClick={e => {
                    e.stopPropagation()
                    onView?.(photo.id)
                  }}
                  className="rounded-lg bg-white/20 p-2 backdrop-blur-sm transition-colors hover:bg-white/30"
                >
                  <ZoomIn className="h-4 w-4 text-white" />
                </button>
              </div>

              {/* Bottom Info */}
              <div className="space-y-2">
                {/* Location */}
                {photo.location && (
                  <div className="flex items-center space-x-1">
                    <span className="text-xs font-medium text-white">{photo.location}</span>
                  </div>
                )}

                {/* Engagement Stats */}
                <div className="flex items-center space-x-4 text-white">
                  <button
                    onClick={e => handleLike(photo.id, e)}
                    className="flex items-center space-x-1 transition-colors hover:text-coral-400"
                  >
                    <Heart className="h-4 w-4" />
                    <span className="text-xs font-medium">{photo.likes}</span>
                  </button>

                  <button
                    onClick={e => handleComment(photo.id, e)}
                    className="flex items-center space-x-1 transition-colors hover:text-sky-400"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-xs font-medium">{photo.comments}</span>
                  </button>

                  <button
                    onClick={e => handleShare(photo.id, e)}
                    className="transition-colors hover:text-brand-400"
                  >
                    <Share className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Caption (always visible on larger grids) */}
          {photo.caption && photos.length <= 4 && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
              <p className="line-clamp-2 text-xs text-white">{photo.caption}</p>
            </div>
          )}
        </div>
      ))}

      {/* Empty State */}
      {photos.length === 0 && (
        <div className="col-span-2 py-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <ZoomIn className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-foreground">No photos yet</h3>
          <p className="text-muted-foreground">Photos will appear here when they&apos;re added.</p>
        </div>
      )}
    </div>
  )
}

// Loading skeleton for PhotoGrid
export function PhotoGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-1 md:gap-2">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="relative animate-pulse overflow-hidden rounded-lg bg-muted">
          <div className="aspect-square w-full bg-muted-foreground/20" />
        </div>
      ))}
    </div>
  )
}
