-- ============================================
-- QIVOOK - SEED ADMIN USER
-- Creates an admin user for system administration
-- ============================================

-- IMPORTANT: This script assumes you have already created a user in Supabase Auth
-- If you haven't, follow these steps:
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Click "Add User" → "Create new user"
-- 3. Enter email: admin@qivook.com (or your preferred email)
-- 4. Enter password: (set a secure password)
-- 5. Copy the User ID (UUID) from the created user
-- 6. Replace 'ADMIN_USER_ID_HERE' below with the actual User ID

-- ============================================
-- OPTION 1: Create Admin User Profile
-- Replace 'ADMIN_USER_ID_HERE' with actual Supabase Auth User ID
-- ============================================

-- Temporarily disable RLS for admin user creation
ALTER TABLE IF EXISTS public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Insert admin user profile
-- NOTE: Replace 'ADMIN_USER_ID_HERE' with the actual UUID from Supabase Auth
INSERT INTO public.user_profiles (
  id,
  email,
  name,
  company,
  country,
  industry,
  role,
  created_at,
  updated_at
) VALUES (
  'ADMIN_USER_ID_HERE', -- Replace with actual Supabase Auth User ID
  'admin@qivook.com',   -- Admin email
  'System Administrator', -- Admin name
  'Qivook Platform',    -- Company name
  'Kenya',              -- Default country (can be changed)
  'construction',       -- Default industry (can be changed)
  'admin',              -- Admin role
  NOW(),                -- Created at
  NOW()                 -- Updated at
)
ON CONFLICT (id) 
DO UPDATE SET
  role = 'admin',
  updated_at = NOW();

-- Re-enable RLS
ALTER TABLE IF EXISTS public.user_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- OPTION 2: Update Existing User to Admin
-- Use this if you already have a user and want to make them admin
-- ============================================

-- Update existing user to admin role
-- Replace 'USER_EMAIL_HERE' with the actual user email
/*
UPDATE public.user_profiles
SET 
  role = 'admin',
  updated_at = NOW()
WHERE email = 'USER_EMAIL_HERE';
*/

-- ============================================
-- OPTION 3: Create Admin User via Supabase Dashboard
-- ============================================

-- Step-by-step instructions:
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Click "Add User" → "Create new user"
-- 3. Fill in:
--    - Email: admin@qivook.com (or your preferred email)
--    - Password: [Set a secure password]
--    - Auto Confirm User: ✅ (checked)
-- 4. Click "Create user"
-- 5. Copy the User ID (UUID) from the created user
-- 6. Run the SQL below with the actual User ID:

/*
INSERT INTO public.user_profiles (
  id,
  email,
  name,
  company,
  country,
  industry,
  role,
  created_at,
  updated_at
) VALUES (
  'PASTE_USER_ID_HERE', -- Paste the UUID from Supabase Auth
  'admin@qivook.com',
  'System Administrator',
  'Qivook Platform',
  'Kenya',
  'construction',
  'admin',
  NOW(),
  NOW()
)
ON CONFLICT (id) 
DO UPDATE SET
  role = 'admin',
  updated_at = NOW();
*/

-- ============================================
-- VERIFY ADMIN USER
-- ============================================

-- Check if admin user exists
SELECT 
  id,
  email,
  name,
  company,
  country,
  industry,
  role,
  created_at
FROM public.user_profiles
WHERE role = 'admin';

-- ============================================
-- QUICK ADMIN SETUP (For Development)
-- ============================================

-- If you want to quickly make the first user an admin:
/*
UPDATE public.user_profiles
SET role = 'admin'
WHERE id = (
  SELECT id 
  FROM public.user_profiles 
  ORDER BY created_at ASC 
  LIMIT 1
);
*/

-- ============================================
-- NOTES
-- ============================================

-- 1. Admin users can access all admin routes:
--    - /app/admin
--    - /app/admin/prices
--    - /app/admin/suppliers
--    - /app/admin/agents
--    - /app/admin/financing
--    - /app/admin/logistics
--    - /app/admin/demand
--    - /app/admin/risk
--    - /app/admin/documents
--    - /app/admin/users
--    - /app/admin/import
--    - /app/admin/export

-- 2. Admin users can:
--    - Manage all data (prices, suppliers, agents, etc.)
--    - Manage users and roles
--    - Import/export data
--    - View system statistics
--    - Access all admin features

-- 3. Security:
--    - All admin routes are protected by ProtectedRoute
--    - Only users with role='admin' can access
--    - Non-admin users see "Access Denied" page

-- 4. To create admin user via code (future enhancement):
--    - Could add admin user creation in AdminUserManager
--    - Would need Supabase Admin API access
--    - Currently best done via Supabase Dashboard

