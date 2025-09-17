'use client'

import { cn } from '@/lib/utils'

// Base Skeleton Component
export function Skeleton({ 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

// Avatar Skeleton
export function AvatarSkeleton({ className }: { className?: string }) {
  return (
    <Skeleton className={cn("rounded-full", className)} />
  )
}

// Text Skeletons
export function TextSkeleton({ lines = 1, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={cn(
            "h-4",
            i === lines - 1 ? "w-3/4" : "w-full"
          )} 
        />
      ))}
    </div>
  )
}

// Card Skeleton
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("bg-card rounded-xl shadow-card p-6 space-y-4", className)}>
      <div className="flex items-center space-x-4">
        <AvatarSkeleton className="w-12 h-12" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <TextSkeleton lines={3} />
      <div className="flex space-x-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  )
}

// Post Skeleton
export function PostSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("bg-card rounded-2xl shadow-card overflow-hidden", className)}>
      {/* Header */}
      <div className="p-4 flex items-center space-x-3">
        <AvatarSkeleton className="w-10 h-10" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <Skeleton className="h-8 w-8 rounded" />
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        <TextSkeleton lines={2} />
      </div>

      {/* Image */}
      <Skeleton className="w-full h-64" />

      {/* Actions */}
      <div className="p-4 flex items-center justify-between border-t border-border">
        <div className="flex space-x-4">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="h-8 w-8 rounded" />
      </div>
    </div>
  )
}

// User Card Skeleton
export function UserCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("bg-card rounded-xl shadow-card p-4 space-y-3", className)}>
      <div className="flex items-center space-x-3">
        <AvatarSkeleton className="w-12 h-12" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <TextSkeleton lines={2} />
      <div className="flex space-x-2">
        <Skeleton className="h-8 w-20 flex-1" />
        <Skeleton className="h-8 w-20 flex-1" />
      </div>
    </div>
  )
}

// City Module Skeleton
export function CityModuleSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("bg-card rounded-2xl shadow-card overflow-hidden", className)}>
      <Skeleton className="h-32 w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-2/3" />
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  )
}

// Trip Card Skeleton
export function TripCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("bg-card rounded-2xl shadow-card overflow-hidden", className)}>
      <Skeleton className="h-48 w-full" />
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <TextSkeleton lines={2} />
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            <AvatarSkeleton className="w-6 h-6 border-2 border-card" />
            <AvatarSkeleton className="w-6 h-6 border-2 border-card" />
            <AvatarSkeleton className="w-6 h-6 border-2 border-card" />
          </div>
          <div className="flex space-x-3">
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-4 w-8" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Comment Skeleton
export function CommentSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex space-x-3", className)}>
      <AvatarSkeleton className="w-8 h-8" />
      <div className="flex-1">
        <div className="bg-card rounded-xl p-3 space-y-2">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <TextSkeleton lines={2} />
        </div>
      </div>
    </div>
  )
}

// Notification Skeleton
export function NotificationSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("p-4 bg-card rounded-xl shadow-card space-y-3", className)}>
      <div className="flex items-start space-x-3">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-16" />
          </div>
          <TextSkeleton lines={2} />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-2" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Message Skeleton
export function MessageSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center space-x-3 p-4", className)}>
      <div className="relative">
        <AvatarSkeleton className="w-12 h-12" />
        <Skeleton className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-3 w-2/3" />
      </div>
      <Skeleton className="w-5 h-5 rounded-full" />
    </div>
  )
}

// List Skeleton (for any list items)
export function ListSkeleton({ 
  count = 5, 
  className 
}: { count?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3 p-2">
          <AvatarSkeleton className="w-8 h-8" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Stats Card Skeleton
export function StatsCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("bg-card rounded-xl shadow-card p-6 text-center", className)}>
      <Skeleton className="w-12 h-12 rounded-full mx-auto mb-3" />
      <Skeleton className="h-6 w-16 mx-auto mb-2" />
      <Skeleton className="h-4 w-20 mx-auto" />
    </div>
  )
}

// Loading Spinner
export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

// Full Page Loading
export function FullPageLoading({ className }: { className?: string }) {
  return (
    <div className={cn("min-h-screen flex items-center justify-center", className)}>
      <LoadingSpinner />
    </div>
  )
}

// Empty State Component
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("text-center py-12", className)}>
      <Icon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6">{description}</p>
      {action && action}
    </div>
  )
}

// Error State Component
export function ErrorState({
  title = "Something went wrong",
  description = "Please try again later",
  onRetry,
  className
}: {
  title?: string
  description?: string
  onRetry?: () => void
  className?: string
}) {
  return (
    <div className={cn("text-center py-12", className)}>
      <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl">⚠️</span>
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  )
}