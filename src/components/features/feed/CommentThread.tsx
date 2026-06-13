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
  className = '',
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
      <div key={comment.id} className={`${isReply ? 'ml-8 md:ml-12' : ''} space-y-3`}>
        <div className="flex space-x-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
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
          <div className="min-w-0 flex-1">
            <div className="rounded-xl bg-card p-3 shadow-sm">
              {/* Header */}
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-semibold text-foreground">{comment.author.name}</h4>
                  <span className="text-xs text-muted-foreground">@{comment.author.username}</span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                  {comment.isAuthor && (
                    <span className="rounded bg-brand-100 px-1.5 py-0.5 text-xs font-medium text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
                      Author
                    </span>
                  )}
                </div>

                {/* Actions Dropdown */}
                {canModerate && (
                  <div className="group relative">
                    <button className="rounded p-1 transition-colors hover:bg-muted">
                      <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <div className="invisible absolute right-0 top-full z-10 mt-1 w-32 rounded-lg border border-border bg-card opacity-0 shadow-lg transition-all duration-200 group-hover:visible group-hover:opacity-100">
                      {onDelete && (
                        <button
                          onClick={() => onDelete(comment.id)}
                          className="flex w-full items-center space-x-2 px-3 py-2 text-left text-sm text-destructive transition-colors hover:bg-muted/50"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete</span>
                        </button>
                      )}
                      {onReport && (
                        <button
                          onClick={() => onReport(comment.id)}
                          className="flex w-full items-center space-x-2 px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted/50"
                        >
                          <Flag className="h-4 w-4" />
                          <span>Report</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Comment Text */}
              <p className="mb-3 text-sm text-foreground">{comment.content}</p>

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
                  <Heart className={`h-4 w-4 ${comment.isLiked ? 'fill-current' : ''}`} />
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
                    className="flex items-center space-x-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Reply className="h-4 w-4" />
                    <span>Reply</span>
                  </button>
                )}
              </div>

              {/* Reply Input */}
              {replyingTo === comment.id && (
                <div className="mt-3 rounded-lg bg-muted p-3">
                  <textarea
                    value={replyContents[comment.id] || ''}
                    onChange={e =>
                      setReplyContents(prev => ({
                        ...prev,
                        [comment.id]: e.target.value,
                      }))
                    }
                    placeholder="Write a reply..."
                    className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500"
                    rows={2}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        handleReplySubmit(comment.id)
                      }
                    }}
                  />
                  <div className="mt-2 flex justify-end space-x-2">
                    <button
                      onClick={() => setReplyingTo(null)}
                      className="px-3 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleReplySubmit(comment.id)}
                      disabled={!replyContents[comment.id]?.trim()}
                      className="rounded-lg bg-brand-500 px-3 py-1 text-sm text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
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
                className="text-xs text-brand-500 transition-colors hover:text-brand-600"
              >
                {showReplies
                  ? `Hide ${comment.replies!.length} ${comment.replies!.length === 1 ? 'reply' : 'replies'}`
                  : `View ${comment.replies!.length} ${comment.replies!.length === 1 ? 'reply' : 'replies'}`}
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
        <div className="py-8 text-center">
          <MessageCircle className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold text-foreground">No comments yet</h3>
          <p className="text-muted-foreground">Be the first to share your thoughts!</p>
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
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          </div>
          <div className="flex-1">
            <div className="space-y-2 rounded-xl bg-card p-3">
              <div className="flex items-center space-x-2">
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                <div className="h-3 w-16 animate-pulse rounded bg-muted" />
              </div>
              <div className="space-y-1">
                <div className="h-3 w-full animate-pulse rounded bg-muted" />
                <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
