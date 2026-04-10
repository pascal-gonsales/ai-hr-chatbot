'use client'

import { useState, useEffect } from 'react'

interface Stats {
  total_conversations: number
  total_messages: number
  active_employees: number
  messages_today: number
  messages_this_week: number
  pending_email_drafts: number
  flagged_conversations: number
  recent_conversations: {
    id: string
    title: string
    message_count: number
    last_message_at: string
    is_flagged: boolean
    kk_employees: { first_name: string; last_name: string } | null
  }[]
}

export default function AdminStats() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((data) => { setStats(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="text-zinc-400 text-center py-8">Loading stats...</div>
  }

  if (!stats) {
    return <div className="text-red-400 text-center py-8">Loading error</div>
  }

  const cards = [
    { label: 'Conversations', value: stats.total_conversations, color: 'text-blue-400' },
    { label: 'Total messages', value: stats.total_messages, color: 'text-green-400' },
    { label: 'Active employees', value: stats.active_employees, color: 'text-purple-400' },
    { label: 'Messages today', value: stats.messages_today, color: 'text-yellow-400' },
    { label: 'Messages (7 days)', value: stats.messages_this_week, color: 'text-cyan-400' },
    { label: 'Pending emails', value: stats.pending_email_drafts, color: stats.pending_email_drafts > 0 ? 'text-orange-400' : 'text-zinc-400' },
    { label: 'Flagged conversations', value: stats.flagged_conversations, color: stats.flagged_conversations > 0 ? 'text-red-400' : 'text-zinc-400' },
  ]

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map((card) => (
          <div key={card.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-xs text-zinc-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Recent conversations */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl">
        <div className="p-4 border-b border-zinc-800">
          <h3 className="text-sm font-medium text-zinc-300">Recent conversations</h3>
        </div>
        {stats.recent_conversations.length === 0 ? (
          <p className="text-zinc-500 text-sm text-center py-6">No conversations</p>
        ) : (
          <div className="divide-y divide-zinc-800/50">
            {stats.recent_conversations.map((conv) => (
              <div key={conv.id} className="px-4 py-3 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {conv.is_flagged && <span className="text-red-400 text-xs">*</span>}
                    <p className="text-sm text-white truncate">
                      {conv.kk_employees
                        ? `${conv.kk_employees.first_name} ${conv.kk_employees.last_name}`
                        : 'Unknown'}
                    </p>
                  </div>
                  <p className="text-xs text-zinc-500 truncate">{conv.title}</p>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-xs text-zinc-400">{conv.message_count} msg</p>
                  <p className="text-xs text-zinc-600">
                    {new Date(conv.last_message_at).toLocaleDateString('en-CA')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
