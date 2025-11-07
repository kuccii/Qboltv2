-- ============================================
-- QIVOOK - SEED REMAINING DATA
-- Seed data for tables that need initial data
-- Run this in Supabase SQL Editor AFTER running schema.sql
-- ============================================

-- Temporarily disable RLS for seeding
ALTER TABLE IF EXISTS public.user_activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.trade_opportunities DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.demand_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.financing_offers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.agents DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.shipments DISABLE ROW LEVEL SECURITY;

-- ============================================
-- USER ACTIVITIES (20 records)
-- ============================================

-- Note: These will be created for existing users with profiles
-- Only insert activities for users that have profiles

DO $$
DECLARE
  user_id_var UUID;
BEGIN
  -- Get first user with profile
  SELECT id INTO user_id_var 
  FROM user_profiles 
  LIMIT 1;
  
  -- Only insert if user exists
  IF user_id_var IS NOT NULL THEN
    INSERT INTO public.user_activities (user_id, action, resource_type, resource_id, details) VALUES
    -- Price-related activities
    (user_id_var, 'price_reported', 'price', NULL, '{"material": "Cement", "location": "Nairobi", "price": 850}'),
    (user_id_var, 'price_viewed', 'price', NULL, '{"material": "Steel", "location": "Mombasa"}'),
    (user_id_var, 'price_alert_created', 'price_alert', NULL, '{"material": "Timber", "threshold": 50000}'),
    
    -- Supplier-related activities
    (user_id_var, 'supplier_viewed', 'supplier', NULL, '{"supplier_name": "Bamburi Cement"}'),
    (user_id_var, 'supplier_contacted', 'supplier', NULL, '{"supplier_name": "Mabati Rolling Mills"}'),
    (user_id_var, 'supplier_reviewed', 'supplier_review', NULL, '{"supplier_name": "East African Steel", "rating": 4.5}'),
    
    -- Risk-related activities
    (user_id_var, 'risk_alert_viewed', 'risk_alert', NULL, '{"alert_type": "price_volatility", "severity": "high"}'),
    (user_id_var, 'risk_profile_updated', 'risk_profile', NULL, '{"risk_tolerance": "medium"}'),
    
    -- Trade-related activities
    (user_id_var, 'opportunity_viewed', 'trade_opportunity', NULL, '{"opportunity_type": "buy", "material": "Cement"}'),
    (user_id_var, 'opportunity_created', 'trade_opportunity', NULL, '{"opportunity_type": "sell", "material": "Steel", "quantity": 100}'),
    
    -- Dashboard activities
    (user_id_var, 'dashboard_viewed', 'dashboard', NULL, '{"section": "overview"}'),
    (user_id_var, 'dashboard_exported', 'dashboard', NULL, '{"format": "json"}'),
    
    -- Analytics activities
    (user_id_var, 'analytics_viewed', 'analytics', NULL, '{"period": "30d", "category": "prices"}'),
    (user_id_var, 'analytics_filtered', 'analytics', NULL, '{"filters": {"material": "Cement", "region": "Nairobi"}}'),
    
    -- Logistics activities
    (user_id_var, 'route_viewed', 'logistics_route', NULL, '{"origin": "Nairobi", "destination": "Kampala"}'),
    (user_id_var, 'shipment_tracked', 'shipment', NULL, '{"tracking_number": "SH001", "status": "in_transit"}'),
    
    -- Financing activities
    (user_id_var, 'financing_offer_viewed', 'financing_offer', NULL, '{"offer_id": "FO001", "amount": 50000}'),
    (user_id_var, 'financing_application_submitted', 'financing_application', NULL, '{"application_id": "FA001", "amount": 100000}'),
    
    -- Document activities
    (user_id_var, 'document_uploaded', 'document', NULL, '{"document_name": "Contract.pdf", "category": "contracts"}'),
    (user_id_var, 'document_viewed', 'document', NULL, '{"document_name": "Invoice.pdf", "category": "invoices"}'),
    
    -- General activities
    (user_id_var, 'profile_updated', 'user_profile', NULL, '{"field": "company", "value": "New Company Name"}');
  END IF;
END $$;

-- ============================================
-- TRADE OPPORTUNITIES (10 records)
-- ============================================

DO $$
DECLARE
  user_id_var UUID;
