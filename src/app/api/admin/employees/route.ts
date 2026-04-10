import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

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

export async function GET() {
  const admin = await verifyAdmin()
  if (!admin) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

  // Get all employees
  const { data: employees, error } = await supabaseAdmin
    .from('kk_employees')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })

  // Get unlinked staff members (not yet linked to any kk_employee)
  const linkedStaffIds = (employees || [])
    .filter((e: { staff_id: string | null }) => e.staff_id)
    .map((e: { staff_id: string }) => e.staff_id)

  let unlinkedStaff: Array<{ id: string; name: string; restaurant_id: string }> = []
  if (linkedStaffIds.length > 0) {
    const { data } = await supabaseAdmin
      .from('staff')
      .select('id, name, restaurant_id')
      .eq('active', true)
      .not('id', 'in', `(${linkedStaffIds.join(',')})`)
      .order('name', { ascending: true })
    unlinkedStaff = data || []
  } else {
    const { data } = await supabaseAdmin
      .from('staff')
      .select('id, name, restaurant_id')
      .eq('active', true)
      .order('name', { ascending: true })
    unlinkedStaff = data || []
  }

  // Also fetch linked staff info so frontend can show names
  const linkedStaffMap: Record<string, { name: string; restaurant_id: string }> = {}
  if (linkedStaffIds.length > 0) {
    const { data: linkedData } = await supabaseAdmin
      .from('staff')
      .select('id, name, restaurant_id')
      .in('id', linkedStaffIds)
    for (const s of linkedData || []) {
      linkedStaffMap[s.id] = { name: s.name, restaurant_id: s.restaurant_id }
    }
  }

  return Response.json({ employees, unlinked_staff: unlinkedStaff, linked_staff: linkedStaffMap })
}

export async function POST(request: Request) {
  const admin = await verifyAdmin()
  if (!admin) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

  const body = await request.json()
  const { email, first_name, last_name, restaurant, preferred_language, role, staff_id } = body

  if (!email || !first_name || !last_name) {
    return new Response(JSON.stringify({ error: 'Email, first name and last name required' }), { status: 400 })
  }

  // 1. Create auth user (OTP-based)
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    email_confirm: true, // Auto-confirm so they can login immediately via OTP
  })

  if (authError) {
    // If user already exists in auth, try to find them
    if (authError.message.includes('already been registered') || authError.message.includes('already exists')) {
      const { data: { users } } = await supabaseAdmin.auth.admin.listUsers()
      const existing = users?.find((u: { email?: string }) => u.email === email)
      if (existing) {
        // Create kk_employee linked to existing auth user
        const { data: emp, error: empError } = await supabaseAdmin
          .from('kk_employees')
          .insert({
            auth_user_id: existing.id,
            email,
            first_name,
            last_name,
            restaurant: restaurant || 'Demo Thai',
            preferred_language: preferred_language || 'fr',
            role: role || 'employee',
            staff_id: staff_id || null,
          })
          .select()
          .single()

        if (empError) return new Response(JSON.stringify({ error: empError.message }), { status: 500 })
        return Response.json(emp)
      }
    }
    return new Response(JSON.stringify({ error: authError.message }), { status: 500 })
  }

  // 2. Create kk_employee record
  const { data: emp, error: empError } = await supabaseAdmin
    .from('kk_employees')
    .insert({
      auth_user_id: authUser.user.id,
      email,
      first_name,
      last_name,
      restaurant: restaurant || 'Demo Thai',
      preferred_language: preferred_language || 'fr',
      role: role || 'employee',
      staff_id: staff_id || null,
    })
    .select()
    .single()

  if (empError) {
    return new Response(JSON.stringify({ error: empError.message }), { status: 500 })
  }

  // Log action
  await supabaseAdmin.from('kk_actions_log').insert({
    employee_id: admin.id,
    action_type: 'employee_created',
    details: { new_employee_id: emp.id, email },
  })

  return Response.json(emp)
}

export async function PATCH(request: Request) {
  const admin = await verifyAdmin()
  if (!admin) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

  const body = await request.json()
  const { id, ...updates } = body

  if (!id) return new Response(JSON.stringify({ error: 'ID required' }), { status: 400 })

  // Only allow safe fields
  const safeFields: Record<string, unknown> = {}
  const allowedKeys = ['first_name', 'last_name', 'restaurant', 'preferred_language', 'role', 'staff_id', 'is_active']
  for (const key of allowedKeys) {
    if (key in updates) safeFields[key] = updates[key]
  }
  safeFields.updated_at = new Date().toISOString()

  const { data, error } = await supabaseAdmin
    .from('kk_employees')
    .update(safeFields)
    .eq('id', id)
    .select()
    .single()

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })

  await supabaseAdmin.from('kk_actions_log').insert({
    employee_id: admin.id,
    action_type: 'employee_updated',
    details: { target_employee_id: id, fields_updated: Object.keys(safeFields) },
  })

  return Response.json(data)
}
