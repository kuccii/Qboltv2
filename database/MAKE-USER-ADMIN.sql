-- ============================================
-- MAKE EXISTING USER AN ADMIN
-- Updates the user with email ypattos@gmail.com to admin role
-- ============================================

-- Temporarily disable RLS for admin role update
ALTER TABLE IF EXISTS public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Update user to admin role
UPDATE public.user_profiles
SET 
  role = 'admin',
  updated_at = NOW()
WHERE email = 'ypattos@gmail.com'
   OR id = 'f16853ef-8f16-4afe-9d16-aea5f4ed0672';

-- Re-enable RLS
ALTER TABLE IF EXISTS public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Verify the update
SELECT 
  id,
  email,
  name,
  company,
  country,
  industry,
  role,
  created_at,
  updated_at
FROM public.user_profiles
WHERE email = 'ypattos@gmail.com'
   OR id = 'f16853ef-8f16-4afe-9d16-aea5f4ed0672';

-- Expected result: role should be 'admin'

