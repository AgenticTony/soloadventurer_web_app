'use client'

import React, { useEffect, useCallback } from 'react'

interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  metaKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  callback: (e: KeyboardEvent) => void
  description?: string
  preventDefault?: boolean
}

export function useKeyboardNavigation(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const {
          key,
          ctrlKey = false,
          metaKey = false,
          shiftKey = false,
          altKey = false,
          callback,
          preventDefault = true,
        } = shortcut

        const matches =
          e.key === key &&
          e.ctrlKey === ctrlKey &&
          e.metaKey === metaKey &&
          e.shiftKey === shiftKey &&
          e.altKey === altKey

        if (matches) {
          if (preventDefault) {
            e.preventDefault()
          }
          callback(e)
          break
        }
      }
    },
    [shortcuts]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

export function useNavigationShortcuts({
  onSearch,
  onNewPost,
  onMessages,
  onNotifications,
  onProfile,
  onSettings,
  onHelp,
  onNext,
  onPrevious,
  onLike,
  onComment,
  onShare,
}: {
  onSearch?: () => void
  onNewPost?: () => void
  onMessages?: () => void
  onNotifications?: () => void
  onProfile?: () => void
  onSettings?: () => void
  onHelp?: () => void
  onNext?: () => void
  onPrevious?: () => void
  onLike?: () => void
  onComment?: () => void
  onShare?: () => void
}) {
  const shortcuts: KeyboardShortcut[] = []

  if (onSearch) {
    shortcuts.push({
      key: 'k',
      metaKey: true,
      callback: onSearch,
      description: 'Open search',
    })
  }

  if (onNewPost) {
    shortcuts.push({
      key: 'n',
      metaKey: true,
      callback: onNewPost,
      description: 'Create new post',
    })
  }

  if (onMessages) {
    shortcuts.push({
      key: 'm',
      metaKey: true,
      callback: onMessages,
      description: 'Open messages',
    })
  }

  if (onNotifications) {
    shortcuts.push({
      key: 'a',
      metaKey: true,
      callback: onNotifications,
      description: 'Open notifications',
    })
  }

  if (onProfile) {
    shortcuts.push({
      key: 'p',
      metaKey: true,
      callback: onProfile,
      description: 'Go to profile',
    })
  }

  if (onSettings) {
    shortcuts.push({
      key: ',',
      metaKey: true,
      callback: onSettings,
      description: 'Open settings',
    })
  }

  if (onHelp) {
    shortcuts.push({
      key: '?',
      callback: onHelp,
      description: 'Show keyboard shortcuts',
    })
  }

  if (onNext) {
    shortcuts.push({
      key: 'j',
      callback: onNext,
      description: 'Next item',
    })
  }

  if (onPrevious) {
    shortcuts.push({
      key: 'k',
      callback: onPrevious,
      description: 'Previous item',
    })
  }

  if (onLike) {
    shortcuts.push({
      key: 'l',
      callback: onLike,
      description: 'Like current item',
    })
  }

  if (onComment) {
    shortcuts.push({
      key: 'c',
      callback: onComment,
      description: 'Comment on current item',
    })
  }

  if (onShare) {
    shortcuts.push({
      key: 's',
      metaKey: true,
      callback: onShare,
      description: 'Share current item',
    })
  }

  useKeyboardNavigation(shortcuts)

  return shortcuts
}

interface KeyboardShortcutsHelpProps {
  shortcuts: KeyboardShortcut[]
}

export function KeyboardShortcutsHelp({ shortcuts }: KeyboardShortcutsHelpProps) {
  const groupedShortcuts = shortcuts.reduce(
    (acc, shortcut) => {
      if (!shortcut.description) return acc

      const category = shortcut.metaKey || shortcut.ctrlKey ? 'Navigation' : 'Actions'
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(shortcut)
      return acc
    },
    {} as Record<string, KeyboardShortcut[]>
  )

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Keyboard Shortcuts</h3>
      {Object.entries(groupedShortcuts).map(([category, items]) => (
        <div key={category}>
          <h4 className="mb-2 text-sm font-medium text-muted-foreground">{category}</h4>
          <div className="space-y-1">
            {items.map((shortcut, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span>{shortcut.description}</span>
                <div className="flex items-center space-x-1">
                  {shortcut.metaKey && (
                    <kbd className="rounded bg-muted px-1 py-0.5 text-xs">⌘</kbd>
                  )}
                  {shortcut.ctrlKey && (
                    <kbd className="rounded bg-muted px-1 py-0.5 text-xs">Ctrl</kbd>
                  )}
                  {shortcut.shiftKey && (
                    <kbd className="rounded bg-muted px-1 py-0.5 text-xs">Shift</kbd>
                  )}
                  {shortcut.altKey && (
                    <kbd className="rounded bg-muted px-1 py-0.5 text-xs">Alt</kbd>
                  )}
                  <kbd className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                    {shortcut.key.toUpperCase()}
                  </kbd>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
