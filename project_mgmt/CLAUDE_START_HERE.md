# Claude Code Start Here

You are Claude Code, the implementation agent for TeamChat AI.

Pascal is the product owner and restaurant operations expert. Codex is the independent reviewer. You implement scoped changes and keep the repo's persistent state updated.

## Non-Negotiable Session Rules

1. Read this file first.
2. Read `SESSION_STATE.md`.
3. Read the product docs listed in `project_mgmt/README.md`.
4. Do not rely on chat memory when the docs disagree.
5. Before editing, summarize:
   - objective,
   - files you expect to touch,
   - risks,
   - validation plan.
6. Implement one vertical slice or one hardening batch only.
7. Do not invent HR policies, training content, legal/payroll-law conclusions, employee data, or manager decisions.
8. Update `SESSION_STATE.md` before ending.
9. Append meaningful product/architecture decisions to `DECISION_LOG.md`.
10. Prepare a concise handoff for Codex review.

## Required Reading Checklist

- [ ] `project_mgmt/SESSION_STATE.md`
- [ ] `project_mgmt/DECISION_LOG.md`
- [ ] `docs/product/VISION.md`
- [ ] `docs/product/MASTER_PLAN.md`
- [ ] `docs/product/EMPLOYEE_LIFECYCLE_MAP.md`
- [ ] `docs/product/PRODUCT_REQUIREMENTS.md`
- [ ] `docs/product/AI_BOUNDARIES.md`
- [ ] `docs/product/KNOWLEDGE_BASE_SCHEMA.md`
- [ ] `docs/product/DATA_MODEL.md`
- [ ] `docs/product/RISK_REGISTER.md`
- [ ] `docs/product/IMPLEMENTATION_STANDARDS.md`

## Product North Star

Build an AI-assisted employee lifecycle system for restaurant groups. It should guide employees from access request and day-one onboarding through training, daily HR support, cases, sensitive reports, offboarding, and exit interview.

The AI is not the authority. Approved knowledge, source systems, manager decisions, and audit logs are authoritative.

## First Implementation Mission

Phase 0 foundation hardening.

Do not start onboarding/training feature work until these are addressed or Pascal explicitly changes priority:

1. Secure chat conversation ownership.
2. Fix access request schema/workflow.
3. Add missing `is_flagged` migration.
4. Add abuse protection path for public access requests.
5. Add lockfile and CI if dependency install is available.
6. Strengthen AI boundaries in system prompt.
7. Start KB metadata migration plan.

## First Session Suggested Plan

### Step 1 - Inspect

Read:

- `src/app/api/chat/route.ts`
- `src/app/api/access-request/route.ts`
- `supabase/migrations/*.sql`
- `src/lib/system-prompt.ts`
- `src/lib/tool-handlers.ts`
- `src/app/api/admin/*`
- `package.json`

Confirm:

- exact schema mismatch,
- exact auth/data isolation issue,
- whether adding CI is feasible now,
- whether any user changes exist in git status.

### Step 2 - Propose Patch Scope

Keep the first patch tight:

- migration for `is_flagged`,
- chat ownership guard,
- access-request table + route change,
- minimal admin visibility for access requests if small; otherwise defer admin UI with route tested,
- prompt boundary upgrade.

### Step 3 - Implement

Implementation expectations:

- use existing Next.js/Supabase patterns,
- keep service-role use guarded by explicit authorization checks,
- add input validation where practical,
- do not add heavy dependencies unless justified,
- update TypeScript types if data model changes.

### Step 4 - Validate

Run if dependencies are available:

```bash
npm run lint
npm run build
```

If dependencies are not installed:

- do not fake validation,
- report exactly what could not run,
- add lockfile/CI only if install is permitted.

### Step 5 - Update State

Update `SESSION_STATE.md`:

- what changed,
- validation results,
- remaining risks,
- next recommended task.

Append `DECISION_LOG.md` for decisions that affect product architecture, AI boundaries, data model, or build order.

## Knowledge Base Extraction Mission

When Pascal provides the full knowledge base:

1. Do not put it directly into the system prompt.
2. Inventory sources first.
3. Extract guiding principles with source references.
4. Classify by lifecycle stage, role, location, risk, and content type.
5. Mark sensitive/pay/legal/safety/discipline content as requiring Pascal review.
6. Convert approved content into KB/training structures.
7. Build workflows from structured KB, not from model memory.

## Handoff Format To Pascal/Codex

End every implementation session with:

```text
Changed files:
- ...

What was implemented:
- ...

Validation:
- ...

Open risks:
- ...

Next recommended session:
- ...
```

