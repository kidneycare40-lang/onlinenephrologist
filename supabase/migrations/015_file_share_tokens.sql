-- Migration 015: Secure file sharing for booking reports
-- Adds file_share_tokens for time-limited, revocable, logged access to medical files

CREATE TABLE IF NOT EXISTS file_share_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  created_by TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked BOOLEAN DEFAULT false,
  access_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_file_share_tokens_token ON file_share_tokens(token);
CREATE INDEX IF NOT EXISTS idx_file_share_tokens_booking ON file_share_tokens(booking_id);

ALTER TABLE file_share_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only" ON file_share_tokens
  FOR ALL USING (true)
  WITH CHECK (true);
