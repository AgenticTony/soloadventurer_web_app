// Message Bubble Component - Memoized Message Components (Sent/Received)
// Sprint 3: Chat Interface Components with Official Best Practices

'use client';

import React, { memo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  CheckCheck,
  Clock,
  Edit,
  Reply,
  MoreVertical,
  Download,
  Play,
  Pause,
  Image as ImageIcon,
  File,
  Link as LinkIcon,
  Copy,
  Trash2,
  Heart,
  ThumbsUp,
  Smile,
  User
} from 'lucide-react';
import { clsx } from 'clsx';

/**
 * Message and user interfaces based on official patterns
 * Following React memo and performance optimization best practices
 */
interface User {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
}

interface Attachment {
  id: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'link';
  url: string;
  name: string;
  size?: number;
  thumbnail?: string;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    title?: string;
    description?: string;
  };
}

interface Reaction {
  emoji: string;
  users: string[];
  count: number;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file' | 'system' | 'audio' | 'video';
  readBy: string[];
  deliveredTo: string[];
  editedAt?: Date;
  replyTo?: {
    messageId: string;
    content: string;
    senderName: string;
  };
  reactions: Reaction[];
  attachments: Attachment[];
  isOptimistic?: boolean; // For optimistic updates
  failedToSend?: boolean;
}

interface MessageBubbleProps {
  /** The message to display */
  message: Message;
  /** Current user ID */
  currentUserId: string;
  /** User who sent the message */
  sender?: User;
  /** Whether to show avatar */
  showAvatar?: boolean;
  /** Whether to show timestamp */
  showTimestamp?: boolean;
  /** Whether this is part of a group of messages from same sender */
  isGrouped?: boolean;
  /** Whether this is the first message in a group */
  isGroupStart?: boolean;
  /** Whether this is the last message in a group */
  isGroupEnd?: boolean;
  /** Callback for message actions */
  onReaction?: (messageId: string, emoji: string) => void;
  /** Callback for reply */
  onReply?: (message: Message) => void;
  /** Callback for edit */
  onEdit?: (messageId: string) => void;
  /** Callback for delete */
  onDelete?: (messageId: string) => void;
  /** Callback for retry failed message */
  onRetry?: (messageId: string) => void;
  /** Whether to show message actions */
  showActions?: boolean;
}

/**
 * Message Status Component
 * Shows delivery and read status for sent messages
 */
const MessageStatus = memo<{ message: Message; currentUserId: string }>(({ message, currentUserId }) => {
  if (message.senderId !== currentUserId) return null;

  if (message.failedToSend) {
    return (
      <div className="flex items-center gap-1 text-red-500">
        <Clock className="w-3 h-3" />
        <span className="text-xs">Failed</span>
      </div>
    );
  }

  if (message.isOptimistic) {
    return (
      <div className="flex items-center gap-1 text-muted-foreground">
        <Clock className="w-3 h-3 animate-pulse" />
      </div>
    );
  }

  const isRead = message.readBy.some(id => id !== currentUserId);
  const isDelivered = message.deliveredTo.some(id => id !== currentUserId);

  if (isRead) {
    return (
      <div className="flex items-center gap-1 text-blue-500">
        <CheckCheck className="w-3 h-3" />
      </div>
    );
  }

  if (isDelivered) {
    return (
      <div className="flex items-center gap-1 text-muted-foreground">
        <Check className="w-3 h-3" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-muted-foreground">
      <Clock className="w-3 h-3" />
    </div>
  );
});

MessageStatus.displayName = 'MessageStatus';

/**
 * Message Reactions Component
 * Shows and handles emoji reactions
 */
const MessageReactions = memo<{
  reactions: Reaction[];
  onReaction?: (emoji: string) => void;
}>(({ reactions, onReaction }) => {
  if (reactions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {reactions.map((reaction, index) => (
        <motion.button
          key={index}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onReaction?.(reaction.emoji)}
          className="flex items-center gap-1 px-2 py-1 bg-muted/50 hover:bg-muted rounded-full text-xs transition-colors"
        >
          <span>{reaction.emoji}</span>
          <span className="font-medium">{reaction.count}</span>
        </motion.button>
      ))}
    </div>
  );
});

MessageReactions.displayName = 'MessageReactions';

/**
 * Message Actions Component
 * Shows hover actions for messages
 */
