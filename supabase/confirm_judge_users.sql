
-- Confirm the specific demo users created for the judges
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email IN (
  'ayaanbargir24@gmail.com',
  'ayaanbargir024@gmail.com',
  'asiyamujawar05@gmail.com',
  'cert.admin@gov.in'
);
