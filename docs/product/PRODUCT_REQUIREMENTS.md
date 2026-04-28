# Product Requirements

This file tracks current and near-term feature requirements. Detailed implementation should happen one vertical slice at a time.

## Current Priority: Phase 0 Foundation

### PRD-0.1 Conversation Ownership Guard

Problem:

The chat endpoint accepts a client-supplied `conversation_id` and then uses the service role. Without ownership validation, a user could attempt to write/read another conversation.

Requirement:

- If `conversation_id` is provided, verify it belongs to the authenticated employee.
- If not, return 403.
- Only after verification may messages/history be read or inserted.

Acceptance:

- employee A cannot post into employee B conversation,
- server returns 403 for mismatched conversation,
- new conversation creation still works,
- add a test or clear manual verification path.

### PRD-0.2 Access Request Model

Problem:

Public access request currently writes into email drafts, but email draft schema requires employee/conversation references.

Requirement:

- Create `kk_access_requests` or equivalent.
- Public route writes access request records with anti-spam constraints.
- Admin dashboard can review and convert request into employee.

Acceptance:

- unauthenticated request succeeds without violating constraints,
- duplicate/spam attempts are limited,
- admin can see pending requests,
- request has status and audit trail.

### PRD-0.3 Missing Conversation Flag Migration

Problem:

Code uses `is_flagged`; migration does not define it.

Requirement:

- Add migration for `kk_conversations.is_flagged boolean not null default false`.

Acceptance:

- fresh database supports admin stats and conversation flag/unflag.

### PRD-0.4 Build Reproducibility

Problem:

No lockfile; local lint/build cannot run without dependency install state.

Requirement:

- Add package lockfile.
- Add CI workflow.
- CI runs install, lint, typecheck, build.

Acceptance:

- `npm ci` works,
- `npm run lint` works,
- typecheck/build works in CI.

### PRD-0.5 AI Boundary Upgrade

Problem:

Current prompt is useful but too open-ended for HR-sensitive production use.

Requirement:

- Update prompt to enforce AI boundaries from `AI_BOUNDARIES.md`.
- Add case creation direction for formal requests and sensitive issues.
- Remove hardcoded demo admin email as final product behavior once cases exist.

Acceptance:

- AI does not claim it approved leave/schedule/pay/etc.,
- AI routes sensitive issues to urgent case,
- AI says when KB lacks an answer,
- AI uses tools before stating facts.

### PRD-0.6 Knowledge Base Metadata

Problem:

KB content has no version/review/source fields.

Requirement:

- Extend KB schema to include review/source/version/scope fields.
- Admin KB editor supports the fields or has a migration-compatible placeholder path.

Acceptance:

- each KB item can identify owner, status, source, review date, effective date, role/location scope.

## Next Priority: Phase 1 Case Management Core

### PRD-1.1 Case Creation From Chat

Requirement:

- AI can create structured case records from employee requests.
- Employee can see case status.
- Admin can triage cases.

Case types:

- general question,
- time off,
- schedule change,
- sick/absence,
- pay/tips concern,
- training blocker,
- incident/safety,
- sensitive complaint,
- access/setup issue.

Acceptance:

- formal employee request creates a case,
- urgent categories appear in urgent admin queue,
- employee can add follow-up,
- manager can respond and close.

### PRD-1.2 Manager Case Queue

Requirement:

- Admin dashboard has queues by urgency/status/owner.
- Managers can assign, comment, respond, close.

Acceptance:

- manager can identify what needs action today in under 30 seconds.

## Phase 2 Onboarding Requirements

### PRD-2.1 Onboarding Template

Requirement:

- define templates by role/location,
- include steps, required policies, training modules, manager signoffs.

### PRD-2.2 Employee Onboarding Journey

Requirement:

- employee sees current onboarding step,
- AI explains the step from KB/training content,
- employee can complete/acknowledge,
- manager signs off practical steps.

### PRD-2.3 Onboarding Progress Dashboard

Requirement:

- manager sees onboarding status, blockers, overdue steps, signoffs.

## Phase 3 Training Requirements

### PRD-3.1 Role Training Path

Requirement:

- role-based module assignment,
- lesson content from approved KB,
- completion tracking,
- manager sign-off.

### PRD-3.2 Knowledge Checks

Requirement:

- quizzes or short checks for selected modules,
- failed checks create review/help prompt,
- practical competency remains manager-owned.

## Requirement Quality Bar

Every PRD must eventually specify:

- user story,
- database changes,
- API changes,
- UI changes,
- AI behavior,
- privacy/access rules,
- audit trail,
- tests,
- rollback/migration concerns.

