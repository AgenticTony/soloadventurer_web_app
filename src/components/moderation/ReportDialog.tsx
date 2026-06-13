// Report Dialog Component - User Reporting Interface
// Sprint 3: Following official React dialog patterns and form validation

'use client'

import React, { useState, useCallback, useActionState, useId, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Flag, AlertTriangle, User, Upload, FileImage } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/contexts/ToastContext'
import { clsx } from 'clsx'

/**
 * User interface for reporting operations
 */
interface ReportableUser {
  id: string
  username: string
  name: string
  avatar?: string
}

/**
 * Evidence data for reports
 */
interface ReportEvidence {
  messageId?: string
  postId?: string
  screenshots?: File[]
  urls?: string[]
}

/**
 * Report categories matching the reports table enum
 */
enum ReportCategory {
  HARASSMENT = 'harassment',
  SPAM = 'spam',
  INAPPROPRIATE_CONTENT = 'inappropriate_content',
  SAFETY_CONCERN = 'safety_concern',
  FAKE_PROFILE = 'fake_profile',
  OTHER = 'other',
}

/**
 * Local report category labels and descriptions (replaces dead moderationHelpers)
 */
const REPORT_CATEGORY_INFO: Record<ReportCategory, { name: string; description: string }> = {
  [ReportCategory.HARASSMENT]: {
    name: 'Harassment',
    description: 'Bullying, intimidation, or targeted harassment',
  },
  [ReportCategory.SPAM]: {
    name: 'Spam',
    description: 'Unsolicited messages or repetitive content',
  },
  [ReportCategory.INAPPROPRIATE_CONTENT]: {
    name: 'Inappropriate Content',
    description: 'Offensive, explicit, or disturbing content',
  },
  [ReportCategory.SAFETY_CONCERN]: {
    name: 'Safety Concern',
    description: 'Threats, self-harm, or endangerment',
  },
  [ReportCategory.FAKE_PROFILE]: {
    name: 'Fake Profile',
    description: 'Impersonation or misleading identity',
  },
  [ReportCategory.OTHER]: {
    name: 'Other',
    description: 'Any other violation of community guidelines',
  },
}

/**
 * Submit report action following React 19 useActionState pattern
 */
async function submitReportAction(
  prevState: { error?: string; success?: boolean },
  formData: FormData
): Promise<{ error?: string; success?: boolean; reportId?: string }> {
  try {
    const targetUserId = formData.get('targetUserId') as string
    const category = formData.get('category') as string
    const description = formData.get('description') as string
    const messageId = formData.get('messageId') as string
    const postId = formData.get('postId') as string

    // OWASP allowlist validation
    const allowedCategories = Object.values(ReportCategory)
    if (!allowedCategories.includes(category as ReportCategory)) {
      return { error: 'Invalid report category selected' }
    }

    // Validate description
    if (!description || description.trim().length < 10) {
      return { error: 'Description must be at least 10 characters.' }
    }
    if (description.trim().length > 2000) {
      return { error: 'Description must be 2000 characters or less.' }
    }

    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session?.user) {
      return { error: 'You must be logged in to submit a report.' }
    }

    const { data, error: insertError } = await supabase
      .from('reports')
      .insert({
        reporter_id: session.user.id,
        reported_user_id: targetUserId,
        category,
        description: description.trim(),
        message_id: messageId || null,
        post_id: postId || null,
      })
      .select('id')
      .single()

    if (insertError) {
      return { error: insertError.message || 'Failed to submit report.' }
    }

    return { success: true, reportId: data.id }
  } catch (error) {
    console.error('Submit report action failed:', error)
    const message =
      error instanceof Error ? error.message : 'Failed to submit report. Please try again.'
    return { error: message }
  }
}

/**
 * ReportDialog component props following official dialog patterns
 */
export interface ReportDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean
  /** Function to close the dialog */
  onClose: () => void
  /** User to be reported */
  user: ReportableUser
  /** Optional context (message/post ID) */
  context?: {
    messageId?: string
    postId?: string
    url?: string
  }
  /** Callback when report is successfully submitted */
  onReportSubmitted?: (reportId: string) => void
  /** Custom CSS classes */
  className?: string
}

/**
 * Report Dialog Component
 * Following official React dialog patterns from Material UI documentation
 * Implements controlled components with proper validation and evidence upload
 */
