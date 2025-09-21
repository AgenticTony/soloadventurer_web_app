// Chat System Type Definitions
// Sprint 3: Comprehensive Chat Types with Official TypeScript Patterns

/**
 * Message Status Enum
 * Tracks message lifecycle states
 */
export enum MessageStatus {
  SENDING = 'sending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

/**
 * Conversation Type Enum
 * Defines conversation types supported
 */
export enum ConversationType {
  DIRECT = 'direct',
  GROUP = 'group',
}

/**
 * Message Content Discriminated Union
 * Following official TypeScript discriminated union patterns
 */
export type MessageContent =
  | {
      type: 'text';
      text: string;
    }
  | {
      type: 'image';
      url: string;
      alt?: string;
      width?: number;
      height?: number;
      thumbnailUrl?: string;
    }
  | {
      type: 'location';
      latitude: number;
      longitude: number;
      address?: string;
      placeName?: string;
    }
  | {
      type: 'file';
      url: string;
      fileName: string;
      fileSize: number;
      mimeType: string;
      thumbnailUrl?: string;
    }
  | {
      type: 'system';
      systemMessageType: 'user_joined' | 'user_left' | 'conversation_created' | 'name_changed';
      metadata?: Record<string, any>;
    };

/**
 * User Interface
 * Core user information for chat participants
 */
export interface User {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
  isOnline: boolean;
  lastSeen?: Date;
  timezone?: string;
}

/**
 * Message Reaction Interface
 * For emoji reactions on messages
 */
export interface MessageReaction {
  emoji: string;
  users: string[]; // User IDs who reacted
  count: number;
}

/**
 * Message Interface
 * Core message structure with status tracking
 */
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: MessageContent;
  status: MessageStatus;
  timestamp: Date;
  editedAt?: Date;
  deletedAt?: Date;

  // Message relationships
  replyToMessageId?: string;
  threadId?: string;

  // Delivery tracking
  readBy: string[]; // User IDs who have read this message
  deliveredTo: string[]; // User IDs who have received this message

  // Interactions
  reactions?: MessageReaction[];

  // Metadata
  metadata?: Record<string, any>;
  isEdited: boolean;
  isDeleted: boolean;
}

/**
 * Conversation Interface
 * Supports both direct (1-1) and group conversations
 */
export interface Conversation {
  id: string;
  type: ConversationType;

  // Basic info
  name?: string; // For group conversations
  description?: string;
  avatar?: string;

  // Participants
  participantIds: string[];
  participants: User[];
  adminIds?: string[]; // For group conversations

  // State
  lastMessage?: Message;
  lastActivity: Date;
  unreadCount: number;

  // Settings
  isPinned: boolean;
  isArchived: boolean;
  isMuted: boolean;
  mutedUntil?: Date;

  // Real-time indicators
  typingUserIds: string[]; // Users currently typing

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Metadata
  metadata?: Record<string, any>;
}

/**
 * Pagination Parameters Interface
 * For paginated message/conversation requests
 */
export interface PaginationParams {
  limit?: number;
  cursor?: string; // Cursor-based pagination
  offset?: number; // Offset-based pagination (alternative)
  before?: string; // Message ID to fetch messages before
  after?: string; // Message ID to fetch messages after
  direction?: 'forward' | 'backward';
}

/**
 * Message Search Parameters
 * For searching messages within conversations
 */
export interface MessageSearchParams extends PaginationParams {
  query: string;
  conversationId?: string;
  senderId?: string;
  messageType?: MessageContent['type'];
  fromDate?: Date;
  toDate?: Date;
}

/**
 * Conversation Search Parameters
 * For searching conversations
 */
export interface ConversationSearchParams extends PaginationParams {
  query: string;
  type?: ConversationType;
  includeArchived?: boolean;
  hasUnread?: boolean;
}

/**
 * Typing Indicator Interface
 * For real-time typing indicators
 */
export interface TypingIndicator {
  conversationId: string;
  userId: string;
  timestamp: Date;
  expiresAt: Date;
}

/**
 * Message Draft Interface
 * For storing unsent message drafts
 */
export interface MessageDraft {
  conversationId: string;
  content: string;
  replyToMessageId?: string;
  timestamp: Date;
}

/**
 * Conversation Settings Interface
 * Per-conversation user preferences
 */
export interface ConversationSettings {
  conversationId: string;
  userId: string;
  notifications: boolean;
  soundEnabled: boolean;
  customNicknames?: Record<string, string>; // userId -> nickname
  theme?: string;
  fontSize?: 'small' | 'medium' | 'large';
}

