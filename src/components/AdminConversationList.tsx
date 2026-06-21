'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Message } from '@/lib/types'

interface ConversationWithEmployee {
  id: string
  employee_id: string
  title: string
  message_count: number
  last_message_at: string
  is_archived: boolean
  is_flagged: boolean
  created_at: string
  kk_employees: { first_name: string; last_name: string; restaurant: string } | null
}

export default function AdminConversationList() {
  const [conversations, setConversations] = useState<ConversationWithEmployee[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [showArchived, setShowArchived] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const supabase = createClient()

  const loadConversations = useCallback(async () => {
    let query = supabase
      .from('kk_conversations')
      .select('*, kk_employees(first_name, last_name, restaurant)')
      .order('last_message_at', { ascending: false })
      .limit(50)

    if (!showArchived) {
      query = query.eq('is_archived', false)
    }

    const { data } = await query
    if (data) setConversations(data)
    setLoading(false)
  }, [showArchived, supabase])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  // Realtime: new messages trigger reload
  useEffect(() => {
    const channel = supabase
      .channel('admin-conversations')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'kk_conversations' },
        () => loadConversations()
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'kk_messages' },
        (payload) => {
          // If viewing this conversation, add message
          if (selectedId && payload.new && (payload.new as Message).conversation_id === selectedId) {
            setMessages((prev) => {
              const newMsg = payload.new as Message
              if (prev.some((m) => m.id === newMsg.id)) return prev
              return [...prev, newMsg]
            })
          }
          // Reload conversation list for updated counts
          loadConversations()
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [selectedId, supabase, loadConversations])

  async function selectConversation(id: string) {
    setSelectedId(id)
    const { data } = await supabase
      .from('kk_messages')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true })

    if (data) setMessages(data)
  }

  async function handleConversationAction(id: string, action: 'flag' | 'unflag' | 'archive' | 'unarchive') {
    setActionLoading(true)
    await fetch('/api/admin/conversations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action }),
    })
    await loadConversations()
    setActionLoading(false)
  }

  const selectedConv = conversations.find((c) => c.id === selectedId)

  if (loading) {
    return <div className="text-zinc-400 text-center py-12">Loading...</div>
  }

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowArchived(!showArchived)}
          className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
            showArchived ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          {showArchived ? 'Hide archived' : 'Show archived'}
        </button>
        <span className="text-xs text-zinc-500">{conversations.length} conversations</span>
      </div>

      <div className="flex h-[calc(100vh-14rem)] gap-4">
        {/* Conversation list */}
        <div className="w-80 shrink-0 overflow-y-auto border border-zinc-800 rounded-xl bg-zinc-900">
          {conversations.length === 0 ? (
            <p className="text-zinc-500 text-sm text-center py-8">No conversations</p>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => selectConversation(conv.id)}
                className={`w-full text-left p-3 border-b border-zinc-800/50 hover:bg-zinc-800 transition-colors ${
                  selectedId === conv.id ? 'bg-zinc-800' : ''
                } ${conv.is_archived ? 'opacity-50' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {conv.is_flagged && <span className="text-red-400 shrink-0">*</span>}
                    <p className="text-sm font-medium text-white truncate">
                      {conv.kk_employees
                        ? `${conv.kk_employees.first_name} ${conv.kk_employees.last_name}`
                        : 'Unknown'}
                    </p>
                  </div>
                  <span className="text-xs text-zinc-500 shrink-0 ml-2">
                    {conv.message_count} msg
                  </span>
                </div>
                <p className="text-xs text-zinc-400 truncate mt-0.5">{conv.title}</p>
                <p className="text-xs text-zinc-600 mt-0.5">
                  {new Date(conv.last_message_at).toLocaleDateString('en-CA')}
                </p>
              </button>
            ))
          )}
        </div>

        {/* Message view + actions */}
        <div className="flex-1 flex flex-col border border-zinc-800 rounded-xl bg-zinc-900 overflow-hidden">
          {/* Conversation actions bar */}
          {selectedConv && (
            <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/80">
              <p className="text-sm text-zinc-300">
                {selectedConv.kk_employees
                  ? `${selectedConv.kk_employees.first_name} ${selectedConv.kk_employees.last_name} - ${selectedConv.kk_employees.restaurant}`
                  : 'Conversation'}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleConversationAction(selectedConv.id, selectedConv.is_flagged ? 'unflag' : 'flag')}
                  disabled={actionLoading}
                  className={`text-xs px-3 py-1 rounded-lg transition-colors ${
                    selectedConv.is_flagged
                      ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
                      : 'text-zinc-400 hover:text-red-400 hover:bg-zinc-800'
                  }`}
                >
                  {selectedConv.is_flagged ? 'Remove flag' : 'Flag'}
                </button>
                <button
                  onClick={() => handleConversationAction(selectedConv.id, selectedConv.is_archived ? 'unarchive' : 'archive')}
                  disabled={actionLoading}
                  className="text-xs px-3 py-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  {selectedConv.is_archived ? 'Unarchive' : 'Archive'}
                </button>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            {!selectedId ? (
              <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
                Select a conversation
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
                No messages
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
                        msg.role === 'user'
                          ? 'bg-blue-600/20 text-blue-200 rounded-br-md'
                          : 'bg-zinc-800 text-zinc-200 rounded-bl-md'
                      }`}
                    >
                      <p className="text-xs text-zinc-500 mb-1">
                        {msg.role === 'user' ? 'Employee' : 'TeamChat AI'} -{' '}
                        {new Date(msg.created_at).toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
