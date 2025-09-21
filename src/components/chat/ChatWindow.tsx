// Chat Window Component - Virtual Scrolled Message Container
// Sprint 3: Chat Interface Components with Official Best Practices

'use client';

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  Video,
  MoreVertical,
  ArrowDown,
  Users,
  User,
  Wifi,
  WifiOff,
  Search,
  Pin,
  Settings
} from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useWebSocketContext } from '@/contexts/WebSocketContext';
import { useAuth } from '@/contexts/AuthContext';
import { clsx } from 'clsx';
import { useChatStore } from '@/store/chatStore';
import { chatService } from '@/services/chat/chatService';
import type { Conversation, User as ChatUser, Message as ChatMessage, SendMessageInput } from '@/types/chat';
import { processMessageContent } from '@/types/chat';

/**
 * Extended interfaces for chat window
 * Using official types from @/types/chat
 */

interface ChatWindowProps {
  /** Current chat to display */
  chat?: Conversation | null;
  /** Current user ID */
  currentUserId?: string;
  /** Conversation ID to load messages for */
  conversationId?: string;
  /** Loading state for messages */
  isLoadingMessages?: boolean;
  /** Loading older messages */
  isLoadingOlder?: boolean;
  /** Has more messages to load */
  hasMoreMessages?: boolean;
  /** Callback to load older messages */
  onLoadMore?: () => void;
  /** Callback to send a message */
  onSendMessage?: (content: string) => void;
  /** Custom height */
  height?: number;
  /** Show scroll to bottom button threshold */
  scrollThreshold?: number;
}

/**
 * Chat Window Component
 * Implementation based on React Virtuoso VirtuosoMessageList patterns
 */
