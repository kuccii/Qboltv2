# Most Efficient Backend Solution: Supabase Integration Guide

## 🎯 Why Supabase? (Most Efficient Right Now)

You already have `@supabase/supabase-js` installed! Supabase provides:

✅ **PostgreSQL Database** - Faster than MongoDB for structured data
✅ **Real-time Subscriptions** - Built-in WebSocket (no custom server needed!)
✅ **Authentication** - Already integrated
✅ **Auto-generated REST API** - No backend coding required
✅ **Storage** - File uploads and document management
✅ **Edge Functions** - Serverless API endpoints
✅ **Row Level Security** - Built-in permissions
✅ **Free Tier** - Great for starting out

## 🚀 Quick Setup (30 minutes)

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a free account
3. Create a new project
4. Note your project URL and anon key

### Step 2: Install & Configure Supabase Client

```bash
# Already installed, but verify
npm list @supabase/supabase-js
```

Create `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Database types (optional but recommended)
export type Database = {
  public: {
    Tables: {
      prices: {
        Row: {
          id: string;
          material: string;
          location: string;
          country: string;
          price: number;
          currency: string;
          unit: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          material: string;
          location: string;
          country: string;
          price: number;
          currency?: string;
          unit?: string;
        };
        Update: {
          price?: number;
          updated_at?: string;
        };
      };
      suppliers: {
        Row: {
          id: string;
          name: string;
          country: string;
          industry: string;
          materials: string[];
          rating: number;
          verified: boolean;
          created_at: string;
        };
        // ... similar types
      };
      // ... other tables
    };
  };
};

export const typedSupabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

### Step 3: Update Environment Variables

Update `.env.local`:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Keep existing
VITE_API_URL=https://your-project.supabase.co/rest/v1
VITE_WS_URL=wss://your-project.supabase.co/realtime/v1
```

### Step 4: Database Schema (SQL in Supabase Dashboard)

Run this SQL in Supabase SQL Editor:

```sql
-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Prices Table
CREATE TABLE IF NOT EXISTS prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material TEXT NOT NULL,
  location TEXT NOT NULL,
  country TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  unit TEXT DEFAULT 'ton',
  change_percent DECIMAL(5, 2) DEFAULT 0,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes for fast queries
  INDEX idx_prices_material ON prices(material),
  INDEX idx_prices_country ON prices(country),
  INDEX idx_prices_updated ON prices(updated_at DESC)
);

-- Suppliers Table
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  INDEX idx_suppliers_country ON suppliers(country),
  INDEX idx_suppliers_industry ON suppliers(industry),
  INDEX idx_suppliers_verified ON suppliers(verified)
);

-- Logistics Routes Table
CREATE TABLE IF NOT EXISTS logistics_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  origin_country TEXT NOT NULL,
  destination_country TEXT NOT NULL,
  distance_km DECIMAL(10, 2),
  estimated_days INTEGER,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  INDEX idx_routes_origin ON logistics_routes(origin_country),
  INDEX idx_routes_destination ON logistics_routes(destination_country)
);

-- Shipments Table
CREATE TABLE IF NOT EXISTS shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_number TEXT UNIQUE NOT NULL,
  route_id UUID REFERENCES logistics_routes(id),
  status TEXT DEFAULT 'pending',
  current_location JSONB,
  estimated_delivery TIMESTAMPTZ,
  actual_delivery TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  INDEX idx_shipments_tracking ON shipments(tracking_number),
  INDEX idx_shipments_status ON shipments(status)
);

-- Real-time Updates (Supabase handles this automatically!)
-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE prices;
ALTER PUBLICATION supabase_realtime ADD TABLE suppliers;
ALTER PUBLICATION supabase_realtime ADD TABLE shipments;

-- Row Level Security Policies
ALTER TABLE prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read prices
CREATE POLICY "Public prices are viewable by everyone"
  ON prices FOR SELECT
  USING (true);

-- Policy: Authenticated users can insert prices
CREATE POLICY "Users can insert prices"
  ON prices FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Similar policies for other tables...
```

## 📡 Real-Time Integration with Supabase

### Replace WebSocket Service with Supabase Realtime

Create `src/services/supabaseRealtime.ts`:

