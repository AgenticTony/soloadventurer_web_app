import { createClient } from '@/lib/supabase/client';
import { AppError } from '@/lib/errors';
import type { Activity, UserActivity } from '@/types/matching';

// ── Auth helper ────────────────────────────────────────────────
async function getAuthContext() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new AppError('User not authenticated', 401);
  return { supabase, userId: session.user.id };
}

// ── Activities ─────────────────────────────────────────────────

export async function getActivities(): Promise<Activity[]> {
  const { supabase } = await getAuthContext();

  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('is_active', true)
    .order('category')
    .order('name');

  if (error) throw new AppError('Failed to fetch activities');

  return data.map(mapActivity);
}

export async function getUserActivities(userId?: string): Promise<UserActivity[]> {
  const { supabase, userId: currentUserId } = await getAuthContext();
  const targetId = userId ?? currentUserId;

  const { data, error } = await supabase
    .from('user_activities')
    .select('*')
    .eq('user_id', targetId);

  if (error) throw new AppError('Failed to fetch user activities');

  return data.map(mapUserActivity);
}

export async function setUserActivities(activityIds: string[]): Promise<void> {
  const { supabase, userId } = await getAuthContext();

  // Delete existing and insert new (atomic swap)
  const { error: deleteError } = await supabase
    .from('user_activities')
    .delete()
    .eq('user_id', userId);

  if (deleteError) throw new AppError('Failed to clear existing activities');

  if (activityIds.length === 0) return;

  const rows = activityIds.map((activityId) => ({
    user_id: userId,
    activity_id: activityId,
  }));

  const { error: insertError } = await supabase
    .from('user_activities')
    .insert(rows);

  if (insertError) throw new AppError('Failed to save activities');
}

// ── Mappers ────────────────────────────────────────────────────

function mapActivity(row: Record<string, unknown>): Activity {
  return {
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string) ?? null,
    category: row.category as string,
    iconName: (row.icon_name as string) ?? null,
    isActive: row.is_active as boolean,
    isLocationSpecific: (row.is_location_specific as boolean) ?? false,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapUserActivity(row: Record<string, unknown>): UserActivity {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    activityId: row.activity_id as string,
    createdAt: row.created_at as string,
  };
}
