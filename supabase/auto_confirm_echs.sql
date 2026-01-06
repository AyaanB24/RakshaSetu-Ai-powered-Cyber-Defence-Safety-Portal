
-- 1. Create a function to auto-confirm users based on their email domain
-- This function will trigger whenever a new user is created in auth.users
CREATE OR REPLACE FUNCTION public.auto_confirm_rakshasetu_users()
RETURNS trigger AS $$
BEGIN
  -- Check if the email ends with '@rakshasetu.com' (case-insensitive)
  IF (NEW.email ILIKE '%@rakshasetu.com') THEN
    -- confirm the email immediately
    NEW.email_confirmed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created_auto_confirm ON auth.users;
CREATE TRIGGER on_auth_user_created_auto_confirm
BEFORE INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.auto_confirm_rakshasetu_users();

-- 3. Also, manually confirm any EXISTING users with this domain that are not confirmed
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email ILIKE '%@rakshasetu.com'
  AND email_confirmed_at IS NULL;
