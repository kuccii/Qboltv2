# Supabase Quick Start - Your Project is Ready! 🚀

## ✅ What's Been Set Up

### 1. **Supabase Client** (`src/lib/supabase.ts`)
   - ✅ Configured with your credentials
   - ✅ TypeScript types included
   - ✅ Optimized settings for auth and real-time

### 2. **Supabase API Service** (`src/services/supabaseApi.ts`)
   - ✅ Complete CRUD operations for prices, suppliers, shipments
   - ✅ Filtering and sorting
   - ✅ Error handling
   - ✅ Type-safe queries

### 3. **Supabase Realtime Service** (`src/services/supabaseRealtime.ts`)
   - ✅ Real-time subscriptions for prices, suppliers, shipments
   - ✅ Channel management
   - ✅ Automatic reconnection

### 4. **Environment Variables**
   - ✅ Updated `.env.example` with Supabase URLs
   - ✅ Your credentials are in `src/lib/supabase.ts` (hardcoded for now)

## 🗄️ Next Step: Create Database Schema

Go to your Supabase Dashboard:
1. Navigate to **SQL Editor**
2. Copy and paste this SQL:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Prices Table
CREATE TABLE IF NOT EXISTS prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  material TEXT NOT NULL,
  location TEXT NOT NULL,
  country TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  unit TEXT DEFAULT 'ton',
  change_percent DECIMAL(5, 2) DEFAULT 0,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Suppliers Table
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  industry TEXT NOT NULL,
  materials TEXT[] NOT NULL,
  rating DECIMAL(3, 2) DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  phone TEXT,
  email TEXT,
  website TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shipments Table
CREATE TABLE IF NOT EXISTS shipments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tracking_number TEXT UNIQUE NOT NULL,
  route_id UUID,
  status TEXT DEFAULT 'pending',
  current_location JSONB,
  estimated_delivery TIMESTAMPTZ,
  actual_delivery TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_prices_material ON prices(material);
CREATE INDEX IF NOT EXISTS idx_prices_country ON prices(country);
CREATE INDEX IF NOT EXISTS idx_prices_updated ON prices(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_suppliers_country ON suppliers(country);
CREATE INDEX IF NOT EXISTS idx_suppliers_industry ON suppliers(industry);
CREATE INDEX IF NOT EXISTS idx_suppliers_verified ON suppliers(verified);

CREATE INDEX IF NOT EXISTS idx_shipments_tracking ON shipments(tracking_number);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);

-- Enable Row Level Security (RLS)
ALTER TABLE prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow public read access (for now)
CREATE POLICY "Public prices are viewable by everyone"
  ON prices FOR SELECT
  USING (true);

CREATE POLICY "Public suppliers are viewable by everyone"
  ON suppliers FOR SELECT
  USING (true);

CREATE POLICY "Public shipments are viewable by everyone"
  ON shipments FOR SELECT
  USING (true);

-- Allow authenticated users to insert
CREATE POLICY "Authenticated users can insert prices"
  ON prices FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert suppliers"
  ON suppliers FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert shipments"
  ON shipments FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Enable Realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE prices;
ALTER PUBLICATION supabase_realtime ADD TABLE suppliers;
ALTER PUBLICATION supabase_realtime ADD TABLE shipments;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
CREATE TRIGGER update_prices_updated_at BEFORE UPDATE ON prices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON shipments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

3. Click **Run** to execute the SQL

## 🧪 Test Your Setup

Create a test file `src/test-supabase.ts`:

```typescript
import { supabaseApi } from './services/supabaseApi';
import { supabaseRealtime } from './services/supabaseRealtime';

// Test API calls
async function testSupabase() {
  try {
    // Test fetching prices
    const prices = await supabaseApi.prices.get({ limit: 10 });
    console.log('Prices:', prices);

    // Test creating a price
    const newPrice = await supabaseApi.prices.create({
      material: 'Cement',
      location: 'Nairobi',
      country: 'Kenya',
      price: 450.50,
      currency: 'KES',
      unit: 'ton',
    });
    console.log('Created price:', newPrice);

    // Test real-time subscription
    const unsubscribe = supabaseRealtime.subscribeToPrices(
      { country: 'Kenya' },
      (update) => {
        console.log('Real-time price update:', update);
      }
    );

    // Cleanup after 10 seconds
    setTimeout(() => {
      unsubscribe();
      console.log('Unsubscribed');
    }, 10000);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Uncomment to test:
// testSupabase();
```

## 📝 Using Supabase in Your Components

### Example: Fetching Prices

```typescript
import { useEffect, useState } from 'react';
import { supabaseApi } from '../services/supabaseApi';

function PriceList() {
  const [prices, setPrices] = useState([]);

  useEffect(() => {
    async function fetchPrices() {
      const data = await supabaseApi.prices.get({
        country: 'Kenya',
        limit: 20,
      });
      setPrices(data);
    }
    fetchPrices();
  }, []);

  return (
    <div>
      {prices.map(price => (
        <div key={price.id}>
          {price.material}: {price.price} {price.currency}
        </div>
      ))}
    </div>
  );
}
```

### Example: Real-time Updates

```typescript
import { useEffect, useState } from 'react';
import { supabaseRealtime } from '../services/supabaseRealtime';

function LivePrices() {
  const [prices, setPrices] = useState([]);

  useEffect(() => {
    const unsubscribe = supabaseRealtime.subscribeToPrices(
      { country: 'Kenya' },
      (update) => {
        setPrices((prev) => [update, ...prev].slice(0, 20));
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div>
      <h3>Live Prices</h3>
      {prices.map(price => (
        <div key={price.id}>
          {price.material}: {price.price}
        </div>
      ))}
    </div>
  );
}
```

## ✅ Checklist

- [x] Supabase client configured
- [x] API service created
- [x] Realtime service created
- [ ] Run SQL schema in Supabase dashboard
- [ ] Test API calls
- [ ] Test real-time subscriptions
- [ ] Integrate into components

## 🚀 Next Steps

1. **Run the SQL schema** in Supabase dashboard
2. **Test the connection** with the test file
3. **Start using** `supabaseApi` and `supabaseRealtime` in your components
4. **Replace** existing API calls with Supabase calls

## 📚 Documentation

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

Your Supabase integration is ready! 🎉

