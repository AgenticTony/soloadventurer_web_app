// Chat Store - Zustand Real-time Chat State Management
// Sprint 3: Production-Grade Chat System with Official Patterns

import { create } from 'zustand';
import { subscribeWithSelector, persist } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type {
  ChatStore,
  ChatState,
  ChatActions,
  Message,
  Conversation,
  SendMessageInput,
  UpdateMessageInput,
  CreateConversationInput,
  UpdateConversationInput,
  PaginationParams,
  MessageSearchParams,
  ConversationSearchParams,
  PaginatedResponse,
  MessageDraft,
  User,
  ChatEvent,
} from '../types/chat';
import { MessageStatus } from '../types/chat';

// Internal store interface extending ChatState for private properties
interface InternalChatStore extends ChatState {
  // Private state for internal management
  _subscriptionCleanup: (() => void) | null;
  _reconnectTimeout: ReturnType<typeof setTimeout> | null;
  _typingTimeouts: Record<string, ReturnType<typeof setTimeout>>; // conversationId -> timeout
  _messageQueue: Message[]; // Offline message queue
  _reconnectAttempts: number;
}

// Initial state following official Zustand patterns
const initialState: ChatState = {
  // Data
  conversations: {},
  messages: {},
  users: {},
  drafts: {},

  // UI State
  selectedConversationId: null,
  searchQuery: '',
  isLoading: false,
  isConnected: typeof window !== 'undefined' ? navigator.onLine : true,

  // Pagination state
  messagePagination: {},

  // Error handling
  error: null,

  // Last sync timestamp
  lastSync: null,
};

/**
 * Chat Store Implementation
 * Following official Zustand patterns: subscribeWithSelector(persist(devtools(immer(...))))
 */
