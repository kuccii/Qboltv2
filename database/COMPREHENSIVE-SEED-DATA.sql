-- ============================================
-- QIVOOK - COMPREHENSIVE SEED DATA
-- Migrates all mock data to database
-- Run this AFTER schema.sql
-- ============================================

-- Temporarily disable RLS for seeding
ALTER TABLE IF EXISTS public.user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.prices DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.suppliers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.shipments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.risk_alerts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.trade_opportunities DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.logistics_routes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.agents DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.financing_offers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.demand_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.country_suppliers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.government_contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.country_infrastructure DISABLE ROW LEVEL SECURITY;

-- ============================================
-- SEED AGENTS DATA
-- ============================================

INSERT INTO public.agents (name, service_type, country, regions, description, verified, rating, total_bookings, phone, email, website) VALUES
('East Africa Logistics Solutions', 'logistics', 'Kenya', ARRAY['Kenya', 'Uganda', 'Tanzania'], 'Full-service logistics provider for cross-border trade', true, 4.8, 156, '+254712345678', 'info@ealogistics.com', 'https://ealogistics.com'),
('Customs Clearance Pro', 'customs', 'Kenya', ARRAY['Kenya', 'Uganda'], 'Expert customs clearance and documentation services', true, 4.6, 89, '+254723456789', 'clearance@customspro.com', 'https://customspro.com'),
('Quality Inspection Services', 'inspection', 'Rwanda', ARRAY['Rwanda', 'Uganda', 'Tanzania'], 'Professional quality inspection and certification', true, 4.7, 67, '+250788123456', 'inspect@qualityservices.rw', 'https://qualityservices.rw'),
('Trade Documentation Hub', 'documentation', 'Tanzania', ARRAY['Tanzania', 'Kenya'], 'Complete trade documentation and compliance services', true, 4.5, 45, '+255712345678', 'docs@tradehub.co.tz', 'https://tradehub.co.tz'),
('Freight Forwarding Experts', 'logistics', 'Uganda', ARRAY['Uganda', 'Kenya', 'Rwanda'], 'Reliable freight forwarding across East Africa', true, 4.9, 123, '+256712345678', 'freight@experts.ug', 'https://experts.ug');

-- ============================================
-- SEED FINANCING OFFERS DATA
-- ============================================

INSERT INTO public.financing_offers (provider_name, provider_type, industry, countries, interest_rate, max_amount, min_amount, term_days, requirements, features, active, metadata) VALUES
('East Africa Trade Bank', 'bank', ARRAY['construction', 'agriculture'], ARRAY['Kenya', 'Uganda', 'Tanzania'], 12.5, 500000, 10000, 90, '["Invoice from verified supplier", "Credit check"]'::jsonb, '["Fast approval", "Flexible terms"]'::jsonb, true, '{"description": "Invoice financing for verified trade transactions"}'::jsonb),
('Agricultural Development Fund', 'bank', ARRAY['agriculture'], ARRAY['Kenya', 'Rwanda'], 10.0, 200000, 5000, 180, '["Agricultural order", "Supplier verification"]'::jsonb, '["Seasonal flexibility", "Low rates"]'::jsonb, true, '{"description": "Specialized financing for agricultural inputs"}'::jsonb),
('Cross-Border Trade Finance', 'fintech', ARRAY['construction', 'agriculture'], ARRAY['Uganda', 'Kenya', 'Tanzania'], 11.5, 300000, 15000, 120, '["Cross-border transaction", "Insurance coverage"]'::jsonb, '["Digital platform", "Quick processing"]'::jsonb, true, '{"description": "Trade finance for international transactions"}'::jsonb),
('SME Growth Capital', 'platform', ARRAY['construction', 'agriculture'], ARRAY['Rwanda', 'Uganda'], 13.0, 100000, 5000, 60, '["Business registration", "6 months trading history"]'::jsonb, '["Online application", "Transparent fees"]'::jsonb, true, '{"description": "Working capital for growing businesses"}'::jsonb),
('Export Credit Facility', 'bank', ARRAY['construction', 'agriculture'], ARRAY['Tanzania', 'Kenya'], 9.5, 750000, 25000, 180, '["Export contract", "Letter of credit"]'::jsonb, '["Export support", "Competitive rates"]'::jsonb, true, '{"description": "Export financing with competitive rates"}'::jsonb);

