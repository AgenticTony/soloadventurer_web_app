// Block Dialog Component - User Blocking Interface
// Sprint 3: Following official React dialog patterns and form validation

'use client';

import React, { useState, useCallback, useActionState, useId, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, AlertTriangle, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/contexts/ToastContext';
import { clsx } from 'clsx';

/**
 * User interface for blocking operations
 */
interface BlockableUser {
  id: string;
  username: string;
  name: string;
  avatar?: string;
}

/**
 * BlockDialog component props following official dialog patterns
 */
export interface BlockDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Function to close the dialog */
  onClose: () => void;
  /** User to be blocked */
  user: BlockableUser;
  /** Callback when user is successfully blocked */
  onUserBlocked?: (userId: string) => void;
  /** Custom CSS classes */
  className?: string;
}

/**
 * Block reasons enum for structured options
 */
enum BlockReason {
  HARASSMENT = 'harassment',
  SPAM = 'spam',
  INAPPROPRIATE = 'inappropriate',
  PRIVACY = 'privacy',
  OTHER = 'other'
}

/**
 * Block user action following React 19 useActionState pattern
 * Official React.dev form action implementation
 */
async function blockUserAction(
  prevState: { error?: string; success?: boolean },
  formData: FormData
): Promise<{ error?: string; success?: boolean; userId?: string }> {
  try {
    const targetUserId = formData.get('targetUserId') as string;
    const reason = formData.get('reason') as string;
    const customReason = formData.get('customReason') as string;

    // OWASP allowlist validation
    const allowedReasons = Object.values(BlockReason);
    if (!allowedReasons.includes(reason as BlockReason) && reason !== 'other') {
      return { error: 'Invalid block reason selected' };
    }

    const finalReason = reason === 'other' ? customReason : reason;

    // OWASP input validation - allowlist approach
    if (finalReason && finalReason.length > 500) {
      return { error: 'Block reason must be 500 characters or less' };
    }

    if (reason === 'other') {
      if (!customReason || customReason.trim().length < 5) {
        return { error: 'Custom reason must be at least 5 characters' };
      }

      // OWASP security: allowlist validation for custom reason
      const allowedCharPattern = /^[a-zA-Z0-9\s.,!?'-]*$/;
      if (!allowedCharPattern.test(customReason)) {
        return { error: 'Custom reason contains invalid characters' };
      }
    }

    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return { error: 'You must be logged in to block a user.' };
    }

    const { error: insertError } = await supabase
      .from('blocked_users')
      .insert({
        blocker_id: session.user.id,
        blocked_id: targetUserId,
        reason: finalReason,
      });

    if (insertError) {
      if (insertError.code === '23505') {
        return { success: true, userId: targetUserId };
      }
      return { error: insertError.message || 'Failed to block user.' };
    }

    return { success: true, userId: targetUserId };
  } catch (error) {
    console.error('Block user action failed:', error);
    const message = error instanceof Error ? error.message : 'Failed to block user. Please try again.';
    return { error: message };
  }
}

/**
 * Block Dialog Component
 * Following official React 19 patterns with useActionState
 * Implements WAI-ARIA accessibility guidelines
 */
