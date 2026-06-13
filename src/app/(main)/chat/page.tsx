'use client'

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { MessageSquare, Send, ArrowLeft, Search, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { useTypingIndicator } from '@/hooks/useTypingIndicator'
import { TypingIndicator } from '@/components/features/chat/TypingIndicator'
import {
  getChatConversations,
  getMessages,
  sendMessage,
  subscribeToMessages,
  subscribeToAllMessages,
  type ChatConversation,
  type ChatMessage,
} from '@/lib/api/chat'

// ── Chat Page Content ──────────────────────────────────────────

function ChatPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()

  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Typing indicator
  const { isOtherUserTyping, onTypingStart, onTypingStop } = useTypingIndicator({
    connectionId: selectedId,
    userId: user?.id ?? '',
  })

  // Load conversations
  useEffect(() => {
    if (!user) return
    setIsLoading(true)
    getChatConversations()
      .then(setConversations)
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [user])

  // Subscribe to new messages for all conversations
  useEffect(() => {
    if (!user) return

    const unsub = subscribeToAllMessages(user.id, msg => {
      // Add to messages if viewing this conversation
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev
        return [...prev, msg]
      })

      // Update conversation list
      setConversations(prev =>
        prev
          .map(conv =>
            conv.connectionId === msg.connectionId
              ? {
                  ...conv,
                  lastMessage: msg,
                  unreadCount: conv.unreadCount + 1,
                  updatedAt: msg.createdAt,
                }
              : conv
          )
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      )
    })

    return unsub
  }, [user])

  // Handle connection param from URL
  useEffect(() => {
    const connId = searchParams.get('connection')
    if (connId && connId !== selectedId) {
      setSelectedId(connId)
    }
  }, [searchParams])

  // Load messages when selecting a conversation
  useEffect(() => {
    if (!selectedId) return

    getMessages(selectedId).then(setMessages).catch(console.error)

    // Subscribe to new messages in this conversation
    const unsub = subscribeToMessages(selectedId, msg => {
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev
        return [...prev, msg]
      })
    })

    // Mark as read
    setConversations(prev =>
      prev.map(conv => (conv.connectionId === selectedId ? { ...conv, unreadCount: 0 } : conv))
    )

    return unsub
  }, [selectedId])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = useCallback(async () => {
    if (!selectedId || !messageText.trim()) return
    const text = messageText.trim()
    setMessageText('')
    // Clear typing indicator immediately on send
    onTypingStop()
    setIsSending(true)
    try {
      const msg = await sendMessage(selectedId, text)
      setMessages(prev => [...prev, msg])
    } catch (err) {
      console.error('Failed to send message:', err)
      setMessageText(text)
    } finally {
      setIsSending(false)
    }
  }, [selectedId, messageText, onTypingStop])

  const handleInputChange = useCallback(
    (value: string) => {
      setMessageText(value)
      // Broadcast typing on keystroke
      if (value.trim()) {
        onTypingStart()
      }
    },
    [onTypingStart]
  )

  const selectedConversation = conversations.find(c => c.connectionId === selectedId)

  const filteredConversations = searchQuery
    ? conversations.filter(c => {
        const name = c.otherUser.displayName ?? c.otherUser.username ?? ''
        return name.toLowerCase().includes(searchQuery.toLowerCase())
      })
    : conversations

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0)

  // Get the display name for typing indicator
  const otherUserName = selectedConversation
    ? (selectedConversation.otherUser.displayName ??
      selectedConversation.otherUser.username ??
      'Traveler')
    : ''

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="p-8 text-center">
          <p className="mb-4 text-lg text-muted-foreground">Please log in to access messages.</p>
          <Button onClick={() => router.push('/sign-in')}>Go to Login</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - Conversation List */}
      <div
        className={`flex w-full flex-col border-r border-border md:w-80 lg:w-96 ${selectedId ? 'hidden md:flex' : 'flex'}`}
      >
        {/* Header */}
        <div className="border-b border-border p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-brand" />
              <h1 className="text-lg font-bold text-foreground">Messages</h1>
              {totalUnread > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {totalUnread}
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push('/discover')}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex animate-pulse items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-muted" />
                  <div className="flex-1">
                    <div className="mb-2 h-4 w-24 rounded bg-muted" />
                    <div className="h-3 w-36 rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center">
              <MessageSquare className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-1 text-lg font-semibold text-foreground">No messages yet</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Connect with travelers to start chatting
              </p>
              <Button onClick={() => router.push('/discover')}>Discover Travelers</Button>
            </div>
          ) : (
            filteredConversations.map(conv => {
              const name = conv.otherUser.displayName ?? conv.otherUser.username ?? 'Traveler'
              const isSelected = conv.connectionId === selectedId
              return (
                <button
                  key={conv.connectionId}
                  onClick={() => {
                    setSelectedId(conv.connectionId)
                    const url = new URL(window.location.href)
                    url.searchParams.set('connection', conv.connectionId)
                    window.history.replaceState({}, '', url.toString())
                  }}
                  className={`flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-muted ${
                    isSelected ? 'border-r-2 border-brand bg-brand/10' : ''
                  }`}
                >
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-connection font-semibold text-white">
                    {conv.otherUser.avatarUrl ? (
                      <img
                        src={conv.otherUser.avatarUrl}
                        alt={name}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="truncate text-sm font-medium text-foreground">{name}</h3>
                      {conv.lastMessage && (
                        <span className="flex-shrink-0 text-xs text-muted-foreground">
                          {formatTime(conv.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="truncate text-xs text-muted-foreground">
                        {conv.lastMessage?.content ?? 'No messages yet'}
                      </p>
                      {conv.unreadCount > 0 && (
                        <Badge variant="destructive" className="ml-2 flex-shrink-0 text-[10px]">
                          {conv.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex flex-1 flex-col ${selectedId ? 'flex' : 'hidden md:flex'}`}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 border-b border-border p-4">
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => {
                  setSelectedId(null)
                  const url = new URL(window.location.href)
                  url.searchParams.delete('connection')
                  window.history.replaceState({}, '', url.toString())
                }}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand to-connection font-semibold text-white">
                {selectedConversation.otherUser.avatarUrl ? (
                  <img
                    src={selectedConversation.otherUser.avatarUrl}
                    alt={selectedConversation.otherUser.displayName ?? ''}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  (selectedConversation.otherUser.displayName ?? '?').charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h2 className="font-semibold text-foreground">
                  {selectedConversation.otherUser.displayName ??
                    selectedConversation.otherUser.username ??
                    'Traveler'}
                </h2>
                {selectedConversation.otherUser.bio && (
                  <p className="max-w-[200px] truncate text-xs text-muted-foreground">
                    {selectedConversation.otherUser.bio}
                  </p>
                )}
              </div>
            </div>

            {/* Typing Indicator */}
            {isOtherUserTyping && <TypingIndicator name={otherUserName} />}

            {/* Messages */}
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.length === 0 && (
                <div className="py-12 text-center">
                  <MessageSquare className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                  <p className="text-muted-foreground">Start the conversation!</p>
                </div>
              )}
              {messages.map(msg => {
                const isMine = msg.senderId === user?.id
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        isMine ? 'bg-brand text-brand-foreground' : 'bg-muted text-foreground'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words text-sm">{msg.content}</p>
                      <p
                        className={`mt-1 text-[10px] ${isMine ? 'text-brand-foreground/60' : 'text-muted-foreground'}`}
                      >
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="border-t border-border p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={e => handleInputChange(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  disabled={isSending}
                />
                <Button onClick={handleSend} disabled={isSending || !messageText.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <MessageSquare className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-medium text-muted-foreground">
                Select a conversation
              </h3>
              <p className="text-sm text-muted-foreground">
                Choose a conversation from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export default function ChatPage() {
  return (
    <Suspense>
      <ChatPageContent />
    </Suspense>
  )
}