BEGIN
  -- Get first user with profile
  SELECT id INTO user_id_var 
  FROM user_profiles 
  LIMIT 1;
  
  -- Only insert if user exists
  IF user_id_var IS NOT NULL THEN
    INSERT INTO public.trade_opportunities (
      posted_by,
      opportunity_type,
      title,
      description,
      material,
      quantity,
      unit,
      country,
      location,
      budget_min,
      budget_max,
      currency,
      deadline,
      status,
      insurance_required,
      financing_required
    ) VALUES
    -- Buy opportunities
    (user_id_var, 'buy', 'Need 100 tons of Cement', 'Looking for high-quality cement for construction project in Nairobi', 'Cement', 100, 'ton', 'Kenya', 'Nairobi', 80000, 90000, 'KES', (NOW() + INTERVAL '30 days'), 'active', true, false),
    (user_id_var, 'buy', 'Steel Bars Required', 'Need steel bars for infrastructure project', 'Steel Bars', 50, 'ton', 'Kenya', 'Mombasa', 3500000, 4000000, 'KES', (NOW() + INTERVAL '45 days'), 'active', true, true),
    (user_id_var, 'buy', 'Timber for Construction', 'Looking for quality timber for building project', 'Timber', 200, 'm³', 'Uganda', 'Kampala', 8000000, 10000000, 'UGX', (NOW() + INTERVAL '60 days'), 'active', false, false),
    
    -- Sell opportunities
    (user_id_var, 'sell', 'Cement Available', 'Premium cement available for immediate delivery', 'Cement', 500, 'ton', 'Kenya', 'Nairobi', 820, 850, 'KES', (NOW() + INTERVAL '20 days'), 'active', false, false),
    (user_id_var, 'sell', 'Steel Bars in Stock', 'High-grade steel bars available in bulk', 'Steel Bars', 200, 'ton', 'Kenya', 'Mombasa', 72000, 75000, 'KES', (NOW() + INTERVAL '30 days'), 'active', true, false),
    
    -- RFQ opportunities
    (user_id_var, 'rfq', 'Request for Quotation: Building Materials', 'Need quotation for complete building materials package', 'Mixed', 1000, 'ton', 'Rwanda', 'Kigali', 100000000, 150000000, 'RWF', (NOW() + INTERVAL '15 days'), 'active', true, true),
    (user_id_var, 'rfq', 'Agricultural Inputs Needed', 'Looking for quotes on fertilizers, seeds, and pesticides', 'Fertilizer', 500, 'bag', 'Kenya', 'Nairobi', 2000000, 2500000, 'KES', (NOW() + INTERVAL '25 days'), 'active', false, false),
    
    -- More opportunities
    (user_id_var, 'buy', 'Sand and Gravel', 'Need sand and gravel for road construction', 'Sand', 1000, 'ton', 'Tanzania', 'Dar es Salaam', 3000000, 3500000, 'TZS', (NOW() + INTERVAL '40 days'), 'active', false, false),
    (user_id_var, 'sell', 'Fertilizer Available', 'NPK fertilizer available in bulk quantities', 'Fertilizer', 1000, 'bag', 'Kenya', 'Nairobi', 4500, 4800, 'KES', (NOW() + INTERVAL '35 days'), 'active', false, false),
    (user_id_var, 'rfq', 'Construction Materials Package', 'Complete package needed for residential building', 'Mixed', 500, 'ton', 'Uganda', 'Kampala', 50000000, 70000000, 'UGX', (NOW() + INTERVAL '50 days'), 'active', true, true);
  END IF;
END $$;

-- ============================================
-- DEMAND DATA (15 records)
-- ============================================

INSERT INTO public.demand_data (
  region,
  country,
  material,
  industry,
  demand_quantity,
  demand_period,
  source
) VALUES
-- Kenya Construction
('Nairobi', 'Kenya', 'Cement', 'construction', 5000, 'monthly', 'market_survey'),
('Mombasa', 'Kenya', 'Steel', 'construction', 2000, 'monthly', 'market_survey'),
('Kisumu', 'Kenya', 'Timber', 'construction', 1500, 'monthly', 'market_survey'),
('Nairobi', 'Kenya', 'Sand', 'construction', 10000, 'monthly', 'market_survey'),

-- Kenya Agriculture
('Nairobi', 'Kenya', 'Fertilizer', 'agriculture', 3000, 'seasonal', 'market_survey'),
('Eldoret', 'Kenya', 'Seeds', 'agriculture', 500, 'seasonal', 'market_survey'),
('Nakuru', 'Kenya', 'Pesticides', 'agriculture', 800, 'seasonal', 'market_survey'),

