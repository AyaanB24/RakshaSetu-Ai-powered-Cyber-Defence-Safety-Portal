
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function createAdminNatural() {
    const envPath = path.resolve(process.cwd(), '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};

    envContent.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            envVars[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
        }
    });

    const supabase = createClient(envVars['NEXT_PUBLIC_SUPABASE_URL'], envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY']);

    console.log('--- Creating Admin via SDK ---');
    const email = 'cert.admin@gov.in';
    const password = 'Raksha@123';

    // 1. SignUp
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: 'CERT Admin',
                role: 'admin' // We'll double check this in DB later
            }
        }
    });

    if (error) {
        console.error('Sign Up Error:', error);
        process.exit(1);
    }

    console.log('Sign Up Successful:', data.user?.id);
    console.log('Now run the promote_admin.sql script to ensure profile role is set correctly.');
}

createAdminNatural().catch(console.error);
