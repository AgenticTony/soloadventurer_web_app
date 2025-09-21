// Moderation API Layer - User Blocking and Reporting System
// Sprint 3: Following official API patterns with security-first validation

'use client';

/**
 * Report categories following platform moderation standards
 */
export enum ReportCategory {
  SPAM = 'spam',
  HARASSMENT = 'harassment',
  INAPPROPRIATE_CONTENT = 'inappropriate_content',
  HATE_SPEECH = 'hate_speech',
  MISINFORMATION = 'misinformation',
  COPYRIGHT = 'copyright',
  PRIVACY_VIOLATION = 'privacy_violation',
  OTHER = 'other'
}

/**
 * Report status tracking
 */
export enum ReportStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed'
}

/**
 * Block status enum
 */
export enum BlockStatus {
  ACTIVE = 'active',
  REMOVED = 'removed'
}

/**
 * User report interface
 */
export interface UserReport {
  id: string;
  reporterId: string;
  reportedUserId: string;
  category: ReportCategory;
  description: string;
  evidence?: {
    messageId?: string;
    postId?: string;
    screenshots?: string[];
    urls?: string[];
  };
  status: ReportStatus;
  createdAt: Date;
  updatedAt: Date;
  reviewedBy?: string;
  reviewNote?: string;
}

/**
 * Blocked user interface
 */
export interface BlockedUser {
  id: string;
  blockerId: string;
  blockedUserId: string;
  reason?: string;
  status: BlockStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User with blocking status
 */
export interface UserWithBlockStatus {
  id: string;
  username: string;
  name: string;
  avatar?: string;
  isBlocked: boolean;
  hasBlockedYou: boolean;
}

/**
 * API Request/Response types
 */
export interface CreateReportRequest {
  reportedUserId: string;
  category: ReportCategory;
  description: string;
  evidence?: {
    messageId?: string;
    postId?: string;
    screenshots?: string[];
    urls?: string[];
  };
}

export interface CreateReportResponse {
  report: UserReport;
  success: boolean;
  message?: string;
}

export interface BlockUserRequest {
  targetUserId: string;
  reason?: string;
}

export interface BlockUserResponse {
  blockedUser: BlockedUser;
  success: boolean;
  message?: string;
}

export interface UnblockUserRequest {
  targetUserId: string;
}

export interface UnblockUserResponse {
  success: boolean;
  message?: string;
}

export interface GetBlockedUsersResponse {
  blockedUsers: UserWithBlockStatus[];
  total: number;
  hasMore: boolean;
}

/**
 * Moderation API Configuration
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Custom ModerationError class for proper error handling
 */
export class ModerationError extends Error {
  public code: string;
  public details?: Record<string, any>;

  constructor(code: string, message: string, details?: Record<string, any>) {
    super(message);
    this.name = 'ModerationError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Moderation API Client following official patterns
 * Implements security-first validation and optimistic updates
 */
class ModerationAPIClient {
  private baseURL: string;
  private retryAttempts: number = 3;
  private retryDelay: number = 1000;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Generic fetch wrapper with retry logic and security
   */
  private async fetchWithRetry<T>(
    endpoint: string,
    options: RequestInit = {},
    attempt: number = 1
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));

        if (response.status === 401) {
          window.dispatchEvent(new CustomEvent('auth:unauthorized'));
          throw new ModerationError('UNAUTHORIZED', 'Authentication required');
        }

        if (response.status === 429) {
          throw new ModerationError('RATE_LIMITED', 'Too many requests. Please try again later.');
        }

        if (response.status >= 500 && attempt < this.retryAttempts) {
          await this.delay(this.retryDelay * Math.pow(2, attempt - 1));
          return this.fetchWithRetry<T>(endpoint, options, attempt + 1);
        }

        throw new ModerationError(
          errorData.code || 'NETWORK_ERROR',
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ModerationError) {
        throw error;
      }

      if (attempt < this.retryAttempts) {
        await this.delay(this.retryDelay * Math.pow(2, attempt - 1));
        return this.fetchWithRetry<T>(endpoint, options, attempt + 1);
      }

      throw new ModerationError('NETWORK_ERROR', 'Network request failed. Please check your connection.');
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Input validation and sanitization following security best practices
   */
  private validateAndSanitizeInput(data: any): any {
    const sanitized = { ...data };

    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string') {
        sanitized[key] = sanitized[key]
          .trim()
          .replace(/[<>\"']/g, '') // Basic XSS prevention
          .substring(0, 2000); // Prevent overly long inputs
      }
    });

    return sanitized;
  }

  /**
   * Submit a user report
   */
  async submitReport(request: CreateReportRequest): Promise<CreateReportResponse> {
    const sanitizedRequest = this.validateAndSanitizeInput(request);

    // Validate required fields
    if (!sanitizedRequest.reportedUserId) {
      throw new ModerationError('VALIDATION_ERROR', 'Reported user ID is required');
    }

    if (!sanitizedRequest.category || !Object.values(ReportCategory).includes(sanitizedRequest.category)) {
      throw new ModerationError('VALIDATION_ERROR', 'Valid report category is required');
    }

    if (!sanitizedRequest.description || sanitizedRequest.description.length < 10) {
      throw new ModerationError('VALIDATION_ERROR', 'Description must be at least 10 characters');
    }

    if (sanitizedRequest.description.length > 2000) {
      throw new ModerationError('VALIDATION_ERROR', 'Description must be 2000 characters or less');
    }

    return this.fetchWithRetry<CreateReportResponse>('/moderation/reports', {
      method: 'POST',
      body: JSON.stringify(sanitizedRequest),
    });
  }