-- ============================================
-- SEED DEMAND DATA
-- ============================================

INSERT INTO public.demand_data (region, country, material, industry, demand_quantity, demand_period, source) VALUES
('Nairobi', 'Kenya', 'Cement', 'construction', 50000, 'monthly', 'Market Research'),
('Mombasa', 'Kenya', 'Steel', 'construction', 30000, 'monthly', 'Market Research'),
('Kampala', 'Uganda', 'Fertilizer', 'agriculture', 25000, 'monthly', 'Agricultural Survey'),
('Kigali', 'Rwanda', 'Cement', 'construction', 20000, 'monthly', 'Market Research'),
('Dar es Salaam', 'Tanzania', 'Seeds', 'agriculture', 15000, 'monthly', 'Agricultural Survey'),
('Nakuru', 'Kenya', 'Fertilizer', 'agriculture', 18000, 'monthly', 'Agricultural Survey'),
('Kisumu', 'Kenya', 'Timber', 'construction', 12000, 'monthly', 'Market Research');

-- ============================================
-- SEED DOCUMENTS DATA
-- Note: Documents require a user_id, so these are template documents
-- In production, documents should be created by users through the app
-- ============================================

-- Skip documents seed for now as they require user_id
-- Documents should be created through the application by users
-- Uncomment and modify if you have a system/admin user_id:
/*
INSERT INTO public.documents (user_id, name, type, category, file_url, tags, metadata) VALUES
('ADMIN_USER_ID_HERE', 'Import License Guide', 'guide', 'trade', 'https://example.com/docs/kenya-import-license.pdf', ARRAY['kenya', 'import', 'license'], '{"country": "Kenya", "description": "Required for importing goods into Kenya", "processing_time_days": 14, "cost": 500, "currency": "USD"}'::jsonb),
('ADMIN_USER_ID_HERE', 'Export Certificate Guide', 'guide', 'trade', 'https://example.com/docs/kenya-export-cert.pdf', ARRAY['kenya', 'export', 'certificate'], '{"country": "Kenya", "description": "Certificate for exporting goods from Kenya", "processing_time_days": 7, "cost": 300, "currency": "USD"}'::jsonb);
*/

-- ============================================
-- SEED COUNTRY SUPPLIERS (Additional Categories)
-- ============================================

INSERT INTO public.country_suppliers (country_code, name, category, location, region, email, phone, website, services, verified, rating) VALUES
-- Quality & Testing
('RW', 'Rwanda Standards Board Lab', 'testing', 'Kigali', 'Kigali', 'lab@rsb.gov.rw', '+250788123456', 'https://rsb.gov.rw', ARRAY['Quality Testing', 'Certification'], true, 4.8),
('KE', 'Kenya Bureau of Standards', 'certification', 'Nairobi', 'Nairobi', 'cert@kebs.org', '+254712345678', 'https://kebs.org', ARRAY['Product Certification', 'Standards Compliance'], true, 4.7),
('UG', 'Uganda National Bureau of Standards', 'testing', 'Kampala', 'Kampala', 'testing@unbs.go.ug', '+256712345678', 'https://unbs.go.ug', ARRAY['Laboratory Testing', 'Quality Assurance'], true, 4.6),

-- Financial Services
('KE', 'Trade Finance Bank', 'bank', 'Nairobi', 'Nairobi', 'trade@tfbank.com', '+254712345679', 'https://tfbank.com', ARRAY['Trade Finance', 'Letters of Credit'], true, 4.5),
('RW', 'Rwanda Development Bank', 'finance', 'Kigali', 'Kigali', 'finance@brd.rw', '+250788123457', 'https://brd.rw', ARRAY['Business Loans', 'Trade Finance'], true, 4.4),
('UG', 'Uganda Export Credit Agency', 'insurance', 'Kampala', 'Kampala', 'info@ueca.go.ug', '+256712345679', 'https://ueca.go.ug', ARRAY['Export Insurance', 'Credit Guarantees'], true, 4.6),

