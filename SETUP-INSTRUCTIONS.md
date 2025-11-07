# 🚀 Quick Setup Instructions - Fix Database Errors

## Problem
You're seeing 406 and 400 errors because the `user_profiles` table doesn't exist in Supabase yet.

## Solution (5 minutes)

### Step 1: Create user_profiles Table

1. **Go to Supabase Dashboard**
   - Open: https://supabase.com/dashboard/project/idgnxbrfsnqrzpciwgpv

2. **Open SQL Editor**
   - Left sidebar → Click "SQL Editor"
   - Click "New Query"

3. **Copy and Run This SQL**
   - Open: `database/QUICK-SETUP.sql`
   - Copy ALL the contents
   - Paste into SQL Editor
   - Click "Run" or press Ctrl+Enter

4. **Verify Table Created**
   - Left sidebar → "Table Editor"
   - You should see `user_profiles` in the list

### Step 2: Disable Email Confirmation (For Testing)

1. **Go to Authentication Settings**
   - Left sidebar → "Authentication"
   - Click "Settings" tab
   - Click "Email" under "Auth Providers"

2. **Disable Confirmation**
   - Find "Confirm email"
   - Toggle it **OFF**
   - Click "Save"

**Why?** This lets you test login without checking email. You can re-enable later.

### Step 3: Fix Environment Variable Warning (Optional)

Add this to your `.env.local` file:

```env
VITE_DEMO_MODE=true
VITE_API_BASE_URL=https://idgnxbrfsnqrzpciwgpv.supabase.co
```

This suppresses the warning about missing API URL.

### Step 4: Restart Dev Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 5: Test Login

1. **Try logging in again**
2. **The 406/400 errors should be gone**
3. **Profile will be auto-created on first login**

## What Just Happened?

- ✅ Created `user_profiles` table in Supabase
- ✅ Enabled Row Level Security (RLS)
- ✅ Created policies so users can only see their own data
- ✅ Added indexes for faster queries
- ✅ Disabled email confirmation for easier testing

## Verify It's Working

After running the SQL and restarting:

1. **Check Browser Console** - No more 406/400 errors
2. **Login** - Should work without errors
3. **Check Supabase** - Go to Table Editor → user_profiles → Should see your profile

## Still Getting Errors?

### If you see "permission denied":
- Make sure RLS policies were created (they're in the SQL script)
- Check you're logged in to Supabase

### If table already exists:
- That's fine! The SQL uses `IF NOT EXISTS`
- Your data is safe

### If you want to start fresh:
```sql
DROP TABLE IF EXISTS public.user_profiles CASCADE;
-- Then run QUICK-SETUP.sql again
```

## Next Steps

Once login works:

1. ✅ **Test Registration** - Register a new user
2. ✅ **Check Dashboard** - Should load without errors
3. ✅ **Add More Tables** - Run full `database/schema.sql` for all features
4. ✅ **Add Test Data** - Insert sample prices, suppliers, etc.

## Need Help?

- Check Supabase logs: Dashboard → Logs → Postgres Logs
- Check browser console: F12 → Console tab
- Check Network tab: F12 → Network tab (filter by "user_profiles")

---

**After running this setup, your login should work perfectly!** 🎉



