'use client'

import { useState } from 'react'
import AdminStats from './AdminStats'
import AdminConversationList from './AdminConversationList'
import AdminEmailDrafts from './AdminEmailDrafts'
import AdminKnowledgeBase from './AdminKnowledgeBase'
import AdminEmployeeList from './AdminEmployeeList'

const tabs = [
  { id: 'stats', label: 'Overview' },
  { id: 'conversations', label: 'Conversations' },
  { id: 'emails', label: 'Emails' },
  { id: 'employees', label: 'Employees' },
  { id: 'knowledge', label: 'Knowledge Base' },
] as const

type TabId = typeof tabs[number]['id']

export default function AdminTabs() {
  const [activeTab, setActiveTab] = useState<TabId>('stats')

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-zinc-800 pb-0 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-zinc-800 text-white border-b-2 border-blue-500'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'stats' && <AdminStats />}
        {activeTab === 'conversations' && <AdminConversationList />}
        {activeTab === 'emails' && <AdminEmailDrafts />}
        {activeTab === 'employees' && <AdminEmployeeList />}
        {activeTab === 'knowledge' && <AdminKnowledgeBase />}
      </div>
    </div>
  )
}