const MessageActions = memo<{
  isOwnMessage: boolean;
  onReaction?: () => void;
  onReply?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onCopy?: () => void;
}>(({ isOwnMessage, onReaction, onReply, onEdit, onDelete, onCopy }) => {
  return (
    <div className="absolute -top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <div className="flex items-center gap-1 bg-card border border-border rounded-lg shadow-lg p-1">
        <button
          onClick={onReaction}
          className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
          title="Add reaction"
        >
          <Smile className="w-4 h-4" />
        </button>
        <button
          onClick={onReply}
          className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
          title="Reply"
        >
          <Reply className="w-4 h-4" />
        </button>
        <button
          onClick={onCopy}
          className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
          title="Copy"
        >
          <Copy className="w-4 h-4" />
        </button>
        {isOwnMessage && (
          <>
            <button
              onClick={onEdit}
              className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-1 hover:bg-muted rounded text-red-500 hover:text-red-600 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
});

MessageActions.displayName = 'MessageActions';

/**
 * Attachment Component
 * Handles different types of attachments
 */
const AttachmentComponent = memo<{ attachment: Attachment }>(({ attachment }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const handlePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  switch (attachment.type) {
    case 'image':
      return (
        <div className="relative group mt-2">
          <img
            src={attachment.url}
            alt={attachment.name}
            className="max-w-full h-auto rounded-lg cursor-pointer"
            style={{ maxHeight: '300px' }}
          />
          <div className="absolute inset-0 bg-black/0 hover:bg-black/20 rounded-lg transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <Download className="w-6 h-6 text-white" />
          </div>
        </div>
      );

    case 'video':
      return (
        <div className="relative mt-2 rounded-lg overflow-hidden bg-black/10" style={{ maxWidth: '300px' }}>
          {attachment.thumbnail && (
            <img
              src={attachment.thumbnail}
              alt={attachment.name}
              className="w-full h-auto"
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={handlePlayPause}
              className="p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
          </div>
          {attachment.metadata?.duration && (
            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
              {Math.floor(attachment.metadata.duration / 60)}:{(attachment.metadata.duration % 60).toString().padStart(2, '0')}
            </div>
          )}
        </div>
      );

    case 'audio':
      return (
        <div className="flex items-center gap-3 mt-2 p-3 bg-muted rounded-lg max-w-xs">
          <button
            onClick={handlePlayPause}
            className="p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{attachment.name}</p>
            {attachment.metadata?.duration && (
              <p className="text-xs text-muted-foreground">
                {Math.floor(attachment.metadata.duration / 60)}:{(attachment.metadata.duration % 60).toString().padStart(2, '0')}
              </p>
            )}
          </div>
        </div>
      );

    case 'document':
      return (
        <div className="flex items-center gap-3 mt-2 p-3 bg-muted rounded-lg max-w-xs hover:bg-muted/80 cursor-pointer transition-colors">
          <File className="w-8 h-8 text-primary flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{attachment.name}</p>
            {attachment.size && (
              <p className="text-xs text-muted-foreground">{formatFileSize(attachment.size)}</p>
            )}
          </div>
          <Download className="w-4 h-4 text-muted-foreground" />
        </div>
      );

    case 'link':
      return (
        <div className="mt-2 border border-border rounded-lg overflow-hidden max-w-sm hover:bg-muted/50 cursor-pointer transition-colors">
          {attachment.thumbnail && (
            <img
              src={attachment.thumbnail}
              alt={attachment.metadata?.title || attachment.name}
              className="w-full h-32 object-cover"
            />
          )}
          <div className="p-3">
            <div className="flex items-start gap-2">
              <LinkIcon className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">
                  {attachment.metadata?.title || attachment.name}
                </p>
                {attachment.metadata?.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {attachment.metadata.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {attachment.url}
                </p>
              </div>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
});

AttachmentComponent.displayName = 'AttachmentComponent';

/**
 * Reply Preview Component
 * Shows the message being replied to
 */
const ReplyPreview = memo<{ replyTo: Message['replyTo'] }>(({ replyTo }) => {
  if (!replyTo) return null;

  return (
    <div className="mb-2 p-2 border-l-2 border-primary/50 bg-muted/30 rounded-r text-sm">
      <p className="font-medium text-primary text-xs mb-1">{replyTo.senderName}</p>
      <p className="text-muted-foreground line-clamp-2">{replyTo.content}</p>
    </div>
  );
});

ReplyPreview.displayName = 'ReplyPreview';

/**
 * Main Message Bubble Component
 * Memoized for optimal performance with React.memo
 */
export const MessageBubble = memo<MessageBubbleProps>(({
  message,
  currentUserId,
  sender,
  showAvatar = true,
  showTimestamp = true,
  isGrouped = false,
  isGroupStart = false,
  isGroupEnd = true,
  onReaction,
  onReply,
  onEdit,
  onDelete,
  onRetry,
  showActions = true,
}) => {
  const isOwnMessage = message.senderId === currentUserId;

  // Handle reaction callback
  const handleReaction = useCallback((emoji: string) => {
    onReaction?.(message.id, emoji);
  }, [onReaction, message.id]);

  // Handle action callbacks
  const handleReply = useCallback(() => {
    onReply?.(message);
  }, [onReply, message]);

  const handleEdit = useCallback(() => {
    onEdit?.(message.id);
  }, [onEdit, message.id]);

  const handleDelete = useCallback(() => {
    onDelete?.(message.id);
  }, [onDelete, message.id]);

  const handleRetry = useCallback(() => {
    onRetry?.(message.id);
  }, [onRetry, message.id]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(message.content);
  }, [message.content]);

  // System messages
  if (message.type === 'system') {
    return (
      <div className="flex justify-center my-4">
        <div className="px-3 py-1 bg-muted text-muted-foreground text-xs rounded-full">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        'flex gap-2 mb-2 group relative',
        isOwnMessage ? 'justify-end' : 'justify-start',
        isGrouped && !isGroupStart && 'mt-1',
        message.isOptimistic && 'opacity-70'
      )}
    >
      {/* Avatar for received messages */}
      {!isOwnMessage && showAvatar && (
        <div className={clsx(
          'w-8 h-8 rounded-full flex-shrink-0',
          isGrouped && !isGroupEnd ? 'invisible' : 'visible'
        )}>
          {!isGrouped || isGroupEnd ? (
            sender?.avatar ? (
              <img
                src={sender.avatar}
                alt={sender.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
            )
          ) : null}
        </div>
      )}

      {/* Message Content */}
      <div className={clsx(
        'max-w-[70%] min-w-[100px] relative',
        isOwnMessage ? 'order-first' : ''
      )}>
        {/* Sender name for group chats */}
        {!isOwnMessage && !isGrouped && sender && (
          <p className="text-xs text-muted-foreground mb-1 pl-1">{sender.name}</p>
        )}

        {/* Reply preview */}
        <ReplyPreview replyTo={message.replyTo} />

        {/* Message bubble */}
        <div className={clsx(
          'px-3 py-2 rounded-2xl relative',
          isOwnMessage ? (
            clsx(
              'bg-primary text-primary-foreground',
              isGrouped ? (
                isGroupStart ? 'rounded-br-md' :
                isGroupEnd ? 'rounded-tr-md' :
                'rounded-r-md'
              ) : 'rounded-br-md'
            )
          ) : (
            clsx(
              'bg-muted text-foreground',
              isGrouped ? (
                isGroupStart ? 'rounded-bl-md' :
                isGroupEnd ? 'rounded-tl-md' :
                'rounded-l-md'
              ) : 'rounded-bl-md'
            )
          ),
          message.failedToSend && 'bg-red-500/10 border border-red-500/20'
        )}>
          {/* Message content */}
          <div className="relative">
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>

            {/* Edited indicator */}
            {message.editedAt && (
              <span className="text-xs opacity-70 italic ml-2">(edited)</span>
            )}
          </div>

          {/* Attachments */}
          {message.attachments.map((attachment) => (
            <AttachmentComponent key={attachment.id} attachment={attachment} />
          ))}

          {/* Message actions */}
          {showActions && (
            <MessageActions
              isOwnMessage={isOwnMessage}
              onReaction={() => {/* This would open emoji picker */}}
              onReply={handleReply}
              onEdit={isOwnMessage ? handleEdit : undefined}
              onDelete={isOwnMessage ? handleDelete : undefined}
              onCopy={handleCopy}
            />
          )}
        </div>

        {/* Reactions */}
        <MessageReactions
          reactions={message.reactions}
          onReaction={handleReaction}
        />

        {/* Message metadata */}
        <div className={clsx(
          'flex items-center gap-2 mt-1 text-xs text-muted-foreground',
          isOwnMessage ? 'justify-end' : 'justify-start'
        )}>
          {showTimestamp && (
            <span>
              {message.timestamp.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          )}

          <MessageStatus message={message} currentUserId={currentUserId} />

          {/* Retry button for failed messages */}
          {message.failedToSend && isOwnMessage && (
            <button
              onClick={handleRetry}
              className="text-red-500 hover:text-red-600 underline"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
});

MessageBubble.displayName = 'MessageBubble';

export default MessageBubble;