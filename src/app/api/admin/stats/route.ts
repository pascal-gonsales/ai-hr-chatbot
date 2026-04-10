import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  // Auth check
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

  const { data: employee } = await supabaseAdmin
    .from('kk_employees')
    .select('role')
    .eq('auth_user_id', user.id)
    .single()

  if (!employee || employee.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayISO = today.toISOString()

  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weekAgoISO = weekAgo.toISOString()

  // Run all queries in parallel
  const [
    totalConvs,
    totalMsgs,
    activeEmployees,
    msgsToday,
    msgsWeek,
    pendingDrafts,
    flaggedConvs,
    recentConvs,
  ] = await Promise.all([
    supabaseAdmin.from('kk_conversations').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('kk_messages').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('kk_employees').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabaseAdmin.from('kk_messages').select('id', { count: 'exact', head: true }).gte('created_at', todayISO),
    supabaseAdmin.from('kk_messages').select('id', { count: 'exact', head: true }).gte('created_at', weekAgoISO),
    supabaseAdmin.from('kk_email_drafts').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabaseAdmin.from('kk_conversations').select('id', { count: 'exact', head: true }).eq('is_flagged', true),
    supabaseAdmin
      .from('kk_conversations')
      .select('id, title, message_count, last_message_at, is_flagged, kk_employees(first_name, last_name)')
      .order('last_message_at', { ascending: false })
      .limit(5),
  ])

  return Response.json({
    total_conversations: totalConvs.count || 0,
    total_messages: totalMsgs.count || 0,
    active_employees: activeEmployees.count || 0,
    messages_today: msgsToday.count || 0,
    messages_this_week: msgsWeek.count || 0,
    pending_email_drafts: pendingDrafts.count || 0,
    flagged_conversations: flaggedConvs.count || 0,
    recent_conversations: recentConvs.data || [],
  })
}
