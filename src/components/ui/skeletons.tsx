'use client'

import { cn } from '@/lib/utils'

// Base Skeleton Component
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} {...props} />
}

// Avatar Skeleton
export function AvatarSkeleton({ className }: { className?: string }) {
  return <Skeleton className={cn('rounded-full', className)} />
}

// Text Skeletons
export function TextSkeleton({ lines = 1, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn('h-4', i === lines - 1 ? 'w-3/4' : 'w-full')} />
      ))}
    </div>
  )
}

// Card Skeleton
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-4 rounded-xl bg-card p-6 shadow-card', className)}>
      <div className="flex items-center space-x-4">
        <AvatarSkeleton className="h-12 w-12" />
        <div className="flex-1 space-y-2">
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
    <div className={cn('overflow-hidden rounded-2xl bg-card shadow-card', className)}>
      {/* Header */}
      <div className="flex items-center space-x-3 p-4">
        <AvatarSkeleton className="h-10 w-10" />
        <div className="flex-1 space-y-2">
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
      <Skeleton className="h-64 w-full" />

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-border p-4">
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
    <div className={cn('space-y-3 rounded-xl bg-card p-4 shadow-card', className)}>
      <div className="flex items-center space-x-3">
        <AvatarSkeleton className="h-12 w-12" />
        <div className="flex-1 space-y-2">
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
    <div className={cn('overflow-hidden rounded-2xl bg-card shadow-card', className)}>
      <Skeleton className="h-32 w-full" />
      <div className="space-y-3 p-4">
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
    <div className={cn('overflow-hidden rounded-2xl bg-card shadow-card', className)}>
      <Skeleton className="h-48 w-full" />
      <div className="space-y-4 p-6">
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
            <AvatarSkeleton className="h-6 w-6 border-2 border-card" />
            <AvatarSkeleton className="h-6 w-6 border-2 border-card" />
            <AvatarSkeleton className="h-6 w-6 border-2 border-card" />
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
    <div className={cn('flex space-x-3', className)}>
      <AvatarSkeleton className="h-8 w-8" />
      <div className="flex-1">
        <div className="space-y-2 rounded-xl bg-card p-3">
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
    <div className={cn('space-y-3 rounded-xl bg-card p-4 shadow-card', className)}>
      <div className="flex items-start space-x-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
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
    <div className={cn('flex items-center space-x-3 p-4', className)}>
      <div className="relative">
        <AvatarSkeleton className="h-12 w-12" />
        <Skeleton className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-3 w-2/3" />
      </div>
      <Skeleton className="h-5 w-5 rounded-full" />
    </div>
  )
}

// List Skeleton (for any list items)
export function ListSkeleton({ count = 5, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3 p-2">
          <AvatarSkeleton className="h-8 w-8" />
          <div className="flex-1 space-y-2">
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
    <div className={cn('rounded-xl bg-card p-6 text-center shadow-card', className)}>
      <Skeleton className="mx-auto mb-3 h-12 w-12 rounded-full" />
      <Skeleton className="mx-auto mb-2 h-6 w-16" />
      <Skeleton className="mx-auto h-4 w-20" />
    </div>
  )
}

// Loading Spinner
export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
    </div>
  )
}

// Full Page Loading
export function FullPageLoading({ className }: { className?: string }) {
  return (
    <div className={cn('flex min-h-screen items-center justify-center', className)}>
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
  className,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('py-12 text-center', className)}>
      <Icon className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
      <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mb-6 text-muted-foreground">{description}</p>
      {action && action}
    </div>
  )
}

// Error State Component
export function ErrorState({
  title = 'Something went wrong',
  description = 'Please try again later',
  onRetry,
  className,
}: {
  title?: string
  description?: string
  onRetry?: () => void
  className?: string
}) {
  return (
    <div className={cn('py-12 text-center', className)}>
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <span className="text-2xl">⚠️</span>
      </div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mb-6 text-muted-foreground">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-lg bg-brand-500 px-4 py-2 text-white transition-colors hover:bg-brand-600"
        >
          Try Again
        </button>
      )}
    </div>
  )
}
