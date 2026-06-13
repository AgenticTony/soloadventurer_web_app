'use client'

import { useState, useEffect } from 'react'
import { Shield, UserX, EyeOff, Search, AlertTriangle, Plus, X } from 'lucide-react'
import { usePrivacy } from '@/contexts/PrivacyContext'
import { UserAvatar } from '@/components/users'

interface PrivacyControlsProps {
  className?: string
}

interface MockUser {
  id: string
  name: string
  avatar?: string
  username: string
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
  } = usePrivacy()

  const [activeTab, setActiveTab] = useState<'blocked' | 'hidden'>('blocked')
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserSearch, setShowUserSearch] = useState(false)
  const [searchResults, setSearchResults] = useState<MockUser[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Get user details from backend
  const getUserDetails = async (userId: string): Promise<MockUser | undefined> => {
    try {
      // Use userService to get real user data
      const userService = await import('@/services/users/userService')
      const profile = await userService.userService.getUserProfile(userId)
      return {
        id: profile.id,
        name: profile.name,
        username: profile.username,
        avatar: profile.avatarUrl || undefined,
      }
    } catch {
      return undefined
    }
  }

  // Search users using real API
  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const userService = await import('@/services/users/userService')
      const profiles = await userService.userService.searchUsers(query, { limit: 10 })
      setSearchResults(
        profiles.map(profile => ({
          id: profile.id,
          name: profile.name,
          username: profile.username,
          avatar: profile.avatarUrl || undefined,
        }))
      )
    } catch (error) {
      console.error('Search failed:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const searchableUsers = searchResults

  const [blockedUsers, setBlockedUsers] = useState<MockUser[]>([])
  const [hiddenUsers, setHiddenUsers] = useState<MockUser[]>([])

  // Load user details for blocked/hidden users
  useEffect(() => {
    const loadUserDetails = async () => {
      const blocked = await Promise.all(settings.blockedUsers.map(userId => getUserDetails(userId)))
      const hidden = await Promise.all(settings.hideFromUsers.map(userId => getUserDetails(userId)))

      setBlockedUsers(blocked.filter((user): user is MockUser => user !== undefined))
      setHiddenUsers(hidden.filter((user): user is MockUser => user !== undefined))
    }

    loadUserDetails()
  }, [settings.blockedUsers, settings.hideFromUsers])

  const handleBlockUser = (userId: string) => {
    blockUser(userId)
    setShowUserSearch(false)
    setSearchQuery('')
  }

  const handleUnblockUser = (userId: string) => {
    unblockUser(userId)
  }

  const handleHideFromUser = (userId: string) => {
    hideFromUser(userId)
    setShowUserSearch(false)
    setSearchQuery('')
  }

  const handleShowToUser = (userId: string) => {
    showToUser(userId)
  }

  const currentUsers = activeTab === 'blocked' ? blockedUsers : hiddenUsers
  const currentCount =
    activeTab === 'blocked' ? settings.blockedUsers.length : settings.hideFromUsers.length

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-red-100">
          <Shield className="h-5 w-5 text-red-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Privacy Controls</h2>
          <p className="mt-1 text-sm text-gray-500">
            Block users or hide your profile from specific people
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('blocked')}
            className={`border-b-2 px-1 py-2 text-sm font-medium ${
              activeTab === 'blocked'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            <UserX className="mr-2 inline h-4 w-4" />
            Blocked Users ({settings.blockedUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('hidden')}
            className={`border-b-2 px-1 py-2 text-sm font-medium ${
              activeTab === 'hidden'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            <EyeOff className="mr-2 inline h-4 w-4" />
            Hidden From ({settings.hideFromUsers.length})
          </button>
        </nav>
      </div>

      {/* Add User Button */}
      <button
        onClick={() => setShowUserSearch(!showUserSearch)}
        className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-3 text-gray-600 transition-colors hover:border-gray-400 hover:text-gray-700"
      >
        <Plus className="h-4 w-4" />
        {activeTab === 'blocked' ? 'Block User' : 'Hide from User'}
      </button>

      {/* User Search */}
      {showUserSearch && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name or username..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {isSearching && (
            <div className="py-4 text-center">
              <div className="inline-block h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-gray-500">Searching...</span>
            </div>
          )}

          <div className="max-h-48 space-y-2 overflow-y-auto">
            {!isSearching &&
              searchableUsers.map(user => {
                const isBlocked = isUserBlocked(user.id)
                const isHidden = isHiddenFromUser(user.id)
                const canAdd = activeTab === 'blocked' ? !isBlocked : !isHidden

                return (
                  <div
                    key={user.id}
                    className={`flex items-center justify-between rounded border bg-white p-3 ${
                      !canAdd ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <UserAvatar user={{ name: user.name, avatar: user.avatar }} size="sm" />
                      <div>
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">@{user.username}</div>
                      </div>
                    </div>

                    {canAdd ? (
                      <button
                        onClick={() =>
                          activeTab === 'blocked'
                            ? handleBlockUser(user.id)
                            : handleHideFromUser(user.id)
                        }
                        className={`rounded px-3 py-1.5 text-sm font-medium ${
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
                )
              })}

            {!isSearching && searchableUsers.length === 0 && searchQuery && (
              <div className="py-6 text-center text-gray-500">
                <Search className="mx-auto mb-2 h-8 w-8 opacity-50" />
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
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3"
              >
                <div className="flex items-center gap-3">
                  <UserAvatar user={{ name: user.name, avatar: user.avatar }} size="sm" />
                  <div>
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">@{user.username}</div>
                  </div>
                </div>

                <button
                  onClick={() =>
                    activeTab === 'blocked' ? handleUnblockUser(user.id) : handleShowToUser(user.id)
                  }
                  className="flex items-center gap-2 rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
                >
                  <X className="h-4 w-4" />
                  {activeTab === 'blocked' ? 'Unblock' : 'Show To'}
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="py-12 text-center">
          <div
            className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
              activeTab === 'blocked' ? 'bg-red-100' : 'bg-yellow-100'
            }`}
          >
            {activeTab === 'blocked' ? (
              <UserX className="h-8 w-8 text-red-400" />
            ) : (
              <EyeOff className="h-8 w-8 text-yellow-400" />
            )}
          </div>
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            No {activeTab === 'blocked' ? 'Blocked' : 'Hidden'} Users
          </h3>
          <p className="mb-4 text-gray-500">
            {activeTab === 'blocked'
              ? "You haven't blocked any users yet"
              : "You're not hidden from any users"}
          </p>
        </div>
      )}

      {/* Information */}
      <div
        className={`rounded-lg border p-4 ${
          activeTab === 'blocked' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'
        }`}
      >
        <div className="flex items-start gap-2">
          <AlertTriangle
            className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
              activeTab === 'blocked' ? 'text-red-600' : 'text-yellow-600'
            }`}
          />
          <div
            className={`text-sm ${activeTab === 'blocked' ? 'text-red-800' : 'text-yellow-800'}`}
          >
            {activeTab === 'blocked' ? (
              <>
                <p className="font-medium">About Blocking Users</p>
                <p className="mt-1">
                  Blocked users cannot see your profile, send you messages, or interact with your
                  content. They will also be automatically hidden from seeing your location.
                </p>
              </>
            ) : (
              <>
                <p className="font-medium">About Hiding Your Profile</p>
                <p className="mt-1">
                  Users you hide from cannot see your profile or location, but they can still send
                  messages. This is useful when you want to limit visibility without fully blocking
                  someone.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
