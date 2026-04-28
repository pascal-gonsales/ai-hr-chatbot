import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@anthropic-ai/sdk', () => ({
  default: class {
    messages = { create: vi.fn() }
  },
}))

const ENV: Record<string, string> = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-test',
  SUPABASE_SERVICE_ROLE_KEY: 'service-test',
  ANTHROPIC_API_KEY: 'sk-test',
}

describe('/api/chat ownership guard', () => {
  beforeEach(() => {
    for (const [k, v] of Object.entries(ENV)) process.env[k] = v
    vi.resetModules()
  })

  it('returns 403 when conversation_id belongs to another employee', async () => {
    const { createClient } = (await import('@supabase/supabase-js')) as unknown as {
      createClient: ReturnType<typeof vi.fn>
    }
    const { createClient: createServerClient } = (await import('@/lib/supabase/server')) as unknown as {
      createClient: ReturnType<typeof vi.fn>
    }

    // Authenticated user.
    createServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'auth-user-aaa' } },
          error: null,
        }),
      },
    })

    // Service-role client: employee A is the authenticated employee, but
    // the conversation row belongs to employee B.
    createClient.mockReturnValue({
      from: vi.fn((table: string) => {
        if (table === 'kk_employees') {
          return {
            select: () => ({
              eq: () => ({
                single: () =>
                  Promise.resolve({
                    data: {
                      id: 'employee-aaa',
                      auth_user_id: 'auth-user-aaa',
                      staff_id: null,
                      first_name: 'Alice',
                      last_name: 'A',
                      restaurant: 'Demo Thai',
                      preferred_language: 'en',
                    },
                    error: null,
                  }),
              }),
            }),
          }
        }
        if (table === 'kk_conversations') {
          return {
            select: () => ({
              eq: () => ({
                maybeSingle: () =>
                  Promise.resolve({
                    data: { id: 'conv-1', employee_id: 'employee-bbb' },
                    error: null,
                  }),
              }),
            }),
          }
        }
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: null, error: null }),
            }),
          }),
        }
      }),
    })

    const { POST } = await import('@/app/api/chat/route')

    const req = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        message: 'hello',
        conversation_id: '11111111-1111-1111-1111-111111111111',
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(403)
  })

  it('returns 400 when conversation_id is not a UUID', async () => {
    const { createClient } = (await import('@supabase/supabase-js')) as unknown as {
      createClient: ReturnType<typeof vi.fn>
    }
    const { createClient: createServerClient } = (await import('@/lib/supabase/server')) as unknown as {
      createClient: ReturnType<typeof vi.fn>
    }

    createServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'auth-user-aaa' } },
          error: null,
        }),
      },
    })

    createClient.mockReturnValue({
      from: vi.fn(() => ({
        select: () => ({
          eq: () => ({
            single: () =>
              Promise.resolve({
                data: {
                  id: 'employee-aaa',
                  auth_user_id: 'auth-user-aaa',
                  staff_id: null,
                  first_name: 'Alice',
                  last_name: 'A',
                  restaurant: 'Demo Thai',
                  preferred_language: 'en',
                },
                error: null,
              }),
          }),
        }),
      })),
    })

    const { POST } = await import('@/app/api/chat/route')

    const req = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        message: 'hi',
        conversation_id: 'not-a-uuid',
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})
