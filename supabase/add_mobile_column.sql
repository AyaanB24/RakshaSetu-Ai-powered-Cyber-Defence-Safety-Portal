-- Add mobile column if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS mobile TEXT;

-- Ensure other columns we use are also present (just in case)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS echs_number TEXT,
ADD COLUMN IF NOT EXISTS dependent_id TEXT,
ADD COLUMN IF NOT EXISTS service_number TEXT,
ADD COLUMN IF NOT EXISTS unit TEXT;

-- Verify the columns are added
SELECT * FROM profiles LIMIT 1;
