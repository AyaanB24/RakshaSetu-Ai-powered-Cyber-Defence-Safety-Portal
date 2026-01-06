
-- 1. Fix RLS on profiles to ensure users can read their own data
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Ensure the profiles actually exist (Sync from auth.users)
-- This query acts as a "repair" to create profiles for any auth user that is missing one
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'full_name', 'User'),
    COALESCE(raw_user_meta_data->>'role', 'serving')
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- 3. Specific updates for our demo users to ensure they have the right specific fields
-- (Since the generic insert above might miss unit/echs/dep_id if not in metadata perfectly)

-- Update Ex-Serviceman
UPDATE public.profiles
SET role = 'ex-serviceman', echs_number = 'ECHS-778812'
WHERE email = 'echs-778812@rakshasetu.com';

-- Update Dependent
UPDATE public.profiles
SET role = 'dependent', dependent_id = 'DEP-44321'
WHERE email = 'dep.user@gmail.com';

-- Update Serving
UPDATE public.profiles
SET role = 'serving', unit = '21 Para SF'
WHERE email = 'rajat.singh@indianarmy.mil';

-- Update Admin
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'cert.admin@gov.in';

