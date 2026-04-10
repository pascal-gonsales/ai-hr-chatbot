-- ============================================================
-- TeamChat AI Schema - HR Agent & Communication Filter
-- Prefix: kk_ (namespace to avoid collisions)
-- ============================================================

-- 1. kk_employees
CREATE TABLE IF NOT EXISTS kk_employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  restaurant TEXT NOT NULL DEFAULT 'Demo Thai',
  preferred_language TEXT NOT NULL DEFAULT 'fr',
  role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('employee', 'admin')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. kk_conversations
CREATE TABLE IF NOT EXISTS kk_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES kk_employees(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'New conversation',
  message_count INTEGER NOT NULL DEFAULT 0,
  last_message_at TIMESTAMPTZ DEFAULT now(),
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_kk_conversations_employee ON kk_conversations(employee_id);
CREATE INDEX idx_kk_conversations_last_msg ON kk_conversations(last_message_at DESC);

-- 3. kk_messages
CREATE TABLE IF NOT EXISTS kk_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES kk_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_kk_messages_conversation ON kk_messages(conversation_id, created_at);

-- 4. kk_email_drafts
CREATE TABLE IF NOT EXISTS kk_email_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES kk_conversations(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES kk_employees(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  recipient TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'sent')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. kk_actions_log
CREATE TABLE IF NOT EXISTS kk_actions_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES kk_employees(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_kk_actions_log_employee ON kk_actions_log(employee_id);
CREATE INDEX idx_kk_actions_log_type ON kk_actions_log(action_type);

-- ============================================================
-- Helper functions for RLS
-- ============================================================

CREATE OR REPLACE FUNCTION kk_current_employee_id()
RETURNS UUID AS $$
  SELECT id FROM kk_employees
  WHERE auth_user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION kk_is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM kk_employees
    WHERE auth_user_id = auth.uid()
    AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- RLS Policies
-- ============================================================

ALTER TABLE kk_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE kk_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE kk_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE kk_email_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE kk_actions_log ENABLE ROW LEVEL SECURITY;

-- kk_employees: see own record, admin sees all
CREATE POLICY "employees_select_own" ON kk_employees
  FOR SELECT USING (auth_user_id = auth.uid() OR kk_is_admin());

-- kk_conversations: see own, admin sees all
CREATE POLICY "conversations_select_own" ON kk_conversations
  FOR SELECT USING (employee_id = kk_current_employee_id() OR kk_is_admin());

CREATE POLICY "conversations_insert_own" ON kk_conversations
  FOR INSERT WITH CHECK (employee_id = kk_current_employee_id());

CREATE POLICY "conversations_update_own" ON kk_conversations
  FOR UPDATE USING (employee_id = kk_current_employee_id() OR kk_is_admin());

-- kk_messages: see own conversation messages, admin sees all
CREATE POLICY "messages_select_own" ON kk_messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM kk_conversations
      WHERE employee_id = kk_current_employee_id()
    ) OR kk_is_admin()
  );

CREATE POLICY "messages_insert_own" ON kk_messages
  FOR INSERT WITH CHECK (
    conversation_id IN (
      SELECT id FROM kk_conversations
      WHERE employee_id = kk_current_employee_id()
    )
  );

-- kk_email_drafts: see own, admin sees all
CREATE POLICY "email_drafts_select_own" ON kk_email_drafts
  FOR SELECT USING (employee_id = kk_current_employee_id() OR kk_is_admin());

CREATE POLICY "email_drafts_update_admin" ON kk_email_drafts
  FOR UPDATE USING (kk_is_admin());

-- kk_actions_log: admin only
CREATE POLICY "actions_log_select_admin" ON kk_actions_log
  FOR SELECT USING (kk_is_admin());

CREATE POLICY "actions_log_insert_any" ON kk_actions_log
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- Trigger: auto-update conversation stats on new message
-- ============================================================

CREATE OR REPLACE FUNCTION kk_update_conversation_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE kk_conversations
  SET
    message_count = message_count + 1,
    last_message_at = NEW.created_at,
    updated_at = now(),
    title = CASE
      WHEN message_count = 0 AND NEW.role = 'user'
      THEN LEFT(NEW.content, 60)
      ELSE title
    END
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_kk_message_insert
AFTER INSERT ON kk_messages
FOR EACH ROW
EXECUTE FUNCTION kk_update_conversation_stats();

-- ============================================================
-- Realtime: enable on messages and conversations
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE kk_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE kk_conversations;
