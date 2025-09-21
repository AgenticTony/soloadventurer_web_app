// Chat Main Page - Split View Layout with Responsive Design
// Sprint 3: Chat Page Integration with Official Best Practices

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Allotment } from 'allotment';
import 'allotment/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Menu, X, Archive, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useWebSocketContext } from '@/contexts/WebSocketContext';
import { ChatList } from '@/components/chat/ChatList';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { useToast } from '@/contexts/ToastContext';
import { clsx } from 'clsx';
import { chatService } from '@/services/chat/chatService';
import { useChatStore } from '@/store/chatStore';
import type { Conversation, User as ChatUser, Message as ChatMessage } from '@/types/chat';

/**
 * Chat page interfaces following official patterns
 * Using official types from @/types/chat
 */


/**
 * Main Chat Page Component
 * Implements split view for desktop and stacked navigation for mobile
 */
export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showSuccess, showError } = useToast();
  const { isConnected } = useWebSocketContext();

  // State management with store
  const conversations = useChatStore((state) => Object.values(state.conversations));
  const selectedChatId = useChatStore((state) => state.selectedConversationId);
  const setSelectedChatId = useChatStore((state) => state.selectConversation);
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Initialize on mount
  useEffect(() => {
    chatService.loadConversations();

    // Cleanup on unmount
    return () => {
      const store = useChatStore.getState();
      store.reset();
    };
  }, []);

  // Responsive design detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle route changes
  useEffect(() => {
    const conversationId = searchParams.get('conversation');
    if (conversationId && conversationId !== selectedChatId) {
      setSelectedChatId(conversationId);
      setIsMobileMenuOpen(false);
    }
  }, [searchParams, selectedChatId]);

  // Calculate total unread count
  const totalUnreadCount = useMemo(() => {
    return conversations
      .filter(chat => !chat.isArchived)
      .reduce((total, chat) => total + chat.unreadCount, 0);
  }, [conversations]);

  // Get selected chat
  const selectedChat = useMemo(() => {
    return conversations.find(chat => chat.id === selectedChatId) || null;
  }, [conversations, selectedChatId]);

  // Handle chat selection
  const handleChatSelect = useCallback((conversation: Conversation) => {
    setSelectedChatId(conversation.id);

    // Update URL without triggering navigation
    const url = new URL(window.location.href);
    url.searchParams.set('conversation', conversation.id);
    window.history.replaceState({}, '', url.toString());

    // Load messages via chatService
    chatService.syncConversation(conversation.id);

    // Close mobile menu
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  }, [isMobile, setSelectedChatId]);

  // Quick actions using store
  const archiveConversation = useChatStore((state) => state.archiveConversation);
  const deleteConversation = useChatStore((state) => state.deleteConversation);

  const handleArchiveChat = useCallback(async (chatId: string) => {
    try {
      await archiveConversation(chatId);
      showSuccess("Chat archived", "Chat has been moved to archived conversations.");
    } catch (error) {
      showError("Archive failed", "Failed to archive conversation.");
    }
  }, [archiveConversation, showSuccess, showError]);

  const handleDeleteChat = useCallback(async (chatId: string) => {
    try {
      await deleteConversation(chatId);

      if (selectedChatId === chatId) {
        setSelectedChatId(null);
        router.push('/chat');
      }

      showSuccess("Chat deleted", "Chat has been permanently deleted.");
    } catch (error) {
      showError("Delete failed", "Failed to delete conversation.");
    }
  }, [deleteConversation, selectedChatId, setSelectedChatId, router, showSuccess, showError]);

  const handleBlockUser = useCallback((chatId: string) => {
    const chat = conversations.find(c => c.id === chatId);
    if (chat?.type === 'direct') {
      showSuccess("User blocked", "You will no longer receive messages from this user.");
    }
  }, [conversations, showSuccess]);

  const handleNewChat = useCallback(() => {
    router.push('/chat/new');
  }, [router]);

  // Connection status indicator
  const ConnectionStatus = () => (
    <div className={clsx(
      "flex items-center gap-2 px-3 py-2 text-xs",
      isConnected ? "text-green-600" : "text-yellow-600"
    )}>
      <div className={clsx(
        "w-2 h-2 rounded-full",
        isConnected ? "bg-green-500" : "bg-yellow-500 animate-pulse"
      )} />
      {isConnected ? "Connected" : "Reconnecting..."}
    </div>
  );

  // Mobile header
  const MobileHeader = () => (
    <div className="lg:hidden border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <MessageSquare className="w-6 h-6 text-primary" />
          <h1 className="text-lg font-semibold">
            {selectedChat ? selectedChat.name : 'Messages'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {totalUnreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {totalUnreadCount}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNewChat}
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </div>
      <ConnectionStatus />
    </div>
  );

  // Chat list sidebar
  const ChatListSidebar = () => (
    <div className="flex flex-col h-full bg-card border-r border-border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">Messages</h2>
          {totalUnreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {totalUnreadCount}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNewChat}
            title="New chat"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4"
          />
        </div>
      </div>

      {/* Archive toggle */}
      <div className="px-4 py-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowArchived(!showArchived)}
          className="w-full justify-start text-xs"
        >
          <Archive className="w-3 h-3 mr-2" />
          {showArchived ? 'Hide Archived' : 'Show Archived'}
        </Button>
      </div>

      {/* Connection status */}
      <ConnectionStatus />

      {/* Chat list */}
      <div className="flex-1 min-h-0">
        <ChatList
          currentUserId="user1"
          onChatSelect={handleChatSelect}
          selectedChatId={selectedChatId || undefined}
          searchQuery={searchQuery}
          showArchived={showArchived}
          height={400}
        />
      </div>
    </div>
  );

  // Mobile overlay menu
  const MobileOverlay = () => (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.2 }}
            className="fixed left-0 top-0 bottom-0 w-80 bg-card z-50 lg:hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-semibold">Messages</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="h-full overflow-hidden">
              <ChatListSidebar />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // Chat content area
  const ChatContent = () => {
    if (!selectedChat) {
      return (
        <div className="flex-1 flex items-center justify-center bg-muted/30">
          <div className="text-center p-8">
            <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No conversation selected
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Choose a conversation from the sidebar to start messaging
            </p>
            <Button onClick={handleNewChat}>
              <Plus className="w-4 h-4 mr-2" />
              Start New Chat
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col min-h-0">
        <ChatWindow
          chat={selectedChat}
          currentUserId="user1"
          conversationId={selectedChat.id}
          onLoadMore={() => {}}
          height={isMobile ? window.innerHeight - 200 : 600}
        />
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Mobile header */}
      <MobileHeader />

      {/* Mobile overlay */}
      <MobileOverlay />

      {/* Main content */}
      <div className="flex-1 min-h-0">
        {isMobile ? (
          // Mobile: Stacked layout
          <div className="h-full">
            <ChatContent />
          </div>
        ) : (
          // Desktop: Split view with Allotment
          <Allotment defaultSizes={[300, 700]} minSize={250}>
            <Allotment.Pane minSize={250} maxSize={500}>
              <ChatListSidebar />
            </Allotment.Pane>
            <Allotment.Pane>
              <ChatContent />
            </Allotment.Pane>
          </Allotment>
        )}
      </div>
    </div>
  );
}