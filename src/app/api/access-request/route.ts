import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  const { email, name, message } = await request.json()

  if (!email || !name) {
    return new Response(JSON.stringify({ error: 'Email and name required' }), { status: 400 })
  }

  // Insert as an email draft visible in admin dashboard
  const { error } = await supabaseAdmin
    .from('kk_email_drafts')
    .insert({
      subject: `TeamChat AI Access Request - ${name}`,
      body: `New employee requesting access to TeamChat AI.\n\nName: ${name}\nEmail: ${email}\n${message ? `Message: ${message}` : ''}\n\nAction required: Create employee profile from the Employees tab in the admin dashboard.`,
      recipient: 'admin@demo-restaurants.com',
      urgency: 'normal',
    })

  if (error) {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 })
  }

  return Response.json({ success: true })
}
