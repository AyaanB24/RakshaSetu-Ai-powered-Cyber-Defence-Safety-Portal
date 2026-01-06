
-- Delete all demo users EXCEPT the admin
DELETE FROM auth.identities 
WHERE email IN (
    'rajat.singh@indianarmy.mil',
    'echs-778812@rakshasetu.com',
    'echs-778812@rakshasetu.local',
    'dep.user@gmail.com'
);

DELETE FROM auth.users 
WHERE email IN (
    'rajat.singh@indianarmy.mil',
    'echs-778812@rakshasetu.com',
    'echs-778812@rakshasetu.local',
    'dep.user@gmail.com'
);

DELETE FROM public.profiles 
WHERE email IN (
    'rajat.singh@indianarmy.mil',
    'echs-778812@rakshasetu.com',
    'echs-778812@rakshasetu.local',
    'dep.user@gmail.com'
);

RAISE NOTICE 'Deleted demo users (Serving, Ex-Serviceman, Dependent). Admin retained.';
