-- Allow anyone to update case status for demo purposes
-- This is needed because mock admin users don't have a Supabase session
DROP POLICY IF EXISTS "Enable update for all authenticated users" ON cases;
CREATE POLICY "Enable update for all authenticated users" ON cases
  FOR UPDATE USING (true) WITH CHECK (true);

-- Also ensure SELECT is open for demo
DROP POLICY IF EXISTS "Enable read for all authenticated users" ON cases;
CREATE POLICY "Enable read for all authenticated users" ON cases
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable read for all authenticated users" ON analysis_results;
CREATE POLICY "Enable read for all authenticated users" ON analysis_results
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable read for all authenticated users" ON evidence;
CREATE POLICY "Enable read for all authenticated users" ON evidence
  FOR SELECT USING (true);
