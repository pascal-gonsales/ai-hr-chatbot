-- ============================================================
-- External / pre-existing source tables (minimal stubs)
--
-- In production these tables are owned by the tips + scheduling pipeline and
-- already exist in the database. The kk_ schema (migration 002) and the tool
-- handlers read from them via the kk_employees.staff_id bridge. This stub
-- migration creates just enough structure for a clean rebuild to resolve the
-- foreign keys and the tips/schedule tools. Adapt to your real source schema.
-- ============================================================

-- Staff roster. kk_employees.staff_id references staff(id).
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  restaurant_id TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Per-staff tips reconciliation summary. employee_id = staff.id.
CREATE TABLE IF NOT EXISTS tips_reconciliation_summary (
  employee_id UUID PRIMARY KEY REFERENCES staff(id) ON DELETE CASCADE,
  total_owed NUMERIC NOT NULL DEFAULT 0,
  total_paid NUMERIC NOT NULL DEFAULT 0,
  balance NUMERIC NOT NULL DEFAULT 0,
  weeks_count INTEGER,
  first_week DATE,
  last_week DATE
);

-- Weekly tips detail. employee_id = staff.id.
CREATE TABLE IF NOT EXISTS weekly_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE,
  mon NUMERIC DEFAULT 0,
  tue NUMERIC DEFAULT 0,
  wed NUMERIC DEFAULT 0,
  thu NUMERIC DEFAULT 0,
  fri NUMERIC DEFAULT 0,
  sat NUMERIC DEFAULT 0,
  sun NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  restaurant TEXT
);

CREATE INDEX IF NOT EXISTS idx_weekly_tips_employee ON weekly_tips(employee_id, week_start DESC);

-- Per-period hours summary. employee_id = staff.id.
CREATE TABLE IF NOT EXISTS employee_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES staff(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE,
  normal_hours NUMERIC DEFAULT 0,
  overtime_hours NUMERIC DEFAULT 0,
  total_hours NUMERIC DEFAULT 0,
  restaurant_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_employee_hours_employee ON employee_hours(employee_id, period_start DESC);

-- Labor shifts, keyed on the employee name string (not an FK), matched via ILIKE.
CREATE TABLE IF NOT EXISTS labor_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee TEXT NOT NULL,
  date DATE NOT NULL,
  position TEXT,
  shift_start TEXT,
  shift_end TEXT,
  total_hours NUMERIC DEFAULT 0,
  restaurant TEXT
);

CREATE INDEX IF NOT EXISTS idx_labor_shifts_employee ON labor_shifts(employee, date DESC);
