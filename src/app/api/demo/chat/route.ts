// Demo chat route. Public, no authentication.
// Mirrors the production chat tool-use loop but:
// - No DB reads, no DB writes, no Supabase
// - Uses Sarah Chen fixture employee (src/lib/demo/fixtures.ts)
// - Read-only tool handlers (src/lib/demo/tool-handlers.ts)
// - Write tool returns informative stubs (no email drafted to DB)
//
// This route is INTENTIONALLY separate from src/app/api/chat/route.ts so
// the production auth/RLS path remains untouched. Per Codex review #02
// scope, no modification of the production chat-route or auth surface.

import Anthropic from '@anthropic-ai/sdk'
import { buildSystemPrompt } from '@/lib/system-prompt'
import { chatTools } from '@/lib/tools'
import { handleDemoToolCall } from '@/lib/demo/tool-handlers'
import { DEMO_EMPLOYEE } from '@/lib/demo/fixtures'

// Light per-IP rate limit. The demo is public so we cap requests-per-IP
// to keep API cost bounded. Implementation is in-memory (per-instance);
// not bullet-proof against rotating IPs but sufficient for a portfolio demo.
const RATE_LIMIT_WINDOW_MS = 60_000 // 1 minute
const RATE_LIMIT_MAX = 8 // 8 messages per minute per IP
const ipBuckets = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const bucket = ipBuckets.get(ip)
  if (!bucket || bucket.resetAt < now) {
    ipBuckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return true
  }
  if (bucket.count >= RATE_LIMIT_MAX) return false
  bucket.count++
  return true
}

export async function POST(request: Request) {
  // Per-IP rate limit to bound public API cost
  const ip =
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'

  if (!checkRateLimit(ip)) {
    return new Response(
      JSON.stringify({ error: 'Demo rate limit reached. Try again in a minute.' }),
      { status: 429 }
    )
  }

  // Anthropic key is required at runtime (set in Vercel env)
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'Demo unavailable: missing API configuration.' }),
      { status: 503 }
    )
  }

  const anthropic = new Anthropic({ apiKey })

  let body: { message?: string; history?: Array<{ role: 'user' | 'assistant'; content: string }> }
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 })
  }

  const { message, history = [] } = body
  if (!message || typeof message !== 'string' || message.length > 2000) {
    return new Response(JSON.stringify({ error: 'Message required (max 2000 chars)' }), {
      status: 400,
    })
  }

  // Build system prompt for fixture employee (Sarah Chen at Le Bistro Demo)
  const systemPrompt =
    buildSystemPrompt({
      firstName: DEMO_EMPLOYEE.first_name,
      lastName: DEMO_EMPLOYEE.last_name,
      restaurant: DEMO_EMPLOYEE.restaurant,
      language: DEMO_EMPLOYEE.preferred_language,
      staffId: DEMO_EMPLOYEE.staff_id,
    }) +
    '\n\n---\nDEMO MODE: This is a public read-only demo. No real data is being accessed. The employee, restaurant, tips, schedule, and KB entries are fixtures for portfolio demonstration. Email drafts are not actually saved or sent.'

  const initialMessages: Anthropic.MessageParam[] = [
    ...history.slice(-20).map((m) => ({
      role: m.role,
      content: m.content,
    })),
    { role: 'user' as const, content: message },
  ]

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        let currentMessages = initialMessages
        let maxIterations = 5

        while (maxIterations > 0) {
          maxIterations--

          const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1024,
            system: systemPrompt,
            tools: chatTools,
            messages: currentMessages,
          })

          let hasToolUse = false
          const toolResults: Anthropic.ToolResultBlockParam[] = []

          for (const block of response.content) {
            if (block.type === 'text') {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: 'text', text: block.text })}\n\n`
                )
              )
            } else if (block.type === 'tool_use') {
              hasToolUse = true

              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: 'tool_use',
                    tool: block.name,
                    id: block.id,
                  })}\n\n`
                )
              )

              const result = await handleDemoToolCall(
                block.name,
                block.input as Record<string, string>
              )

              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: 'tool_result',
                    tool: block.name,
                    result,
                  })}\n\n`
                )
              )

              toolResults.push({
                type: 'tool_result',
                tool_use_id: block.id,
                content: result,
              })
            }
          }

          if (hasToolUse) {
            currentMessages = [
              ...currentMessages,
              { role: 'assistant', content: response.content },
              { role: 'user', content: toolResults },
            ]
            continue
          }

          break
        }

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`))
        controller.close()
      } catch (err) {
        console.error('[/api/demo/chat] stream error:', err)
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: 'error',
              error: 'Demo error. Please refresh and try again.',
            })}\n\n`
          )
        )
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
