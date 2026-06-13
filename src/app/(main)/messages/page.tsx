'use client'

import { useState } from 'react'
import { MessageCircle, Search, Paperclip, Send, MoreVertical } from 'lucide-react'

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  const mockConversations = [
    {
      id: '1',
      user: {
        name: 'Alex Rodriguez',
        avatar: '',
        location: 'Tokyo, Japan',
        lastSeen: '2 hours ago',
      },
      lastMessage: 'Hey! Are you still planning to visit Kyoto next week?',
      timestamp: '2h ago',
      unread: 2,
      isOnline: true,
    },
    {
      id: '2',
      user: {
        name: 'Maya Patel',
        avatar: '',
        location: 'Bali, Indonesia',
        lastSeen: '5 hours ago',
      },
      lastMessage: 'The waterfall hike was amazing! You should definitely come visit 🌊',
      timestamp: '5h ago',
      unread: 0,
      isOnline: false,
    },
    {
      id: '3',
      user: {
        name: 'Jordan Kim',
        avatar: '',
        location: 'Barcelona, Spain',
        lastSeen: '1 day ago',
      },
      lastMessage: 'Thanks for the restaurant recommendation! It was incredible 🍽️',
      timestamp: '1d ago',
      unread: 0,
      isOnline: false,
    },
    {
      id: '4',
      user: {
        name: 'Emma Wilson',
        avatar: '',
        location: 'Portland, OR',
        lastSeen: '3 days ago',
      },
      lastMessage: "Are you free to meet up when you're in Portland?",
      timestamp: '3d ago',
      unread: 1,
      isOnline: false,
    },
  ]

  const mockMessages = {
    '1': [
      {
        id: '1',
        senderId: 'other',
        content: 'Hey Sarah! How are you doing?',
        timestamp: '10:30 AM',
      },
      {
        id: '2',
        senderId: 'me',
        content: "Hi Alex! I'm doing great, just finished exploring some temples in Tokyo",
        timestamp: '10:32 AM',
      },
      {
        id: '3',
        senderId: 'other',
        content: 'That sounds amazing! Are you still planning to visit Kyoto next week?',
        timestamp: '10:35 AM',
      },
    ],
    '2': [
      {
        id: '1',
        senderId: 'other',
        content: 'The waterfall hike was incredible! You should definitely come visit 🌊',
        timestamp: 'Yesterday',
      },
    ],
  }

  const selectedConvData = selectedConversation
    ? mockConversations.find(c => c.id === selectedConversation)
    : null

  const currentMessages = selectedConversation
    ? mockMessages[selectedConversation as keyof typeof mockMessages] || []
    : []

  const handleSendMessage = () => {
    if (message.trim() && selectedConversation) {
      // In a real app, this would send the message
      console.log('Sending message:', message)
      setMessage('')
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)]">
      {/* Conversation List */}
      <div
        className={`w-full border-r border-border md:w-80 ${selectedConversation ? 'hidden md:block' : 'block'}`}
      >
        <div className="border-b border-border p-4">
          <h1 className="mb-4 text-2xl font-bold text-foreground">Messages</h1>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full rounded-xl border border-border bg-muted py-2 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="h-[calc(100vh-12rem)] overflow-y-auto">
          {mockConversations.map(conversation => (
            <button
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation.id)}
              className={`w-full border-b border-border p-4 text-left transition-colors hover:bg-muted ${
                selectedConversation === conversation.id ? 'bg-muted' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <span className="text-sm font-medium text-foreground">
                      {conversation.user.name.charAt(0)}
                    </span>
                  </div>
                  {conversation.isOnline && (
                    <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card bg-brand-500"></div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between">
                    <h3 className="truncate font-semibold text-foreground">
                      {conversation.user.name}
                    </h3>
                    <span className="text-xs text-muted-foreground">{conversation.timestamp}</span>
                  </div>

                  <p className="truncate text-sm text-muted-foreground">
                    {conversation.lastMessage}
                  </p>
                </div>

                {conversation.unread > 0 && (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500">
                    <span className="text-xs font-bold text-white">{conversation.unread}</span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex flex-1 flex-col ${selectedConversation ? 'flex' : 'hidden md:flex'}`}>
        {selectedConvData ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b border-border p-4">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="rounded-lg p-2 transition-colors hover:bg-muted md:hidden"
                >
                  ←
                </button>
                <div className="relative">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <span className="text-sm font-medium text-foreground">
                      {selectedConvData.user.name.charAt(0)}
                    </span>
                  </div>
                  {selectedConvData.isOnline && (
                    <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card bg-brand-500"></div>
                  )}
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">{selectedConvData.user.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedConvData.isOnline
                      ? 'Online'
                      : `Last seen ${selectedConvData.user.lastSeen}`}
                  </p>
                </div>
              </div>

              <button className="rounded-lg p-2 transition-colors hover:bg-muted">
                <MoreVertical className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {currentMessages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs rounded-2xl px-4 py-2 lg:max-w-md ${
                      msg.senderId === 'me' ? 'bg-brand-500 text-white' : 'bg-muted text-foreground'
                    }`}
                  >
                    <p>{msg.content}</p>
                    <p
                      className={`mt-1 text-xs ${
                        msg.senderId === 'me' ? 'text-brand-100' : 'text-muted-foreground'
                      }`}
                    >
                      {msg.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="border-t border-border p-4">
              <div className="flex items-end space-x-2">
                <button className="rounded-lg p-2 transition-colors hover:bg-muted">
                  <Paperclip className="h-5 w-5 text-muted-foreground" />
                </button>

                <div className="flex-1">
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="w-full resize-none rounded-2xl border border-border bg-muted px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500"
                    rows={1}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                  />
                </div>

                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  className="rounded-lg bg-brand-500 p-2 text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <MessageCircle className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold text-foreground">Select a conversation</h3>
              <p className="text-muted-foreground">
                Choose a conversation from the list to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
