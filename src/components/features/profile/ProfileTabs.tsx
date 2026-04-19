'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Compass, CameraIcon, Map, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ProfileTabId = 'adventures' | 'gallery' | 'map' | 'stats'

interface TabConfig {
  id: ProfileTabId
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const TABS: TabConfig[] = [
  { id: 'adventures', label: 'Adventures', icon: Compass },
  { id: 'gallery', label: 'Gallery', icon: CameraIcon },
  { id: 'map', label: 'Map', icon: Map },
  { id: 'stats', label: 'Travel Stats', icon: TrendingUp },
]

interface ProfileTabsProps {
  activeTab: ProfileTabId
  onTabChange: (tab: ProfileTabId) => void
}

export function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  return (
    <div className="border-b border-border/60">
      <div className="mx-auto flex max-w-4xl gap-0 overflow-x-auto px-4 sm:px-6 no-scrollbar">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'relative flex shrink-0 items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors',
                isActive
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground/80',
              )}
              role="tab"
              aria-selected={isActive}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="profile-tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function useProfileTabs(defaultTab: ProfileTabId = 'adventures') {
  const [activeTab, setActiveTab] = useState<ProfileTabId>(defaultTab)
  return { activeTab, setActiveTab }
}
