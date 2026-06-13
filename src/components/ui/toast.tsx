'use client'

import { useState, useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastProps {
  toast: Toast
  onDismiss: (id: string) => void
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onDismiss(toast.id), 300)
    }, toast.duration || 5000)

    return () => clearTimeout(timer)
  }, [toast, onDismiss])

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-emerald-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />
      case 'info':
        return <Info className="h-5 w-5 text-sky-500" />
      default:
        return <Info className="h-5 w-5 text-sky-500" />
    }
  }

  const getBgColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20'
      case 'error':
        return 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20'
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20'
      case 'info':
        return 'bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/20'
      default:
        return 'bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/20'
    }
  }

  return (
    <div
      className={`transform transition-all duration-300 ease-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'} w-full max-w-sm rounded-lg border border-border bg-card p-4 shadow-lg ${getBgColor()} `}
    >
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className="mt-0.5 flex-shrink-0">{getIcon()}</div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-foreground">{toast.title}</h4>
              {toast.description && (
                <p className="mt-1 text-sm text-muted-foreground">{toast.description}</p>
              )}
            </div>

            {/* Close button */}
            <button
              onClick={() => {
                setIsVisible(false)
                setTimeout(() => onDismiss(toast.id), 300)
              }}
              className="ml-4 flex-shrink-0 rounded p-1 transition-colors hover:bg-muted/50"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {/* Action */}
          {toast.action && (
            <div className="mt-3">
              <button
                onClick={toast.action.onClick}
                className="text-sm font-medium text-brand-500 transition-colors hover:text-brand-600"
              >
                {toast.action.label}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface ToastContainerProps {
  toasts: Toast[]
  onDismiss: (id: string) => void
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}
