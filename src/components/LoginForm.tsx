'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { t, Lang } from '@/lib/i18n'

interface LoginFormProps {
  lang: Lang
}

export default function LoginForm({ lang }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'email' | 'code' | 'request'>('email')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [requestName, setRequestName] = useState('')
  const [requestMessage, setRequestMessage] = useState('')
  const [requestSent, setRequestSent] = useState(false)
  const codeInputRef = useRef<HTMLInputElement>(null)

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      },
    })

    setLoading(false)

    if (error) {
      if (error.message.includes('Signups not allowed')) {
        setError(t('login.email_not_registered', lang))
      } else if (error.message.toLowerCase().includes('rate limit')) {
        setError(t('login.rate_limit', lang))
      } else {
        setError(error.message)
      }
    } else {
      setStep('code')
      setTimeout(() => codeInputRef.current?.focus(), 100)
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    })

    setLoading(false)

    if (error) {
      setError(t('login.invalid_code', lang))
    } else {
      window.location.href = '/chat'
    }
  }

  async function handleAccessRequest(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/access-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        name: requestName,
        message: requestMessage,
      }),
    })

    setLoading(false)

    if (res.ok) {
      setRequestSent(true)
    } else {
      setError(t('login.request_error', lang))
    }
  }

  // Step: Access request form
  if (step === 'request') {
    if (requestSent) {
      return (
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 bg-emerald-600/20 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-white font-medium">{t('login.request_sent_title', lang)}</h3>
          <p className="text-sm text-zinc-400">
            {t('login.request_sent_message', lang)}
          </p>
          <button
            type="button"
            onClick={() => { setStep('email'); setRequestSent(false); setRequestName(''); setRequestMessage('') }}
            className="text-sm text-zinc-400 hover:text-white underline"
          >
            {t('login.back_to_login', lang)}
          </button>
        </div>
      )
    }

    return (
      <form onSubmit={handleAccessRequest} className="space-y-4">
        <div className="text-center space-y-1">
          <h3 className="text-white font-medium">{t('login.request_access_title', lang)}</h3>
          <p className="text-xs text-zinc-400">{t('login.request_access_subtitle', lang)}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">{t('login.email', lang)}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t('login.email_placeholder', lang)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">{t('login.your_name', lang)}</label>
          <input
            type="text"
            value={requestName}
            onChange={(e) => setRequestName(e.target.value)}
            required
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t('login.name_placeholder', lang)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">{t('login.message_optional', lang)}</label>
          <textarea
            value={requestMessage}
            onChange={(e) => setRequestMessage(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder={t('login.message_placeholder', lang)}
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading || !email || !requestName}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-medium rounded-lg transition-colors"
        >
          {loading ? t('login.sending_request', lang) : t('login.send_request', lang)}
        </button>

        <button
          type="button"
          onClick={() => { setStep('email'); setError('') }}
          className="w-full text-sm text-zinc-400 hover:text-white underline"
        >
          {t('login.back_to_login', lang)}
        </button>
      </form>
    )
  }

  // Step: Code verification
  if (step === 'code') {
    return (
      <form onSubmit={handleVerifyCode} className="space-y-6">
        <div className="text-center space-y-2">
          <p className="text-sm text-zinc-400">
            {t('login.code_sent_to', lang)} <span className="text-white font-medium">{email}</span>
          </p>
        </div>

        <div>
          <label htmlFor="code" className="block text-sm font-medium text-zinc-300 mb-2">
            {t('login.connection_code', lang)}
          </label>
          <input
            ref={codeInputRef}
            id="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            required
            className="w-full px-4 py-4 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-center text-2xl tracking-[0.5em] font-mono placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || code.length < 6}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-medium rounded-lg transition-colors"
        >
          {loading ? t('login.verifying', lang) : t('login.sign_in', lang)}
        </button>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => { setStep('email'); setCode(''); setError('') }}
            className="text-sm text-zinc-400 hover:text-white underline"
          >
            {t('login.change_email', lang)}
          </button>
          <button
            type="button"
            onClick={(e) => { setCode(''); setError(''); handleSendCode(e as unknown as React.FormEvent) }}
            className="text-sm text-zinc-400 hover:text-white underline"
          >
            {t('login.resend_code', lang)}
          </button>
        </div>
      </form>
    )
  }

  // Step: Email entry
  return (
    <form onSubmit={handleSendCode} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
          {t('login.email_label', lang)}
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('login.email_placeholder', lang)}
          required
          className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {error && (
        <div className="space-y-3">
          <p className="text-red-400 text-sm">{error}</p>
          <p className="text-zinc-400 text-xs leading-relaxed">
            {t('login.email_not_registered_help', lang)}
          </p>
          <button
            type="button"
            onClick={() => { setStep('request'); setError('') }}
            className="w-full py-2 px-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-sm rounded-lg transition-colors"
          >
            {t('login.request_access', lang)}
          </button>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !email}
        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-medium rounded-lg transition-colors"
      >
        {loading ? t('login.sending', lang) : t('login.send_code', lang)}
      </button>

      <div className="text-center">
        <a
          href="mailto:admin@demo-restaurants.com"
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          {t('login.no_access_yet', lang)}
        </a>
      </div>
    </form>
  )
}
