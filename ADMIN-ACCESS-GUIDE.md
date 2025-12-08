# 🔐 Admin Panel Access Guide

## How to Access the Admin Panel

The admin panel is accessible in multiple ways, but **only for users with the `admin` role**.

### 🔑 Prerequisites

1. **User must be authenticated** (logged in)
2. **User must have `role = 'admin'` in their user profile**
3. **User must have selected an industry** (for `/app` routes)

---

## 📍 Access Points

### 1. **Desktop Navigation** (Main Menu)

**Location:** Top navigation bar, visible only to admin users

**Path:** `Navigation.tsx` → Admin Dropdown

**How to Access:**
- Look for the **"Admin"** dropdown in the main navigation bar
- Click on "Admin" to see the dropdown menu
- Options available:
  - **Admin Dashboard** → `/app/admin`
  - **Manage Prices** → `/app/admin/prices`
  - **Manage Suppliers** → `/app/admin/suppliers`
  - **Manage Users** → `/app/admin/users`

**Visibility:** Only visible when `currentUser?.role === 'admin'`

```typescript
{currentUser?.role === 'admin' && (
  <Dropdown icon={Settings2} label="Admin" dropdownKey="admin">
    <DropdownItem to="/app/admin" icon={ShieldCheck} label="Admin Dashboard" />
    <DropdownItem to="/app/admin/prices" icon={TrendingUp} label="Manage Prices" />
    <DropdownItem to="/app/admin/suppliers" icon={Package} label="Manage Suppliers" />
    <DropdownItem to="/app/admin/users" icon={Users} label="Manage Users" />
  </Dropdown>
)}
```

---

### 2. **Mobile Navigation** (Hamburger Menu)

**Location:** Mobile slide-out menu, visible only to admin users

**Path:** `MobileNavigation.tsx` → Admin Section

**How to Access:**
- Click the hamburger menu (☰) icon on mobile
- Scroll to find the **"Admin"** section
- Click to expand and see:
  - **Admin Dashboard** → `/app/admin`

**Visibility:** Only visible when `currentUser?.role === 'admin'`

```typescript
{currentUser?.role === 'admin' && (
  <SectionDropdown icon={Settings2} label="Admin" section="admin">
    <NavItem to="/app/admin" icon={ShieldCheck} label="Admin Dashboard" />
  </SectionDropdown>
)}
```

---

### 3. **User Menu** (Profile Dropdown)

**Location:** User avatar/profile dropdown in top-right corner

**Path:** `UserMenu.tsx` → Admin Section

**How to Access:**
- Click on your user avatar/name in the top-right corner
- Scroll down to find the **"Admin"** section (separated by a border)
- Click on **"Admin Dashboard"** → `/app/admin`

**Visibility:** Only visible when `currentUser?.role === 'admin'`

```typescript
{currentUser?.role === 'admin' && (
  <div className="border-t border-gray-200 dark:border-gray-700 py-2">
    <button onClick={() => { navigate('/app/admin'); onClose(); }}>
      <Shield size={20} className="text-red-500" />
      <p>Admin Dashboard</p>
      <p>System administration and controls</p>
    </button>
  </div>
)}
```

---

### 4. **Direct URL Access**

**How to Access:**
- Type the URL directly in your browser
- Or use browser bookmarks

**Available URLs:**
- `/app/admin` - Admin Dashboard
- `/app/admin/prices` - Price Manager
- `/app/admin/suppliers` - Supplier Manager
- `/app/admin/agents` - Agent Manager
- `/app/admin/financing` - Financing Manager
- `/app/admin/logistics` - Logistics Manager
- `/app/admin/demand` - Demand Manager
- `/app/admin/risk` - Risk Manager
- `/app/admin/documents` - Document Manager
- `/app/admin/users` - User Manager
- `/app/admin/import` - Bulk Import
- `/app/admin/export` - Bulk Export

**Security:** All routes are protected by `ProtectedRoute` with `adminOnly` flag

---

## 🛡️ Security & Protection

### Route Protection

All admin routes are protected using `ProtectedRoute` component:

```typescript
<Route path="admin" element={
  <ProtectedRoute adminOnly>
    <Outlet />
  </ProtectedRoute>
}>
  {/* All child routes inherit admin protection */}
</Route>
```

### Protection Checks

1. **Authentication Check:**
   - User must be logged in
   - Redirects to `/login` if not authenticated

