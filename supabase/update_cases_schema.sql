-- ADD MISSING COLUMNS TO CASES TABLE FOR FORENSIC REPORTING
ALTER TABLE cases ADD COLUMN IF NOT EXISTS affected_system TEXT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS incident_location TEXT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS severity_level TEXT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS ai_confidence_score FLOAT8;

-- Also ensure profiles join works by enabling read access on profiles for authenticated users
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');
