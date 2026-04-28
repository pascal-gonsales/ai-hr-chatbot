export interface Employee {
  id: string
  auth_user_id: string | null
  email: string
  first_name: string
  last_name: string
  restaurant: string
  preferred_language: string
  role: 'employee' | 'admin'
  staff_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Conversation {
  id: string
  employee_id: string
  title: string
  message_count: number
  last_message_at: string
  is_archived: boolean
  is_flagged: boolean
  created_at: string
  updated_at: string
  // Joined fields
  employee?: Employee
}

export interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  created_at: string
}

export interface EmailDraft {
  id: string
  conversation_id: string
  employee_id: string
  subject: string
  body: string
  recipient: string
  status: 'pending' | 'approved' | 'rejected' | 'sent'
  urgency: 'low' | 'normal' | 'high' | 'urgent'
  admin_notes: string | null
  created_at: string
  updated_at: string
}

export interface ActionLog {
  id: string
  employee_id: string | null
  action_type: string
  details: Record<string, unknown>
  created_at: string
}

export interface TipsSummary {
  staff_id: string
  employee_name: string
  total_due: number
  total_paid: number
  balance: number
}

export interface WeeklyTip {
  id: string
  staff_id: string
  week_start_date: string
  day_date: string
  hours_worked: number
  tip_amount: number
  restaurant: string
}

export interface QuickAction {
  id: string
  label_fr: string
  label_en: string
  label_th: string
  prompt: string
  icon: string
  category: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AccessRequest {
  id: string
  email: string
  name: string
  message: string | null
  status: 'pending' | 'approved' | 'rejected' | 'converted'
  admin_notes: string | null
  source_ip: string | null
  user_agent: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  converted_employee_id: string | null
  created_at: string
  updated_at: string
}

export interface KnowledgeBaseEntry {
  id: string
  category: string
  title: string
  content: string
  restaurant: string | null
  role: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}