-- Rwanda Construction
('Kigali', 'Rwanda', 'Cement', 'construction', 2000, 'monthly', 'market_survey'),
('Kigali', 'Rwanda', 'Steel', 'construction', 1000, 'monthly', 'market_survey'),

-- Uganda Construction
('Kampala', 'Uganda', 'Cement', 'construction', 3000, 'monthly', 'market_survey'),
('Kampala', 'Uganda', 'Timber', 'construction', 2000, 'monthly', 'market_survey'),

-- Tanzania Construction
('Dar es Salaam', 'Tanzania', 'Cement', 'construction', 4000, 'monthly', 'market_survey'),
('Dar es Salaam', 'Tanzania', 'Steel', 'construction', 1500, 'monthly', 'market_survey'),

-- Ethiopia Construction
('Addis Ababa', 'Ethiopia', 'Cement', 'construction', 3500, 'monthly', 'market_survey'),
('Addis Ababa', 'Ethiopia', 'Steel', 'construction', 1800, 'monthly', 'market_survey');

-- ============================================
-- FINANCING OFFERS (10 records)
-- ============================================

INSERT INTO public.financing_offers (
  provider_name,
  provider_type,
  industry,
  countries,
  interest_rate,
  term_days,
  min_amount,
  max_amount,
  features,
  requirements,
  active
) VALUES
-- Fintech offers
('QuickCapital', 'fintech', ARRAY['construction', 'agriculture'], ARRAY['Kenya', 'Uganda', 'Rwanda'], 12.5, 90, 5000, 50000, '["Fast approval", "Flexible repayment"]'::jsonb, '["Business registration", "Bank statement"]'::jsonb, true),
('TradeFinance Pro', 'fintech', ARRAY['construction', 'agriculture'], ARRAY['Kenya', 'Tanzania'], 14.0, 180, 10000, 100000, '["Trade credit", "Documentary support"]'::jsonb, '["Trade license", "Import/export permit"]'::jsonb, true),
('SupplyChain Finance', 'fintech', ARRAY['construction'], ARRAY['Kenya', 'Uganda', 'Rwanda', 'Tanzania'], 13.0, 120, 20000, 200000, '["Inventory financing", "Supplier payments"]'::jsonb, '["Purchase orders", "Supplier contracts"]'::jsonb, true),

-- Bank offers
('East African Bank', 'bank', ARRAY['construction', 'agriculture'], ARRAY['Kenya', 'Uganda', 'Rwanda', 'Tanzania', 'Ethiopia'], 11.5, 365, 50000, 500000, '["Lower rates", "Longer terms"]'::jsonb, '["Business license", "Financial statements", "Collateral"]'::jsonb, true),
('Trade Bank', 'bank', ARRAY['construction', 'agriculture'], ARRAY['Kenya', 'Uganda'], 12.0, 270, 25000, 250000, '["Revolving credit", "Trade support"]'::jsonb, '["Trade license", "Bank statements"]'::jsonb, true),

-- Microfinance offers (using fintech type since microfinance not in schema)
('Community Finance', 'fintech', ARRAY['construction', 'agriculture'], ARRAY['Kenya'], 15.0, 90, 1000, 20000, '["Easy application", "Quick disbursement"]'::jsonb, '["ID card", "Business registration"]'::jsonb, true),
('AgriFinance', 'fintech', ARRAY['agriculture'], ARRAY['Kenya', 'Uganda', 'Rwanda'], 13.5, 180, 5000, 50000, '["Seasonal repayment", "Crop insurance"]'::jsonb, '["Farm registration", "Land title"]'::jsonb, true),

-- More offers
('Digital Lending', 'fintech', ARRAY['construction', 'agriculture'], ARRAY['Kenya', 'Uganda', 'Rwanda', 'Tanzania'], 18.0, 30, 1000, 10000, '["Instant approval", "Mobile money"]'::jsonb, '["ID card", "Phone number"]'::jsonb, true),
('Construction Finance', 'bank', ARRAY['construction'], ARRAY['Kenya', 'Uganda', 'Rwanda'], 11.0, 540, 100000, 1000000, '["Project-based", "Milestone payments"]'::jsonb, '["Project plan", "Construction permit", "Collateral"]'::jsonb, true),
('Equipment Finance', 'fintech', ARRAY['construction', 'agriculture'], ARRAY['Kenya', 'Uganda'], 12.5, 365, 10000, 200000, '["Equipment as collateral", "Flexible terms"]'::jsonb, '["Equipment quote", "Business registration"]'::jsonb, true);

