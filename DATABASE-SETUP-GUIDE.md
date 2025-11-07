# Complete Database Setup Guide

## 🎯 Quick Setup (15 minutes)

### Step 1: Run Database Schema

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/idgnxbrfsnqrzpciwgpv)
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `database/schema.sql`
4. Click **Run**

### Step 2: Run RLS Policies

1. Still in **SQL Editor**
2. Copy and paste the contents of `database/rls-policies.sql`
3. Click **Run**

### Step 3: Verify Setup

1. Go to **Table Editor** in Supabase Dashboard
2. Verify these tables exist:
   - `user_profiles`
   - `prices`
   - `suppliers`
   - `shipments`
   - `trade_opportunities`
   - `notifications`
   - `risk_alerts`
   - `documents`

## ✅ What's Included

### Database Tables (20+ tables)
- **User Management**: profiles, activities
- **Market Intelligence**: prices, price_reports, demand_data, market_trends
- **Supplier Management**: suppliers, supplier_scores, supplier_reviews, supplier_documents
- **Agents**: agents, agent_bookings
- **Logistics**: logistics_routes, shipments, shipment_events
- **Financing**: financing_offers, financing_applications
- **Risk Management**: risk_alerts, risk_assessments
- **Documents**: documents (with versioning)
- **Notifications**: notifications
- **Trade**: trade_opportunities, opportunity_matches

### Row Level Security (RLS)
- ✅ User-based data isolation
- ✅ Public read access where appropriate
- ✅ User-specific data (shipments, notifications, documents)
- ✅ Admin-only operations
- ✅ Verified user actions

### Real-time Subscriptions
- ✅ Prices updates
- ✅ Supplier updates
- ✅ Shipment tracking
- ✅ Trade opportunities
- ✅ Risk alerts
- ✅ Notifications

### Performance Optimizations
- ✅ Indexes on all query fields
- ✅ Full-text search indexes
- ✅ Automatic updated_at triggers
- ✅ Rating calculation triggers
- ✅ Optimized queries

## 📊 Data Flow

```
User Action
    ↓
React Component
    ↓
useData Hook / unifiedApi
    ↓
Supabase Client
    ↓
PostgreSQL Database (with RLS)
    ↓
Real-time Subscription (if enabled)
    ↓
Component Updates Automatically
```

## 🔐 Security Features

1. **Row Level Security (RLS)**
   - Users can only see their own data
   - Public data is readable by all
   - Admins have elevated permissions

2. **Authentication**
   - Supabase Auth handles authentication
   - JWT tokens for API calls
   - Session management

3. **Data Validation**
   - Database constraints
   - Type checking
   - Required fields

## 🧪 Test Your Setup

### Test 1: Create a User Profile
```typescript
import { unifiedApi } from './services/unifiedApi';

// After registration
const profile = await unifiedApi.user.getProfile();
console.log('Profile:', profile);
```

### Test 2: Create a Price
```typescript
const price = await unifiedApi.prices.create({
  material: 'Cement',
  location: 'Nairobi',
  country: 'Kenya',
  price: 450.50,
  currency: 'KES',
  unit: 'ton',
});
console.log('Created price:', price);
```

### Test 3: Real-time Updates
```typescript
import { usePrices } from './hooks/useData';

function TestComponent() {
  const { prices, isConnected } = usePrices({ country: 'Kenya' });
  console.log('Prices:', prices, 'Connected:', isConnected);
}
```

## ✅ Checklist

- [ ] Run `database/schema.sql` in Supabase
- [ ] Run `database/rls-policies.sql` in Supabase
- [ ] Verify tables exist
- [ ] Test user registration
- [ ] Test price creation
- [ ] Test real-time subscription
- [ ] Verify RLS is working

## 📈 Next Steps

1. **Seed Initial Data** (Optional)
   - Add sample suppliers
   - Add sample prices
   - Add sample routes

2. **Configure Storage** (For documents/files)
   - Set up Supabase Storage buckets
   - Configure access policies

3. **Set Up Edge Functions** (Optional)
   - For complex operations
   - Scheduled tasks
   - Webhooks

Your database is ready for a world-class application! 🚀

