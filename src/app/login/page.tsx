'use client'

import { useState, useEffect } from 'react'
import LoginForm from '@/components/LoginForm'
import { t, Lang } from '@/lib/i18n'

export default function LoginPage() {
  const [lang, setLang] = useState<Lang>('fr')

  useEffect(() => {
    const stored = localStorage.getItem('teamchat-lang')
    if (stored === 'en') setLang('en')
  }, [])

  function toggleLang() {
    const newLang = lang === 'fr' ? 'en' : 'fr'
    setLang(newLang)
    localStorage.setItem('teamchat-lang', newLang)
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 relative">
      <button
        onClick={toggleLang}
        className="absolute top-4 right-4 px-2 py-1 text-xs font-medium text-zinc-400 hover:text-white border border-zinc-700 rounded-md transition-colors"
      >
        {lang === 'fr' ? 'EN' : 'FR'}
      </button>
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">{t('login.title', lang)}</h1>
          <p className="text-zinc-400 mt-2">{t('login.subtitle', lang)}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <LoginForm lang={lang} />
        </div>
        <p className="text-center text-zinc-500 text-xs">
          {t('login.agendrix_hint', lang)}
        </p>
      </div>
    </div>
  )
}
