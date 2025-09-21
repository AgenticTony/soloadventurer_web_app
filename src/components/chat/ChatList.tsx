// Chat List Component - Virtual Scrolled Chat List with Last Message Preview
// Sprint 3: Chat Interface Components with Official Best Practices

'use client';

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  MoreVertical,
  Pin,
  User,
  Users,
  Clock,
  Check,
  CheckCheck,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useWebSocketContext } from '@/contexts/WebSocketContext';
import { useAuth } from '@/contexts/AuthContext';
import { usePrivacy, shouldShowUser, canInteractWithUser } from '@/contexts/PrivacyContext';
import { clsx } from 'clsx';
import { useChatStore } from '@/store/chatStore';
import { chatService } from '@/services/chat/chatService';
import type { Conversation, User as ChatUser, Message as ChatMessage, isTextMessage } from '@/types/chat';
import { processMessageContent } from '@/types/chat';

/**
 * Chat interface types based on official patterns
 * Using official types from @/types/chat
 */

interface ChatListProps {
  /** Current user for message status */
  currentUserId?: string;
  /** Chat selection callback */
  onChatSelect?: (conversation: Conversation) => void;
  /** Currently selected chat */
  selectedChatId?: string;
  /** Filter for chat search */
  searchQuery?: string;
  /** Show archived chats */
  showArchived?: boolean;
  /** Custom height for virtual scrolling */
  height?: number;
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: string;
}

/**
 * Chat List Component
 * Implementation based on React Virtuoso and Stream Chat patterns
 */
