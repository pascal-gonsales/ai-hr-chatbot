# Implementation Standards

These rules guide Claude Code implementation.

## Scope Control

- Work one vertical slice at a time.
- Read `SESSION_STATE.md` before changing files.
- Before edits, state the files you expect to change.
- Do not refactor unrelated areas.
- Update docs/session state after each meaningful implementation.

## Security And Privacy

- Never trust client-provided IDs.
- Re-authorize every ID against the authenticated user or admin role.
- Use service role only when necessary and only after manual authorization checks.
- Prefer RLS/user-scoped Supabase clients or SECURITY DEFINER RPCs for employee-owned data.
- Do not return raw errors with sensitive details to employees.
- Do not expose one employee's pay, tips, schedule, cases, or messages to another employee.

## AI Safety

- AI tools must enforce access rules server-side.
- AI prompts must say the AI does not decide employment outcomes.
- All factual HR/policy answers should come from approved KB or source systems.
- If a fact is missing, create a gap/case instead of inventing.
- Tool calls should be logged enough for audit.

## Database

Every migration should be safe on a fresh database.

For each new table/column:

- define indexes if needed,
- define RLS,
- define insert/update/select rules,
- include seed/demo data only if non-sensitive,
- update TypeScript types/interfaces,
- update affected admin UI.

## UX

Employee UX:

- mobile-first,
- short copy,
- one next action,
- visible case/training status,
- language-aware.

Manager UX:

- queues before dashboards,
- urgent first,
- show owner/status/due date,
- preserve audit trail.

## Validation

Minimum before handoff:

- `npm run lint`
- TypeScript check/build path
- relevant route/manual test notes
- migration applied or reason not run

If dependency install is unavailable, state that clearly in session summary.

