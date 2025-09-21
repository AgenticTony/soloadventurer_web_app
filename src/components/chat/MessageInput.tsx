// Message Input Component - Rich Text Input with Emoji Picker and Attachments
// Sprint 3: Chat Interface Components with Official Best Practices

'use client';

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Smile,
  Paperclip,
  Image,
  Mic,
  Camera,
  File,
  X,
  Play,
  Pause,
  Square,
  Volume2,
  MoreHorizontal,
  Hash,
  Bold,
  Italic,
  Link as LinkIcon,
  List,
  AlignLeft,
  Quote
} from 'lucide-react';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { useWebSocketContext } from '@/contexts/WebSocketContext';
import { useAuth } from '@/contexts/AuthContext';
import { clsx } from 'clsx';

/**
 * Interfaces based on official patterns
 * Following emoji-picker-react and rich text input best practices
 */
interface Attachment {
  id: string;
  file: File;
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  thumbnail?: string;
  uploadProgress?: number;
  error?: string;
}

interface Mention {
  id: string;
  name: string;
  avatar?: string;
  type: 'user' | 'channel';
}

interface MessageInputProps {
  /** Placeholder text */
  placeholder?: string;
  /** Current chat ID */
  chatId?: string;
  /** Callback when message is sent */
  onSendMessage?: (content: string, attachments: Attachment[], mentions: Mention[]) => void;
  /** Callback for typing indicators */
  onTyping?: (isTyping: boolean) => void;
  /** Available mentions (users/channels) */
  availableMentions?: Mention[];
  /** Maximum message length */
  maxLength?: number;
  /** Whether recording is supported */
  supportsRecording?: boolean;
  /** Whether file upload is supported */
  supportsFileUpload?: boolean;
  /** Maximum file size in bytes */
  maxFileSize?: number;
  /** Accepted file types */
  acceptedFileTypes?: string[];
  /** Disabled state */
  disabled?: boolean;
  /** Loading state */
  isLoading?: boolean;
}

/**
 * Rich Text Formatting Component
 * Provides basic rich text controls
 */
