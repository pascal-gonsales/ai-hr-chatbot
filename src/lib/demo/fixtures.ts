// Demo-mode fixtures. Public-facing read-only data for /demo route.
// No real employees, no real customer data, no production credentials.
// Alex Demo is a fictional server at the fictional Northstar Demo Bistro.
// All numbers are round, labeled sample data, not derived from any real payroll.

import { Employee, TipsSummary, WeeklyTip, KnowledgeBaseEntry } from '@/lib/types'

export const DEMO_EMPLOYEE: Employee = {
  id: '00000000-0000-0000-0000-000000000001',
  auth_user_id: null,
  email: 'alex.demo@northstar-demo.example',
  first_name: 'Alex',
  last_name: 'Demo',
  restaurant: 'Northstar Demo Bistro',
  preferred_language: 'en',
  role: 'employee',
  staff_id: 'demo-staff-001',
  is_active: true,
  created_at: '2025-01-15T00:00:00.000Z',
  updated_at: '2026-04-15T00:00:00.000Z',
}

// Round numbers, labeled sample data (not real payroll).
export const DEMO_TIPS_SUMMARY: TipsSummary = {
  staff_id: 'demo-staff-001',
  employee_name: 'Alex Demo',
  total_due: 1000.0,
  total_paid: 800.0,
  balance: 200.0,
}

export const DEMO_WEEKLY_TIPS: WeeklyTip[] = [
  { id: 'd1', staff_id: 'demo-staff-001', week_start_date: '2026-04-21', day_date: '2026-04-26', hours_worked: 8.0, tip_amount: 120.0, restaurant: 'Northstar Demo Bistro' },
  { id: 'd2', staff_id: 'demo-staff-001', week_start_date: '2026-04-21', day_date: '2026-04-25', hours_worked: 8.0, tip_amount: 110.0, restaurant: 'Northstar Demo Bistro' },
  { id: 'd3', staff_id: 'demo-staff-001', week_start_date: '2026-04-21', day_date: '2026-04-24', hours_worked: 6.0, tip_amount: 90.0, restaurant: 'Northstar Demo Bistro' },
  { id: 'd4', staff_id: 'demo-staff-001', week_start_date: '2026-04-14', day_date: '2026-04-19', hours_worked: 8.0, tip_amount: 130.0, restaurant: 'Northstar Demo Bistro' },
  { id: 'd5', staff_id: 'demo-staff-001', week_start_date: '2026-04-14', day_date: '2026-04-18', hours_worked: 7.0, tip_amount: 100.0, restaurant: 'Northstar Demo Bistro' },
  { id: 'd6', staff_id: 'demo-staff-001', week_start_date: '2026-04-14', day_date: '2026-04-17', hours_worked: 6.0, tip_amount: 80.0, restaurant: 'Northstar Demo Bistro' },
]

export interface DemoShift {
  date: string
  start_time: string
  end_time: string
  position: string
  status: 'scheduled' | 'completed' | 'open'
}

export const DEMO_UPCOMING_SHIFTS: DemoShift[] = [
  { date: '2026-04-29', start_time: '17:00', end_time: '23:00', position: 'Server', status: 'scheduled' },
  { date: '2026-04-30', start_time: '11:00', end_time: '15:00', position: 'Server', status: 'scheduled' },
  { date: '2026-05-02', start_time: '17:00', end_time: '23:00', position: 'Server', status: 'scheduled' },
  { date: '2026-05-03', start_time: '17:00', end_time: '23:00', position: 'Server', status: 'scheduled' },
]

export const DEMO_RECENT_HOURS_TOTAL = 43.0

// Mirrors the real generic HR topics; safe to reuse (no real names).
export const DEMO_KB_ENTRIES: KnowledgeBaseEntry[] = [
  {
    id: 'kb1',
    category: 'policy',
    title: 'Vacation requests',
    content: 'Submit vacation requests at least 14 days in advance through your manager. Requests are approved on a first-come, first-served basis with consideration for staffing levels. Up to 2 weeks consecutive maximum during peak season (June to August).',
    restaurant: null,
    role: null,
    is_active: true,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-12-01T00:00:00.000Z',
  },
  {
    id: 'kb2',
    category: 'policy',
    title: 'Sick leave',
    content: 'Notify your manager at least 2 hours before your shift if you cannot work due to illness. Doctor\'s note required after 3 consecutive sick days. Paid sick leave: 5 days per year for full-time staff after 3 months of employment.',
    restaurant: null,
    role: null,
    is_active: true,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-12-01T00:00:00.000Z',
  },
  {
    id: 'kb3',
    category: 'procedure',
    title: 'Tip pooling',
    content: 'Tips are pooled across servers and bar staff each shift, distributed by hours worked. Kitchen staff receive a fixed percentage. Pool balances are reconciled weekly and paid out bi-weekly with regular pay. Statements are available through this chatbot at any time.',
    restaurant: null,
    role: null,
    is_active: true,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-12-01T00:00:00.000Z',
  },
  {
    id: 'kb4',
    category: 'safety',
    title: 'Workplace incident reporting',
    content: 'Report any workplace incident (injury, near-miss, harassment, or unsafe condition) to your manager immediately and file an incident report within 24 hours. For workplace injuries, claim forms are available at the bar station. Confidentiality is maintained throughout the process.',
    restaurant: null,
    role: null,
    is_active: true,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-12-01T00:00:00.000Z',
  },
  {
    id: 'kb5',
    category: 'benefits',
    title: 'Group insurance',
    content: 'Eligible after 6 months of continuous employment. Coverage includes basic health, dental, and vision. Employee pays 30% of premium, employer covers 70%. Enrollment forms with HR. Spouse and dependent children can be added.',
    restaurant: null,
    role: null,
    is_active: true,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-12-01T00:00:00.000Z',
  },
]

export const DEMO_QUICK_ACTIONS = [
  { id: 'qa1', label_en: 'What is my tip balance?', label_fr: 'Quel est mon solde de pourboires?', prompt: 'What is my current tip balance?' },
  { id: 'qa2', label_en: 'Show my upcoming shifts', label_fr: 'Mes prochains quarts', prompt: 'Can you show me my upcoming shifts?' },
  { id: 'qa3', label_en: 'How do I request vacation?', label_fr: 'Comment demander des vacances?', prompt: 'How do I request vacation time?' },
]
