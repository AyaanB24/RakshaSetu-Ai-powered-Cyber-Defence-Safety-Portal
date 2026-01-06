
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function createAdmin() {
    const envPath = path.resolve(process.cwd(), '.env.local');

    if (!fs.existsSync(envPath)) {
        console.error('Error: .env.local file not found.');
        process.exit(1);
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};

    envContent.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^["']|["']$/g, ''); // Remove quotes
            envVars[key] = value;
        }
    });

    const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
    const supabaseAnonKey = envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

    if (!supabaseUrl || !supabaseAnonKey) {
        console.error('Error: Supabase credentials not found in .env.local');
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const email = 'cert.admin@gov.in';
    const password = 'Raksha@123';
    const name = 'CERT Admin';

    console.log(`Attempting to create/login admin user: ${email}`);

    // 1. Try to SignIn first to check if exists
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    let userId;

    if (signInData.user) {
        console.log('User already exists. Logging in...');
        userId = signInData.user.id;
    } else {
        console.log('User does not exist (or wrong password). creating new user...');

        // 2. SignUp
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                    role: 'admin'
                }
            }
        });

        if (signUpError) {
            console.error('SignUp Error:', signUpError.message);
            // If error is "User already registered" but login failed, it means wrong password was used in login attempt above
            if (signUpError.message.includes("registered")) {
                console.error("User likely exists but password login failed. Please reset password or check credentials.");
            }
            process.exit(1);
        }

        if (!signUpData.user) {
            console.error('SignUp failed to return user data.');
            process.exit(1);
        }

        userId = signUpData.user.id;
        console.log('Admin user created in Auth System.');
    }

    // 3. Ensure Profile Exists and is Admin
    console.log('Updating/Inserting Profile...');

    // Check if profile exists
    const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (existingProfile) {
        console.log('Profile exists. Updating role to admin...');
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ role: 'admin', full_name: name })
            .eq('id', userId);

        if (updateError) console.error('Error updating profile:', updateError.message);
        else console.log('Profile updated successfully.');

    } else {
        console.log('Profile missing. Inserting...');
        const { error: insertError } = await supabase
            .from('profiles')
            .insert([{
                id: userId,
                email: email,
                full_name: name,
                role: 'admin',
                created_at: new Date().toISOString()
            }]);

        if (insertError) console.error('Error inserting profile:', insertError.message);
        else console.log('Profile inserted successfully.');
    }

    console.log('\n--- Admin Setup Complete ---');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('You can now login at /login');
}

createAdmin().catch(err => {
    console.error('Unexpected error:', err);
});
