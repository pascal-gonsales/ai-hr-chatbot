import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function verifyAdmin() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: employee } = await supabaseAdmin
    .from('kk_employees')
    .select('id, role')
    .eq('auth_user_id', user.id)
    .single()

  if (!employee || employee.role !== 'admin') return null
  return employee
}

// GET - list access requests (optionally filter by status, default: pending first)
export async function GET(request: NextRequest) {
  const admin = await verifyAdmin()
  if (!admin) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

  const status = request.nextUrl.searchParams.get('status')

  let query = supabaseAdmin
    .from('kk_access_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })

  return Response.json(data)
}

// PATCH - approve, reject, or mark converted. Conversion to an actual
// employee record happens in the existing employees admin flow; this route
// only updates request status + notes.
export async function PATCH(request: NextRequest) {
  const admin = await verifyAdmin()
  if (!admin) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

  const { id, action, admin_notes, converted_employee_id } = await request.json()

  if (!id || !action) {
    return new Response(JSON.stringify({ error: 'id and action required' }), { status: 400 })
  }

  if (!['approve', 'reject', 'convert'].includes(action)) {
    return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 })
  }

  const updates: Record<string, unknown> = {
    reviewed_by: admin.id,
    reviewed_at: new Date().toISOString(),
  }

  if (action === 'approve') updates.status = 'approved'
  if (action === 'reject') updates.status = 'rejected'
  if (action === 'convert') {
    if (!converted_employee_id || typeof converted_employee_id !== 'string') {
      return new Response(
        JSON.stringify({ error: 'converted_employee_id is required for convert' }),
        { status: 400 }
      )
    }

    // Validate the target employee actually exists before linking. This keeps
    // the audit trail honest: a converted access request always points to a
    // real kk_employees row.
    const { data: targetEmployee, error: targetErr } = await supabaseAdmin
      .from('kk_employees')
      .select('id')
      .eq('id', converted_employee_id)
      .maybeSingle()

    if (targetErr || !targetEmployee) {
      return new Response(
        JSON.stringify({ error: 'converted_employee_id does not match an employee' }),
        { status: 400 }
      )
    }

    updates.status = 'converted'
    updates.converted_employee_id = converted_employee_id
  }
  if (admin_notes) updates.admin_notes = admin_notes

  const { data, error } = await supabaseAdmin
    .from('kk_access_requests')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[/api/admin/access-requests PATCH] update error:', error)
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 })
  }

  await supabaseAdmin.from('kk_actions_log').insert({
    employee_id: admin.id,
    action_type: `access_request_${action}`,
    details: {
      request_id: id,
      converted_employee_id: action === 'convert' ? converted_employee_id : undefined,
    },
  })

  return Response.json(data)
}
