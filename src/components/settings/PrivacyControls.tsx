'use client';

import { useState, useEffect } from 'react';
import { Shield, UserX, EyeOff, Search, AlertTriangle, Plus, X } from 'lucide-react';
import { usePrivacy } from '@/contexts/PrivacyContext';
import { UserAvatar } from '@/components/users';

interface PrivacyControlsProps {
  className?: string;
}

interface MockUser {
  id: string;
  name: string;
  avatar?: string;
  username: string;
}

export function PrivacyControls({ className = '' }: PrivacyControlsProps) {
  const {
    settings,
    blockUser,
    unblockUser,
    hideFromUser,
    showToUser,
    isUserBlocked,
    isHiddenFromUser,
  } = usePrivacy();

  const [activeTab, setActiveTab] = useState<'blocked' | 'hidden'>('blocked');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<MockUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Get user details from backend
  const getUserDetails = async (userId: string): Promise<MockUser | undefined> => {
    try {
      // Use userService to get real user data
      const userService = await import('@/services/users/userService');
      const profile = await userService.userService.getUserProfile(userId);
      return {
        id: profile.id,
        name: profile.name,
        username: profile.username,
        avatar: profile.avatarUrl || undefined
      };
    } catch {
      return undefined;
    }
  };

  // Search users using real API
  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const userService = await import('@/services/users/userService');
      const profiles = await userService.userService.searchUsers(query, { limit: 10 });
      setSearchResults(profiles.map(profile => ({
        id: profile.id,
        name: profile.name,
        username: profile.username,
        avatar: profile.avatarUrl || undefined
      })));
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const searchableUsers = searchResults;

  const [blockedUsers, setBlockedUsers] = useState<MockUser[]>([]);
  const [hiddenUsers, setHiddenUsers] = useState<MockUser[]>([]);

  // Load user details for blocked/hidden users
  useEffect(() => {
    const loadUserDetails = async () => {
      const blocked = await Promise.all(
        settings.blockedUsers.map(userId => getUserDetails(userId))
      );
      const hidden = await Promise.all(
        settings.hideFromUsers.map(userId => getUserDetails(userId))
      );

      setBlockedUsers(blocked.filter((user): user is MockUser => user !== undefined));
      setHiddenUsers(hidden.filter((user): user is MockUser => user !== undefined));
    };

    loadUserDetails();
  }, [settings.blockedUsers, settings.hideFromUsers]);

  const handleBlockUser = (userId: string) => {
    blockUser(userId);
    setShowUserSearch(false);
    setSearchQuery('');
  };

  const handleUnblockUser = (userId: string) => {
    unblockUser(userId);
  };

  const handleHideFromUser = (userId: string) => {
    hideFromUser(userId);
    setShowUserSearch(false);
    setSearchQuery('');
  };

  const handleShowToUser = (userId: string) => {
    showToUser(userId);
  };

  const currentUsers = activeTab === 'blocked' ? blockedUsers : hiddenUsers;
  const currentCount = activeTab === 'blocked' ? settings.blockedUsers.length : settings.hideFromUsers.length;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
          <Shield className="h-5 w-5 text-red-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Privacy Controls</h2>
          <p className="text-sm text-gray-500 mt-1">
            Block users or hide your profile from specific people
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('blocked')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'blocked'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <UserX className="h-4 w-4 inline mr-2" />
            Blocked Users ({settings.blockedUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('hidden')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'hidden'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <EyeOff className="h-4 w-4 inline mr-2" />
            Hidden From ({settings.hideFromUsers.length})
          </button>
        </nav>
      </div>

      {/* Add User Button */}
      <button
        onClick={() => setShowUserSearch(!showUserSearch)}
        className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:text-gray-700 hover:border-gray-400 transition-colors"
      >
        <Plus className="h-4 w-4" />
        {activeTab === 'blocked' ? 'Block User' : 'Hide from User'}
      </button>

      {/* User Search */}
      {showUserSearch && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {isSearching && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-gray-500">Searching...</span>
            </div>
          )}

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {!isSearching && searchableUsers.map(user => {
              const isBlocked = isUserBlocked(user.id);
              const isHidden = isHiddenFromUser(user.id);
              const canAdd = activeTab === 'blocked' ? !isBlocked : !isHidden;

              return (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-3 bg-white rounded border ${
                    !canAdd ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      user={{ name: user.name, avatar: user.avatar }}
                      size="sm"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">@{user.username}</div>
                    </div>
                  </div>

                  {canAdd ? (
                    <button
                      onClick={() => activeTab === 'blocked' ? handleBlockUser(user.id) : handleHideFromUser(user.id)}
                      className={`px-3 py-1.5 text-sm font-medium rounded ${
                        activeTab === 'blocked'
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-yellow-600 text-white hover:bg-yellow-700'
                      }`}
                    >
                      {activeTab === 'blocked' ? 'Block' : 'Hide From'}
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 text-sm text-gray-400">
                      Already {activeTab === 'blocked' ? 'blocked' : 'hidden'}
                    </span>
                  )}
                </div>
              );
            })}

            {!isSearching && searchableUsers.length === 0 && searchQuery && (
              <div className="text-center py-6 text-gray-500">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No users found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Current Users List */}
      {currentCount > 0 ? (
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900">
            {activeTab === 'blocked' ? 'Blocked Users' : 'Hidden From'}
          </h3>

          <div className="space-y-2">
            {currentUsers.map(user => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <UserAvatar
                    user={{ name: user.name, avatar: user.avatar }}
                    size="sm"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">@{user.username}</div>
                  </div>
                </div>

                <button
                  onClick={() => activeTab === 'blocked' ? handleUnblockUser(user.id) : handleShowToUser(user.id)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  <X className="h-4 w-4" />
                  {activeTab === 'blocked' ? 'Unblock' : 'Show To'}
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            activeTab === 'blocked' ? 'bg-red-100' : 'bg-yellow-100'
          }`}>
            {activeTab === 'blocked' ? (
              <UserX className="h-8 w-8 text-red-400" />
            ) : (
              <EyeOff className="h-8 w-8 text-yellow-400" />
            )}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No {activeTab === 'blocked' ? 'Blocked' : 'Hidden'} Users
          </h3>
          <p className="text-gray-500 mb-4">
            {activeTab === 'blocked'
              ? "You haven't blocked any users yet"
              : "You're not hidden from any users"
            }
          </p>
        </div>
      )}

      {/* Information */}
      <div className={`p-4 rounded-lg border ${
        activeTab === 'blocked' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
      }`}>
        <div className="flex items-start gap-2">
          <AlertTriangle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
            activeTab === 'blocked' ? 'text-red-600' : 'text-yellow-600'
          }`} />
          <div className={`text-sm ${
            activeTab === 'blocked' ? 'text-red-800' : 'text-yellow-800'
          }`}>
            {activeTab === 'blocked' ? (
              <>
                <p className="font-medium">About Blocking Users</p>
                <p className="mt-1">
                  Blocked users cannot see your profile, send you messages, or interact with your content.
                  They will also be automatically hidden from seeing your location.
                </p>
              </>
            ) : (
              <>
                <p className="font-medium">About Hiding Your Profile</p>
                <p className="mt-1">
                  Users you hide from cannot see your profile or location, but they can still send messages.
                  This is useful when you want to limit visibility without fully blocking someone.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}