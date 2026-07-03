-- Run this SQL in Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor → New Query)

-- EMR key-value store: stores all EMR data (patients, consultations, settings, templates, etc.)
CREATE TABLE IF NOT EXISTS emr_store (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS emr_store_updated_at ON emr_store;
CREATE TRIGGER emr_store_updated_at
  BEFORE UPDATE ON emr_store
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Enable Row Level Security (open access for now, tighten later)
ALTER TABLE emr_store ENABLE ROW LEVEL SECURITY;

-- Allow all access (service role bypasses RLS, but anon key needs access for client-side)
CREATE POLICY "Allow all access" ON emr_store
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_emr_store_key ON emr_store(key);
