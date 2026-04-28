# Codex Review #03 — OSS Portfolio Polish + Public Demo + Skill v1.2 publish

**Date queued:** 2026-04-28
**Driving plan:** `~/CEO/job-hunt/SESSION_PLAN_OSS_PORTFOLIO_V2.md` Phase D
**Review scope:** Pascal's session 03 work across **two repos** (ai-hr-chatbot AND forensic-bookkeeping-pipeline). This is broader than prior reviews — please cover both repos in one verdict.

---

## What changed in this session

### Repo 1 — `ai-hr-chatbot` (`https://github.com/pascal-gonsales/ai-hr-chatbot`)

Commits to review (since `ec0602a Initial commit`):

1. `4c86a03 chore: bootstrap files + project_mgmt + product docs` — published CLAUDE.md, AGENTS.md, full project_mgmt/, full docs/product/ to public OSS. Documentation infrastructure made publicly visible.
2. `e451bc1 feat(phase0): Codex review #01 reconciliation pass 2` — committed the 9 files + migrations 004+005 + tests/ + admin route + vitest config + package-lock that closed the 6 P1/P2 findings from your prior review. **You already verified this work in review #01 reconciliation conceptually; this commit is the on-disk record.**
3. `51a947f ci: GitHub Actions workflow for lint + tsc + tests + build` — `.github/workflows/ci.yml`. **Note: CI is currently failing on `npm ci` due to platform-specific deps missing from `package-lock.json` (`@emnapi/runtime` Linux binary not in lock generated on macOS). Vercel deploys fine because Vercel uses `npm install`. Logged as risk #10 in SESSION_STATE.md, deferred to next session's hygiene PR.**
4. `9379f2e feat(demo): public /demo route with seeded read-only fixtures` — **PRIMARY REVIEW TARGET.**
5. `a75dda6 fix(demo): use claude-haiku-4-5-20251001 (current model)` — production route still uses deprecated `claude-sonnet-4-20250514` per Codex #02 scope, untouched.
6. `e44d642 docs(project_mgmt): session 03 log + state + 3 decisions` — record-keeping.
7. PR #1 `polish-readme-2026-04-28` — README rewrite (recruiter-facing). Open, awaiting Pascal merge.

### Repo 2 — `forensic-bookkeeping-pipeline` (`https://github.com/pascal-gonsales/forensic-bookkeeping-pipeline`)

Commits to review (since `0eb33d0 v1.1`):

1. `4cbc784 v1.2: Skill v1.2 published + anonymization fix + scripts hardening` — **PRIMARY REVIEW TARGET FOR REPO 2.**
2. `7ec3960 fix: include skill/ template CSVs (gitignore exception)` — followup commit to ship 6 CSV templates that the .gitignore `*.csv` rule had silently dropped from v1.2.

---

## Critical things to review

### A. Demo route security (ai-hr-chatbot, primary)

The new `/demo` route is publicly accessible without authentication. Verify:

1. **Auth bypass scope is correct.** `src/middleware.ts` matcher excludes `demo|api/demo` from the auth middleware. Path I'd like you to confirm: only `/demo*` and `/api/demo*` are exempt. `/`, `/login`, `/chat`, `/admin/*`, `/api/chat`, `/api/admin/*`, `/api/access-request` should ALL still hit the auth middleware. Test cases worth running:
   - GET /demo → 200 (no auth)
   - GET /demo/chat → 200 (no auth)
   - GET / → still redirects to /login (or /chat if authed)
   - GET /chat → still redirects to /login if unauth
   - GET /admin → still redirects to /login if unauth
   - POST /api/chat → still 401 if unauth
   - POST /api/admin/employees → still 401 if unauth
   - POST /api/demo/chat → 200 (no auth)

2. **Demo API does NOT touch the production DB.** `src/app/api/demo/chat/route.ts` does NOT import from `@/lib/supabase/*` and does NOT use `createClient()`. Tools route through `src/lib/demo/tool-handlers.ts` which only reads from `src/lib/demo/fixtures.ts`. Confirm no DB writes (no `INSERT`, no `UPDATE`, no `kk_*` table references).

3. **Write tools are stubbed.** `handleDraftEmail` in demo tool-handlers returns a string explaining what production would do; it does NOT create a `kk_email_drafts` row. Verify.

4. **No production credentials reachable from /demo.** The demo uses `ANTHROPIC_API_KEY` (a separate demo-scoped key Pascal created today). Vercel project `hanumets-projects/ai-hr-chatbot` has placeholder Supabase env vars, NOT the real Kaikido production credentials. Verify the demo cannot accidentally hit the real DB.

5. **Rate limit is bounded.** In-memory per-IP limit: 8 messages / minute. `max_tokens: 1024`. Max 5 tool iterations. `claude-haiku-4-5-20251001` (cheap). Consider whether the in-memory limit is meaningful at scale (per-instance, not per-deployment cluster), and whether anything else should bound abuse.

6. **Fixture data is genuinely fictional.** `src/lib/demo/fixtures.ts` has Sarah Chen at Le Bistro Demo, fake email `sarah.chen@bistro-demo.example`, fake `staff_id: 'demo-staff-001'`, fake employee UUID. Confirm no real-data leaks (employee names from real operations, real bank account numbers, real customer emails).

### B. Anonymization — both repos

This was the headline find this session: PII was discovered in pre-existing OSS code.

**ai-hr-chatbot:** Run an exhaustive PII grep across `src/`, `docs/`, `project_mgmt/`, `supabase/migrations/`, `tests/`, `README.md`, etc. The terms to scan for are debtor-specific identifiers Pascal has shared privately; I am not reproducing them in this public prompt. Confirm zero hits in active tracked files. The README.md author footer mentions Pascal by name with link to github — that's intended self-attribution, not a leak.

