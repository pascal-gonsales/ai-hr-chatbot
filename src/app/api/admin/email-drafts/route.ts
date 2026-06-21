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

// GET - list email drafts (optionally filter by status)
export async function GET(request: NextRequest) {
  const admin = await verifyAdmin()
  if (!admin) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

  const status = request.nextUrl.searchParams.get('status')

  let query = supabaseAdmin
    .from('kk_email_drafts')
    .select('*, kk_employees(first_name, last_name, email)')
    .order('created_at', { ascending: false })
    .limit(50)

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })

  return Response.json(data)
}

// PATCH - approve, reject, or edit a draft
export async function PATCH(request: NextRequest) {
  const admin = await verifyAdmin()
  if (!admin) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

  const { id, action, admin_notes, subject, body } = await request.json()

  if (!id || !action) {
    return new Response(JSON.stringify({ error: 'id and action required' }), { status: 400 })
  }

  if (!['approve', 'reject', 'edit'].includes(action)) {
    return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 })
  }

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (action === 'approve') {
    updates.status = 'approved'
    if (admin_notes) updates.admin_notes = admin_notes
  } else if (action === 'reject') {
    updates.status = 'rejected'
    if (admin_notes) updates.admin_notes = admin_notes
  } else if (action === 'edit') {
    if (subject) updates.subject = subject
    if (body) updates.body = body
    if (admin_notes) updates.admin_notes = admin_notes
  }

  const { data, error } = await supabaseAdmin
    .from('kk_email_drafts')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })

  // Log the action
  await supabaseAdmin.from('kk_actions_log').insert({
    employee_id: admin.id,
    action_type: `email_draft_${action}`,
    details: { draft_id: id },
  })

  return Response.json(data)
}