/**
 * Message Send Input Interface
 * For sending new messages
 */
export interface SendMessageInput {
  conversationId: string;
  content: MessageContent;
  replyToMessageId?: string;
  metadata?: Record<string, any>;
  senderId?: string; // Optional for tests
}

/**
 * Message Update Input Interface
 * For editing existing messages
 */
export interface UpdateMessageInput {
  messageId: string;
  content: MessageContent;
}

/**
 * Conversation Create Input Interface
 * For creating new conversations
 */
export interface CreateConversationInput {
  type: ConversationType;
  participantIds: string[];
  name?: string; // Required for group conversations
  description?: string;
  avatar?: string;
  metadata?: Record<string, any>;
}

/**
 * Conversation Update Input Interface
 * For updating conversation details
 */
export interface UpdateConversationInput {
  conversationId: string;
  name?: string;
  description?: string;
  avatar?: string;
  metadata?: Record<string, any>;
}

/**
 * API Response Wrappers
 * Standardized API response formats
 */

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    hasMore: boolean;
    nextCursor?: string;
    prevCursor?: string;
    total?: number;
  };
}

export interface SendMessageResponse {
  message: Message;
  conversation: Conversation;
}

export interface CreateConversationResponse {
  conversation: Conversation;
  message?: Message; // Optional initial system message
}

/**
 * WebSocket Event Types
 * Real-time chat events
 */
export type ChatEvent =
  | {
      type: 'message_sent';
      data: {
        message: Message;
        conversation: Conversation;
      };
    }
  | {
      type: 'message_updated';
      data: {
        message: Message;
      };
    }
  | {
      type: 'message_deleted';
      data: {
        messageId: string;
        conversationId: string;
      };
    }
  | {
      type: 'message_read';
      data: {
        messageId: string;
        conversationId: string;
        userId: string;
        readAt: Date;
      };
    }
  | {
      type: 'typing_start';
      data: TypingIndicator;
    }
  | {
      type: 'typing_stop';
      data: {
        conversationId: string;
        userId: string;
      };
    }
  | {
      type: 'conversation_updated';
      data: {
        conversation: Conversation;
      };
    }
  | {
      type: 'participant_added';
      data: {
        conversationId: string;
        user: User;
        addedBy: string;
      };
    }
  | {
      type: 'participant_removed';
      data: {
        conversationId: string;
        userId: string;
        removedBy: string;
      };
    }
  | {
      type: 'user_online';
      data: {
        userId: string;
        timestamp: Date;
      };
    }
  | {
      type: 'user_offline';
      data: {
        userId: string;
        lastSeen: Date;
      };
    };

/**
 * Chat Store State Interface
 * For Zustand store implementation
 */
export interface ChatState {
  // Data
  conversations: Record<string, Conversation>;
  messages: Record<string, Message[]>; // conversationId -> messages
  users: Record<string, User>;
  drafts: Record<string, MessageDraft>; // conversationId -> draft

  // UI State
  selectedConversationId: string | null;
  searchQuery: string;
  isLoading: boolean;
  isConnected: boolean;

  // Pagination state
  messagePagination: Record<string, {
    hasMore: boolean;
    cursor?: string;
    isLoading: boolean;
  }>;

  // Error handling
  error: string | null;

  // Last sync timestamp
  lastSync: Date | null;
}

/**
 * Chat Store Actions Interface
 * Actions for chat state management
 */
export interface ChatActions {
  // Message actions
  sendMessage: (input: SendMessageInput) => Promise<void>;
  editMessage: (input: UpdateMessageInput) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  markMessageAsRead: (messageId: string, conversationId: string) => Promise<void>;
  loadMessages: (conversationId: string, params?: PaginationParams) => Promise<void>;
  loadMoreMessages: (conversationId: string) => Promise<void>;

  // Conversation actions
  createConversation: (input: CreateConversationInput) => Promise<Conversation>;
  updateConversation: (input: UpdateConversationInput) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  loadConversations: (params?: ConversationSearchParams) => Promise<void>;
  selectConversation: (conversationId: string | null) => void;
  archiveConversation: (conversationId: string) => Promise<void>;
  pinConversation: (conversationId: string) => Promise<void>;

  // Real-time actions
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;
  subscribeToConversation: (conversationId: string) => void;
  unsubscribeFromConversation: (conversationId: string) => void;

  // Draft actions
  saveDraft: (conversationId: string, content: string) => void;
  clearDraft: (conversationId: string) => void;

