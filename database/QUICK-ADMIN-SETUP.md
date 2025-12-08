# 🚀 Quick Admin User Setup Guide

## Method 1: Via Supabase Dashboard (Recommended)

### Step 1: Create User in Supabase Auth

1. Go to your **Supabase Dashboard**
2. Navigate to **Authentication** → **Users**
3. Click **"Add User"** → **"Create new user"**
4. Fill in:
   - **Email:** `admin@qivook.com` (or your preferred email)
   - **Password:** Set a secure password
   - **Auto Confirm User:** ✅ Check this box
5. Click **"Create user"**
6. **Copy the User ID** (UUID) - you'll need this in the next step

### Step 2: Create User Profile in Database

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run this SQL (replace `YOUR_USER_ID_HERE` with the UUID from Step 1):

```sql
-- Temporarily disable RLS
ALTER TABLE IF EXISTS public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Insert admin user profile
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
  'YOUR_USER_ID_HERE', -- Paste the UUID from Step 1
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

-- Re-enable RLS
ALTER TABLE IF EXISTS public.user_profiles ENABLE ROW LEVEL SECURITY;
```

3. Click **"Run"** to execute

### Step 3: Verify Admin User

Run this query to verify:

```sql
SELECT 
  id,
  email,
  name,
  company,
  country,
  industry,
  role
FROM public.user_profiles
WHERE role = 'admin';
```

You should see your admin user listed.

### Step 4: Login

1. Go to your app's login page
2. Login with:
   - **Email:** `admin@qivook.com` (or the email you used)
   - **Password:** The password you set in Step 1
3. After login, you should see the **Admin** menu in the navigation

---

## Method 2: Make Existing User an Admin

If you already have a user account and want to make it admin:

### Step 1: Find Your User ID

Run this query to find your user:

```sql
SELECT id, email, name, role
FROM public.user_profiles
WHERE email = 'your-email@example.com';
```

### Step 2: Update Role to Admin

```sql
UPDATE public.user_profiles
SET 
  role = 'admin',
  updated_at = NOW()
WHERE email = 'your-email@example.com';
```

### Step 3: Verify

```sql
SELECT id, email, name, role
FROM public.user_profiles
WHERE email = 'your-email@example.com';
```

The `role` should now be `'admin'`.

### Step 4: Logout and Login Again

1. Logout from your app
2. Login again
3. You should now see the **Admin** menu

---

## Method 3: Quick Development Setup

For quick development/testing, make the first user an admin:

```sql
UPDATE public.user_profiles
SET role = 'admin'
WHERE id = (
  SELECT id 
  FROM public.user_profiles 
  ORDER BY created_at ASC 
  LIMIT 1
);
```

---

## 🔍 Troubleshooting

### Admin Menu Not Showing

**Check:**
1. User role is `'admin'`:
   ```sql
   SELECT role FROM user_profiles WHERE email = 'your-email@example.com';
   ```

2. User is logged in (check browser console)

3. Logout and login again to refresh session

### "Access Denied" Error

**Check:**
1. User role is set correctly:
   ```sql
   SELECT id, email, role FROM user_profiles WHERE email = 'your-email@example.com';
   ```

2. If role is not `'admin'`, update it:
   ```sql
   UPDATE user_profiles SET role = 'admin' WHERE email = 'your-email@example.com';
   ```

3. Logout and login again

### Can't Create User in Supabase

**Alternative:**
1. Use the app's registration page to create a user
2. Then update that user's role to admin using Method 2

---

## ✅ Verification Checklist

- [ ] User exists in Supabase Auth
- [ ] User profile exists in `user_profiles` table
- [ ] `role` field is set to `'admin'`
- [ ] Can login with admin credentials
- [ ] Admin menu appears in navigation
- [ ] Can access `/app/admin` route

---

## 📝 Default Admin Credentials (Development)

**⚠️ IMPORTANT: Change these in production!**

- **Email:** `admin@qivook.com`
- **Password:** (set during user creation)

---

## 🎯 Next Steps

After creating admin user:

1. ✅ Login with admin credentials
2. ✅ Access Admin Dashboard at `/app/admin`
3. ✅ Explore all admin managers:
   - Prices, Suppliers, Agents
   - Financing, Logistics, Demand
   - Risk, Documents, Users
4. ✅ Test admin features
5. ✅ Create additional admin users if needed via Admin Panel → Users

---

**Your admin panel is now ready to use!** 🎉

