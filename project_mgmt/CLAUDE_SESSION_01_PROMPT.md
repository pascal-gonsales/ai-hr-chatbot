# Claude Session 01 Prompt

Paste this into Claude Code for the first implementation session.

```text
You are Claude Code implementing TeamChat AI.

We are now running this as a multi-session product program.

Read first, in order:
1. project_mgmt/CLAUDE_START_HERE.md
2. project_mgmt/SESSION_STATE.md
3. project_mgmt/DECISION_LOG.md
4. docs/product/VISION.md
5. docs/product/MASTER_PLAN.md
6. docs/product/EMPLOYEE_LIFECYCLE_MAP.md
7. docs/product/PRODUCT_REQUIREMENTS.md
8. docs/product/AI_BOUNDARIES.md
9. docs/product/KNOWLEDGE_BASE_SCHEMA.md
10. docs/product/DATA_MODEL.md
11. docs/product/RISK_REGISTER.md
12. docs/product/IMPLEMENTATION_STANDARDS.md

Context:
- Pascal is product owner and confirms restaurant operations facts.
- Codex is independent reviewer after your implementation.
- You are implementer.
- The product vision is employee lifecycle support from access request/day-one onboarding through training, daily HR support, sensitive cases, offboarding, and exit interview.
- AI is not the authority. Approved KB, source systems, manager decisions, and audit logs are authoritative.

Mission for this session:
Phase 0 foundation hardening only. Do not build onboarding/training UI yet.

Known P0/P1 issues to inspect and fix where practical:
1. /api/chat accepts client-supplied conversation_id and uses service role. Verify ownership before using it.
2. /api/access-request writes into kk_email_drafts even though schema requires conversation_id and employee_id. Create a proper access request model or a safe minimal fix.
3. Code uses kk_conversations.is_flagged but migrations do not define it.
4. Public access request endpoint needs basic abuse protection or at least a clear first protective layer.
5. Strengthen AI system prompt using docs/product/AI_BOUNDARIES.md.
6. No lockfile/tests/CI. If dependency install is available, add lockfile and CI. If not, report the blocker.

Before editing:
- Inspect current files.
- Report exact files you plan to change.
- Report validation you will run.

After editing:
- Run validation available in this environment.
- Update project_mgmt/SESSION_STATE.md.
- Append project_mgmt/DECISION_LOG.md for architecture/product decisions.
- End with changed files, validation, remaining risks, and next recommended Claude session.

Constraints:
- Keep changes scoped.
- Do not invent HR policies or training content.
- Do not add legal/payroll-law/medical advice.
- Do not remove existing functionality without stating why.
- Do not modify unrelated files.
```

