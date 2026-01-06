
-- Confirm the admin user email manually
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'cert.admin@gov.in';

-- Also confirm the demo users if they are stuck
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email IN (
  'rajat.singh@indianarmy.mil',
  'echs-778812@rakshasetu.local',
  'dep.user@gmail.com'
);
