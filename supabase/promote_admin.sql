
-- 1. Confirm Email
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'cert.admin@gov.in';

-- 2. Upsert Profile (Ensure role is admin)
INSERT INTO public.profiles (id, email, full_name, role)
SELECT id, email, 'CERT Admin', 'admin'
FROM auth.users
WHERE email = 'cert.admin@gov.in'
ON CONFLICT (id) DO UPDATE 
SET role = 'admin', full_name = 'CERT Admin';

-- 3. Reload Config
NOTIFY pgrst, 'reload config';