-- ============================================
-- AGENTS (5 records)
-- ============================================

INSERT INTO public.agents (
  name,
  service_type,
  country,
  regions,
  description,
  verified,
  rating,
  phone,
  email
) VALUES
('John Kamau', 'inspection', 'Kenya', ARRAY['Kenya', 'Uganda'], 'Experienced inspection agent specializing in construction materials', true, 4.8, '+254-712-345678', 'john.kamau@example.com'),
('Mary Nakato', 'verification', 'Uganda', ARRAY['Uganda', 'Kenya'], 'Agricultural verification specialist', true, 4.6, '+256-712-345678', 'mary.nakato@example.com'),
('Paul Rwema', 'logistics', 'Rwanda', ARRAY['Rwanda', 'Kenya', 'Uganda'], 'Logistics coordinator for East Africa routes', true, 4.7, '+250-712-345678', 'paul.rwema@example.com'),
('Sarah Mwangi', 'customs', 'Kenya', ARRAY['Kenya', 'Tanzania'], 'Customs clearance specialist', true, 4.5, '+254-723-456789', 'sarah.mwangi@example.com'),
('David Ochieng', 'inspection', 'Kenya', ARRAY['Kenya', 'Uganda', 'Rwanda'], 'Multi-industry inspection agent', true, 4.9, '+254-734-567890', 'david.ochieng@example.com');

-- ============================================
-- SHIPMENTS (10 records)
-- ============================================

-- Note: These will be created for existing users with profiles
-- Only insert shipments for users that have profiles

DO $$
DECLARE
  user_id_var UUID;
  supplier_id_var UUID;
BEGIN
  -- Get first user with profile
  SELECT id INTO user_id_var 
  FROM user_profiles 
  LIMIT 1;
  
  -- Get first supplier
  SELECT id INTO supplier_id_var 
  FROM suppliers 
  LIMIT 1;
  
  -- Only insert if user and supplier exist
  IF user_id_var IS NOT NULL AND supplier_id_var IS NOT NULL THEN
    INSERT INTO public.shipments (
      tracking_number,
      user_id,
      status,
      origin,
      destination,
      weight_kg,
      volume_cubic_m,
      estimated_delivery
    ) VALUES
    ('SH001', user_id_var, 'in_transit', 'Nairobi', 'Kampala', 50000, 50, (NOW() + INTERVAL '3 days')),
    ('SH002', user_id_var, 'delivered', 'Mombasa', 'Nairobi', 20000, 20, (NOW() - INTERVAL '2 days')),
    ('SH003', user_id_var, 'pending', 'Kigali', 'Nairobi', 100000, 100, (NOW() + INTERVAL '5 days')),
    ('SH004', user_id_var, 'in_transit', 'Nairobi', 'Eldoret', 20000, 20, (NOW() + INTERVAL '1 day')),
    ('SH005', user_id_var, 'delivered', 'Kampala', 'Nairobi', 50, 0.05, (NOW() - INTERVAL '5 days')),
    ('SH006', user_id_var, 'in_transit', 'Nairobi', 'Mombasa', 200000, 200, (NOW() + INTERVAL '2 days')),
    ('SH007', user_id_var, 'pending', 'Dar es Salaam', 'Nairobi', 100000, 100, (NOW() + INTERVAL '4 days')),
    ('SH008', user_id_var, 'in_transit', 'Nairobi', 'Kigali', 30000, 30, (NOW() + INTERVAL '6 days')),
    ('SH009', user_id_var, 'delivered', 'Nairobi', 'Nakuru', 100, 0.1, (NOW() - INTERVAL '3 days')),
    ('SH010', user_id_var, 'pending', 'Kampala', 'Dar es Salaam', 150000, 150, (NOW() + INTERVAL '7 days'));
  END IF;
END $$;

-- ============================================
-- RE-ENABLE RLS
-- ============================================

ALTER TABLE IF EXISTS public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.trade_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.demand_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.financing_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.shipments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- VERIFICATION
-- ============================================

-- Check counts
SELECT 
  'user_activities' as table_name, COUNT(*) as count FROM user_activities
UNION ALL
SELECT 'trade_opportunities', COUNT(*) FROM trade_opportunities
UNION ALL
SELECT 'demand_data', COUNT(*) FROM demand_data
UNION ALL
SELECT 'financing_offers', COUNT(*) FROM financing_offers
UNION ALL
SELECT 'agents', COUNT(*) FROM agents
UNION ALL
SELECT 'shipments', COUNT(*) FROM shipments;