export const ChatList: React.FC<ChatListProps> = ({
  currentUserId,
  onChatSelect,
  selectedChatId,
  searchQuery = '',
  showArchived = false,
  height = 600,
  isLoading = false,
  error,
}) => {
  const { } = useAuth();
  const { isConnected } = useWebSocketContext();
  const { settings } = usePrivacy();

  // Get conversations from store
  const conversations = useChatStore((state) => Object.values(state.conversations));
  const unreadCounts = useChatStore((state) => {
    // Calculate unread counts from conversations
    const counts: Record<string, number> = {};
    Object.values(state.conversations).forEach(conv => {
      counts[conv.id] = conv.unreadCount;
    });
    return counts;
  });
  const activeConversationId = useChatStore((state) => state.selectedConversationId);

  // Load conversations on mount
  useEffect(() => {
    chatService.loadConversations();
  }, []);

  const parentRef = useRef<HTMLDivElement>(null);

  // Filter and sort chats based on official patterns
  const filteredChats = useMemo(() => {
    const filtered = conversations.filter(conversation => {
      // CRITICAL: Filter out chats with blocked users
      const hasBlockedUser = conversation.participants.some(participant =>
        participant.id !== currentUserId && !shouldShowUser(settings, participant.id)
      );
      if (hasBlockedUser) return false;

      // Archive filter
      if (conversation.isArchived !== showArchived) return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const chatName = conversation.type === 'group'
          ? conversation.name || ''
          : conversation.participants.find(p => p.id !== currentUserId)?.name || '';

        const lastMessageContent = conversation.lastMessage
          ? processMessageContent(conversation.lastMessage.content)
          : '';

        return chatName.toLowerCase().includes(query) ||
               lastMessageContent.toLowerCase().includes(query);
      }

      return true;
    });

    // Sort: pinned first, then by last message timestamp
    return filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      const aTime = a.lastMessage?.timestamp.getTime() || a.updatedAt.getTime();
      const bTime = b.lastMessage?.timestamp.getTime() || b.updatedAt.getTime();

      return bTime - aTime;
    });
  }, [conversations, searchQuery, showArchived, currentUserId, settings]);

  // Virtual scrolling implementation based on React Virtuoso patterns
  const virtualizer = useVirtualizer({
    count: filteredChats.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72, // Estimated item height
    overscan: 5, // Render 5 extra items for smooth scrolling
  });

  // Handle chat selection with proper memoization
  const handleChatSelect = useCallback((conversation: Conversation) => {
    onChatSelect?.(conversation);
  }, [onChatSelect]);

  // Format timestamp for last message
  const formatTimestamp = useCallback((timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;

    return timestamp.toLocaleDateString();
  }, []);

  // Get chat display name
  const getChatName = useCallback((conversation: Conversation) => {
    if (conversation.type === 'group') {
      return conversation.name || `Group (${conversation.participants.length})`;
    }

    const otherParticipant = conversation.participants.find(p => p.id !== currentUserId);
    return otherParticipant?.name || 'Unknown User';
  }, [currentUserId]);

  // Get chat avatar
  const getChatAvatar = useCallback((conversation: Conversation) => {
    if (conversation.type === 'group') {
      return null; // Will show group icon
    }

    const otherParticipant = conversation.participants.find(p => p.id !== currentUserId);
    return otherParticipant?.avatar;
  }, [currentUserId]);

  // Get message status icon
  const getMessageStatus = useCallback((message: ChatMessage) => {
    if (!message || message.senderId !== currentUserId) return null;

    const isRead = message.readBy.some(id => id !== currentUserId);
    const isDelivered = message.deliveredTo.some(id => id !== currentUserId);

    if (isRead) {
      return <CheckCheck className="w-4 h-4 text-blue-500" />;
    }
    if (isDelivered) {
      return <Check className="w-4 h-4 text-gray-400" />;
    }
    return <Clock className="w-4 h-4 text-gray-300" />;
  }, [currentUserId]);

  // Loading state
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-card">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Loading chats...
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-card p-4">
        <div className="text-center">
          <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (filteredChats.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-card p-4">
        <div className="text-center">
          <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            {searchQuery ? 'No chats found' : 'No chats yet'}
          </p>
          {searchQuery && (
            <p className="text-xs text-muted-foreground mt-1">
              Try searching for something else
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-card">
      {/* Connection Status */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-foreground" />
          <span className="font-medium text-foreground">Chats</span>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Wifi className="w-4 h-4 text-green-500" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-500" />
          )}
        </div>
      </div>

      {/* Virtual Scrolled Chat List */}
      <div
        ref={parentRef}
        className="overflow-auto"
        style={{ height: height - 60 }} // Account for header
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          <AnimatePresence>
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const conversation = filteredChats[virtualItem.index];
              const isSelected = conversation.id === selectedChatId;
              const chatName = getChatName(conversation);
              const chatAvatar = getChatAvatar(conversation);
              const isOnline = conversation.participants.some(p => p.id !== currentUserId && p.isOnline);

              return (
                <motion.div
                  key={conversation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <div
                    onClick={() => handleChatSelect(conversation)}
                    className={clsx(
                      'flex items-center gap-3 p-3 hover:bg-muted cursor-pointer transition-all duration-200',
                      'border-b border-border/50',
                      isSelected && 'bg-primary/10 border-l-4 border-l-primary',
                      'group'
                    )}
                  >
                    {/* Avatar */}
                    <div className="relative">
                      {chatAvatar ? (
                        <img
                          src={chatAvatar}
                          alt={chatName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          {conversation.type === 'group' ? (
                            <Users className="w-6 h-6 text-primary" />
                          ) : (
                            <User className="w-6 h-6 text-primary" />
                          )}
                        </div>
                      )}

                      {/* Online indicator */}
                      {conversation.type === 'direct' && isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-card" />
                      )}

                      {/* Pinned indicator */}
                      {conversation.isPinned && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                          <Pin className="w-2 h-2 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Chat Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={clsx(
                          'font-medium truncate',
                          conversation.unreadCount > 0 ? 'text-foreground' : 'text-foreground/80'
                        )}>
                          {chatName}
                        </h3>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {conversation.lastMessage && getMessageStatus(conversation.lastMessage)}
                          <span className="text-xs text-muted-foreground">
                            {conversation.lastMessage && formatTimestamp(conversation.lastMessage.timestamp)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          {/* Typing indicator */}
                          {conversation.typingUserIds && conversation.typingUserIds.length > 0 ? (
                            <div className="flex items-center gap-1 text-primary">
                              <div className="flex gap-1">
                                <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                              </div>
                              <span className="text-xs">
                                {conversation.typingUserIds.length === 1 ? 'typing...' : `${conversation.typingUserIds.length} typing...`}
                              </span>
                            </div>
                          ) : (
                            <p className={clsx(
                              'text-sm truncate',
                              conversation.unreadCount > 0 ? 'text-foreground' : 'text-muted-foreground'
                            )}>
                              {conversation.lastMessage ? processMessageContent(conversation.lastMessage.content) : 'No messages yet'}
                            </p>
                          )}
                        </div>

                        {/* Unread count */}
                        {conversation.unreadCount > 0 && (
                          <div className="ml-2 flex-shrink-0">
                            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1 text-xs font-medium text-white bg-primary rounded-full">
                              {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions (visible on hover) */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 hover:bg-muted-foreground/10 rounded">
                        <MoreVertical className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ChatList;