export const ReportDialog: React.FC<ReportDialogProps> = ({
  isOpen,
  onClose,
  user,
  context,
  onReportSubmitted,
  className,
}) => {
  const { showSuccess, showError } = useToast()

  // React 19 official pattern: useActionState for form handling
  const [state, formAction, isPending] = useActionState(submitReportAction, {
    error: undefined,
    success: false,
  })

  // Controlled form state for UI
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | ''>('')
  const [description, setDescription] = useState('')
  const [evidence, setEvidence] = useState<ReportEvidence>({
    messageId: context?.messageId,
    postId: context?.postId,
    urls: context?.url ? [context.url] : [],
    screenshots: [],
  })

  // WAI-ARIA accessibility IDs
  const dialogTitleId = useId()
  const dialogDescId = useId()
  const categoryFieldsetId = useId()
  const descriptionId = useId()

  // Focus management refs
  const dialogRef = useRef<HTMLDivElement>(null)

  // Handle successful form submission
  useEffect(() => {
    if (state.success && state.reportId) {
      showSuccess(
        'Report Submitted',
        `Thank you for reporting this issue. We'll review your report and take appropriate action if needed.`
      )
      onReportSubmitted?.(state.reportId)

      // Reset form and close dialog
      setSelectedCategory('')
      setDescription('')
      setEvidence({ screenshots: [], urls: [] })
      onClose()
    }
  }, [state.success, state.reportId, showSuccess, onReportSubmitted, onClose])

  // Handle form errors
  useEffect(() => {
    if (state.error) {
      showError('Failed to Submit Report', state.error)
    }
  }, [state.error, showError])

  /**
   * Handle dialog close with confirmation if form has data
   */
  const handleClose = useCallback(() => {
    if ((selectedCategory || description || evidence.screenshots?.length) && !isPending) {
      const confirmClose = window.confirm(
        'Are you sure you want to cancel? Your report will be lost.'
      )
      if (!confirmClose) return
    }

    // Reset form state
    setSelectedCategory('')
    setDescription('')
    setEvidence({ screenshots: [], urls: [] })
    onClose()
  }, [selectedCategory, description, evidence.screenshots, isPending, onClose])

  /**
   * Handle category selection
   */
  const handleCategoryChange = useCallback((category: ReportCategory) => {
    setSelectedCategory(category)
  }, [])

  /**
   * Handle description input
   */
  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setDescription(value)
  }, [])

  /**
   * Handle screenshot upload
   */
  const handleScreenshotUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles = files.filter(file => {
      return file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024
    })

    setEvidence(prev => ({
      ...prev,
      screenshots: [...(prev.screenshots || []), ...validFiles].slice(0, 5),
    }))
  }, [])

  /**
   * Remove screenshot
   */
  const removeScreenshot = useCallback((index: number) => {
    setEvidence(prev => ({
      ...prev,
      screenshots: prev.screenshots?.filter((_, i) => i !== index) || [],
    }))
  }, [])

  /**
   * Handle URL addition
   */
  const handleAddUrl = useCallback((url: string) => {
    if (!url.trim()) return

    setEvidence(prev => ({
      ...prev,
      urls: [...(prev.urls || []), url.trim()].slice(0, 10),
    }))
  }, [])

  /**
   * Remove URL
   */
  const removeUrl = useCallback((index: number) => {
    setEvidence(prev => ({
      ...prev,
      urls: prev.urls?.filter((_, i) => i !== index) || [],
    }))
  }, [])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={clsx(
                'relative w-full max-w-2xl rounded-lg bg-white shadow-xl dark:bg-gray-900',
                'max-h-[90vh] overflow-hidden',
                className
              )}
              role="dialog"
              aria-modal="true"
              aria-labelledby="report-dialog-title"
              aria-describedby="report-dialog-description"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-orange-100 p-2 dark:bg-orange-900/30">
                    <Flag className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h2
                      id="report-dialog-title"
                      className="text-lg font-semibold text-gray-900 dark:text-white"
                    >
                      Report User
                    </h2>
                    <p
                      id="report-dialog-description"
                      className="text-sm text-gray-600 dark:text-gray-400"
                    >
                      Report {user.name} for violating community guidelines
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isPending}
                  className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                  aria-label="Close dialog"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="max-h-[70vh] overflow-y-auto p-6">
                {/* User info */}
                <div className="mb-6 flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300 dark:bg-gray-600">
                      <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">@{user.username}</p>
                  </div>
                </div>

                {/* Warning */}
                <div className="mb-6 flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                  <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                  <div className="text-sm">
                    <p className="mb-1 font-medium text-blue-800 dark:text-blue-300">
                      Before submitting your report:
                    </p>
                    <ul className="list-inside list-disc space-y-1 text-blue-700 dark:text-blue-400">
                      <li>Only report genuine violations of our community guidelines</li>
                      <li>Provide specific details and evidence if possible</li>
                      <li>False reports may result in action against your account</li>
                    </ul>
                  </div>
                </div>

                {/* Form */}
                <form id="submitReportForm" action={formAction} className="space-y-6">
                  {/* Hidden inputs for form data */}
                  <input type="hidden" name="targetUserId" value={user.id} />
                  <input type="hidden" name="category" value={selectedCategory} />
                  <input type="hidden" name="description" value={description} />
                  <input type="hidden" name="messageId" value={evidence.messageId || ''} />
                  <input type="hidden" name="postId" value={evidence.postId || ''} />

                  {/* General error */}
                  {state.error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
                      <p className="text-sm text-red-700 dark:text-red-400">{state.error}</p>
                    </div>
                  )}

                  {/* Category selection */}
                  <div>
                    <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      What is the issue?
                    </label>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {Object.values(ReportCategory).map(category => (
                        <label
                          key={category}
                          className={clsx(
                            'flex cursor-pointer items-start rounded-lg border p-3 transition-colors',
                            selectedCategory === category
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
                          )}
                        >
                          <input
                            type="radio"
                            name="reportCategory"
                            value={category}
                            checked={selectedCategory === category}
                            onChange={() => handleCategoryChange(category)}
                            className="mt-0.5 h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                            disabled={isPending}
                          />
                          <div className="ml-3">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {REPORT_CATEGORY_INFO[category as ReportCategory]?.name ?? category}
                            </span>
                            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                              {REPORT_CATEGORY_INFO[category as ReportCategory]?.description ?? ''}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label
                      htmlFor="description"
                      className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Describe the issue
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={handleDescriptionChange}
                      placeholder="Please provide specific details about what happened..."
                      className={clsx(
                        'w-full rounded-lg border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500',
                        'h-24 resize-none',
                        false
                          ? 'border-red-300 dark:border-red-600'
                          : 'border-gray-300 dark:border-gray-600',
                        'bg-white text-gray-900 dark:bg-gray-800 dark:text-white'
                      )}
                      disabled={isPending}
                      maxLength={2000}
                      required
                    />
                    <div className="mt-1 flex justify-between">
                      <p className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                        {description.length}/2000
                      </p>
                    </div>
                  </div>

                  {/* Evidence Section */}
                  <div>
                    <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Evidence (Optional)
                    </label>

                    {/* Screenshots */}
                    <div className="mb-4">
                      <label className="mb-2 block text-xs font-medium text-gray-600 dark:text-gray-400">
                        Screenshots (Max 5, 5MB each)
                      </label>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleScreenshotUpload}
                        className="hidden"
                        id="screenshot-upload"
                        disabled={isPending}
                      />
                      <label
                        htmlFor="screenshot-upload"
                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
                      >
                        <Upload className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Upload Screenshots
                        </span>
                      </label>

                      {evidence.screenshots && evidence.screenshots.length > 0 && (
                        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                          {evidence.screenshots.map((file, index) => (
                            <div key={index} className="group relative">
                              <div className="flex aspect-square items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                                <FileImage className="h-6 w-6 text-gray-400" />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeScreenshot(index)}
                                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
                              >
                                <X className="h-3 w-3" />
                              </button>
                              <p className="mt-1 truncate text-xs text-gray-500">{file.name}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </form>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 border-t border-gray-200 p-6 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isPending}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="submitReportForm"
                  disabled={isPending || !selectedCategory || !description.trim()}
                  className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <div
                        className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                        aria-hidden="true"
                      />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Flag className="h-4 w-4" aria-hidden="true" />
                      Submit Report
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

export default ReportDialog
