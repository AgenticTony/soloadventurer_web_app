import { renderHook, act } from '@testing-library/react'
import { useChatStore } from '@/store/chatStore'

describe('ChatStore', () => {
  beforeEach(() => {
    localStorage.clear()
    useChatStore.getState().reset()
  })

  it('should send message optimistically', async () => {
    const { result } = renderHook(() => useChatStore())

    await act(async () => {
      await result.current.sendMessage({
        conversationId: 'test-conv',
        content: { type: 'text', text: 'Hello' },
        senderId: 'user-1'
      })
    })

    // Check optimistic message added
    const messages = result.current.messages['test-conv']
    expect(messages).toBeDefined()
    expect(messages.length).toBeGreaterThan(0)
    expect(messages[0].status).toBe('sending')
  })

  it('should persist conversations to localStorage', () => {
    const { result } = renderHook(() => useChatStore())

    act(() => {
      result.current.setConversations([{
        id: '1',
        participants: ['user-1', 'user-2'],
        type: 'direct',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastMessage: undefined,
        unreadCount: 0
      }])
    })

    const stored = localStorage.getItem('chat-store')
    expect(stored).toBeTruthy()
    const parsed = JSON.parse(stored!)
    expect(parsed.state.conversations).toHaveLength(1)
  })

  it('should handle message status updates', () => {
    const { result } = renderHook(() => useChatStore())

    // Add a message first
    act(() => {
      const message = {
        id: 'msg-1',
        conversationId: 'conv-1',
        senderId: 'user-1',
        content: { type: 'text', text: 'Test' },
        status: 'sending' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      result.current.addMessage(message)
    })

    // Update status
    act(() => {
      result.current.updateMessageStatus('msg-1', 'sent')
    })

    const messages = result.current.messages['conv-1']
    expect(messages[0].status).toBe('sent')
  })
})