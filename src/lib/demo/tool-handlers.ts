// Demo tool handlers. Read-only fixture-based implementations.
// Mirrors the production tool surface (src/lib/tool-handlers.ts) but:
// - No DB reads
// - No DB writes
// - Write tools return informative stubs explaining what production would do
// - All data comes from src/lib/demo/fixtures.ts

import {
  DEMO_TIPS_SUMMARY,
  DEMO_WEEKLY_TIPS,
  DEMO_UPCOMING_SHIFTS,
  DEMO_RECENT_HOURS_TOTAL,
  DEMO_KB_ENTRIES,
} from './fixtures'

interface DemoToolInput {
  reason?: string
  query?: string
  category?: string
  subject?: string
  body?: string
  urgency?: string
}

export async function handleDemoToolCall(
  name: string,
  input: DemoToolInput
): Promise<string> {
  switch (name) {
    case 'get_employee_tips':
      return handleGetTips()
    case 'get_employee_schedule':
      return handleGetSchedule()
    case 'search_knowledge_base':
      return handleSearchKB(input.query || '', input.category)
    case 'draft_email_to_management':
      return handleDraftEmail(input.subject || '', input.body || '', input.urgency || 'normal')
    default:
      return `Demo mode: tool "${name}" is not enabled in the public demo.`
  }
}

function handleGetTips(): string {
  const summary = DEMO_TIPS_SUMMARY
  const recentDays = DEMO_WEEKLY_TIPS.slice(0, 6)

  const dayLines = recentDays
    .map((t) => `  ${t.day_date} — ${t.hours_worked}h worked, $${t.tip_amount.toFixed(2)} tips`)
    .join('\n')

  return [
    `Tips summary for ${summary.employee_name}:`,
    `  Total due (lifetime):  $${summary.total_due.toFixed(2)}`,
    `  Total paid out:        $${summary.total_paid.toFixed(2)}`,
    `  Current balance:       $${summary.balance.toFixed(2)}`,
    '',
    'Last 6 days:',
    dayLines,
  ].join('\n')
}

function handleGetSchedule(): string {
  const shifts = DEMO_UPCOMING_SHIFTS
  const lines = shifts
    .map((s) => `  ${s.date} — ${s.start_time} to ${s.end_time} (${s.position}) — ${s.status}`)
    .join('\n')

  return [
    `Schedule for the next 2 weeks:`,
    lines,
    '',
    `Hours worked in the last 2 weeks: ${DEMO_RECENT_HOURS_TOTAL}h`,
  ].join('\n')
}

function handleSearchKB(query: string, category?: string): string {
  const q = query.toLowerCase()
  const matches = DEMO_KB_ENTRIES.filter((entry) => {
    if (category && entry.category !== category) return false
    return (
      entry.title.toLowerCase().includes(q) ||
      entry.content.toLowerCase().includes(q) ||
      // Fuzzy match on common topic words
      (q.includes('vacation') && entry.title.toLowerCase().includes('vacation')) ||
      (q.includes('sick') && entry.title.toLowerCase().includes('sick')) ||
      (q.includes('tip') && entry.title.toLowerCase().includes('tip')) ||
      (q.includes('insurance') && entry.title.toLowerCase().includes('insurance')) ||
      (q.includes('incident') && entry.title.toLowerCase().includes('incident'))
    )
  })

  if (matches.length === 0) {
    return `No knowledge base entries matched "${query}". The demo KB has 5 entries: vacation requests, sick leave, tip pooling, workplace incident reporting, group insurance.`
  }

  return matches
    .map((m) => `[${m.category.toUpperCase()}] ${m.title}\n${m.content}`)
    .join('\n\n')
}

function handleDraftEmail(subject: string, body: string, urgency: string): string {
  // Demo mode: no DB write. Return a stub explaining what production would do.
  return [
    'Demo mode: email draft prepared (read-only — no DB write, no email sent).',
    '',
    `Subject: ${subject}`,
    `Urgency: ${urgency}`,
    `To: admin@bistro-demo.example`,
    '',
    body,
    '',
    'In production, this draft is saved to the kk_email_drafts table for the employee to review and copy-send to admin@<restaurant>.com. Admins see it in the admin dashboard for context.',
  ].join('\n')
}
