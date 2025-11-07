-- ============================================
-- COUNTRY PROFILES
-- Comprehensive country-specific data for logistics and trade
-- Matches Rwanda page structure exactly
-- ============================================

-- Country Profiles
CREATE TABLE IF NOT EXISTS country_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE CHECK (code IN ('RW', 'KE', 'UG', 'TZ', 'ET')),
  name TEXT NOT NULL,
  flag TEXT, -- Flag emoji or URL
  currency TEXT NOT NULL DEFAULT 'USD',
  regions TEXT[] DEFAULT '{}',
  description TEXT,
  population BIGINT,
  gdp DECIMAL(15, 2),
  data_source TEXT,
  completeness INTEGER DEFAULT 0 CHECK (completeness >= 0 AND completeness <= 100),
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Country Suppliers (specific to country profiles)
CREATE TABLE IF NOT EXISTS country_suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  country_code TEXT NOT NULL REFERENCES country_profiles(code) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('laboratory', 'storage', 'food', 'transport', 'government', 'construction', 'agriculture')),
  location TEXT NOT NULL,
  region TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  address TEXT,
  services TEXT[] DEFAULT '{}',
  materials TEXT[] DEFAULT '{}',
  certifications TEXT[] DEFAULT '{}',
  verified BOOLEAN DEFAULT false,
  rating DECIMAL(3, 2) CHECK (rating >= 0 AND rating <= 5),
  data_source TEXT CHECK (data_source IN ('user_contributed', 'logcluster', 'verified_partner')),
  description TEXT,
  established_year INTEGER,
  employee_count TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Country Infrastructure
CREATE TABLE IF NOT EXISTS country_infrastructure (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  country_code TEXT NOT NULL REFERENCES country_profiles(code) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('airport', 'storage', 'milling', 'port', 'road', 'rail', 'warehouse')),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  capacity TEXT,
  services TEXT[] DEFAULT '{}',
  operating_hours TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  address TEXT,
  seasonal_notes TEXT,
  status TEXT DEFAULT 'operational' CHECK (status IN ('operational', 'under_construction', 'maintenance', 'closed')),
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Country Pricing (country-specific pricing data)
CREATE TABLE IF NOT EXISTS country_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  country_code TEXT NOT NULL REFERENCES country_profiles(code) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('fuel', 'labor', 'transport', 'storage', 'materials')),
  item TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  unit TEXT NOT NULL,
  region TEXT,
  trend TEXT CHECK (trend IN ('up', 'down', 'stable')),
  previous_price DECIMAL(10, 2),
  notes TEXT,
  source TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Government Contacts
CREATE TABLE IF NOT EXISTS government_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  country_code TEXT NOT NULL REFERENCES country_profiles(code) ON DELETE CASCADE,
  ministry TEXT NOT NULL,
  department TEXT,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  website TEXT,
  address TEXT,
  services TEXT[] DEFAULT '{}',
  jurisdiction TEXT CHECK (jurisdiction IN ('National', 'Provincial', 'Local')),
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_country_suppliers_country_code ON country_suppliers(country_code);
CREATE INDEX IF NOT EXISTS idx_country_suppliers_category ON country_suppliers(category);
CREATE INDEX IF NOT EXISTS idx_country_suppliers_verified ON country_suppliers(verified);
CREATE INDEX IF NOT EXISTS idx_country_infrastructure_country_code ON country_infrastructure(country_code);
CREATE INDEX IF NOT EXISTS idx_country_infrastructure_type ON country_infrastructure(type);
CREATE INDEX IF NOT EXISTS idx_country_pricing_country_code ON country_pricing(country_code);
CREATE INDEX IF NOT EXISTS idx_country_pricing_category ON country_pricing(category);
CREATE INDEX IF NOT EXISTS idx_government_contacts_country_code ON government_contacts(country_code);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_country_suppliers_name_search ON country_suppliers USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_country_infrastructure_name_search ON country_infrastructure USING gin(to_tsvector('english', name));

-- Triggers for updated_at
CREATE TRIGGER update_country_profiles_updated_at
  BEFORE UPDATE ON country_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_country_suppliers_updated_at
  BEFORE UPDATE ON country_suppliers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_country_infrastructure_updated_at
  BEFORE UPDATE ON country_infrastructure
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_country_pricing_updated_at
  BEFORE UPDATE ON country_pricing
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_government_contacts_updated_at
  BEFORE UPDATE ON government_contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

