import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ChatInterface from '@/components/ChatInterface'
import { Message, Employee, QuickAction } from '@/lib/types'
import { t } from '@/lib/i18n'

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Get employee record
  const { data: employee } = await supabase
    .from('kk_employees')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()

  if (!employee) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <h1 className="text-xl font-semibold text-white">{t('error.access_not_configured')}</h1>
          <p className="text-zinc-400">
            {t('error.no_employee_profile')}
          </p>
          <p className="text-zinc-500 text-sm">
            {t('error.contact_manager')}
          </p>
        </div>
      </div>
    )
  }

  const params = await searchParams
  const conversationId = params.c || null

  // Load existing messages if conversation exists
  let initialMessages: Message[] = []
  if (conversationId) {
    const { data: messages } = await supabase
      .from('kk_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (messages) initialMessages = messages
  }

  // Load quick actions
  const { data: quickActions } = await supabase
    .from('kk_quick_actions')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  return (
    <ChatInterface
      employee={employee as Employee}
      initialMessages={initialMessages}
      initialConversationId={conversationId}
      quickActions={(quickActions || []) as QuickAction[]}
    />
  )
}