-- Trade Services
('KE', 'Mombasa Customs Brokers', 'customs', 'Mombasa', 'Coast', 'brokers@mombasacustoms.com', '+254712345680', 'https://mombasacustoms.com', ARRAY['Customs Clearance', 'Documentation'], true, 4.7),
('TZ', 'Dar es Salaam Clearing Agents', 'clearing', 'Dar es Salaam', 'Dar es Salaam', 'clearing@darcustoms.co.tz', '+255712345679', 'https://darcustoms.co.tz', ARRAY['Port Clearance', 'Freight Forwarding'], true, 4.5),
('KE', 'Trade Documentation Services', 'documentation', 'Nairobi', 'Nairobi', 'docs@tradeservices.com', '+254712345681', 'https://tradeservices.com', ARRAY['Document Preparation', 'Compliance'], true, 4.6);

-- ============================================
-- SEED GOVERNMENT CONTACTS
-- ============================================

INSERT INTO public.government_contacts (country_code, ministry, department, name, title, email, phone, website, services, jurisdiction) VALUES
('RW', 'Ministry of Trade and Industry', 'Trade Promotion', 'Jean Baptiste Nkurunziza', 'Director of Trade', 'trade@minicom.gov.rw', '+250788123458', 'https://minicom.gov.rw', ARRAY['Trade Facilitation', 'Export Promotion'], 'National'),
('KE', 'Ministry of Industrialization', 'Trade Development', 'Mary Wanjiku', 'Senior Trade Officer', 'trade@industrialization.go.ke', '+254712345682', 'https://industrialization.go.ke', ARRAY['Trade Policy', 'Market Access'], 'National'),
('UG', 'Ministry of Trade, Industry and Cooperatives', 'Export Promotion', 'David Okello', 'Export Promotion Manager', 'exports@mtic.go.ug', '+256712345680', 'https://mtic.go.ug', ARRAY['Export Support', 'Trade Information'], 'National'),
('TZ', 'Ministry of Industry and Trade', 'Trade Services', 'Fatuma Hassan', 'Trade Services Director', 'services@mit.go.tz', '+255712345680', 'https://mit.go.tz', ARRAY['Trade Facilitation', 'Business Support'], 'National');

-- ============================================
-- SEED COUNTRY INFRASTRUCTURE
-- ============================================

INSERT INTO public.country_infrastructure (country_code, name, type, location, region, capacity, status, description) VALUES
('RW', 'Kigali Logistics Hub', 'warehouse', 'Kigali', 'Kigali', 50000, 'operational', 'Modern warehouse facility with cold storage'),
('KE', 'Mombasa Port Terminal', 'port', 'Mombasa', 'Coast', 1000000, 'operational', 'Main port facility for imports/exports'),
('UG', 'Kampala Freight Terminal', 'warehouse', 'Kampala', 'Kampala', 30000, 'operational', 'Freight handling and storage facility'),
('TZ', 'Dar es Salaam Port', 'port', 'Dar es Salaam', 'Dar es Salaam', 800000, 'operational', 'Major port for East African trade'),
('KE', 'Nairobi Dry Port', 'warehouse', 'Nairobi', 'Nairobi', 75000, 'operational', 'Inland container depot'),
('RW', 'Rwanda Standards Laboratory', 'laboratory', 'Kigali', 'Kigali', 0, 'operational', 'Quality testing and certification facility');

-- ============================================
-- RE-ENABLE RLS (Optional - for production)
-- ============================================

-- Uncomment these lines after seeding if you want to re-enable RLS
-- ALTER TABLE IF EXISTS public.user_profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE IF EXISTS public.prices ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE IF EXISTS public.suppliers ENABLE ROW LEVEL SECURITY;
-- ... (repeat for all tables)

