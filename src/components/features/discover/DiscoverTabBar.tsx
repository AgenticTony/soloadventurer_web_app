'use client';

import { MapPin, Users, Rss, Calendar } from 'lucide-react';
import { clsx } from 'clsx';
import type { DiscoverTabId } from '@/types/discover';

const tabs: { id: DiscoverTabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'near-you', label: 'Near You', icon: MapPin },
  { id: 'people', label: 'People', icon: Users },
  { id: 'feed', label: 'Feed', icon: Rss },
  { id: 'meetups', label: 'Meetups', icon: Calendar },
];

interface DiscoverTabBarProps {
  activeTab: DiscoverTabId;
  onTabChange: (tab: DiscoverTabId) => void;
}

export function DiscoverTabBar({ activeTab, onTabChange }: DiscoverTabBarProps) {
  return (
    <div className="sticky top-0 z-10 -mx-4 px-4 bg-background/80 backdrop-blur-lg border-b border-border">
      <nav className="flex items-center gap-1 py-2" role="tablist">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(tab.id)}
              className={clsx(
                'relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-brand/10 text-brand shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <tab.icon className={clsx('h-4 w-4 transition-colors', isActive && 'text-brand')} />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
