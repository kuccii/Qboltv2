# 🎯 Backend Connection Implementation Plan

## Overview
This plan outlines the steps to connect all remaining pages to the backend and remove all mock data dependencies.

**Timeline**: 4-6 hours  
**Priority**: High (affects user experience and data accuracy)

---

## Phase 1: Quick Wins (1-2 hours) ⚡

### Task 1.1: Supplier Scores Page
**File**: `src/pages/SupplierScores.tsx`  
**Time**: 15 minutes  
**Action**:
1. Remove `import { supplierData } from '../data/mockData'`
2. Add `const { suppliers, loading } = useSuppliers({ industry: currentIndustry })`
3. Replace `supplierData` with `suppliers`
4. Add loading and empty states

**Expected Result**: Page shows real supplier data from database

---

### Task 1.2: Price Reporting Charts
**File**: `src/pages/PriceReporting.tsx`  
**Time**: 20 minutes  
**Action**:
1. Remove `import { priceData, agriculturePriceData } from '../data/mockData'`
2. Add `useEffect` to fetch price trends:
   ```typescript
   const [priceTrends, setPriceTrends] = useState([]);
   useEffect(() => {
     unifiedApi.analytics.getPriceTrends({
       period: '30d',
       country: authState.user?.country,
       materials: industryMaterials
     }).then(setPriceTrends);
   }, [currentIndustry]);
   ```
3. Replace chart data with `priceTrends`

**Expected Result**: Charts show real price trends from database

---

### Task 1.3: Financing Page
**File**: `src/pages/Financing.tsx`  
**Time**: 30 minutes  
**Action**:
1. Remove `import { financingOffers } from '../data/mockData'`
2. Add state and fetch:
   ```typescript
   const [offers, setOffers] = useState([]);
   const [loading, setLoading] = useState(true);
   
   useEffect(() => {
     unifiedApi.financing.getOffers({
       country: authState.user?.country,
       industry: currentIndustry
     }).then(data => {
       setOffers(data || []);
       setLoading(false);
     });
   }, [currentIndustry]);
   ```
3. Replace `financingOffers` with `offers`
4. Add loading and empty states

**Expected Result**: Page shows real financing offers from database

---

### Task 1.4: Agents Directory
**File**: `src/pages/AgentsDirectory.tsx`  
**Time**: 30 minutes  
**Action**:
1. Remove hardcoded agent data
2. Add state and fetch:
   ```typescript
   const [agents, setAgents] = useState([]);
   const [loading, setLoading] = useState(true);
   
   useEffect(() => {
     unifiedApi.agents.get({
       country: authState.user?.country,
       verified: true
     }).then(data => {
       setAgents(data || []);
       setLoading(false);
     });
   }, []);
   ```
3. Replace mock data with `agents`
4. Add loading and empty states

**Expected Result**: Page shows real agents from database

---

## Phase 2: Create Missing Hooks (1 hour) 🔧

### Task 2.1: Create useLogistics Hook
**File**: `src/hooks/useData.ts`  
**Time**: 30 minutes  
**Action**:
```typescript
export function useLogistics(filters?: {
  country?: string;
  from?: string;
  to?: string;
  limit?: number;
}) {
  const [routes, setRoutes] = useState<any[]>([]);
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const [routesData, shipmentsData] = await Promise.race([
        Promise.all([
          unifiedApi.logistics.getRoutes(filters),
          unifiedApi.logistics.getShipments({ limit: filters?.limit || 10 })
        ]),
        timeout
      ]) as [any[], any[]];
      
      setRoutes(routesData || []);
      setShipments(shipmentsData || []);
      setIsConnected(true);
    } catch (err: any) {
      console.error('Failed to fetch logistics data:', err);
      setError(err.message);
      setRoutes([]);
      setShipments([]);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  }, [filters?.country, filters?.from, filters?.to, filters?.limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { routes, shipments, loading, error, isConnected, refetch: fetchData };
}
```

**Expected Result**: Hook available for Logistics page

---

