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
    <div className="bg-card rounded-2xl shadow-card p-4 mb-4">
      <div className="flex space-x-3">
        {/* User Avatar */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
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
            onChange={(e) => setContent(e.target.value)}
            className="w-full min-h-[80px] p-3 bg-transparent border-none resize-none focus:outline-none text-foreground placeholder:text-muted-foreground"
            rows={3}
          />

          {/* Image Preview Grid */}
          {selectedImages.length > 0 && (
            <div className="grid gap-2 mb-3" style={{ 
              gridTemplateColumns: selectedImages.length === 1 ? '1fr' :
                                 selectedImages.length === 2 ? '1fr 1fr' :
                                 selectedImages.length === 3 ? '2fr 1fr 1fr' :
                                 '1fr 1fr 1fr 1fr'
            }}>
              {selectedImages.map((image, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                    <NextImage
                      src={URL.createObjectURL(image)}
                      alt={`Upload ${index + 1}`}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </div>
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Image Upload Area */}
          {selectedImages.length < 4 && (
            <div
              className={`mb-3 p-4 border-2 border-dashed rounded-lg transition-colors ${
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
                onChange={(e) => handleImageUpload(e.target.files)}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer flex flex-col items-center justify-center space-y-2"
              >
                <Image className="w-8 h-8 text-muted-foreground" />
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
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="flex items-center space-x-2">
              <label
                htmlFor="image-upload"
                className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer"
              >
                <Image className="w-5 h-5 text-muted-foreground hover:text-foreground" />
              </label>
              
              <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                <MapPin className="w-5 h-5 text-muted-foreground hover:text-foreground" />
              </button>
              
              <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                <Calendar className="w-5 h-5 text-muted-foreground hover:text-foreground" />
              </button>
              
              <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                <Smile className="w-5 h-5 text-muted-foreground hover:text-foreground" />
              </button>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!canPost}
              className={clsx(
                "px-6 py-2 rounded-xl font-medium transition-all",
                canPost
                  ? "bg-brand-500 text-white hover:bg-brand-600"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
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