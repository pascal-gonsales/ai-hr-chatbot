# TeamChat AI - AI-Powered HR Chatbot for Restaurant Groups

A mobile-first HR chatbot built with Next.js, Supabase, and the Claude API. Employees chat with an AI agent to check tips, review schedules, request time off, and escalate issues - all through a bilingual (FR/EN) interface with real-time data access.

Built from real operational experience running a multi-location restaurant group.

## Architecture

- **Frontend:** Next.js 16 (App Router) + Tailwind CSS
- **Backend:** Supabase (Auth, PostgreSQL, Row-Level Security, Realtime)
- **AI:** Claude API with tool use (4 tools for data access + email escalation)
- **Auth:** OTP email login (passwordless)
- **Hosting:** Vercel

## Key Features

### Employee Interface (mobile-first)
- Passwordless OTP login via email
- AI chat with Claude - contextual HR agent
- Real-time tips dashboard (summary + weekly breakdown)
- Quick action buttons (configurable per language)
- Bilingual FR/EN with auto-detection
- Access request flow for new employees

### Admin Dashboard
- Overview stats (conversations, messages, flagged items)
- Conversation viewer with realtime updates
- Email draft review/approve/reject workflow
- Employee management with staff system linking
- Knowledge base CRUD (policies, procedures, benefits)

### Claude Tool Use Integration
The AI agent has 4 tools that query live Supabase data:
1. `get_employee_tips` - Fetches tip reconciliation and weekly breakdown
2. `get_employee_schedule` - Fetches hours and shift history
3. `draft_email_to_management` - Creates reviewable email drafts
4. `search_knowledge_base` - Searches HR policies with restaurant filtering

Tool calls are streamed to the client with visual feedback (loading states, result badges).

### Database Design
- Full RLS (Row-Level Security) with helper functions
- Employee-to-staff bridge table for cross-system data access
- SECURITY DEFINER functions for safe cross-table queries
- Realtime subscriptions on messages and conversations
- Auto-updating conversation stats via triggers
- Action logging for audit trail

## Project Structure

```
src/
  app/
    api/
      chat/route.ts              # Claude API + tool use loop (SSE streaming)
      tips/route.ts              # Tips data endpoint
      access-request/route.ts    # New employee access requests
      admin/
        employees/route.ts       # CRUD + auth user creation
        conversations/route.ts   # Flag/archive conversations
        email-drafts/route.ts    # Review workflow
        knowledge-base/route.ts  # KB CRUD
        quick-actions/route.ts   # Quick action CRUD
        stats/route.ts           # Dashboard analytics
    chat/page.tsx                # Employee chat (server component)
    login/page.tsx               # OTP login
    tips/page.tsx                # Tips dashboard
    admin/page.tsx               # Admin dashboard
  components/
    ChatInterface.tsx            # Main chat with streaming + realtime
    ChatMessage.tsx              # Message bubbles + tool event badges
    ChatInput.tsx                # Auto-growing textarea
    LoginForm.tsx                # Multi-step OTP form
    TipsDashboard.tsx            # Tips summary + weekly list
    BottomNav.tsx                # Mobile bottom navigation
    QuickActions.tsx             # Configurable action grid
    Admin*.tsx                   # Admin dashboard components
  lib/
    system-prompt.ts             # Dynamic system prompt builder
    tools.ts                     # Claude tool definitions
    tool-handlers.ts             # Tool execution logic
    i18n.ts                      # Bilingual translation system
    types.ts                     # TypeScript interfaces
    supabase/                    # Supabase client configs
supabase/
  migrations/                    # Full database schema + RLS + seed data
```

## Setup

```bash
npm install
cp .env.example .env.local
# Fill in Supabase + Anthropic keys
npm run dev
```

## License

MIT
