# 🔧 Admin Access Troubleshooting Guide

## Problem: Redirecting to Login When Accessing `/app/admin`

If you're being redirected to `/login` when trying to access `/app/admin`, follow these steps:

---

## Step 1: Check Authentication Status

### Check Browser Console
Open browser DevTools (F12) → Console tab and look for:
```
ProtectedRoute check: {
  isAuthenticated: false,  ← Should be true
  loading: false,
  hasUser: false,          ← Should be true
  userId: undefined,       ← Should show your user ID
  ...
}
```

### Verify You're Logged In
1. Check if you can access `/app` (main dashboard)
2. If you can't access `/app`, you're not authenticated
3. **Solution:** Logout and login again

---

## Step 2: Verify Admin Role in Database

### Check Your User Role
Run this SQL in Supabase SQL Editor:

```sql
SELECT 
  id,
  email,
  name,
  role,
  industry,
  country
FROM user_profiles
WHERE email = 'your-email@example.com';
```

**Expected Result:**
- `role` should be `'admin'`
- If `role` is `'user'`, you need to update it

### Update Role to Admin
If your role is not `'admin'`, run:

```sql
-- Temporarily disable RLS
ALTER TABLE IF EXISTS public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Update your role
UPDATE user_profiles
SET role = 'admin', updated_at = NOW()
WHERE email = 'your-email@example.com';

-- Re-enable RLS
ALTER TABLE IF EXISTS public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Verify
SELECT email, name, role FROM user_profiles WHERE email = 'your-email@example.com';
```

---

## Step 3: Refresh Auth State

After updating the role in database:

1. **Logout** from the app
2. **Clear browser cache/storage** (optional but recommended):
   - Open DevTools (F12)
   - Application tab → Storage → Clear site data
3. **Login again** with your credentials
4. **Try accessing `/app/admin` again**

---

## Step 4: Check Industry Selection

Admin routes require industry selection. If you see redirect to `/select-industry`:

1. Go to `/select-industry`
2. Select an industry (Construction or Agriculture)
3. You'll be redirected to `/app`
4. Then try `/app/admin` again

---

## Step 5: Debug Auth State

Add this to browser console to check your auth state:

```javascript
// In browser console
localStorage.getItem('sb-<your-project-ref>-auth-token')
// Should return a token if authenticated

// Check Supabase session
// (This requires Supabase client in console)
```

---

## Common Issues & Solutions

### Issue 1: "Not authenticated, redirecting to login"
**Cause:** Session expired or not logged in
**Solution:**
- Logout and login again
- Check if session exists in Supabase Auth

### Issue 2: "Access Denied" page
**Cause:** User role is not `'admin'`
**Solution:**
- Update role in database (see Step 2)
- Logout and login again

### Issue 3: Redirect loop
**Cause:** Auth state not updating properly
**Solution:**
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Logout and login again

### Issue 4: Can access `/app` but not `/app/admin`
**Cause:** User is authenticated but not admin
**Solution:**
- Update role to `'admin'` in database
- Logout and login again

---

## Quick Fix Script

Run this SQL to make your user admin (replace email):

```sql
-- Quick admin setup
ALTER TABLE IF EXISTS public.user_profiles DISABLE ROW LEVEL SECURITY;

UPDATE user_profiles
SET role = 'admin', updated_at = NOW()
WHERE email = 'your-email@example.com';

ALTER TABLE IF EXISTS public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Verify
SELECT email, name, role FROM user_profiles WHERE email = 'your-email@example.com';
```

Then:
1. Logout from app
2. Login again
3. Access `/app/admin`

---

## Verification Checklist

- [ ] User is logged in (can access `/app`)
- [ ] User role is `'admin'` in database
- [ ] Industry is selected (can access `/app` dashboard)
- [ ] Browser console shows `isAuthenticated: true`
- [ ] Browser console shows `isAdmin: true`
- [ ] No errors in browser console
- [ ] Session exists in Supabase Auth

---

## Still Not Working?

1. **Check browser console** for errors
2. **Check Network tab** for failed API calls
3. **Verify Supabase connection** is working
4. **Check RLS policies** aren't blocking access
5. **Try incognito/private window** to rule out cache issues

---

## Expected Flow

```
1. User logs in ✅
   ↓
2. AuthContext loads user profile ✅
   ↓
3. User role = 'admin' ✅
   ↓
4. Navigate to /app/admin ✅
   ↓
5. ProtectedRoute checks:
   - isAuthenticated = true ✅
   - isIndustrySelected = true ✅
   - isAdmin = true ✅
   ↓
6. Admin Dashboard loads ✅
```

If any step fails, check the corresponding section above.

---

**Need more help?** Check the browser console logs for detailed error messages.

