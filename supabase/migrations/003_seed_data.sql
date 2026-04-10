-- ============================================================
-- Seed data: Knowledge Base articles (sample HR policies)
-- ============================================================

INSERT INTO kk_knowledge_base (category, title, content, restaurant, role)
VALUES
  ('policy', 'Leave and Vacation Policy',
   'Employees accumulate vacation according to labor standards:
- Less than 1 year: 1 day per full month worked
- 1 to 3 years: 2 weeks (4% of gross salary)
- 3+ years: 3 weeks (6% of gross salary)

Request procedure:
1. Submit request via TeamChat AI or contact management
2. Minimum 2 weeks advance notice for planned leave
3. Holiday leave (December) requires 1 month advance notice
4. Priority given by seniority in case of date conflicts',
   NULL, NULL),

  ('policy', 'Tips - How It Works',
   'Tips are calculated and distributed weekly:
- Tips are collected daily
- Distribution is based on hours worked
- Calculation is done each Monday for the previous week
- Payment is included in paycheck or paid separately

To check your tips:
- Use the "My tips" button in TeamChat AI
- Or check the Tips page in the app

For questions about amounts, contact management via TeamChat AI.',
   NULL, NULL),

  ('procedure', 'Calling In Sick / Absence',
   'If you cannot report to work:
1. Notify as early as possible (minimum 2 hours before your shift)
2. Send a message via TeamChat AI or call the restaurant directly
3. If sick more than 3 consecutive days, a medical note may be required

Emergency numbers:
- Check the posting in each restaurant kitchen',
   NULL, NULL),

  ('benefits', 'Employee Meals',
   'Each employee is entitled to one meal per worked shift:
- The meal must be taken during your break
- Choose from the posted employee menu
- Alcoholic beverages are not included
- No takeout meals without manager approval',
   NULL, NULL),

  ('safety', 'Safety and Hygiene',
   'Essential rules:
- Mandatory handwashing before handling food and after each break
- Apron and closed-toe shoes required in the kitchen
- Report any accident or injury immediately
- Never lift heavy loads alone
- Know the location of emergency exits and first aid kit

In case of emergency:
1. Ensure immediate safety
2. Notify the manager or shift supervisor
3. Call emergency services if necessary (911)',
   NULL, NULL),

  ('policy', 'Dress Code',
   'Required attire:
- Restaurant t-shirt or uniform (provided)
- Long dark pants (no torn jeans)
- Non-slip closed-toe shoes
- Hair tied back in kitchen
- No dangling jewelry in kitchen

Uniform must be clean and in good condition. Report if you need a replacement.',
   NULL, NULL),

  ('procedure', 'Schedule Changes',
   'To request a schedule change:
1. Submit your request via TeamChat AI at least 1 week in advance
2. Management will evaluate the request based on restaurant needs
3. Shift swaps between colleagues are allowed with management approval

Availability:
- Permanent availability changes require 2 weeks notice
- Indicate your constraints (school, family, etc.) to facilitate planning',
   NULL, NULL)

ON CONFLICT DO NOTHING;
