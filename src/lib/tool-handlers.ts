import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface ToolContext {
  employeeId: string
  staffId: string | null
  conversationId: string
}

export async function handleToolCall(
  toolName: string,
  toolInput: Record<string, unknown>,
  context: ToolContext
): Promise<string> {
  switch (toolName) {
    case 'get_employee_tips':
      return handleGetTips(context)
    case 'get_employee_schedule':
      return handleGetSchedule(context)
    case 'draft_email_to_management':
      return handleDraftEmail(toolInput, context)
    case 'search_knowledge_base':
      return handleSearchKB(toolInput, context)
    default:
      return JSON.stringify({ error: `Unknown tool: ${toolName}` })
  }
}

async function handleGetTips(context: ToolContext): Promise<string> {
  if (!context.staffId) {
    return JSON.stringify({
      error: 'no_staff_link',
      message: 'This employee\'s account is not yet linked to the tips system.',
    })
  }

  // tips_reconciliation_summary uses employee_id (= staff.id), columns: total_owed, total_paid, balance
  const { data: summary } = await supabaseAdmin
    .from('tips_reconciliation_summary')
    .select('*')
    .eq('employee_id', context.staffId)
    .single()

  // weekly_tips uses employee_id (= staff.id), columns: week_start, week_end, mon-sun, total
  const { data: weekly } = await supabaseAdmin
    .from('weekly_tips')
    .select('*')
    .eq('employee_id', context.staffId)
    .order('week_start', { ascending: false })
    .limit(12)

  return JSON.stringify({
    summary: summary ? {
      total_owed: summary.total_owed ?? 0,
      total_paid: summary.total_paid ?? 0,
      balance: summary.balance ?? 0,
      weeks_count: summary.weeks_count,
      first_week: summary.first_week,
      last_week: summary.last_week,
    } : { total_owed: 0, total_paid: 0, balance: 0 },
    weekly: (weekly || []).map((w: Record<string, unknown>) => ({
      week_start: w.week_start,
      week_end: w.week_end,
      restaurant: w.restaurant,
      mon: w.mon, tue: w.tue, wed: w.wed, thu: w.thu,
      fri: w.fri, sat: w.sat, sun: w.sun,
      total: w.total,
    })),
    note: 'Amounts in CAD. balance = total_owed - total_paid.',
  })
}

async function handleGetSchedule(context: ToolContext): Promise<string> {
  if (!context.staffId) {
    return JSON.stringify({
      error: 'no_staff_link',
      message: 'This employee\'s account is not yet linked to the hours system.',
    })
  }

  // employee_hours uses employee_id (nullable, = staff.id)
  const { data: hours } = await supabaseAdmin
    .from('employee_hours')
    .select('*')
    .eq('employee_id', context.staffId)
    .order('period_start', { ascending: false })
    .limit(6)

  // labor_shifts uses employee (name string) - need to get staff name first
  const { data: staffRecord } = await supabaseAdmin
    .from('staff')
    .select('name')
    .eq('id', context.staffId)
    .single()

  let shifts: Record<string, unknown>[] = []
  if (staffRecord?.name) {
    const { data: shiftData } = await supabaseAdmin
      .from('labor_shifts')
      .select('*')
      .ilike('employee', `%${staffRecord.name}%`)
      .order('date', { ascending: false })
      .limit(14)
    shifts = shiftData || []
  }

  return JSON.stringify({
    recent_hours: (hours || []).map((h: Record<string, unknown>) => ({
      period_start: h.period_start,
      period_end: h.period_end,
      normal_hours: h.normal_hours,
      overtime_hours: h.overtime_hours,
      total_hours: h.total_hours,
      restaurant: h.restaurant_id,
    })),
    recent_shifts: shifts.map((s: Record<string, unknown>) => ({
      date: s.date,
      position: s.position,
      shift_start: s.shift_start,
      shift_end: s.shift_end,
      total_hours: s.total_hours,
      restaurant: s.restaurant,
    })),
    note: 'Hours by period and recent shift details.',
  })
}

async function handleDraftEmail(
  input: Record<string, unknown>,
  context: ToolContext
): Promise<string> {
  const { subject, body, urgency } = input as {
    subject: string
    body: string
    urgency: string
  }

  const { data: draft, error } = await supabaseAdmin
    .from('kk_email_drafts')
    .insert({
      conversation_id: context.conversationId,
      employee_id: context.employeeId,
      subject,
      body,
      recipient: 'admin@demo-restaurants.com',
      urgency: urgency || 'normal',
    })
    .select('id')
    .single()

  if (error) {
    console.error('[handleDraftEmail] supabase insert error:', error)
    return JSON.stringify({ error: 'Error creating draft' })
  }

  // Log action
  await supabaseAdmin.from('kk_actions_log').insert({
    employee_id: context.employeeId,
    action_type: 'email_draft_created',
    details: { draft_id: draft.id, conversation_id: context.conversationId, urgency },
  })

  return JSON.stringify({
    success: true,
    draft_id: draft.id,
    message: `Email prepared successfully. Subject: "${subject}". Show the content to the employee and tell them to copy the email and send it to admin@demo-restaurants.com.`,
    email_subject: subject,
    email_body: body,
    send_to: 'admin@demo-restaurants.com',
  })
}

async function handleSearchKB(
  input: Record<string, unknown>,
  context: ToolContext
): Promise<string> {
  const { query, category } = input as { query: string; category?: string }

  // Get employee's restaurant for filtering
  const { data: employee } = await supabaseAdmin
    .from('kk_employees')
    .select('restaurant')
    .eq('id', context.employeeId)
    .single()

  let q = supabaseAdmin
    .from('kk_knowledge_base')
    .select('title, content, category, restaurant')
    .eq('is_active', true)

  if (category) {
    q = q.eq('category', category)
  }

  // Filter: entries for employee's restaurant OR entries for all restaurants
  if (employee?.restaurant) {
    q = q.or(`restaurant.is.null,restaurant.eq.${employee.restaurant}`)
  }

  const { data: entries } = await q

  if (!entries || entries.length === 0) {
    return JSON.stringify({
      results: [],
      message: 'No entries found in the knowledge base.',
    })
  }

  // Simple text search: filter entries whose title or content contains query words
  const queryWords = query.toLowerCase().split(/\s+/).filter(Boolean)
  const matched = entries.filter((entry) => {
    const text = `${entry.title} ${entry.content}`.toLowerCase()
    return queryWords.some((word) => text.includes(word))
  })

  // If no keyword match, return all (they're pre-filtered by restaurant/category)
  const results = matched.length > 0 ? matched.slice(0, 5) : entries.slice(0, 5)

  return JSON.stringify({
    results: results.map((r) => ({
      title: r.title,
      category: r.category,
      content: r.content,
    })),
    total: results.length,
  })
}