export const BlockDialog: React.FC<BlockDialogProps> = ({
  isOpen,
  onClose,
  user,
  onUserBlocked,
  className
}) => {
  const { showSuccess, showError } = useToast();

  // React 19 official pattern: useActionState for form handling
  const [state, formAction, isPending] = useActionState(blockUserAction, { error: undefined, success: false });

  // Controlled form state for UI
  const [selectedReason, setSelectedReason] = useState<BlockReason | ''>('');
  const [customReason, setCustomReason] = useState('');

  // WAI-ARIA accessibility IDs
  const dialogTitleId = useId();
  const dialogDescId = useId();
  const reasonFieldsetId = useId();
  const customReasonId = useId();
  const reasonGroupId = useId();
  const customReasonLabelId = useId();

  // Focus management refs
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);
  const lastFocusableRef = useRef<HTMLButtonElement>(null);

  // WAI-ARIA focus management - official W3C pattern
  useEffect(() => {
    if (isOpen && dialogRef.current) {
      // Focus first focusable element when dialog opens
      const focusableElements = dialogRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }

      // Trap focus within dialog
      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === focusableElements[0]) {
              e.preventDefault();
              (focusableElements[focusableElements.length - 1] as HTMLElement).focus();
            }
          } else {
            if (document.activeElement === focusableElements[focusableElements.length - 1]) {
              e.preventDefault();
              (focusableElements[0] as HTMLElement).focus();
            }
          }
        }
      };

      document.addEventListener('keydown', handleTabKey);
      return () => document.removeEventListener('keydown', handleTabKey);
    }
  }, [isOpen]);

  // Handle successful form submission
  useEffect(() => {
    if (state.success && state.userId) {
      showSuccess(
        'User Blocked',
        `${user.name} has been blocked. They won't be able to contact you or see your content.`
      );
      onUserBlocked?.(state.userId);

      // Reset form and close dialog
      setSelectedReason('');
      setCustomReason('');
      onClose();
    }
  }, [state.success, state.userId, showSuccess, user.name, onUserBlocked, onClose]);

  // Handle form errors
  useEffect(() => {
    if (state.error) {
      showError('Failed to Block User', state.error);
    }
  }, [state.error, showError]);

  /**
   * Get user-friendly reason labels
   */
  const reasonLabels = {
    [BlockReason.HARASSMENT]: 'Harassment or bullying',
    [BlockReason.SPAM]: 'Spam or unwanted content',
    [BlockReason.INAPPROPRIATE]: 'Inappropriate behavior',
    [BlockReason.PRIVACY]: 'Privacy concerns',
    [BlockReason.OTHER]: 'Other (please specify)'
  };

  /**
   * Handle dialog close with confirmation if form has data
   */
  const handleClose = useCallback(() => {
    if ((selectedReason || customReason) && !isPending) {
      const confirmClose = window.confirm(
        'Are you sure you want to cancel? Your changes will be lost.'
      );
      if (!confirmClose) return;
    }

    // Reset form state
    setSelectedReason('');
    setCustomReason('');
    onClose();
  }, [selectedReason, customReason, isPending, onClose]);

  /**
   * Handle reason selection
   */
  const handleReasonChange = useCallback((reason: BlockReason) => {
    setSelectedReason(reason);

    // Clear custom reason if not "Other"
    if (reason !== BlockReason.OTHER) {
      setCustomReason('');
    }
  }, []);

  /**
   * Handle custom reason input with OWASP allowlist validation
   */
  const handleCustomReasonChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;

    // OWASP allowlist validation in real-time
    const allowedCharPattern = /^[a-zA-Z0-9\s.,!?'-]*$/;
    if (value === '' || allowedCharPattern.test(value)) {
      setCustomReason(value);
    }
  }, []);

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
              ref={dialogRef}
              className={clsx(
                'relative w-full max-w-md bg-white dark:bg-gray-900 rounded-lg shadow-xl',
                'max-h-[90vh] overflow-hidden',
                className
              )}
              role="dialog"
              aria-modal="true"
              aria-labelledby={dialogTitleId}
              aria-describedby={dialogDescId}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                    <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h2 id={dialogTitleId} className="text-lg font-semibold text-gray-900 dark:text-white">
                      Block User
                    </h2>
                    <p id={dialogDescId} className="text-sm text-gray-600 dark:text-gray-400">
                      Block {user.name} from contacting you
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isPending}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  aria-label="Close block user dialog"
                  type="button"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {/* User info */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mb-6">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">@{user.username}</p>
                  </div>
                </div>

                {/* Warning */}
                <div className="flex gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg mb-6">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-800 dark:text-yellow-300 mb-1">
                      Before you block this user:
                    </p>
                    <ul className="text-yellow-700 dark:text-yellow-400 space-y-1 list-disc list-inside">
                      <li>They won&apos;t be able to message you or see your posts</li>
                      <li>You won&apos;t see their content or receive notifications from them</li>
                      <li>You can unblock them later from your privacy settings</li>
                    </ul>
                  </div>
                </div>

                {/* Form - React 19 useActionState pattern */}
                <form id="blockUserForm" action={formAction} className="space-y-4">
                  {/* Hidden inputs for form data */}
                  <input type="hidden" name="targetUserId" value={user.id} />
                  <input type="hidden" name="reason" value={selectedReason} />
                  <input type="hidden" name="customReason" value={customReason} />

                  {/* General error */}
                  {state.error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm text-red-700 dark:text-red-400">{state.error}</p>
                    </div>
                  )}

                  {/* Reason selection - WAI-ARIA fieldset pattern */}
                  <fieldset>
                    <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Why are you blocking this user? (Required)
                    </legend>
                    <div className="space-y-2" role="radiogroup" aria-labelledby={reasonFieldsetId} aria-required="true">
                      {Object.entries(reasonLabels).map(([value, label]) => (
                        <label
                          key={value}
                          className={clsx(
                            'flex items-center p-3 border rounded-lg cursor-pointer transition-colors',
                            selectedReason === value
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                          )}
                        >
                          <input
                            type="radio"
                            name="blockReason"
                            value={value}
                            checked={selectedReason === value}
                            onChange={() => handleReasonChange(value as BlockReason)}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            disabled={isPending}
                            aria-describedby={value === BlockReason.OTHER ? customReasonLabelId : undefined}
                            required
                          />
                          <span className="ml-3 text-sm text-gray-900 dark:text-white">{label}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  {/* Custom reason textarea */}
                  {selectedReason === BlockReason.OTHER && (
                    <div>
                      <label htmlFor={customReasonId} id={customReasonLabelId} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Please specify your reason (Required, 5-500 characters)
                      </label>
                      <textarea
                        id={customReasonId}
                        value={customReason}
                        onChange={handleCustomReasonChange}
                        placeholder="Describe why you want to block this user..."
                        className={clsx(
                          'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                          'resize-none h-24',
                          'border-gray-300 dark:border-gray-600',
                          'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                        )}
                        disabled={isPending}
                        maxLength={500}
                        minLength={5}
                        required
                        aria-labelledby={customReasonLabelId}
                        aria-describedby={`${customReasonId}-help`}
                        aria-invalid={customReason.length > 0 && customReason.length < 5}
                      />
                      <div className="flex justify-between mt-1">
                        <p id={`${customReasonId}-help`} className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                          {customReason.length}/500 characters
                        </p>
                      </div>
                    </div>
                  )}
                </form>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isPending}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="blockUserForm"
                  disabled={isPending || !selectedReason || (selectedReason === BlockReason.OTHER && !customReason.trim())}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  aria-describedby={isPending ? undefined : "block-user-action"}
                >
                  {isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                      Blocking...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" aria-hidden="true" />
                      Block User
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BlockDialog;