const RichTextControls: React.FC<{
  onFormat: (command: string, value?: string) => void;
  isActive: (command: string) => boolean;
}> = ({ onFormat, isActive }) => {
  const controls = [
    { command: 'bold', icon: Bold, title: 'Bold (Ctrl+B)' },
    { command: 'italic', icon: Italic, title: 'Italic (Ctrl+I)' },
    { command: 'insertUnorderedList', icon: List, title: 'Bullet List' },
    { command: 'blockquote', icon: Quote, title: 'Quote' },
  ];

  return (
    <div className="flex items-center gap-1 px-2 py-1 border-b border-border">
      {controls.map(({ command, icon: Icon, title }) => (
        <button
          key={command}
          type="button"
          onClick={() => onFormat(command)}
          className={clsx(
            'p-1 rounded hover:bg-muted transition-colors',
            isActive(command) ? 'bg-muted text-primary' : 'text-muted-foreground'
          )}
          title={title}
        >
          <Icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  );
};

/**
 * Mention Suggestions Component
 * Shows autocomplete for @mentions
 */
const MentionSuggestions: React.FC<{
  suggestions: Mention[];
  selectedIndex: number;
  onSelect: (mention: Mention) => void;
  position: { top: number; left: number };
}> = ({ suggestions, selectedIndex, onSelect, position }) => {
  if (suggestions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute z-50 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto"
      style={{ top: position.top, left: position.left }}
    >
      {suggestions.map((mention, index) => (
        <button
          key={mention.id}
          onClick={() => onSelect(mention)}
          className={clsx(
            'w-full px-3 py-2 text-left hover:bg-muted transition-colors flex items-center gap-2',
            index === selectedIndex && 'bg-muted'
          )}
        >
          {mention.type === 'user' ? (
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
              {mention.avatar ? (
                <img src={mention.avatar} alt={mention.name} className="w-6 h-6 rounded-full" />
              ) : (
                <span className="text-xs font-bold text-primary">@</span>
              )}
            </div>
          ) : (
            <Hash className="w-4 h-4 text-muted-foreground" />
          )}
          <span className="text-sm">{mention.name}</span>
        </button>
      ))}
    </motion.div>
  );
};

/**
 * File Preview Component
 * Shows preview of uploaded files
 */
const FilePreview: React.FC<{
  attachment: Attachment;
  onRemove: () => void;
}> = ({ attachment, onRemove }) => {
  const [audioPlaying, setAudioPlaying] = useState(false);

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const renderPreview = () => {
    switch (attachment.type) {
      case 'image':
        return (
          <div className="relative">
            <img
              src={attachment.url}
              alt={attachment.file.name}
              className="w-16 h-16 object-cover rounded"
            />
            {attachment.uploadProgress !== undefined && attachment.uploadProgress < 100 && (
              <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center">
                <div className="text-white text-xs">{attachment.uploadProgress}%</div>
              </div>
            )}
          </div>
        );

      case 'video':
        return (
          <div className="relative">
            <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
              <Play className="w-6 h-6 text-gray-600" />
            </div>
            {attachment.uploadProgress !== undefined && attachment.uploadProgress < 100 && (
              <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center">
                <div className="text-white text-xs">{attachment.uploadProgress}%</div>
              </div>
            )}
          </div>
        );

      case 'audio':
        return (
          <div className="flex items-center gap-2 p-2 bg-muted rounded">
            <button
              onClick={() => setAudioPlaying(!audioPlaying)}
              className="p-1 bg-primary text-primary-foreground rounded-full"
            >
              {audioPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <Volume2 className="w-4 h-4 text-muted-foreground" />
          </div>
        );

      default:
        return (
          <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
            <File className="w-6 h-6 text-muted-foreground" />
          </div>
        );
    }
  };

  return (
    <div className="relative group">
      <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
        {renderPreview()}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{attachment.file.name}</p>
          <p className="text-xs text-muted-foreground">{formatFileSize(attachment.file.size)}</p>
          {attachment.error && (
            <p className="text-xs text-red-500">{attachment.error}</p>
          )}
        </div>
      </div>
      <button
        onClick={onRemove}
        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};

/**
 * Voice Recording Component
 * Handles voice message recording
 */
const VoiceRecording: React.FC<{
  isRecording: boolean;
  duration: number;
  onStart: () => void;
  onStop: () => void;
  onCancel: () => void;
}> = ({ isRecording, duration, onStart, onStop, onCancel }) => {
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  if (!isRecording) {
    return (
      <button
        onClick={onStart}
        className="p-2 hover:bg-muted rounded-full transition-colors"
        title="Record voice message"
      >
        <Mic className="w-5 h-5 text-muted-foreground" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-full">
      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
      <span className="text-sm font-mono">{formatTime(duration)}</span>
      <button
        onClick={onCancel}
        className="p-1 hover:bg-red-100 rounded-full transition-colors"
        title="Cancel recording"
      >
        <X className="w-4 h-4 text-red-600" />
      </button>
      <button
        onClick={onStop}
        className="p-1 hover:bg-red-100 rounded-full transition-colors"
        title="Stop recording"
      >
        <Square className="w-4 h-4 text-red-600 fill-current" />
      </button>
    </div>
  );
};

/**
 * Main Message Input Component
 * Rich text input with emoji picker, file upload, and voice recording
 */
export const MessageInput: React.FC<MessageInputProps> = ({
  placeholder = 'Type a message...',
  chatId,
  onSendMessage,
  onTyping,
  availableMentions = [],
  maxLength = 4000,
  supportsRecording = true,
  supportsFileUpload = true,
  maxFileSize = 50 * 1024 * 1024, // 50MB
  acceptedFileTypes = ['image/*', 'video/*', 'audio/*', '.pdf', '.doc', '.docx', '.txt'],
  disabled = false,
  isLoading = false,
}) => {
  const { user } = useAuth();
  const { sendMessage } = useWebSocketContext();

  // State management
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showRichControls, setShowRichControls] = useState(false);
  const [mentionSuggestions, setMentionSuggestions] = useState<Mention[]>([]);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout>();
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, []);

  // Handle content change
  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setContent(value);
      adjustTextareaHeight();

      // Handle typing indicators
      if (!isTyping && value.length > 0) {
        setIsTyping(true);
        onTyping?.(true);
      }

      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        onTyping?.(false);
      }, 2000);

      // Handle mention detection
      const mentionMatch = value.match(/@(\w*)$/);
      if (mentionMatch) {
        const query = mentionMatch[1].toLowerCase();
        const filtered = availableMentions.filter(mention =>
          mention.name.toLowerCase().includes(query)
        ).slice(0, 5);
        setMentionSuggestions(filtered);
        setSelectedMentionIndex(0);

        // Calculate position for mention dropdown
        const textarea = textareaRef.current;
        if (textarea) {
          const { selectionStart } = textarea;
          // This is a simplified position calculation
          setMentionPosition({ top: -100, left: 0 });
        }
      } else {
        setMentionSuggestions([]);
      }
    }
  }, [maxLength, isTyping, onTyping, availableMentions, adjustTextareaHeight]);

  // Handle emoji selection
  const handleEmojiClick = useCallback((emojiData: EmojiClickData) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const { selectionStart, selectionEnd } = textarea;
      const newContent = content.slice(0, selectionStart) + emojiData.emoji + content.slice(selectionEnd);
      setContent(newContent);

      // Focus and set cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(selectionStart + emojiData.emoji.length, selectionStart + emojiData.emoji.length);
        adjustTextareaHeight();
      }, 0);
    }
    setShowEmojiPicker(false);
  }, [content, adjustTextareaHeight]);

  // Handle file selection
  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || !supportsFileUpload) return;

    Array.from(files).forEach((file) => {
      if (file.size > maxFileSize) {
        console.error(`File ${file.name} is too large`);
        return;
      }

      const id = Math.random().toString(36).substring(7);
      const url = URL.createObjectURL(file);
      const type = file.type.startsWith('image/') ? 'image' :
                   file.type.startsWith('video/') ? 'video' :
                   file.type.startsWith('audio/') ? 'audio' : 'document';

      const attachment: Attachment = {
        id,
        file,
        type,
        url,
        uploadProgress: 0,
      };

      setAttachments(prev => [...prev, attachment]);

      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
        }
        setAttachments(prev => prev.map(att =>
          att.id === id ? { ...att, uploadProgress: progress } : att
        ));
      }, 200);
    });
  }, [supportsFileUpload, maxFileSize]);

  // Handle message send
  const handleSend = useCallback(async () => {
    if ((!content.trim() && attachments.length === 0) || disabled || isLoading) return;

    // Clear typing indicator
    if (isTyping) {
      setIsTyping(false);
      onTyping?.(false);
    }

    // Send message
    try {
      await onSendMessage?.(content, attachments, mentions);

      // Clear input
      setContent('');
      setAttachments([]);
      setMentions([]);
      adjustTextareaHeight();

      // Focus textarea
      textareaRef.current?.focus();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [content, attachments, mentions, disabled, isLoading, isTyping, onSendMessage, onTyping, adjustTextareaHeight]);

  // Handle key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }

    // Handle mention navigation
    if (mentionSuggestions.length > 0) {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedMentionIndex(prev => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedMentionIndex(prev => Math.min(mentionSuggestions.length - 1, prev + 1));
      } else if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        const selectedMention = mentionSuggestions[selectedMentionIndex];
        if (selectedMention) {
          handleMentionSelect(selectedMention);
        }
      }
    }
  }, [handleSend, mentionSuggestions, selectedMentionIndex]);

  // Handle mention selection
  const handleMentionSelect = useCallback((mention: Mention) => {
    const mentionText = `@${mention.name} `;
    const newContent = content.replace(/@\w*$/, mentionText);
    setContent(newContent);
    setMentions(prev => [...prev, mention]);
    setMentionSuggestions([]);

    // Focus textarea
    setTimeout(() => {
      textareaRef.current?.focus();
      adjustTextareaHeight();
    }, 0);
  }, [content, adjustTextareaHeight]);

  // Handle voice recording
  const handleStartRecording = useCallback(async () => {
    if (!supportsRecording) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
      setRecordingDuration(0);

      // Start duration counter
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      // TODO: Implement actual recording logic
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  }, [supportsRecording]);

  const handleStopRecording = useCallback(() => {
    setIsRecording(false);
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
    // TODO: Process recorded audio and add as attachment
  }, []);

  const handleCancelRecording = useCallback(() => {
    setIsRecording(false);
    setRecordingDuration(0);
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
  }, []);

  // Format functions for rich text
  const handleFormat = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    textareaRef.current?.focus();
  }, []);

  const isFormatActive = useCallback((command: string) => {
    return document.queryCommandState(command);
  }, []);

  // Remove attachment
  const handleRemoveAttachment = useCallback((id: string) => {
    setAttachments(prev => {
      const attachment = prev.find(att => att.id === id);
      if (attachment) {
        URL.revokeObjectURL(attachment.url);
      }
      return prev.filter(att => att.id !== id);
    });
  }, []);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      attachments.forEach(attachment => {
        URL.revokeObjectURL(attachment.url);
      });
    };
  }, [attachments]);

  const canSend = useMemo(() => {
    return (content.trim() || attachments.length > 0) && !disabled && !isLoading;
  }, [content, attachments.length, disabled, isLoading]);

  return (
    <div className="border-t border-border bg-card p-4">
      {/* Attachments Preview */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3"
          >
            <div className="flex flex-wrap gap-2">
              {attachments.map((attachment) => (
                <FilePreview
                  key={attachment.id}
                  attachment={attachment}
                  onRemove={() => handleRemoveAttachment(attachment.id)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rich Text Controls */}
      <AnimatePresence>
        {showRichControls && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <RichTextControls onFormat={handleFormat} isActive={isFormatActive} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Input Area */}
      <div className="relative">
        {/* Voice Recording Overlay */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-card/95 backdrop-blur-sm flex items-center justify-center z-10"
            >
              <VoiceRecording
                isRecording={isRecording}
                duration={recordingDuration}
                onStart={handleStartRecording}
                onStop={handleStopRecording}
                onCancel={handleCancelRecording}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Container */}
        <div className="flex items-end gap-2">
          {/* Left Actions */}
          <div className="flex items-center gap-1">
            {/* File Upload */}
            {supportsFileUpload && (
              <>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled}
                  className="p-2 hover:bg-muted rounded-full transition-colors disabled:opacity-50"
                  title="Attach file"
                >
                  <Paperclip className="w-5 h-5 text-muted-foreground" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={acceptedFileTypes.join(',')}
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                />
              </>
            )}

            {/* Camera */}
            <button
              disabled={disabled}
              className="p-2 hover:bg-muted rounded-full transition-colors disabled:opacity-50"
              title="Take photo"
            >
              <Camera className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              onKeyDown={handleKeyPress}
              placeholder={placeholder}
              disabled={disabled}
              className="w-full min-h-[40px] max-h-[120px] px-3 py-2 bg-muted rounded-2xl border-0 resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            />

            {/* Character Count */}
            {content.length > maxLength * 0.8 && (
              <div className="absolute bottom-1 right-2 text-xs text-muted-foreground">
                {maxLength - content.length}
              </div>
            )}

            {/* Mention Suggestions */}
            <AnimatePresence>
              {mentionSuggestions.length > 0 && (
                <MentionSuggestions
                  suggestions={mentionSuggestions}
                  selectedIndex={selectedMentionIndex}
                  onSelect={handleMentionSelect}
                  position={mentionPosition}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1">
            {/* Rich Text Toggle */}
            <button
              onClick={() => setShowRichControls(!showRichControls)}
              disabled={disabled}
              className={clsx(
                'p-2 rounded-full transition-colors disabled:opacity-50',
                showRichControls ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'
              )}
              title="Rich text formatting"
            >
              <AlignLeft className="w-5 h-5" />
            </button>

            {/* Emoji Picker */}
            <div className="relative" ref={emojiPickerRef}>
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                disabled={disabled}
                className="p-2 hover:bg-muted rounded-full transition-colors disabled:opacity-50"
                title="Add emoji"
              >
                <Smile className="w-5 h-5 text-muted-foreground" />
              </button>

              <AnimatePresence>
                {showEmojiPicker && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute bottom-full right-0 mb-2 z-50"
                  >
                    <EmojiPicker
                      onEmojiClick={handleEmojiClick}
                      theme={Theme.AUTO}
                      lazyLoadEmojis
                      skinTonesDisabled
                      searchDisabled
                      previewConfig={{ showPreview: false }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Voice Recording */}
            {supportsRecording && !content && attachments.length === 0 && (
              <VoiceRecording
                isRecording={isRecording}
                duration={recordingDuration}
                onStart={handleStartRecording}
                onStop={handleStopRecording}
                onCancel={handleCancelRecording}
              />
            )}

            {/* Send Button */}
            {(content || attachments.length > 0) && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                onClick={handleSend}
                disabled={!canSend}
                className={clsx(
                  'p-2 rounded-full transition-all duration-200',
                  canSend
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                )}
                title="Send message"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;