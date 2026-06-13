import { createClient } from '@/lib/supabase/client'
import { AppError } from '@/lib/errors'
import type { ConnectionProfile } from '@/types/matching'

// ── Types ───────────────────────────────────────────────────────

export interface ChatMessage {
  id: string
  connectionId: string
  senderId: string
  receiverId: string
  content: string
  createdAt: string
  isRead: boolean
}

export interface ChatConversation {
  connectionId: string
  otherUser: ConnectionProfile
  lastMessage: ChatMessage | null
  unreadCount: number
  updatedAt: string
}

// ── Auth helper ────────────────────────────────────────────────

async function getAuthContext() {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.user) throw new AppError('User not authenticated', 401)
  return { supabase, userId: session.user.id }
}

// ── Conversations (derived from accepted connections) ──────────

export async function getChatConversations(): Promise<ChatConversation[]> {
  const { supabase, userId } = await getAuthContext()

  // Get accepted connections with profiles
  const { data: connections, error } = await supabase
    .from('connections')
    .select(
      `
      id,
      requester_id,
      recipient_id,
      created_at,
      updated_at,
      requester:profiles!requester_id(id, username, display_name, avatar_url, bio),
      recipient:profiles!recipient_id(id, username, display_name, avatar_url, bio)
    `
    )
    .eq('status', 'accepted')
    .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
    .order('updated_at', { ascending: false })

  if (error) throw new AppError('Failed to fetch conversations')

  const conversations: ChatConversation[] = []

  for (const conn of connections ?? []) {
    const isIncoming = conn.recipient_id === userId
    const profile = (isIncoming ? conn.requester : conn.recipient) as unknown as Record<
      string,
      unknown
    > | null

    if (!profile) continue

    const otherUser: ConnectionProfile = {
      id: profile.id as string,
      username: (profile.username as string) ?? null,
      displayName: (profile.display_name as string) ?? null,
      avatarUrl: (profile.avatar_url as string) ?? null,
      bio: (profile.bio as string) ?? null,
      homeCountry: null,
    }

    // Get last message for this connection
    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .eq('connection_id', conn.id)
      .order('created_at', { ascending: false })
      .limit(1)

    const lastMsg = messages?.[0] as Record<string, unknown> | undefined

    // Count unread messages
    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('connection_id', conn.id)
      .eq('receiver_id', userId)
      .eq('is_read', false)

    conversations.push({
      connectionId: conn.id,
      otherUser,
      lastMessage: lastMsg ? mapMessage(lastMsg) : null,
      unreadCount: count ?? 0,
      updatedAt: (conn.updated_at as string) ?? (conn.created_at as string),
    })
  }

  // Sort by last message time or connection time
  return conversations.sort((a, b) => {
    const aTime = a.lastMessage?.createdAt ?? a.updatedAt
    const bTime = b.lastMessage?.createdAt ?? b.updatedAt
    return new Date(bTime).getTime() - new Date(aTime).getTime()
  })
}

// ── Messages ───────────────────────────────────────────────────

export async function getMessages(
  connectionId: string,
  options?: { limit?: number; before?: string }
): Promise<ChatMessage[]> {
  const { supabase, userId } = await getAuthContext()

  let query = supabase
    .from('messages')
    .select('*')
    .eq('connection_id', connectionId)
    .order('created_at', { ascending: true })
    .limit(options?.limit ?? 50)

  if (options?.before) {
    query = query.lt('created_at', options.before)
  }

  const { data, error } = await query

  if (error) throw new AppError('Failed to fetch messages')

  // Mark unread messages as read
  await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('connection_id', connectionId)
    .eq('receiver_id', userId)
    .eq('is_read', false)

  return (data ?? []).map(mapMessage)
}

export async function sendMessage(connectionId: string, content: string): Promise<ChatMessage> {
  const { supabase, userId } = await getAuthContext()

  // Get the other user in this connection
  const { data: conn, error: connError } = await supabase
    .from('connections')
    .select('requester_id, recipient_id')
    .eq('id', connectionId)
    .single()

  if (connError || !conn) throw new AppError('Connection not found')

  const receiverId = conn.requester_id === userId ? conn.recipient_id : conn.requester_id

  const { data, error } = await supabase
    .from('messages')
    .insert({
      connection_id: connectionId,
      sender_id: userId,
      receiver_id: receiverId,
      content,
      is_read: false,
    })
    .select('*')
    .single()

  if (error) throw new AppError('Failed to send message')

  return mapMessage(data as Record<string, unknown>)
}

