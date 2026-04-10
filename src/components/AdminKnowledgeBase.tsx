'use client'

import { useState, useEffect } from 'react'
import { KnowledgeBaseEntry } from '@/lib/types'

export default function AdminKnowledgeBase() {
  const [entries, setEntries] = useState<KnowledgeBaseEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<KnowledgeBaseEntry | null>(null)
  const [form, setForm] = useState({ category: 'general', title: '', content: '', restaurant: '', role: '' })

  useEffect(() => {
    loadEntries()
  }, [])

  async function loadEntries() {
    setLoading(true)
    const res = await fetch('/api/admin/knowledge-base')
    if (res.ok) setEntries(await res.json())
    setLoading(false)
  }

  function resetForm() {
    setForm({ category: 'general', title: '', content: '', restaurant: '', role: '' })
    setEditing(null)
    setShowForm(false)
  }

  function startEdit(entry: KnowledgeBaseEntry) {
    setForm({
      category: entry.category,
      title: entry.title,
      content: entry.content,
      restaurant: entry.restaurant || '',
      role: entry.role || '',
    })
    setEditing(entry)
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = {
      ...form,
      restaurant: form.restaurant || null,
      role: form.role || null,
    }

    if (editing) {
      await fetch('/api/admin/knowledge-base', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editing.id, ...payload }),
      })
    } else {
      await fetch('/api/admin/knowledge-base', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    }
    resetForm()
    loadEntries()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this entry?')) return
    await fetch(`/api/admin/knowledge-base?id=${id}`, { method: 'DELETE' })
    loadEntries()
  }

  async function toggleActive(entry: KnowledgeBaseEntry) {
    await fetch('/api/admin/knowledge-base', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: entry.id, is_active: !entry.is_active }),
    })
    loadEntries()
  }

  if (loading) return <div className="text-zinc-400 animate-pulse p-4">Loading...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">Knowledge Base ({entries.length})</h3>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          + Add
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
              >
                <option value="general">General</option>
                <option value="policy">Policy</option>
                <option value="procedure">Procedure</option>
                <option value="benefits">Benefits</option>
                <option value="safety">Safety</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Restaurant (optional)</label>
              <select
                value={form.restaurant}
                onChange={(e) => setForm({ ...form, restaurant: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
              >
                <option value="">All</option>
                <option value="lotus-kitchen">Lotus Kitchen</option>
                <option value="demo-thai">Demo Thai</option>
                <option value="garden-bistro">Garden Bistro</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
              placeholder="e.g. Leave Policy"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Content</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              required
              rows={5}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm resize-y"
              placeholder="Detailed policy or procedure content..."
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
              {editing ? 'Update' : 'Create'}
            </button>
            <button type="button" onClick={resetForm} className="px-4 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {entries.map((entry) => (
          <div key={entry.id} className={`bg-zinc-900 border rounded-xl p-4 ${entry.is_active ? 'border-zinc-800' : 'border-zinc-800/50 opacity-60'}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded">{entry.category}</span>
                  {entry.restaurant && <span className="text-xs text-zinc-500">{entry.restaurant}</span>}
                  {!entry.is_active && <span className="text-xs text-red-400">Inactive</span>}
                </div>
                <h4 className="text-sm font-medium text-white">{entry.title}</h4>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{entry.content}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => toggleActive(entry)}
                  className="p-1.5 text-zinc-500 hover:text-white transition-colors text-xs"
                  title={entry.is_active ? 'Deactivate' : 'Activate'}
                >
                  {entry.is_active ? 'Hide' : 'Show'}
                </button>
                <button
                  onClick={() => startEdit(entry)}
                  className="p-1.5 text-zinc-500 hover:text-white transition-colors text-xs"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors text-xs"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {entries.length === 0 && (
          <p className="text-center text-zinc-500 py-8">No entries in the knowledge base</p>
        )}
      </div>
    </div>
  )
}
