import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  // Exclude /demo (public portfolio demo, no auth) and /api/demo (its API surface)
  // from the auth middleware. Anchored to path-segment boundaries so future paths
  // like /demo-admin or /api/demo-metrics still go through middleware.
  // Production auth, chat, and admin paths are unchanged.
  matcher: [
    '/((?!demo(?:/|$)|api/demo(?:/|$)|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
