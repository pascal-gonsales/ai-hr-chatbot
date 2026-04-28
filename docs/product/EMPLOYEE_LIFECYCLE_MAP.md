# Employee Lifecycle Map

This file maps the full employee journey from access request to exit interview. Every product feature should attach to one lifecycle stage.

## Stage 0 - Access Request / Preboarding

Employee situation:

- employee has been hired or invited,
- may not have an app account,
- may not be linked to payroll/tips/schedule systems,
- may not know what to prepare before first shift.

Employee jobs:

- request access,
- confirm identity/contact details,
- understand first shift basics,
- know where to go and who to ask for.

Manager jobs:

- create employee profile,
- link staff/payroll/tips/schedule identity,
- assign role/location,
- assign onboarding path,
- confirm start date and manager owner.

System objects:

- access request,
- employee profile,
- staff link,
- onboarding assignment,
- first-day checklist.

AI behavior:

- collect missing facts,
- explain next steps,
- never promise employment terms unless sourced,
- route missing setup to manager/admin.

## Stage 1 - Day 1 Onboarding

Employee jobs:

- understand restaurant basics,
- acknowledge required policies,
- complete first tasks,
- know immediate safety/hygiene rules,
- know how to ask questions,
- know who the manager is.

Manager jobs:

- verify presence,
- confirm role/location,
- sign off practical steps,
- resolve blockers.

System objects:

- onboarding checklist,
- required policy acknowledgement,
- training module completion,
- manager sign-off,
- blocker case.

AI behavior:

- guide one step at a time,
- explain policies from approved KB,
- translate in employee language,
- create cases for blockers,
- log completion with source/version.

## Stage 2 - Role Training

Employee jobs:

- learn station responsibilities,
- learn SOPs,
- practice role tasks,
- ask questions safely,
- complete knowledge checks,
- get manager sign-off.

Manager jobs:

- assign role path,
- verify practical skills,
- coach gaps,
- approve completion.

System objects:

- role,
- training path,
- module,
- lesson,
- SOP,
- quiz/check,
- practical sign-off,
- training progress.

AI behavior:

- answer from approved training content,
- show source and module,
- quiz/check understanding,
- create "needs manager help" case if blocked.

## Stage 3 - Probation / First 30-90 Days

Employee jobs:

- understand expectations,
- receive structured feedback,
- complete required training,
- raise concerns early.

Manager jobs:

- run check-ins,
- document coaching,
- decide next steps,
- assign extra training.

System objects:

- check-in,
- manager note,
- employee goal,
- training gap,
- follow-up case.

AI behavior:

- help prepare check-in questions,
- summarize sourced history,
- never evaluate employee performance on its own,
- keep manager-private and employee-visible records separated.

## Stage 4 - Daily HR Support

Employee jobs:

- ask policy questions,
- check tips/hours/schedule,
- request time off,
- report availability changes,
- request shift swap,
- raise pay/tip concerns,
- report operational blockers.

Manager jobs:

- triage requests,
- approve/deny/ask follow-up,
- maintain response time,
- keep records.

System objects:

- request case,
- status,
- urgency,
- owner,
- due date,
- employee timeline,
- manager response.

AI behavior:

- identify whether message is question, request, report, or urgent issue,
- use tools/source data before answering facts,
- create a case for formal requests,
- never state approval without manager action.

## Stage 5 - Sensitive Issues / Incidents

Employee jobs:

- report safety issue,
- report injury/accident,
- report harassment/discrimination concern,
- report threat or violence,
- report serious workplace concern.

Manager jobs:

- receive urgent signal,
- ensure immediate safety,
- document facts,
- involve proper human authority.

System objects:

- incident case,
- severity,
- immediate safety flag,
- witness/attachment records,
- manager acknowledgement,
- resolution notes.

AI behavior:

- collect facts gently,
- avoid conclusions or blame,
- give immediate safety routing for emergencies,
- create urgent manager case,
- do not give legal, medical, or disciplinary advice.

## Stage 6 - Growth / Role Change

Employee jobs:

- request more hours,
- request role change,
- ask about promotion path,
- complete additional training.

Manager jobs:

- define requirements,
- assign training,
- document decision.

System objects:

- growth request,
- target role,
- required modules,
- manager decision,
- progression status.

AI behavior:

- explain sourced requirements,
- help employee understand gaps,
- create manager-reviewed request,
- never promise promotion/pay.

## Stage 7 - Leave / Absence / Return

Employee jobs:

- call in sick,
- request leave,
- update availability,
- return to work.

Manager jobs:

- acknowledge absence,
- adjust schedule,
- document required info,
- approve/deny requests.

System objects:

- absence case,
- leave request,
- return-to-work note,
- schedule impact,
- manager decision.

AI behavior:

- collect structured facts,
- route to manager,
- explain approved policy if available,
- avoid legal/medical advice.

## Stage 8 - Offboarding

Employee jobs:

- understand final steps,
- return equipment/uniform,
- confirm final schedule/tips/pay questions,
- complete exit interview if offered.

Manager jobs:

- deactivate access,
- close open cases,
- confirm final checklist,
- capture exit feedback.

System objects:

- offboarding checklist,
- final-pay/tips inquiry case,
- equipment return,
- account deactivation,
- exit interview.

AI behavior:

- guide checklist,
- collect exit feedback with clear visibility rules,
- route final pay/tips questions to manager/admin,
- avoid legal advice.

## Lifecycle Design Rule

Every lifecycle stage must answer:

- What does the employee need now?
- What does the manager need to decide?
- What source does the AI rely on?
- What record must be kept?
- What is the next status?