2. **Role Check:**
   - User must have `role === 'admin'`
   - Shows "Access Denied" page if not admin
   - Redirects to `/app` (dashboard) if not admin

3. **Industry Selection:**
   - User must have selected an industry
   - Redirects to `/select-industry` if not selected

### Access Denied Page

If a non-admin user tries to access admin routes, they see:

```
🛡️ Access Denied

You don't have permission to access this page. 
Admin privileges required.
```

---

## 👤 How to Make a User an Admin

### Method 1: Via Admin Panel (if you're already admin)

1. Go to `/app/admin/users`
2. Find the user you want to make admin
3. Change their role from "User" to "Admin" in the dropdown
4. Save

### Method 2: Via Database (Direct SQL)

```sql
-- Update user role to admin
UPDATE user_profiles
SET role = 'admin'
WHERE id = 'USER_ID_HERE';

-- Or by email
UPDATE user_profiles
SET role = 'admin'
WHERE email = 'user@example.com';
```

### Method 3: Via Supabase Dashboard

1. Go to Supabase Dashboard
2. Navigate to Table Editor → `user_profiles`
3. Find the user
4. Edit the `role` field to `'admin'`
5. Save

---

## 🔍 How to Check if User is Admin

### In Code

```typescript
import { useAuth } from '../contexts/AuthContext';

const MyComponent = () => {
  const { authState, isAdmin } = useAuth();
  
  // Method 1: Using isAdmin helper
  if (isAdmin) {
    // User is admin
  }
  
  // Method 2: Check role directly
  if (authState.user?.role === 'admin') {
    // User is admin
  }
};
```

### In Database

```sql
-- Check user role
SELECT id, email, name, role
FROM user_profiles
WHERE id = 'USER_ID_HERE';

-- List all admins
SELECT id, email, name, role
FROM user_profiles
WHERE role = 'admin';
```

---

## 📱 Visual Indicators

### Desktop Navigation
- **Admin dropdown** appears in main navigation (only for admins)
- Icon: ⚙️ Settings2
- Label: "Admin"

### Mobile Navigation
- **Admin section** appears in mobile menu (only for admins)
- Icon: ⚙️ Settings2
- Label: "Admin"

### User Menu
- **Admin section** appears at bottom of user menu (only for admins)
- Icon: 🛡️ Shield (red color)
- Label: "Admin Dashboard"
- Description: "System administration and controls"

---

## 🚨 Troubleshooting

### "Access Denied" Error

**Possible Causes:**
1. User role is not set to `'admin'`
2. User profile doesn't exist
3. Session expired (need to re-login)

**Solutions:**
1. Check user role in database: `SELECT role FROM user_profiles WHERE id = 'USER_ID'`
2. Update role to admin if needed
3. Log out and log back in

### Admin Menu Not Showing

**Possible Causes:**
1. User is not logged in
2. User role is not `'admin'`
3. Component not checking role correctly

**Solutions:**
1. Verify user is logged in
2. Check `authState.user?.role === 'admin'`
3. Check browser console for errors

### Can't Access Admin Routes

**Possible Causes:**
1. Route protection is working (user is not admin)
2. Industry not selected
3. Not authenticated

**Solutions:**
1. Verify user role is `'admin'`
2. Select an industry if prompted
3. Ensure user is logged in

---

## 📋 Quick Reference

| Access Method | Location | Visibility | Route |
|--------------|----------|------------|-------|
| Desktop Nav | Top navigation | Admin only | `/app/admin` |
| Mobile Nav | Hamburger menu | Admin only | `/app/admin` |
| User Menu | Profile dropdown | Admin only | `/app/admin` |
| Direct URL | Browser | Protected | `/app/admin/*` |

---

## ✅ Summary

**Admin panel is accessible through:**
1. ✅ Desktop navigation dropdown (Admin → Admin Dashboard)
2. ✅ Mobile navigation menu (Admin section)
3. ✅ User menu (Admin Dashboard link)
4. ✅ Direct URL access (protected by route guards)

**All access points:**
- ✅ Only visible to users with `role === 'admin'`
- ✅ Protected by `ProtectedRoute` with `adminOnly` flag
- ✅ Require authentication and industry selection
- ✅ Show "Access Denied" for non-admin users

**To make a user admin:**
- Update `user_profiles.role` to `'admin'` in database
- Or use Admin Panel → Users → Change Role

---

**The admin panel is fully functional and secure!** 🎉

