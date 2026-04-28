# Session State

Last updated: 2026-04-27 (Phase 0 hardening pass 2 closed)
Current phase: Phase 0 — Stabilize Current Prototype (awaiting Codex sign-off)
Current owner: Pascal sets priority; Claude Code implements; Codex reviews

## Awaiting

**Codex review #02.** Prompt ready for Pascal to paste into Codex:
`project_mgmt/CODEX_PROMPT_REVIEW_02_2026-04-27.md`

Codex review #01 was NEEDS_MINOR_FIXES. Session 02 reconciled all 6 P1/P2 findings.
Codex will write its verdict to `project_mgmt/CODEX_REVIEW_02_2026-04-27.md` and append to `SESSION_LOG.md`.

- If READY → Phase 0 closed. Move to Phase 1 (case management core).
- If NEEDS_MINOR_FIXES → next Claude session reconciles.
- If NEEDS_MAJOR_FIXES → stop and re-plan with Pascal.

## Current Goal

Get TeamChat AI to a launch-gated, audited Phase 0 baseline so Phase 1 (case management) can build on solid ground without revisiting auth, schema, or AI safety.

## Where to read history

- Per-session detail: `project_mgmt/SESSION_LOG.md` (newest at bottom).
- Architecture/product decisions: `project_mgmt/DECISION_LOG.md` (append-only).
- Codex verdicts: `project_mgmt/CODEX_REVIEW_NN_<date>.md`.
- Codex prompts (queued for Pascal to paste): `project_mgmt/CODEX_PROMPT_REVIEW_NN_<date>.md`.

This file (`SESSION_STATE.md`) is the live snapshot. It does not duplicate SESSION_LOG.md.

## Open Risks (going into Codex review #02)

| # | Risk | Owner | Status |
|---|---|---|---|
| 1 | Migrations 004 + 005 not yet applied to a Supabase project | Pascal | Decide staging vs prod, then run via supabase CLI or SQL editor |
| 2 | `PUBLIC_ACCESS_REQUEST_ENABLED` defaults to off (form returns 503) | Pascal | Must remain off until CAPTCHA + edge rate limit are wired |
| 3 | CAPTCHA vendor not chosen (Turnstile likely) | Pascal | Decision needed before any public launch of the access-request form |
| 4 | `labor_shifts` name-string lookup in `tool-handlers.ts` (P1, RISK_REGISTER) | Claude (when schedule tooling is touched) | Pre-existing, untouched this session |
| 5 | 4 lint warnings in pre-existing UI (set-state-in-effect, exhaustive-deps, ref cleanup) | Claude (when Phase 1 UI lands) | Demoted to warn in eslint config |
| 6 | Embedded Supabase service-role token visible in `~/.claude.json` (`claude mcp list` exposes it) | Pascal | Rotate + move to env var before any screen-share or repo audit |
| 7 | Embedded GitHub token in local git remote | Pascal | Outside Claude scope |
| 8 | KB metadata migration (PRD-0.6) not done | Claude (post Phase 0 close) | Schema design ready in `docs/product/KNOWLEDGE_BASE_SCHEMA.md` |

## Blockers / Questions For Pascal

- Which Supabase project to apply migrations 004 + 005 against (staging/prod)?
- CAPTCHA vendor pick: Turnstile (Cloudflare, free) recommended; confirm before public launch.
- Where is the source knowledge base stored (Notion, Drive, voice notes)? Needed before PRD-0.6 work has real content.
- Which restaurant role first for onboarding/training (server / kitchen helper)?
- Multi-tenant from day one or single-restaurant first?

## Next Recommended Claude Session

Branches based on Codex review #02 verdict:

**If READY (Phase 0 closed):**
- Phase 1 vertical slice — case management core. One employee flow + one manager flow + DB model + audit trail + tests.
- Replace the copy-email pattern with structured case records. `docs/product/PRODUCT_REQUIREMENTS.md` PRD-1.1/PRD-1.2 are the spec.

**If NEEDS_MINOR_FIXES:**
- Reconcile findings using `superpowers:receiving-code-review` first.
- Implement using `superpowers:subagent-driven-development` where parallel-safe.
- Verify with `superpowers:verification-before-completion`.

**Standing rule:** do not start onboarding/training UI yet. Phase 0 must be Codex-READY first.

## Methodology Note

This repo runs on the multi-session Claude/Codex ping-pong protocol documented in `CLAUDE.md` (root) and `AGENTS.md` (root). Both live in this repo so any agent picking up cold has the context.

Superpowers plugin (`obra/superpowers-marketplace`) installed Pascal-side this session — gives `subagent-driven-development`, `receiving-code-review`, `verification-before-completion`, `using-git-worktrees`, and others. Used in session 02 reconciliation.