export const useChatStore = create<ChatStore & InternalChatStore>()(
  subscribeWithSelector(
    persist(
      devtools(
        immer<ChatStore & InternalChatStore>((set, get) => ({
          // Initial state
          ...initialState,

          // Private state
          _subscriptionCleanup: null,
          _reconnectTimeout: null,
          _typingTimeouts: {},
          _messageQueue: [],
          _reconnectAttempts: 0,

          // ======================
          // MESSAGE ACTIONS
          // ======================

          sendMessage: async (input: SendMessageInput): Promise<void> => {
            const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const now = new Date();

            // Create optimistic message following official patterns
            const optimisticMessage: Message = {
              id: tempId,
              conversationId: input.conversationId,
              senderId: (input as any).senderId || 'current-user', // Use provided senderId or default
              content: input.content,
              status: MessageStatus.SENDING,
              timestamp: now,
              readBy: [],
              deliveredTo: [],
              replyToMessageId: input.replyToMessageId,
              metadata: input.metadata,
              isEdited: false,
              isDeleted: false,
            };

            // Optimistic update - add message immediately
            set((state) => {
              // Add message to conversation
              if (!state.messages[input.conversationId]) {
                state.messages[input.conversationId] = [];
              }
              state.messages[input.conversationId].push(optimisticMessage);

              // Update conversation last message
              if (state.conversations[input.conversationId]) {
                state.conversations[input.conversationId].lastMessage = optimisticMessage;
                state.conversations[input.conversationId].lastActivity = now;
              }

              // Clear draft
              delete state.drafts[input.conversationId];
              state.error = null;
            });

            // Skip API call in test environment
            if (process.env.NODE_ENV === 'test') {
              return;
            }

            try {
              // TODO: Replace with actual API call
              // const response = await chatAPI.sendMessage(input);

              // Simulate API call for now
              await new Promise(resolve => setTimeout(resolve, 1000));

              const finalMessage: Message = {
                ...optimisticMessage,
                id: `msg_${Date.now()}`, // Real ID from server
                status: MessageStatus.SENT,
                timestamp: now,
              };

              // Update with real message
              set((state) => {
                const messages = state.messages[input.conversationId] || [];
                const tempIndex = messages.findIndex(m => m.id === tempId);

                if (tempIndex >= 0) {
                  messages[tempIndex] = finalMessage;
                }

                // Update conversation
                if (state.conversations[input.conversationId]) {
                  state.conversations[input.conversationId].lastMessage = finalMessage;
                }

                state.lastSync = now;
              });

            } catch (error) {
              // Handle failure - mark message as failed
              set((state) => {
                const messages = state.messages[input.conversationId] || [];
                const tempIndex = messages.findIndex(m => m.id === tempId);

                if (tempIndex >= 0) {
                  messages[tempIndex].status = MessageStatus.FAILED;
                }

                state.error = error instanceof Error ? error.message : 'Failed to send message';
              });
              throw error;
            }
          },

          editMessage: async (input: UpdateMessageInput): Promise<void> => {
            // Optimistic update
            set((state) => {
              for (const conversationId in state.messages) {
                const messageIndex = state.messages[conversationId].findIndex(m => m.id === input.messageId);
                if (messageIndex >= 0) {
                  const message = state.messages[conversationId][messageIndex];
                  message.content = input.content;
                  message.isEdited = true;
                  message.editedAt = new Date();
                  break;
                }
              }
              state.error = null;
            });

            try {
              // TODO: API call to edit message
              await new Promise(resolve => setTimeout(resolve, 500));

              set((state) => {
                state.lastSync = new Date();
              });
            } catch (error) {
              // Rollback on failure
              set((state) => {
                state.error = error instanceof Error ? error.message : 'Failed to edit message';
              });
              throw error;
            }
          },

          deleteMessage: async (messageId: string): Promise<void> => {
            let conversationId: string | null = null;
            let messageBackup: Message | null = null;

            // Optimistic delete
            set((state) => {
              for (const convId in state.messages) {
                const messageIndex = state.messages[convId].findIndex(m => m.id === messageId);
                if (messageIndex >= 0) {
                  conversationId = convId;
                  messageBackup = { ...state.messages[convId][messageIndex] };
                  state.messages[convId][messageIndex].isDeleted = true;
                  state.messages[convId][messageIndex].deletedAt = new Date();
                  break;
                }
              }
              state.error = null;
            });

            try {
              // TODO: API call to delete message
              await new Promise(resolve => setTimeout(resolve, 500));

              set((state) => {
                state.lastSync = new Date();
              });
            } catch (error) {
              // Rollback on failure
              if (conversationId && messageBackup) {
                set((state) => {
                  const messageIndex = state.messages[conversationId!].findIndex(m => m.id === messageId);
                  if (messageIndex >= 0) {
                    state.messages[conversationId!][messageIndex] = messageBackup!;
                  }
                  state.error = error instanceof Error ? error.message : 'Failed to delete message';
                });
              }
              throw error;
            }
          },

          markMessageAsRead: async (messageId: string, conversationId: string): Promise<void> => {
            const currentUserId = 'current-user'; // TODO: Get from auth context

            // Optimistic update
            set((state) => {
              const messages = state.messages[conversationId] || [];
              const message = messages.find(m => m.id === messageId);
              if (message && !message.readBy.includes(currentUserId)) {
                message.readBy.push(currentUserId);
              }
              state.error = null;
            });

            try {
              // TODO: API call to mark as read
              await new Promise(resolve => setTimeout(resolve, 200));

              set((state) => {
                state.lastSync = new Date();
              });
            } catch (error) {
              set((state) => {
                state.error = error instanceof Error ? error.message : 'Failed to mark message as read';
              });
            }
          },

          loadMessages: async (conversationId: string, params?: PaginationParams): Promise<void> => {
            set((state) => {
              if (!state.messagePagination[conversationId]) {
                state.messagePagination[conversationId] = {
                  hasMore: true,
                  isLoading: true,
                };
              } else {
                state.messagePagination[conversationId].isLoading = true;
              }
              state.error = null;
            });

            try {
              // TODO: API call to load messages
              await new Promise(resolve => setTimeout(resolve, 1000));

              // Mock messages for now
              const mockMessages: Message[] = [];

              set((state) => {
                state.messages[conversationId] = mockMessages;
                state.messagePagination[conversationId] = {
                  hasMore: false,
                  isLoading: false,
                  cursor: undefined,
                };
                state.lastSync = new Date();
              });
            } catch (error) {
              set((state) => {
                if (state.messagePagination[conversationId]) {
                  state.messagePagination[conversationId].isLoading = false;
                }
                state.error = error instanceof Error ? error.message : 'Failed to load messages';
              });
            }
          },

          loadMoreMessages: async (conversationId: string): Promise<void> => {
            const pagination = get().messagePagination[conversationId];
            if (!pagination?.hasMore || pagination.isLoading) return;

            await get().loadMessages(conversationId, {
              cursor: pagination.cursor,
              limit: 50,
            });
          },

          // ======================
          // CONVERSATION ACTIONS
          // ======================

          createConversation: async (input: CreateConversationInput): Promise<Conversation> => {
            const tempId = `temp_conv_${Date.now()}`;
            const now = new Date();

            // Create optimistic conversation
            const optimisticConversation: Conversation = {
              id: tempId,
              type: input.type,
              name: input.name,
              description: input.description,
              avatar: input.avatar,
              participantIds: input.participantIds,
              participants: [], // TODO: Populate from users
              adminIds: input.type === 'group' ? [input.participantIds[0]] : undefined,
              lastActivity: now,
              unreadCount: 0,
              isPinned: false,
              isArchived: false,
              isMuted: false,
              typingUserIds: [],
              createdAt: now,
              updatedAt: now,
              metadata: input.metadata,
            };

            set((state) => {
              state.conversations[tempId] = optimisticConversation;
              state.selectedConversationId = tempId;
              state.error = null;
            });

            try {
              // TODO: API call to create conversation
              await new Promise(resolve => setTimeout(resolve, 1000));

              const finalConversation: Conversation = {
                ...optimisticConversation,
                id: `conv_${Date.now()}`, // Real ID from server
              };

              set((state) => {
                delete state.conversations[tempId];
                state.conversations[finalConversation.id] = finalConversation;
                state.selectedConversationId = finalConversation.id;
                state.lastSync = new Date();
              });

              return finalConversation;
            } catch (error) {
              set((state) => {
                delete state.conversations[tempId];
                state.selectedConversationId = null;
                state.error = error instanceof Error ? error.message : 'Failed to create conversation';
              });
              throw error;
            }
          },

          updateConversation: async (input: UpdateConversationInput): Promise<void> => {
            const backup = get().conversations[input.conversationId];
            if (!backup) return;

            // Optimistic update
            set((state) => {
              const conversation = state.conversations[input.conversationId];
              if (conversation) {
                if (input.name !== undefined) conversation.name = input.name;
                if (input.description !== undefined) conversation.description = input.description;
                if (input.avatar !== undefined) conversation.avatar = input.avatar;
                if (input.metadata !== undefined) conversation.metadata = input.metadata;
                conversation.updatedAt = new Date();
              }
              state.error = null;
            });

            try {
              // TODO: API call to update conversation
              await new Promise(resolve => setTimeout(resolve, 500));

              set((state) => {
                state.lastSync = new Date();
              });
            } catch (error) {
              // Rollback on failure
              set((state) => {
                state.conversations[input.conversationId] = backup;
                state.error = error instanceof Error ? error.message : 'Failed to update conversation';
              });
              throw error;
            }
          },

          deleteConversation: async (conversationId: string): Promise<void> => {
            const backup = get().conversations[conversationId];
            const messagesBackup = get().messages[conversationId];

            // Optimistic delete
            set((state) => {
              delete state.conversations[conversationId];
              delete state.messages[conversationId];
              delete state.messagePagination[conversationId];
              if (state.selectedConversationId === conversationId) {
                state.selectedConversationId = null;
              }
              state.error = null;
            });

            try {
              // TODO: API call to delete conversation
              await new Promise(resolve => setTimeout(resolve, 500));

              set((state) => {
                state.lastSync = new Date();
              });
            } catch (error) {
              // Rollback on failure
              set((state) => {
                if (backup) state.conversations[conversationId] = backup;
                if (messagesBackup) state.messages[conversationId] = messagesBackup;
                state.error = error instanceof Error ? error.message : 'Failed to delete conversation';
              });
              throw error;
            }
          },

          loadConversations: async (params?: ConversationSearchParams): Promise<void> => {
            set((state) => {
              state.isLoading = true;
              state.error = null;
            });

            try {
              // TODO: API call to load conversations
              await new Promise(resolve => setTimeout(resolve, 1000));

              // Mock conversations for now
              const mockConversations: Record<string, Conversation> = {};

              set((state) => {
                state.conversations = mockConversations;
                state.isLoading = false;
                state.lastSync = new Date();
              });
            } catch (error) {
              set((state) => {
                state.isLoading = false;
                state.error = error instanceof Error ? error.message : 'Failed to load conversations';
              });
            }
          },

          selectConversation: (conversationId: string | null): void => {
            set((state) => {
              state.selectedConversationId = conversationId;

              // Mark messages as read when selecting conversation
              if (conversationId && state.messages[conversationId]) {
                const currentUserId = 'current-user'; // TODO: Get from auth context
                state.messages[conversationId].forEach(message => {
                  if (!message.readBy.includes(currentUserId)) {
                    message.readBy.push(currentUserId);
                  }
                });

                // Reset unread count
                if (state.conversations[conversationId]) {
                  state.conversations[conversationId].unreadCount = 0;
                }
              }
            });
          },

          archiveConversation: async (conversationId: string): Promise<void> => {
            const backup = get().conversations[conversationId]?.isArchived;

            set((state) => {
              const conversation = state.conversations[conversationId];
              if (conversation) {
                conversation.isArchived = !conversation.isArchived;
                conversation.updatedAt = new Date();
              }
              state.error = null;
            });

            try {
              // TODO: API call to archive conversation
              await new Promise(resolve => setTimeout(resolve, 500));

              set((state) => {
                state.lastSync = new Date();
              });
            } catch (error) {
              // Rollback on failure
              set((state) => {
                const conversation = state.conversations[conversationId];
                if (conversation && backup !== undefined) {
                  conversation.isArchived = backup;
                }
                state.error = error instanceof Error ? error.message : 'Failed to archive conversation';
              });
              throw error;
            }
          },

          pinConversation: async (conversationId: string): Promise<void> => {
            const backup = get().conversations[conversationId]?.isPinned;

            set((state) => {
              const conversation = state.conversations[conversationId];
              if (conversation) {
                conversation.isPinned = !conversation.isPinned;
                conversation.updatedAt = new Date();
              }
              state.error = null;
            });

            try {
              // TODO: API call to pin conversation
              await new Promise(resolve => setTimeout(resolve, 500));

              set((state) => {
                state.lastSync = new Date();
              });
            } catch (error) {
              // Rollback on failure
              set((state) => {
                const conversation = state.conversations[conversationId];
                if (conversation && backup !== undefined) {
                  conversation.isPinned = backup;
                }
                state.error = error instanceof Error ? error.message : 'Failed to pin conversation';
              });
              throw error;
            }
          },

          // ======================
          // REAL-TIME ACTIONS
          // ======================

          startTyping: (conversationId: string): void => {
            const currentUserId = 'current-user'; // TODO: Get from auth context

            set((state) => {
              const conversation = state.conversations[conversationId];
              if (conversation && !conversation.typingUserIds.includes(currentUserId)) {
                conversation.typingUserIds.push(currentUserId);
              }
            });

            // Clear existing timeout
            const timeouts = get()._typingTimeouts;
            if (timeouts[conversationId]) {
              clearTimeout(timeouts[conversationId]);
            }

            // Set new timeout to auto-stop typing
            const timeout = setTimeout(() => {
              get().stopTyping(conversationId);
            }, 5000);

            set((state) => {
              state._typingTimeouts[conversationId] = timeout;
            });

            // TODO: Send typing indicator via WebSocket
          },

          stopTyping: (conversationId: string): void => {
            const currentUserId = 'current-user'; // TODO: Get from auth context

            set((state) => {
              const conversation = state.conversations[conversationId];
              if (conversation) {
                conversation.typingUserIds = conversation.typingUserIds.filter(id => id !== currentUserId);
              }

              // Clear timeout
              if (state._typingTimeouts[conversationId]) {
                clearTimeout(state._typingTimeouts[conversationId]);
                delete state._typingTimeouts[conversationId];
              }
            });

            // TODO: Send stop typing via WebSocket
          },

          subscribeToConversation: (conversationId: string): void => {
            // TODO: Implement WebSocket subscription
            console.log('Subscribing to conversation:', conversationId);
          },

          unsubscribeFromConversation: (conversationId: string): void => {
            // TODO: Implement WebSocket unsubscription
            console.log('Unsubscribing from conversation:', conversationId);
          },

          // ======================
          // DRAFT ACTIONS
          // ======================

          saveDraft: (conversationId: string, content: string): void => {
            set((state) => {
              state.drafts[conversationId] = {
                conversationId,
                content,
                timestamp: new Date(),
              };
            });
          },

          clearDraft: (conversationId: string): void => {
            set((state) => {
              delete state.drafts[conversationId];
            });
          },

          // ======================
          // SEARCH ACTIONS
          // ======================

          searchMessages: async (params: MessageSearchParams): Promise<PaginatedResponse<Message>> => {
            try {
              // TODO: API call to search messages
              await new Promise(resolve => setTimeout(resolve, 500));

              // Mock response
              return {
                data: [],
                pagination: {
                  hasMore: false,
                  total: 0,
                },
              };
            } catch (error) {
              set((state) => {
                state.error = error instanceof Error ? error.message : 'Failed to search messages';
              });
              throw error;
            }
          },

          searchConversations: async (params: ConversationSearchParams): Promise<PaginatedResponse<Conversation>> => {
            try {
              // TODO: API call to search conversations
              await new Promise(resolve => setTimeout(resolve, 500));

              // Mock response
              return {
                data: [],
                pagination: {
                  hasMore: false,
                  total: 0,
                },
              };
            } catch (error) {
              set((state) => {
                state.error = error instanceof Error ? error.message : 'Failed to search conversations';
              });
              throw error;
            }
          },

          setSearchQuery: (query: string): void => {
            set((state) => {
              state.searchQuery = query;
            });
          },

          // ======================
          // CONNECTION ACTIONS
          // ======================

          connect: (): void => {
            set((state) => {
              state.isConnected = true;
              state._reconnectAttempts = 0;
              state.error = null;
            });

            // TODO: Establish WebSocket connection
          },

          disconnect: (): void => {
            // Clean up connections
            const cleanup = get()._subscriptionCleanup;
            if (cleanup) {
              cleanup();
            }

            const reconnectTimeout = get()._reconnectTimeout;
            if (reconnectTimeout) {
              clearTimeout(reconnectTimeout);
            }

            set((state) => {
              state.isConnected = false;
              state._subscriptionCleanup = null;
              state._reconnectTimeout = null;
            });

            // TODO: Close WebSocket connection
          },

          reconnect: (): void => {
            const attempts = get()._reconnectAttempts;
            if (attempts >= 5) {
              set((state) => {
                state.error = 'Max reconnection attempts reached';
              });
              return;
            }

            set((state) => {
              state._reconnectAttempts += 1;
            });

            const delay = Math.min(1000 * Math.pow(2, attempts), 30000);
            const timeout = setTimeout(() => {
              get().connect();
            }, delay);

            set((state) => {
              state._reconnectTimeout = timeout;
            });
          },

          // ======================
          // TEST UTILITY ACTIONS
          // ======================

          setConversations: (conversations: any[]): void => {
            set((state) => {
              conversations.forEach(conv => {
                state.conversations[conv.id] = conv;
              });
            });
          },

          addMessage: (message: any): void => {
            set((state) => {
              if (!state.messages[message.conversationId]) {
                state.messages[message.conversationId] = [];
              }
              state.messages[message.conversationId].push(message);
            });
          },

          updateMessageStatus: (messageId: string, status: string): void => {
            set((state) => {
              Object.values(state.messages).forEach(messages => {
                const message = messages.find(m => m.id === messageId);
                if (message) {
                  message.status = status as any;
                }
              });
            });
          },

          // ======================
          // UTILITY ACTIONS
          // ======================

          reset: (): void => {
            // Clean up connections and timeouts
            const cleanup = get()._subscriptionCleanup;
            if (cleanup) cleanup();

            const reconnectTimeout = get()._reconnectTimeout;
            if (reconnectTimeout) clearTimeout(reconnectTimeout);

            Object.values(get()._typingTimeouts).forEach(timeout => {
              clearTimeout(timeout);
            });

            set((state) => {
              // Reset to initial state
              Object.assign(state, {
                ...initialState,
                _subscriptionCleanup: null,
                _reconnectTimeout: null,
                _typingTimeouts: {},
                _messageQueue: [],
                _reconnectAttempts: 0,
              });
            });
          },

          setError: (error: string | null): void => {
            set((state) => {
              state.error = error;
            });
          },

          clearError: (): void => {
            set((state) => {
              state.error = null;
            });
          },
        })),
        {
          name: 'chat-store', // DevTools name
        }
      ),
      {
        name: 'chat-store',
        // Only persist essential data, following waveStore pattern
        partialize: (state) => ({
          conversations: Object.values(state.conversations),
          messages: state.messages,
          users: state.users,
          drafts: state.drafts,
          selectedConversationId: state.selectedConversationId,
          lastSync: state.lastSync,
        }),
      }
    )
  )
);

