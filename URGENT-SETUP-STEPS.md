# 🚨 URGENT: Fix 406/400 Errors - Setup Database

## The Problem
Your Supabase database doesn't have the `user_profiles` table yet. That's why you're getting 406/400 errors.

## The Solution (Takes 2 Minutes)

### 📋 Step-by-Step Instructions

#### 1. Open Supabase Dashboard
```
https://supabase.com/dashboard/project/idgnxbrfsnqrzpciwgpv
```
- Click the link above
- Login if needed

#### 2. Go to SQL Editor
- Look at the LEFT sidebar
- Click on **"SQL Editor"** (it has a document icon)
- Click **"New Query"** button (top right)

#### 3. Copy the SQL
- In your VS Code, open: `RUN-THIS-IN-SUPABASE.sql`
- Select ALL the text (Ctrl+A)
- Copy it (Ctrl+C)

#### 4. Paste and Run
- Go back to Supabase SQL Editor
- Paste the SQL (Ctrl+V)
- Click the **"Run"** button (or press Ctrl+Enter)
- Wait for "Success. No rows returned" message

#### 5. Verify Table Created
- Look at LEFT sidebar again
- Click **"Table Editor"**
- You should see **"user_profiles"** in the list
- Click it to see the table structure (it will be empty)

#### 6. Disable Email Confirmation (For Testing)
- LEFT sidebar → Click **"Authentication"**
- Click **"Providers"** (in the sub-menu)
- Find **"Email"** provider
- Click it to expand
- Find **"Confirm email"** toggle
- Turn it **OFF**
- Click **"Save"**

#### 7. Restart Your Dev Server
```bash
# In your terminal, press Ctrl+C to stop
# Then run:
npm run dev
```

#### 8. Try Login Again
- Refresh your browser (F5)
- Try logging in
- **The 406/400 errors should be GONE!**

---

## 🎯 Quick Checklist

- [ ] Opened Supabase Dashboard
- [ ] Went to SQL Editor
- [ ] Copied `RUN-THIS-IN-SUPABASE.sql`
- [ ] Pasted and clicked Run
- [ ] Saw "Success" message
- [ ] Verified `user_profiles` in Table Editor
- [ ] Disabled email confirmation
- [ ] Restarted dev server
- [ ] Tried login again

---

## ✅ How to Verify It Worked

### In Browser Console (F12):
**Before:**
```
❌ Failed to load resource: 406
❌ Failed to load resource: 400
```

**After:**
```
✅ No errors
✅ Login successful
```

### In Supabase Dashboard:
- Table Editor → `user_profiles` → Should see your user after login

---

## 🆘 Still Having Issues?

### Error: "relation does not exist"
- The SQL didn't run successfully
- Try running it again
- Check for any error messages in red

### Error: "permission denied"
- RLS policies not created
- Re-run the SQL script
- Make sure you're logged into Supabase

### Error: "duplicate key value"
- Table already exists (that's fine!)
- Just try logging in

### Error: Still getting 406/400
- Clear browser cache (Ctrl+Shift+Delete)
- Restart dev server
- Make sure table exists: Table Editor → user_profiles

---

## 📱 What This SQL Does

1. **Creates `user_profiles` table** - Stores user information
2. **Enables RLS** - Security so users only see their own data
3. **Creates policies** - Allows users to read/write their profile
4. **Creates indexes** - Makes queries faster

---

## 🎉 After This Works

You can then:
1. ✅ Login successfully
2. ✅ Register new users
3. ✅ See your profile in Supabase
4. ✅ Use the app without errors

Then later, you can run the full schema:
- `database/schema.sql` - For all features (prices, suppliers, etc.)

---

## Need Help?

**Check these:**
1. Supabase Dashboard → Logs → See any errors
2. Browser Console (F12) → See exact error messages
3. Network tab (F12) → See which requests are failing

**Common mistakes:**
- Not running the SQL at all ← Most common!
- Running SQL in wrong project
- Not refreshing browser after SQL
- Not restarting dev server

---

**👉 The most important step: RUN THE SQL IN SUPABASE!** 👈

Without this, nothing will work. The table MUST exist first.