### Task 2.2: Create useDemandData Hook
**File**: `src/hooks/useData.ts`  
**Time**: 30 minutes  
**Action**:
```typescript
export function useDemandData(filters?: {
  country?: string;
  material?: string;
  industry?: string;
  limit?: number;
}) {
  const [demandData, setDemandData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const data = await Promise.race([
        unifiedApi.demand.get(filters),
        timeout
      ]) as any[];
      
      setDemandData(data || []);
    } catch (err: any) {
      console.error('Failed to fetch demand data:', err);
      setError(err.message);
      setDemandData([]);
    } finally {
      setLoading(false);
    }
  }, [filters?.country, filters?.material, filters?.industry, filters?.limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { demandData, loading, error, refetch: fetchData };
}
```

**Expected Result**: Hook available for Demand Mapping page

---

## Phase 3: Update Pages with New Hooks (1 hour) 📄

### Task 3.1: Logistics Page
**File**: `src/pages/Logistics.tsx`  
**Time**: 30 minutes  
**Action**:
1. Remove `import { logisticsData } from '../data/mockData'`
2. Add `import { useLogistics } from '../hooks/useData'`
3. Replace:
   ```typescript
   const { routes, shipments, loading, error, isConnected } = useLogistics({
     country: authState.user?.country
   });
   ```
4. Replace `logisticsData` with `routes` and `shipments`
5. Add loading, error, and empty states

**Expected Result**: Page shows real logistics data from database

---

### Task 3.2: Demand Mapping Page
**File**: `src/pages/DemandMapping.tsx`  
**Time**: 30 minutes  
**Action**:
1. Remove `import { demandData } from '../data/mockData'`
2. Add `import { useDemandData } from '../hooks/useData'`
3. Replace:
   ```typescript
   const { demandData: realDemandData, loading, error } = useDemandData({
     country: authState.user?.country,
     industry: currentIndustry
   });
   ```
4. Update `generateDemandData` to prioritize `realDemandData` over mock
5. Add loading and error states

**Expected Result**: Page shows real demand data (or falls back to mock if empty)

---

## Phase 4: Create Missing APIs (1-2 hours) 🛠️

### Task 4.1: Documents API
**File**: `src/services/unifiedApi.ts`  
**Time**: 1 hour  
**Action**:
Add to `unifiedApi` object:
```typescript
documents: {
  async get(filters?: {
    user_id?: string;
    category?: string;
    limit?: number;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    let query = supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getById(id: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    return data;
  },

  async upload(file: File, metadata: {
    name: string;
    category: string;
    description?: string;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Upload file to storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Create document record
    const { data, error } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        name: metadata.name,
        category: metadata.category,
        description: metadata.description,
        file_url: uploadData.path,
        file_type: file.type,
        file_size: file.size,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get document to delete file
    const doc = await unifiedApi.documents.getById(id);
    
    // Delete file from storage
    if (doc.file_url) {
      await supabase.storage
        .from('documents')
        .remove([doc.file_url]);
    }

    // Delete document record
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  async update(id: string, updates: {
    name?: string;
    category?: string;
    description?: string;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
```

**Expected Result**: Documents API ready for Document Vault page

---

