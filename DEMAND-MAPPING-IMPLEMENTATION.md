# Demand Mapping Implementation Guide

## Overview
Demand mapping should be integrated into the country profile system as part of the **Intelligence** tab. This provides country-specific demand patterns, forecasts, and market opportunities.

## Implementation Steps

### 1. Database Schema (Add to Supabase)

```sql
-- Demand mapping table (country-specific)
CREATE TABLE IF NOT EXISTS country_demand (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  country_code TEXT NOT NULL REFERENCES country_profiles(code) ON DELETE CASCADE,
  region TEXT NOT NULL,
  material TEXT NOT NULL,
  industry TEXT NOT NULL CHECK (industry IN ('construction', 'agriculture')),
  demand_quantity DECIMAL(12, 2) NOT NULL,
  demand_unit TEXT NOT NULL DEFAULT 'tons',
  trend TEXT CHECK (trend IN ('up', 'down', 'stable')),
  coordinates POINT, -- PostGIS point for map visualization
  forecast_demand DECIMAL(12, 2), -- Forecasted demand
  forecast_period TEXT, -- '30d', '90d', '6m', '1y'
  source TEXT, -- 'user_contributed', 'logcluster', 'verified_partner'
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_country_demand_country ON country_demand(country_code);
CREATE INDEX idx_country_demand_region ON country_demand(region);
CREATE INDEX idx_country_demand_material ON country_demand(material);
CREATE INDEX idx_country_demand_industry ON country_demand(industry);
CREATE INDEX idx_country_demand_timestamp ON country_demand(timestamp DESC);

-- RLS Policies
ALTER TABLE country_demand ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view demand data for their country"
  ON country_demand FOR SELECT
  USING (
    country_code IN (
      SELECT country FROM user_profiles WHERE id = auth.uid()
    )
    OR country_code IN (SELECT code FROM country_profiles)
  );

CREATE POLICY "Users can insert demand data"
  ON country_demand FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own demand data"
  ON country_demand FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);
```

### 2. API Methods (Add to unifiedApi.ts)

Add to `unifiedApi.countries`:

```typescript
countries: {
  // ... existing methods ...

  async getDemand(countryCode: string, filters?: {
    region?: string;
    material?: string;
    industry?: string;
    trend?: 'up' | 'down' | 'stable';
    timeRange?: 'current' | 'forecast' | 'historical';
  }) {
    let query = supabase
      .from('country_demand')
      .select('*')
      .eq('country_code', countryCode.toUpperCase())
      .order('timestamp', { ascending: false });

    if (filters?.region) {
      query = query.eq('region', filters.region);
    }
    if (filters?.material) {
      query = query.eq('material', filters.material);
    }
    if (filters?.industry) {
      query = query.eq('industry', filters.industry);
    }
    if (filters?.trend) {
      query = query.eq('trend', filters.trend);
    }
    if (filters?.timeRange === 'forecast') {
      query = query.not('forecast_demand', 'is', null);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async submitDemandData(countryCode: string, data: {
    region: string;
    material: string;
    industry: string;
    demand_quantity: number;
    demand_unit?: string;
    trend?: 'up' | 'down' | 'stable';
    coordinates?: [number, number];
    forecast_demand?: number;
    forecast_period?: string;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: result, error } = await supabase
      .from('country_demand')
      .insert({
        ...data,
        country_code: countryCode.toUpperCase(),
        source: 'user_contributed',
      })
      .select()
      .single();

    if (error) throw error;
    return result;
  },
}
```

### 3. Integrate into RwandaSmartFeatures Component

Add a new tab for "Demand Mapping" in `RwandaSmartFeatures.tsx`:

```typescript
// Add to interface
interface SmartFeaturesProps {
  className?: string;
  countryCode?: string; // Add countryCode prop
}

// Add state for demand data
const [demandData, setDemandData] = useState<any[]>([]);
const [demandView, setDemandView] = useState<'heatmap' | 'points' | 'clusters'>('heatmap');

// Add demand tab
const [selectedTab, setSelectedTab] = useState<'recommendations' | 'comparisons' | 'alerts' | 'demand'>('recommendations');

// Fetch demand data
useEffect(() => {
  if (selectedTab === 'demand') {
    loadDemandData();
  }
}, [selectedTab, countryCode]);

const loadDemandData = async () => {
  try {
    const data = await unifiedApi.countries.getDemand(countryCode || 'RW', {
      industry: currentIndustry
    });
    setDemandData(data);
  } catch (err) {
    console.error('Failed to load demand data:', err);
  }
};
```

### 4. Create Demand Mapping Component

Create `src/components/countries/DemandMapping.tsx`:

```typescript
import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, TrendingUp, TrendingDown, Minus, Filter, Download } from 'lucide-react';
import { unifiedApi } from '../../services/unifiedApi';
import HeatMapChart from '../HeatMapChart';

interface DemandMappingProps {
  countryCode: string;
  industry: 'construction' | 'agriculture';
}

const DemandMapping: React.FC<DemandMappingProps> = ({ countryCode, industry }) => {
  const [demandData, setDemandData] = useState<any[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [timeRange, setTimeRange] = useState<'current' | 'forecast'>('current');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDemandData();
  }, [countryCode, industry, selectedMaterial, selectedRegion, timeRange]);

  const loadDemandData = async () => {
    try {
      setLoading(true);
      const data = await unifiedApi.countries.getDemand(countryCode, {
        material: selectedMaterial !== 'all' ? selectedMaterial : undefined,
        region: selectedRegion !== 'all' ? selectedRegion : undefined,
        industry,
        timeRange
      });
      setDemandData(data);
    } catch (err) {
      console.error('Failed to load demand data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Transform data for visualization
  const mapData = useMemo(() => {
    return demandData.map(item => ({
      id: item.id,
      region: item.region,
      material: item.material,
      demand: parseFloat(item.demand_quantity),
      trend: item.trend || 'stable',
      coordinates: item.coordinates ? 
        [item.coordinates.latitude, item.coordinates.longitude] : 
        null,
      timestamp: item.timestamp
    }));
  }, [demandData]);

  // ... rest of component with map visualization ...
};

export default DemandMapping;
```

### 5. Update Country Profile Routes

The demand mapping is already accessible via the Intelligence tab. To make it more prominent, you can:

1. Add it as a separate tab in CountryProfile
2. Or integrate it into RwandaSmartFeatures as a new section

### 6. Features to Implement

- **Interactive Map**: Show demand heatmap with color-coded regions
- **Material Filtering**: Filter by material type
- **Time Range**: Current vs forecasted demand
- **Trend Indicators**: Show up/down/stable trends
- **Region Details**: Click on region to see detailed demand breakdown
- **Export**: Download demand data as CSV/PDF
- **Real-time Updates**: Subscribe to demand changes via Supabase Realtime

### 7. Data Sources

- User-contributed demand reports
- LogCluster integration (if available)
- Historical price/transaction data analysis
- Government trade statistics
- Partner data feeds

## Quick Start

1. Run the SQL schema in Supabase SQL Editor
2. Add API methods to `unifiedApi.ts`
3. Create `DemandMapping` component
4. Integrate into `RwandaSmartFeatures` or add as separate tab
5. Seed initial demand data for Rwanda

## Next Steps

Would you like me to:
1. Create the database schema SQL file?
2. Implement the API methods?
3. Build the DemandMapping component?
4. Integrate it into the country profile system?


