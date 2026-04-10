'use client'

import { useState, useEffect } from 'react'
import { Employee } from '@/lib/types'

interface StaffMember {
  id: string
  name: string
  restaurant_id: string
}

interface StaffInfo {
  name: string
  restaurant_id: string
}

export default function AdminEmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [unlinkedStaff, setUnlinkedStaff] = useState<StaffMember[]>([])
  const [linkedStaff, setLinkedStaff] = useState<Record<string, StaffInfo>>({})
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState<'all' | 'linked' | 'unlinked'>('all')
  const [form, setForm] = useState({
    email: '',
    first_name: '',
    last_name: '',
    restaurant: 'Demo Thai',
    preferred_language: 'fr',
    role: 'employee',
    staff_id: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const res = await fetch('/api/admin/employees')
    if (res.ok) {
      const data = await res.json()
      setEmployees(data.employees || [])
      setUnlinkedStaff(data.unlinked_staff || [])
      setLinkedStaff(data.linked_staff || {})
    }
    setLoading(false)
  }

  function resetForm() {
    setForm({
      email: '',
      first_name: '',
      last_name: '',
      restaurant: 'Demo Thai',
      preferred_language: 'fr',
      role: 'employee',
      staff_id: '',
    })
    setShowForm(false)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/admin/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        staff_id: form.staff_id || null,
      }),
    })

    if (res.ok) {
      resetForm()
      loadData()
    } else {
      const err = await res.json()
      alert(`Error: ${err.error}`)
    }
    setSaving(false)
  }

  async function handleToggleActive(emp: Employee) {
    await fetch('/api/admin/employees', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: emp.id, is_active: !emp.is_active }),
    })
    loadData()
  }

  async function handleLinkStaff(empId: string, staffId: string) {
    await fetch('/api/admin/employees', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: empId, staff_id: staffId || null }),
    })
    loadData()
  }

  async function handleUnlinkStaff(empId: string) {
    await fetch('/api/admin/employees', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: empId, staff_id: null }),
    })
    loadData()
  }

  const filteredEmployees = employees.filter((emp) => {
    if (filter === 'linked') return emp.staff_id
    if (filter === 'unlinked') return !emp.staff_id
    return true
  })

  const linkedCount = employees.filter(e => e.staff_id).length
  const unlinkedCount = employees.filter(e => !e.staff_id).length

  if (loading) return <div className="text-zinc-400 animate-pulse p-4">Loading...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">
          Employees ({employees.filter((e) => e.is_active).length} active)
        </h3>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          + Add
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${filter === 'all' ? 'bg-zinc-700 text-white' : 'bg-zinc-800/50 text-zinc-400 hover:text-zinc-300'}`}
        >
          All ({employees.length})
        </button>
        <button
          onClick={() => setFilter('linked')}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${filter === 'linked' ? 'bg-emerald-700 text-white' : 'bg-zinc-800/50 text-zinc-400 hover:text-zinc-300'}`}
        >
          Linked ({linkedCount})
        </button>
        <button
          onClick={() => setFilter('unlinked')}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${filter === 'unlinked' ? 'bg-amber-700 text-white' : 'bg-zinc-800/50 text-zinc-400 hover:text-zinc-300'}`}
        >
          Unlinked ({unlinkedCount})
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">First name *</label>
              <input
                type="text"
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                required
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Last name *</label>
              <input
                type="text"
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                required
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
              placeholder="employee@email.com"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Restaurant</label>
              <select
                value={form.restaurant}
                onChange={(e) => setForm({ ...form, restaurant: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
              >
                <option value="Demo Thai">Demo Thai</option>
                <option value="Lotus Kitchen">Lotus Kitchen</option>
                <option value="Garden Bistro">Garden Bistro</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Language</label>
              <select
                value={form.preferred_language}
                onChange={(e) => setForm({ ...form, preferred_language: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
              >
                <option value="fr">Francais</option>
                <option value="en">English</option>
                <option value="th">Thai</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
              >
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Link to staff (tips/hours)</label>
            <select
              value={form.staff_id}
              onChange={(e) => setForm({ ...form, staff_id: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
            >
              <option value="">-- Not linked --</option>
              {unlinkedStaff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.restaurant_id})
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 text-white rounded-lg"
            >
              {saving ? 'Creating...' : 'Create employee'}
            </button>
            <button type="button" onClick={resetForm} className="px-4 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Employee List */}
      <div className="space-y-2">
        {filteredEmployees.map((emp) => {
          const staffInfo = emp.staff_id ? linkedStaff[emp.staff_id] : null
          const restaurantLabel: Record<string, string> = {
            'demo-thai': 'Demo Thai',
            'lotus-kitchen': 'Lotus Kitchen',
            'garden-bistro': 'Garden Bistro',
          }

          return (
            <div
              key={emp.id}
              className={`bg-zinc-900 border rounded-xl p-4 ${emp.is_active ? 'border-zinc-800' : 'border-zinc-800/50 opacity-60'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-medium text-white">
                      {emp.first_name} {emp.last_name}
                    </h4>
                    {emp.role === 'admin' && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-blue-600/20 text-blue-400 rounded">admin</span>
                    )}
                    {!emp.is_active && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-red-600/20 text-red-400 rounded">inactive</span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400">{emp.email}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-zinc-500">{emp.restaurant}</span>
                    <span className="text-xs text-zinc-500">{emp.preferred_language.toUpperCase()}</span>
                  </div>

                  {/* Staff link info */}
                  {staffInfo ? (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-900/30 border border-emerald-800/40 rounded-lg">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                        <span className="text-xs text-emerald-300">
                          {staffInfo.name}
                        </span>
                        <span className="text-[10px] text-emerald-400/60">
                          {restaurantLabel[staffInfo.restaurant_id] || staffInfo.restaurant_id}
                        </span>
                      </div>
                      <button
                        onClick={() => handleUnlinkStaff(emp.id)}
                        className="text-[10px] px-1.5 py-0.5 text-zinc-500 hover:text-red-400 transition-colors"
                        title="Unlink from staff"
                      >
                        Unlink
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-amber-400/70">Not linked to staff</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {/* Link staff dropdown */}
                  {!emp.staff_id && unlinkedStaff.length > 0 && (
                    <select
                      value=""
                      onChange={(e) => handleLinkStaff(emp.id, e.target.value)}
                      className="text-xs px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-zinc-300 max-w-[140px]"
                    >
                      <option value="">Link...</option>
                      {unlinkedStaff.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({restaurantLabel[s.restaurant_id] || s.restaurant_id})
                        </option>
                      ))}
                    </select>
                  )}
                  <button
                    onClick={() => handleToggleActive(emp)}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      emp.is_active
                        ? 'text-zinc-400 hover:text-red-400'
                        : 'text-zinc-500 hover:text-emerald-400'
                    }`}
                  >
                    {emp.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
