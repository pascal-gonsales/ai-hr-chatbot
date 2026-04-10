'use client'

import { useState, useEffect } from 'react'

interface EmailDraftWithEmployee {
  id: string
  conversation_id: string
  employee_id: string
  subject: string
  body: string
  recipient: string
  status: 'pending' | 'approved' | 'rejected' | 'sent'
  admin_notes: string | null
  created_at: string
  updated_at: string
  kk_employees: { first_name: string; last_name: string; email: string } | null
}

export default function AdminEmailDrafts() {
  const [drafts, setDrafts] = useState<EmailDraftWithEmployee[]>([])
  const [filter, setFilter] = useState<string>('pending')
  const [selectedDraft, setSelectedDraft] = useState<EmailDraftWithEmployee | null>(null)
  const [editSubject, setEditSubject] = useState('')
  const [editBody, setEditBody] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    loadDrafts()
  }, [filter])

  async function loadDrafts() {
    setLoading(true)
    const url = filter ? `/api/admin/email-drafts?status=${filter}` : '/api/admin/email-drafts'
    const res = await fetch(url)
    if (res.ok) {
      const data = await res.json()
      setDrafts(data)
    }
    setLoading(false)
  }

  function selectDraft(draft: EmailDraftWithEmployee) {
    setSelectedDraft(draft)
    setEditSubject(draft.subject)
    setEditBody(draft.body)
    setAdminNotes(draft.admin_notes || '')
  }

  async function handleAction(action: 'approve' | 'reject' | 'edit') {
    if (!selectedDraft) return
    setActionLoading(true)

    const payload: Record<string, string> = {
      id: selectedDraft.id,
      action,
    }
    if (adminNotes) payload.admin_notes = adminNotes
    if (action === 'edit') {
      payload.subject = editSubject
      payload.body = editBody
    }

    const res = await fetch('/api/admin/email-drafts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      setSelectedDraft(null)
      loadDrafts()
    }
    setActionLoading(false)
  }

  const statusColors: Record<string, string> = {
    pending: 'text-yellow-400 bg-yellow-400/10',
    approved: 'text-green-400 bg-green-400/10',
    rejected: 'text-red-400 bg-red-400/10',
    sent: 'text-blue-400 bg-blue-400/10',
  }

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-2">
        {['pending', 'approved', 'rejected', 'sent', ''].map((s) => (
          <button
            key={s || 'all'}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === s
                ? 'bg-zinc-700 text-white'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            {s === '' ? 'All' : s === 'pending' ? 'Pending' : s === 'approved' ? 'Approved' : s === 'rejected' ? 'Rejected' : 'Sent'}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-zinc-400 text-center py-8">Loading...</p>
      ) : drafts.length === 0 ? (
        <div className="text-center py-12 text-zinc-500">
          <p className="text-lg">No {filter === 'pending' ? 'pending ' : ''}drafts</p>
          <p className="text-sm mt-1">Email drafts will appear here when the AI agent creates them.</p>
        </div>
      ) : (
        <div className="flex gap-4 h-[calc(100vh-16rem)]">
          {/* Draft list */}
          <div className="w-80 shrink-0 overflow-y-auto border border-zinc-800 rounded-xl bg-zinc-900">
            {drafts.map((draft) => (
              <button
                key={draft.id}
                onClick={() => selectDraft(draft)}
                className={`w-full text-left p-3 border-b border-zinc-800/50 hover:bg-zinc-800 transition-colors ${
                  selectedDraft?.id === draft.id ? 'bg-zinc-800' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-white truncate">{draft.subject}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[draft.status]}`}>
                    {draft.status}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  From: {draft.kk_employees ? `${draft.kk_employees.first_name} ${draft.kk_employees.last_name}` : 'Unknown'}
                </p>
                <p className="text-xs text-zinc-500">To: {draft.recipient}</p>
                <p className="text-xs text-zinc-600 mt-0.5">
                  {new Date(draft.created_at).toLocaleDateString('en-CA')}
                </p>
              </button>
            ))}
          </div>

          {/* Draft detail / edit */}
          <div className="flex-1 overflow-y-auto border border-zinc-800 rounded-xl bg-zinc-900 p-4">
            {!selectedDraft ? (
              <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
                Select a draft
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-zinc-500">Subject</label>
                  <input
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    disabled={selectedDraft.status !== 'pending'}
                    className="w-full mt-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-500">Recipient</label>
                  <p className="text-sm text-zinc-300 mt-1">{selectedDraft.recipient}</p>
                </div>
                <div>
                  <label className="text-xs text-zinc-500">Body</label>
                  <textarea
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    disabled={selectedDraft.status !== 'pending'}
                    rows={8}
                    className="w-full mt-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm resize-none disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-500">Admin notes</label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    disabled={selectedDraft.status !== 'pending'}
                    rows={2}
                    placeholder="Optional notes..."
                    className="w-full mt-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm resize-none placeholder-zinc-600 disabled:opacity-50"
                  />
                </div>

                {selectedDraft.status === 'pending' && (
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleAction('approve')}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction('reject')}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleAction('edit')}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"
                    >
                      Save changes
                    </button>
                  </div>
                )}

                {selectedDraft.admin_notes && selectedDraft.status !== 'pending' && (
                  <div className="bg-zinc-800 rounded-lg p-3">
                    <p className="text-xs text-zinc-500">Admin notes</p>
                    <p className="text-sm text-zinc-300 mt-1">{selectedDraft.admin_notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
