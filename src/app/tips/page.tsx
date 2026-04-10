import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Employee } from '@/lib/types'
import TipsDashboard from '@/components/TipsDashboard'
import { t } from '@/lib/i18n'

export default async function TipsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

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
          <p className="text-zinc-400">{t('error.no_employee_profile')}</p>
        </div>
      </div>
    )
  }

  return <TipsDashboard employee={employee as Employee} />
}
