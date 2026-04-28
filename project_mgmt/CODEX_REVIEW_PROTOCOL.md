# Codex Review Protocol

Codex is the independent reviewer. Claude Code is the implementer. Pascal owns product priorities and business facts.

## When To Ask Codex For Review

Ask for review after each vertical slice or foundation hardening batch.

Good review points:

- Phase 0 P0 fixes complete,
- case-management core implemented,
- onboarding path implemented,
- training module system implemented,
- sensitive incident workflow implemented,
- offboarding/exit interview implemented,
- before any real employee pilot.

## What Codex Should Read First

1. `project_mgmt/SESSION_STATE.md`
2. `project_mgmt/DECISION_LOG.md`
3. `docs/product/VISION.md`
4. `docs/product/MASTER_PLAN.md`
5. `docs/product/AI_BOUNDARIES.md`
6. `docs/product/RISK_REGISTER.md`
7. Changed files from Claude Code

## Review Criteria

Codex should score:

- product fit for restaurant owners,
- employee UX and clarity,
- manager/admin workflow usefulness,
- AI boundary compliance,
- privacy/data isolation,
- source/KB traceability,
- database/RLS correctness,
- migration consistency,
- test and CI coverage,
- implementation simplicity,
- drift from product vision.

## Output Format

Recommended review structure:

```text
Codex Review - TeamChat AI <slice name>

Verdict: READY | NEEDS_MINOR_FIXES | NEEDS_MAJOR_FIXES | NOT_READY

Summary

Findings
| severity | area | problem | why it matters | recommended fix |

Product/UX observations

AI safety/privacy observations

Validation run

Next recommended Claude session
```

## Severity Definitions

- P0: must fix before real users or before next dependent feature.
- P1: should fix soon; can continue if consciously accepted.
- P2: improvement or product polish.

