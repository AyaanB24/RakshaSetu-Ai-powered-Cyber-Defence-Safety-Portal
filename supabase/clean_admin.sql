
-- Delete Admin and related data to start fresh
DELETE FROM public.profiles WHERE email = 'cert.admin@gov.in';
DELETE FROM auth.identities WHERE email = 'cert.admin@gov.in';
DELETE FROM auth.users WHERE email = 'cert.admin@gov.in';
