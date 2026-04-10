import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    // Get employee with staff_id
    const { data: employee } = await supabaseAdmin
      .from('kk_employees')
      .select('id, staff_id, first_name, last_name')
      .eq('auth_user_id', user.id)
      .single()

    if (!employee) {
      return new Response(JSON.stringify({ error: 'Employee not found' }), { status: 403 })
    }

    if (!employee.staff_id) {
      return Response.json({ error: 'no_staff_link', message: 'Account not linked to tips system' })
    }

    // tips_reconciliation_summary: employee_id = staff.id, columns: total_owed, total_paid, balance
    const { data: summary } = await supabaseAdmin
      .from('tips_reconciliation_summary')
      .select('*')
      .eq('employee_id', employee.staff_id)
      .single()

    // weekly_tips: employee_id = staff.id, columns: week_start, week_end, mon-sun, total
    const { data: weekly } = await supabaseAdmin
      .from('weekly_tips')
      .select('*')
      .eq('employee_id', employee.staff_id)
      .order('week_start', { ascending: false })
      .limit(12)

    return Response.json({
      staff_id: employee.staff_id,
      employee_name: `${employee.first_name} ${employee.last_name}`,
      summary: summary || null,
      weekly: weekly || [],
    })
  } catch {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 })
  }
}
