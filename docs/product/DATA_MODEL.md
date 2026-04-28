# Data Model Direction

This is the target conceptual data model. It does not mean all tables should be built immediately.

## Existing Tables

Current migrations define:

- `kk_employees`
- `kk_conversations`
- `kk_messages`
- `kk_email_drafts`
- `kk_actions_log`
- `kk_knowledge_base`
- `kk_quick_actions`

External/source-system tables referenced by code:

- `staff`
- `tips_reconciliation_summary`
- `weekly_tips`
- `employee_hours`
- `labor_shifts`

## Required Near-Term Fixes

- Add missing `kk_conversations.is_flagged`.
- Create a real access-request table or relax draft references safely.
- Add case/request tables before adding onboarding/training workflows.
- Add source/version fields to KB.

## Target Core Domains

### Identity And Access

Tables:

- `organizations`
- `restaurants`
- `roles`
- `employees`
- `employee_role_assignments`
- `auth_links`
- `staff_system_links`

Rules:

- auth identity and operational staff identity are different,
- every cross-system link must be auditable,
- deactivated employees should keep historical records but lose access.

### Conversation And Cases

Tables:

- `conversations`
- `messages`
- `cases`
- `case_events`
- `case_comments`
- `case_assignments`
- `case_attachments`
- `case_templates`

Case fields:

- employee_id,
- restaurant_id,
- type,
- status,
- urgency,
- owner_id,
- due_at,
- created_from_conversation_id,
- created_from_message_id,
- employee_visible_summary,
- manager_private_notes,
- resolution,
- closed_at.

Statuses:

- `new`
- `needs_employee_info`
- `needs_manager_review`
- `assigned`
- `waiting_external`
- `resolved`
- `closed`
- `cancelled`

Urgency:

- `low`
- `normal`
- `high`
- `urgent`

### Knowledge Base

Tables:

- `kb_sources`
- `kb_items`
- `kb_item_versions`
- `kb_item_scopes`
- `kb_gaps`

Rules:

- AI answers only from active approved versions unless in admin draft mode,
- every item has owner/review metadata,
- deprecated items remain for audit.

### Training

Tables:

- `training_paths`
- `training_modules`
- `training_lessons`
- `training_checklist_items`
- `training_assignments`
- `training_progress`
- `training_completions`
- `training_signoffs`
- `training_quizzes`
- `training_quiz_attempts`

Rules:

- completion records store module version,
- practical sign-off requires manager/trainer user,
- AI can coach but cannot sign off practical competency.

### Onboarding

Tables:

- `onboarding_templates`
- `onboarding_assignments`
- `onboarding_steps`
- `onboarding_step_completions`
- `onboarding_blockers`

Rules:

- onboarding template is assigned by role/location,
- blockers become cases,
- manager sign-off steps are separate from employee acknowledgements.

### Offboarding

Tables:

- `offboarding_templates`
- `offboarding_assignments`
- `offboarding_steps`
- `offboarding_step_completions`
- `exit_interviews`

Rules:

- exit interview visibility must be explicit,
- access deactivation is a tracked step,
- final pay/tips questions route to manager/payroll/admin.

### Audit And Safety

Tables:

- `action_logs`
- `ai_tool_calls`
- `ai_outputs`
- `ai_safety_flags`
- `data_access_logs`

Minimum log for AI tool call:

- employee_id,
- conversation_id,
- tool_name,
- reason,
- input summary,
- result type,
- timestamp,
- error status.

## Privacy Model

Employee can see:

- own profile basics,
- own conversations,
- own cases,
- own training assignments/completions,
- own tips/hours data if linked,
- employee-visible manager responses.

Manager can see:

- employees/cases/training for assigned restaurants,
- manager-visible case details,
- relevant employee progress.

Admin/owner can see:

- organization-level data,
- configuration,
- all cases based on role.

The product must eventually support tenant isolation for multiple restaurant groups.

## Implementation Rule

When adding any table, also define:

- RLS policy,
- owner/visibility rules,
- audit/log requirement,
- seed/demo data if useful,
- minimal test or verification query.

