'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { Toast, ToastType } from '@/components/ui/toast'

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void
  showSuccess: (title: string, description?: string) => void
  showError: (title: string, description?: string) => void
  showInfo: (title: string, description?: string) => void
  showWarning: (title: string, description?: string) => void
  dismissToast: (id: string) => void
  dismissAllToasts: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

interface ToastProviderProps {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration || 5000
    }
    
    setToasts(prev => [...prev, newToast])
  }, [])

  const showSuccess = useCallback((title: string, description?: string) => {
    showToast({ type: 'success', title, description })
  }, [showToast])

  const showError = useCallback((title: string, description?: string) => {
    showToast({ type: 'error', title, description })
  }, [showToast])

  const showInfo = useCallback((title: string, description?: string) => {
    showToast({ type: 'info', title, description })
  }, [showToast])

  const showWarning = useCallback((title: string, description?: string) => {
    showToast({ type: 'warning', title, description })
  }, [showToast])

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const dismissAllToasts = useCallback(() => {
    setToasts([])
  }, [])

  const value: ToastContextType = {
    showToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    dismissToast,
    dismissAllToasts
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Hook for common toast operations
export function useToastOperations() {
  const { showSuccess, showError, showInfo, showWarning } = useToast()

  return {
    // Common success scenarios
    postCreated: () => showSuccess('Post created successfully'),
    postUpdated: () => showSuccess('Post updated successfully'),
    postDeleted: () => showSuccess('Post deleted successfully'),
    
    // User interactions
    followSuccess: (userName: string) => showSuccess(`You are now following ${userName}`),
    unfollowSuccess: (userName: string) => showSuccess(`You unfollowed ${userName}`),
    likeSuccess: () => showSuccess('Post liked'),
    commentSuccess: () => showSuccess('Comment posted'),
    
    // Trip operations
    tripCreated: () => showSuccess('Trip created successfully'),
    tripUpdated: () => showSuccess('Trip updated successfully'),
    tripDeleted: () => showSuccess('Trip deleted successfully'),
    
    // Messages
    messageSent: () => showSuccess('Message sent'),
    messageDeleted: () => showSuccess('Message deleted'),
    
    // Profile operations
    profileUpdated: () => showSuccess('Profile updated successfully'),
    
    // Settings
    settingsSaved: () => showSuccess('Settings saved successfully'),
    
    // Common errors
    networkError: () => showError('Network error', 'Please check your connection and try again'),
    permissionError: () => showError('Permission denied', 'You don\'t have permission to perform this action'),
    notFoundError: () => showError('Not found', 'The requested resource was not found'),
    
    // Validation errors
    validationError: (field: string) => showError(`Invalid ${field}`, `Please enter a valid ${field.toLowerCase()}`),
    requiredField: (field: string) => showError(`${field} required`, `Please enter a ${field.toLowerCase()}`),
    
    // Info messages
    newMessage: (sender: string) => showInfo(`New message from ${sender}`),
    newFollower: (follower: string) => showInfo(`${follower} started following you`),
    newLike: () => showInfo('Someone liked your post'),
    newComment: () => showInfo('New comment on your post'),
    
    // Warnings
    unsavedChanges: () => showWarning('Unsaved changes', 'You have unsaved changes that will be lost'),
    deleteWarning: (item: string) => showWarning(`Delete ${item}`, 'This action cannot be undone'),
    
    // Generic info
    loading: () => showInfo('Loading...'),
    saved: () => showSuccess('Changes saved'),
    copied: () => showSuccess('Copied to clipboard'),
  }
}