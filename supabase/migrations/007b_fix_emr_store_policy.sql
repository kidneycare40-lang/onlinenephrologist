-- Drop the overly permissive policy by its exact name
DROP POLICY IF EXISTS "Allow all access" ON public.emr_store;

-- Create proper authenticated-only policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'emr_store_select' AND tablename = 'emr_store') THEN
    CREATE POLICY emr_store_select ON emr_store FOR SELECT USING (auth.role() = 'authenticated');
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'emr_store_insert' AND tablename = 'emr_store') THEN
    CREATE POLICY emr_store_insert ON emr_store FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'emr_store_update' AND tablename = 'emr_store') THEN
    CREATE POLICY emr_store_update ON emr_store FOR UPDATE USING (auth.role() = 'authenticated');
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'emr_store_delete' AND tablename = 'emr_store') THEN
    CREATE POLICY emr_store_delete ON emr_store FOR DELETE USING (auth.role() = 'authenticated');
  END IF;
END $$;
