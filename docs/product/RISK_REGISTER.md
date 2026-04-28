# Risk Register

This register is product/engineering risk, not legal advice.

| severity | risk | why it matters | mitigation |
|---|---|---|---|
| P0 | Employee accesses another employee conversation/data | HR and payroll data is sensitive; trust breaks immediately | Enforce ownership checks before service-role reads/writes; add tests. |
| P0 | Public access request spam/abuse | Public endpoint can fill DB/admin queue | Rate limit, captcha/turnstile if needed, duplicate suppression. |
| P0 | AI gives HR/legal/payroll-law advice | Bad advice can create real-world harm | Hard AI boundaries, approved KB only, route to human owner. |
| P0 | Sensitive complaint not escalated | Harassment, safety, or violence reports cannot be buried | Urgent case workflow and manager alerts. |
| P0 | Schema drift breaks production | Code references columns/tables missing from migrations | Migration tests and CI on fresh DB. |
| P1 | KB content is stale or unsourced | AI may answer from outdated policy | Source/version/review metadata and approval workflow. |
| P1 | Name-based shift lookup leaks another employee schedule | Similar names can match wrong shifts | Use stable staff IDs only. |
| P1 | Manager thinks AI sent/approved something | Workflow ambiguity creates operational mistakes | Replace copy-email pattern with case records and explicit statuses. |
| P1 | Admin role changes are too easy | Accidental privilege changes | Owner-only role changes, self-change guard, audit old/new values. |
| P1 | No retention/export policy | HR records need lifecycle management | Add retention settings before multi-tenant launch. |
| P2 | Mobile UI becomes too admin-heavy | Restaurant staff need fast answers | Keep employee UX task-first; hide admin complexity. |
| P2 | Training becomes generic content library | Real value is role-specific operational action | Attach modules to roles, checklists, signoffs, cases. |

## Review Cadence

Update this file whenever:

- a new sensitive workflow is added,
- a new data category is stored,
- AI gets a new tool,
- a manager action changes employee status/pay/schedule/training,
- Codex review finds a new material risk.

