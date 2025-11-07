-- ============================================
-- PRODUCTION DATABASE INDEXES
-- Run this in Supabase SQL Editor
-- Optimizes query performance
-- ============================================

-- Prices table indexes (most queried)
CREATE INDEX IF NOT EXISTS idx_prices_material ON public.prices(material);
CREATE INDEX IF NOT EXISTS idx_prices_country ON public.prices(country);
CREATE INDEX IF NOT EXISTS idx_prices_location ON public.prices(location);
CREATE INDEX IF NOT EXISTS idx_prices_created_at ON public.prices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prices_verified ON public.prices(verified);
CREATE INDEX IF NOT EXISTS idx_prices_material_country ON public.prices(material, country);

-- Suppliers table indexes
CREATE INDEX IF NOT EXISTS idx_suppliers_country ON public.suppliers(country);
CREATE INDEX IF NOT EXISTS idx_suppliers_industry ON public.suppliers(industry);
CREATE INDEX IF NOT EXISTS idx_suppliers_verified ON public.suppliers(verified);
CREATE INDEX IF NOT EXISTS idx_suppliers_rating ON public.suppliers(rating DESC);
CREATE INDEX IF NOT EXISTS idx_suppliers_insurance ON public.suppliers(insurance_active);
CREATE INDEX IF NOT EXISTS idx_suppliers_country_industry ON public.suppliers(country, industry);

-- User profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_country ON public.user_profiles(country);
CREATE INDEX IF NOT EXISTS idx_user_profiles_industry ON public.user_profiles(industry);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, read);

-- Risk alerts indexes
CREATE INDEX IF NOT EXISTS idx_risk_alerts_severity ON public.risk_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_risk_alerts_alert_type ON public.risk_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_risk_alerts_country ON public.risk_alerts(country);
CREATE INDEX IF NOT EXISTS idx_risk_alerts_resolved ON public.risk_alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_risk_alerts_created_at ON public.risk_alerts(created_at DESC);

-- Shipments indexes
CREATE INDEX IF NOT EXISTS idx_shipments_user_id ON public.shipments(user_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON public.shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_tracking_number ON public.shipments(tracking_number);
CREATE INDEX IF NOT EXISTS idx_shipments_created_at ON public.shipments(created_at DESC);

-- Trade opportunities indexes
CREATE INDEX IF NOT EXISTS idx_trade_opportunities_user_id ON public.trade_opportunities(user_id);
CREATE INDEX IF NOT EXISTS idx_trade_opportunities_status ON public.trade_opportunities(status);
CREATE INDEX IF NOT EXISTS idx_trade_opportunities_industry ON public.trade_opportunities(industry);
CREATE INDEX IF NOT EXISTS idx_trade_opportunities_created_at ON public.trade_opportunities(created_at DESC);

-- Logistics routes indexes
CREATE INDEX IF NOT EXISTS idx_logistics_routes_origin_country ON public.logistics_routes(origin_country);
CREATE INDEX IF NOT EXISTS idx_logistics_routes_destination_country ON public.logistics_routes(destination_country);
CREATE INDEX IF NOT EXISTS idx_logistics_routes_status ON public.logistics_routes(status);

-- Documents indexes
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON public.documents(type);
CREATE INDEX IF NOT EXISTS idx_documents_category ON public.documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_expiry_date ON public.documents(expiry_date);

-- Full-text search indexes (requires pg_trgm extension)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_suppliers_name_trgm ON public.suppliers USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_prices_material_trgm ON public.prices USING gin (material gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_suppliers_description_trgm ON public.suppliers USING gin (description gin_trgm_ops);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_prices_material_country_date ON public.prices(material, country, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_suppliers_industry_country_rating ON public.suppliers(industry, country, rating DESC);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '====================================';
  RAISE NOTICE 'PRODUCTION INDEXES CREATED!';
  RAISE NOTICE '====================================';
  RAISE NOTICE 'Indexes optimized for:';
  RAISE NOTICE '  ✓ Price queries (material, country, date)';
  RAISE NOTICE '  ✓ Supplier search (name, industry, rating)';
  RAISE NOTICE '  ✓ User notifications (unread, recent)';
  RAISE NOTICE '  ✓ Risk alerts (severity, unresolved)';
  RAISE NOTICE '  ✓ Full-text search (suppliers, prices)';
  RAISE NOTICE '';
  RAISE NOTICE 'Query performance significantly improved!';
  RAISE NOTICE '====================================';
END $$;


