# Knowledge Base Schema And Extraction Plan

Pascal has strong operational knowledge. The product must preserve that knowledge as source-controlled, versioned, reviewable content instead of burying it inside prompts.

## Objective

Convert restaurant operating knowledge into structured knowledge objects that the AI can cite and workflows can enforce.

## Content Types

| Type | Purpose | Examples |
|---|---|---|
| Policy | Rules employees must follow or can rely on | vacation, sick calls, uniform, meals, lateness |
| SOP | How to perform work | opening bar, closing kitchen, cashout, hygiene |
| Training module | Guided learning unit | day 1 basics, server basics, kitchen safety |
| Checklist | Completion steps | onboarding checklist, offboarding checklist |
| Script | Suggested wording | greeting table, answering phone, complaint response |
| FAQ | Repeated question and approved answer | tips timing, schedule posting, staff meal |
| Escalation rule | When to route urgently | injury, harassment report, threat |
| Role expectation | What a role owns | server, busser, bartender, cook, manager |
| Form template | Structured data capture | time-off request, incident report |

## Required Metadata

Every KB/training item should eventually carry:

| Field | Meaning |
|---|---|
| `id` | stable identifier |
| `type` | policy/SOP/training/checklist/script/FAQ/escalation/role/form |
| `title` | human title |
| `summary` | 1-3 sentence plain-language summary |
| `content` | approved content |
| `restaurant_scope` | all or specific restaurant/location |
| `role_scope` | all or specific roles |
| `language` | source language |
| `jurisdiction` | if legal/regulatory sensitivity exists |
| `owner` | accountable person/team |
| `review_status` | draft/reviewed/approved/deprecated |
| `reviewed_by` | human reviewer |
| `reviewed_at` | date reviewed |
| `effective_from` | when content applies |
| `effective_to` | optional end date |
| `version` | semantic or date version |
| `source_type` | Pascal knowledge, law/regulation, vendor doc, internal SOP, manager decision |
| `source_locator` | file/path/URL/conversation/date |
| `risk_level` | low/medium/high/critical |
| `ai_allowed` | yes/no; whether AI can answer from it |
| `requires_human_decision` | yes/no |

## AI Answer Rules

The AI may answer from KB only when:

- item is active/approved or explicitly allowed for draft/internal testing,
- item applies to employee restaurant/role,
- item is not expired,
- item has source metadata,
- item does not require human decision.

If the KB has conflicting entries:

- do not choose one silently,
- create KB conflict task,
- route to admin/Pascal.

If no KB entry matches:

- say the answer is not in the approved knowledge base,
- offer to create a manager/admin question.

## Extraction Workflow For Claude Code

Claude should not "summarize everything into code." It should build an inventory first.

### Step 1 - Source Inventory

Create a table of every source Pascal provides:

| source_id | path_or_location | content_type | owner | language | status | notes |
|---|---|---|---|---|---|---|

### Step 2 - Principle Extraction

For each source, extract:

- operational principle,
- applicable role/location,
- employee-facing wording,
- manager-facing rule,
- AI boundary,
- required data fields,
- open questions.

### Step 3 - Normalize Into KB Items

Map extracted content to the metadata schema above.

### Step 4 - Identify Workflow Objects

For each KB item, ask:

- is this just an answer,
- or does it require a checklist,
- or does it create a case,
- or does it require manager sign-off,
- or does it belong in training?

### Step 5 - Pascal Review

Anything that could affect pay, employment status, discipline, legal obligations, safety, harassment, leave, termination, or accommodation must be marked `needs_pascal_review` until confirmed.

## Suggested Database Direction

Eventually replace the current simple `kk_knowledge_base` table with:

- `kb_sources`
- `kb_items`
- `kb_item_versions`
- `kb_item_scopes`
- `training_modules`
- `training_lessons`
- `training_assignments`
- `training_completions`
- `case_templates`
- `workflow_templates`

Do this after Phase 0 hardening unless Pascal explicitly prioritizes KB infrastructure first.

