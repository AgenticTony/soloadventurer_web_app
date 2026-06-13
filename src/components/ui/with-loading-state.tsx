'use client'

import { LoadingState } from '@/hooks/useLoadingState'
import { LoadingSpinner, ErrorState, EmptyState } from './skeletons'
import { Search, MessageCircle, Users, MapPin, Calendar } from 'lucide-react'

interface WithLoadingStateProps<T = unknown> {
  loadingState: LoadingState<T[]>
  children: (data: T[]) => React.ReactNode
  emptyIcon?: React.ComponentType<{ className?: string }>
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: React.ReactNode
  errorTitle?: string
  errorDescription?: string
  onRetry?: () => void
  className?: string
}

export function WithLoadingState<T>({
  loadingState,
  children,
  emptyIcon = Search,
  emptyTitle = 'No items found',
  emptyDescription = 'There are no items to display.',
  emptyAction,
  errorTitle,
  errorDescription,
  onRetry,
  className = '',
}: WithLoadingStateProps<T>) {
  const { loading, error, data } = loadingState

  if (loading) {
    return (
      <div className={`flex min-h-[200px] items-center justify-center ${className}`}>
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState
        title={errorTitle}
        description={errorDescription || error.message}
        onRetry={onRetry}
        className={className}
      />
    )
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
        className={className}
      />
    )
  }

  return <>{children(data)}</>
}

// Specialized variants for common use cases
interface PostsLoadingStateProps
  extends Omit<WithLoadingStateProps, 'emptyIcon' | 'emptyTitle' | 'emptyDescription'> {
  className?: string
}

export function PostsLoadingState(props: PostsLoadingStateProps) {
  return (
    <WithLoadingState
      {...props}
      emptyIcon={MessageCircle}
      emptyTitle="No posts yet"
      emptyDescription="Be the first to share your adventure!"
    />
  )
}

export function UsersLoadingState(props: PostsLoadingStateProps) {
  return (
    <WithLoadingState
      {...props}
      emptyIcon={Users}
      emptyTitle="No users found"
      emptyDescription="No travelers match your search."
    />
  )
}

export function CitiesLoadingState(props: PostsLoadingStateProps) {
  return (
    <WithLoadingState
      {...props}
      emptyIcon={MapPin}
      emptyTitle="No cities found"
      emptyDescription="Explore our destinations to find your next adventure."
    />
  )
}

export function TripsLoadingState(props: PostsLoadingStateProps) {
  return (
    <WithLoadingState
      {...props}
      emptyIcon={Calendar}
      emptyTitle="No trips yet"
      emptyDescription="Plan your next adventure and start tracking your journeys."
    />
  )
}
