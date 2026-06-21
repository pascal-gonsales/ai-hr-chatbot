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

  const { data, error } = await supabaseAdmin
    .from('kk_knowledge_base')
    .select('*')
    .order('category', { ascending: true })
    .order('title', { ascending: true })

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  return Response.json(data)
}

export async function POST(request: Request) {
  const admin = await verifyAdmin()
  if (!admin) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

  const body = await request.json()
  const { category, title, content, restaurant, role } = body

  if (!title || !content) {
    return new Response(JSON.stringify({ error: 'Title and content required' }), { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('kk_knowledge_base')
    .insert({
      category: category || 'general',
      title,
      content,
      restaurant: restaurant || null,
      role: role || null,
    })
    .select()
    .single()

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  return Response.json(data)
}

export async function PATCH(request: Request) {
  const admin = await verifyAdmin()
  if (!admin) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

  const body = await request.json()
  const { id, ...updates } = body

  if (!id) return new Response(JSON.stringify({ error: 'ID required' }), { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('kk_knowledge_base')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  return Response.json(data)
}

export async function DELETE(request: Request) {
  const admin = await verifyAdmin()
  if (!admin) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return new Response(JSON.stringify({ error: 'ID required' }), { status: 400 })

  const { error } = await supabaseAdmin
    .from('kk_knowledge_base')
    .delete()
    .eq('id', id)

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  return Response.json({ success: true })
}
