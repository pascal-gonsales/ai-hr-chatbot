'use client'

import { Message } from '@/lib/types'
import { t, Lang } from '@/lib/i18n'

interface ChatMessageProps {
  message: Message
  lang: Lang
  isStreaming?: boolean
  toolEvents?: ToolEvent[]
}

export interface ToolEvent {
  type: 'tool_use' | 'tool_result'
  tool: string
  result?: Record<string, unknown>
}

export default function ChatMessage({ message, lang, isStreaming, toolEvents }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[85%] px-4 py-3 rounded-2xl ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-md'
            : 'bg-zinc-800 text-zinc-100 rounded-bl-md'
        }`}
      >
        {!isUser && (
          <p className="text-xs font-medium text-zinc-400 mb-1">{t('chat.bot_name', lang)}</p>
        )}

        {/* Tool events displayed before the text */}
        {toolEvents && toolEvents.length > 0 && (
          <div className="space-y-2 mb-2">
            {toolEvents.map((event, i) => (
              <ToolEventBadge key={i} event={event} lang={lang} />
            ))}
          </div>
        )}

        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
          {isStreaming && (
            <span className="inline-block w-1.5 h-4 bg-zinc-400 ml-0.5 animate-pulse" />
          )}
        </div>
      </div>
    </div>
  )
}

function ToolEventBadge({ event, lang }: { event: ToolEvent; lang: Lang }) {
  if (event.type === 'tool_use') {
    const labels: Record<string, string> = {
      get_employee_tips: t('chat.tool_tips', lang),
      get_employee_schedule: t('chat.tool_schedule', lang),
      draft_email_to_management: t('chat.tool_email', lang),
      search_knowledge_base: t('chat.tool_knowledge', lang),
    }
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-700/50 rounded-lg">
        <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
        <span className="text-xs text-zinc-300">{labels[event.tool] || event.tool}</span>
      </div>
    )
  }

  if (event.type === 'tool_result' && event.result) {
    // Email draft created
    if (event.tool === 'draft_email_to_management' && event.result.success) {
      return (
        <div className="px-3 py-2 bg-emerald-900/30 border border-emerald-800/50 rounded-lg space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-emerald-300">{t('chat.email_ready', lang)}</span>
          </div>
          <p className="text-[10px] text-emerald-400/70">{t('chat.email_instructions', lang)}</p>
        </div>
      )
    }

    // Tips summary
    if (event.tool === 'get_employee_tips' && event.result.summary) {
      const summary = event.result.summary as Record<string, number>
      const balance = summary.balance ?? 0
      return (
        <div className="px-3 py-2 bg-zinc-700/30 border border-zinc-700 rounded-lg space-y-1">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-xs font-medium text-zinc-300">{t('chat.tips_loaded', lang)}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[10px] text-zinc-500">{t('chat.tips_owed', lang)}</p>
              <p className="text-xs font-medium text-white">{formatMoney(summary.total_owed ?? 0)}</p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-500">{t('chat.tips_paid', lang)}</p>
              <p className="text-xs font-medium text-emerald-400">{formatMoney(summary.total_paid ?? 0)}</p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-500">{t('chat.tips_balance', lang)}</p>
              <p className={`text-xs font-medium ${balance > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {formatMoney(balance)}
              </p>
            </div>
          </div>
        </div>
      )
    }

    // KB search results
    if (event.tool === 'search_knowledge_base' && event.result.results) {
      const results = event.result.results as Array<{ title: string }>
      if (results.length > 0) {
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-700/30 border border-zinc-700 rounded-lg">
            <span className="text-xs text-zinc-300">{results.length} {t('chat.articles_found', lang)}</span>
          </div>
        )
      }
    }
  }

  return null
}

function formatMoney(n: number) {
  return new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(n)
}
