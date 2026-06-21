import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/chat'

  // PKCE flow - exchange code for session
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    console.error('Auth code exchange error:', error.message)
  }

  // Implicit flow - verify token hash directly
  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'magiclink' | 'email',
    })
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    console.error('Auth token_hash verify error:', error.message)
  }

  // Auth error -> redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth`)
}
