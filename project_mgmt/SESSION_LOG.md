---
type: source
created: 2026-04-27
purpose: Append-only chronological log of every Claude/Codex/Pascal session touching this repo. Past sessions are evidence; never delete.
---

# SESSION LOG — append-only

> Format: append a `## YYYY-MM-DD HH:MM — actor — session_id` block at the END of each session.
> Actor: `claude` | `codex` | `pascal`. Newest at bottom. Never delete past entries.

---

## 2026-04-27 — claude — session_01_phase0_hardening

**What changed:**
- supabase/migrations/004_phase0_hardening.sql NEW (is_flagged column, kk_access_requests table + RLS, rate-limit RPC, updated_at trigger)
- src/app/api/chat/route.ts — UUID validation + ownership guard before any service-role read/write on conversation_id
- src/app/api/access-request/route.ts — rewritten to write to kk_access_requests; per-email/per-IP rate limit + 24h dedupe via SQL RPC
- src/app/api/admin/access-requests/route.ts NEW — admin GET/PATCH for review queue
- src/lib/system-prompt.ts — rewritten around docs/product/AI_BOUNDARIES.md
- src/lib/types.ts — AccessRequest interface
- package-lock.json NEW (376 packages, npm 11.6.2 / node 24.13.0)
- .github/workflows/ci.yml NEW — install / lint / typecheck / build

**Decisions logged in DECISION_LOG.md:**
- Access requests get their own table, not email drafts
- Public access-request abuse protection: SQL-first
- Conversation ownership re-authorized before service-role use
- System prompt rewritten around AI_BOUNDARIES
- Lockfile + CI added, lint deferred (pre-existing eslint-config-next bug)

**Validation:**
- npm install: pass
- npx tsc --noEmit: pass
- npm run build: pass (new admin route registered)
- npm run lint: pre-existing failure (eslint-config-next flat-config bug, reproduced on stash)

**Open at end of session:**
- Lint config bug must be fixed before CI is green
- Migration 004 not yet applied to a Supabase project
- Tests not added; deferred to next session
- KB metadata migration (PRD-0.6) deferred

**Next session priority:**
1. Fix eslint-config-next flat-config so CI lint passes
2. Add test scaffolding + 2 integration tests (chat 403 cross-employee, access-request 429)
3. KB metadata migration schema only

**Codex review prompt:** `project_mgmt/CODEX_PROMPT_REVIEW_01_2026-04-27.md`

