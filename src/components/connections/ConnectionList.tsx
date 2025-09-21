// Connection List Component - Friend Connections with Real-time Updates
// Sprint 3: Connection management with optimistic updates and WebSocket integration

'use client';

import React, { useState, useCallback, useMemo, useOptimistic, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
  Shield,
  MoreVertical,
  MessageCircle,
  MapPin,
  Clock,
  Wifi,
  WifiOff,
  Search,
  Filter,
  Heart,
  Star,
  Globe
} from 'lucide-react';
import {
  ConnectionWithUser,
  ConnectionSuggestion,
  ConnectionStatus,
  RequestDirection,
  OptimisticConnection,
  ConnectionListProps,
  ConnectionCardProps,
  SuggestionCardProps
} from '@/types/connection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
// Simplified Avatar component
interface AvatarProps {
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}

interface AvatarImageProps {
  src?: string;
  alt: string;
}

interface AvatarFallbackProps {
  className?: string;
  children: React.ReactNode;
}

const Avatar: React.FC<AvatarProps> = ({ className, onClick, children }) => (
  <div className={clsx('relative rounded-full overflow-hidden', className)} onClick={onClick}>
    {children}
  </div>
);

const AvatarImage: React.FC<AvatarImageProps> = ({ src, alt }) => (
  src ? <img src={src} alt={alt} className="w-full h-full object-cover" /> : null
);

const AvatarFallback: React.FC<AvatarFallbackProps> = ({ className, children }) => (
  <div className={clsx('w-full h-full bg-muted flex items-center justify-center text-sm font-medium', className)}>
    {children}
  </div>
);
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { clsx } from 'clsx';
import { useToast } from '@/contexts/ToastContext';
import { usePrivacy, shouldShowUser, canInteractWithUser } from '@/contexts/PrivacyContext';

/**
 * Individual Connection Card Component
 * Following React patterns for component composition
 */
