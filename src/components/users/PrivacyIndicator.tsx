'use client'

import { Lock, Users, Globe } from 'lucide-react'
import type { LocationSharingLevel } from '@/contexts/PrivacyContext'

interface PrivacyIndicatorProps {
  locationSharing: LocationSharingLevel
  precise?: boolean
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
}

const iconSizes = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
}

export function PrivacyIndicator({
  locationSharing,
  precise = false,
  size = 'md',
  showText = false,
  className = '',
}: PrivacyIndicatorProps) {
  const getPrivacyConfig = () => {
    switch (locationSharing) {
      case 'off':
        return {
          icon: Lock,
          text: 'Private',
          color: 'text-red-600 bg-red-100',
          tooltip: 'Location is private',
        }
      case 'friends':
        return {
          icon: Users,
          text: 'Friends',
          color: 'text-blue-600 bg-blue-100',
          tooltip: `Location visible to friends${precise ? ' (exact)' : ' (approximate)'}`,
        }
      case 'everyone':
        return {
          icon: Globe,
          text: 'Public',
          color: 'text-yellow-600 bg-yellow-100',
          tooltip: `Location visible to everyone${precise ? ' (exact)' : ' (approximate)'}`,
        }
      default:
        return {
          icon: Lock,
          text: 'Private',
          color: 'text-red-600 bg-red-100',
          tooltip: 'Location is private',
        }
    }
  }

  const config = getPrivacyConfig()
  const IconComponent = config.icon

  if (showText) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 ${config.color} ${sizeClasses[size]} ${className}`}
        title={config.tooltip}
      >
        <IconComponent className={iconSizes[size]} />
        <span className="font-medium">{config.text}</span>
        {locationSharing !== 'off' && precise && <span className="text-xs opacity-75">•</span>}
      </div>
    )
  }

  return (
    <div
      className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${config.color} ${className}`}
      title={config.tooltip}
      role="img"
      aria-label={config.tooltip}
    >
      <IconComponent className={iconSizes[size]} />
    </div>
  )
}
