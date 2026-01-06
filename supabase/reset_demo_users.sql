
-- 1. Wipe existing demo users from auth system (Cascades to profiles usually, but we handle profiles too)
DELETE FROM auth.identities 
WHERE email IN (
    'rajat.singh@indianarmy.mil',
    'echs-778812@rakshasetu.com',
    'echs-778812@rakshasetu.local',
    'dep.user@gmail.com',
    'cert.admin@gov.in'
);

DELETE FROM auth.users 
WHERE email IN (
    'rajat.singh@indianarmy.mil',
    'echs-778812@rakshasetu.com',
    'echs-778812@rakshasetu.local',
    'dep.user@gmail.com',
    'cert.admin@gov.in'
);

-- 2. Clean profiles just in case
DELETE FROM public.profiles
WHERE email IN (
    'rajat.singh@indianarmy.mil',
    'echs-778812@rakshasetu.com',
    'echs-778812@rakshasetu.local',
    'dep.user@gmail.com',
    'cert.admin@gov.in'
);

RAISE NOTICE 'Cleaned up old demo users.';