**Files NOT touched this session:**
- src/lib/tool-handlers.ts (labor_shifts name-string lookup is P1, deferred)
- src/components/* (UI untouched)
- Other admin routes
- Existing migrations 001-003

---

## 2026-04-27 18:15 — claude — session_02_phase0_pass2_codex_reconciliation

**What changed:**
- supabase/migrations/005_phase0_pass2.sql NEW — RPC search_path + REVOKE EXECUTE FROM PUBLIC/anon/authenticated, GRANT service_role; partial UNIQUE index on (lower(email)) WHERE status='pending' for atomic dedupe.
- src/app/api/access-request/route.ts — added PUBLIC_ACCESS_REQUEST_ENABLED env launch gate (default disabled, returns 503); replaced count-then-insert with INSERT + ON CONFLICT (23505 = soft success).
- src/app/api/chat/route.ts — error redaction (generic message to client, console.error server-side); removed pre-fetched tips/hours block (tools are the only authoritative source).
- src/lib/tool-handlers.ts — error redaction in draft_email_to_management.
- src/lib/system-prompt.ts — removed prefetched tips/hours from prompt; added explicit "refetch with the tool when asked, even if seen earlier" rule.
- src/app/api/admin/access-requests/route.ts — convert action requires converted_employee_id, validates target employee exists; redacted update error; added converted_employee_id to action log.
- eslint.config.mjs — replaced FlatCompat with direct flat-config import from eslint-config-next; demoted react-hooks/set-state-in-effect to warn (brand-new v7 rule, common false-positives, backlog item).
- vitest.config.ts NEW — Node env, @ alias to src/.
- tests/api/chat-ownership.test.ts NEW — 2 tests (cross-employee 403, malformed UUID 400).
- tests/api/access-request.test.ts NEW — 5 tests (launch-gate 503, rate-limit 429, invalid email 400, happy-path 200, unique_violation soft success).
- package.json — added test/test:watch scripts; vitest + @vitest/ui devDeps.
- .github/workflows/ci.yml — added Test step between Typecheck and Build.

**Decisions logged in DECISION_LOG.md:**
- Public access-request fail-closed via env var
- Atomic dedupe via UNIQUE partial index instead of TOCTOU count
- Definer-RPC hardening pattern for all SECURITY DEFINER functions going forward
- Tools are the only source of truth for employee data (no pre-fetched values in prompt)
- react-hooks v7 set-state-in-effect downgraded to warn (backlog when UI is touched)

**Validation (fresh, this session):**
- npm run lint: exit 0 (0 errors, 4 warnings — all pre-existing UI react-hooks)
- npx tsc --noEmit: exit 0 (clean)
- npm test: 7/7 pass
- npm run build: exit 0 (all 17 routes compile)

**Codex review #01 reconciliation:**
- P1.1 RPC lockdown: ✅ migration 005
- P1.2 public abuse path: ✅ launch gate + atomic dedupe (CAPTCHA still required before PUBLIC_ACCESS_REQUEST_ENABLED=1)
- P1.3 CI red + no tests: ✅ lint green + 7 tests + CI test step
- P2.1 raw error leakage: ✅ redacted in chat route + tool-handlers + admin route
- P2.2 prompt source discipline: ✅ removed prefetched values, added refetch rule
- P2.3 admin convert validation: ✅ converted_employee_id required + employee existence verified

**Open at end of session:**
- Migration 005 not yet applied to a Supabase database (needs Pascal's go on staging vs prod).
- CAPTCHA (Turnstile/hCaptcha) still required before PUBLIC_ACCESS_REQUEST_ENABLED=1 in production.
- Pre-existing P1: labor_shifts name-string lookup in tool-handlers.ts (untouched, will fix when schedule tooling is touched).
- Pre-existing P2: 4 lint warnings (set-state-in-effect, exhaustive-deps, ref cleanup) in UI components — backlog when Phase 1 UI lands.
- Embedded Supabase service-role token visible in `claude mcp list` output (~/.claude.json) — Pascal action outside this repo.

**Next session priority:**
1. Pascal applies migrations 004 + 005 to staging Supabase.
2. Decide CAPTCHA vendor (Turnstile likely) and wire it before launch gate flips.
3. Phase 1 case management core (replace copy-email pattern with structured cases) — first vertical slice.

**Codex review prompt:** `project_mgmt/CODEX_PROMPT_REVIEW_02_2026-04-27.md`

**Files NOT touched this session:**
- src/components/* (UI untouched per scope)
- Other admin routes
- tool-handlers labor_shifts lookup
- Existing migrations 001-004

---

## 2026-04-27 17:48 — codex — review_01_phase0_hardening

**What changed:**
- Wrote `project_mgmt/CODEX_REVIEW_01_2026-04-27.md`.
- Reviewed Phase 0 hardening changes against the prompt, product safety docs, migrations, route code, tool handlers, and CI config.
- Ran local validation: `npx tsc --noEmit` pass; `npm run lint` fails with documented ESLint/Next circular JSON error; `npm run build` passes with placeholder env vars and network allowed for Google Fonts.

**Verdict:**
- NEEDS_MINOR_FIXES

**Top 3 findings:**
1. `kk_access_request_recent_counts` is a `SECURITY DEFINER` RPC without explicit execute restrictions or fixed `search_path`; lock it to service role and harden the function.
2. The public access-request endpoint has a reasonable first internal rate limit, but public launch still needs Turnstile/hCaptcha or equivalent plus trusted IP/edge enforcement.
3. CI is intentionally red at lint and there are no tests for the exact ownership/rate-limit fixes; next session should make CI green and add those tests.

**Next session priority:**
1. Harden the access-request RPC.
2. Fix ESLint/CI and add the two security-path tests.
3. Add or explicitly gate CAPTCHA/Turnstile before public access-request launch.

---