export const ChatWindow: React.FC<ChatWindowProps> = ({
  chat,
  currentUserId,
  conversationId,
  isLoadingMessages = false,
  isLoadingOlder = false,
  hasMoreMessages = true,
  onLoadMore,
  onSendMessage,
  height = 600,
  scrollThreshold = 200,
}) => {
  const { user, isAuthenticated } = useAuth();
  const { isConnected } = useWebSocketContext();

  const parentRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);

  // Get messages from store
  const messages = useChatStore((state) =>
    conversationId ? state.messages[conversationId] || [] : []
  );
  const sendMessage = useChatStore((state) => state.sendMessage);
  const typingUsers = useChatStore((state) =>
    conversationId ? state.conversations[conversationId]?.typingUserIds || [] : []
  );

  // Load messages on mount
  useEffect(() => {
    if (conversationId) {
      chatService.syncConversation(conversationId);
    }
  }, [conversationId]);

  // Handle send message
  const handleSend = useCallback(async (content: string) => {
    if (!conversationId || !currentUserId) return;

    await sendMessage({
      conversationId,
      content: {
        type: 'text',
        text: content
      }
    });

    // Also call the prop callback if provided
    onSendMessage?.(content);
  }, [conversationId, currentUserId, sendMessage, onSendMessage]);


  // Virtual scrolling setup based on React Virtuoso patterns
  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // Estimated message height
    overscan: 5,
    initialRect: { width: 0, height },
  });

  // Get chat display name
  const getChatName = useCallback(() => {
    if (!chat) return '';

    if (chat.type === 'group') {
      return chat.name || `Group (${chat.participants.length})`;
    }

    const otherParticipant = chat.participants.find(p => p.id !== currentUserId);
    return otherParticipant?.name || 'Unknown User';
  }, [chat, currentUserId]);

  // Get chat participants for group info
  const getOtherParticipants = useCallback(() => {
    if (!chat) return [];
    return chat.participants.filter(p => p.id !== currentUserId);
  }, [chat, currentUserId]);

  // Check if user is online
  const isUserOnline = useCallback(() => {
    if (!chat) return false;
    if (chat.type === 'group') {
      return chat.participants.some(p => p.id !== currentUserId && p.isOnline);
    }
    const otherUser = chat.participants.find(p => p.id !== currentUserId);
    return otherUser?.isOnline || false;
  }, [chat, currentUserId]);

  // Scroll to bottom function
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (parentRef.current) {
      parentRef.current.scrollTo({
        top: parentRef.current.scrollHeight,
        behavior
      });
      setShowScrollButton(false);
    }
  }, []);

  // Handle scroll events for auto-scroll and scroll button
  const handleScroll = useCallback(() => {
    if (!parentRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = parentRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < scrollThreshold;

    setShowScrollButton(!isNearBottom);
    setAutoScroll(isNearBottom);

    // Load more messages when scrolled to top
    if (scrollTop === 0 && hasMoreMessages && !isLoadingOlder && onLoadMore) {
      onLoadMore();
    }
  }, [scrollThreshold, hasMoreMessages, isLoadingOlder, onLoadMore]);

  // Auto-scroll on new messages if user is at bottom
  useEffect(() => {
    if (autoScroll && messages.length > 0) {
      scrollToBottom('smooth');
    }
  }, [messages.length, autoScroll, scrollToBottom]);

  // Initial scroll to bottom
  useEffect(() => {
    if (chat && messages.length > 0) {
      // Use timeout to ensure DOM is ready
      setTimeout(() => scrollToBottom('auto'), 100);
    }
  }, [chat, scrollToBottom, messages.length]);

  if (!chat) {
    return (
      <div className="h-full flex items-center justify-center bg-card">
        <div className="text-center">
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Select a chat</h3>
          <p className="text-sm text-muted-foreground">Choose a conversation to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative">
            {chat.type === 'group' ? (
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
            ) : (
              <>
                {getOtherParticipants()[0]?.avatar ? (
                  <img
                    src={getOtherParticipants()[0].avatar}
                    alt={getChatName()}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                )}
                {/* Online indicator */}
                {isUserOnline() && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
                )}
              </>
            )}
          </div>

          {/* Chat Info */}
          <div>
            <h2 className="font-semibold text-foreground">{getChatName()}</h2>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {isConnected ? (
                <Wifi className="w-3 h-3" />
              ) : (
                <WifiOff className="w-3 h-3" />
              )}
              {chat.type === 'group' ? (
                <span>{chat.participants.length} members</span>
              ) : (
                <span>{isUserOnline() ? 'Online' : 'Offline'}</span>
              )}
              {chat.typingUserIds && chat.typingUserIds.length > 0 && (
                <span className="text-primary">• typing...</span>
              )}
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-muted rounded-full transition-colors">
            <Search className="w-5 h-5 text-muted-foreground" />
          </button>
          <button className="p-2 hover:bg-muted rounded-full transition-colors">
            <Phone className="w-5 h-5 text-muted-foreground" />
          </button>
          <button className="p-2 hover:bg-muted rounded-full transition-colors">
            <Video className="w-5 h-5 text-muted-foreground" />
          </button>
          <button className="p-2 hover:bg-muted rounded-full transition-colors">
            <MoreVertical className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 relative">
        {isLoadingMessages ? (
          <div className="h-full flex items-center justify-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Loading messages...
            </div>
          </div>
        ) : (
          <>
            {/* Virtual Scrolled Messages */}
            <div
              ref={parentRef}
              className="h-full overflow-auto px-4 py-2"
              onScroll={handleScroll}
            >
              {/* Load more indicator */}
              {isLoadingOlder && (
                <div className="flex justify-center py-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    Loading older messages...
                  </div>
                </div>
              )}

              <div
                style={{
                  height: `${virtualizer.getTotalSize()}px`,
                  width: '100%',
                  position: 'relative',
                }}
              >
                <AnimatePresence>
                  {virtualizer.getVirtualItems().map((virtualItem) => {
                    const message = messages[virtualItem.index];
                    const isOwnMessage = message.senderId === currentUserId;
                    const prevMessage = virtualItem.index > 0 ? messages[virtualItem.index - 1] : null;
                    const showAvatar = !prevMessage || prevMessage.senderId !== message.senderId;

                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          transform: `translateY(${virtualItem.start}px)`,
                        }}
                      >
                        <div className={clsx(
                          'flex gap-3 mb-4',
                          isOwnMessage ? 'justify-end' : 'justify-start'
                        )}>
                          {/* Avatar for received messages */}
                          {!isOwnMessage && (
                            <div className={clsx(
                              'w-8 h-8 rounded-full flex-shrink-0',
                              showAvatar ? 'visible' : 'invisible'
                            )}>
                              {showAvatar && (
                                <>
                                  {getOtherParticipants().find(p => p.id === message.senderId)?.avatar ? (
                                    <img
                                      src={getOtherParticipants().find(p => p.id === message.senderId)?.avatar}
                                      alt="Avatar"
                                      className="w-8 h-8 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                      <User className="w-4 h-4 text-primary" />
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          )}

                          {/* Message Content - This will be replaced with MessageBubble component */}
                          <div className={clsx(
                            'max-w-[70%] min-w-[100px]',
                            isOwnMessage ? 'order-first' : ''
                          )}>
                            <div className={clsx(
                              'px-4 py-2 rounded-2xl',
                              isOwnMessage
                                ? 'bg-primary text-primary-foreground rounded-br-sm'
                                : 'bg-muted text-foreground rounded-bl-sm'
                            )}>
                              <p className="text-sm">{processMessageContent(message.content)}</p>
                            </div>

                            {/* Message metadata */}
                            <div className={clsx(
                              'flex items-center gap-1 mt-1 text-xs text-muted-foreground',
                              isOwnMessage ? 'justify-end' : 'justify-start'
                            )}>
                              <span>
                                {message.timestamp.toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              {message.editedAt && (
                                <span>• edited</span>
                              )}
                            </div>

                            {/* Reactions */}
                            {message.reactions && message.reactions.length > 0 && (
                              <div className="flex gap-1 mt-2">
                                {message.reactions.map((reaction, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded-full text-xs"
                                  >
                                    <span>{reaction.emoji}</span>
                                    <span>{reaction.users.length}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>

            {/* Scroll to Bottom Button */}
            <AnimatePresence>
              {showScrollButton && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => scrollToBottom()}
                  className="absolute bottom-4 right-4 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-all duration-200"
                >
                  <ArrowDown className="w-5 h-5" />
                </motion.button>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;