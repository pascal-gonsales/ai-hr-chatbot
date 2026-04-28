# Project Management Control Plane

This folder is the persistent operating memory for TeamChat AI.

Claude Code implements. Codex reviews. Pascal owns product judgment, restaurant operations facts, and business priorities.

Every implementation session starts here, not from chat memory.

## Required Reading Order

1. `project_mgmt/CLAUDE_START_HERE.md`
2. `project_mgmt/SESSION_STATE.md`
3. `docs/product/VISION.md`
4. `docs/product/MASTER_PLAN.md`
5. The current slice spec in `docs/product/PRODUCT_REQUIREMENTS.md`
6. `docs/product/AI_BOUNDARIES.md`
7. `docs/product/DATA_MODEL.md`
8. `docs/product/KNOWLEDGE_BASE_SCHEMA.md`
9. `docs/product/RISK_REGISTER.md`

## Collaboration Rules

- Pascal decides what matters and confirms business facts.
- Claude Code makes scoped code/doc changes and updates session state.
- Codex reviews shipped increments before the next implementation push.
- No session should build more than one vertical slice unless Pascal explicitly says so.
- If product facts are missing, capture the gap. Do not invent policy, HR, legal, payroll, training, or compliance content.

## Core Artifacts

| File | Purpose |
|---|---|
| `CLAUDE_START_HERE.md` | Bootstrap prompt and working rules for Claude Code. |
| `SESSION_STATE.md` | Current status, next task, blockers, and session handoff. |
| `DECISION_LOG.md` | Append-only product and architecture decisions. |
| `CODEX_REVIEW_PROTOCOL.md` | How Codex should review each shipped slice. |
| `docs/product/*` | Product strategy, lifecycle map, data model, KB schema, AI boundaries, risks. |

