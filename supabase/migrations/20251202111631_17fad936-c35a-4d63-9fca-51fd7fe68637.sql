-- Add draft status to submissions
ALTER TYPE submission_status ADD VALUE IF NOT EXISTS 'draft';

-- Create a function to auto-assign first user as admin
CREATE OR REPLACE FUNCTION public.auto_assign_first_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_count INTEGER;
BEGIN
  -- Count existing users (excluding the current one being inserted)
  SELECT COUNT(*) INTO user_count FROM auth.users;
  
  -- If this is the first user, make them admin
  IF user_count <= 1 THEN
    -- Check if admin role already exists for this user
    IF NOT EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = NEW.id AND role = 'admin'
    ) THEN
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.id, 'admin');
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-assign first user as admin
DROP TRIGGER IF EXISTS on_auth_user_created_assign_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_assign_admin
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.auto_assign_first_admin();