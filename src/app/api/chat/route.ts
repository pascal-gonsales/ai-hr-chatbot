import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'
import { buildSystemPrompt } from '@/lib/system-prompt'
import { chatTools } from '@/lib/tools'
import { handleToolCall } from '@/lib/tool-handlers'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Service role client for inserting assistant messages (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    // 1. Auth check
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    // 2. Get employee
    const { data: employee, error: empError } = await supabaseAdmin
      .from('kk_employees')
      .select('*')
      .eq('auth_user_id', user.id)
      .single()

    if (empError || !employee) {
      return new Response(JSON.stringify({ error: 'Employee not found. Contact your administrator.' }), { status: 403 })
    }

    // 3. Parse request
    const { message, conversation_id } = await request.json()
    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Message required' }), { status: 400 })
    }

    // 4. Get or create conversation
    let convId = conversation_id
    if (!convId) {
      const { data: conv, error: convError } = await supabaseAdmin
        .from('kk_conversations')
        .insert({ employee_id: employee.id })
        .select('id')
        .single()

      if (convError || !conv) {
        return new Response(JSON.stringify({ error: 'Error creating conversation' }), { status: 500 })
      }
      convId = conv.id
    }

    // 5. Insert user message
    await supabaseAdmin.from('kk_messages').insert({
      conversation_id: convId,
      role: 'user',
      content: message,
    })

    // 6. Load last 50 messages for context
    const { data: history } = await supabaseAdmin
      .from('kk_messages')
      .select('role, content')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true })
      .limit(50)

    const messages: Anthropic.MessageParam[] = (history || [])
      .filter((m: { role: string }) => m.role !== 'system')
      .map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }))

    // 7. Pre-fetch lightweight context for the system prompt
    let tipsBalance: number | null = null
    let recentHours: number | null = null

    if (employee.staff_id) {
      // Quick peek at tips balance
      const { data: tipsSummary } = await supabaseAdmin
        .from('tips_reconciliation_summary')
        .select('balance')
        .eq('employee_id', employee.staff_id)
        .single()

      if (tipsSummary) {
        tipsBalance = tipsSummary.balance ?? 0
      }

      // Quick peek at most recent hours
      const { data: lastHours } = await supabaseAdmin
        .from('employee_hours')
        .select('total_hours')
        .eq('employee_id', employee.staff_id)
        .order('period_start', { ascending: false })
        .limit(1)
        .single()

      if (lastHours) {
        recentHours = lastHours.total_hours
      }
    }

    // 8. Build system prompt
    const systemPrompt = buildSystemPrompt({
      firstName: employee.first_name,
      lastName: employee.last_name,
      restaurant: employee.restaurant,
      language: employee.preferred_language,
      staffId: employee.staff_id,
      tipsBalance,
      recentHours,
    })

    // 9. Tool context for handlers
    const toolContext = {
      employeeId: employee.id,
      staffId: employee.staff_id,
      conversationId: convId,
    }

    // 10. Stream with tool-use loop
    const encoder = new TextEncoder()
    let fullResponse = ''

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send conversation_id as first event
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'conversation_id', id: convId })}\n\n`)
          )

          // Tool-use loop: Claude may call tools, we execute them and re-call Claude
          let currentMessages = [...messages]
          let maxIterations = 5 // Safety limit

          while (maxIterations > 0) {
            maxIterations--

            const response = await anthropic.messages.create({
              model: 'claude-sonnet-4-20250514',
              max_tokens: 1024,
              system: systemPrompt,
              tools: chatTools,
              messages: currentMessages,
            })

            // Process content blocks
            let hasToolUse = false
            const toolResults: Anthropic.ToolResultBlockParam[] = []

            for (const block of response.content) {
              if (block.type === 'text') {
                fullResponse += block.text
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ type: 'text', text: block.text })}\n\n`)
                )
              } else if (block.type === 'tool_use') {
                hasToolUse = true

                // Notify client about tool use
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({
                    type: 'tool_use',
                    tool: block.name,
                    id: block.id,
                  })}\n\n`)
                )

                // Execute tool
                const result = await handleToolCall(
                  block.name,
                  block.input as Record<string, unknown>,
                  toolContext
                )

                // Notify client about tool result
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({
                    type: 'tool_result',
                    tool: block.name,
                    result: JSON.parse(result),
                  })}\n\n`)
                )

                toolResults.push({
                  type: 'tool_result',
                  tool_use_id: block.id,
                  content: result,
                })
              }
            }

            // If there were tool uses, add the assistant response + tool results and loop
            if (hasToolUse) {
              currentMessages = [
                ...currentMessages,
                { role: 'assistant', content: response.content },
                { role: 'user', content: toolResults },
              ]
              continue
            }

            // No tool use - we're done
            break
          }

          // 11. Insert assistant message
          if (fullResponse) {
            await supabaseAdmin.from('kk_messages').insert({
              conversation_id: convId,
              role: 'assistant',
              content: fullResponse,
            })
          }

          // Log action
          await supabaseAdmin.from('kk_actions_log').insert({
            employee_id: employee.id,
            action_type: 'chat_message',
            details: { conversation_id: convId },
          })

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
          )
          controller.close()
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Internal error'
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', error: errorMsg })}\n\n`)
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
  } catch {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 })
  }
}
