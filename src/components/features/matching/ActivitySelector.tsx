'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Camera, Landmark, UtensilsCrossed, ShoppingBag,
  TreePine, Mountain, MountainSnow, Bike, Heart, Wine, Wind,
  Waves, Sailboat, Dumbbell, Compass, Globe, Music, Coffee,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getActivities, getUserActivities, setUserActivities } from '@/lib/api/activities';
import type { Activity } from '@/types/matching';
import { cn } from '@/lib/utils';

// Map database icon_name values to Lucide React icons
const iconMap: Record<string, LucideIcon> = {
  camera: Camera,
  temple: Landmark,
  museum: Landmark,
  cooking: UtensilsCrossed,
  restaurant: Coffee,
  shopping: ShoppingBag,
  skiing: MountainSnow,
  hiking: Mountain,
  climbing: TreePine,
  cycling: Bike,
  volunteering: Heart,
  nightlife: Music,
  diving: Sailboat,
  surfing: Waves,
  yoga: Dumbbell,
};

// Map category to display color
const categoryColors: Record<string, string> = {
  outdoor: 'bg-green-100 text-green-700 border-green-300',
  food: 'bg-orange-100 text-orange-700 border-orange-300',
  creative: 'bg-purple-100 text-purple-700 border-purple-300',
  culture: 'bg-blue-100 text-blue-700 border-blue-300',
  social: 'bg-pink-100 text-pink-700 border-pink-300',
  leisure: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  water_sports: 'bg-cyan-100 text-cyan-700 border-cyan-300',
  wellness: 'bg-emerald-100 text-emerald-700 border-emerald-300',
};

const categoryLabels: Record<string, string> = {
  outdoor: 'Outdoor',
  food: 'Food & Drink',
  creative: 'Creative',
  culture: 'Culture',
  social: 'Social',
  leisure: 'Leisure',
  water_sports: 'Water Sports',
  wellness: 'Wellness',
};

interface ActivitySelectorProps {
  /** Called when activities are saved successfully */
  onSave?: (activityIds: string[]) => void;
  className?: string;
}

export function ActivitySelector({ onSave, className }: ActivitySelectorProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [initialIds, setInitialIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load activities and user's selections
  useEffect(() => {
    async function load() {
      try {
        const [allActivities, userActivities] = await Promise.all([
          getActivities(),
          getUserActivities(),
        ]);
        setActivities(allActivities);
        const ids = new Set(userActivities.map((ua) => ua.activityId));
        setSelectedIds(ids);
        setInitialIds(ids);
      } catch (error) {
        console.error('Failed to load activities:', error);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const toggleActivity = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const hasChanges = selectedIds.size !== initialIds.size ||
    [...selectedIds].some((id) => !initialIds.has(id));

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setUserActivities([...selectedIds]);
      setInitialIds(new Set(selectedIds));
      onSave?.([...selectedIds]);
    } catch (error) {
      console.error('Failed to save activities:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Group activities by category
  const grouped = activities.reduce<Record<string, Activity[]>>((acc, activity) => {
    const cat = activity.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(activity);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Your Interests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Your Interests</span>
          <span className="text-sm font-normal text-muted-foreground">
            {selectedIds.size} selected
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Select activities you enjoy. We&apos;ll use these to match you with like-minded travelers.
        </p>

        {Object.entries(grouped).map(([category, items]) => {
          const Icon = iconMap[items[0]?.iconName ?? ''] ?? Mountain;
          return (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">
                  {categoryLabels[category] ?? category}
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {items.map((activity) => {
                  const isSelected = selectedIds.has(activity.id);
                  const ActivityIcon = iconMap[activity.iconName ?? ''];
                  return (
                    <button
                      key={activity.id}
                      type="button"
                      onClick={() => toggleActivity(activity.id)}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all',
                        isSelected
                          ? categoryColors[category] ?? 'bg-primary/10 text-primary border-primary/30'
                          : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted'
                      )}
                      aria-pressed={isSelected}
                      aria-label={`${activity.name} ${isSelected ? 'selected' : 'not selected'}`}
                    >
                      {ActivityIcon && <ActivityIcon className="h-3.5 w-3.5" />}
                      {activity.name}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {hasChanges && (
          <div className="flex justify-end pt-2">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Interests'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
