# Session State

Last updated: 2026-04-28 (Session 03 — OSS portfolio polish + public demo deploy)
Current phase: Phase 0 — Stabilize Current Prototype + Recruiter Portfolio Polish
Current owner: Pascal sets priority; Claude Code implements; Codex reviews

## Awaiting

**Codex review #02** (queued from session 02): `project_mgmt/CODEX_PROMPT_REVIEW_02_2026-04-27.md`. Reviews the Phase 0 hardening pass 2 reconciliation of Codex review #01. Verdict pending Pascal pasting prompt into Codex.

**Codex review #03** (NEW, queued from this session 03 in Phase D of `~/CEO/job-hunt/SESSION_PLAN_OSS_PORTFOLIO_V2.md`): will be written at `project_mgmt/CODEX_PROMPT_REVIEW_03_2026-04-28.md` covering:
- Public `/demo` route security (auth bypass scope, fixture isolation, no DB writes, rate limit)
- README polish (PR #1) — anti-invention, OSS-vs-gated boundary
- Repo-wide anonymization (now that project_mgmt + docs/product are public)
- ANTHROPIC_API_KEY_DEMO scope (separate key, separate Vercel project)

## Current Goal

Two parallel goals:

1. **TeamChat AI Phase 0 → Phase 1.** Same as before. Awaiting Codex #02 verdict before moving to case management core.
2. **OSS portfolio polish for CV anchoring.** This session ships the OSS repo as a recruiter-facing artifact: live demo URL, polished README, public Codex collaboration record. Goal is CV-ready by end of day so Pascal can apply to Lightspeed + MTY tomorrow morning.

## Public deployment (NEW this session)

- **OSS Vercel project:** `hanumets-projects/ai-hr-chatbot`
- **Production URL:** `https://ai-hr-chatbot-one.vercel.app/`
- **Public demo:** `https://ai-hr-chatbot-one.vercel.app/demo` and `/demo/chat` (no auth, real Claude tool use, fixture data)
- **Env vars on Vercel:** ANTHROPIC_API_KEY (real, demo-scoped key), NEXT_PUBLIC_SUPABASE_URL/_ANON_KEY/_SERVICE_ROLE_KEY (placeholders only — production routes won't actually function on this OSS deploy, which is correct per OSS-vs-gated split)
- **Cost guardrails on demo:** in-memory per-IP rate limit (8 msg/min), max_tokens 1024, max 5 tool iterations, Haiku 4.5 model (~$0.02/conversation)

The Kaikido production deployment (gated, paying customers) remains separate. Not in this repo.

## Where to read history

- Per-session detail: `project_mgmt/SESSION_LOG.md` (newest at bottom).
- Architecture/product decisions: `project_mgmt/DECISION_LOG.md` (append-only).
- Codex verdicts: `project_mgmt/CODEX_REVIEW_NN_<date>.md`.
- Codex prompts (queued for Pascal to paste): `project_mgmt/CODEX_PROMPT_REVIEW_NN_<date>.md`.

## Open Risks

| # | Risk | Owner | Status |
|---|---|---|---|
| 1 | Migrations 004 + 005 not yet applied to a Supabase project | Pascal | Decide staging vs prod |
| 2 | `PUBLIC_ACCESS_REQUEST_ENABLED` defaults to off (form returns 503) | Pascal | Must remain off until CAPTCHA + edge rate limit |
| 3 | CAPTCHA vendor not chosen (Turnstile likely) | Pascal | Decision needed before public launch |
| 4 | `labor_shifts` name-string lookup in `tool-handlers.ts` (P1, RISK_REGISTER) | Claude (when schedule tooling is touched) | Pre-existing |
| 5 | 4 lint warnings in pre-existing UI | Claude (when Phase 1 UI lands) | Demoted to warn |
| 6 | Embedded Supabase service-role token visible in `~/.claude.json` | Pascal | Rotate + move to env var |
| 7 | Embedded GitHub token in local git remote | Pascal | Outside Claude scope |
| 8 | KB metadata migration (PRD-0.6) not done | Claude (post Phase 0 close) | Schema design ready |
| 9 | **NEW:** Production chat route uses deprecated model `claude-sonnet-4-20250514`. Demo route fixed to `claude-haiku-4-5-20251001`. Production not touched (Codex #02 scope). | Claude (post Codex #02 verdict) | Will fix in Phase 0 follow-up or Phase 1 |
| 10 | **NEW:** CI workflow on GitHub fails at `npm ci` due to platform-specific deps missing from `package-lock.json` (`@emnapi/runtime` Linux binary). Vercel build works because Vercel uses `npm install`. | Claude (next session) | Run `npm install --include=optional` locally to regenerate lock |

## Blockers / Questions For Pascal

- Which Supabase project to apply migrations 004 + 005 against?
- CAPTCHA vendor pick: Turnstile?
- Where is the source knowledge base stored?
- Which restaurant role first for onboarding/training?
- Multi-tenant from day one or single-restaurant first?
- **NEW:** Merge PR #1 (README polish) once reviewed?
- **NEW:** Want a custom domain on the OSS demo (e.g. `demo.wwithai.com` once wwithai.com is set up) instead of `ai-hr-chatbot-one.vercel.app`?

## Next Recommended Claude Session

If Codex #02 returns READY:
- Move to Phase 1 (case management vertical slice)
- Fix risk #9 (model ID) and risk #10 (CI lock file) as a small hygiene PR before Phase 1 starts.

If Codex #02 returns NEEDS_MINOR_FIXES:
- Reconcile findings as session 04.
- Risk #9 + #10 batched in.

If Codex #03 (this session's review) flags issues:
- Reconcile per `SESSION_PLAN_OSS_PORTFOLIO_V2.md` Phase E.

**Standing rule:** do not start onboarding/training UI yet. Phase 0 must be Codex-READY first.

## Methodology Note

This repo runs on the multi-session Claude/Codex ping-pong protocol documented in `CLAUDE.md` (root) and `AGENTS.md` (root). Both live in this repo so any agent picking up cold has the context.

Superpowers plugin (`obra/superpowers-marketplace`) installed Pascal-side; available skills include `subagent-driven-development`, `receiving-code-review`, `verification-before-completion`, `using-git-worktrees`.
