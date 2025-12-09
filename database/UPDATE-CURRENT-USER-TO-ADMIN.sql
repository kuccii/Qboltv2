-- ============================================
-- UPDATE CURRENT USER TO ADMIN
-- Run this in Supabase SQL Editor
-- ============================================

-- Option 1: Update by Email (Replace with your email)
UPDATE public.user_profiles
SET 
  role = 'admin',
  updated_at = NOW()
WHERE email = 'YOUR_EMAIL_HERE'; -- Replace with your email

-- Option 2: Update First User (Quick Development)
UPDATE public.user_profiles
SET role = 'admin'
WHERE id = (
  SELECT id 
  FROM public.user_profiles 
  ORDER BY created_at ASC 
  LIMIT 1
);

-- Option 3: Update All Users to Admin (Development Only - NOT FOR PRODUCTION!)
-- UPDATE public.user_profiles SET role = 'admin';

-- Verify the update
SELECT 
  id,
  email,
  name,
  role,
  updated_at
FROM public.user_profiles
WHERE role = 'admin';


