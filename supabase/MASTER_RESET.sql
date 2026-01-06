
--------------------------------------------------------------------------------
-- MASTER RESET SCRIPT for RakshaSetu Demo Users
-- RUN THIS IN SUPABASE SQL EDITOR
--------------------------------------------------------------------------------

BEGIN;

-- 1. Install Encryption Extension (Required for password hashing)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. DELETE EXISTING DEMO DATA (Clean Slate)
-- We use CASCADE to ensure linked profiles and identities are also removed
DELETE FROM auth.users 
WHERE email IN (
    'rajat.singh@indianarmy.mil',
    'echs-778812@rakshasetu.com',
    'echs-778812@rakshasetu.local',
    'dep.user@gmail.com',
    'cert.admin@gov.in'
);

-- 3. INSERT USERS DIRECTLY INTO AUTH.USERS
-- Examples use fixed UUIDs to prevent orphaned records in future

-- A. SERVING: rajat.singh@indianarmy.mil
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES (
    '11111111-1111-1111-1111-111111111111', 
    '00000000-0000-0000-0000-000000000000', 
    'authenticated', 
    'authenticated', 
    'rajat.singh@indianarmy.mil', 
    crypt('123456', gen_salt('bf')), 
    now(), 
    '{"provider":"email","providers":["email"]}', 
    '{"full_name": "Major Rajat Singh", "role": "serving", "unit": "21 Para SF"}', 
    now(), 
    now()
);

-- Identity for Serving
INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
    gen_random_uuid(), 
    '11111111-1111-1111-1111-111111111111', 
    '11111111-1111-1111-1111-111111111111', 
    '{"sub": "11111111-1111-1111-1111-111111111111", "email": "rajat.singh@indianarmy.mil"}', 
    'email', 
    now(), 
    now(), 
    now()
);


-- B. EX-SERVICEMAN: echs-778812@rakshasetu.com
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES (
    '22222222-2222-2222-2222-222222222222', 
    '00000000-0000-0000-0000-000000000000', 
    'authenticated', 
    'authenticated', 
    'echs-778812@rakshasetu.com', 
    crypt('123456', gen_salt('bf')), 
    now(), 
    '{"provider":"email","providers":["email"]}', 
    '{"full_name": "Subedar Ram Kumar (Retd)", "role": "ex-serviceman", "echs_number": "ECHS-778812"}', 
    now(), 
    now()
);

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
    gen_random_uuid(), 
    '22222222-2222-2222-2222-222222222222', 
    '22222222-2222-2222-2222-222222222222', 
    '{"sub": "22222222-2222-2222-2222-222222222222", "email": "echs-778812@rakshasetu.com"}', 
    'email', 
    now(), 
    now(), 
    now()
);


-- C. DEPENDENT: dep.user@gmail.com
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES (
    '33333333-3333-3333-3333-333333333333', 
    '00000000-0000-0000-0000-000000000000', 
    'authenticated', 
    'authenticated', 
    'dep.user@gmail.com', 
    crypt('123456', gen_salt('bf')), 
    now(), 
    '{"provider":"email","providers":["email"]}', 
    '{"full_name": "Priya Sharma", "role": "dependent", "dependent_id": "DEP-44321"}', 
    now(), 
    now()
);

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
    gen_random_uuid(), 
    '33333333-3333-3333-3333-333333333333', 
    '33333333-3333-3333-3333-333333333333', 
    '{"sub": "33333333-3333-3333-3333-333333333333", "email": "dep.user@gmail.com"}', 
    'email', 
    now(), 
    now(), 
    now()
);


-- D. ADMIN: cert.admin@gov.in
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


-- 4. INSERT PROFILES (Public Data)
-- We manually insert to ensure they match perfectly

INSERT INTO public.profiles (id, email, full_name, role, unit, echs_number, dependent_id)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'rajat.singh@indianarmy.mil', 'Major Rajat Singh', 'serving', '21 Para SF', NULL, NULL),
  ('22222222-2222-2222-2222-222222222222', 'echs-778812@rakshasetu.com', 'Subedar Ram Kumar (Retd)', 'ex-serviceman', NULL, 'ECHS-778812', NULL),
  ('33333333-3333-3333-3333-333333333333', 'dep.user@gmail.com', 'Priya Sharma', 'dependent', NULL, NULL, 'DEP-44321'),
  ('44444444-4444-4444-4444-444444444444', 'cert.admin@gov.in', 'CERT Admin', 'admin', NULL, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  unit = EXCLUDED.unit,
  echs_number = EXCLUDED.echs_number,
  dependent_id = EXCLUDED.dependent_id;


COMMIT;
--------------------------------------------------------------------------------
