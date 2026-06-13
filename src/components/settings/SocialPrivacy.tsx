// Social Privacy Component - Enhanced Privacy Controls
// Sprint 3: Following official React patterns with Tailwind CSS

'use client'

import React, { useState, useCallback, useOptimistic, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Hand,
  MessageCircle,
  Eye,
  EyeOff,
  Users,
  Globe,
  X,
  CheckCircle,
  WifiOff,
  Shield,
  Info,
} from 'lucide-react'
import {
  usePrivacy,
  SocialInteractionLevel,
  formatSocialInteractionLevel,
} from '@/contexts/PrivacyContext'
import { clsx } from 'clsx'

/**
 * Social Privacy Component
 * Following official React patterns with Tailwind CSS
 * Implements WAI-ARIA accessibility guidelines
 */
export const SocialPrivacy: React.FC = () => {
  const {
    settings,
    updateWhoCanWave,
    updateWhoCanMessage,
    toggleReadReceipts,
    toggleOnlineStatus,
    toggleActivityStatus,
  } = usePrivacy()

  const [isOnline] = useState(() => (typeof window !== 'undefined' ? navigator.onLine : true))

  // WAI-ARIA accessibility IDs following React.dev useId patterns
  const waveControlId = useId()
  const messageControlId = useId()
  const readReceiptsId = useId()
  const onlineStatusId = useId()
  const activityStatusId = useId()

  // Optimistic updates following React.dev useOptimistic patterns
  const [optimisticSettings, addOptimistic] = useOptimistic(
    settings,
    (currentSettings, update: Partial<typeof settings>) => ({
      ...currentSettings,
      ...update,
    })
  )

  /**
   * Handle wave permission change with optimistic updates
   */
  const handleWaveChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newLevel = event.target.value as SocialInteractionLevel

      // Optimistic update for immediate UI feedback
      addOptimistic({ whoCanWave: newLevel })

      // Actual update
      updateWhoCanWave(newLevel)
    },
    [addOptimistic, updateWhoCanWave]
  )

  /**
   * Handle message permission change with optimistic updates
   */
  const handleMessageChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newLevel = event.target.value as SocialInteractionLevel

      // Optimistic update for immediate UI feedback
      addOptimistic({ whoCanMessage: newLevel })

      // Actual update
      updateWhoCanMessage(newLevel)
    },
    [addOptimistic, updateWhoCanMessage]
  )

  /**
   * Handle toggle switches with optimistic updates
   */
  const handleReadReceiptsToggle = useCallback(() => {
    const newValue = !optimisticSettings.readReceipts
    addOptimistic({ readReceipts: newValue })
    toggleReadReceipts()
  }, [addOptimistic, optimisticSettings.readReceipts, toggleReadReceipts])

  const handleOnlineStatusToggle = useCallback(() => {
    const newValue = !optimisticSettings.onlineStatus
    addOptimistic({ onlineStatus: newValue })
    toggleOnlineStatus()
  }, [addOptimistic, optimisticSettings.onlineStatus, toggleOnlineStatus])

  const handleActivityStatusToggle = useCallback(() => {
    const newValue = !optimisticSettings.activityStatus
    addOptimistic({ activityStatus: newValue })
    toggleActivityStatus()
  }, [addOptimistic, optimisticSettings.activityStatus, toggleActivityStatus])

  /**
   * Get icon for social interaction level
   */
  const getInteractionIcon = useCallback((level: SocialInteractionLevel) => {
    switch (level) {
      case 'everyone':
        return <Globe className="h-4 w-4" />
      case 'connections':
        return <Users className="h-4 w-4" />
      case 'none':
        return <X className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }, [])

  /**
   * Toggle Switch Component following controlled component patterns
   */
  const ToggleSwitch: React.FC<{
    id: string
    checked: boolean
    onChange: () => void
    label: string
    description: string
    'aria-label': string
  }> = ({ id, checked, onChange, label, description, 'aria-label': ariaLabel }) => (
    <div className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
      <div className="flex-1">
        <label
          htmlFor={id}
          className="block cursor-pointer text-sm font-medium text-gray-900 dark:text-white"
        >
          {label}
        </label>
        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{description}</p>
      </div>
      <div className="relative">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={onChange}
          className="sr-only"
          role="switch"
          aria-checked={checked}
          aria-label={ariaLabel}
        />
        <div
          className={clsx(
            'peer h-6 w-11 cursor-pointer rounded-full bg-gray-200 transition-colors peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:bg-gray-700 dark:peer-focus:ring-blue-800',
            checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
          )}
          onClick={onChange}
        >
          <div
            className={clsx(
              'absolute left-[2px] top-[2px] h-5 w-5 rounded-full border border-gray-300 bg-white transition-transform',
              checked ? 'translate-x-full border-white' : ''
            )}
          />
        </div>
      </div>
    </div>
  )

  return (
    <motion.div
      className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Users className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Social Features Privacy
        </h2>
      </div>

      {/* Offline Warning following official patterns */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
              <WifiOff className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
              <p className="text-sm text-amber-700 dark:text-amber-300">
                You&apos;re offline. Settings will sync when you reconnect.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connection Status Indicator */}
      <div className="mb-6 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <CheckCircle className={clsx('h-4 w-4', isOnline ? 'text-green-500' : 'text-red-500')} />
        <span>{isOnline ? 'Connected' : 'Offline'} • Settings sync automatically</span>
      </div>

      {/* Who Can Wave - Following native HTML patterns with Tailwind */}
      <div className="mb-6">
        <div className="mb-4 flex items-center gap-2">
          <Hand className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Who can wave to you?
          </h3>
        </div>
        <div role="radiogroup" aria-labelledby={waveControlId} className="space-y-2">
          {(['everyone', 'connections', 'none'] as SocialInteractionLevel[]).map(level => (
            <label
              key={level}
              className="group flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <input
                type="radio"
                name="whoCanWave"
                value={level}
                checked={optimisticSettings.whoCanWave === level}
                onChange={handleWaveChange}
                className="h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
              />
              <div className="flex items-center gap-2">
                {getInteractionIcon(level)}
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatSocialInteractionLevel(level)}
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="my-6 border-t border-gray-200 dark:border-gray-700" />

      {/* Who Can Message - Following native HTML patterns with Tailwind */}
      <div className="mb-6">
        <div className="mb-4 flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Who can message you?
          </h3>
        </div>
        <div role="radiogroup" aria-labelledby={messageControlId} className="space-y-2">
          {(['everyone', 'connections', 'none'] as SocialInteractionLevel[]).map(level => (
            <label
              key={level}
              className="group flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <input
                type="radio"
                name="whoCanMessage"
                value={level}
                checked={optimisticSettings.whoCanMessage === level}
                onChange={handleMessageChange}
                className="h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
              />
              <div className="flex items-center gap-2">
                {getInteractionIcon(level)}
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatSocialInteractionLevel(level)}
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="my-6 border-t border-gray-200 dark:border-gray-700" />

      {/* Status & Activity Settings - Following native HTML patterns with Tailwind */}
      <div className="mb-6">
        <div className="mb-4 flex items-center gap-2">
          <Eye className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Status & Activity</h3>
        </div>

        <div className="space-y-4">
          {/* Read Receipts Toggle */}
          <ToggleSwitch
            id={readReceiptsId}
            checked={optimisticSettings.readReceipts}
            onChange={handleReadReceiptsToggle}
            label="Send read receipts"
            description="Let others know when you've read their messages"
            aria-label="Toggle read receipts"
          />

          {/* Online Status Toggle */}
          <ToggleSwitch
            id={onlineStatusId}
            checked={optimisticSettings.onlineStatus}
            onChange={handleOnlineStatusToggle}
            label="Show online status"
            description="Let others see when you're online"
            aria-label="Toggle online status visibility"
          />

          {/* Activity Status Toggle */}
          <ToggleSwitch
            id={activityStatusId}
            checked={optimisticSettings.activityStatus}
            onChange={handleActivityStatusToggle}
            label="Show activity status"
            description="Share what you're currently doing (typing, traveling, etc.)"
            aria-label="Toggle activity status visibility"
          />
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Privacy Notice:</strong> Your settings are stored locally and synchronized
            securely. Blocked users cannot interact with you regardless of these settings.
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default SocialPrivacy
