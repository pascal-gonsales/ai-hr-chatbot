'use client'

import { QuickAction } from '@/lib/types'

interface QuickActionsProps {
  actions: QuickAction[]
  language: string
  onAction: (prompt: string) => void
}

export default function QuickActions({ actions, language, onAction }: QuickActionsProps) {
  function getLabel(action: QuickAction): string {
    if (language === 'th' && action.label_th) return action.label_th
    if (language === 'en' && action.label_en) return action.label_en
    return action.label_fr
  }

  return (
    <div className="grid grid-cols-2 gap-2 mt-4 px-2">
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={() => onAction(action.prompt)}
          className="flex items-center gap-2 px-3 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-left hover:bg-zinc-800 hover:border-zinc-600 transition-colors"
        >
          <span className="text-lg shrink-0">{action.icon}</span>
          <span className="text-sm text-zinc-300 leading-tight">{getLabel(action)}</span>
        </button>
      ))}
    </div>
  )
}