### Task 4.2: Unified Search API
**File**: `src/services/unifiedApi.ts`  
**Time**: 1 hour  
**Action**:
Add to `unifiedApi` object:
```typescript
search: {
  async unified(query: string, types?: ('supplier' | 'price' | 'opportunity' | 'document')[]) {
    if (!query || query.length < 2) return [];

    const searchTypes = types || ['supplier', 'price', 'opportunity', 'document'];
    const results: any[] = [];

    // Search suppliers
    if (searchTypes.includes('supplier')) {
      const { data } = await supabase
        .from('suppliers')
        .select('id, name, country, industry, materials, rating, verified')
        .or(`name.ilike.%${query}%,materials.cs.{${query}}`)
        .limit(10);
      
      if (data) {
        results.push(...data.map(s => ({
          id: s.id,
          type: 'supplier',
          title: s.name,
          subtitle: `${s.country} - ${s.industry}`,
          description: `Rating: ${s.rating || 'N/A'}`,
          url: `/app/supplier-directory/${s.id}`,
          score: (s.rating || 0) / 5,
          metadata: { verified: s.verified, country: s.country }
        })));
      }
    }

    // Search prices
    if (searchTypes.includes('price')) {
      const { data } = await supabase
        .from('prices')
        .select('id, material, location, country, price, currency, unit, change_percent')
        .or(`material.ilike.%${query}%,location.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (data) {
        results.push(...data.map(p => ({
          id: p.id,
          type: 'price',
          title: `${p.material} Price`,
          subtitle: `${p.location}, ${p.country} - ${p.price} ${p.currency}/${p.unit}`,
          description: `Change: ${p.change_percent || 0}%`,
          url: `/app/prices`,
          score: 0.8,
          metadata: { material: p.material, location: p.location }
        })));
      }
    }

    // Search opportunities
    if (searchTypes.includes('opportunity')) {
      const { data } = await supabase
        .from('trade_opportunities')
        .select('id, title, description, material, country, status')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,material.ilike.%${query}%`)
        .eq('status', 'active')
        .limit(10);
      
      if (data) {
        results.push(...data.map(o => ({
          id: o.id,
          type: 'opportunity',
          title: o.title,
          subtitle: `${o.material} - ${o.country}`,
          description: o.description,
          url: `/app/opportunities/${o.id}`,
          score: 0.7,
          metadata: { status: o.status }
        })));
      }
    }

    // Search documents (if user is authenticated)
    if (searchTypes.includes('document')) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('documents')
          .select('id, name, category, description, created_at')
          .eq('user_id', user.id)
          .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(10);
        
        if (data) {
          results.push(...data.map(d => ({
            id: d.id,
            type: 'document',
            title: d.name,
            subtitle: d.category,
            description: d.description,
            url: `/app/documents/${d.id}`,
            score: 0.6,
            metadata: { category: d.category }
          })));
        }
      }
    }

    // Sort by score and return
    return results.sort((a, b) => b.score - a.score);
  }
}
```

**Expected Result**: Unified search API ready for Search functionality

---

## Phase 5: Update Remaining Pages (1 hour) 📝

### Task 5.1: Document Vault Page
**File**: `src/pages/DocumentVault.tsx`  
**Time**: 30 minutes  
**Action**:
1. Remove hardcoded document data
2. Add state and fetch:
   ```typescript
   const [documents, setDocuments] = useState([]);
   const [loading, setLoading] = useState(true);
   
   useEffect(() => {
     unifiedApi.documents.get({
       limit: 100
     }).then(data => {
       setDocuments(data || []);
       setLoading(false);
     });
   }, []);
   ```
3. Replace mock data with `documents`
4. Add loading, error, and empty states
5. Connect upload/delete/update to API

**Expected Result**: Page shows real documents from database

---

### Task 5.2: Search Hook
**File**: `src/hooks/useSearch.ts`  
**Time**: 30 minutes  
**Action**:
1. Remove `mockSearchData` array
2. Replace with:
   ```typescript
   const results = await unifiedApi.search.unified(query, types);
   ```
3. Add loading and error states

**Expected Result**: Search shows real results from database

---

## Phase 6: Seed Missing Data (1 hour) 🌱

### Task 6.1: Create Seed Data SQL
**File**: `database/SEED-REMAINING-DATA.sql`  
**Time**: 1 hour  
**Action**: Create SQL file with:
- 20 user_activities records
- 10 trade_opportunities records
- 15 demand_data records
- 10 financing_offers records
- 5 agents records
- 10 shipments records

**Expected Result**: All tables have sample data

---

## Testing Checklist ✅

After each phase, test:

- [ ] Page loads without errors
- [ ] Data displays correctly
- [ ] Loading states show during fetch
- [ ] Error states show on failure
- [ ] Empty states show when no data
- [ ] Filters work correctly
- [ ] Real-time updates work (if applicable)

---

## Rollback Plan 🔄

If issues occur:
1. Keep mock data imports commented (not deleted)
2. Add feature flag: `USE_REAL_DATA = true`
3. Can quickly revert by uncommenting mock imports

---

## Success Criteria 🎯

- ✅ Zero imports from `mockData.ts` in page components
- ✅ All pages show real data from database
- ✅ All pages have loading/error/empty states
- ✅ All API methods exist and work
- ✅ All hooks exist and work
- ✅ All tables have seed data

---

**Estimated Total Time**: 4-6 hours  
**Priority**: High  
**Status**: Ready to start

