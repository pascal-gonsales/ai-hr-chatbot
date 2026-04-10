import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminTabs from '@/components/AdminTabs'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Check admin status
  const { data: employee } = await supabase
    .from('kk_employees')
    .select('role, first_name')
    .eq('auth_user_id', user.id)
    .single()

  if (!employee || employee.role !== 'admin') {
    redirect('/chat')
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <div>
          <h1 className="text-xl font-bold text-white">TeamChat AI - Admin</h1>
          <p className="text-sm text-zinc-400">Management Dashboard</p>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="/chat"
            className="text-sm text-zinc-400 hover:text-white border border-zinc-700 px-4 py-2 rounded-lg transition-colors"
          >
            My chat
          </a>
          <span className="text-sm text-zinc-500">{employee.first_name}</span>
        </div>
      </header>
      <main className="p-6">
        <AdminTabs />
      </main>
    </div>
  )
}
