-- ============================================
-- QIVOOK - COMPLETE DATABASE SCHEMA
-- World-Class Data Architecture with User-Based Isolation
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- ============================================
-- USER PROFILES & AUTHENTICATION
-- ============================================

-- User Profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  company TEXT,
  industry TEXT CHECK (industry IN ('construction', 'agriculture')),
  country TEXT NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'supplier', 'agent')),
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'pro', 'enterprise')),
  avatar_url TEXT,
  timezone TEXT DEFAULT 'UTC',
  preferences JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_email UNIQUE (email)
);

-- User Activity Log
CREATE TABLE IF NOT EXISTS user_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MARKET INTELLIGENCE
-- ============================================

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
  verified BOOLEAN DEFAULT false,
  reported_by UUID REFERENCES user_profiles(id),
  evidence_url TEXT[], -- Array of URLs
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Price Reports (user-submitted)
CREATE TABLE IF NOT EXISTS price_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  material TEXT NOT NULL,
  location TEXT NOT NULL,
  country TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  unit TEXT DEFAULT 'ton',
  evidence_url TEXT[],
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'flagged')),
  verified_by UUID REFERENCES user_profiles(id),
  verification_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Demand Data
CREATE TABLE IF NOT EXISTS demand_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  region TEXT NOT NULL,
  country TEXT NOT NULL,
  material TEXT NOT NULL,
  industry TEXT NOT NULL,
  demand_quantity DECIMAL(12, 2),
  demand_period TEXT, -- monthly, quarterly, yearly
  source TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Market Trends
CREATE TABLE IF NOT EXISTS market_trends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  material TEXT NOT NULL,
  country TEXT NOT NULL,
  trend_direction TEXT CHECK (trend_direction IN ('up', 'down', 'stable', 'volatile')),
  volatility_score DECIMAL(3, 2) DEFAULT 0,
  forecast_next_month DECIMAL(10, 2),
  forecast_next_quarter DECIMAL(10, 2),
  confidence_score DECIMAL(3, 2) DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SUPPLIER MANAGEMENT
-- ============================================

-- Suppliers Table
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL, -- If supplier is a registered user
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  industry TEXT NOT NULL CHECK (industry IN ('construction', 'agriculture')),
  materials TEXT[] NOT NULL,
  description TEXT,
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES user_profiles(id),
  insurance_active BOOLEAN DEFAULT false,
  insurance_expiry TIMESTAMPTZ,
  rating DECIMAL(3, 2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 10),
  total_reviews INTEGER DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  on_time_delivery_rate DECIMAL(5, 2) DEFAULT 0,
  phone TEXT,
  email TEXT,
  website TEXT,
  address JSONB,
  certifications TEXT[],
  documents JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_supplier_name_country UNIQUE (name, country)
);

-- Supplier Scores (detailed scoring)
CREATE TABLE IF NOT EXISTS supplier_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
  quality_score DECIMAL(3, 2) DEFAULT 0 CHECK (quality_score >= 0 AND quality_score <= 10),
  delivery_score DECIMAL(3, 2) DEFAULT 0 CHECK (delivery_score >= 0 AND delivery_score <= 10),
  reliability_score DECIMAL(3, 2) DEFAULT 0 CHECK (reliability_score >= 0 AND reliability_score <= 10),
  communication_score DECIMAL(3, 2) DEFAULT 0 CHECK (communication_score >= 0 AND communication_score <= 10),
  overall_score DECIMAL(3, 2) DEFAULT 0 CHECK (overall_score >= 0 AND overall_score <= 10),
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Supplier Reviews
CREATE TABLE IF NOT EXISTS supplier_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  delivery_rating INTEGER CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
  reliability_rating INTEGER CHECK (reliability_rating >= 1 AND reliability_rating <= 5),
  order_id UUID, -- Reference to order if applicable
  verified_purchase BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_user_supplier_review UNIQUE (user_id, supplier_id)
);

-- Supplier Documents
CREATE TABLE IF NOT EXISTS supplier_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_url TEXT NOT NULL,
  verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES user_profiles(id),
  expiry_date TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AGENTS DIRECTORY
-- ============================================