**forensic-bookkeeping-pipeline:** Same scan, excluding `legacy/` (v3.2 archive intentionally retains real names). Confirm the env-var refactor in `pipeline.py` and `pdf_parsers_v2.py` actually replaced ALL hardcoded names. Test that:
- `pipeline.py` with no env var: 85 rules, 1 trustee rule (generic only)
- `pipeline.py` with `TRUSTEE_NAME=Test`: 86 rules, 2 trustee rules (generic + named)
- `pdf_parsers_v2.py` with no env var: skip lists do NOT contain any cardholder name patterns
- `pdf_parsers_v2.py` with `CARDHOLDER_SKIP_STRINGS=A,B,C`: skip lists include A, B, C in the appropriate functions

Also confirm `skill/` directory is clean (it should be — it was copied from `~/.claude/skills/forensic-bookkeeping/` excluding the `legacy/` subfolder which has v3.2 PII).

### C. Skill v1.2 contents — forensic-bookkeeping-pipeline

The skill (Claude operating contract) is now public at `/skill/`. Review:

1. **Anti-drift rules (`skill/SKILL.md` §1).** Are they self-consistent and tight enough that a Claude reading them cold cannot drift into invention? Specifically: §1.1 (cite or stop), §1.2 (NEEDS_REVIEW default), §1.3 (no auto-split), §1.4 (no source-note modification), §1.7 (no invented insolvency facts).

2. **Routing boundaries (`skill/references/routing-boundaries.md`).** Pascal explicitly does not have a lawyer (consumer proposal active, relies on syndic + skill). The skill must NOT freelance on legal interpretation. Verify the routing language is conservative.

3. **Reusability across debtors.** The skill is anonymous by contract. Verify SKILL.md and references/ files contain no real names, no real entity references, no debtor-specific identifiers.

4. **Templates.** 10 CSV/MD templates at `skill/assets/templates/`. Confirm they have only column headers + sample placeholder rows (no real bank data, no real names).

### D. README rewrites — both repos

**ai-hr-chatbot** PR #1 (`polish-readme-2026-04-28`): Recruiter-facing rewrite. Verify:
- All claims source-traced
- "OSS vs gated" section accurately distinguishes OSS demo from Kaikido production
- Codex collaboration section links to ACTUAL files (CODEX_REVIEW_PROTOCOL.md, SESSION_STATE.md, SESSION_LOG.md, DECISION_LOG.md, CODEX_REVIEW_01_2026-04-27.md)
- No production credentials, no API keys, no customer data
- Setup instructions are accurate (Pascal verified `npm install` + `npm run dev` work locally; build needs placeholder env vars)

**forensic-bookkeeping-pipeline** README: v1.2 update referencing the published skill. Verify:
- Skill v1.2 callout is accurate (file paths exist; counts match: 6 reference guides, 10 templates of which 4 .md/.jsonl + 6 .csv)
- Migration note (TRUSTEE_NAME, CARDHOLDER_SKIP_STRINGS env var pattern) matches actual code behavior

---

## Validation Pascal already ran

- **ai-hr-chatbot:** lint (0 errors, 4 pre-existing UI warnings), tsc clean, npm test 7/7 pass, build (with placeholder env vars) compiles all 17+ routes including new demo routes. Demo end-to-end test confirmed real Claude tool use loop with fixture data (Sarah Chen tip balance query → tool_use → tool_result → text response → done).
- **forensic-bookkeeping-pipeline:** All Python imports OK. `pipeline.CATEGORY_RULES` count = 85 at OSS default, 86 with TRUSTEE_NAME set. `pdf_parsers_v2._CARDHOLDER_SKIP_STRINGS` parses env var correctly. PII scan returned 0 hits in active code (legacy/ excluded).

What Pascal did NOT verify (please flag if you think any matter):
- Did NOT run the synthetic tests (`tests/synthetic/test_validator_safety.py`) end-to-end — only confirmed they import.
- Did NOT apply migrations 004+005 to a Supabase database (still pending Pascal action per session 02 / Codex #02 scope).
- Did NOT run a real bank statement through the v1.2 pipeline (working copy at `~/CEO/forensic-bookkeeping/` should still produce identical output to v1.1 with `TRUSTEE_NAME` env var set to the real trustee name; not regression-tested).

---

## Verdict format

Please write your verdict to `project_mgmt/CODEX_REVIEW_03_2026-04-28.md` and append a `SESSION_LOG.md` block per the standard protocol. Use the same severity/area/finding/why/fix table format as Codex Review #01.

**Verdicts available:** READY / NEEDS_MINOR_FIXES / NEEDS_MAJOR_FIXES.

**Top concern from Pascal's side:** he wants to apply to Lightspeed + MTY tomorrow morning with this CV listing all 3 OSS repos as anchors. If anything in this review surfaces something that shouldn't be public yet (PII, security gap on /demo, leaky fixture, etc.), flag it as P1 so we can pull from the CV before applications go out.

---

## Files Pascal touched that you can SKIP (already in your scope or intentionally untouched)

- `src/app/api/chat/route.ts` (production chat route — under Codex #02 scope, not modified this session)
- `src/lib/tool-handlers.ts` (production handlers — under Codex #02 scope, not modified)
- `src/app/api/access-request/route.ts` (under Codex #02 scope)
- `src/lib/system-prompt.ts` (under Codex #02 scope; reused by demo but not modified)
- `supabase/migrations/004_phase0_hardening.sql`, `005_phase0_pass2.sql` (Codex #01 scope)
- `~/CEO/forensic-bookkeeping/` (working copy — intentionally retains real names per skill v1.2 anonymity rule "Local working files retain real names")
