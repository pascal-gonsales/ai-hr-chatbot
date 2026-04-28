# Master Plan

This is the multi-session roadmap. Build in vertical slices. Do not build large horizontal systems without a working employee/manager flow.

## Current Product State

The repo currently contains:

- Next.js employee chat and login
- Supabase auth/database migrations
- Claude tool-use chat route
- tips dashboard
- admin dashboard with conversations, email drafts, employees, knowledge base
- basic quick actions

Known baseline risks from Codex audit:

- client-supplied `conversation_id` is not re-authorized before service-role reads/writes,
- public access request flow conflicts with current `kk_email_drafts` schema,
- code references `kk_conversations.is_flagged` but migration does not define it,
- public access request has no abuse protection,
- local git remote has an embedded GitHub token,
- no lockfile, no tests, no CI,
- AI boundaries are not strong enough for HR-sensitive use,
- KB content lacks source/version/review metadata.

## Build Strategy

### Rule 1: Foundation before scale

Before adding onboarding/training features, make the current product safe enough to hold real employee data.

### Rule 2: One lifecycle slice at a time

A slice must include:

- employee UX,
- manager/admin UX,
- database model,
- AI behavior,
- audit trail,
- tests or validation path,
- session-state update.

### Rule 3: Knowledge first, automation second

If a workflow depends on policies/SOPs/training content, first define the KB schema and source requirements. Then build the workflow.

### Rule 4: AI never silently decides

Any AI output that affects employment, pay, safety, discipline, leave, accommodations, or legal risk must become a human-reviewed case or manager task.

## Phases

### Phase 0 - Stabilize Current Prototype

Goal: make existing chat/admin/tips app safe enough to extend.

Deliverables:

- conversation ownership check in `/api/chat`,
- access-request model fixed,
- missing `is_flagged` migration,
- lockfile committed,
- CI for lint/typecheck/build,
- baseline tests for critical auth/data isolation,
- AI boundary prompt upgraded,
- KB schema upgraded with source/version/review metadata,
- admin activity log strengthened.

Definition of done:

- clean build,
- clean lint/typecheck,
- fresh Supabase migration can create all columns the app uses,
- non-admin cannot access admin routes,
- employee cannot read/write another employee conversation,
- public access request cannot spam unlimited records,
- Claude/Codex docs are current.

### Phase 1 - Case Management Core

Goal: replace "copy this email" with tracked cases.

Core entities:

- case/request,
- case status,
- case urgency,
- assigned owner,
- employee-visible timeline,
- manager notes,
- resolution outcome,
- source conversation/message links.

Employee flows:

- ask a question,
- make a request,
- report a problem,
- see case status,
- add follow-up,
- receive manager response.

Manager flows:

- triage cases,
- assign owner,
- edit AI summary,
- respond,
- close/resolution,
- filter urgent/open/overdue.

Definition of done:

- every formal request produces a case,
- every urgent issue is visible in admin queue,
- employee can see their case status,
- AI does not claim a request is approved unless a manager did it.

### Phase 2 - Day-One Onboarding

Goal: the system can take charge of a new employee's first day.

Employee flows:

- welcome by name/role/location,
- see day-one checklist,
- complete required profile confirmations,
- read required policies,
- complete first SOP/training modules,
- ask questions from sourced KB,
- submit blockers,
- confirm completion.

Manager flows:

- assign onboarding path,
- view progress,
- see blockers,
- sign off required steps,
- adjust due dates.

Definition of done:

- new employee can complete a guided day-one path on mobile,
- manager sees clear progress and pending sign-offs,
- each completion is logged with module version and timestamp.

### Phase 3 - Training Engine

Goal: turn Pascal's restaurant operating knowledge into reusable role/location training.

Core concepts:

- training module,
- lesson,
- checklist item,
- SOP,
- quiz/check,
- practical sign-off,
- required/optional modules,
- role/location applicability,
- versioning.

Employee flows:

- role-based training path,
- short lesson,
- ask AI questions about lesson,
- acknowledge SOP,
- complete quiz/check,
- request manager help,
- see progress.

Manager flows:

- assign training,
- approve practical sign-off,
- see overdue training,
- update modules safely.

Definition of done:

- one complete role path exists end to end,
- KB/training content has source/version/review metadata,
- AI can answer training questions only from approved content.

### Phase 4 - Daily HR Operations

Goal: handle the recurring work that interrupts restaurant managers.

High-value workflows:

- sick call / absence,
- time-off request,
- schedule availability change,
- shift swap request,
- tip/pay question,
- uniform/equipment issue,
- role/responsibility question,
- manager note after conversation.

Definition of done:

- top 5 daily requests have structured forms/cases,
- managers have queue and SLA view,
- employees get clear status updates.

### Phase 5 - Sensitive Issues And Escalations

Goal: treat serious employee issues consistently and safely.

Workflows:

- accident/injury report,
- harassment/discrimination concern,
- threat/violence report,
- mental-health concern,
- food safety issue,
- theft/fraud concern,
- urgent payroll issue.

Rules:

- AI collects facts, not conclusions,
- urgent categories get clear escalation,
- manager/admin receives immediate queue priority,
- no legal, medical, or disciplinary advice.

Definition of done:

- serious reports are structured,
- employees know what immediate steps to take for safety,
- managers see urgent items instantly,
- audit trail is complete.

### Phase 6 - Performance, Growth, And Retention

Goal: support employee development without turning AI into a judge.

Workflows:

- 30/60/90 day check-in,
- role progression,
- manager feedback notes,
- employee goals,
- training refreshers,
- recognition notes,
- documented coaching follow-up.

Definition of done:

- manager owns feedback,
- AI helps structure notes and next steps,
- employee-visible vs manager-private records are separated.

### Phase 7 - Offboarding And Exit Interview

Goal: handle the last day with the same structure as day one.

Workflows:

- resignation/termination handoff checklist,
- final schedule/tips/pay information request,
- equipment/uniform return,
- account deactivation,
- document acknowledgement,
- exit interview,
- manager summary,
- closed employee record.

Definition of done:

- offboarding path exists,
- exit interview is captured with consent/visibility rules,
- access is closed cleanly,
- manager has final checklist.

### Phase 8 - Multi-Restaurant Productization

Goal: turn the internal tool into a reusable product for other restaurant owners.

Workflows:

- tenant setup,
- restaurants/locations,
- roles and permissions,
- policy templates,
- import employees,
- import SOPs,
- data retention settings,
- billing readiness,
- demo environment.

Definition of done:

- one restaurant group cannot see another group's data,
- onboarding wizard exists for a new customer,
- legal/privacy/compliance docs are ready for buyer review.

## Current Next Priority

Phase 0 comes first.

First implementation session should:

1. read this package,
2. inventory the current code against the P0 findings,
3. create or update `SESSION_STATE.md` with an exact implementation plan,
4. fix current prototype P0s in small commits/patches,
5. run validation,
6. prepare for Codex review.

