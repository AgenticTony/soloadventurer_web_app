// WebSocket Message Queue - Offline Message Persistence
// Sprint 3: Offline Message Handling with Official Best Practices

/**
 * Message queue implementation based on official patterns:
 * - Socket.IO offline message handling
 * - Service Worker patterns for persistent storage
 * - React optimistic updates
 * - IndexedDB for reliable storage
 */

import { WebSocketMessage } from './wsClient';

export interface QueuedMessage extends WebSocketMessage {
  /** Number of retry attempts */
  retries: number;
  /** When message was first queued */
  queuedAt: string;
  /** When to retry sending (for exponential backoff) */
  retryAfter?: string;
  /** Message priority (higher = more important) */
  priority: number;
  /** Whether message should expire */
  expiresAt?: string;
}

export interface MessageQueueOptions {
  /** Maximum number of messages to queue */
  maxSize?: number;
  /** Maximum retry attempts per message */
  maxRetries?: number;
  /** Message TTL in milliseconds */
  messageTTL?: number;
  /** Storage key prefix */
  storagePrefix?: string;
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Message Queue Manager
 * Implements offline message persistence with retry logic
 */
export class MessageQueue {
  private options: Required<MessageQueueOptions>;
  private queue: QueuedMessage[] = [];
  private isInitialized = false;

  // Default configuration based on Socket.IO patterns
  private static readonly DEFAULT_OPTIONS: Required<MessageQueueOptions> = {
    maxSize: 100, // Socket.IO default queue size
    maxRetries: 5, // AWS SDK retry pattern
    messageTTL: 24 * 60 * 60 * 1000, // 24 hours
    storagePrefix: 'soloadventurer_ws_queue',
    debug: process.env.NODE_ENV === 'development',
  };

  constructor(options: MessageQueueOptions = {}) {
    this.options = { ...MessageQueue.DEFAULT_OPTIONS, ...options };
    this.initializeQueue();
  }

  /**
   * Initialize queue from persistent storage
   * Based on Service Worker cache patterns
   */
  private async initializeQueue(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      // Try IndexedDB first (more reliable)
      if ('indexedDB' in window) {
        await this.initializeIndexedDB();
      } else {
        // Fallback to localStorage
        this.initializeLocalStorage();
      }

      this.isInitialized = true;
      this.log('Message queue initialized with', this.queue.length, 'messages');

      // Clean up expired messages
      this.cleanupExpiredMessages();
    } catch (error) {
      this.log('Failed to initialize message queue:', error);
      this.queue = [];
      this.isInitialized = true;
    }
  }

  /**
   * Add message to queue
   * Based on Socket.IO message queuing patterns
   */
  async enqueue(
    message: Omit<WebSocketMessage, 'id' | 'timestamp'>,
    priority: number = 1,
    expiresIn?: number
  ): Promise<boolean> {
    await this.ensureInitialized();

    // Check queue size limit
    if (this.queue.length >= this.options.maxSize) {
      this.log('Queue full, removing oldest message');
      this.queue.shift(); // Remove oldest message (FIFO)
    }

    const queuedMessage: QueuedMessage = {
      id: this.generateMessageId(),
      timestamp: new Date().toISOString(),
      type: message.type,
      data: message.data,
      userId: message.userId,
      retries: 0,
      queuedAt: new Date().toISOString(),
      priority,
      expiresAt: expiresIn ? new Date(Date.now() + expiresIn).toISOString() :
                  new Date(Date.now() + this.options.messageTTL).toISOString(),
    };

    // Insert message based on priority (higher priority first)
    const insertIndex = this.queue.findIndex(msg => msg.priority < priority);
    if (insertIndex === -1) {
      this.queue.push(queuedMessage);
    } else {
      this.queue.splice(insertIndex, 0, queuedMessage);
    }

    this.log('Message queued:', queuedMessage);
    await this.persistQueue();
    return true;
  }

  /**
   * Get next message to send
   * Based on priority queue patterns
   */
  async dequeue(): Promise<QueuedMessage | null> {
    await this.ensureInitialized();

    // Find next eligible message (not waiting for retry)
    const now = new Date();
    const messageIndex = this.queue.findIndex(msg => {
      // Skip if waiting for retry
      if (msg.retryAfter && new Date(msg.retryAfter) > now) {
        return false;
      }
      // Skip if expired
      if (msg.expiresAt && new Date(msg.expiresAt) < now) {
        return false;
      }
      return true;
    });

    if (messageIndex === -1) return null;

    const message = this.queue[messageIndex];
    this.queue.splice(messageIndex, 1);
    await this.persistQueue();

    this.log('Message dequeued:', message);
    return message;
  }