```typescript
import { supabase } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface PriceUpdate {
  id: string;
  material: string;
  location: string;
  country: string;
  price: number;
  currency: string;
  unit: string;
  change_percent: number;
  updated_at: string;
}

export class SupabaseRealtimeService {
  private channels: Map<string, RealtimeChannel> = new Map();

  // Subscribe to price updates
  subscribeToPrices(
    filters: { material?: string; country?: string },
    callback: (update: PriceUpdate) => void
  ): () => void {
    let channelName = 'prices';
    if (filters.material) channelName += `:${filters.material}`;
    if (filters.country) channelName += `:${filters.country}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'prices',
          filter: filters.material
            ? `material=eq.${filters.material}`
            : undefined,
        },
        (payload) => {
          callback(payload.new as PriceUpdate);
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);

    // Return unsubscribe function
    return () => {
      supabase.removeChannel(channel);
      this.channels.delete(channelName);
    };
  }

  // Subscribe to supplier updates
  subscribeToSuppliers(
    filters: { country?: string; industry?: string },
    callback: (update: any) => void
  ): () => void {
    const channelName = `suppliers:${JSON.stringify(filters)}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'suppliers',
        },
        (payload) => {
          callback(payload.new);
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);

    return () => {
      supabase.removeChannel(channel);
      this.channels.delete(channelName);
    };
  }

  // Subscribe to shipment tracking
  subscribeToShipments(
    trackingNumber?: string,
    callback?: (update: any) => void
  ): () => void {
    const channelName = trackingNumber
      ? `shipment:${trackingNumber}`
      : 'shipments:all';

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shipments',
          filter: trackingNumber
            ? `tracking_number=eq.${trackingNumber}`
            : undefined,
        },
        (payload) => {
          callback?.(payload.new);
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);

    return () => {
      supabase.removeChannel(channel);
      this.channels.delete(channelName);
    };
  }

  // Unsubscribe from all channels
  unsubscribeAll(): void {
    this.channels.forEach((channel) => {
      supabase.removeChannel(channel);
    });
    this.channels.clear();
  }
}

export const supabaseRealtime = new SupabaseRealtimeService();
```

### Update Real-time Hooks to Use Supabase

Example: `src/hooks/useRealtimePricesSupabase.ts`:

```typescript
import { useEffect, useState, useCallback } from 'react';
import { supabaseRealtime, PriceUpdate } from '../services/supabaseRealtime';
import { supabase } from '../lib/supabase';

export function useRealtimePricesSupabase(
  filters: { material?: string; country?: string } = {}
) {
  const [prices, setPrices] = useState<PriceUpdate[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      let query = supabase.from('prices').select('*').order('updated_at', { ascending: false }).limit(100);

      if (filters.material) {
        query = query.eq('material', filters.material);
      }
      if (filters.country) {
        query = query.eq('country', filters.country);
      }

      const { data, error } = await query;

      if (!error && data) {
        setPrices(data);
      }
    };

    fetchInitialData();
  }, [filters.material, filters.country]);

  // Real-time subscription
  useEffect(() => {
    const unsubscribe = supabaseRealtime.subscribeToPrices(filters, (update) => {
      setPrices((prev) => {
        // Remove old entry and add new one at the top
        const filtered = prev.filter((p) => p.id !== update.id);
        return [update, ...filtered].slice(0, 100);
      });
    });

    setIsConnected(true);

    return () => {
      unsubscribe();
      setIsConnected(false);
    };
  }, [filters]);

  return { prices, isConnected };
}
```

## 📊 Data Fetching with Supabase

### Replace API Service with Supabase Queries

Create `src/services/supabaseApi.ts`:

```typescript
import { supabase } from '../lib/supabase';

export const supabaseApi = {
  // Prices
  async getPrices(filters?: {
    material?: string;
    country?: string;
    limit?: number;
  }) {
    let query = supabase
      .from('prices')
      .select('*')
      .order('updated_at', { ascending: false });

    if (filters?.material) {
      query = query.eq('material', filters.material);
    }
    if (filters?.country) {
      query = query.eq('country', filters.country);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async insertPrice(price: {
    material: string;
    location: string;
    country: string;
    price: number;
    currency?: string;
    unit?: string;
  }) {
    const { data, error } = await supabase
      .from('prices')
      .insert([price])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Suppliers
  async getSuppliers(filters?: {
    country?: string;
    industry?: string;
    verified?: boolean;
  }) {
    let query = supabase
      .from('suppliers')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.country) {
      query = query.eq('country', filters.country);
    }
    if (filters?.industry) {
      query = query.eq('industry', filters.industry);
    }
    if (filters?.verified !== undefined) {
      query = query.eq('verified', filters.verified);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Shipments
  async getShipments(trackingNumber?: string) {
    let query = supabase.from('shipments').select('*');

    if (trackingNumber) {
      query = query.eq('tracking_number', trackingNumber);
    } else {
      query = query.order('created_at', { ascending: false }).limit(50);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async trackShipment(trackingNumber: string) {
    const { data, error } = await supabase
      .from('shipments')
      .select('*, logistics_routes(*)')
      .eq('tracking_number', trackingNumber)
      .single();

    if (error) throw error;
    return data;
  },
};
```

## 🔐 Authentication Migration

Update `src/lib/auth.ts` to use Supabase:

```typescript
import { supabase } from './supabase';

export const authAPI = {
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new Error(error.message);
    return data;
  },

  async register(email: string, password: string, userData: any) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData, // Additional user metadata
      },
    });

    if (error) throw new Error(error.message);
    return data;
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  },

  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw new Error(error.message);
    return session;
  },
};
```

## ✅ Advantages of Supabase Approach

1. **Zero Backend Code** - Database schema handles everything
2. **Built-in Real-time** - No WebSocket server needed
3. **Auto-generated API** - REST endpoints work immediately
4. **Instant Scaling** - Supabase handles infrastructure
5. **Free Tier** - 500MB database, 50K monthly active users
6. **Type Safety** - TypeScript types from database schema
7. **Row Level Security** - Database-level permissions

## 🚀 Next Steps

1. **Create Supabase Project** (5 min)
2. **Run Database Schema SQL** (10 min)
3. **Update Environment Variables** (2 min)
4. **Replace API Service Calls** (30 min)
5. **Update Real-time Hooks** (30 min)
6. **Test Everything** (30 min)

**Total Time: ~2 hours for full migration**

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)




