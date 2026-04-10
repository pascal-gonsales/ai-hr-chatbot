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

// PATCH - flag or archive a conversation
export async function PATCH(request: NextRequest) {
  const admin = await verifyAdmin()
  if (!admin) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

  const { id, action } = await request.json()

  if (!id || !action) {
    return new Response(JSON.stringify({ error: 'id and action required' }), { status: 400 })
  }

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  switch (action) {
    case 'flag':
      updates.is_flagged = true
      break
    case 'unflag':
      updates.is_flagged = false
      break
    case 'archive':
      updates.is_archived = true
      break
    case 'unarchive':
      updates.is_archived = false
      break
    default:
      return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('kk_conversations')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })

  await supabaseAdmin.from('kk_actions_log').insert({
    employee_id: admin.id,
    action_type: `conversation_${action}`,
    details: { conversation_id: id },
  })

  return Response.json(data)
}