  /**
   * Block a user
   */
  async blockUser(request: BlockUserRequest): Promise<BlockUserResponse> {
    const sanitizedRequest = this.validateAndSanitizeInput(request);

    if (!sanitizedRequest.targetUserId) {
      throw new ModerationError('VALIDATION_ERROR', 'Target user ID is required');
    }

    if (sanitizedRequest.reason && sanitizedRequest.reason.length > 500) {
      throw new ModerationError('VALIDATION_ERROR', 'Block reason must be 500 characters or less');
    }

    return this.fetchWithRetry<BlockUserResponse>('/moderation/block', {
      method: 'POST',
      body: JSON.stringify(sanitizedRequest),
    });
  }

  /**
   * Unblock a user
   */
  async unblockUser(request: UnblockUserRequest): Promise<UnblockUserResponse> {
    const sanitizedRequest = this.validateAndSanitizeInput(request);

    if (!sanitizedRequest.targetUserId) {
      throw new ModerationError('VALIDATION_ERROR', 'Target user ID is required');
    }

    return this.fetchWithRetry<UnblockUserResponse>('/moderation/unblock', {
      method: 'POST',
      body: JSON.stringify(sanitizedRequest),
    });
  }

  /**
   * Get blocked users list
   */
  async getBlockedUsers(limit: number = 50, offset: number = 0): Promise<GetBlockedUsersResponse> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    return this.fetchWithRetry<GetBlockedUsersResponse>(`/moderation/blocked?${params}`);
  }

  /**
   * Check if a user is blocked
   */
  async isUserBlocked(userId: string): Promise<boolean> {
    if (!userId) {
      throw new ModerationError('VALIDATION_ERROR', 'User ID is required');
    }

    try {
      const response = await this.fetchWithRetry<{ isBlocked: boolean }>(`/moderation/blocked/${userId}`);
      return response.isBlocked;
    } catch (error) {
      // If user not found or error, assume not blocked
      return false;
    }
  }

  /**
   * Get user reports (for admin)
   */
  async getUserReports(
    status?: ReportStatus,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ reports: UserReport[]; total: number; hasMore: boolean }> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    if (status) {
      params.append('status', status);
    }

    return this.fetchWithRetry<{ reports: UserReport[]; total: number; hasMore: boolean }>(
      `/moderation/reports?${params}`
    );
  }
}

/**
 * Helper functions for moderation operations
 */
export const moderationHelpers = {
  /**
   * Get user-friendly report category name
   */
  getReportCategoryName(category: ReportCategory): string {
    const categoryNames = {
      [ReportCategory.SPAM]: 'Spam',
      [ReportCategory.HARASSMENT]: 'Harassment',
      [ReportCategory.INAPPROPRIATE_CONTENT]: 'Inappropriate Content',
      [ReportCategory.HATE_SPEECH]: 'Hate Speech',
      [ReportCategory.MISINFORMATION]: 'Misinformation',
      [ReportCategory.COPYRIGHT]: 'Copyright Violation',
      [ReportCategory.PRIVACY_VIOLATION]: 'Privacy Violation',
      [ReportCategory.OTHER]: 'Other'
    };
    return categoryNames[category] || 'Unknown';
  },

  /**
   * Get report category description
   */
  getReportCategoryDescription(category: ReportCategory): string {
    const descriptions = {
      [ReportCategory.SPAM]: 'Unwanted promotional content or repetitive messages',
      [ReportCategory.HARASSMENT]: 'Bullying, threats, or targeted harassment',
      [ReportCategory.INAPPROPRIATE_CONTENT]: 'Sexual content, violence, or other inappropriate material',
      [ReportCategory.HATE_SPEECH]: 'Content that attacks people based on identity',
      [ReportCategory.MISINFORMATION]: 'False or misleading information',
      [ReportCategory.COPYRIGHT]: 'Unauthorized use of copyrighted material',
      [ReportCategory.PRIVACY_VIOLATION]: 'Sharing private information without consent',
      [ReportCategory.OTHER]: 'Other violations not covered above'
    };
    return descriptions[category] || '';
  },

  /**
   * Validate report input
   */
  validateReportInput(category: string, description: string): { isValid: boolean; error?: string } {
    if (!category || !Object.values(ReportCategory).includes(category as ReportCategory)) {
      return { isValid: false, error: 'Please select a valid report category' };
    }

    if (!description || description.trim().length < 10) {
      return { isValid: false, error: 'Please provide a description of at least 10 characters' };
    }

    if (description.length > 2000) {
      return { isValid: false, error: 'Description must be 2000 characters or less' };
    }

    // Check for potentially malicious content
    const maliciousPatterns = [/<script/i, /javascript:/i, /on\w+=/i];
    if (maliciousPatterns.some(pattern => pattern.test(description))) {
      return { isValid: false, error: 'Description contains invalid content' };
    }

    return { isValid: true };
  }
};

/**
 * Export singleton instance
 */
export const moderationAPI = new ModerationAPIClient();

/**
 * Mock data for development and testing
 */
export const mockBlockedUsers: UserWithBlockStatus[] = [
  {
    id: 'blocked_user_1',
    username: 'spammer123',
    name: 'Spam Account',
    isBlocked: true,
    hasBlockedYou: false
  },
  {
    id: 'blocked_user_2',
    username: 'harasser456',
    name: 'Harassment Account',
    isBlocked: true,
    hasBlockedYou: false
  }
];

export const mockReports: UserReport[] = [
  {
    id: 'report_1',
    reporterId: 'current_user',
    reportedUserId: 'reported_user_1',
    category: ReportCategory.SPAM,
    description: 'This user is sending repeated promotional messages to multiple users',
    status: ReportStatus.PENDING,
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
    updatedAt: new Date(Date.now() - 86400000)
  }
];