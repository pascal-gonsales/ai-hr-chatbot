import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}))

const ENV: Record<string, string> = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-test',
  SUPABASE_SERVICE_ROLE_KEY: 'service-test',
  PUBLIC_ACCESS_REQUEST_ENABLED: '1',
}

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/access-request', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('/api/access-request', () => {
  beforeEach(() => {
    for (const [k, v] of Object.entries(ENV)) process.env[k] = v
    vi.resetModules()
  })

  it('returns 503 when PUBLIC_ACCESS_REQUEST_ENABLED is not set', async () => {
    delete process.env.PUBLIC_ACCESS_REQUEST_ENABLED

    const { createClient } = (await import('@supabase/supabase-js')) as unknown as {
      createClient: ReturnType<typeof vi.fn>
    }
    createClient.mockReturnValue({ from: vi.fn(), rpc: vi.fn() })

    const { POST } = await import('@/app/api/access-request/route')

    const res = await POST(makeRequest({ email: 'a@b.co', name: 'A' }))
    expect(res.status).toBe(503)
  })

  it('returns 429 when email rate limit is exceeded', async () => {
    const { createClient } = (await import('@supabase/supabase-js')) as unknown as {
      createClient: ReturnType<typeof vi.fn>
    }

    const insert = vi.fn()
    createClient.mockReturnValue({
      from: vi.fn(() => ({ insert })),
      rpc: vi.fn().mockResolvedValue({
        data: {
          email_count_in_window: 5, // > MAX_PER_EMAIL_PER_HOUR (3)
          ip_count_in_window: 0,
          duplicate_email_24h: 0,
        },
        error: null,
      }),
    })

    const { POST } = await import('@/app/api/access-request/route')

    const res = await POST(makeRequest({ email: 'spammer@b.co', name: 'Spammer' }))
    expect(res.status).toBe(429)
    expect(insert).not.toHaveBeenCalled()
  })

  it('returns 400 on invalid email', async () => {
    const { createClient } = (await import('@supabase/supabase-js')) as unknown as {
      createClient: ReturnType<typeof vi.fn>
    }
    createClient.mockReturnValue({ from: vi.fn(), rpc: vi.fn() })

    const { POST } = await import('@/app/api/access-request/route')

    const res = await POST(makeRequest({ email: 'not-an-email', name: 'A' }))
    expect(res.status).toBe(400)
  })

  it('inserts and returns 200 when within limits', async () => {
    const { createClient } = (await import('@supabase/supabase-js')) as unknown as {
      createClient: ReturnType<typeof vi.fn>
    }

    const insert = vi.fn().mockResolvedValue({ data: null, error: null })
    createClient.mockReturnValue({
      from: vi.fn(() => ({ insert })),
      rpc: vi.fn().mockResolvedValue({
        data: {
          email_count_in_window: 0,
          ip_count_in_window: 0,
          duplicate_email_24h: 0,
        },
        error: null,
      }),
    })

    const { POST } = await import('@/app/api/access-request/route')

    const res = await POST(makeRequest({ email: 'new@b.co', name: 'New User' }))
    expect(res.status).toBe(200)
    expect(insert).toHaveBeenCalledTimes(1)
  })

  it('treats unique_violation (23505) as soft success', async () => {
    const { createClient } = (await import('@supabase/supabase-js')) as unknown as {
      createClient: ReturnType<typeof vi.fn>
    }

    const insert = vi.fn().mockResolvedValue({
      data: null,
      error: { code: '23505', message: 'duplicate' },
    })
    createClient.mockReturnValue({
      from: vi.fn(() => ({ insert })),
      rpc: vi.fn().mockResolvedValue({
        data: {
          email_count_in_window: 0,
          ip_count_in_window: 0,
          duplicate_email_24h: 0,
        },
        error: null,
      }),
    })

    const { POST } = await import('@/app/api/access-request/route')

    const res = await POST(makeRequest({ email: 'dup@b.co', name: 'Dup' }))
    expect(res.status).toBe(200)
  })
})
