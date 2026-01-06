
-- 1. URGENT: Disable RLS on profiles temporarily to ensure NO blocking is happening
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 2. Confirm the users exist in Auth (If not, we can't create profiles for them)
-- We'll assume the Master Reset Script ran. If not, this block will re-insert them safely.

-- Ensure pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
    -- IDs for our users
    rajat_id uuid;
    echs_id uuid;
    dep_id uuid;
    admin_id uuid;
BEGIN
    -- ----------------------------------------------------------------
    -- A. ENSURE AUTH USERS EXIST (Re-run minimal create if missing)
    -- ----------------------------------------------------------------

    -- 1. RAJAT
    SELECT id INTO rajat_id FROM auth.users WHERE email = 'rajat.singh@indianarmy.mil';
    IF rajat_id IS NULL THEN
        INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
        VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'rajat.singh@indianarmy.mil', crypt('123456', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name": "Major Rajat Singh", "role": "serving", "unit": "21 Para SF"}', now(), now())
        RETURNING id INTO rajat_id;
        
        INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, created_at, updated_at)
        VALUES (gen_random_uuid(), rajat_id, rajat_id, format('{"sub": "%s", "email": "rajat.singh@indianarmy.mil"}', rajat_id)::jsonb, 'email', now(), now());
    ELSE
        -- Update password just in case
        UPDATE auth.users SET encrypted_password = crypt('123456', gen_salt('bf')) WHERE id = rajat_id;
    END IF;

    -- 2. ECHS
    SELECT id INTO echs_id FROM auth.users WHERE email = 'echs-778812@rakshasetu.com';
    IF echs_id IS NULL THEN
        INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
        VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'echs-778812@rakshasetu.com', crypt('123456', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name": "Subedar Ram Kumar (Retd)", "role": "ex-serviceman", "echs_number": "ECHS-778812"}', now(), now())
        RETURNING id INTO echs_id;

        INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, created_at, updated_at)
        VALUES (gen_random_uuid(), echs_id, echs_id, format('{"sub": "%s", "email": "echs-778812@rakshasetu.com"}', echs_id)::jsonb, 'email', now(), now());
    ELSE
        UPDATE auth.users SET encrypted_password = crypt('123456', gen_salt('bf')) WHERE id = echs_id;
    END IF;

    -- 3. DEPENDENT
    SELECT id INTO dep_id FROM auth.users WHERE email = 'dep.user@gmail.com';
    IF dep_id IS NULL THEN
        INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
        VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'dep.user@gmail.com', crypt('123456', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name": "Priya Sharma", "role": "dependent", "dependent_id": "DEP-44321"}', now(), now())
        RETURNING id INTO dep_id;

        INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, created_at, updated_at)
        VALUES (gen_random_uuid(), dep_id, dep_id, format('{"sub": "%s", "email": "dep.user@gmail.com"}', dep_id)::jsonb, 'email', now(), now());
    ELSE
        UPDATE auth.users SET encrypted_password = crypt('123456', gen_salt('bf')) WHERE id = dep_id;
    END IF;

    -- 4. ADMIN
    SELECT id INTO admin_id FROM auth.users WHERE email = 'cert.admin@gov.in';
    IF admin_id IS NULL THEN
         INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
        VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'cert.admin@gov.in', crypt('Raksha@123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name": "CERT Admin", "role": "admin"}', now(), now())
        RETURNING id INTO admin_id;

        INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, created_at, updated_at)
        VALUES (gen_random_uuid(), admin_id, admin_id, format('{"sub": "%s", "email": "cert.admin@gov.in"}', admin_id)::jsonb, 'email', now(), now());
    ELSE
        UPDATE auth.users SET encrypted_password = crypt('Raksha@123', gen_salt('bf')) WHERE id = admin_id;
    END IF;

    -- ----------------------------------------------------------------
    -- B. FORCE SYNC PROFILES (The crucial part)
    -- ----------------------------------------------------------------

    -- 1. Rajat
    INSERT INTO public.profiles (id, email, full_name, role, unit)
    VALUES (rajat_id, 'rajat.singh@indianarmy.mil', 'Major Rajat Singh', 'serving', '21 Para SF')
    ON CONFLICT (id) DO UPDATE SET 
        role = 'serving', unit = '21 Para SF', full_name = 'Major Rajat Singh';

    -- 2. ECHS
    INSERT INTO public.profiles (id, email, full_name, role, echs_number)
    VALUES (echs_id, 'echs-778812@rakshasetu.com', 'Subedar Ram Kumar (Retd)', 'ex-serviceman', 'ECHS-778812')
    ON CONFLICT (id) DO UPDATE SET 
        role = 'ex-serviceman', echs_number = 'ECHS-778812', full_name = 'Subedar Ram Kumar (Retd)';

    -- 3. Dependent
    INSERT INTO public.profiles (id, email, full_name, role, dependent_id)
    VALUES (dep_id, 'dep.user@gmail.com', 'Priya Sharma', 'dependent', 'DEP-44321')
    ON CONFLICT (id) DO UPDATE SET 
        role = 'dependent', dependent_id = 'DEP-44321', full_name = 'Priya Sharma';

    -- 4. Admin
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (admin_id, 'cert.admin@gov.in', 'CERT Admin', 'admin')
    ON CONFLICT (id) DO UPDATE SET 
        role = 'admin', full_name = 'CERT Admin';

    RAISE NOTICE 'SUCCESS: Users and Profiles have been synced. RLS on profiles is DISABLED.';
END $$;