const ConnectionCard: React.FC<ConnectionCardProps> = ({
  connection,
  onAccept,
  onDecline,
  onRemove,
  onBlock,
  onUserClick,
  showActions = true,
  variant = 'default'
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(connection.status);

  const handleAction = useCallback(async (
    action: () => Promise<void>,
    newStatus?: ConnectionStatus
  ) => {
    setIsLoading(true);

    if (newStatus) {
      setOptimisticStatus(newStatus);
    }

    try {
      await action();
    } catch (error) {
      // Revert optimistic update on error
      setOptimisticStatus(connection.status);
      console.error('Connection action failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [connection.status, setOptimisticStatus]);

  const handleAccept = useCallback(() => {
    handleAction(async () => await onAccept(connection.id), ConnectionStatus.ACCEPTED);
  }, [connection.id, onAccept, handleAction]);

  const handleDecline = useCallback(() => {
    handleAction(async () => await onDecline(connection.id), ConnectionStatus.DECLINED);
  }, [connection.id, onDecline, handleAction]);

  const handleRemove = useCallback(() => {
    handleAction(async () => await onRemove(connection.id));
  }, [connection.id, onRemove, handleAction]);

  const handleBlock = useCallback(() => {
    handleAction(async () => await onBlock(connection.user.id));
  }, [connection.user.id, onBlock, handleAction]);

  const getStatusDisplay = () => {
    switch (optimisticStatus) {
      case ConnectionStatus.PENDING:
        return connection.direction === RequestDirection.INCOMING
          ? { label: 'Wants to connect', color: 'text-blue-600', bgColor: 'bg-blue-50' }
          : { label: 'Request sent', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
      case ConnectionStatus.ACCEPTED:
        return { label: 'Connected', color: 'text-green-600', bgColor: 'bg-green-50' };
      case ConnectionStatus.BLOCKED:
        return { label: 'Blocked', color: 'text-red-600', bgColor: 'bg-red-50' };
      case ConnectionStatus.DECLINED:
        return { label: 'Declined', color: 'text-gray-600', bgColor: 'bg-gray-50' };
      default:
        return { label: 'Unknown', color: 'text-gray-600', bgColor: 'bg-gray-50' };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className={clsx(
        'border border-border rounded-lg transition-all duration-200',
        variant === 'compact' && 'p-3',
        variant === 'default' && 'p-4',
        variant === 'detailed' && 'p-6'
      )}
    >
      <div className="flex items-start gap-3">
        {/* User Avatar */}
        <div className="relative">
          <Avatar
            className={clsx(
              'cursor-pointer ring-2 ring-transparent hover:ring-primary/20 transition-all',
              variant === 'compact' && 'w-10 h-10',
              variant === 'default' && 'w-12 h-12',
              variant === 'detailed' && 'w-16 h-16'
            )}
            onClick={() => onUserClick(connection.user.id)}
          >
            <AvatarImage src={connection.user.avatar} alt={connection.user.name} />
            <AvatarFallback>
              {connection.user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Online Status Indicator */}
          <div className={clsx(
            'absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-card',
            connection.user.isOnline ? 'bg-green-500' : 'bg-gray-400'
          )} />
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <button
                onClick={() => onUserClick(connection.user.id)}
                className="text-left group"
              >
                <h3 className={clsx(
                  'font-semibold text-foreground group-hover:text-primary transition-colors truncate',
                  variant === 'compact' && 'text-sm',
                  variant === 'default' && 'text-base',
                  variant === 'detailed' && 'text-lg'
                )}>
                  {connection.user.name}
                </h3>
                <p className={clsx(
                  'text-muted-foreground truncate',
                  variant === 'compact' && 'text-xs',
                  variant === 'default' && 'text-sm',
                  variant === 'detailed' && 'text-base'
                )}>
                  @{connection.user.username}
                </p>
              </button>

              {/* Location and Online Status */}
              <div className="flex items-center gap-2 mt-1">
                {connection.user.location && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span>{connection.user.location}</span>
                  </div>
                )}

                <div className="flex items-center gap-1 text-xs">
                  {connection.user.isOnline ? (
                    <>
                      <Wifi className="w-3 h-3 text-green-500" />
                      <span className="text-green-600">Online</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3 text-gray-400" />
                      <span className="text-muted-foreground">
                        {connection.user.lastSeen
                          ? `Last seen ${new Date(connection.user.lastSeen).toLocaleDateString()}`
                          : 'Offline'
                        }
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Stats */}
              {variant === 'detailed' && (
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span>{connection.user.stats.trips} trips</span>
                  <span>{connection.user.stats.connections} connections</span>
                  <span>{connection.user.stats.posts} posts</span>
                </div>
              )}

              {/* Mutual Connections */}
              {connection.mutualConnections > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <Users className="w-3 h-3 text-blue-500" />
                  <span className="text-xs text-blue-600">
                    {connection.mutualConnections} mutual connection{connection.mutualConnections !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>

            {/* Status Badge */}
            <Badge
              variant="secondary"
              className={clsx(
                'ml-2 text-xs',
                statusDisplay.color,
                statusDisplay.bgColor
              )}
            >
              {statusDisplay.label}
            </Badge>
          </div>

          {/* Bio */}
          {variant === 'detailed' && connection.user.bio && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {connection.user.bio}
            </p>
          )}

          {/* Request Message */}
          {connection.metadata?.requestMessage && (
            <div className="mt-2 p-2 bg-muted rounded-md">
              <p className="text-xs text-muted-foreground italic">
                "{connection.metadata.requestMessage}"
              </p>
            </div>
          )}

          {/* Actions */}
          {showActions && (
            <div className="flex items-center gap-2 mt-3">
              {optimisticStatus === ConnectionStatus.PENDING && connection.direction === RequestDirection.INCOMING && (
                <>
                  <Button
                    size="sm"
                    onClick={handleAccept}
                    disabled={isLoading}
                    className="flex items-center gap-1"
                  >
                    <UserCheck className="w-3 h-3" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDecline}
                    disabled={isLoading}
                    className="flex items-center gap-1"
                  >
                    <UserX className="w-3 h-3" />
                    Decline
                  </Button>
                </>
              )}

              {optimisticStatus === ConnectionStatus.ACCEPTED && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {/* Navigate to messages */}}
                    className="flex items-center gap-1"
                  >
                    <MessageCircle className="w-3 h-3" />
                    Message
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRemove}
                    disabled={isLoading}
                    className="flex items-center gap-1 text-red-600 hover:text-red-700"
                  >
                    <UserMinus className="w-3 h-3" />
                    Remove
                  </Button>
                </>
              )}

              {(optimisticStatus === ConnectionStatus.PENDING || optimisticStatus === ConnectionStatus.DECLINED) && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleBlock}
                  disabled={isLoading}
                  className="flex items-center gap-1 text-red-600 hover:text-red-700"
                >
                  <Shield className="w-3 h-3" />
                  Block
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Connection Suggestion Card Component
 */
const SuggestionCard: React.FC<SuggestionCardProps> = ({
  suggestion,
  onSendRequest,
  onDismiss,
  onUserClick
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDismissed, setIsDismissed] = useOptimistic(false);

  const handleSendRequest = useCallback(async () => {
    setIsLoading(true);
    try {
      await onSendRequest(suggestion.suggestedUser.id);
    } catch (error) {
      console.error('Failed to send connection request:', error);
    } finally {
      setIsLoading(false);
    }
  }, [suggestion.suggestedUser.id, onSendRequest]);

  const handleDismiss = useCallback(() => {
    setIsDismissed(true);
    onDismiss(suggestion.id);
  }, [suggestion.id, onDismiss, setIsDismissed]);

  if (isDismissed) return null;

  const getReasenIcon = () => {
    switch (suggestion.reason) {
      case 'mutual_friends':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'shared_interests':
        return <Heart className="w-4 h-4 text-pink-500" />;
      case 'location_proximity':
        return <MapPin className="w-4 h-4 text-green-500" />;
      case 'trip_similarity':
        return <Globe className="w-4 h-4 text-purple-500" />;
      default:
        return <Star className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getReasonText = () => {
    switch (suggestion.reason) {
      case 'mutual_friends':
        return `${suggestion.mutualConnections.length} mutual friend${suggestion.mutualConnections.length !== 1 ? 's' : ''}`;
      case 'shared_interests':
        return `${suggestion.sharedInterests?.length || 0} shared interests`;
      case 'location_proximity':
        return 'Near your location';
      case 'trip_similarity':
        return 'Similar travel preferences';
      default:
        return 'Suggested for you';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="border border-border rounded-lg p-4 bg-card"
    >
      <div className="flex items-start gap-3">
        {/* User Avatar */}
        <div className="relative">
          <Avatar
            className="w-12 h-12 cursor-pointer ring-2 ring-transparent hover:ring-primary/20 transition-all"
            onClick={() => onUserClick(suggestion.suggestedUser.id)}
          >
            <AvatarImage src={suggestion.suggestedUser.avatar} alt={suggestion.suggestedUser.name} />
            <AvatarFallback>
              {suggestion.suggestedUser.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Online Status */}
          <div className={clsx(
            'absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-card',
            suggestion.suggestedUser.isOnline ? 'bg-green-500' : 'bg-gray-400'
          )} />
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <button
            onClick={() => onUserClick(suggestion.suggestedUser.id)}
            className="text-left group"
          >
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
              {suggestion.suggestedUser.name}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              @{suggestion.suggestedUser.username}
            </p>
          </button>

          {/* Suggestion Reason */}
          <div className="flex items-center gap-2 mt-1">
            {getReasenIcon()}
            <span className="text-xs text-muted-foreground">
              {getReasonText()}
            </span>
            <Badge variant="secondary" className="text-xs">
              {Math.round(suggestion.confidence * 100)}% match
            </Badge>
          </div>

          {/* Location */}
          {suggestion.suggestedUser.location && (
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span>{suggestion.suggestedUser.location}</span>
            </div>
          )}

          {/* Mutual Connections Preview */}
          {suggestion.mutualConnections.length > 0 && (
            <div className="flex items-center gap-1 mt-2">
              <div className="flex -space-x-1">
                {suggestion.mutualConnections.slice(0, 3).map((user, index) => (
                  <Avatar key={user.id} className="w-5 h-5 border border-card">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <span className="text-xs text-muted-foreground ml-1">
                Connected to {suggestion.mutualConnections[0].name}
                {suggestion.mutualConnections.length > 1 && ` and ${suggestion.mutualConnections.length - 1} other${suggestion.mutualConnections.length > 2 ? 's' : ''}`}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3">
            <Button
              size="sm"
              onClick={handleSendRequest}
              disabled={isLoading}
              className="flex items-center gap-1"
            >
              <UserPlus className="w-3 h-3" />
              Connect
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDismiss}
              className="flex items-center gap-1"
            >
              <UserX className="w-3 h-3" />
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Main Connection List Component
 */
export const ConnectionList: React.FC<ConnectionListProps & {
  suggestions?: ConnectionSuggestion[];
  onSendRequest?: (userId: string, message?: string) => void;
  onDismissSuggestion?: (suggestionId: string) => void;
}> = ({
  connections,
  suggestions = [],
  onConnectionUpdate,
  onSendRequest,
  onDismissSuggestion,
  onUserClick,
  isLoading = false,
  error = null,
  emptyState
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ConnectionStatus | 'all'>('all');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const { showSuccess, showError } = useToast();
  const { settings, blockUser } = usePrivacy();

  // Filter connections based on search, status, and blocking
  const filteredConnections = useMemo(() => {
    let filtered = connections;

    // CRITICAL: Filter out blocked users first
    filtered = filtered.filter(conn => shouldShowUser(settings, conn.user.id));

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(conn =>
        conn.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conn.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conn.user.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(conn => conn.status === statusFilter);
    }

    return filtered;
  }, [connections, searchQuery, statusFilter, settings]);

  // Handle connection actions with error handling
  const handleAccept = useCallback(async (connectionId: string) => {
    try {
      await onConnectionUpdate(connectionId, ConnectionStatus.ACCEPTED);
      showSuccess('Connection accepted');
    } catch (error) {
      showError('Failed to accept connection');
      throw error;
    }
  }, [onConnectionUpdate, showSuccess, showError]);

  const handleDecline = useCallback(async (connectionId: string) => {
    try {
      await onConnectionUpdate(connectionId, ConnectionStatus.DECLINED);
      showSuccess('Connection declined');
    } catch (error) {
      showError('Failed to decline connection');
      throw error;
    }
  }, [onConnectionUpdate, showSuccess, showError]);

  const handleRemove = useCallback(async (connectionId: string) => {
    try {
      await onConnectionUpdate(connectionId, ConnectionStatus.DECLINED);
      showSuccess('Connection removed');
    } catch (error) {
      showError('Failed to remove connection');
      throw error;
    }
  }, [onConnectionUpdate, showSuccess, showError]);

  const handleBlock = useCallback(async (userId: string) => {
    try {
      // Use PrivacyContext to block user with API integration
      await blockUser(userId, 'Blocked from connections');
      showSuccess('User blocked', 'User has been blocked and removed from your connections');
    } catch (error) {
      showError('Failed to block user');
      throw error;
    }
  }, [blockUser, showSuccess, showError]);

  const handleSendRequest = useCallback(async (userId: string, message?: string) => {
    if (!onSendRequest) return;
    try {
      await onSendRequest(userId, message);
      showSuccess('Connection request sent');
    } catch (error) {
      showError('Failed to send connection request');
      throw error;
    }
  }, [onSendRequest, showSuccess, showError]);

  const handleDismissSuggestion = useCallback((suggestionId: string) => {
    if (onDismissSuggestion) {
      onDismissSuggestion(suggestionId);
    }
  }, [onDismissSuggestion]);

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-2">⚠️ Failed to load connections</div>
        <p className="text-muted-foreground text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search connections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ConnectionStatus | 'all')}
            className="px-3 py-2 border border-border rounded-md bg-card text-sm"
          >
            <option value="all">All Status</option>
            <option value={ConnectionStatus.ACCEPTED}>Connected</option>
            <option value={ConnectionStatus.PENDING}>Pending</option>
            <option value={ConnectionStatus.BLOCKED}>Blocked</option>
          </select>
        </div>
      </div>

      {/* Suggestions Section */}
      {showSuggestions && suggestions.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Suggested Connections</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSuggestions(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              Hide
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <AnimatePresence>
              {suggestions
                .filter(suggestion => shouldShowUser(settings, suggestion.suggestedUser.id))
                .slice(0, 4)
                .map((suggestion) => (
                  <SuggestionCard
                    key={suggestion.id}
                    suggestion={suggestion}
                    onSendRequest={handleSendRequest}
                    onDismiss={handleDismissSuggestion}
                    onUserClick={onUserClick}
                  />
                ))}
            </AnimatePresence>
          </div>
        </section>
      )}

      {/* Connections List */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            Your Connections ({filteredConnections.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="border border-border rounded-lg p-4 animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-muted rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                    <div className="h-3 bg-muted rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredConnections.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {emptyState?.title || 'No connections found'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {emptyState?.description || 'Start connecting with other solo adventurers!'}
            </p>
            {emptyState?.action && (
              <Button onClick={emptyState.action.onClick}>
                {emptyState.action.label}
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredConnections.map((connection) => (
                <ConnectionCard
                  key={connection.id}
                  connection={connection}
                  onAccept={handleAccept}
                  onDecline={handleDecline}
                  onRemove={handleRemove}
                  onBlock={handleBlock}
                  onUserClick={onUserClick}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>
    </div>
  );
};

export default ConnectionList;