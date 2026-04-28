# Codex Review Prompt — Review #01 — Phase 0 Foundation Hardening
# Date: 2026-04-27
# Pasted into Codex by: Pascal

---

```
You are Codex, the independent reviewer for TeamChat AI.

Pascal is product owner. Claude Code is the implementer. You are the second pair of eyes. This is review #01 — Phase 0 foundation hardening, pass 1.

Read in order before reviewing:
1. AGENTS.md (repo root)
2. project_mgmt/SESSION_STATE.md (start here — has changed files + validation)
3. project_mgmt/SESSION_LOG.md (latest entry: 2026-04-27 session_01_phase0_hardening)
4. project_mgmt/DECISION_LOG.md (latest 5 entries dated 2026-04-27)
5. project_mgmt/CODEX_REVIEW_PROTOCOL.md (your protocol)
6. docs/product/AI_BOUNDARIES.md (safety contract)
7. docs/product/RISK_REGISTER.md
8. docs/product/IMPLEMENTATION_STANDARDS.md

Files Claude changed in this session:
- supabase/migrations/004_phase0_hardening.sql (NEW)
- src/app/api/chat/route.ts
- src/app/api/access-request/route.ts
- src/app/api/admin/access-requests/route.ts (NEW)
- src/lib/system-prompt.ts
- src/lib/types.ts
- package-lock.json (NEW)
- .github/workflows/ci.yml (NEW)

Your previous review (before this session) flagged:
- service-role data access needs stricter authorization
- access request schema mismatch (writing into kk_email_drafts which requires conversation_id and employee_id)
- migration drift around is_flagged
- public access-request endpoint has no abuse protection
- HR-sensitive AI boundaries need strengthening
- no lockfile, no tests, no CI

Verify each was addressed adequately AND look for new regressions Claude may have introduced.

Specific questions for you on this review:
1. /api/chat ownership guard: is the re-authorization sufficient? Any bypass paths (race conditions, side-effects in tools, error-leakage between authorized/unauthorized cases)?
2. /api/access-request rate limit: SQL-RPC + 3/hr per email + 10/hr per IP + 24h email dedupe. Is this an adequate first protective layer? What is the most likely abuse path that survives this? Should Turnstile/hCaptcha be required before any public launch?
3. Migration 004: does is_flagged add safely to existing rows on a populated DB? Does kk_access_requests RLS lock down public reads correctly? Does the SECURITY DEFINER rate-limit RPC have any privilege-escalation risk?
4. System prompt rewrite: does the new prompt narrow AI behavior enough vs AI_BOUNDARIES.md? Any boundary you would tighten further? Anything that could leak across employees?
5. CI: lint step is intentionally kept red because of pre-existing eslint-config-next flat-config bug. Agreed approach (visible failure), or should lint be removed/skipped + tracked elsewhere until fixed?
6. Anything Claude removed without justification? Any silent behavior change?
7. Privacy/data isolation: any new path where one employee's data could leak to another?

Validation Claude ran in this session:
- npm install: pass
- npx tsc --noEmit: pass
- NEXT_PUBLIC_SUPABASE_URL=... npm run build: pass; new /api/admin/access-requests route registered
- npm run lint: pre-existing failure (eslint-config-next flat-config bug; reproduced on a clean stash of Claude's changes — not introduced this session)

Migrations were NOT applied to a live database in this session. Treat that as "code review on intent" not "live verification".

Output your review as a new file at:
  project_mgmt/CODEX_REVIEW_01_2026-04-27.md

Use the format from project_mgmt/CODEX_REVIEW_PROTOCOL.md:
- Verdict: READY | NEEDS_MINOR_FIXES | NEEDS_MAJOR_FIXES | NOT_READY
- Summary
- Findings table | severity | area | problem | why it matters | recommended fix |
- Product/UX observations
- AI safety/privacy observations
- Validation run (what you actually checked vs. what you only read)
- Next recommended Claude session (one tight scope, not a wishlist)

After writing the review file, append one entry to project_mgmt/SESSION_LOG.md following the existing block format:
  ## 2026-04-27 HH:MM — codex — review_01_phase0_hardening
  with What changed / Verdict / Top 3 findings / Next session priority.

End your final chat message to Pascal with verdict + top 3 findings so he can decide whether to dispatch the next Claude session.
```

---

## How to use this prompt

1. Open Codex CLI in this repo: `cd ~/CEO/job-hunt/repos/ai-hr-chatbot && codex`.
2. Paste the block above (between the ``` fences).
3. When Codex finishes, it will have written `project_mgmt/CODEX_REVIEW_01_2026-04-27.md` and appended to `project_mgmt/SESSION_LOG.md`.
4. Read Codex's verdict in chat. Decide: dispatch next Claude session, or push back.
5. Next Claude session: launch with `claude` from the repo. Claude auto-reads `CLAUDE.md` and reconciles findings before doing new work.
