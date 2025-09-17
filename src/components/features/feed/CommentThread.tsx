'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Heart, Reply, MoreHorizontal, Trash2, Flag, MessageCircle } from 'lucide-react'

interface User {
  id: string
  name: string
  username: string
  avatar?: string
}

interface Comment {
  id: string
  content: string
  author: User
  timestamp: string
  likes: number
  isLiked?: boolean
  replies?: Comment[]
  isAuthor?: boolean
}

interface CommentThreadProps {
  comments: Comment[]
  onLike?: (commentId: string) => void
  onReply?: (commentId: string, content: string) => void
  onDelete?: (commentId: string) => void
  onReport?: (commentId: string) => void
  currentUserId?: string
  className?: string
}

export function CommentThread({
  comments,
  onLike,
  onReply,
  onDelete,
  onReport,
  currentUserId,
  className = ''
}: CommentThreadProps) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContents, setReplyContents] = useState<Record<string, string>>({})
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set())

  const handleReplySubmit = (commentId: string) => {
    const content = replyContents[commentId]?.trim()
    if (content) {
      onReply?.(commentId, content)
      setReplyContents(prev => ({ ...prev, [commentId]: '' }))
      setReplyingTo(null)
      // Expand replies after posting
      setExpandedReplies(prev => new Set(prev).add(commentId))
    }
  }

  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev)
      if (newSet.has(commentId)) {
        newSet.delete(commentId)
      } else {
        newSet.add(commentId)
      }
      return newSet
    })
  }

  const renderComment = (comment: Comment, isReply = false, depth = 0) => {
    const hasReplies = comment.replies && comment.replies.length > 0
    const showReplies = expandedReplies.has(comment.id)
    const canModerate = currentUserId === comment.author.id || comment.isAuthor

    return (
      <div
        key={comment.id}
        className={`${isReply ? 'ml-8 md:ml-12' : ''} space-y-3`}
      >
        <div className="flex space-x-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              {comment.author.avatar ? (
                <Image
                  src={comment.author.avatar}
                  alt={comment.author.name}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <span className="text-sm font-medium text-foreground">
                  {comment.author.name.charAt(0)}
                </span>
              )}
            </div>
          </div>

          {/* Comment Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-card rounded-xl p-3 shadow-sm">
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <h4 className="font-semibold text-foreground text-sm">
                    {comment.author.name}
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    @{comment.author.username}
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">
                    {comment.timestamp}
                  </span>
                  {comment.isAuthor && (
                    <span className="px-1.5 py-0.5 bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 rounded text-xs font-medium">
                      Author
                    </span>
                  )}
                </div>

                {/* Actions Dropdown */}
                {canModerate && (
                  <div className="relative group">
                    <button className="p-1 hover:bg-muted rounded transition-colors">
                      <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <div className="absolute right-0 top-full mt-1 w-32 bg-card border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                      {onDelete && (
                        <button
                          onClick={() => onDelete(comment.id)}
                          className="w-full px-3 py-2 text-left text-sm text-destructive hover:bg-muted/50 transition-colors flex items-center space-x-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      )}
                      {onReport && (
                        <button
                          onClick={() => onReport(comment.id)}
                          className="w-full px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted/50 transition-colors flex items-center space-x-2"
                        >
                          <Flag className="w-4 h-4" />
                          <span>Report</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Comment Text */}
              <p className="text-sm text-foreground mb-3">
                {comment.content}
              </p>

              {/* Actions */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => onLike?.(comment.id)}
                  className={`flex items-center space-x-1 text-xs transition-colors ${
                    comment.isLiked
                      ? 'text-coral-500'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Heart 
                    className={`w-4 h-4 ${comment.isLiked ? 'fill-current' : ''}`} 
                  />
                  <span>{comment.likes}</span>
                </button>

                {!isReply && (
                  <button
                    onClick={() => {
                      setReplyingTo(replyingTo === comment.id ? null : comment.id)
                      if (replyingTo !== comment.id) {
                        setExpandedReplies(prev => new Set(prev).add(comment.id))
                      }
                    }}
                    className="flex items-center space-x-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Reply className="w-4 h-4" />
                    <span>Reply</span>
                  </button>
                )}
              </div>

              {/* Reply Input */}
              {replyingTo === comment.id && (
                <div className="mt-3 p-3 bg-muted rounded-lg">
                  <textarea
                    value={replyContents[comment.id] || ''}
                    onChange={(e) => setReplyContents(prev => ({
                      ...prev,
                      [comment.id]: e.target.value
                    }))}
                    placeholder="Write a reply..."
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-foreground placeholder:text-muted-foreground"
                    rows={2}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        handleReplySubmit(comment.id)
                      }
                    }}
                  />
                  <div className="flex justify-end mt-2 space-x-2">
                    <button
                      onClick={() => setReplyingTo(null)}
                      className="px-3 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleReplySubmit(comment.id)}
                      disabled={!replyContents[comment.id]?.trim()}
                      className="px-3 py-1 bg-brand-500 text-white rounded-lg text-sm hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Show Replies Toggle */}
            {hasReplies && !isReply && (
              <button
                onClick={() => toggleReplies(comment.id)}
                className="text-xs text-brand-500 hover:text-brand-600 transition-colors"
              >
                {showReplies
                  ? `Hide ${comment.replies!.length} ${comment.replies!.length === 1 ? 'reply' : 'replies'}`
                  : `View ${comment.replies!.length} ${comment.replies!.length === 1 ? 'reply' : 'replies'}`
                }
              </button>
            )}
          </div>
        </div>

        {/* Nested Replies */}
        {hasReplies && showReplies && !isReply && (
          <div className="space-y-3">
            {comment.replies!.map(reply => renderComment(reply, true, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {comments.map(comment => renderComment(comment))}
      
      {/* Empty State */}
      {comments.length === 0 && (
        <div className="text-center py-8">
          <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No comments yet
          </h3>
          <p className="text-muted-foreground">
            Be the first to share your thoughts!
          </p>
        </div>
      )}
    </div>
  )
}

// Loading skeleton for CommentThread
export function CommentThreadSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="bg-card rounded-xl p-3 space-y-2">
              <div className="flex items-center space-x-2">
                <div className="h-4 bg-muted rounded w-24 animate-pulse" />
                <div className="h-3 bg-muted rounded w-16 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="h-3 bg-muted rounded w-full animate-pulse" />
                <div className="h-3 bg-muted rounded w-4/5 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}