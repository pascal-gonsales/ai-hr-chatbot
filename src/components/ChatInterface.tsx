'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Message, Employee, QuickAction } from '@/lib/types'
import ChatMessage from './ChatMessage'
import { ToolEvent } from './ChatMessage'
import ChatInput from './ChatInput'
import BottomNav from './BottomNav'
import QuickActions from './QuickActions'
import { t, Lang } from '@/lib/i18n'

interface ChatInterfaceProps {
  employee: Employee
  initialMessages: Message[]
  initialConversationId: string | null
  quickActions?: QuickAction[]
}

export default function ChatInterface({ employee, initialMessages, initialConversationId, quickActions = [] }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [conversationId, setConversationId] = useState<string | null>(initialConversationId)
  const [streamingContent, setStreamingContent] = useState('')
  const [streamingToolEvents, setStreamingToolEvents] = useState<ToolEvent[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [lang, setLang] = useState<Lang>(employee.preferred_language === 'en' ? 'en' : 'fr')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = useRef(createClient())

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingContent, streamingToolEvents, scrollToBottom])

  // Realtime subscription for new messages (from other tabs/devices)
  useEffect(() => {
    if (!conversationId) return

    const channel = supabase.current
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'kk_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message
          // Only add if we don't already have it (avoid duplicates from our own inserts)
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev
            return [...prev, newMsg]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.current.removeChannel(channel)
    }
  }, [conversationId])

  async function handleSend(text: string) {
    // Optimistic UI: add user message immediately
    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: conversationId || '',
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, tempUserMsg])
    setIsStreaming(true)
    setStreamingContent('')
    setStreamingToolEvents([])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversation_id: conversationId,
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Server error')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No stream')

      const decoder = new TextDecoder()
      let buffer = ''
      let accumulated = ''
      const toolEvents: ToolEvent[] = []

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const data = JSON.parse(line.slice(6))

            if (data.type === 'conversation_id') {
              setConversationId(data.id)
              // Update URL without reload
              window.history.replaceState(null, '', `/chat?c=${data.id}`)
            } else if (data.type === 'text') {
              accumulated += data.text
              setStreamingContent(accumulated)
            } else if (data.type === 'tool_use') {
              const event: ToolEvent = { type: 'tool_use', tool: data.tool }
              toolEvents.push(event)
              setStreamingToolEvents([...toolEvents])
            } else if (data.type === 'tool_result') {
              const event: ToolEvent = { type: 'tool_result', tool: data.tool, result: data.result }
              toolEvents.push(event)
              setStreamingToolEvents([...toolEvents])
            } else if (data.type === 'done') {
              // Add final assistant message with tool events
              const assistantMsg: Message & { toolEvents?: ToolEvent[] } = {
                id: `assistant-${Date.now()}`,
                conversation_id: conversationId || data.id || '',
                role: 'assistant',
                content: accumulated,
                created_at: new Date().toISOString(),
              }
              // Store tool events on the message for rendering
              if (toolEvents.length > 0) {
                assistantMsg.toolEvents = [...toolEvents]
              }
              setMessages((prev) => [...prev, assistantMsg])
              setStreamingContent('')
              setStreamingToolEvents([])
            } else if (data.type === 'error') {
              throw new Error(data.error)
            }
          } catch (e) {
            if (e instanceof SyntaxError) continue
            throw e
          }
        }
      }
    } catch (err) {
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        conversation_id: conversationId || '',
        role: 'assistant',
        content: `${t('chat.error_occurred', lang)}${err instanceof Error ? err.message : t('chat.unknown_error', lang)}`,
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsStreaming(false)
      setStreamingContent('')
      setStreamingToolEvents([])
    }
  }

  function handleLogout() {
    supabase.current.auth.signOut().then(() => {
      window.location.href = '/login'
    })
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-950">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800">
        <div>
          <h1 className="text-lg font-semibold text-white">TeamChat AI</h1>
          <p className="text-xs text-zinc-400">{employee.first_name} - {employee.restaurant}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
            className="px-2 py-1 text-xs font-medium text-zinc-400 hover:text-white border border-zinc-700 rounded-md transition-colors"
          >
            {lang === 'fr' ? 'EN' : 'FR'}
          </button>
          <button
            onClick={handleLogout}
            className="text-xs text-zinc-400 hover:text-white transition-colors"
          >
            {t('chat.logout', lang)}
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 && !isStreaming && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4 w-full max-w-md">
              <p className="text-zinc-400">
                {t('chat.greeting', lang).replace('{name}', employee.first_name)}
              </p>
              {quickActions.length > 0 ? (
                <QuickActions
                  actions={quickActions}
                  language={employee.preferred_language}
                  onAction={handleSend}
                />
              ) : (
                <p className="text-zinc-500 text-sm">
                  {t('chat.prompt', lang)}
                </p>
              )}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            lang={lang}
            toolEvents={(msg as Message & { toolEvents?: ToolEvent[] }).toolEvents}
          />
        ))}

        {/* Streaming message */}
        {isStreaming && (streamingContent || streamingToolEvents.length > 0) && (
          <ChatMessage
            message={{
              id: 'streaming',
              conversation_id: conversationId || '',
              role: 'assistant',
              content: streamingContent,
              created_at: new Date().toISOString(),
            }}
            lang={lang}
            isStreaming
            toolEvents={streamingToolEvents}
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={isStreaming} lang={lang} />

      {/* Bottom Navigation */}
      <BottomNav isAdmin={employee.role === 'admin'} lang={lang} />
    </div>
  )
}
