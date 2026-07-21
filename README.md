# TeamChat AI

An AI-assisted HR and employee-lifecycle assistant for multi-location restaurant groups. Frontline staff chat with a Claude-powered agent (mobile-first, bilingual FR/EN) to check their own tips balance, hours and schedule, and company policies, and to get formal requests (leave, shift swaps, complaints, escalations) drafted into reviewable emails routed to management. Managers get an admin dashboard for stats, conversation moderation, email-draft review, and employee, knowledge-base, and quick-action management.

> Built by Pascal Gonsales. Stack: Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS v4, Supabase (Auth + Postgres + RLS + Realtime), and the Claude API.

> This is an AI-assisted portfolio prototype, not a production deployment. I defined the
> problem, the workflow, the guardrails, and the acceptance criteria; Claude Code
> accelerated much of the implementation and documentation. I am accountable for what
> ships here, including the scope limits called out below. Earlier commits reference
> WwithAI, my own venture brand; the repository is kept brand-neutral so the examples are
> reusable, and no client identity is involved.

## What it does

- Employees authenticate by passwordless email OTP. There is no self-signup: a new person submits an access request, which an admin converts into an employee record.
- The chat agent answers from source systems only. It checks the employee's own tips, hours, and schedule; searches an approved knowledge base; and drafts (never sends) emails to management for any formal request.
- The agent is explicitly an interface, not an authority. It never approves, denies, or grants anything, and never gives legal, payroll, or medical advice. Sensitive issues are routed to a human with an urgent email draft.
- Managers moderate conversations, review and approve or reject email drafts, manage employees and their tips-system links, edit the knowledge base, and triage access requests.

## Engineering highlights

### Per-user data isolation: RLS plus service-role re-authorization

This is a single-organization, multi-location prototype: isolation is per employee, not across separate customer tenants (there is no tenant entity, and admins have an organization-wide scope). Within that scope, every access boundary is enforced twice. Postgres Row-Level Security policies (with `SECURITY DEFINER` helper functions `kk_current_employee_id()`, `kk_is_admin()`, `kk_current_staff_id()`) scope each user to their own conversations, messages, drafts, and tips, with an admin super-scope. On top of that, any code path that uses the service-role key (which bypasses RLS) re-authorizes ownership in application code first. The chat route is the clearest example: a client-supplied `conversation_id` is UUID-format-validated, then re-checked that the conversation's `employee_id` matches the authenticated employee before any privileged read or write. A mismatch returns `403`, and existence versus ownership are deliberately not distinguished. The `tests/api/chat-ownership.test.ts` suite exercises the route's cross-user denial (403) and malformed-id (400) branches with mocked data; it does not prove database-level isolation, which would need integration tests.

### Streaming agent with strict tool discipline

The chat route runs a Claude tool-use loop streamed to the browser over Server-Sent Events. Four tools (tips, schedule, knowledge-base search, draft email) are the single source of truth: the system prompt forbids stating any pay, hours, schedule, or policy fact without calling a tool in the current turn, and the route deliberately does not pre-load HR numbers into the prompt so the model cannot answer from prompt context. Each iteration emits `conversation_id`, then `text`, `tool_use`, and `tool_result` events; the loop appends tool results and continues, capped at five iterations. Client errors are generic; details are logged server-side only.

### Hardening evidence

- TOCTOU-safe dedupe on the public access-request endpoint: a partial unique index on `lower(email)` where `status = 'pending'` turns a concurrent duplicate into a `23505` unique violation, which the route catches as a soft success using a plain `.insert()` (no explicit `ON CONFLICT`), closing the count-then-insert race and avoiding enumeration.
- The rate-limit helper function is locked down: explicit `search_path`, `REVOKE EXECUTE` from `PUBLIC`/`anon`/`authenticated`, `GRANT` to `service_role` only.
- The public access-request form is env-gated and fails closed (returns `503` until `PUBLIC_ACCESS_REQUEST_ENABLED=1`), validates input, derives the client IP, and rate-limits per email and per IP.
- The demo chat is isolated, rate-limited (8/min/IP), body-capped (50KB), history-bounded, and returns `503` if the API key is absent.
- CI gates lint, typecheck, tests, and build on every push and PR.

## How to run

```bash
npm install
cp .env.example .env.local   # fill in your Supabase + Anthropic values
npm run dev
```

Apply the SQL migrations in `supabase/migrations/` in order (`000` through `005`) to your Supabase project. The `000_external_stubs.sql` migration creates minimal stand-ins for the tips and scheduling source tables that the tips/schedule tools read through the `kk_employees.staff_id` bridge; adapt it to your real source schema.

Required environment variables (see `.env.example`):

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ANTHROPIC_API_KEY
PUBLIC_ACCESS_REQUEST_ENABLED   # 0 (fail-closed) by default
```

## Scripts

```bash
npm run dev          # start the dev server
npm run build        # production build
npm run lint         # ESLint
npx tsc --noEmit     # typecheck
npm test             # Vitest (access-request + chat-ownership suites)
```

## Project layout

```
src/app/            App Router pages and API routes (chat, demo, tips, access-request, admin/*)
src/components/     UI: chat, tips, admin tabs, login, demo chat
src/lib/            system prompt, tool schema, tool handlers, i18n, types, supabase clients
src/lib/demo/       Charter-clean demo fixtures and read-only tool handlers
supabase/migrations Schema, RLS, helper functions, seeds, and hardening
tests/api/          ownership + access-request tests
```

## Honest claims

This repository is a clean-room portfolio rebuild. All demo data is synthetic: a fictional employee at a fictional venue, `.example` email domains, and round sample numbers labeled as such. No production data, real client or venue names, or secrets are present anywhere in the repo or its history. Secrets in `.env.example` are placeholders only. The numbers and screenshots are illustrative, not metrics from a live deployment.

## Security and development

This repository was built clean-room: it contains only synthetic demo data and no real client, venue, or financial information. Two gates keep it that way. A local pre-commit hook blocks any commit that contains a private real-data token, and a CI workflow (`.github/workflows/secret-scan.yml`) runs gitleaks on every push and pull request and fails on any secret or credential finding.

## License

MIT. See [LICENSE](./LICENSE).