-- Agents Table
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  service_type TEXT NOT NULL, -- logistics, customs, inspection, etc.
  country TEXT NOT NULL,
  regions TEXT[], -- Countries/regions they serve
  description TEXT,
  verified BOOLEAN DEFAULT false,
  rating DECIMAL(3, 2) DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  phone TEXT,
  email TEXT,
  website TEXT,
  availability_calendar JSONB DEFAULT '{}'::jsonb,
  pricing JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent Bookings
CREATE TABLE IF NOT EXISTS agent_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL,
  booking_date TIMESTAMPTZ NOT NULL,
  duration_hours INTEGER DEFAULT 1,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LOGISTICS
-- ============================================

-- Logistics Routes
CREATE TABLE IF NOT EXISTS logistics_routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  origin TEXT NOT NULL,
  origin_country TEXT NOT NULL,
  destination TEXT NOT NULL,
  destination_country TEXT NOT NULL,
  distance_km DECIMAL(10, 2),
  estimated_days INTEGER,
  cost_per_kg DECIMAL(10, 2),
  carrier TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shipments
CREATE TABLE IF NOT EXISTS shipments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tracking_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  route_id UUID REFERENCES logistics_routes(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'delivered', 'delayed', 'cancelled', 'lost')),
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  weight_kg DECIMAL(10, 2),
  volume_cubic_m DECIMAL(10, 2),
  current_location JSONB, -- {lat, lng, address, timestamp}
  estimated_delivery TIMESTAMPTZ,
  actual_delivery TIMESTAMPTZ,
  insurance_active BOOLEAN DEFAULT false,
  insurance_details JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shipment Tracking Events
CREATE TABLE IF NOT EXISTS shipment_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  location JSONB,
  description TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================
-- FINANCING
-- ============================================

-- Financing Offers
CREATE TABLE IF NOT EXISTS financing_offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_name TEXT NOT NULL,
  provider_type TEXT CHECK (provider_type IN ('bank', 'fintech', 'platform')),
  industry TEXT[],
  countries TEXT[],
  min_amount DECIMAL(12, 2),
  max_amount DECIMAL(12, 2),
  interest_rate DECIMAL(5, 2),
  term_days INTEGER,
  requirements JSONB DEFAULT '[]'::jsonb,
  features JSONB DEFAULT '[]'::jsonb,
  active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Financing Applications
CREATE TABLE IF NOT EXISTS financing_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  offer_id UUID REFERENCES financing_offers(id),
  amount DECIMAL(12, 2) NOT NULL,
  term_days INTEGER NOT NULL,
  purpose TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'defaulted')),
  approved_amount DECIMAL(12, 2),
  approved_by UUID REFERENCES user_profiles(id),
  approval_notes TEXT,
  disbursed_at TIMESTAMPTZ,
  repayment_schedule JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RISK MANAGEMENT
-- ============================================

-- Risk Alerts
CREATE TABLE IF NOT EXISTS risk_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL, -- NULL for global alerts
  alert_type TEXT NOT NULL CHECK (alert_type IN ('price_volatility', 'supply_shortage', 'logistics_delay', 'supplier_risk', 'market_risk', 'compliance_issue')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT,
  affected_resource_type TEXT, -- supplier_id, material, route_id, etc.
  affected_resource_id UUID,
  region TEXT,
  country TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Risk Assessments
CREATE TABLE IF NOT EXISTS risk_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  assessment_type TEXT NOT NULL,
  target_type TEXT, -- supplier, transaction, route, etc.
  target_id UUID,
  overall_risk_score DECIMAL(3, 2) CHECK (overall_risk_score >= 0 AND overall_risk_score <= 10),
  risk_factors JSONB DEFAULT '{}'::jsonb,
  mitigation_strategies JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DOCUMENT VAULT
-- ============================================

-- Documents
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  category TEXT,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  folder_id UUID, -- Self-referencing for folders
  tags TEXT[],
  expiry_date TIMESTAMPTZ,
  shared_with UUID[], -- Array of user_ids
  version INTEGER DEFAULT 1,
  parent_document_id UUID, -- For versioning
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NOTIFICATIONS
-- ============================================

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TRADE OPPORTUNITIES & MATCHMAKING
-- ============================================

-- Trade Opportunities
CREATE TABLE IF NOT EXISTS trade_opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  posted_by UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  opportunity_type TEXT NOT NULL CHECK (opportunity_type IN ('buy', 'sell', 'rfq')),
  title TEXT NOT NULL,
  description TEXT,
  material TEXT NOT NULL,
  quantity DECIMAL(12, 2),
  unit TEXT,
  country TEXT NOT NULL,
  location TEXT,
  budget_min DECIMAL(12, 2),
  budget_max DECIMAL(12, 2),
  currency TEXT DEFAULT 'USD',
  deadline TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'matched', 'completed', 'expired', 'cancelled')),
  insurance_required BOOLEAN DEFAULT false,
  financing_required BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Opportunity Matches
