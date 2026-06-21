import Anthropic from '@anthropic-ai/sdk'

export const chatTools: Anthropic.Tool[] = [
  {
    name: 'get_employee_tips',
    description: 'Retrieves the employee\'s tip data: summary (owed, paid, balance) and detail for the last 12 weeks. Use this tool when the employee asks about their tips, balance, or tip earnings.',
    input_schema: {
      type: 'object' as const,
      properties: {
        reason: {
          type: 'string',
          description: 'Brief reason for the lookup (e.g. "employee asked about their balance")',
        },
      },
      required: ['reason'],
    },
  },
  {
    name: 'get_employee_schedule',
    description: 'Retrieves recent work hours and shifts for the employee. Use this tool when the employee asks about their hours, schedule, or planning.',
    input_schema: {
      type: 'object' as const,
      properties: {
        reason: {
          type: 'string',
          description: 'Brief reason for the lookup',
        },
      },
      required: ['reason'],
    },
  },
  {
    name: 'draft_email_to_management',
    description: 'Prepares an email that the employee can copy and send to admin@demo-restaurants.com. Use this tool when: leave/vacation request, reporting an important issue, formal request that needs escalation, or when the employee accepts a follow-up/confirmation email. The email is NOT sent automatically - the employee copies and sends it themselves.',
    input_schema: {
      type: 'object' as const,
      properties: {
        subject: {
          type: 'string',
          description: 'Email subject',
        },
        body: {
          type: 'string',
          description: 'Email body, written professionally and constructively',
        },
        urgency: {
          type: 'string',
          enum: ['low', 'normal', 'high', 'urgent'],
          description: 'Urgency level',
        },
      },
      required: ['subject', 'body', 'urgency'],
    },
  },
  {
    name: 'search_knowledge_base',
    description: 'Searches the company knowledge base (HR policies, procedures, benefits, safety rules). Use this tool when the employee asks about restaurant rules, policies, or procedures.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'Search terms (relevant keywords)',
        },
        category: {
          type: 'string',
          enum: ['general', 'policy', 'procedure', 'benefits', 'safety'],
          description: 'Optional category filter',
        },
      },
      required: ['query'],
    },
  },
]
