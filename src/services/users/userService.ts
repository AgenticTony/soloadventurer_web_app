import { createClient } from '@/lib/supabase/client';
import { ApiError } from '../base/ApiClient';
import type { UserProfile, UpdateUserProfileInput, FeedItem } from './types';

async function getAuthContext() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new ApiError('User not authenticated', 401);
  return { supabase, userId: session.user.id };
}

export class UserService {
  async getUserProfile(identifier: string): Promise<UserProfile> {
    try {
      const { supabase } = await getAuthContext();

      // Try by ID first, then by username
      let { data, error } = await supabase.from('profiles').select('*').eq('id', identifier).single();

      if (error) {
        // Try username lookup
        const result = await supabase.from('profiles').select('*').eq('username', identifier).single();
        data = result.data;
        error = result.error;
      }

      if (error || !data) throw new ApiError('User not found');

      return {
        id: data.id,
        username: data.username ?? data.display_name ?? '',
        email: data.email ?? '',
        name: data.display_name ?? data.full_name ?? '',
        bio: data.bio ?? '',
        avatarUrl: data.avatar_url ?? null,
        emailVerified: true,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to fetch user profile');
    }
  }

  async updateUserProfile(updates: UpdateUserProfileInput): Promise<UserProfile> {
    try {
      const { supabase, userId } = await getAuthContext();

      const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (updates.name !== undefined) {
        updateData.display_name = updates.name;
        updateData.full_name = updates.name;
      }
      if (updates.bio !== undefined) updateData.bio = updates.bio;
      if (updates.username !== undefined) updateData.username = updates.username;

      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
        .select('*')
        .single();

      if (error) throw new ApiError(error.message);

      return {
        id: data.id,
        username: data.username ?? '',
        email: data.email ?? '',
        name: data.display_name ?? data.full_name ?? '',
        bio: data.bio ?? '',
        avatarUrl: data.avatar_url ?? null,
        emailVerified: true,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to update user profile');
    }
  }

  async uploadAvatar(_file: File): Promise<{ avatarUrl: string }> {
    try {
      throw new ApiError('Avatar upload not yet implemented', 501);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to upload avatar');
    }
  }

  async getUserFeed(userId?: string): Promise<FeedItem[]> {
    try {
      const { supabase, userId: currentUserId } = await getAuthContext();
      const targetId = userId ?? currentUserId;

      const { data, error } = await supabase
        .from('feed_items')
        .select('id, verb, object_id, object_type, created_at, actor:profiles!feed_items_actor_id_fkey(display_name, username, avatar_url)')
        .eq('owner_id', targetId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      return (data ?? []).map((item: Record<string, unknown>) => ({
        id: item.id as string,
        title: formatFeedTitle(item.verb as string, item.object_type as string, item.actor as Record<string, string> | null),
        excerpt: `${item.verb as string} ${item.object_type as string}`,
        createdAt: item.created_at as string,
        authorId: '',
        authorName: (item.actor as Record<string, string>)?.display_name ?? 'Someone',
        authorAvatar: (item.actor as Record<string, string>)?.avatar_url ?? undefined,
        type: 'trip' as const,
      }));
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to fetch user feed');
    }
  }

  async searchUsers(query: string, options?: { limit?: number; offset?: number }): Promise<UserProfile[]> {
    try {
      const { supabase } = await getAuthContext();
      const limit = Math.min(options?.limit ?? 20, 50);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%,full_name.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;

      return ((data ?? []) as Record<string, unknown>[]).map((user) => ({
        id: user.id as string,
        username: (user.username as string) ?? '',
        email: '',
        name: (user.display_name as string) ?? (user.full_name as string) ?? '',
        bio: (user.bio as string) ?? '',
        avatarUrl: (user.avatar_url as string) ?? null,
        emailVerified: true,
        createdAt: user.created_at as string,
        updatedAt: user.updated_at as string,
      }));
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to search users');
    }
  }

  async followUser(targetUserId: string): Promise<void> {
    try {
      const { supabase, userId } = await getAuthContext();
      const { error } = await supabase.from('follows').insert({ follower_id: userId, following_id: targetUserId });
      if (error) throw new ApiError(error.message);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to follow user');
    }
  }

  async unfollowUser(targetUserId: string): Promise<void> {
    try {
      const { supabase, userId } = await getAuthContext();
      const { error } = await supabase.from('follows').delete().eq('follower_id', userId).eq('following_id', targetUserId);
      if (error) throw new ApiError(error.message);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to unfollow user');
    }
  }

  async getUserFollowers(targetUserId: string): Promise<UserProfile[]> {
    try {
      const { supabase } = await getAuthContext();
      const { data, error } = await supabase
        .from('follows')
        .select('follower:profiles!follows_follower_id_fkey(*)')
        .eq('following_id', targetUserId);

      if (error) throw error;

      return ((data ?? []) as Record<string, unknown>[]).map((row) => {
        const f = row.follower as Record<string, unknown>;
        return {
          id: f.id as string,
          username: (f.username as string) ?? '',
          email: '',
          name: (f.display_name as string) ?? (f.full_name as string) ?? '',
          bio: (f.bio as string) ?? '',
          avatarUrl: (f.avatar_url as string) ?? null,
          emailVerified: true,
          createdAt: f.created_at as string,
          updatedAt: f.updated_at as string,
        };
      });
    } catch (error) {
      if (error instanceof ApiError) throw error;
      return [];
    }
  }

  async getUserFollowing(targetUserId: string): Promise<UserProfile[]> {
    try {
      const { supabase } = await getAuthContext();
      const { data, error } = await supabase
        .from('follows')
        .select('following:profiles!follows_following_id_fkey(*)')
        .eq('follower_id', targetUserId);

      if (error) throw error;

      return ((data ?? []) as Record<string, unknown>[]).map((row) => {
        const f = row.following as Record<string, unknown>;
        return {
          id: f.id as string,
          username: (f.username as string) ?? '',
          email: '',
          name: (f.display_name as string) ?? (f.full_name as string) ?? '',
          bio: (f.bio as string) ?? '',
          avatarUrl: (f.avatar_url as string) ?? null,
          emailVerified: true,
          createdAt: f.created_at as string,
          updatedAt: f.updated_at as string,
        };
      });
    } catch (error) {
      if (error instanceof ApiError) throw error;
      return [];
    }
  }
}

function formatFeedTitle(verb: string, objectType: string, actor?: Record<string, string> | null): string {
  const name = actor?.display_name || actor?.username || 'Someone';
  const action = verb === 'post' ? 'posted' : verb === 'share' ? 'shared' : verb === 'comment' ? 'commented on' : verb;
  return `${name} ${action} a ${objectType || 'update'}`;
}

export const userService = new UserService();
export default UserService;