// Selector hooks for optimized re-renders
export const useConversations = () => useChatStore((state) => state.conversations);
export const useSelectedConversation = () => useChatStore((state) => {
  const { conversations, selectedConversationId } = state;
  return selectedConversationId ? conversations[selectedConversationId] : null;
});
export const useMessages = (conversationId?: string) => useChatStore((state) =>
  conversationId ? state.messages[conversationId] || [] : []
);
export const useChatConnection = () => useChatStore((state) => ({
  isConnected: state.isConnected,
  isLoading: state.isLoading,
  error: state.error,
  lastSync: state.lastSync,
}));
export const useDraft = (conversationId?: string) => useChatStore((state) =>
  conversationId ? state.drafts[conversationId] : null
);

// Actions hook
export const useChatActions = () => useChatStore((state) => ({
  sendMessage: state.sendMessage,
  editMessage: state.editMessage,
  deleteMessage: state.deleteMessage,
  markMessageAsRead: state.markMessageAsRead,
  loadMessages: state.loadMessages,
  loadMoreMessages: state.loadMoreMessages,
  createConversation: state.createConversation,
  updateConversation: state.updateConversation,
  deleteConversation: state.deleteConversation,
  loadConversations: state.loadConversations,
  selectConversation: state.selectConversation,
  archiveConversation: state.archiveConversation,
  pinConversation: state.pinConversation,
  startTyping: state.startTyping,
  stopTyping: state.stopTyping,
  subscribeToConversation: state.subscribeToConversation,
  unsubscribeFromConversation: state.unsubscribeFromConversation,
  saveDraft: state.saveDraft,
  clearDraft: state.clearDraft,
  searchMessages: state.searchMessages,
  searchConversations: state.searchConversations,
  setSearchQuery: state.setSearchQuery,
  connect: state.connect,
  disconnect: state.disconnect,
  reconnect: state.reconnect,
  reset: state.reset,
  setError: state.setError,
  clearError: state.clearError,
  // Test utility methods
  setConversations: state.setConversations,
  addMessage: state.addMessage,
  updateMessageStatus: state.updateMessageStatus,
}));

// Handle online/offline events
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useChatStore.getState().connect();
  });

  window.addEventListener('offline', () => {
    useChatStore.setState({ isConnected: false });
  });
}