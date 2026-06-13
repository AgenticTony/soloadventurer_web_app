'use client'

import { useState } from 'react'
import NextImage from 'next/image'
import { Image, MapPin, Calendar, Smile, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PostComposerProps {
  user?: {
    name: string
    avatar: string
    location?: string
  }
  onPost?: (content: string, images?: File[], location?: string) => void
}

export function PostComposer({ user, onPost }: PostComposerProps) {
  const [content, setContent] = useState('')
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [location, setLocation] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return

    const newImages = Array.from(files).slice(0, 4 - selectedImages.length)
    setSelectedImages(prev => [...prev, ...newImages])
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleImageUpload(e.dataTransfer.files)
  }

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    if (content.trim() || selectedImages.length > 0) {
      onPost?.(content, selectedImages, location)
      setContent('')
      setSelectedImages([])
      setLocation('')
    }
  }

  const canPost = content.trim() || selectedImages.length > 0

  return (
    <div className="mb-4 rounded-2xl bg-card p-4 shadow-card">
      <div className="flex space-x-3">
        {/* User Avatar */}
        <div className="flex-shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <span className="text-sm font-medium text-foreground">
              {user?.name?.charAt(0) || 'U'}
            </span>
          </div>
        </div>

        {/* Input Area */}
        <div className="flex-1">
          <textarea
            placeholder="Share a story, photos, or a travel tip..."
            value={content}
            onChange={e => setContent(e.target.value)}
            className="min-h-[80px] w-full resize-none border-none bg-transparent p-3 text-foreground placeholder:text-muted-foreground focus:outline-none"
            rows={3}
          />

          {/* Image Preview Grid */}
          {selectedImages.length > 0 && (
            <div
              className="mb-3 grid gap-2"
              style={{
                gridTemplateColumns:
                  selectedImages.length === 1
                    ? '1fr'
                    : selectedImages.length === 2
                      ? '1fr 1fr'
                      : selectedImages.length === 3
                        ? '2fr 1fr 1fr'
                        : '1fr 1fr 1fr 1fr',
              }}
            >
              {selectedImages.map((image, index) => (
                <div key={index} className="group relative">
                  <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                    <NextImage
                      src={URL.createObjectURL(image)}
                      alt={`Upload ${index + 1}`}
                      width={200}
                      height={200}
                      className="h-full w-full object-cover"
                      unoptimized
                    />
                  </div>
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Image Upload Area */}
          {selectedImages.length < 4 && (
            <div
              className={`mb-3 rounded-lg border-2 border-dashed p-4 transition-colors ${
                isDragging
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10'
                  : 'border-border hover:border-brand-300'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={e => handleImageUpload(e.target.files)}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="flex cursor-pointer flex-col items-center justify-center space-y-2"
              >
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <Image className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Drag & drop photos here or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedImages.length}/4 photos uploaded
                </p>
              </label>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between border-t border-border pt-3">
            <div className="flex items-center space-x-2">
              <label
                htmlFor="image-upload"
                className="cursor-pointer rounded-lg p-2 transition-colors hover:bg-muted"
              >
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <Image className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </label>

              <button className="rounded-lg p-2 transition-colors hover:bg-muted">
                <MapPin className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </button>

              <button className="rounded-lg p-2 transition-colors hover:bg-muted">
                <Calendar className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </button>

              <button className="rounded-lg p-2 transition-colors hover:bg-muted">
                <Smile className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </button>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!canPost}
              className={clsx(
                'rounded-xl px-6 py-2 font-medium transition-all',
                canPost
                  ? 'bg-brand-500 text-white hover:bg-brand-600'
                  : 'cursor-not-allowed bg-muted text-muted-foreground'
              )}
            >
              Share
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function clsx(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}
