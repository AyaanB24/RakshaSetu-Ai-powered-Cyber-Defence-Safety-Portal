
-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Helper to insert user if not exists
DO $$
DECLARE
    u_id uuid;
BEGIN
    -- 1. Rajat Singh
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'rajat.singh@indianarmy.mil') THEN
        INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
        VALUES (
            '00000000-0000-0000-0000-000000000000', 
            gen_random_uuid(), 
            'authenticated', 
            'authenticated', 
            'rajat.singh@indianarmy.mil', 
            crypt('123456', gen_salt('bf')), 
            now(), 
            '{"full_name": "Major Rajat Singh", "role": "serving"}'::jsonb
        ) RETURNING id INTO u_id;
        
        INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
        VALUES (
            gen_random_uuid(), 
            u_id, 
            u_id, 
            format('{"sub": "%s", "email": "rajat.singh@indianarmy.mil"}', u_id)::jsonb, 
            'email', 
            now(), 
            now(), 
            now()
        );

        INSERT INTO public.profiles (id, email, full_name, role, unit)
        VALUES (u_id, 'rajat.singh@indianarmy.mil', 'Major Rajat Singh', 'serving', '21 Para SF');
    ELSE
        -- Update existing to be sure
        UPDATE auth.users SET encrypted_password = crypt('123456', gen_salt('bf')), email_confirmed_at = now() WHERE email = 'rajat.singh@indianarmy.mil';
    END IF;

    -- 2. Ex-Serviceman (Use .com now)
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'echs-778812@rakshasetu.com') THEN
         INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
        VALUES (
            '00000000-0000-0000-0000-000000000000', 
            gen_random_uuid(), 
            'authenticated', 
            'authenticated', 
            'echs-778812@rakshasetu.com', 
            crypt('123456', gen_salt('bf')), 
            now(), 
            '{"full_name": "Subedar Ram Kumar (Retd)", "role": "ex-serviceman", "echs_number": "ECHS-778812"}'::jsonb
        ) RETURNING id INTO u_id;
        
        INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
        VALUES (
            gen_random_uuid(), 
            u_id, 
            u_id, 
            format('{"sub": "%s", "email": "echs-778812@rakshasetu.com"}', u_id)::jsonb, 
            'email', 
            now(), 
            now(), 
            now()
        );
        
        INSERT INTO public.profiles (id, email, full_name, role, echs_number)
        VALUES (u_id, 'echs-778812@rakshasetu.com', 'Subedar Ram Kumar (Retd)', 'ex-serviceman', 'ECHS-778812');
    ELSE
        UPDATE auth.users SET encrypted_password = crypt('123456', gen_salt('bf')), email_confirmed_at = now() WHERE email = 'echs-778812@rakshasetu.com';
    END IF;

    -- 3. Dependent
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'dep.user@gmail.com') THEN
         INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
        VALUES (
            '00000000-0000-0000-0000-000000000000', 
            gen_random_uuid(), 
            'authenticated', 
            'authenticated', 
            'dep.user@gmail.com', 
            crypt('123456', gen_salt('bf')), 
            now(), 
            '{"full_name": "Priya Sharma", "role": "dependent", "dependent_id": "DEP-44321"}'::jsonb
        ) RETURNING id INTO u_id;
        
        INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
        VALUES (
            gen_random_uuid(), 
            u_id, 
            u_id, 
            format('{"sub": "%s", "email": "dep.user@gmail.com"}', u_id)::jsonb, 
            'email', 
            now(), 
            now(), 
            now()
        );
        
        INSERT INTO public.profiles (id, email, full_name, role, dependent_id)
        VALUES (u_id, 'dep.user@gmail.com', 'Priya Sharma', 'dependent', 'DEP-44321');
    ELSE
         UPDATE auth.users SET encrypted_password = crypt('123456', gen_salt('bf')), email_confirmed_at = now() WHERE email = 'dep.user@gmail.com';
    END IF;

    RAISE NOTICE 'Demo users seeded successfully with verified emails and hashed passwords.';
END $$;
