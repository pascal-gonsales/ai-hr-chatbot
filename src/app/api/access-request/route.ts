import { createClient } from '@supabase/supabase-js'

// Service role: this endpoint is intentionally public (employees do not have
// accounts yet at this point in the flow). All abuse protection happens
// server-side here before any insert.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_NAME_LEN = 100
const MAX_EMAIL_LEN = 200
const MAX_MESSAGE_LEN = 1000

// Rate-limit thresholds for the public endpoint.
// Conservative defaults; tighten once we have telemetry.
const WINDOW_MINUTES = 60
const MAX_PER_EMAIL_PER_HOUR = 3
const MAX_PER_IP_PER_HOUR = 10

// Launch gate: this endpoint must remain disabled by default until the form
// is fronted by Turnstile/hCaptcha and edge rate limiting. Set the env var
// PUBLIC_ACCESS_REQUEST_ENABLED=1 to enable.
const PUBLIC_ENABLED = process.env.PUBLIC_ACCESS_REQUEST_ENABLED === '1'

function getClientIp(request: Request): string | null {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  return request.headers.get('x-real-ip') || null
}

function jsonError(status: number, message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function POST(request: Request) {
  if (!PUBLIC_ENABLED) {
    // Fail closed: do not accept submissions until CAPTCHA is in place.
    return jsonError(503, 'Access request form is not currently available.')
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return jsonError(400, 'Invalid JSON')
  }

  const { email, name, message } = (body || {}) as {
    email?: unknown
    name?: unknown
    message?: unknown
  }

  if (typeof email !== 'string' || typeof name !== 'string') {
    return jsonError(400, 'Email and name required')
  }

  const trimmedEmail = email.trim().toLowerCase()
  const trimmedName = name.trim()
  const trimmedMessage = typeof message === 'string' ? message.trim() : ''

  if (!trimmedEmail || !trimmedName) {
    return jsonError(400, 'Email and name required')
  }

  if (trimmedEmail.length > MAX_EMAIL_LEN || !EMAIL_PATTERN.test(trimmedEmail)) {
    return jsonError(400, 'Invalid email')
  }

  if (trimmedName.length > MAX_NAME_LEN) {
    return jsonError(400, 'Name too long')
  }

  if (trimmedMessage.length > MAX_MESSAGE_LEN) {
    return jsonError(400, 'Message too long')
  }

  const sourceIp = getClientIp(request)
  const userAgent = request.headers.get('user-agent')?.slice(0, 500) || null

  // First protective layer: ask the database how many recent requests this
  // email/IP have produced. Cheap and stateless; no Redis required.
  const { data: counts, error: countsErr } = await supabaseAdmin.rpc(
    'kk_access_request_recent_counts',
    {
      p_email: trimmedEmail,
      p_source_ip: sourceIp,
      p_window_minutes: WINDOW_MINUTES,
    }
  )

  if (countsErr) {
    // Fail closed on the rate-limit check rather than silently letting
    // unbounded requests through.
    return jsonError(500, 'Server error')
  }

  const c = (counts || {}) as {
    email_count_in_window?: number
    ip_count_in_window?: number
    duplicate_email_24h?: number
  }

  if ((c.email_count_in_window ?? 0) >= MAX_PER_EMAIL_PER_HOUR) {
    return jsonError(429, 'Too many requests for this email. Try again later.')
  }

  if ((c.ip_count_in_window ?? 0) >= MAX_PER_IP_PER_HOUR) {
    return jsonError(429, 'Too many requests. Try again later.')
  }

  // Atomic insert: a partial UNIQUE index on (lower(email)) where status =
  // 'pending' (migration 005) means duplicate pending requests collide at
  // the database level. The TOCTOU window is closed by ON CONFLICT.
  const { error: insertErr } = await supabaseAdmin
    .from('kk_access_requests')
    .insert(
      {
        email: trimmedEmail,
        name: trimmedName,
        message: trimmedMessage || null,
        source_ip: sourceIp,
        user_agent: userAgent,
      },
      { count: 'exact' }
    )

  // 23505 = unique_violation. Treat as a soft success so we do not leak
  // existence of a pending request for this email to a probing caller.
  if (insertErr && insertErr.code !== '23505') {
    return jsonError(500, 'Server error')
  }

  return Response.json({ success: true })
}