  // Search actions
  searchMessages: (params: MessageSearchParams) => Promise<PaginatedResponse<Message>>;
  searchConversations: (params: ConversationSearchParams) => Promise<PaginatedResponse<Conversation>>;
  setSearchQuery: (query: string) => void;

  // Connection actions
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;

  // Utility actions
  reset: () => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Test utility actions
  setConversations: (conversations: any[]) => void;
  addMessage: (message: any) => void;
  updateMessageStatus: (messageId: string, status: string) => void;
}

/**
 * Complete Chat Store Interface
 * Combines state and actions for Zustand
 */
export interface ChatStore extends ChatState, ChatActions {}

/**
 * Type Guards
 * Following official TypeScript discriminated union patterns
 */
export const isTextMessage = (content: MessageContent): content is { type: 'text'; text: string } => {
  return content.type === 'text';
};

export const isImageMessage = (content: MessageContent): content is { type: 'image'; url: string; alt?: string; width?: number; height?: number; thumbnailUrl?: string } => {
  return content.type === 'image';
};

export const isLocationMessage = (content: MessageContent): content is { type: 'location'; latitude: number; longitude: number; address?: string; placeName?: string } => {
  return content.type === 'location';
};

export const isFileMessage = (content: MessageContent): content is { type: 'file'; url: string; fileName: string; fileSize: number; mimeType: string; thumbnailUrl?: string } => {
  return content.type === 'file';
};

export const isSystemMessage = (content: MessageContent): content is { type: 'system'; systemMessageType: 'user_joined' | 'user_left' | 'conversation_created' | 'name_changed'; metadata?: Record<string, any> } => {
  return content.type === 'system';
};

export const isDirectConversation = (conversation: Conversation): boolean => {
  return conversation.type === ConversationType.DIRECT;
};

export const isGroupConversation = (conversation: Conversation): boolean => {
  return conversation.type === ConversationType.GROUP;
};

/**
 * Helper Functions
 * Utility functions for chat operations
 */
export const getConversationName = (conversation: Conversation, currentUserId: string): string => {
  if (conversation.type === ConversationType.GROUP) {
    return conversation.name || `Group (${conversation.participants.length})`;
  }

  const otherParticipant = conversation.participants.find(p => p.id !== currentUserId);
  return otherParticipant?.name || 'Unknown User';
};

export const getConversationAvatar = (conversation: Conversation, currentUserId: string): string | undefined => {
  if (conversation.type === ConversationType.GROUP) {
    return conversation.avatar;
  }

  const otherParticipant = conversation.participants.find(p => p.id !== currentUserId);
  return otherParticipant?.avatar;
};

export const isMessageUnread = (message: Message, currentUserId: string): boolean => {
  return message.senderId !== currentUserId && !message.readBy.includes(currentUserId);
};

export const canEditMessage = (message: Message, currentUserId: string): boolean => {
  return message.senderId === currentUserId &&
         !message.isDeleted &&
         message.content.type !== 'system';
};

export const canDeleteMessage = (message: Message, currentUserId: string, conversation: Conversation): boolean => {
  return message.senderId === currentUserId ||
         (conversation.type === ConversationType.GROUP && (conversation.adminIds?.includes(currentUserId) ?? false));
};

/**
 * Exhaustiveness checking helper
 * Following official TypeScript never type patterns for comprehensive type safety
 */
export const assertNever = (value: never): never => {
  throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
};

/**
 * Safe message content processor with exhaustiveness checking
 * Example usage following official discriminated union patterns
 */
export const processMessageContent = (content: MessageContent): string => {
  switch (content.type) {
    case 'text':
      return content.text;
    case 'image':
      return `Image: ${content.url}`;
    case 'location':
      return `Location: ${content.latitude}, ${content.longitude}`;
    case 'file':
      return `File: ${content.fileName}`;
    case 'system':
      return `System: ${content.systemMessageType}`;
    default:
      // This ensures all cases are handled - TypeScript will error if new types are added
      return assertNever(content);
  }
};

/**
 * Constants
 * Chat system configuration constants
 */
export const CHAT_CONSTANTS = {
  MAX_MESSAGE_LENGTH: 10000,
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_PARTICIPANTS_PER_GROUP: 100,
  TYPING_TIMEOUT: 5000, // 5 seconds
  MESSAGE_BATCH_SIZE: 50,
  SEARCH_DEBOUNCE_MS: 300,
  RECONNECT_DELAY: 1000,
  MAX_RECONNECT_ATTEMPTS: 5,

  // Supported file types
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  SUPPORTED_FILE_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/csv',
  ],
} as const;