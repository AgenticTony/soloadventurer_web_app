import { ApiClient, ApiError } from '../base/ApiClient';
import type { UserProfile, UpdateUserProfileInput, FeedItem } from './types';

export class UserService {
  constructor(private apiClient: ApiClient) {}

  /**
   * Get user profile by username or ID
   */
  async getUserProfile(identifier: string): Promise<UserProfile> {
    try {
      // Use REST API to get user profile since GraphQL schema is minimal
      const response = await this.apiClient.get(`/users/${identifier}`);

      // Map REST response to UserProfile interface
      const userData = await (response as Response).json();

      const profile: UserProfile = {
        id: userData.id,
        username: userData.email?.split('@')[0] || userData.name.toLowerCase().replace(/\s+/g, '_'),
        email: userData.email,
        name: userData.name,
        bio: userData.bio || '',
        avatarUrl: userData.avatarUrl || '/default-avatar.jpg',
        emailVerified: userData.emailVerified || false,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      };

      return profile;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to fetch user profile');
    }
  }

  /**
   * Update current user's profile
   */
  async updateUserProfile(_updates: UpdateUserProfileInput): Promise<UserProfile> {
    try {
      // TODO: Implement GraphQL mutation when backend is ready
      throw new ApiError('Profile updates not yet implemented', 501);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to update user profile');
    }
  }

  /**
   * Upload user avatar
   */
  async uploadAvatar(_file: File): Promise<{ avatarUrl: string }> {
    try {
      // TODO: Implement S3 presigned URL upload when backend is ready
      throw new ApiError('Avatar upload not yet implemented', 501);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to upload avatar');
    }
  }

  /**
   * Get user's feed/activity
   */
  async getUserFeed(userId?: string): Promise<FeedItem[]> {
    try {
      // Use REST API to get user's trips as feed items
      const response = await this.apiClient.get(`/feed${userId ? `?userId=${userId}` : ''}`);
      const feedData = await (response as Response).json();

      return feedData.map((item: { id: string; title: string; excerpt?: string; description?: string; createdAt: string; authorId?: string; authorName?: string }): FeedItem => ({
        id: item.id,
        title: item.title,
        excerpt: item.excerpt || item.description || 'Travel adventure',
        createdAt: item.createdAt,
        authorId: item.authorId || userId || 'current-user',
        authorName: item.authorName || 'Travel Enthusiast',
        type: 'trip'
      }));
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to fetch user feed');
    }
  }

  /**
   * Search for users
   */
  async searchUsers(query: string, options?: { limit?: number; offset?: number }): Promise<UserProfile[]> {
    try {
      // Use REST API to search users
      const params = new URLSearchParams({
        q: query,
        ...(options?.limit && { limit: options.limit.toString() }),
        ...(options?.offset && { offset: options.offset.toString() })
      });

      const response = await this.apiClient.get(`/users/search?${params}`);
      const users = await (response as Response).json();

      return users.items.map((user: { id: string; email: string; name: string; bio?: string; avatarUrl?: string; emailVerified?: boolean; createdAt: string; updatedAt: string }): UserProfile => ({
        id: user.id,
        username: user.email?.split('@')[0] || user.name.toLowerCase().replace(/\s+/g, '_'),
        email: user.email,
        name: user.name,
        bio: user.bio || '',
        avatarUrl: user.avatarUrl || '/default-avatar.jpg',
        emailVerified: user.emailVerified || false,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }));
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to search users');
    }
  }

  /**
   * Follow/unfollow a user
   */
  async followUser(_userId: string): Promise<void> {
    try {
      // TODO: Implement GraphQL mutation when backend is ready
      throw new ApiError('Follow functionality not yet implemented', 501);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to follow user');
    }
  }

  async unfollowUser(_userId: string): Promise<void> {
    try {
      // TODO: Implement GraphQL mutation when backend is ready
      throw new ApiError('Unfollow functionality not yet implemented', 501);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to unfollow user');
    }
  }

  /**
   * Get user's followers
   */
  async getUserFollowers(_userId: string): Promise<UserProfile[]> {
    try {
      // TODO: Implement GraphQL query when backend is ready
      return [];
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to fetch user followers');
    }
  }

  /**
   * Get users that this user is following
   */
  async getUserFollowing(_userId: string): Promise<UserProfile[]> {
    try {
      // TODO: Implement GraphQL query when backend is ready
      return [];
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to fetch user following');
    }
  }
}

// Create singleton instance
import { apiClient } from '../base/ApiClient';
export const userService = new UserService(apiClient);

// Export the service class for testing
export default UserService;