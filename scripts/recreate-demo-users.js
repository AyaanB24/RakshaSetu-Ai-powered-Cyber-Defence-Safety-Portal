
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function recreateDemoUsers() {
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

    const users = [
        { email: 'ayaanbargir24@gmail.com', pass: '123456', name: 'Ayaan Bargir (Serving)', role: 'serving', meta: { unit: '21 Para SF' } },
        { email: 'ayaanbargir024@gmail.com', pass: '123456', name: 'Subedar Ayaan (Retd)', role: 'ex-serviceman', meta: { echs_number: 'ECSH-778812' } },
        { email: 'asiyamujawar05@gmail.com', pass: '123456', name: 'Asiya Mujawar', role: 'dependent', meta: { dependent_id: 'DEP-44321' } },
        { email: 'cert.admin@gov.in', pass: 'Raksha@123', name: 'CERT Admin', role: 'admin', meta: {} }
    ];

    console.log('--- Recreating Demo Users via SDK ---');

    for (const u of users) {
        console.log(`Creating ${u.email}...`);
        const { data, error } = await supabase.auth.signUp({
            email: u.email,
            password: u.pass,
            options: {
                data: {
                    full_name: u.name,
                    role: u.role,
                    ...u.meta
                }
            }
        });

        if (error) console.error(`Error creating ${u.email}:`, error.message);
        else console.log(`Success: ${u.email} (ID: ${data.user?.id})`);
    }
}

recreateDemoUsers().catch(console.error);
