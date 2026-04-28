-- ============================================================
-- Phase 0 Hardening
--   1. Adds missing kk_conversations.is_flagged column referenced by code
--   2. Adds kk_access_requests table for the public access request flow
--      (was incorrectly writing into kk_email_drafts which requires
--       conversation_id and employee_id).
--   3. Helper function for IP-based rate limiting on the public route.
-- ============================================================

-- ------------------------------------------------------------
-- 1. kk_conversations.is_flagged
-- ------------------------------------------------------------
ALTER TABLE kk_conversations
  ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_kk_conversations_flagged
  ON kk_conversations(is_flagged) WHERE is_flagged = true;

-- ------------------------------------------------------------
-- 2. kk_access_requests
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS kk_access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'converted')),
  admin_notes TEXT,
  source_ip TEXT,
  user_agent TEXT,
  reviewed_by UUID REFERENCES kk_employees(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  converted_employee_id UUID REFERENCES kk_employees(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_kk_access_requests_status
  ON kk_access_requests(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_kk_access_requests_email_lower
  ON kk_access_requests(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_kk_access_requests_source_ip_created
  ON kk_access_requests(source_ip, created_at DESC);

ALTER TABLE kk_access_requests ENABLE ROW LEVEL SECURITY;

-- Only admins read/update via API. Public insert is performed via
-- service role from /api/access-request after server-side validation.
CREATE POLICY "access_requests_select_admin" ON kk_access_requests
  FOR SELECT USING (kk_is_admin());

CREATE POLICY "access_requests_update_admin" ON kk_access_requests
  FOR UPDATE USING (kk_is_admin());

-- ------------------------------------------------------------
-- 3. Rate-limit helper
--    Returns counts the API uses to decide whether to accept
--    a new public access request.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION kk_access_request_recent_counts(
  p_email TEXT,
  p_source_ip TEXT,
  p_window_minutes INTEGER DEFAULT 60
)
RETURNS JSON AS $$
DECLARE
  _email_count INTEGER;
  _ip_count INTEGER;
  _dup_24h INTEGER;
  _since TIMESTAMPTZ := now() - make_interval(mins => p_window_minutes);
BEGIN
  SELECT count(*) INTO _email_count
  FROM kk_access_requests
  WHERE LOWER(email) = LOWER(p_email)
    AND created_at >= _since;

  SELECT count(*) INTO _ip_count
  FROM kk_access_requests
  WHERE source_ip IS NOT DISTINCT FROM p_source_ip
    AND created_at >= _since;

  SELECT count(*) INTO _dup_24h
  FROM kk_access_requests
  WHERE LOWER(email) = LOWER(p_email)
    AND created_at >= now() - INTERVAL '24 hours';

  RETURN json_build_object(
    'email_count_in_window', _email_count,
    'ip_count_in_window', _ip_count,
    'duplicate_email_24h', _dup_24h
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ------------------------------------------------------------
-- 4. updated_at trigger
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION kk_touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_kk_access_requests_touch ON kk_access_requests;
CREATE TRIGGER trg_kk_access_requests_touch
BEFORE UPDATE ON kk_access_requests
FOR EACH ROW
EXECUTE FUNCTION kk_touch_updated_at();
