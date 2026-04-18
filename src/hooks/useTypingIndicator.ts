'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  createTypingDebounce,
  subscribeToTypingIndicators,
  type TypingEvent,
} from '@/lib/api/chat';

interface UseTypingIndicatorOptions {
  connectionId: string | null;
  userId: string;
}

interface UseTypingIndicatorReturn {
  /** Whether the other user is currently typing */
  isOtherUserTyping: boolean;
  /** Call this on each keystroke to broadcast typing status */
  onTypingStart: () => void;
  /** Call this when a message is sent to clear typing status */
  onTypingStop: () => void;
}

const TYPING_DISPLAY_TIMEOUT_MS = 3000;

/**
 * Hook to manage typing indicators for a chat conversation.
 *
 * - Broadcasts typing on keystroke (debounced to 2.5s)
 * - Auto-clears after 5s of inactivity
 * - Clears on message send
 * - Subscribes to other user's typing events
 * - Auto-hides other user's typing after 3s without update
 */
export function useTypingIndicator({
  connectionId,
  userId,
}: UseTypingIndicatorOptions): UseTypingIndicatorReturn {
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const debounceRef = useRef<ReturnType<typeof createTypingDebounce> | null>(null);
  const displayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unsubRef = useRef<(() => void) | null>(null);

  // Clean up previous connection's resources when connectionId changes
  useEffect(() => {
    // Cleanup old
    if (debounceRef.current) {
      debounceRef.current.stop();
      debounceRef.current = null;
    }
    if (unsubRef.current) {
      unsubRef.current();
      unsubRef.current = null;
    }
    if (displayTimeoutRef.current) {
      clearTimeout(displayTimeoutRef.current);
      displayTimeoutRef.current = null;
    }
    setIsOtherUserTyping(false);

    if (!connectionId || !userId) return;

    // Create debounce helper for sending typing events
    debounceRef.current = createTypingDebounce(connectionId, userId);

    // Subscribe to other user's typing events
    const unsub = subscribeToTypingIndicators(
      connectionId,
      userId,
      (event: TypingEvent) => {
        setIsOtherUserTyping(event.isTyping);

        // Reset the display timeout
        if (displayTimeoutRef.current) {
          clearTimeout(displayTimeoutRef.current);
        }

        if (event.isTyping) {
          // Auto-hide typing indicator after 3s without update
          displayTimeoutRef.current = setTimeout(() => {
            setIsOtherUserTyping(false);
          }, TYPING_DISPLAY_TIMEOUT_MS);
        }
      },
    );
    unsubRef.current = unsub;

    return () => {
      if (debounceRef.current) {
        debounceRef.current.stop();
        debounceRef.current = null;
      }
      unsub();
      if (displayTimeoutRef.current) {
        clearTimeout(displayTimeoutRef.current);
        displayTimeoutRef.current = null;
      }
    };
  }, [connectionId, userId]);

  const onTypingStart = useCallback(() => {
    debounceRef.current?.trigger();
  }, []);

  const onTypingStop = useCallback(() => {
    debounceRef.current?.clear();
  }, []);

  return { isOtherUserTyping, onTypingStart, onTypingStop };
}
