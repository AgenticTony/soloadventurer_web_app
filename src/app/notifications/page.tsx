'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Heart, MessageCircle, Users, Calendar, MapPin, Filter } from 'lucide-react'

export default function NotificationsPage() {
  const [activeFilter, setActiveFilter] = useState('all')


  const mockNotifications = [
    {
      id: '1',
      type: 'like',
      actor: {
        name: 'Alex Rodriguez',
        avatar: '',
        location: 'Tokyo, Japan'
      },
      content: 'liked your post about the sunrise at Senso-ji Temple',
      timestamp: '2 minutes ago',
      read: false,
      target: {
        type: 'post',
        id: 'post-1'
      }
    },
    {
      id: '2',
      type: 'comment',
      actor: {
        name: 'Maya Patel',
        avatar: '',
        location: 'Bali, Indonesia'
      },
      content: 'commented: "This looks incredible! I\'d love to visit someday"',
      timestamp: '15 minutes ago',
      read: false,
      target: {
        type: 'post',
        id: 'post-2'
      }
    },
    {
      id: '3',
      type: 'follow',
      actor: {
        name: 'Jordan Kim',
        avatar: '',
        location: 'Barcelona, Spain'
      },
      content: 'started following you',
      timestamp: '1 hour ago',
      read: true,
      target: {
        type: 'user',
        id: 'user-3'
      }
    },
    {
      id: '4',
      type: 'mention',
      actor: {
        name: 'Emma Wilson',
        avatar: '',
        location: 'Portland, OR'
      },
      content: 'mentioned you in a comment: "Hey @sarah, you should check out this cafe!"',
      timestamp: '2 hours ago',
      read: true,
      target: {
        type: 'comment',
        id: 'comment-4'
      }
    },
    {
      id: '5',
      type: 'event',
      actor: {
        name: 'Solo Travelers SF',
        avatar: '',
        location: 'San Francisco, CA'
      },
      content: 'is hosting a meetup this weekend in Golden Gate Park',
      timestamp: '3 hours ago',
      read: true,
      target: {
        type: 'event',
        id: 'event-5'
      }
    },
    {
      id: '6',
      type: 'reaction',
      actor: {
        name: 'David Chen',
        avatar: '',
        location: 'Seattle, WA'
      },
      content: 'reacted ❤️ to your comment about the coffee shop',
      timestamp: '4 hours ago',
      read: true,
      target: {
        type: 'comment',
        id: 'comment-6'
      }
    }
  ]

  const filters = [
    { id: 'all', label: 'All', count: mockNotifications.length },
    { id: 'mentions', label: 'Mentions', count: 1 },
    { id: 'reactions', label: 'Reactions', count: 2 },
    { id: 'follows', label: 'Follows', count: 1 },
    { id: 'events', label: 'Events', count: 1 }
  ]

  const getFilteredNotifications = () => {
    if (activeFilter === 'all') return mockNotifications
    
    return mockNotifications.filter(notification => {
      switch (activeFilter) {
        case 'mentions':
          return notification.type === 'mention'
        case 'reactions':
          return notification.type === 'like' || notification.type === 'reaction'
        case 'follows':
          return notification.type === 'follow'
        case 'events':
          return notification.type === 'event'
        default:
          return true
      }
    })
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
      case 'reaction':
        return <Heart className="w-5 h-5 text-coral-500" />
      case 'comment':
      case 'mention':
        return <MessageCircle className="w-5 h-5 text-sky-500" />
      case 'follow':
        return <Users className="w-5 h-5 text-brand-500" />
      case 'event':
        return <Calendar className="w-5 h-5 text-sun-500" />
      default:
        return <MapPin className="w-5 h-5 text-muted-foreground" />
    }
  }

  const unreadCount = mockNotifications.filter(n => !n.read).length

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
            <p className="text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
            </p>
          </div>
          
          {unreadCount > 0 && (
            <button className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors">
              Mark all as read
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4 overflow-x-auto pb-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={clsx(
                "flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap",
                activeFilter === filter.id
                  ? "bg-brand-500 text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              )}
            >
              <span>{filter.label}</span>
              {filter.count > 0 && (
                <span className={clsx(
                  "px-2 py-0.5 rounded-full text-xs font-medium",
                  activeFilter === filter.id
                    ? "bg-white/20 text-white"
                    : "bg-muted-foreground/20 text-muted-foreground"
                )}>
                  {filter.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-2">
          {getFilteredNotifications().map((notification) => (
            <div
              key={notification.id}
              className={clsx(
                "p-4 bg-card rounded-xl shadow-card hover:shadow-card-hover transition-shadow cursor-pointer",
                !notification.read && "border-l-4 border-l-brand-500"
              )}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-foreground">
                      {notification.actor.name}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {notification.timestamp}
                    </span>
                  </div>
                  
                  <p className="text-sm text-foreground mb-2">
                    {notification.content}
                  </p>
                  
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <span>{notification.actor.location}</span>
                    <span>•</span>
                    <span>{notification.type}</span>
                  </div>
                </div>
                
                {!notification.read && (
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-brand-500 rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {getFilteredNotifications().length === 0 && (
          <div className="text-center py-12">
            <Filter className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No notifications found</h3>
            <p className="text-muted-foreground">
              {activeFilter === 'all' 
                ? 'You\'re all caught up!' 
                : `No ${activeFilter} notifications yet.`
              }
            </p>
          </div>
        )}

        {/* Load More */}
        {getFilteredNotifications().length > 0 && (
          <div className="text-center py-4">
            <button className="px-6 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors">
              Load more notifications
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

function clsx(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}