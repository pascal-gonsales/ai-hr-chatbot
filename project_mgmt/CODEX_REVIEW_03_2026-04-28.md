# Codex Review - OSS Portfolio Polish + Public Demo + Skill v1.2

Verdict: NEEDS_MAJOR_FIXES

> Redaction note: this review intentionally does not reproduce sensitive names or private identifiers. Where a finding concerns leaked identifiers, inspect the referenced file and line locally.

## Summary

Do not use the current public state as a CV anchor yet. The `/demo` implementation is mostly well isolated from production data, and the forensic skill itself is directionally strong, but both repos currently expose or preserve case-specific identifiers in public-tracked files.

The top issue is not code quality. It is public legitimacy and confidentiality: the repos claim anonymization while tracked files still contain sensitive names, regex-shaped real names, supplier names, local paths, card suffixes, and review-prompt deny-list terms.

## Findings

| severity | area | problem | why it matters | recommended fix |
|---|---|---|---|---|
| P1 | `ai-hr-chatbot` public PII | `project_mgmt/CODEX_PROMPT_REVIEW_03_2026-04-28.md:56`, `:62`, and `:107` repeat the exact sensitive terms the prompt asks Codex to scan for, including real restaurant/person terms and a trustee-name env example. | This file is tracked on `main`. If pushed public, the repo itself becomes the leak. | Redact review prompts before publishing. If already public, a normal delete commit is not enough; rewrite history or recreate the repo before using it in applications. |
| P1 | `forensic-bookkeeping-pipeline` anonymization | Active tracked code still contains real or case-shaped identifiers: `parsers.py:654` and `:657` contain original-entity regex fragments; `test_parsers.py:207`, `:213`, and `:219` contain absolute local fixture paths with account/card suffixes; `docs/cc-reconciliation-methodology.md:13` repeatedly names a source spreadsheet owner. | Exact-string grep missed regex-shaped names and case fingerprints. The public repo still carries identifiable traces. | Replace all case identifiers with neutral placeholders, including regex fragments, fixture paths, doc examples, card suffixes, and named humans. Then rerun broader scans, not only exact-name scans. |
| P1 | `forensic-bookkeeping-pipeline` public claims | `README.md:98` says all entity names, account numbers, supplier names, and personal identifiers are anonymized, but supplier and entity names remain across active code, docs, and tests. | This is a credibility issue for a public CV repo. Reviewers can see the anonymization claim is false. | Either fully anonymize or narrow the claim to what is actually anonymized. Prefer full anonymization before applications. |
| P1 | Public demo abuse bound | `src/app/api/demo/chat/route.ts:62` limits `message` to 2000 chars but accepts up to 20 arbitrary client-supplied history entries without per-entry or total size caps before calling Anthropic. Rate limiting is in-memory and header-keyed at `:18-42`. | `max_tokens` caps output, not input. A public demo can still be driven into high prompt-token cost or memory pressure. | Cap request body/history length, validate roles/content types, consider dropping client history, and use durable edge/server rate limiting keyed from trusted platform IP metadata. |
| P2 | Middleware matcher | `src/middleware.ts:12` excludes any path beginning with `demo` or `api/demo`, not only `/demo` and `/api/demo` path segments. | Future paths like `/demo-admin` or `/api/demo-metrics` would bypass middleware unexpectedly. | Anchor the matcher to `demo(?:/|$)` and `api/demo(?:/|$)`. |
| P2 | Forensic tests | `tests/synthetic/test_validator_safety.py:38` validates a local `~/.claude` skill directory instead of repo-local `skill/`; `.github/workflows/test.yml:16` only runs `python test_parsers.py`. | The public repo's synthetic safety tests are not actually protecting the published skill on a fresh clone. | Point tests to `REPO_ROOT / "skill"` and run synthetic tests in CI. |
| P2 | README accuracy | `forensic-bookkeeping-pipeline/README.md:37` and `CHANGELOG.md:18` say 10 templates; tracked `skill/assets/templates/` has 11 files. | Small, but visible documentation drift in a portfolio repo. | Update the count/list or remove the extra template if unintended. |

## Positive Confirmations

