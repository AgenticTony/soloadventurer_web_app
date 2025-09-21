// Chat Service - Coordination Layer between Store and API
// Production-grade service following official patterns with offline support

import { messagesAPI } from '@/lib/api/messages';
import { useChatStore } from '@/store/chatStore';
import type { Message, SendMessageInput, Conversation, MessageStatus } from '@/types/chat';
import { ConversationType } from '@/types/chat';

/**
 * Chat Service Class
 * Bridges API and Store with offline support, retry logic, and message queue
 * Following official service layer patterns with exponential backoff
 */
class ChatService {
  private messageQueue: Message[] = [];
  private retryTimeouts: Map<string, ReturnType<typeof setTimeout>> = new Map();

  // Get current online status from navigator
  private get isOnline(): boolean {
    return typeof window !== 'undefined' ? navigator.onLine : true;
  }

  constructor() {
    if (typeof window !== 'undefined') {
      this.setupNetworkListener();
      this.processQueue(); // Process any queued messages on startup
    }
  }

  // ======================
  // CORE MESSAGE OPERATIONS
  // ======================

  /**
   * Send message with offline support and optimistic updates
   * Coordinates between store optimistic updates and API calls
   */
  async sendMessage(input: SendMessageInput): Promise<void> {
    const store = useChatStore.getState();

    // Create optimistic message with temp ID
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    const optimisticMessage: Message = {
      id: tempId,
      conversationId: input.conversationId,
      senderId: (input as any).senderId || 'current-user', // Use provided senderId or default
      content: input.content,
      status: 'sending' as MessageStatus,
      timestamp: now,
      editedAt: undefined,
      deletedAt: undefined,
      replyToMessageId: input.replyToMessageId,
      threadId: undefined,
      readBy: [],
      deliveredTo: [],
      reactions: undefined,
      metadata: input.metadata,
      isEdited: false,
      isDeleted: false,
    };

    // Check if offline first - if so, queue the message
    if (!this.isOnline) {
      this.queueMessage(optimisticMessage);
      return;
    }

    // If online, proceed with store operation
    try {
      await store.sendMessage(input);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Load messages for conversation with pagination
   */
  async loadMessages(conversationId: string, cursor?: string): Promise<void> {
    const store = useChatStore.getState();

    try {
      await store.loadMessages(conversationId, { cursor, limit: 50 });
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to load messages');
      throw error;
    }
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId: string, conversationId: string): Promise<void> {
    const store = useChatStore.getState();

    try {
      await store.markMessageAsRead(messageId, conversationId);
    } catch (error) {
      console.warn('Failed to mark message as read:', error);
      // Don't throw for read status - it's not critical
    }
  }

  // ======================
  // OFFLINE QUEUE MANAGEMENT
  // ======================

  /**
   * Add message to offline queue with localStorage persistence
   */
  private queueMessage(message: Message): void {
    // Check for duplicates
    if (!this.messageQueue.find(m => m.id === message.id)) {
      this.messageQueue.push(message);
      this.persistQueue();
    }
  }

  /**
   * Process queued messages when coming back online
   */
  private async processQueue(): Promise<void> {
    // Load queue from localStorage
    this.loadQueue();

    if (!this.isOnline || this.messageQueue.length === 0) {
      return;
    }

    // Process each message in queue
    for (const message of [...this.messageQueue]) {
      try {
        await this.retryMessage(message);
      } catch (error) {
        console.warn('Failed to process queued message:', error);
      }
    }
  }

  /**
   * Persist queue to localStorage
   */
  private persistQueue(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem('message-queue', JSON.stringify(this.messageQueue));
    } catch (error) {
      console.warn('Failed to persist message queue:', error);
    }
  }

  /**
   * Load queue from localStorage
   */
  private loadQueue(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('message-queue');
      if (stored) {
        this.messageQueue = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load message queue:', error);
      this.messageQueue = [];
    }
  }

  // ======================
  // RETRY LOGIC WITH EXPONENTIAL BACKOFF
  // ======================

  /**
   * Schedule retry with exponential backoff
   * Following LangChain/official retry patterns
   */
  private scheduleRetry(message: Message, attempt: number = 1): void {
    // Clear existing timeout if any
    const existingTimeout = this.retryTimeouts.get(message.id);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Don't retry more than 6 times (following LangChain pattern)
    if (attempt > 6) {
      this.removeFromQueue(message.id);
      return;
    }

    const delay = this.exponentialBackoff(attempt);
    const timeout = setTimeout(() => {
      this.retryMessage(message, attempt + 1);
    }, delay);

    this.retryTimeouts.set(message.id, timeout);
  }

  /**
   * Attempt to resend a queued message
   */
  private async retryMessage(message: Message, attempt: number = 1): Promise<void> {
    try {
      const input: SendMessageInput = {
        conversationId: message.conversationId,
        content: message.content,
        replyToMessageId: message.replyToMessageId,
        metadata: message.metadata,
      };

      // Use API directly to avoid double optimistic updates
      const sentMessage = await messagesAPI.sendMessage(input);

      // Success - remove from queue
      this.removeFromQueue(message.id);

      // Update store with successful message
      const store = useChatStore.getState();
      // The store will handle replacing the optimistic message

    } catch (error) {
      console.warn(`Retry attempt ${attempt} failed for message ${message.id}:`, error);

      if (attempt < 6) {
        this.scheduleRetry(message, attempt);
      } else {
        // Max retries reached
        this.removeFromQueue(message.id);
        const store = useChatStore.getState();
        store.setError('Failed to send message after multiple attempts');
      }
    }
  }

  /**
   * Calculate exponential backoff delay
   * Following official patterns: min(1000 * 2^attempt, 30000)
   */
  private exponentialBackoff(attempt: number): number {
    return Math.min(1000 * Math.pow(2, attempt), 30000);
  }

  /**
   * Remove message from queue and persist
   */
  private removeFromQueue(messageId: string): void {
    this.messageQueue = this.messageQueue.filter(m => m.id !== messageId);
    this.persistQueue();

    // Clear retry timeout
    const timeout = this.retryTimeouts.get(messageId);
    if (timeout) {
      clearTimeout(timeout);
      this.retryTimeouts.delete(messageId);
    }
  }

  // ======================
  // NETWORK HANDLING
  // ======================

  /**
   * Setup network event listeners
   */
  private setupNetworkListener(): void {
    window.addEventListener('online', () => {
      const store = useChatStore.getState();
      store.connect();
      this.processQueue(); // Process any queued messages
    });

    window.addEventListener('offline', () => {
      const store = useChatStore.getState();
      store.disconnect();
    });
  }

  // ======================
  // CONVERSATION SYNCHRONIZATION
  // ======================

  /**
   * Sync conversation with latest messages from server
   */
  async syncConversation(conversationId: string): Promise<void> {
    const store = useChatStore.getState();

    try {
      // Load messages from API
      await store.loadMessages(conversationId);

      // Mark conversation as synced
      store.clearError();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sync conversation';
      store.setError(errorMessage);
      throw error;
    }
  }

  /**
   * Subscribe to real-time updates for conversation
   * Prepares for WebSocket integration
   */
  subscribeToUpdates(conversationId: string): () => void {
    const store = useChatStore.getState();

    // Subscribe to conversation via store
    store.subscribeToConversation(conversationId);

    // Return cleanup function
    return () => {
      store.unsubscribeFromConversation(conversationId);
    };
  }

  // ======================
  // CONVERSATION MANAGEMENT
  // ======================

  /**
   * Initialize and load all conversations
   */
  async loadConversations(): Promise<void> {
    const store = useChatStore.getState();

    try {
      await store.loadConversations();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load conversations';
      store.setError(errorMessage);
      throw error;
    }
  }

  /**
   * Create new conversation
   */
  async createConversation(participantIds: string[], name?: string): Promise<Conversation> {
    const store = useChatStore.getState();

    const input = {
      type: participantIds.length === 2 ? ConversationType.DIRECT : ConversationType.GROUP,
      participantIds,
      name,
    };

    try {
      return await store.createConversation(input);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create conversation';
      store.setError(errorMessage);
      throw error;
    }
  }

  // ======================
  // UTILITY METHODS
  // ======================

  /**
   * Get queue status for debugging
   */
  getQueueStatus(): { length: number; messages: Message[]; isOnline: boolean } {
    return {
      length: this.messageQueue.length,
      messages: [...this.messageQueue],
      isOnline: this.isOnline,
    };
  }

  /**
   * Clear message queue (for testing/debugging)
   */
  clearQueue(): void {
    this.messageQueue = [];
    this.persistQueue();

    // Clear all retry timeouts
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
    this.retryTimeouts.clear();
  }

  /**
   * Cleanup method for service destruction
   */
  destroy(): void {
    // Clear all timeouts
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
    this.retryTimeouts.clear();

    // Clear queue
    this.clearQueue();

    // Remove event listeners
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.setupNetworkListener);
      window.removeEventListener('offline', this.setupNetworkListener);
    }
  }
}

// Export singleton instance
export const chatService = new ChatService();

// Export class for testing
export { ChatService };