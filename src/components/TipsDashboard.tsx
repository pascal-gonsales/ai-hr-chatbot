'use client'

import { useState, useEffect } from 'react'
import { Employee } from '@/lib/types'
import { t, Lang } from '@/lib/i18n'
import BottomNav from './BottomNav'

interface TipsSummary {
  total_owed?: number
  total_paid?: number
  balance?: number
  weeks_count?: number
  first_week?: string
  last_week?: string
  [key: string]: unknown
}

interface WeeklyTip {
  week_start: string
  week_end: string
  total: number
  mon: number
  tue: number
  wed: number
  thu: number
  fri: number
  sat: number
  sun: number
  restaurant?: string
  [key: string]: unknown
}

interface TipsData {
  employee_name: string
  summary: TipsSummary | null
  weekly: WeeklyTip[]
  error?: string
}

interface TipsDashboardProps {
  employee: Employee
}

export default function TipsDashboard({ employee }: TipsDashboardProps) {
  const [data, setData] = useState<TipsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lang, setLang] = useState<Lang>(employee.preferred_language === 'en' ? 'en' : 'fr')

  useEffect(() => {
    fetch('/api/tips')
      .then((r) => r.json())
      .then((d) => {
        if (d.error === 'no_staff_link') {
          setError(t('tips.no_staff_link', lang))
        } else if (d.error) {
          setError(d.error)
        } else {
          setData(d)
        }
      })
      .catch(() => setError(t('tips.loading_error', lang)))
      .finally(() => setLoading(false))
  }, [lang])

  function formatMoney(n: number) {
    return new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(n)
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString(lang === 'en' ? 'en-CA' : 'fr-CA', { month: 'short', day: 'numeric' })
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-zinc-400 animate-pulse">{t('tips.loading', lang)}</div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-64 px-4">
          <div className="text-center space-y-2">
            <p className="text-zinc-400">{error}</p>
          </div>
        </div>
      )
    }

    if (!data) return null

    const summary = data.summary
    const balance = summary?.balance ?? 0

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <p className="text-xs text-zinc-400 mb-1">{t('tips.total_owed', lang)}</p>
            <p className="text-lg font-bold text-white">{formatMoney(summary?.total_owed ?? 0)}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <p className="text-xs text-zinc-400 mb-1">{t('tips.total_paid', lang)}</p>
            <p className="text-lg font-bold text-emerald-400">{formatMoney(summary?.total_paid ?? 0)}</p>
          </div>
          <div className={`bg-zinc-900 border rounded-xl p-4 text-center ${balance > 0 ? 'border-amber-700' : 'border-zinc-800'}`}>
            <p className="text-xs text-zinc-400 mb-1">{t('tips.balance', lang)}</p>
            <p className={`text-lg font-bold ${balance > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {formatMoney(balance)}
            </p>
          </div>
        </div>

        {/* Weekly Detail */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800">
            <h3 className="text-sm font-medium text-white">{t('tips.weekly_detail', lang)}</h3>
          </div>
          {data.weekly.length === 0 ? (
            <div className="p-4 text-center text-zinc-500 text-sm">{t('tips.no_data', lang)}</div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {data.weekly.map((w, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm text-white">
                      {formatDate(w.week_start)} - {formatDate(w.week_end)}
                    </p>
                    <p className="text-xs text-zinc-500">{w.restaurant || ''}</p>
                  </div>
                  <p className="text-sm font-medium text-white">
                    {formatMoney(w.total ?? 0)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-950">
      <header className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800">
        <div>
          <h1 className="text-lg font-semibold text-white">{t('tips.title', lang)}</h1>
          <p className="text-xs text-zinc-400">{employee.first_name} - {employee.restaurant}</p>
        </div>
        <button
          onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
          className="px-2 py-1 text-xs font-medium text-zinc-400 hover:text-white border border-zinc-700 rounded-md transition-colors"
        >
          {lang === 'fr' ? 'EN' : 'FR'}
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {renderContent()}
      </div>

      <BottomNav isAdmin={employee.role === 'admin'} lang={lang} />
    </div>
  )
}
