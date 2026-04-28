'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { DEMO_QUICK_ACTIONS } from '@/lib/demo/fixtures'

interface DemoMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface DemoToolEvent {
  id: string
  tool: string
  result?: string
}

// Module-scope counter for stable, lint-friendly message IDs.
// Avoids react-hooks/purity false positives on Date.now() / Math.random().
let messageIdCounter = 0
function nextId(prefix: string): string {
  messageIdCounter += 1
  return `${prefix}-${messageIdCounter}`
}

export default function DemoChatInterface() {
  const [messages, setMessages] = useState<DemoMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hi Sarah — I'm your TeamChat AI agent. I can help with tips, schedules, time-off requests, policies, and drafting messages to management. What can I look up for you?",
    },
  ])
  const [input, setInput] = useState('')
  const [streamingContent, setStreamingContent] = useState('')
  const [streamingTools, setStreamingTools] = useState<DemoToolEvent[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingContent, streamingTools, scrollToBottom])

  async function handleSend(text: string) {
    if (!text.trim() || isStreaming) return

    const userMsg: DemoMessage = {
      id: nextId('u'),
      role: 'user',
      content: text,
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsStreaming(true)
    setStreamingContent('')
    setStreamingTools([])
    setError(null)

    const history = messages.map((m) => ({ role: m.role, content: m.content }))

    try {
      const response = await fetch('/api/demo/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Server error' }))
        throw new Error(err.error || 'Server error')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No stream')

      const decoder = new TextDecoder()
      let buffer = ''
      let accumulated = ''
      const tools: DemoToolEvent[] = []

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
            if (data.type === 'text') {
              accumulated += data.text
              setStreamingContent(accumulated)
            } else if (data.type === 'tool_use') {
              tools.push({ id: data.id, tool: data.tool })
              setStreamingTools([...tools])
            } else if (data.type === 'tool_result') {
              const t = tools.find((x) => x.tool === data.tool && !x.result)
              if (t) {
                t.result = typeof data.result === 'string' ? data.result : JSON.stringify(data.result)
                setStreamingTools([...tools])
              }
            } else if (data.type === 'error') {
              setError(data.error)
            }
          } catch {
            // ignore malformed lines
          }
        }
      }

      if (accumulated) {
        setMessages((prev) => [
          ...prev,
          { id: nextId('a'), role: 'assistant', content: accumulated },
        ])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsStreaming(false)
      setStreamingContent('')
      setStreamingTools([])
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/30 text-amber-200 text-xs px-4 py-2 text-center">
        🎭 Demo mode — Sarah Chen at fictional Le Bistro Demo. Read-only fixtures, no production data.{' '}
        <Link href="/demo" className="underline hover:text-amber-100">
          About this demo
        </Link>
      </div>

      {/* Header */}
      <div className="border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <div>
          <div className="font-semibold">TeamChat AI</div>
          <div className="text-xs text-zinc-500">Sarah Chen · Le Bistro Demo</div>
        </div>
        <a
          href="https://github.com/pascal-gonsales/ai-hr-chatbot"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-zinc-400 hover:text-zinc-200 underline"
        >
          GitHub
        </a>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-2xl w-full mx-auto">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-emerald-500 text-zinc-950 font-medium'
                  : 'bg-zinc-800 text-zinc-100'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Streaming tool events */}
        {streamingTools.length > 0 && (
          <div className="space-y-2">
            {streamingTools.map((t) => (
              <div
                key={t.id}
                className="text-xs text-zinc-400 bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-amber-400">⚙</span>
                  <span className="font-mono text-zinc-300">{t.tool}</span>
                  {!t.result && <span className="text-zinc-500">running…</span>}
                </div>
                {t.result && (
                  <pre className="text-zinc-400 whitespace-pre-wrap text-[11px] leading-snug font-mono">
                    {t.result.length > 400 ? t.result.slice(0, 400) + '…' : t.result}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Streaming text */}
        {streamingContent && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed bg-zinc-800 text-zinc-100 whitespace-pre-wrap">
              {streamingContent}
            </div>
          </div>
        )}

        {error && (
          <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick actions */}
      {messages.length <= 1 && !isStreaming && (
        <div className="px-4 py-3 max-w-2xl w-full mx-auto">
          <div className="text-xs text-zinc-500 mb-2">Try:</div>
          <div className="flex flex-wrap gap-2">
            {DEMO_QUICK_ACTIONS.map((qa) => (
              <button
                key={qa.id}
                onClick={() => handleSend(qa.prompt)}
                className="text-xs px-3 py-1.5 rounded-full border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800 text-zinc-300"
              >
                {qa.label_en}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-zinc-800 px-4 py-3 max-w-2xl w-full mx-auto">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend(input)
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about tips, schedule, policies…"
            disabled={isStreaming}
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600 disabled:opacity-60"
            maxLength={2000}
          />
          <button
            type="submit"
            disabled={isStreaming || !input.trim()}
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isStreaming ? '…' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  )
}
