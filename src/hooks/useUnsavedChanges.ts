'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface UseUnsavedChangesOptions {
  hasUnsavedChanges: boolean
  message?: string
}

export function useUnsavedChanges({
  hasUnsavedChanges,
  message = 'You have unsaved changes. Are you sure you want to leave?',
}: UseUnsavedChangesOptions) {
  const router = useRouter()
  const originalPush = useRef(router.push)

  useEffect(() => {
    // Store original router.push method
    originalPush.current = router.push

    // Override router.push to show confirmation
    if (hasUnsavedChanges) {
      router.push = (href: string) => {
        if (window.confirm(message)) {
          originalPush.current(href)
        }
      }
    } else {
      // Restore original router.push when no unsaved changes
      router.push = originalPush.current
    }

    // Cleanup on unmount
    return () => {
      router.push = originalPush.current
    }
  }, [hasUnsavedChanges, message, router])

  useEffect(() => {
    // Handle browser navigation (back/forward/refresh)
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = message
        return message
      }
    }

    if (hasUnsavedChanges) {
      window.addEventListener('beforeunload', handleBeforeUnload)
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [hasUnsavedChanges, message])

  // Helper function for manual navigation confirmation
  const confirmNavigation = (callback: () => void) => {
    if (hasUnsavedChanges) {
      if (window.confirm(message)) {
        callback()
      }
    } else {
      callback()
    }
  }

  return { confirmNavigation }
}
