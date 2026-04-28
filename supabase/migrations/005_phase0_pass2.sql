-- ============================================================
-- Phase 0 Hardening — Pass 2 (Codex review #01 fixes)
--
--   1. Lock down kk_access_request_recent_counts:
--        - SET search_path explicitly (definer-function hardening)
--        - REVOKE EXECUTE FROM PUBLIC, anon, authenticated
--        - GRANT EXECUTE TO service_role only
--   2. Add atomic dedupe support:
--        - Functional UNIQUE index on lower(email) + status='pending'
--        - Lets the API use ON CONFLICT instead of count-then-insert
-- ============================================================

-- ------------------------------------------------------------
-- 1. Harden kk_access_request_recent_counts
--
--    Problem: SECURITY DEFINER functions are executable by PUBLIC by default
--    and an unset search_path can be exploited by schema shadowing.
--    Direct PostgREST RPC: POST /rest/v1/rpc/kk_access_request_recent_counts
--    would otherwise let anon callers probe recency by email.
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION kk_access_request_recent_counts(
  p_email TEXT,
  p_source_ip TEXT,
  p_window_minutes INTEGER DEFAULT 60
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
DECLARE
  _email_count INTEGER;
  _ip_count INTEGER;
  _dup_24h INTEGER;
  _since TIMESTAMPTZ := now() - make_interval(mins => p_window_minutes);
BEGIN
  SELECT count(*) INTO _email_count
  FROM public.kk_access_requests
  WHERE LOWER(email) = LOWER(p_email)
    AND created_at >= _since;

  SELECT count(*) INTO _ip_count
  FROM public.kk_access_requests
  WHERE source_ip IS NOT DISTINCT FROM p_source_ip
    AND created_at >= _since;

  SELECT count(*) INTO _dup_24h
  FROM public.kk_access_requests
  WHERE LOWER(email) = LOWER(p_email)
    AND created_at >= now() - INTERVAL '24 hours';

  RETURN json_build_object(
    'email_count_in_window', _email_count,
    'ip_count_in_window', _ip_count,
    'duplicate_email_24h', _dup_24h
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION kk_access_request_recent_counts(TEXT, TEXT, INTEGER) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION kk_access_request_recent_counts(TEXT, TEXT, INTEGER) FROM anon;
REVOKE EXECUTE ON FUNCTION kk_access_request_recent_counts(TEXT, TEXT, INTEGER) FROM authenticated;
GRANT EXECUTE  ON FUNCTION kk_access_request_recent_counts(TEXT, TEXT, INTEGER) TO service_role;

-- ------------------------------------------------------------
-- 2. Atomic dedupe support
--
--    A partial UNIQUE index on (lower(email)) restricted to pending requests
--    lets the API insert with ON CONFLICT DO NOTHING and rely on the database
--    for atomicity instead of a TOCTOU count-then-insert.
--    Approved/rejected/converted rows do not block a future request from the
--    same email, which is the desired behavior.
-- ------------------------------------------------------------

CREATE UNIQUE INDEX IF NOT EXISTS uniq_kk_access_requests_email_pending
  ON kk_access_requests (LOWER(email))
  WHERE status = 'pending';
