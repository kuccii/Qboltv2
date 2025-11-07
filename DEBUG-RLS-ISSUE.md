# 🔧 RLS Policy Error - How to Fix

## The Problem

**Error:** `new row violates row-level security policy for table "user_profiles"`  
**Status Code:** 401 Unauthorized

This means Row Level Security (RLS) is **blocking** the INSERT operation.

## Why This Happens

The RLS policy says: "You can only INSERT if `auth.uid() = id`"

But during profile creation, the session context might not be properly set, or there's a mismatch between the authenticated user ID and the ID being inserted.

## Quick Fix Options

### ✅ Option 1: Disable RLS Temporarily (EASIEST - For Testing Only)

**Run in Supabase SQL Editor:**

Open the file: `ALTERNATIVE-FIX-DISABLE-RLS.sql`

```sql
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
```

**Pros:**
- ✅ Immediate fix
- ✅ Login will work instantly
- ✅ Good for testing

**Cons:**
- ⚠️ No security (anyone can access any profile)
- ⚠️ Only use for development/testing
- ⚠️ Must re-enable for production

**After testing, re-enable:**
```sql
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
```

---

### ✅ Option 2: Fix RLS Policies (RECOMMENDED - For Production)

**Run in Supabase SQL Editor:**

Open the file: `FIX-RLS-POLICY.sql`

This will:
1. Drop existing policies
2. Recreate them with correct permissions
3. Add a service role policy for auto-creation

---

### ✅ Option 3: Check Your Supabase Session

The issue might be that the authenticated user's ID doesn't match the profile ID being created.

**Debug in browser console:**

```javascript
// Check current session
const { data: { session } } = await supabase.auth.getSession();
console.log('Current user ID:', session?.user?.id);

// This should match the ID in the INSERT
```

---

## Step-by-Step Fix (Option 1 - Fastest)

### 1. Open Supabase Dashboard
```
https://supabase.com/dashboard/project/idgnxbrfsnqrzpciwgpv/sql/new
```

### 2. Copy This SQL
```sql
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
```

### 3. Paste and Run
- Paste into SQL Editor
- Click "Run"
- Wait for "Success"

### 4. Try Login Again
- Refresh your app (F5)
- Try logging in
- Should work now!

---

## Step-by-Step Fix (Option 2 - Better)

### 1. Open Supabase Dashboard
```
https://supabase.com/dashboard/project/idgnxbrfsnqrzpciwgpv/sql/new
```

### 2. Open File
Open `FIX-RLS-POLICY.sql` in your VS Code

### 3. Copy ALL the SQL
- Select all (Ctrl+A)
- Copy (Ctrl+C)

### 4. Paste and Run
- Paste into Supabase SQL Editor
- Click "Run"
- Wait for "Success"

### 5. Try Login Again
- Refresh your app
- Try logging in
- Should work now!

---

## How to Verify It Worked

### Before Fix:
```
❌ 401 Unauthorized
❌ RLS policy violation
❌ Login fails
```

### After Fix:
```
✅ 201 Created (or 200 OK)
✅ Profile inserted
✅ Login succeeds
✅ Redirect to /app
```

---

## Understanding the Error

### What RLS Does:
Row Level Security ensures users can only:
- View their own profile
- Update their own profile
- Insert their own profile

### The Policy:
```sql
CREATE POLICY "Users can insert own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

This means: "You can INSERT only if your authenticated user ID (`auth.uid()`) matches the `id` field you're inserting."

### Why It Failed:
Possible reasons:
1. Session not properly established
2. ID mismatch
3. Policy not correctly set up
4. Anon key doesn't have proper permissions

---

## Recommendation

**For now (testing):**
- Use Option 1 (Disable RLS)
- Get login working
- Test all features

**Before production:**
- Re-enable RLS
- Test with proper policies
- Ensure security is working

---

## Quick Commands

**Disable RLS (testing):**
```sql
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
```

**Re-enable RLS (production):**
```sql
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
```

**Check if RLS is enabled:**
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'user_profiles';
```

---

**Choose Option 1 for fastest fix, Option 2 for proper security!** 🔒



