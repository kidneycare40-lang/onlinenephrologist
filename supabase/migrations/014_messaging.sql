-- ============================================================
-- 014_messaging.sql
-- Secure patient-doctor messaging system.
-- Run in Supabase SQL editor (Part 1 and Part 2 separately).
-- ============================================================

-- 1. Conversations — one thread per patient
CREATE TABLE IF NOT EXISTS public.patient_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_account_id UUID NOT NULL REFERENCES public.patient_accounts(id) ON DELETE CASCADE,
  assigned_doctor_id UUID,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'archived')),
  last_message_at TIMESTAMPTZ,
  last_message_preview TEXT,
  unread_count_patient INTEGER NOT NULL DEFAULT 0,
  unread_count_doctor INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_patient_conversations_account ON public.patient_conversations (patient_account_id);
CREATE INDEX IF NOT EXISTS idx_patient_conversations_status ON public.patient_conversations (status);
CREATE INDEX IF NOT EXISTS idx_patient_conversations_last_msg ON public.patient_conversations (last_message_at DESC);

-- 2. Messages — individual messages in a conversation
CREATE TABLE IF NOT EXISTS public.patient_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.patient_conversations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('patient', 'doctor', 'admin', 'system')),
  sender_user_id UUID,
  sender_patient_account_id UUID,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_patient_messages_conversation ON public.patient_messages (conversation_id);
CREATE INDEX IF NOT EXISTS idx_patient_messages_created ON public.patient_messages (created_at DESC);

-- 3. Message attachments
CREATE TABLE IF NOT EXISTS public.message_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.patient_messages(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_message_attachments_message ON public.message_attachments (message_id);

-- 4. RLS policies — service role only for all messaging tables
ALTER TABLE public.patient_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "patient_conversations_service_only" ON public.patient_conversations;
CREATE POLICY "patient_conversations_service_only"
  ON public.patient_conversations FOR ALL
  USING (false);

DROP POLICY IF EXISTS "patient_messages_service_only" ON public.patient_messages;
CREATE POLICY "patient_messages_service_only"
  ON public.patient_messages FOR ALL
  USING (false);

DROP POLICY IF EXISTS "message_attachments_service_only" ON public.message_attachments;
CREATE POLICY "message_attachments_service_only"
  ON public.message_attachments FOR ALL
  USING (false);