// ── Realtime Subscription ──────────────────────────────────────

export function subscribeToMessages(
  connectionId: string,
  onMessage: (message: ChatMessage) => void
): () => void {
  const supabase = createClient()

  const channel = supabase
    .channel(`messages:${connectionId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `connection_id=eq.${connectionId}`,
      },
      payload => {
        onMessage(mapMessage(payload.new as Record<string, unknown>))
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

export function subscribeToAllMessages(
  userId: string,
  onMessage: (message: ChatMessage) => void
): () => void {
  const supabase = createClient()

  const channel = supabase
    .channel('messages:all')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${userId}`,
      },
      payload => {
        onMessage(mapMessage(payload.new as Record<string, unknown>))
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

// ── Typing Indicators (Supabase Realtime Broadcast) ────────────

export interface TypingEvent {
  userId: string
  connectionId: string
  isTyping: boolean
}

const TYPING_DEBOUNCE_MS = 2500
const TYPING_CLEAR_MS = 5000

/**
 * Broadcast a typing indicator on a Supabase Realtime channel.
 * Uses ephemeral broadcast — no database writes, no persistence.
 */
export function sendTypingIndicator(connectionId: string, userId: string): void {
  const supabase = createClient()
  const channel = supabase.channel(`typing:${connectionId}`)
  channel.send({
    type: 'broadcast',
    event: 'typing',
    payload: { userId, connectionId, isTyping: true } satisfies TypingEvent,
  })
}

/**
 * Broadcast that typing has stopped.
 */
export function clearTypingIndicator(connectionId: string, userId: string): void {
  const supabase = createClient()
  const channel = supabase.channel(`typing:${connectionId}`)
  channel.send({
    type: 'broadcast',
    event: 'typing',
    payload: { userId, connectionId, isTyping: false } satisfies TypingEvent,
  })
}

/**
 * Subscribe to typing indicators for a connection.
 * Returns an unsubscribe function.
 */
export function subscribeToTypingIndicators(
  connectionId: string,
  currentUserId: string,
  onTypingChange: (event: TypingEvent) => void
): () => void {
  const supabase = createClient()

  const channel = supabase
    .channel(`typing:${connectionId}`)
    .on<TypingEvent>('broadcast', { event: 'typing' }, payload => {
      const event = payload.payload as TypingEvent
      // Ignore own typing events
      if (event.userId === currentUserId) return
      onTypingChange(event)
    })
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

// ── Typing debounce helper ────────────────────────────────────

/**
 * Creates a debounced typing sender. Returns functions to trigger
 * typing start and to force-clear the indicator (on send).
 *
 * - `trigger()` sends a typing signal, debounced to once per TYPING_DEBOUNCE_MS.
 * - `clear()` immediately sends a not-typing signal and resets the debounce timer.
 * - `stop()` cleans up timers (call on unmount).
 */
export function createTypingDebounce(
  connectionId: string,
  userId: string
): {
  trigger: () => void
  clear: () => void
  stop: () => void
} {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  let clearTimer: ReturnType<typeof setTimeout> | null = null

  function trigger(): void {
    if (!debounceTimer) {
      sendTypingIndicator(connectionId, userId)
    }
    // Reset debounce window
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      debounceTimer = null
    }, TYPING_DEBOUNCE_MS)

    // Auto-clear after inactivity
    if (clearTimer) clearTimeout(clearTimer)
    clearTimer = setTimeout(() => {
      clear()
    }, TYPING_CLEAR_MS)
  }

  function clear(): void {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }
    if (clearTimer) {
      clearTimeout(clearTimer)
      clearTimer = null
    }
    clearTypingIndicator(connectionId, userId)
  }

  function stop(): void {
    if (debounceTimer) clearTimeout(debounceTimer)
    if (clearTimer) clearTimeout(clearTimer)
    debounceTimer = null
    clearTimer = null
  }

  return { trigger, clear, stop }
}

// ── Mapper ─────────────────────────────────────────────────────

function mapMessage(row: Record<string, unknown>): ChatMessage {
  return {
    id: row.id as string,
    connectionId: row.connection_id as string,
    senderId: row.sender_id as string,
    receiverId: row.receiver_id as string,
    content: row.content as string,
    createdAt: row.created_at as string,
    isRead: (row.is_read as boolean) ?? false,
  }
}
