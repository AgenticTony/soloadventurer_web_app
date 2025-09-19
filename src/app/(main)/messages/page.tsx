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
        lastSeen: '2 hours ago'
      },
      lastMessage: 'Hey! Are you still planning to visit Kyoto next week?',
      timestamp: '2h ago',
      unread: 2,
      isOnline: true
    },
    {
      id: '2',
      user: {
        name: 'Maya Patel',
        avatar: '',
        location: 'Bali, Indonesia',
        lastSeen: '5 hours ago'
      },
      lastMessage: 'The waterfall hike was amazing! You should definitely come visit 🌊',
      timestamp: '5h ago',
      unread: 0,
      isOnline: false
    },
    {
      id: '3',
      user: {
        name: 'Jordan Kim',
        avatar: '',
        location: 'Barcelona, Spain',
        lastSeen: '1 day ago'
      },
      lastMessage: 'Thanks for the restaurant recommendation! It was incredible 🍽️',
      timestamp: '1d ago',
      unread: 0,
      isOnline: false
    },
    {
      id: '4',
      user: {
        name: 'Emma Wilson',
        avatar: '',
        location: 'Portland, OR',
        lastSeen: '3 days ago'
      },
      lastMessage: 'Are you free to meet up when you\'re in Portland?',
      timestamp: '3d ago',
      unread: 1,
      isOnline: false
    }
  ]

  const mockMessages = {
    '1': [
      {
        id: '1',
        senderId: 'other',
        content: 'Hey Sarah! How are you doing?',
        timestamp: '10:30 AM'
      },
      {
        id: '2',
        senderId: 'me',
        content: 'Hi Alex! I\'m doing great, just finished exploring some temples in Tokyo',
        timestamp: '10:32 AM'
      },
      {
        id: '3',
        senderId: 'other',
        content: 'That sounds amazing! Are you still planning to visit Kyoto next week?',
        timestamp: '10:35 AM'
      }
    ],
    '2': [
      {
        id: '1',
        senderId: 'other',
        content: 'The waterfall hike was incredible! You should definitely come visit 🌊',
        timestamp: 'Yesterday'
      }
    ]
  }

  const selectedConvData = selectedConversation 
    ? mockConversations.find(c => c.id === selectedConversation)
    : null

  const currentMessages = selectedConversation ? mockMessages[selectedConversation as keyof typeof mockMessages] || [] : []

  const handleSendMessage = () => {
    if (message.trim() && selectedConversation) {
      // In a real app, this would send the message
      console.log('Sending message:', message)
      setMessage('')
    }
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex">
      {/* Conversation List */}
      <div className={`w-full md:w-80 border-r border-border ${selectedConversation ? 'hidden md:block' : 'block'}`}>
        <div className="p-4 border-b border-border">
          <h1 className="text-2xl font-bold text-foreground mb-4">Messages</h1>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="overflow-y-auto h-[calc(100vh-12rem)]">
          {mockConversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation.id)}
              className={`w-full p-4 text-left hover:bg-muted transition-colors border-b border-border ${
                selectedConversation === conversation.id ? 'bg-muted' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-sm font-medium text-foreground">
                      {conversation.user.name.charAt(0)}
                    </span>
                  </div>
                  {conversation.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-brand-500 rounded-full border-2 border-card"></div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-foreground truncate">
                      {conversation.user.name}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {conversation.timestamp}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground truncate">
                    {conversation.lastMessage}
                  </p>
                </div>

                {conversation.unread > 0 && (
                  <div className="w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">
                      {conversation.unread}
                    </span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${selectedConversation ? 'flex' : 'hidden md:flex'}`}>
        {selectedConvData ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  ←
                </button>
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-sm font-medium text-foreground">
                      {selectedConvData.user.name.charAt(0)}
                    </span>
                  </div>
                  {selectedConvData.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-brand-500 rounded-full border-2 border-card"></div>
                  )}
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">{selectedConvData.user.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedConvData.isOnline ? 'Online' : `Last seen ${selectedConvData.user.lastSeen}`}
                  </p>
                </div>
              </div>

              <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                <MoreVertical className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      msg.senderId === 'me'
                        ? 'bg-brand-500 text-white'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <p>{msg.content}</p>
                    <p className={`text-xs mt-1 ${
                      msg.senderId === 'me' ? 'text-brand-100' : 'text-muted-foreground'
                    }`}>
                      {msg.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-border">
              <div className="flex items-end space-x-2">
                <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <Paperclip className="w-5 h-5 text-muted-foreground" />
                </button>

                <div className="flex-1">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="w-full px-4 py-2 bg-muted border border-border rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-foreground placeholder:text-muted-foreground"
                    rows={1}
                    onKeyDown={(e) => {
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
                  className="p-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Select a conversation</h3>
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