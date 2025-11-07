-- ============================================
-- COUNTRY DEMAND MAPPING
-- Tracks demand patterns by region, material, and industry
-- ============================================

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
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  forecast_demand DECIMAL(12, 2),
  forecast_period TEXT CHECK (forecast_period IN ('30d', '90d', '6m', '1y')),
  source TEXT CHECK (source IN ('user_contributed', 'logcluster', 'verified_partner', 'government')),
  notes TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_country_demand_country ON country_demand(country_code);
CREATE INDEX IF NOT EXISTS idx_country_demand_region ON country_demand(region);
CREATE INDEX IF NOT EXISTS idx_country_demand_material ON country_demand(material);
CREATE INDEX IF NOT EXISTS idx_country_demand_industry ON country_demand(industry);
CREATE INDEX IF NOT EXISTS idx_country_demand_timestamp ON country_demand(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_country_demand_coordinates ON country_demand(latitude, longitude);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_country_demand_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_country_demand_updated_at
  BEFORE UPDATE ON country_demand
  FOR EACH ROW
  EXECUTE FUNCTION update_country_demand_updated_at();

-- RLS Policies
ALTER TABLE country_demand ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view demand data for all countries
CREATE POLICY "Users can view demand data"
  ON country_demand FOR SELECT
  USING (true);

-- Policy: Authenticated users can insert demand data
CREATE POLICY "Users can insert demand data"
  ON country_demand FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Policy: Users can update their own demand data
CREATE POLICY "Users can update demand data"
  ON country_demand FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Policy: Users can delete their own demand data
CREATE POLICY "Users can delete demand data"
  ON country_demand FOR DELETE
  USING (auth.uid() IS NOT NULL);


