
-- Forcefully repair profiles for the demo users
DO $$
DECLARE
    rajat_id uuid;
    echs_id uuid;
    dep_id uuid;
    admin_id uuid;
BEGIN
    -- 1. Get IDs from Auth
    SELECT id INTO rajat_id FROM auth.users WHERE email = 'rajat.singh@indianarmy.mil';
    SELECT id INTO echs_id FROM auth.users WHERE email = 'echs-778812@rakshasetu.com';
    SELECT id INTO dep_id FROM auth.users WHERE email = 'dep.user@gmail.com';
    SELECT id INTO admin_id FROM auth.users WHERE email = 'cert.admin@gov.in';

    -- 2. Upsert Profiles (Ensure they exist and have correct data)
    
    -- Serving
    IF rajat_id IS NOT NULL THEN
        INSERT INTO public.profiles (id, email, full_name, role, unit)
        VALUES (rajat_id, 'rajat.singh@indianarmy.mil', 'Major Rajat Singh', 'serving', '21 Para SF')
        ON CONFLICT (id) DO UPDATE 
        SET role = 'serving', unit = '21 Para SF', full_name = 'Major Rajat Singh';
    END IF;

    -- Ex-Serviceman
    IF echs_id IS NOT NULL THEN
        INSERT INTO public.profiles (id, email, full_name, role, echs_number)
        VALUES (echs_id, 'echs-778812@rakshasetu.com', 'Subedar Ram Kumar (Retd)', 'ex-serviceman', 'ECHS-778812')
        ON CONFLICT (id) DO UPDATE 
        SET role = 'ex-serviceman', echs_number = 'ECHS-778812', full_name = 'Subedar Ram Kumar (Retd)';
    END IF;

    -- Dependent
    IF dep_id IS NOT NULL THEN
        INSERT INTO public.profiles (id, email, full_name, role, dependent_id)
        VALUES (dep_id, 'dep.user@gmail.com', 'Priya Sharma', 'dependent', 'DEP-44321')
        ON CONFLICT (id) DO UPDATE 
        SET role = 'dependent', dependent_id = 'DEP-44321', full_name = 'Priya Sharma';
    END IF;

    -- Admin
    IF admin_id IS NOT NULL THEN
        INSERT INTO public.profiles (id, email, full_name, role)
        VALUES (admin_id, 'cert.admin@gov.in', 'CERT Admin', 'admin')
        ON CONFLICT (id) DO UPDATE 
        SET role = 'admin', full_name = 'CERT Admin';
    END IF;

    RAISE NOTICE 'Profiles repaired successfully.';
END $$;