CREATE TABLE IF NOT EXISTS opportunity_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  opportunity_id UUID REFERENCES trade_opportunities(id) ON DELETE CASCADE,
  matched_with UUID REFERENCES user_profiles(id) ON DELETE CASCADE, -- Supplier/buyer
  match_score DECIMAL(3, 2) CHECK (match_score >= 0 AND match_score <= 10),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Prices indexes
CREATE INDEX IF NOT EXISTS idx_prices_material ON prices(material);
CREATE INDEX IF NOT EXISTS idx_prices_country ON prices(country);
CREATE INDEX IF NOT EXISTS idx_prices_location ON prices(location);
CREATE INDEX IF NOT EXISTS idx_prices_updated ON prices(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_prices_verified ON prices(verified);

-- Suppliers indexes
CREATE INDEX IF NOT EXISTS idx_suppliers_country ON suppliers(country);
CREATE INDEX IF NOT EXISTS idx_suppliers_industry ON suppliers(industry);
CREATE INDEX IF NOT EXISTS idx_suppliers_verified ON suppliers(verified);
CREATE INDEX IF NOT EXISTS idx_suppliers_rating ON suppliers(rating DESC);
CREATE INDEX IF NOT EXISTS idx_suppliers_materials ON suppliers USING GIN(materials);

-- Shipments indexes
CREATE INDEX IF NOT EXISTS idx_shipments_tracking ON shipments(tracking_number);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_user ON shipments(user_id);
CREATE INDEX IF NOT EXISTS idx_shipments_route ON shipments(route_id);

-- User activities indexes
CREATE INDEX IF NOT EXISTS idx_activities_user ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_created ON user_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_action ON user_activities(action);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- Trade opportunities indexes
CREATE INDEX IF NOT EXISTS idx_opportunities_type ON trade_opportunities(opportunity_type);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON trade_opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_country ON trade_opportunities(country);
CREATE INDEX IF NOT EXISTS idx_opportunities_material ON trade_opportunities(material);

-- Full text search indexes
CREATE INDEX IF NOT EXISTS idx_suppliers_name_trgm ON suppliers USING GIN(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_suppliers_description_trgm ON suppliers USING GIN(description gin_trgm_ops);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to calculate supplier rating
CREATE OR REPLACE FUNCTION calculate_supplier_rating(supplier_uuid UUID)
RETURNS DECIMAL(3, 2) AS $$
DECLARE
  avg_rating DECIMAL(3, 2);
BEGIN
  SELECT AVG(rating) INTO avg_rating
  FROM supplier_reviews
  WHERE supplier_id = supplier_uuid;
  
  RETURN COALESCE(avg_rating, 0);
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prices_updated_at
  BEFORE UPDATE ON prices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON suppliers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shipments_updated_at
  BEFORE UPDATE ON shipments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trade_opportunities_updated_at
  BEFORE UPDATE ON trade_opportunities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update supplier rating when review is added/updated
CREATE OR REPLACE FUNCTION update_supplier_rating_on_review()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE suppliers
  SET 
    rating = calculate_supplier_rating(NEW.supplier_id),
    total_reviews = (
      SELECT COUNT(*) FROM supplier_reviews 
      WHERE supplier_id = NEW.supplier_id
    ),
    updated_at = NOW()
  WHERE id = NEW.supplier_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_supplier_rating
  AFTER INSERT OR UPDATE ON supplier_reviews
  FOR EACH ROW EXECUTE FUNCTION update_supplier_rating_on_review();

