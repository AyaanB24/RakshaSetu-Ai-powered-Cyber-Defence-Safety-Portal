
-- Confirm all demo users
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email IN (
  'rajat.singh@indianarmy.mil',
  'echs-778812@rakshasetu.local',
  'dep.user@gmail.com',
  'cert.admin@gov.in'
);
