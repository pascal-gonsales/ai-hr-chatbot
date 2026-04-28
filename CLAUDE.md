# TeamChat AI

AI-assisted employee lifecycle system for restaurant groups. Multi-session product program. Pascal owns priority and restaurant operations facts. Claude Code implements. Codex reviews independently.

## Bootstrap (read at the start of every session, in order)

1. `project_mgmt/SESSION_STATE.md` — current state, last session output, next task
2. `project_mgmt/SESSION_LOG.md` — one block per session, newest at bottom
3. Latest `project_mgmt/CODEX_REVIEW_*_<date>.md` if one exists since the last Claude session — reconcile findings BEFORE new work
4. `project_mgmt/DECISION_LOG.md` — append-only architecture/product decisions (read latest 5)
5. `project_mgmt/CLAUDE_START_HERE.md` — full operating rules
6. `docs/product/` — product source of truth (read what's relevant to your task)

## Standing rules

- AI is interface, not authority. See `docs/product/AI_BOUNDARIES.md`.
- Never invent HR policy, training content, legal/payroll-law/medical advice.
- Never use service role without explicit ownership re-authorization.
- Never modify unrelated files. One vertical slice or hardening batch per session.
- Every meaningful architecture/product decision is appended to `DECISION_LOG.md`.

## End-of-session protocol (non-negotiable)

Before reporting "done", every session ends with:

1. Update `project_mgmt/SESSION_STATE.md` (changed files, validation, open risks, next task).
2. Append a block to `project_mgmt/SESSION_LOG.md` (date + session id + what changed + next priority).
3. If the work is review-worthy, write `project_mgmt/CODEX_PROMPT_REVIEW_NN_<date>.md` so Pascal can paste it into Codex.
4. Append meaningful decisions to `project_mgmt/DECISION_LOG.md`.

## Ping-pong with Codex

```
Claude session N
  -> SESSION_STATE updated
  -> SESSION_LOG appended
  -> CODEX_PROMPT_REVIEW_NN_<date>.md generated
Pascal pastes prompt into Codex
Codex writes CODEX_REVIEW_NN_<date>.md back into project_mgmt/
Claude session N+1
  -> reads CODEX_REVIEW_NN_<date>.md FIRST
  -> reconciles findings into SESSION_STATE
  -> only then starts new work
```

The repo is the source of truth. Both Claude and Codex read it. Pascal does not have to repeat context.
