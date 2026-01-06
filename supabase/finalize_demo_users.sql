
-- 1. Confirm Emails
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email IN (
    'rajat.singh@indianarmy.mil',
    'echs-778812@rakshasetu.com',
    'dep.user@gmail.com',
    'cert.admin@gov.in'
);

-- 2. Ensure Profiles (The SignUp via SDK should have created them if triggers exist, 
-- but if we don't have triggers, we must insert them manually)

INSERT INTO public.profiles (id, email, full_name, role, unit, echs_number, dependent_id)
SELECT 
    id, 
    email, 
    raw_user_meta_data->>'full_name',
    raw_user_meta_data->>'role',
    raw_user_meta_data->>'unit',
    raw_user_meta_data->>'echs_number',
    raw_user_meta_data->>'dependent_id'
FROM auth.users
WHERE email IN (
    'rajat.singh@indianarmy.mil',
    'echs-778812@rakshasetu.com',
    'dep.user@gmail.com',
    'cert.admin@gov.in'
)
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    unit = EXCLUDED.unit,
    echs_number = EXCLUDED.echs_number,
    dependent_id = EXCLUDED.dependent_id;
