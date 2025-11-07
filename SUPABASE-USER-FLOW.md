# Supabase Database - User Authentication Flow

## ✅ Confirmed: Users Come from Supabase Database

### Complete Data Flow

```
User Login
    ↓
1. Supabase Auth validates credentials
   (supabase.auth.signInWithPassword)
    ↓
2. Returns authenticated user + session
    ↓
3. Fetch user profile from DATABASE
   (unifiedApi.user.getProfile)
    ↓
4. Query: SELECT * FROM user_profiles WHERE id = user.id
    ↓
5. Returns user profile data from Supabase PostgreSQL
    ↓
6. Set auth state with database user data
    ↓
7. Navigate to /app with user data
```

## 📊 Database Tables Used

### 1. Supabase Auth (Built-in)
**Table:** `auth.users`
- Managed by Supabase Auth
- Stores email, password hash, metadata
- Used for authentication only

### 2. User Profiles (Custom)
**Table:** `public.user_profiles`
- Your custom table (created by `database/schema.sql`)
- Stores complete user information
- **This is where user data comes from**

**Columns:**
```sql
user_profiles:
  - id (UUID, references auth.users)
  - email (TEXT)
  - name (TEXT)
  - company (TEXT)
  - industry (TEXT: 'construction' | 'agriculture')
  - country (TEXT)
  - phone (TEXT)
  - role (TEXT: 'user' | 'admin' | 'supplier' | 'agent')
  - subscription_tier (TEXT)
  - avatar_url (TEXT)
  - preferences (JSONB)
  - metadata (JSONB)
  - created_at (TIMESTAMPTZ)
  - updated_at (TIMESTAMPTZ)
```

## 🔍 How User Data is Fetched

### Step 1: Authentication
**File:** `src/contexts/AuthContext.tsx` (line 155-158)
```typescript
const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
  email: email.toLowerCase().trim(),
  password,
});
```
- Validates credentials against Supabase Auth
- Returns user ID and session

### Step 2: Fetch Profile from Database
**File:** `src/contexts/AuthContext.tsx` (line 198)
```typescript
let profile = await unifiedApi.user.getProfile(authData.user.id);
```

**File:** `src/services/unifiedApi.ts` (lines 28-41)
```typescript
async getProfile(userId?: string): Promise<UserProfile | null> {
  const id = userId || (await supabase.auth.getUser()).data.user?.id;
  if (!id) return null;

  const { data, error } = await supabase
    .from('user_profiles')  // ← Queries Supabase database
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}
```

**This queries the `user_profiles` table in your Supabase PostgreSQL database.**

### Step 3: Auto-Create Profile if Missing
**File:** `src/contexts/AuthContext.tsx` (lines 202-214)
```typescript
if (!profile) {
  const { data: newProfile, error: profileError } = await supabase
    .from('user_profiles')  // ← Inserts into Supabase database
    .insert({
      id: authData.user.id,
      email: authData.user.email || email,
      name: authData.user.user_metadata?.name || email.split('@')[0],
      company: authData.user.user_metadata?.company || '',
      industry: authData.user.user_metadata?.industry || 'construction',
      country: authData.user.user_metadata?.country || 'Kenya',
      role: 'user',
    })
    .select()
    .single();
  
  profile = newProfile;
}
```

### Step 4: Return User Data
**File:** `src/contexts/AuthContext.tsx` (lines 232-240)
```typescript
const user: AuthUser = {
  id: profile.id,           // From database
  name: profile.name,       // From database
  email: profile.email,     // From database
  company: profile.company, // From database
  industry: profile.industry, // From database
  country: profile.country,   // From database
  role: profile.role,         // From database
};

setAuthState({ user });  // Sets user from database
```

## 🗄️ Database Structure

```
Supabase Database
│
├── auth.users (Supabase managed)
│   ├── id (UUID)
│   ├── email
│   ├── encrypted_password
│   └── user_metadata
│
└── public.user_profiles (Your custom table)
    ├── id (references auth.users.id)
    ├── email
    ├── name
    ├── company
    ├── industry
    ├── country
    ├── phone
    ├── role
    └── ... (all user data)
```

## 🔐 Row Level Security (RLS)

**File:** `database/rls-policies.sql`

```sql
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);
```

**This ensures users only see their own data from the database.**

## 📝 Registration Flow (Creates Database Record)

**File:** `src/contexts/AuthContext.tsx` (lines 257-273)
```typescript
// 1. Create user in Supabase Auth
const { data: authData, error: authError } = await supabase.auth.signUp({
  email,
  password,
  options: { data: userData }
});

// 2. Create profile in database
const { data: profile, error: profileError } = await supabase
  .from('user_profiles')  // ← Creates record in database
  .insert({
    id: authData.user.id,
    email: authData.user.email || email,
    name: userData.name,
    company: userData.company,
    industry: userData.industry,
    country: userData.country,
    phone: userData.phone,
    role: 'user',
  })
  .select()
  .single();
```

## ✅ Summary: Users are 100% from Supabase Database

### On Login:
1. ✅ Authenticate via Supabase Auth
2. ✅ Fetch user profile from `user_profiles` table in Supabase database
3. ✅ All user data comes from database
4. ✅ No mock data used (except demo user fallback)

### On Registration:
1. ✅ Create user in Supabase Auth
2. ✅ Create profile in `user_profiles` table in Supabase database
3. ✅ All data stored in database

### Data Source Priority:
1. **Primary**: Supabase database (`user_profiles` table)
2. **Fallback**: Local auth (demo users only, if Supabase fails)

## 🔍 Verify in Supabase Dashboard

### After Login:
1. Go to Supabase Dashboard
2. **Authentication** → **Users** (see authenticated users)
3. **Table Editor** → **user_profiles** (see user data)
4. Click on a user → See all profile data from database

### Check Query:
```sql
SELECT * FROM user_profiles WHERE email = 'user@example.com';
```

This shows the exact data that's fetched during login.

## 🎯 Key Points

1. ✅ **All user data comes from Supabase PostgreSQL database**
2. ✅ **`user_profiles` table stores complete user information**
3. ✅ **Login fetches from database using `unifiedApi.user.getProfile()`**
4. ✅ **Row Level Security ensures data privacy**
5. ✅ **Profile auto-created if missing**

**Your users are 100% stored in and fetched from Supabase database!** 🎉



