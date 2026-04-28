# TeamChat AI

**A production-grade HR chatbot for restaurant groups.** Multi-tenant Next.js 16 + Claude API + Supabase, with row-level security, streaming tool-use, an admin dashboard, and bilingual FR/EN.

> Built from real operational experience running a four-concept restaurant group in Montreal.

[![Demo](https://img.shields.io/badge/live%20demo-ai--hr--chatbot--one.vercel.app%2Fdemo-emerald)](https://ai-hr-chatbot-one.vercel.app/demo)
[![Stack](https://img.shields.io/badge/stack-Next.js%2016%20%C2%B7%20Claude%20API%20%C2%B7%20Supabase-black)](#architecture)
[![License](https://img.shields.io/badge/license-MIT-blue)](#license)

---

## 🎭 Live demo (no login required)

**[ai-hr-chatbot-one.vercel.app/demo](https://ai-hr-chatbot-one.vercel.app/demo)**

Public read-only demo with a fictional employee (Sarah Chen) at a fictional restaurant (Le Bistro Demo). Real Claude API tool calls — you'll see the model invoke `get_employee_tips`, `get_employee_schedule`, `search_knowledge_base`, or `draft_email_to_management` in response to your questions. Fixture data only, write tools short-circuit, rate-limited per IP.

Try asking:
- "What is my tip balance?"
- "Show me my upcoming shifts"
- "How do I request vacation?"
- "Quels sont mes pourboires cette semaine?"
- "I need to report a workplace incident"

---

## How this repo is built — Claude ↔ Codex review cycles

This repo is a multi-session product program. **Claude Code implements. Codex reviews independently. Pascal owns priority and operations facts.** No vibes-driven coding — every meaningful change runs through a structured cycle:

```
Claude session N
  → SESSION_STATE updated, SESSION_LOG appended
  → CODEX_PROMPT_REVIEW_NN_<date>.md generated
Pascal pastes the prompt into Codex
Codex writes CODEX_REVIEW_NN_<date>.md back into project_mgmt/
Claude session N+1
  → reads CODEX_REVIEW_NN_<date>.md FIRST
  → reconciles findings into SESSION_STATE
  → only then starts new work
```

The repo is the source of truth. Both agents read it; neither relies on chat memory.

**Live operating record (all public in this repo):**
- [`project_mgmt/CODEX_REVIEW_PROTOCOL.md`](project_mgmt/CODEX_REVIEW_PROTOCOL.md) — review criteria + output format
- [`project_mgmt/SESSION_STATE.md`](project_mgmt/SESSION_STATE.md) — current phase, blockers, next task
- [`project_mgmt/SESSION_LOG.md`](project_mgmt/SESSION_LOG.md) — append-only per-session log
- [`project_mgmt/DECISION_LOG.md`](project_mgmt/DECISION_LOG.md) — append-only architecture/product decisions
- [`project_mgmt/CODEX_REVIEW_01_2026-04-27.md`](project_mgmt/CODEX_REVIEW_01_2026-04-27.md) — Codex review #01 verdict (NEEDS_MINOR_FIXES, all 6 P1/P2 findings reconciled in session 02)

---

## Architecture

| Layer | Tech |
|---|---|
| Frontend | Next.js 16 (App Router) · React 19 · Tailwind CSS · TypeScript |
| Backend | Supabase (Auth · PostgreSQL · Row-Level Security · Realtime) |
| AI | Claude API with streaming tool use (4 tools) |
| Auth | Passwordless OTP email login |
| Hosting | Vercel |
| Tests | Vitest (route + ownership tests) |
| CI | GitHub Actions (lint · tsc · tests · build) |

### Claude tool-use loop

The chat agent is given 4 tools that query live data:

| Tool | What it does |
|---|---|
| `get_employee_tips` | Tip reconciliation summary + last 12 weeks daily breakdown |
| `get_employee_schedule` | Recent hours + shift history |
| `search_knowledge_base` | HR policies, procedures, benefits, safety rules — restaurant-filtered |
| `draft_email_to_management` | Creates a reviewable email draft (employee copies & sends; admin sees it for context) |

Tool calls stream to the client with visible loading states and result badges. Per Codex review #01 P2.2, **tools are the only source of truth for employee data** — the system prompt explicitly forbids answering from prompt context, every numeric answer must trace to a tool call.

### Database design

- Full Row-Level Security (per-restaurant + per-employee scoping)
- Employee-to-staff bridge for cross-system data access (POS / payroll integration)
- `SECURITY DEFINER` helpers locked to service role only (`REVOKE EXECUTE FROM PUBLIC, anon, authenticated; GRANT EXECUTE TO service_role`) with `SET search_path = public, pg_temp` (per Codex review #01 P1.1)
- Realtime subscriptions on messages and conversations
- Auto-updating conversation stats via triggers
- Append-only action log (`kk_actions_log`) for full audit trail

---

## OSS vs gated

This repo is the **open-source reference implementation**. The live production app for paying customers is deployed separately and is not in this repo.

The `/demo` route in this repo runs against fixture data only — no real Supabase, no real customer data — and is what's hosted at the public demo URL above.

---

## Project structure

```
src/
  app/
    api/
      chat/route.ts                # Production: Claude tool use loop, RLS-scoped, auth-required
      tips/route.ts                # Tips data endpoint
      access-request/route.ts      # Public new-employee access requests (gated by env flag)
      admin/                       # Admin dashboard endpoints (employees, conversations, KB, etc.)
      demo/chat/route.ts           # Public demo route — no auth, fixtures only, rate-limited
    chat/page.tsx                  # Employee chat (server component, auth-required)
    demo/page.tsx                  # Public demo landing
    demo/chat/page.tsx             # Public demo chat UI
    login/page.tsx                 # OTP login
    tips/page.tsx                  # Tips dashboard
    admin/page.tsx                 # Admin dashboard
  components/
    ChatInterface.tsx              # Production chat (Realtime + auth)
    demo/DemoChatInterface.tsx     # Demo chat (in-memory, no DB)
    Admin*.tsx                     # Admin dashboard components
  lib/
    system-prompt.ts               # Dynamic system prompt builder
    tools.ts                       # Claude tool schema definitions
    tool-handlers.ts               # Production tool handlers (RLS-aware DB queries)
    demo/                          # Demo fixtures + read-only handlers
    i18n.ts                        # Bilingual FR/EN translations
    supabase/                      # Supabase client configs (server + browser + middleware)
supabase/
  migrations/                      # Full schema + RLS + seed data + Phase 0 hardening
project_mgmt/                      # Multi-session operating record (Claude ↔ Codex)
docs/product/                      # PRD, AI boundaries, risk register, schemas
tests/                             # Vitest route + ownership + rate-limit tests
.github/workflows/                 # CI: lint · tsc · tests · build
```

---

## Setup (local dev)

```bash
npm install
cp .env.example .env.local
# Fill in:
#   NEXT_PUBLIC_SUPABASE_URL
#   NEXT_PUBLIC_SUPABASE_ANON_KEY
#   SUPABASE_SERVICE_ROLE_KEY
#   ANTHROPIC_API_KEY
npm run dev          # http://localhost:3000
npm run lint         # 0 errors expected (4 pre-existing UI warnings)
npx tsc --noEmit     # type-check
npm test             # vitest
```

> **Build note:** Next.js evaluates API routes at build time, so a successful build needs the env vars above to be set (placeholder values are sufficient for the build itself; runtime calls require real values).

---

## Documentation index

- [`docs/product/MASTER_PLAN.md`](docs/product/MASTER_PLAN.md) — roadmap from prototype to full employee lifecycle system
- [`docs/product/AI_BOUNDARIES.md`](docs/product/AI_BOUNDARIES.md) — safety rules for HR-sensitive AI behavior
- [`docs/product/RISK_REGISTER.md`](docs/product/RISK_REGISTER.md) — open security/legal/UX risks
- [`docs/product/IMPLEMENTATION_STANDARDS.md`](docs/product/IMPLEMENTATION_STANDARDS.md) — code review checklist
- [`docs/product/KNOWLEDGE_BASE_SCHEMA.md`](docs/product/KNOWLEDGE_BASE_SCHEMA.md) — how operational knowledge becomes approved AI-usable content

---

## License

MIT — see [`LICENSE`](LICENSE).

## Author

Built by [Pascal Gonsales](https://github.com/pascal-gonsales) — operator-turned applied AI builder. 13 years cofounding and operating a four-concept restaurant group in Montreal. Now helping operations-heavy businesses turn messy workflows into usable AI systems.

[`linkedin.com/in/airestohub`](https://www.linkedin.com/in/airestohub)
