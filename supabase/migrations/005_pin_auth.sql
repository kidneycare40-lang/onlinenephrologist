-- ============================================================
-- PIN-based authentication support
-- ============================================================

-- Add pin_hash column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS pin_hash TEXT;

-- Enable pgcrypto for gen_salt() and crypt()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Set a default PIN of "1234" for the seed doctor user
UPDATE users
SET pin_hash = crypt('1234', gen_salt('bf', 12))
WHERE id = '00000000-0000-0000-0000-000000000001'
  AND pin_hash IS NULL;

-- Set the same default PIN for any other users without a pin_hash
UPDATE users
SET pin_hash = crypt('1234', gen_salt('bf', 12))
WHERE pin_hash IS NULL;