  /**
   * Mark message as failed and schedule retry
   * Based on exponential backoff patterns
   */
  async markFailed(message: QueuedMessage, error?: string): Promise<void> {
    await this.ensureInitialized();

    message.retries++;

    if (message.retries >= this.options.maxRetries) {
      this.log('Message exceeded max retries, dropping:', message);
      return;
    }

    // Exponential backoff with jitter (AWS SDK pattern)
    const baseDelay = 1000; // 1 second
    const maxDelay = 30000; // 30 seconds
    const delay = Math.min(
      baseDelay * Math.pow(2, message.retries - 1),
      maxDelay
    );
    const jitter = delay * 0.1 * Math.random();
    const totalDelay = delay + jitter;

    message.retryAfter = new Date(Date.now() + totalDelay).toISOString();

    // Re-add to queue
    this.queue.push(message);
    await this.persistQueue();

    this.log(`Message retry scheduled in ${totalDelay}ms:`, message);
  }

  /**
   * Get queue status
   */
  async getStatus(): Promise<{
    size: number;
    pendingCount: number;
    retryingCount: number;
    expiredCount: number;
  }> {
    await this.ensureInitialized();

    const now = new Date();
    let pendingCount = 0;
    let retryingCount = 0;
    let expiredCount = 0;

    this.queue.forEach(msg => {
      if (msg.expiresAt && new Date(msg.expiresAt) < now) {
        expiredCount++;
      } else if (msg.retryAfter && new Date(msg.retryAfter) > now) {
        retryingCount++;
      } else {
        pendingCount++;
      }
    });

    return {
      size: this.queue.length,
      pendingCount,
      retryingCount,
      expiredCount,
    };
  }

  /**
   * Clear all messages from queue
   */
  async clear(): Promise<void> {
    await this.ensureInitialized();
    this.queue = [];
    await this.persistQueue();
    this.log('Queue cleared');
  }

  /**
   * Get all messages (for debugging)
   */
  async getAllMessages(): Promise<QueuedMessage[]> {
    await this.ensureInitialized();
    return [...this.queue];
  }

  // Private Methods

  /**
   * Initialize IndexedDB storage
   */
  private async initializeIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(`${this.options.storagePrefix}_db`, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        this.loadFromIndexedDB(db).then(resolve).catch(reject);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('messages')) {
          const store = db.createObjectStore('messages', { keyPath: 'id' });
          store.createIndex('priority', 'priority', { unique: false });
          store.createIndex('queuedAt', 'queuedAt', { unique: false });
        }
      };
    });
  }

  /**
   * Load messages from IndexedDB
   */
  private async loadFromIndexedDB(db: IDBDatabase): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['messages'], 'readonly');
      const store = transaction.objectStore('messages');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.queue = request.result || [];
        resolve();
      };
    });
  }

  /**
   * Initialize localStorage fallback
   */
  private initializeLocalStorage(): void {
    try {
      const stored = localStorage.getItem(this.options.storagePrefix);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      this.log('Failed to load from localStorage:', error);
      this.queue = [];
    }
  }

  /**
   * Persist queue to storage
   */
  private async persistQueue(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      if ('indexedDB' in window) {
        await this.persistToIndexedDB();
      } else {
        this.persistToLocalStorage();
      }
    } catch (error) {
      this.log('Failed to persist queue:', error);
    }
  }

  /**
   * Persist to IndexedDB
   */
  private async persistToIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(`${this.options.storagePrefix}_db`, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['messages'], 'readwrite');
        const store = transaction.objectStore('messages');

        // Clear existing messages
        store.clear();

        // Add current queue
        this.queue.forEach(message => {
          store.add(message);
        });

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      };
    });
  }

  /**
   * Persist to localStorage fallback
   */
  private persistToLocalStorage(): void {
    try {
      localStorage.setItem(this.options.storagePrefix, JSON.stringify(this.queue));
    } catch (error) {
      this.log('Failed to persist to localStorage:', error);
    }
  }

  /**
   * Clean up expired messages
   */
  private async cleanupExpiredMessages(): Promise<void> {
    const now = new Date();
    const initialSize = this.queue.length;

    this.queue = this.queue.filter(msg => {
      return !msg.expiresAt || new Date(msg.expiresAt) > now;
    });

    if (this.queue.length !== initialSize) {
      await this.persistQueue();
      this.log(`Cleaned up ${initialSize - this.queue.length} expired messages`);
    }
  }

  /**
   * Ensure queue is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initializeQueue();
    }
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Debug logging
   */
  private log(...args: any[]): void {
    if (this.options.debug) {
      console.log('[MessageQueue]', ...args);
    }
  }
}

// Export singleton instance
export const messageQueue = new MessageQueue();

// Export for testing
export { MessageQueue as MessageQueueClass };