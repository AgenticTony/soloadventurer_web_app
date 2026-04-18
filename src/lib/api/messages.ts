// Messages API - Chat System with Pagination and Search
// Production-grade implementation following official patterns

import { ApiClient } from '@/services/base/ApiClient';
import type {
  Message,
  Conversation,
  SendMessageInput,
  UpdateMessageInput,
  PaginatedResponse,
  MessageSearchParams,
  ConversationSearchParams as ConversationListParams,
} from '@/types/chat';

/**
 * Messages API Class
 * Handles all chat-related API operations with proper error handling,
 * authentication, pagination, and retry logic
 */
class MessagesAPI {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = new ApiClient();
  }

  // ======================
  // CONVERSATION METHODS
  // ======================

  /**
   * Get paginated list of conversations for current user
   */
  async getConversations(params?: ConversationListParams): Promise<PaginatedResponse<Conversation>> {
    const queryParams = new URLSearchParams();

    if (params?.query) queryParams.append('query', params.query);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.includeArchived) queryParams.append('includeArchived', 'true');
    if (params?.hasUnread) queryParams.append('hasUnread', 'true');
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.cursor) queryParams.append('cursor', params.cursor);
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const endpoint = `/conversations${queryParams.toString() ? `?${queryParams}` : ''}`;

    return this.apiClient.get<PaginatedResponse<Conversation>>(endpoint);
  }

  /**
   * Get specific conversation by ID
   */
  async getConversation(id: string): Promise<Conversation> {
    return this.apiClient.get<Conversation>(`/conversations/${id}`);
  }

  /**
   * Create new conversation with participants
   */
  async createConversation(participantIds: string[]): Promise<Conversation> {
    const payload = {
      participantIds,
      type: participantIds.length === 2 ? 'direct' : 'group'
    };

    return this.apiClient.post<Conversation>('/conversations', payload);
  }

  /**
   * Update conversation details (name, description, etc.)
   */
  async updateConversation(id: string, data: Partial<Conversation>): Promise<Conversation> {
    // Only allow certain fields to be updated
    const allowedFields = ['name', 'description', 'avatar', 'isPinned', 'isArchived', 'isMuted', 'mutedUntil'];
    const updateData = Object.keys(data)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = data[key as keyof Conversation];
        return obj;
      }, {} as Record<string, unknown>);

    return this.apiClient.put<Conversation>(`/conversations/${id}`, updateData);
  }

  /**
   * Delete conversation permanently
   */
  async deleteConversation(id: string): Promise<void> {
    await this.apiClient.delete<void>(`/conversations/${id}`);
  }

  // ======================
  // MESSAGE METHODS
  // ======================

  /**
   * Get paginated messages for a conversation with cursor-based pagination
   */
  async getMessages(
    conversationId: string,
    cursor?: string,
    limit: number = 20
  ): Promise<PaginatedResponse<Message>> {
    const queryParams = new URLSearchParams();

    queryParams.append('limit', limit.toString());
    if (cursor) queryParams.append('cursor', cursor);

    const endpoint = `/conversations/${conversationId}/messages?${queryParams}`;

    return this.apiClient.get<PaginatedResponse<Message>>(endpoint);
  }

  /**
   * Send new message to conversation
   */
  async sendMessage(input: SendMessageInput): Promise<Message> {
    const endpoint = `/conversations/${input.conversationId}/messages`;

    const payload = {
      content: input.content,
      replyToMessageId: input.replyToMessageId,
      metadata: input.metadata,
    };

    return this.apiClient.post<Message>(endpoint, payload);
  }

  /**
   * Update existing message content
   */
  async updateMessage(id: string, input: UpdateMessageInput): Promise<Message> {
    const payload = {
      content: input.content,
    };

    return this.apiClient.put<Message>(`/messages/${id}`, payload);
  }

  /**
   * Delete message (soft delete - marks as deleted)
   */
  async deleteMessage(id: string): Promise<void> {
    await this.apiClient.delete<void>(`/messages/${id}`);
  }

  /**
   * Mark specific message as read in conversation
   */
  async markAsRead(conversationId: string, messageId: string): Promise<void> {
    const endpoint = `/conversations/${conversationId}/messages/${messageId}/read`;

    await this.apiClient.post<void>(endpoint);
  }

  /**
   * Mark all messages in conversation as read
   */
  async markConversationAsRead(conversationId: string): Promise<void> {
    const endpoint = `/conversations/${conversationId}/read`;

    await this.apiClient.post<void>(endpoint);
  }

  // ======================
  // SEARCH METHODS
  // ======================

  /**
   * Search messages across conversations with advanced filters
   */
  async searchMessages(params: MessageSearchParams): Promise<PaginatedResponse<Message>> {
    const queryParams = new URLSearchParams();

    queryParams.append('query', params.query);
    if (params.conversationId) queryParams.append('conversationId', params.conversationId);
    if (params.senderId) queryParams.append('senderId', params.senderId);
    if (params.messageType) queryParams.append('messageType', params.messageType);
    if (params.fromDate) queryParams.append('fromDate', params.fromDate.toISOString());
    if (params.toDate) queryParams.append('toDate', params.toDate.toISOString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.cursor) queryParams.append('cursor', params.cursor);
    if (params.offset) queryParams.append('offset', params.offset.toString());
    if (params.before) queryParams.append('before', params.before);
    if (params.after) queryParams.append('after', params.after);
    if (params.direction) queryParams.append('direction', params.direction);

    const endpoint = `/messages/search?${queryParams}`;

    return this.apiClient.get<PaginatedResponse<Message>>(endpoint);
  }

  // ======================
  // REAL-TIME METHODS
  // ======================

  /**
   * Send typing indicator to conversation
   */
  async sendTypingIndicator(conversationId: string): Promise<void> {
    const endpoint = `/conversations/${conversationId}/typing`;

    await this.apiClient.post<void>(endpoint, {
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Stop typing indicator in conversation
   */
  async stopTypingIndicator(conversationId: string): Promise<void> {
    const endpoint = `/conversations/${conversationId}/typing`;

    await this.apiClient.delete<void>(endpoint);
  }

  // ======================
  // PARTICIPANT METHODS
  // ======================

  /**
   * Add participant to group conversation
   */
  async addParticipant(conversationId: string, userId: string): Promise<Conversation> {
    const endpoint = `/conversations/${conversationId}/participants`;

    const payload = { userId };

    return this.apiClient.post<Conversation>(endpoint, payload);
  }

  /**
   * Remove participant from group conversation
   */
  async removeParticipant(conversationId: string, userId: string): Promise<Conversation> {
    const endpoint = `/conversations/${conversationId}/participants/${userId}`;

    return this.apiClient.delete<Conversation>(endpoint);
  }

  // ======================
  // UTILITY METHODS
  // ======================

  /**
   * Get message delivery and read status
   */
  async getMessageStatus(messageId: string): Promise<{
    deliveredTo: string[];
    readBy: string[];
    deliveredAt?: Date;
    readAt?: Date;
  }> {
    return this.apiClient.get<{
      deliveredTo: string[];
      readBy: string[];
      deliveredAt?: Date;
      readAt?: Date;
    }>(`/messages/${messageId}/status`);
  }

  /**
   * Get conversation settings for current user
   */
  async getConversationSettings(conversationId: string): Promise<{
    notifications: boolean;
    soundEnabled: boolean;
    customNicknames?: Record<string, string>;
    theme?: string;
    fontSize?: 'small' | 'medium' | 'large';
  }> {
    return this.apiClient.get<{
      notifications: boolean;
      soundEnabled: boolean;
      customNicknames?: Record<string, string>;
      theme?: string;
      fontSize?: 'small' | 'medium' | 'large';
    }>(`/conversations/${conversationId}/settings`);
  }

  /**
   * Update conversation settings for current user
   */
  async updateConversationSettings(
    conversationId: string,
    settings: {
      notifications?: boolean;
      soundEnabled?: boolean;
      customNicknames?: Record<string, string>;
      theme?: string;
      fontSize?: 'small' | 'medium' | 'large';
    }
  ): Promise<void> {
    const endpoint = `/conversations/${conversationId}/settings`;

    await this.apiClient.put<void>(endpoint, settings);
  }
}

// Export singleton instance
export const messagesAPI = new MessagesAPI();

// Export class for testing purposes
export { MessagesAPI };