- `ai-hr-chatbot` demo DB isolation looks good at the code level: `src/app/api/demo/chat/route.ts` and `src/lib/demo/*` do not import Supabase or call `createClient()`.
- The demo write tool is a stub, not a DB write.
- Fixture data in `src/lib/demo/fixtures.ts` is fictional.
- The README polish branch links to actual `project_mgmt` files and does not contain credentials or customer data in the checked README content.
- `forensic-bookkeeping-pipeline` env behavior matched the prompt:
  - no env: `pipeline.CATEGORY_RULES` = 85, trustee-category rules = 1
  - `TRUSTEE_NAME=Test`: `pipeline.CATEGORY_RULES` = 86, trustee-category rules = 2
  - no env: `pdf_parsers_v2._CARDHOLDER_SKIP_STRINGS` = `[]`
  - `CARDHOLDER_SKIP_STRINGS=A,B,C`: skip strings parse as `['A', 'B', 'C']`
- The forensic `skill/` directory itself is much cleaner than the root pipeline/docs. Its anti-drift and routing rules are conservative.
- `skill/references/` contains 6 files.
- `skill/assets/templates/` contains 11 files, not the documented 10.

## Product/UX Observations

- The `/demo` route is the right portfolio shape: it proves real streaming tool use while avoiding customer data.
- The demo copy is clear that it is read-only fixture mode.
- The current in-memory chat history is fine for UX, but server-side acceptance of arbitrary client history should be bounded before broad public traffic.

## AI Safety/Privacy Observations

- Demo tools only read fixture data and the email-draft tool is correctly stubbed.
- The most important safety issue is repo hygiene, not runtime isolation: audit prompts and forensic docs/code currently leak the identifiers the public repos are trying to prove have been removed.
- The forensic skill's routing language is appropriately conservative. It does not assume the debtor has a lawyer and routes legal/tax/strategy decisions to the trustee, qualified accountant, or qualified counsel.

## Validation Run

Actually checked:

- Read the review prompt, prior Codex review format, session log, middleware, demo API route, demo fixtures, demo UI, README polish branch, forensic README, forensic skill, forensic routing reference, parser/classifier files, tests, and workflows.
- Ran targeted PII/secret scans across both repos.
- Ran `python3 -B tests/synthetic/test_validator_safety.py` in `forensic-bookkeeping-pipeline`: 10/10 cases passed. Caveat: the template-mode case validates local `~/.claude/skills/...`, not repo-local `skill/`.
- Ran `python3 -B test_parsers.py` in `forensic-bookkeeping-pipeline`: exit 0, but only the smoke test ran; 7 parser fixture tests skipped.
- Verified both working trees were clean before writing this local review file.

Not verified:

- Did not apply Supabase migrations 004/005.
- Did not inspect Vercel environment values directly; DB isolation conclusion is from code imports/call graph.
- Did not run the Next.js demo end-to-end in browser during this review.
- Did not run a real bank statement through the v1.2 pipeline.

## Answers To Review Questions

- Auth bypass scope: the intended paths are exempt, but the middleware matcher is prefix-based. Fix before extending route names.
- Demo API DB isolation: confirmed at code level. No Supabase imports or DB calls in demo route/handlers.
- Write tools: confirmed stubbed.
- Production credentials reachable from `/demo`: no Supabase usage in demo code path; could not verify live Vercel env directly.
- Rate limit: bounded but weak. Per-instance, header-keyed, and no input-history budget.
- Fixture data: fictional in demo files.
- Anonymization: not clean. The review prompt in `ai-hr-chatbot` and active root/docs/tests in `forensic-bookkeeping-pipeline` still contain public-case identifiers or fingerprints.
- Skill v1.2: anti-drift and routing rules are strong. The skill itself appears anonymized in the narrow scan, but the surrounding repo is not.
- README rewrites: `ai-hr-chatbot` README PR is mostly accurate; forensic README has anonymization and template-count drift.

## Next Recommended Claude Session

One tight scope before applications:

1. Redact or remove sensitive terms from `project_mgmt/CODEX_PROMPT_REVIEW_03_2026-04-28.md`. If already pushed public, handle GitHub history/repo cleanup before using the repo in CV materials.
2. Fully anonymize `forensic-bookkeeping-pipeline` active code/docs/tests. Treat regex fragments, supplier names, local absolute paths, card/account suffixes, source-owner names, and doc examples as sensitive.
3. Fix demo input-budget abuse: cap history count, per-message length, total history chars/tokens, and request body size; optionally ignore client-supplied history.
4. Point forensic synthetic tests at repo-local `skill/` and run them in CI.
5. Correct README/template counts and anonymization claims.
