
BEGIN;

-- 1. Ensure encryption is available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Delete existing Admin (Cleanup)
DELETE FROM public.profiles WHERE email = 'cert.admin@gov.in';
DELETE FROM auth.identities WHERE email = 'cert.admin@gov.in';
DELETE FROM auth.users WHERE email = 'cert.admin@gov.in';

-- 3. Re-create Admin cleanly
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES (
    '44444444-4444-4444-4444-444444444444', 
    '00000000-0000-0000-0000-000000000000', 
    'authenticated', 
    'authenticated', 
    'cert.admin@gov.in', 
    crypt('Raksha@123', gen_salt('bf')), 
    now(), 
    '{"provider":"email","providers":["email"]}', 
    '{"full_name": "CERT Admin", "role": "admin"}', 
    now(), 
    now()
);

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
    gen_random_uuid(), 
    '44444444-4444-4444-4444-444444444444', 
    '44444444-4444-4444-4444-444444444444', 
    '{"sub": "44444444-4444-4444-4444-444444444444", "email": "cert.admin@gov.in"}', 
    'email', 
    now(), 
    now(), 
    now()
);

-- 4. Create Profile with NO RLS issues (since we disabled it before, but just in case)
INSERT INTO public.profiles (id, email, full_name, role)
VALUES ('44444444-4444-4444-4444-444444444444', 'cert.admin@gov.in', 'CERT Admin', 'admin');

-- 5. Force schema cache reload
NOTIFY pgrst, 'reload config';

COMMIT;
