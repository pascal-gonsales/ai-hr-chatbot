-- ============================================================
-- Phase 3: Tips bridge, Knowledge Base, Quick Actions
-- ============================================================

-- 1. Add staff_id bridge on kk_employees
ALTER TABLE kk_employees
  ADD COLUMN IF NOT EXISTS staff_id UUID UNIQUE REFERENCES staff(id) ON DELETE SET NULL;

-- 2. Add urgency to email drafts
ALTER TABLE kk_email_drafts
  ADD COLUMN IF NOT EXISTS urgency TEXT DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'urgent'));

-- 3. kk_knowledge_base
CREATE TABLE IF NOT EXISTS kk_knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL DEFAULT 'general',
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  restaurant TEXT,  -- NULL = applies to all
  role TEXT,        -- NULL = applies to all roles
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_kk_knowledge_base_category ON kk_knowledge_base(category);
CREATE INDEX idx_kk_knowledge_base_active ON kk_knowledge_base(is_active) WHERE is_active = true;

-- 4. kk_quick_actions
CREATE TABLE IF NOT EXISTS kk_quick_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label_fr TEXT NOT NULL,
  label_en TEXT NOT NULL DEFAULT '',
  label_th TEXT NOT NULL DEFAULT '',
  prompt TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'general',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_kk_quick_actions_active ON kk_quick_actions(is_active, sort_order) WHERE is_active = true;

-- ============================================================
-- Helper function: get current staff_id from auth
-- ============================================================

CREATE OR REPLACE FUNCTION kk_current_staff_id()
RETURNS UUID AS $$
  SELECT staff_id FROM kk_employees
  WHERE auth_user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- SECURITY DEFINER function: get tips summary for current user
-- Uses the bridge kk_employees.staff_id -> tips tables
-- ============================================================

CREATE OR REPLACE FUNCTION kk_get_my_tips_summary()
RETURNS JSON AS $$
DECLARE
  _staff_id UUID;
  _result JSON;
BEGIN
  SELECT staff_id INTO _staff_id
  FROM kk_employees
  WHERE auth_user_id = auth.uid();

  IF _staff_id IS NULL THEN
    RETURN json_build_object('error', 'no_staff_link');
  END IF;

  SELECT json_build_object(
    'staff_id', _staff_id,
    'summary', (
      SELECT row_to_json(s)
      FROM tips_reconciliation_summary s
      WHERE s.employee_id = _staff_id
      LIMIT 1
    ),
    'weekly', (
      SELECT json_agg(row_to_json(w) ORDER BY w.week_start DESC)
      FROM (
        SELECT *
        FROM weekly_tips
        WHERE employee_id = _staff_id
        ORDER BY week_start DESC
        LIMIT 12
      ) w
    )
  ) INTO _result;

  RETURN _result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================
-- SECURITY DEFINER function: get recent schedule for current user
-- ============================================================

CREATE OR REPLACE FUNCTION kk_get_my_schedule()
RETURNS JSON AS $$
DECLARE
  _staff_id UUID;
  _staff_name TEXT;
  _result JSON;
BEGIN
  SELECT staff_id INTO _staff_id
  FROM kk_employees
  WHERE auth_user_id = auth.uid();

  IF _staff_id IS NULL THEN
    RETURN json_build_object('error', 'no_staff_link');
  END IF;

  -- Get staff name for labor_shifts lookup (uses name string, not FK)
  SELECT name INTO _staff_name
  FROM staff
  WHERE id = _staff_id;

  SELECT json_build_object(
    'staff_id', _staff_id,
    'recent_hours', (
      SELECT json_agg(row_to_json(h) ORDER BY h.period_start DESC)
      FROM (
        SELECT *
        FROM employee_hours
        WHERE employee_id = _staff_id
        ORDER BY period_start DESC
        LIMIT 6
      ) h
    ),
    'recent_shifts', (
      SELECT json_agg(row_to_json(s) ORDER BY s.date DESC)
      FROM (
        SELECT *
        FROM labor_shifts
        WHERE employee ILIKE '%' || _staff_name || '%'
        ORDER BY date DESC
        LIMIT 14
      ) s
    )
  ) INTO _result;

  RETURN _result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================
-- RLS on new tables
-- ============================================================

ALTER TABLE kk_knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE kk_quick_actions ENABLE ROW LEVEL SECURITY;

-- Knowledge base: everyone can read active entries, admin can manage
CREATE POLICY "kb_select_active" ON kk_knowledge_base
  FOR SELECT USING (is_active = true OR kk_is_admin());

CREATE POLICY "kb_insert_admin" ON kk_knowledge_base
  FOR INSERT WITH CHECK (kk_is_admin());

CREATE POLICY "kb_update_admin" ON kk_knowledge_base
  FOR UPDATE USING (kk_is_admin());

CREATE POLICY "kb_delete_admin" ON kk_knowledge_base
  FOR DELETE USING (kk_is_admin());

-- Quick actions: everyone can read active, admin can manage
CREATE POLICY "qa_select_active" ON kk_quick_actions
  FOR SELECT USING (is_active = true OR kk_is_admin());

CREATE POLICY "qa_insert_admin" ON kk_quick_actions
  FOR INSERT WITH CHECK (kk_is_admin());

CREATE POLICY "qa_update_admin" ON kk_quick_actions
  FOR UPDATE USING (kk_is_admin());

CREATE POLICY "qa_delete_admin" ON kk_quick_actions
  FOR DELETE USING (kk_is_admin());

-- ============================================================
-- Seed: 5 default quick actions
-- ============================================================

INSERT INTO kk_quick_actions (label_fr, label_en, label_th, prompt, icon, category, sort_order)
VALUES
  ('Mes pourboires', 'My tips', '', 'Show me my recent tips and current balance.', '', 'tips', 1),
  ('Mon horaire', 'My schedule', '', 'What are my recent work hours and upcoming shifts?', '', 'schedule', 2),
  ('Vacances / conge', 'Vacation / time off', '', 'I would like to request vacation or time off.', '', 'leave', 3),
  ('Mon role', 'My role', '', 'What are my functions and responsibilities in the restaurant?', '', 'info', 4),
  ('Signaler un probleme', 'Report an issue', '', 'I would like to report a problem or important situation.', '', 'escalation', 5)
ON CONFLICT DO NOTHING;
