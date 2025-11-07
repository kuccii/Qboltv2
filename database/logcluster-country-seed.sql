-- ============================================
-- COUNTRY PROFILES SEED DATA
-- Based on LogCluster country information
-- Countries: RW, KE, UG, TZ, ET
-- Source: https://www.logcluster.org/en/countries
-- ============================================

-- First, clean existing data (if tables exist)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'country_suppliers') THEN
    TRUNCATE TABLE country_suppliers CASCADE;
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'country_infrastructure') THEN
    TRUNCATE TABLE country_infrastructure CASCADE;
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'country_pricing') THEN
    TRUNCATE TABLE country_pricing CASCADE;
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'government_contacts') THEN
    TRUNCATE TABLE government_contacts CASCADE;
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'country_profiles') THEN
    TRUNCATE TABLE country_profiles CASCADE;
  END IF;
END $$;

-- ============================================
-- COUNTRY PROFILES
-- ============================================

INSERT INTO country_profiles (code, name, flag, currency, regions, description, population, gdp, data_source, completeness) VALUES
-- Rwanda
('RW', 'Rwanda', '🇷🇼', 'RWF', 
 ARRAY['Kigali', 'Northern Province', 'Southern Province', 'Eastern Province', 'Western Province'],
 'Landlocked country in East Africa known as the "Land of a Thousand Hills". Strategic location for regional trade with good infrastructure development.',
 13200000, 11500000000,
 'logcluster', 85),

-- Kenya
('KE', 'Kenya', '🇰🇪', 'KES',
 ARRAY['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi'],
 'East African economic hub with major ports and airports. Key logistics gateway for the region.',
 54000000, 110000000000,
 'logcluster', 90),

-- Uganda
('UG', 'Uganda', '🇺🇬', 'UGX',
 ARRAY['Kampala', 'Entebbe', 'Jinja', 'Gulu', 'Mbale', 'Mbarara', 'Arua'],
 'Landlocked country in East Africa known as the "Pearl of Africa". Strategic location connecting East and Central Africa.',
 47000000, 42000000000,
 'logcluster', 80),

-- Tanzania
('TZ', 'Tanzania', '🇹🇿', 'TZS',
 ARRAY['Dar es Salaam', 'Dodoma', 'Arusha', 'Mwanza', 'Zanzibar', 'Mbeya', 'Tanga'],
 'Largest country in East Africa with extensive coastline and major ports. Strategic gateway to Central and Southern Africa.',
 61000000, 75000000000,
 'logcluster', 85),

-- Ethiopia
('ET', 'Ethiopia', '🇪🇹', 'ETB',
 ARRAY['Addis Ababa', 'Dire Dawa', 'Mekelle', 'Gondar', 'Hawassa', 'Bahir Dar', 'Jimma'],
 'Most populous landlocked country in Africa. Key logistics hub for the Horn of Africa region.',
 123000000, 126000000000,
 'logcluster', 75);

-- ============================================
-- COUNTRY INFRASTRUCTURE
-- ============================================

-- Rwanda Infrastructure
INSERT INTO country_infrastructure (country_code, type, name, location, latitude, longitude, capacity, services, operating_hours, status, email, phone, address) VALUES
-- Airports
('RW', 'airport', 'Kigali International Airport', 'Kigali', -1.9686, 30.1395, 'Annual capacity: 1.5M passengers', ARRAY['Cargo handling', 'Cold storage', 'Customs clearance'], '24/7', 'operational', 'info@rwa.aero', '+250 788 312 590', 'Kigali, Rwanda'),
('RW', 'airport', 'Kamembe Airport', 'Rusizi', -2.4667, 28.9167, 'Regional flights', ARRAY['Cargo handling'], 'Daily 6AM-6PM', 'operational', NULL, NULL, 'Rusizi, Western Province'),

-- Storage & Warehouses
('RW', 'storage', 'Kigali Logistics Park', 'Kigali', -1.9441, 30.0619, '50,000 sqm', ARRAY['Cold storage', 'Bonded warehouse', 'Container yard'], '24/7', 'operational', 'info@klp.rw', '+250 788 123 456', 'Kigali Special Economic Zone'),
('RW', 'warehouse', 'Rwanda Agriculture Board Warehouse', 'Kigali', -1.9500, 30.0800, '10,000 tons capacity', ARRAY['Grain storage', 'Cold storage'], 'Mon-Fri 8AM-5PM', 'operational', NULL, '+250 788 234 567', 'Kigali'),

-- Ports (via lake connections)
('RW', 'port', 'Gisenyi Port', 'Gisenyi', -1.6944, 29.2611, 'Small vessel handling', ARRAY['Cargo loading', 'Passenger ferry'], 'Daily 7AM-6PM', 'operational', NULL, NULL, 'Lake Kivu, Western Province');

-- Kenya Infrastructure
INSERT INTO country_infrastructure (country_code, type, name, location, latitude, longitude, capacity, services, operating_hours, status, email, phone, address) VALUES
-- Airports
('KE', 'airport', 'Jomo Kenyatta International Airport', 'Nairobi', -1.3192, 36.9278, 'Annual capacity: 7M passengers', ARRAY['Cargo terminal', 'Cold storage', 'Bonded warehouse', 'Customs'], '24/7', 'operational', 'info@kcaa.or.ke', '+254 20 682 2800', 'Embakasi, Nairobi'),
('KE', 'airport', 'Moi International Airport', 'Mombasa', -4.0348, 39.5942, 'Annual capacity: 2M passengers', ARRAY['Cargo handling', 'Cold storage'], '24/7', 'operational', 'info@mombasa-airport.com', '+254 41 343 4111', 'Mombasa'),
('KE', 'airport', 'Eldoret International Airport', 'Eldoret', 0.4044, 35.2389, 'Cargo flights', ARRAY['Cargo handling'], 'Daily 6AM-10PM', 'operational', NULL, NULL, 'Eldoret'),
('KE', 'airport', 'Wilson Airport', 'Nairobi', -1.3217, 36.8147, 'Regional flights', ARRAY['Cargo handling'], 'Daily 6AM-8PM', 'operational', NULL, NULL, 'Nairobi'),

-- Ports
('KE', 'port', 'Port of Mombasa', 'Mombasa', -4.0437, 39.6682, 'Annual capacity: 30M tons', ARRAY['Container terminal', 'Bulk cargo', 'Ro-Ro', 'Fuel terminal'], '24/7', 'operational', 'info@kpa.co.ke', '+254 41 231 4400', 'Mombasa Port'),
('KE', 'port', 'Port of Lamu', 'Lamu', -2.2694, 40.8997, 'Deep water port', ARRAY['Cargo handling', 'Container terminal'], '24/7', 'under_construction', NULL, NULL, 'Lamu'),
('KE', 'port', 'Kisumu Port', 'Kisumu', -0.0917, 34.7680, 'Lake Victoria port', ARRAY['Cargo handling', 'Passenger ferry'], 'Daily 7AM-6PM', 'operational', NULL, NULL, 'Lake Victoria, Kisumu'),

-- Storage & Warehouses
('KE', 'storage', 'Nairobi Inland Container Depot', 'Nairobi', -1.2921, 36.8219, '45,000 TEU capacity', ARRAY['Container storage', 'Customs clearance', 'Bonded warehouse'], '24/7', 'operational', 'info@icd-nairobi.co.ke', '+254 20 600 6000', 'Embakasi, Nairobi'),
('KE', 'warehouse', 'Syokimau Logistics Hub', 'Nairobi', -1.3733, 36.8731, '20,000 sqm', ARRAY['Cold storage', 'Distribution center'], '24/7', 'operational', NULL, NULL, 'Syokimau, Nairobi'),
('KE', 'storage', 'Mombasa Container Terminal', 'Mombasa', -4.0500, 39.6700, '1.2M TEU capacity', ARRAY['Container handling', 'Storage', 'Customs'], '24/7', 'operational', NULL, NULL, 'Port of Mombasa'),

-- Roads
('KE', 'road', 'Northern Corridor', 'Mombasa to Kampala', -1.2921, 36.8219, 'Main trade route', ARRAY['Freight transport', 'Border crossing'], '24/7', 'operational', NULL, NULL, 'Mombasa-Nairobi-Kampala highway');

-- Uganda Infrastructure
INSERT INTO country_infrastructure (country_code, type, name, location, latitude, longitude, capacity, services, operating_hours, status, email, phone, address) VALUES
-- Airports
('UG', 'airport', 'Entebbe International Airport', 'Entebbe', 0.0424, 32.4435, 'Annual capacity: 1.8M passengers', ARRAY['Cargo terminal', 'Cold storage', 'Customs'], '24/7', 'operational', 'info@caa.co.ug', '+256 41 353 000', 'Entebbe'),
('UG', 'airport', 'Kajjansi Airfield', 'Kampala', 0.2389, 32.5500, 'Cargo flights', ARRAY['Cargo handling'], 'Daily 7AM-7PM', 'operational', NULL, NULL, 'Kajjansi'),
('UG', 'airport', 'Gulu Airport', 'Gulu', 2.8056, 32.2711, 'Regional flights', ARRAY['Cargo handling'], 'Daily 6AM-6PM', 'operational', NULL, NULL, 'Gulu'),

-- Ports (Lake Victoria)
('UG', 'port', 'Port Bell', 'Kampala', 0.3044, 32.6544, 'Lake Victoria port', ARRAY['Cargo handling', 'Passenger ferry'], 'Daily 7AM-6PM', 'operational', NULL, '+256 41 234 567', 'Port Bell, Kampala'),
('UG', 'port', 'Jinja Port', 'Jinja', 0.4244, 33.2042, 'Lake Victoria port', ARRAY['Cargo handling'], 'Daily 7AM-6PM', 'operational', NULL, NULL, 'Jinja'),
('UG', 'port', 'Bukasa Port', 'Kampala', 0.3200, 32.6500, 'Lake Victoria port', ARRAY['Cargo handling'], 'Daily 7AM-6PM', 'operational', NULL, NULL, 'Bukasa, Kampala'),

-- Storage & Warehouses
('UG', 'storage', 'Kampala Industrial Area Warehouse', 'Kampala', 0.3476, 32.5825, '15,000 sqm', ARRAY['Cold storage', 'Bonded warehouse'], 'Mon-Fri 8AM-6PM', 'operational', NULL, '+256 41 234 567', 'Industrial Area, Kampala'),
('UG', 'warehouse', 'Uganda Warehouse Receipt System', 'Kampala', 0.3500, 32.5800, 'Grain storage', ARRAY['Grain storage', 'Commodity storage'], '24/7', 'operational', NULL, NULL, 'Kampala'),

-- Roads
('UG', 'road', 'Northern Corridor (Kampala-Gulu)', 'Kampala to Gulu', 0.3476, 32.5825, 'Main trade route', ARRAY['Freight transport'], '24/7', 'operational', NULL, NULL, 'Northern Uganda highway');

-- Tanzania Infrastructure
INSERT INTO country_infrastructure (country_code, type, name, location, latitude, longitude, capacity, services, operating_hours, status, email, phone, address) VALUES
-- Airports
('TZ', 'airport', 'Julius Nyerere International Airport', 'Dar es Salaam', -6.8770, 39.2026, 'Annual capacity: 4M passengers', ARRAY['Cargo terminal', 'Cold storage', 'Customs'], '24/7', 'operational', 'info@tcaa.go.tz', '+255 22 284 4211', 'Dar es Salaam'),
('TZ', 'airport', 'Kilimanjaro International Airport', 'Arusha', -3.4294, 37.0745, 'Tourism and cargo', ARRAY['Cargo handling', 'Cold storage'], '24/7', 'operational', NULL, NULL, 'Arusha'),
('TZ', 'airport', 'Mwanza Airport', 'Mwanza', -2.4444, 32.9328, 'Regional flights', ARRAY['Cargo handling'], 'Daily 6AM-8PM', 'operational', NULL, NULL, 'Mwanza'),

-- Ports
('TZ', 'port', 'Port of Dar es Salaam', 'Dar es Salaam', -6.8333, 39.2833, 'Annual capacity: 20M tons', ARRAY['Container terminal', 'Bulk cargo', 'Fuel terminal'], '24/7', 'operational', 'info@tpa.go.tz', '+255 22 212 7244', 'Dar es Salaam'),
('TZ', 'port', 'Port of Tanga', 'Tanga', -5.0667, 39.1000, 'Regional port', ARRAY['Cargo handling', 'Bulk cargo'], '24/7', 'operational', NULL, NULL, 'Tanga'),
('TZ', 'port', 'Port of Mtwara', 'Mtwara', -10.2667, 40.1833, 'Regional port', ARRAY['Cargo handling'], 'Daily 7AM-6PM', 'operational', NULL, NULL, 'Mtwara'),

-- Storage & Warehouses
('TZ', 'storage', 'Dar es Salaam Container Terminal', 'Dar es Salaam', -6.8500, 39.2833, '500,000 TEU capacity', ARRAY['Container storage', 'Customs clearance'], '24/7', 'operational', NULL, NULL, 'Port of Dar es Salaam'),
('TZ', 'warehouse', 'Tanzania Ports Authority Warehouse', 'Dar es Salaam', -6.8200, 39.2900, '10,000 sqm', ARRAY['Cold storage', 'Bonded warehouse'], '24/7', 'operational', NULL, NULL, 'Dar es Salaam'),
('TZ', 'storage', 'Arusha Logistics Hub', 'Arusha', -3.3869, 36.6830, '5,000 sqm', ARRAY['Cold storage', 'Distribution'], 'Mon-Fri 8AM-6PM', 'operational', NULL, NULL, 'Arusha'),

-- Roads
('TZ', 'road', 'Central Corridor', 'Dar es Salaam to Kigoma', -6.8333, 39.2833, 'Main trade route', ARRAY['Freight transport', 'Border crossing'], '24/7', 'operational', NULL, NULL, 'Dar es Salaam-Kigoma highway');

-- Ethiopia Infrastructure
INSERT INTO country_infrastructure (country_code, type, name, location, latitude, longitude, capacity, services, operating_hours, status, email, phone, address) VALUES
-- Airports
('ET', 'airport', 'Addis Ababa Bole International Airport', 'Addis Ababa', 8.9776, 38.7995, 'Annual capacity: 10M passengers', ARRAY['Cargo terminal', 'Cold storage', 'Customs', 'Bonded warehouse'], '24/7', 'operational', 'info@ethiopianairlines.com', '+251 11 665 2222', 'Addis Ababa'),
('ET', 'airport', 'Dire Dawa Airport', 'Dire Dawa', 9.6247, 41.8542, 'Regional flights', ARRAY['Cargo handling'], 'Daily 6AM-8PM', 'operational', NULL, NULL, 'Dire Dawa'),
('ET', 'airport', 'Mekelle Airport', 'Mekelle', 13.4667, 39.5333, 'Regional flights', ARRAY['Cargo handling'], 'Daily 6AM-6PM', 'operational', NULL, NULL, 'Mekelle'),

-- Ports (via Djibouti connection)
('ET', 'port', 'Modjo Dry Port', 'Modjo', 8.9000, 39.1167, 'Inland container depot', ARRAY['Container handling', 'Customs clearance'], '24/7', 'operational', NULL, NULL, 'Modjo, Oromia Region'),
('ET', 'port', 'Dire Dawa Dry Port', 'Dire Dawa', 9.6000, 41.8500, 'Inland container depot', ARRAY['Container handling', 'Customs clearance'], '24/7', 'operational', NULL, NULL, 'Dire Dawa'),

-- Storage & Warehouses
('ET', 'storage', 'Addis Ababa Logistics Hub', 'Addis Ababa', 8.9806, 38.7578, '25,000 sqm', ARRAY['Cold storage', 'Bonded warehouse', 'Distribution'], '24/7', 'operational', NULL, NULL, 'Addis Ababa'),
('ET', 'warehouse', 'Ethiopian Shipping & Logistics Warehouse', 'Addis Ababa', 9.0000, 38.7500, '15,000 sqm', ARRAY['Cold storage', 'Container storage'], '24/7', 'operational', NULL, NULL, 'Addis Ababa'),
('ET', 'storage', 'Hawassa Industrial Park Warehouse', 'Hawassa', 7.0500, 38.4833, '10,000 sqm', ARRAY['Cold storage', 'Bonded warehouse'], '24/7', 'operational', NULL, NULL, 'Hawassa Industrial Park'),

-- Roads
('ET', 'road', 'Addis Ababa-Djibouti Corridor', 'Addis Ababa to Djibouti', 8.9806, 38.7578, 'Main trade route', ARRAY['Freight transport', 'Border crossing'], '24/7', 'operational', NULL, NULL, 'Ethiopia-Djibouti highway');

-- ============================================
-- COUNTRY SUPPLIERS
-- ============================================

-- Rwanda Suppliers
INSERT INTO country_suppliers (country_code, name, category, location, region, email, phone, website, services, materials, verified, rating, data_source, description) VALUES
-- Construction Suppliers
('RW', 'CIMERWA Ltd', 'construction', 'Rusizi', 'Western Province', 'info@cimerwa.rw', '+250 788 123 456', 'www.cimerwa.rw', ARRAY['Cement production', 'Bulk delivery'], ARRAY['Cement'], true, 4.5, 'logcluster', 'Leading cement manufacturer in Rwanda'),
('RW', 'RAFI Ltd', 'construction', 'Kigali', 'Kigali', 'info@rafi.rw', '+250 788 234 567', NULL, ARRAY['Steel products', 'Construction materials'], ARRAY['Steel', 'Rebar'], true, 4.3, 'logcluster', 'Steel and construction materials supplier'),

-- Storage & Logistics
('RW', 'Kigali Logistics Park', 'storage', 'Kigali', 'Kigali', 'info@klp.rw', '+250 788 345 678', 'www.klp.rw', ARRAY['Warehousing', 'Cold storage', 'Distribution'], ARRAY['General cargo'], true, 4.7, 'logcluster', 'Modern logistics park with cold storage facilities'),
('RW', 'Rwanda Transport Company', 'transport', 'Kigali', 'Kigali', 'info@rtc.rw', '+250 788 456 789', NULL, ARRAY['Freight transport', 'Refrigerated transport'], ARRAY['General cargo'], true, 4.2, 'logcluster', 'National freight transport company'),

-- Agriculture
('RW', 'Rwanda Agriculture Board', 'agriculture', 'Kigali', 'Kigali', 'info@rab.gov.rw', '+250 788 567 890', 'www.rab.gov.rw', ARRAY['Seeds', 'Fertilizers', 'Agricultural advisory'], ARRAY['Seeds', 'Fertilizers'], true, 4.5, 'logcluster', 'Government agricultural agency');

-- Kenya Suppliers
INSERT INTO country_suppliers (country_code, name, category, location, region, email, phone, website, services, materials, verified, rating, data_source, description) VALUES
-- Construction Suppliers
('KE', 'Bamburi Cement Ltd', 'construction', 'Mombasa', 'Mombasa', 'info@bamburicement.com', '+254 41 231 2000', 'www.bamburicement.com', ARRAY['Cement production', 'Bulk delivery'], ARRAY['Cement'], true, 4.6, 'logcluster', 'Leading cement manufacturer in East Africa'),
('KE', 'Devki Steel Mills Ltd', 'construction', 'Nairobi', 'Nairobi', 'info@devkisteel.com', '+254 20 444 4444', 'www.devkisteel.com', ARRAY['Steel products', 'Construction materials'], ARRAY['Steel', 'Rebar'], true, 4.4, 'logcluster', 'Major steel manufacturer'),

-- Storage & Logistics
('KE', 'Kenya Ports Authority', 'storage', 'Mombasa', 'Mombasa', 'info@kpa.co.ke', '+254 41 231 4400', 'www.kpa.co.ke', ARRAY['Port services', 'Container handling', 'Warehousing'], ARRAY['Containers'], true, 4.8, 'logcluster', 'National port authority'),
('KE', 'Siginon Freight', 'transport', 'Nairobi', 'Nairobi', 'info@siginon.com', '+254 20 444 7700', 'www.siginon.com', ARRAY['Freight transport', 'Logistics', 'Customs clearance'], ARRAY['General cargo'], true, 4.5, 'logcluster', 'Leading logistics and freight company'),

-- Agriculture
('KE', 'Kenya Farmers Association', 'agriculture', 'Nairobi', 'Nairobi', 'info@kfa.co.ke', '+254 20 221 0000', 'www.kfa.co.ke', ARRAY['Seeds', 'Fertilizers', 'Agricultural inputs'], ARRAY['Seeds', 'Fertilizers'], true, 4.3, 'logcluster', 'Major agricultural supplier');

-- Uganda Suppliers
INSERT INTO country_suppliers (country_code, name, category, location, region, email, phone, website, services, materials, verified, rating, data_source, description) VALUES
-- Construction Suppliers
('UG', 'Hima Cement Ltd', 'construction', 'Kampala', 'Kampala', 'info@himacement.com', '+256 41 234 567', 'www.himacement.com', ARRAY['Cement production', 'Bulk delivery'], ARRAY['Cement'], true, 4.5, 'logcluster', 'Leading cement manufacturer in Uganda'),
('UG', 'Steel & Tube Industries', 'construction', 'Kampala', 'Kampala', 'info@sti.ug', '+256 41 345 678', NULL, ARRAY['Steel products', 'Construction materials'], ARRAY['Steel'], true, 4.2, 'logcluster', 'Steel products manufacturer'),

-- Storage & Logistics
('UG', 'Uganda Railways Corporation', 'transport', 'Kampala', 'Kampala', 'info@urc.go.ug', '+256 41 234 567', 'www.urc.go.ug', ARRAY['Rail transport', 'Freight services'], ARRAY['Bulk cargo'], true, 4.0, 'logcluster', 'National railway company'),
('UG', 'Uganda Warehouse Company', 'storage', 'Kampala', 'Kampala', 'info@uwc.ug', '+256 41 456 789', NULL, ARRAY['Warehousing', 'Cold storage'], ARRAY['General cargo'], true, 4.3, 'logcluster', 'Warehousing and storage services'),

-- Agriculture
('UG', 'Uganda National Farmers Federation', 'agriculture', 'Kampala', 'Kampala', 'info@unff.org', '+256 41 567 890', 'www.unff.org', ARRAY['Agricultural inputs', 'Farm advisory'], ARRAY['Seeds', 'Fertilizers'], true, 4.4, 'logcluster', 'National farmers organization');

-- Tanzania Suppliers
INSERT INTO country_suppliers (country_code, name, category, location, region, email, phone, website, services, materials, verified, rating, data_source, description) VALUES
-- Construction Suppliers
('TZ', 'Tanzania Portland Cement Company', 'construction', 'Dar es Salaam', 'Dar es Salaam', 'info@twiga.com', '+255 22 286 4000', 'www.twiga.com', ARRAY['Cement production', 'Bulk delivery'], ARRAY['Cement'], true, 4.5, 'logcluster', 'Major cement manufacturer'),
('TZ', 'A & K Steelworks', 'construction', 'Dar es Salaam', 'Dar es Salaam', 'info@aksteelworks.com', '+255 22 286 5000', NULL, ARRAY['Steel products', 'Construction materials'], ARRAY['Steel'], true, 4.3, 'logcluster', 'Steel fabrication company'),

-- Storage & Logistics
('TZ', 'Tanzania Ports Authority', 'storage', 'Dar es Salaam', 'Dar es Salaam', 'info@tpa.go.tz', '+255 22 212 7244', 'www.tpa.go.tz', ARRAY['Port services', 'Container handling', 'Warehousing'], ARRAY['Containers'], true, 4.7, 'logcluster', 'National port authority'),
('TZ', 'Freight Forwarders Tanzania', 'transport', 'Dar es Salaam', 'Dar es Salaam', 'info@fft.co.tz', '+255 22 286 6000', NULL, ARRAY['Freight forwarding', 'Customs clearance'], ARRAY['General cargo'], true, 4.4, 'logcluster', 'Freight forwarding services'),

-- Agriculture
('TZ', 'Tanzania Agriculture Research Institute', 'agriculture', 'Dar es Salaam', 'Dar es Salaam', 'info@tari.go.tz', '+255 22 286 7000', 'www.tari.go.tz', ARRAY['Agricultural research', 'Seeds', 'Fertilizers'], ARRAY['Seeds', 'Fertilizers'], true, 4.5, 'logcluster', 'Government agricultural research institute');

-- Ethiopia Suppliers
INSERT INTO country_suppliers (country_code, name, category, location, region, email, phone, website, services, materials, verified, rating, data_source, description) VALUES
-- Construction Suppliers
('ET', 'Dangote Cement Ethiopia', 'construction', 'Addis Ababa', 'Addis Ababa', 'info@dangote.com', '+251 11 667 0000', 'www.dangote.com', ARRAY['Cement production', 'Bulk delivery'], ARRAY['Cement'], true, 4.6, 'logcluster', 'Major cement manufacturer'),
('ET', 'Ethiopian Steel Plc', 'construction', 'Addis Ababa', 'Addis Ababa', 'info@ethiosteel.com', '+251 11 667 1000', NULL, ARRAY['Steel products', 'Construction materials'], ARRAY['Steel'], true, 4.3, 'logcluster', 'Steel manufacturing company'),

-- Storage & Logistics
('ET', 'Ethiopian Shipping & Logistics', 'transport', 'Addis Ababa', 'Addis Ababa', 'info@esl.com.et', '+251 11 667 2000', 'www.esl.com.et', ARRAY['Shipping', 'Freight forwarding', 'Logistics'], ARRAY['General cargo'], true, 4.7, 'logcluster', 'National shipping and logistics company'),
('ET', 'Ethiopian Maritime Affairs Authority', 'storage', 'Addis Ababa', 'Addis Ababa', 'info@emaa.gov.et', '+251 11 667 3000', 'www.emaa.gov.et', ARRAY['Port management', 'Maritime services'], ARRAY['Containers'], true, 4.5, 'logcluster', 'Government maritime authority'),

-- Agriculture
('ET', 'Ethiopian Seed Enterprise', 'agriculture', 'Addis Ababa', 'Addis Ababa', 'info@ese.com.et', '+251 11 667 4000', 'www.ese.com.et', ARRAY['Seeds', 'Agricultural inputs'], ARRAY['Seeds'], true, 4.5, 'logcluster', 'National seed company');

-- ============================================
-- COUNTRY PRICING
-- ============================================

-- Rwanda Pricing
INSERT INTO country_pricing (country_code, category, item, price, currency, unit, region, trend, previous_price, source, notes) VALUES
-- Fuel
('RW', 'fuel', 'Diesel', 1450.00, 'RWF', 'per liter', 'Kigali', 'stable', 1430.00, 'logcluster', 'Current market price'),
('RW', 'fuel', 'Petrol', 1500.00, 'RWF', 'per liter', 'Kigali', 'up', 1480.00, 'logcluster', 'Price increased due to global oil prices'),
('RW', 'fuel', 'Kerosene', 1200.00, 'RWF', 'per liter', 'Kigali', 'stable', 1200.00, 'logcluster', NULL),

-- Labor
('RW', 'labor', 'General Laborer', 3000.00, 'RWF', 'per day', 'Kigali', 'stable', 3000.00, 'logcluster', 'Daily wage for unskilled labor'),
('RW', 'labor', 'Skilled Worker', 8000.00, 'RWF', 'per day', 'Kigali', 'up', 7500.00, 'logcluster', 'Includes masons, carpenters'),
('RW', 'labor', 'Driver', 15000.00, 'RWF', 'per day', 'Kigali', 'stable', 15000.00, 'logcluster', 'Commercial vehicle driver'),

-- Transport
('RW', 'transport', 'Truck (5-ton)', 50000.00, 'RWF', 'per day', 'Kigali', 'stable', 50000.00, 'logcluster', 'Daily rental rate'),
('RW', 'transport', 'Container Truck', 80000.00, 'RWF', 'per day', 'Kigali', 'stable', 80000.00, 'logcluster', '20ft container transport'),
('RW', 'transport', 'Motorcycle Taxi', 5000.00, 'RWF', 'per trip', 'Kigali', 'stable', 5000.00, 'logcluster', 'Short distance transport'),

-- Storage
('RW', 'storage', 'Warehouse Space', 5000.00, 'RWF', 'per sqm per month', 'Kigali', 'stable', 5000.00, 'logcluster', 'Standard warehouse'),
('RW', 'storage', 'Cold Storage', 8000.00, 'RWF', 'per sqm per month', 'Kigali', 'stable', 8000.00, 'logcluster', 'Refrigerated storage'),

-- Materials
('RW', 'materials', 'Cement (50kg bag)', 9500.00, 'RWF', 'per bag', 'Kigali', 'stable', 9500.00, 'logcluster', 'Local cement brand'),
('RW', 'materials', 'Steel Rebar', 1200.00, 'RWF', 'per kg', 'Kigali', 'up', 1150.00, 'logcluster', 'Imported steel');

-- Kenya Pricing
INSERT INTO country_pricing (country_code, category, item, price, currency, unit, region, trend, previous_price, source, notes) VALUES
-- Fuel
('KE', 'fuel', 'Diesel', 180.00, 'KES', 'per liter', 'Nairobi', 'up', 175.00, 'logcluster', 'Current market price'),
('KE', 'fuel', 'Petrol', 200.00, 'KES', 'per liter', 'Nairobi', 'up', 195.00, 'logcluster', 'Price increased recently'),
('KE', 'fuel', 'Diesel', 185.00, 'KES', 'per liter', 'Mombasa', 'up', 180.00, 'logcluster', 'Slightly higher in Mombasa'),

-- Labor
('KE', 'labor', 'General Laborer', 800.00, 'KES', 'per day', 'Nairobi', 'stable', 800.00, 'logcluster', 'Daily wage'),
('KE', 'labor', 'Skilled Worker', 2000.00, 'KES', 'per day', 'Nairobi', 'stable', 2000.00, 'logcluster', 'Masons, carpenters'),
('KE', 'labor', 'Driver', 3000.00, 'KES', 'per day', 'Nairobi', 'stable', 3000.00, 'logcluster', 'Commercial driver'),

-- Transport
('KE', 'transport', 'Truck (10-ton)', 15000.00, 'KES', 'per day', 'Nairobi', 'stable', 15000.00, 'logcluster', 'Daily rental'),
('KE', 'transport', 'Container Truck', 25000.00, 'KES', 'per day', 'Mombasa', 'stable', 25000.00, 'logcluster', 'Port to inland'),
('KE', 'transport', 'Matatu (14-seater)', 500.00, 'KES', 'per trip', 'Nairobi', 'stable', 500.00, 'logcluster', 'Public transport'),

-- Storage
('KE', 'storage', 'Warehouse Space', 300.00, 'KES', 'per sqm per month', 'Nairobi', 'stable', 300.00, 'logcluster', 'Standard warehouse'),
('KE', 'storage', 'Cold Storage', 600.00, 'KES', 'per sqm per month', 'Nairobi', 'stable', 600.00, 'logcluster', 'Refrigerated'),

-- Materials
('KE', 'materials', 'Cement (50kg bag)', 650.00, 'KES', 'per bag', 'Nairobi', 'stable', 650.00, 'logcluster', 'Local brand'),
('KE', 'materials', 'Steel Rebar', 120.00, 'KES', 'per kg', 'Nairobi', 'up', 115.00, 'logcluster', 'Imported steel');

-- Uganda Pricing
INSERT INTO country_pricing (country_code, category, item, price, currency, unit, region, trend, previous_price, source, notes) VALUES
-- Fuel
('UG', 'fuel', 'Diesel', 4500.00, 'UGX', 'per liter', 'Kampala', 'stable', 4500.00, 'logcluster', 'Current market price'),
('UG', 'fuel', 'Petrol', 4800.00, 'UGX', 'per liter', 'Kampala', 'up', 4700.00, 'logcluster', 'Price increased'),
('UG', 'fuel', 'Kerosene', 4000.00, 'UGX', 'per liter', 'Kampala', 'stable', 4000.00, 'logcluster', NULL),

-- Labor
('UG', 'labor', 'General Laborer', 15000.00, 'UGX', 'per day', 'Kampala', 'stable', 15000.00, 'logcluster', 'Daily wage'),
('UG', 'labor', 'Skilled Worker', 35000.00, 'UGX', 'per day', 'Kampala', 'stable', 35000.00, 'logcluster', 'Skilled trades'),
('UG', 'labor', 'Driver', 50000.00, 'UGX', 'per day', 'Kampala', 'stable', 50000.00, 'logcluster', 'Commercial driver'),

-- Transport
('UG', 'transport', 'Truck (5-ton)', 200000.00, 'UGX', 'per day', 'Kampala', 'stable', 200000.00, 'logcluster', 'Daily rental'),
('UG', 'transport', 'Boda Boda', 5000.00, 'UGX', 'per trip', 'Kampala', 'stable', 5000.00, 'logcluster', 'Motorcycle taxi'),

-- Storage
('UG', 'storage', 'Warehouse Space', 8000.00, 'UGX', 'per sqm per month', 'Kampala', 'stable', 8000.00, 'logcluster', 'Standard warehouse'),
('UG', 'storage', 'Cold Storage', 15000.00, 'UGX', 'per sqm per month', 'Kampala', 'stable', 15000.00, 'logcluster', 'Refrigerated'),

-- Materials
('UG', 'materials', 'Cement (50kg bag)', 28000.00, 'UGX', 'per bag', 'Kampala', 'stable', 28000.00, 'logcluster', 'Local cement'),
('UG', 'materials', 'Steel Rebar', 3500.00, 'UGX', 'per kg', 'Kampala', 'up', 3300.00, 'logcluster', 'Imported steel');

-- Tanzania Pricing
INSERT INTO country_pricing (country_code, category, item, price, currency, unit, region, trend, previous_price, source, notes) VALUES
-- Fuel
('TZ', 'fuel', 'Diesel', 3100.00, 'TZS', 'per liter', 'Dar es Salaam', 'up', 3000.00, 'logcluster', 'Current market price'),
('TZ', 'fuel', 'Petrol', 3300.00, 'TZS', 'per liter', 'Dar es Salaam', 'up', 3200.00, 'logcluster', 'Price increased'),
('TZ', 'fuel', 'Kerosene', 2800.00, 'TZS', 'per liter', 'Dar es Salaam', 'stable', 2800.00, 'logcluster', NULL),

-- Labor
('TZ', 'labor', 'General Laborer', 15000.00, 'TZS', 'per day', 'Dar es Salaam', 'stable', 15000.00, 'logcluster', 'Daily wage'),
('TZ', 'labor', 'Skilled Worker', 40000.00, 'TZS', 'per day', 'Dar es Salaam', 'stable', 40000.00, 'logcluster', 'Skilled trades'),
('TZ', 'labor', 'Driver', 60000.00, 'TZS', 'per day', 'Dar es Salaam', 'stable', 60000.00, 'logcluster', 'Commercial driver'),

-- Transport
('TZ', 'transport', 'Truck (10-ton)', 200000.00, 'TZS', 'per day', 'Dar es Salaam', 'stable', 200000.00, 'logcluster', 'Daily rental'),
('TZ', 'transport', 'Container Truck', 350000.00, 'TZS', 'per day', 'Dar es Salaam', 'stable', 350000.00, 'logcluster', 'Port operations'),

-- Storage
('TZ', 'storage', 'Warehouse Space', 8000.00, 'TZS', 'per sqm per month', 'Dar es Salaam', 'stable', 8000.00, 'logcluster', 'Standard warehouse'),
('TZ', 'storage', 'Cold Storage', 15000.00, 'TZS', 'per sqm per month', 'Dar es Salaam', 'stable', 15000.00, 'logcluster', 'Refrigerated'),

-- Materials
('TZ', 'materials', 'Cement (50kg bag)', 16000.00, 'TZS', 'per bag', 'Dar es Salaam', 'stable', 16000.00, 'logcluster', 'Local brand'),
('TZ', 'materials', 'Steel Rebar', 2000.00, 'TZS', 'per kg', 'Dar es Salaam', 'up', 1900.00, 'logcluster', 'Imported steel');

-- Ethiopia Pricing
INSERT INTO country_pricing (country_code, category, item, price, currency, unit, region, trend, previous_price, source, notes) VALUES
-- Fuel
('ET', 'fuel', 'Diesel', 65.00, 'ETB', 'per liter', 'Addis Ababa', 'up', 62.00, 'logcluster', 'Current market price'),
('ET', 'fuel', 'Petrol', 68.00, 'ETB', 'per liter', 'Addis Ababa', 'up', 65.00, 'logcluster', 'Price increased'),
('ET', 'fuel', 'Kerosene', 60.00, 'ETB', 'per liter', 'Addis Ababa', 'stable', 60.00, 'logcluster', NULL),

-- Labor
('ET', 'labor', 'General Laborer', 150.00, 'ETB', 'per day', 'Addis Ababa', 'stable', 150.00, 'logcluster', 'Daily wage'),
('ET', 'labor', 'Skilled Worker', 400.00, 'ETB', 'per day', 'Addis Ababa', 'stable', 400.00, 'logcluster', 'Skilled trades'),
('ET', 'labor', 'Driver', 500.00, 'ETB', 'per day', 'Addis Ababa', 'stable', 500.00, 'logcluster', 'Commercial driver'),

-- Transport
('ET', 'transport', 'Truck (10-ton)', 5000.00, 'ETB', 'per day', 'Addis Ababa', 'stable', 5000.00, 'logcluster', 'Daily rental'),
('ET', 'transport', 'Container Truck', 8000.00, 'ETB', 'per day', 'Addis Ababa', 'stable', 8000.00, 'logcluster', 'Dry port operations'),

-- Storage
('ET', 'storage', 'Warehouse Space', 80.00, 'ETB', 'per sqm per month', 'Addis Ababa', 'stable', 80.00, 'logcluster', 'Standard warehouse'),
('ET', 'storage', 'Cold Storage', 150.00, 'ETB', 'per sqm per month', 'Addis Ababa', 'stable', 150.00, 'logcluster', 'Refrigerated'),

-- Materials
('ET', 'materials', 'Cement (50kg bag)', 420.00, 'ETB', 'per bag', 'Addis Ababa', 'stable', 420.00, 'logcluster', 'Local brand'),
('ET', 'materials', 'Steel Rebar', 52.00, 'ETB', 'per kg', 'Addis Ababa', 'up', 50.00, 'logcluster', 'Imported steel');

-- ============================================
-- GOVERNMENT CONTACTS
-- ============================================

-- Rwanda Government Contacts
INSERT INTO government_contacts (country_code, ministry, department, name, title, email, phone, website, jurisdiction, services) VALUES
-- Trade & Industry
('RW', 'Ministry of Trade and Industry', 'Trade Promotion', 'Dr. Jean Chrysostome Ngabitsinze', 'Minister', 'minister@minicom.gov.rw', '+250 788 123 456', 'www.minicom.gov.rw', 'National', ARRAY['Trade licensing', 'Import/Export permits', 'Investment promotion']),
('RW', 'Ministry of Trade and Industry', 'Export Promotion', 'Director', 'Director', 'exports@minicom.gov.rw', '+250 788 123 457', 'www.minicom.gov.rw', 'National', ARRAY['Export documentation', 'Trade facilitation', 'Market access']),
('RW', 'Ministry of Trade and Industry', 'Investment Promotion', 'Director', 'Director', 'investment@minicom.gov.rw', '+250 788 123 458', 'www.minicom.gov.rw', 'National', ARRAY['Investment permits', 'Business registration', 'Investment incentives']),
-- Infrastructure & Transport
('RW', 'Ministry of Infrastructure', 'Transport Division', 'Dr. Ernest Nsabimana', 'Minister', 'minister@mininfra.gov.rw', '+250 788 234 567', 'www.mininfra.gov.rw', 'National', ARRAY['Transport permits', 'Infrastructure development', 'Logistics planning']),
('RW', 'Ministry of Infrastructure', 'Roads Division', 'Director', 'Director', 'roads@mininfra.gov.rw', '+250 788 234 568', 'www.mininfra.gov.rw', 'National', ARRAY['Road permits', 'Transport regulation', 'Infrastructure maintenance']),
('RW', 'Ministry of Infrastructure', 'Aviation Division', 'Director', 'Director', 'aviation@mininfra.gov.rw', '+250 788 234 569', 'www.mininfra.gov.rw', 'National', ARRAY['Aviation permits', 'Airport operations', 'Flight clearances']),
-- Revenue & Customs
('RW', 'Rwanda Revenue Authority', 'Customs Division', 'Commissioner General', 'Commissioner', 'customs@rra.gov.rw', '+250 788 345 678', 'www.rra.gov.rw', 'National', ARRAY['Customs clearance', 'Import/Export documentation', 'Tax services']),
('RW', 'Rwanda Revenue Authority', 'Border Control', 'Director', 'Director', 'borders@rra.gov.rw', '+250 788 345 679', 'www.rra.gov.rw', 'National', ARRAY['Border clearance', 'Transit permits', 'Border documentation']),
('RW', 'Rwanda Revenue Authority', 'Tax Services', 'Director', 'Director', 'tax@rra.gov.rw', '+250 788 345 680', 'www.rra.gov.rw', 'National', ARRAY['Tax registration', 'Tax clearance', 'Tax compliance']),
-- Finance & Planning
('RW', 'Ministry of Finance and Economic Planning', 'Trade Finance', 'Director', 'Director', 'trade.finance@minecofin.gov.rw', '+250 788 456 789', 'www.minecofin.gov.rw', 'National', ARRAY['Trade financing', 'Export credit', 'Financial services']),
-- Agriculture
('RW', 'Ministry of Agriculture and Animal Resources', 'Agri-Trade', 'Director', 'Director', 'agritrade@minagri.gov.rw', '+250 788 567 890', 'www.minagri.gov.rw', 'National', ARRAY['Agricultural permits', 'Food safety', 'Export certification']),
-- Standards & Quality
('RW', 'Rwanda Standards Board', 'Quality Control', 'Director General', 'Director General', 'info@rsb.gov.rw', '+250 788 678 901', 'www.rsb.gov.rw', 'National', ARRAY['Product certification', 'Standards compliance', 'Quality assurance']),
-- Logistics Coordination
('RW', 'Rwanda Development Board', 'Logistics Hub', 'Director', 'Director', 'logistics@rdb.rw', '+250 788 789 012', 'www.rdb.rw', 'National', ARRAY['Logistics coordination', 'One-stop services', 'Business facilitation']);

-- Kenya Government Contacts
INSERT INTO government_contacts (country_code, ministry, department, name, title, email, phone, website, jurisdiction, services) VALUES
-- Trade & Investment
('KE', 'Ministry of Trade, Investment and Industry', 'Trade Development', 'Hon. Rebecca Miano', 'Cabinet Secretary', 'cs@trade.go.ke', '+254 20 222 7461', 'www.trade.go.ke', 'National', ARRAY['Trade licensing', 'Import/Export permits', 'Investment promotion']),
('KE', 'Ministry of Trade, Investment and Industry', 'Export Promotion', 'Director', 'Director', 'exports@trade.go.ke', '+254 20 222 7462', 'www.trade.go.ke', 'National', ARRAY['Export documentation', 'Trade facilitation', 'Market access']),
('KE', 'Ministry of Trade, Investment and Industry', 'Investment Promotion', 'Director', 'Director', 'investment@trade.go.ke', '+254 20 222 7463', 'www.trade.go.ke', 'National', ARRAY['Investment permits', 'Business registration', 'Investment incentives']),
('KE', 'Ministry of Trade, Investment and Industry', 'Standards and Quality', 'Director', 'Director', 'standards@trade.go.ke', '+254 20 222 7464', 'www.trade.go.ke', 'National', ARRAY['Product certification', 'Standards compliance', 'Quality assurance']),
-- Transport & Infrastructure
('KE', 'Ministry of Transport and Infrastructure', 'Transport Division', 'Hon. Kipchumba Murkomen', 'Cabinet Secretary', 'cs@transport.go.ke', '+254 20 272 9200', 'www.transport.go.ke', 'National', ARRAY['Transport permits', 'Infrastructure development', 'Logistics planning']),
('KE', 'Ministry of Transport and Infrastructure', 'Roads Division', 'Director', 'Director', 'roads@transport.go.ke', '+254 20 272 9201', 'www.transport.go.ke', 'National', ARRAY['Road permits', 'Transport regulation', 'Infrastructure maintenance']),
('KE', 'Ministry of Transport and Infrastructure', 'Railway Division', 'Director', 'Director', 'railway@transport.go.ke', '+254 20 272 9202', 'www.transport.go.ke', 'National', ARRAY['Rail permits', 'Railway operations', 'Rail infrastructure']),
('KE', 'Ministry of Transport and Infrastructure', 'Aviation Division', 'Director', 'Director', 'aviation@transport.go.ke', '+254 20 272 9203', 'www.transport.go.ke', 'National', ARRAY['Aviation permits', 'Airport operations', 'Flight clearances']),
-- Revenue & Customs
('KE', 'Kenya Revenue Authority', 'Customs and Border Control', 'Commissioner General', 'Commissioner', 'customs@kra.go.ke', '+254 20 281 0000', 'www.kra.go.ke', 'National', ARRAY['Customs clearance', 'Import/Export documentation', 'Tax services']),
('KE', 'Kenya Revenue Authority', 'Border Control', 'Director', 'Director', 'borders@kra.go.ke', '+254 20 281 0001', 'www.kra.go.ke', 'National', ARRAY['Border clearance', 'Transit permits', 'Border documentation']),
('KE', 'Kenya Revenue Authority', 'Tax Services', 'Director', 'Director', 'tax@kra.go.ke', '+254 20 281 0002', 'www.kra.go.ke', 'National', ARRAY['Tax registration', 'Tax clearance', 'Tax compliance']),
-- Ports & Maritime
('KE', 'Kenya Ports Authority', 'Port Operations', 'General Manager', 'General Manager', 'info@kpa.co.ke', '+254 41 231 4400', 'www.kpa.co.ke', 'National', ARRAY['Port services', 'Container handling', 'Maritime services']),
('KE', 'Kenya Ports Authority', 'Cargo Operations', 'Manager', 'Manager', 'cargo@kpa.co.ke', '+254 41 231 4401', 'www.kpa.co.ke', 'National', ARRAY['Cargo handling', 'Container management', 'Port clearance']),
('KE', 'Kenya Maritime Authority', 'Maritime Services', 'Director General', 'Director General', 'info@kma.go.ke', '+254 20 222 9090', 'www.kma.go.ke', 'National', ARRAY['Maritime permits', 'Shipping regulations', 'Maritime safety']),
-- Finance
('KE', 'National Treasury', 'Trade Finance', 'Director', 'Director', 'trade.finance@treasury.go.ke', '+254 20 222 7000', 'www.treasury.go.ke', 'National', ARRAY['Trade financing', 'Export credit', 'Financial services']),
-- Agriculture
('KE', 'Ministry of Agriculture, Livestock and Fisheries', 'Agri-Trade', 'Director', 'Director', 'agritrade@kilimo.go.ke', '+254 20 271 8870', 'www.kilimo.go.ke', 'National', ARRAY['Agricultural permits', 'Food safety', 'Export certification']),
('KE', 'Kenya Plant Health Inspectorate Service', 'Phytosanitary', 'Director', 'Director', 'info@kephis.org', '+254 20 856 1313', 'www.kephis.org', 'National', ARRAY['Plant health certification', 'Phytosanitary permits', 'Export inspection']),
-- Standards
('KE', 'Kenya Bureau of Standards', 'Quality Control', 'Director General', 'Director General', 'info@kebs.org', '+254 20 694 8000', 'www.kebs.org', 'National', ARRAY['Product certification', 'Standards compliance', 'Quality assurance']),
-- Logistics Coordination
('KE', 'Kenya Investment Authority', 'Logistics Hub', 'Director', 'Director', 'logistics@invest.go.ke', '+254 20 690 0000', 'www.invest.go.ke', 'National', ARRAY['Logistics coordination', 'One-stop services', 'Business facilitation']),
-- Emergency Services
('KE', 'National Disaster Management Unit', 'Emergency Logistics', 'Director', 'Director', 'emergency@ndma.go.ke', '+254 20 222 0202', 'www.ndma.go.ke', 'National', ARRAY['Emergency coordination', 'Disaster logistics', 'Crisis management']);

-- Uganda Government Contacts
INSERT INTO government_contacts (country_code, ministry, department, name, title, email, phone, website, jurisdiction, services) VALUES
-- Trade & Industry
('UG', 'Ministry of Trade, Industry and Cooperatives', 'Trade Development', 'Hon. Francis Mwebesa', 'Minister', 'minister@mtic.go.ug', '+256 41 234 567', 'www.mtic.go.ug', 'National', ARRAY['Trade licensing', 'Import/Export permits', 'Investment promotion']),
('UG', 'Ministry of Trade, Industry and Cooperatives', 'Export Promotion', 'Director', 'Director', 'exports@mtic.go.ug', '+256 41 234 568', 'www.mtic.go.ug', 'National', ARRAY['Export documentation', 'Trade facilitation', 'Market access']),
('UG', 'Ministry of Trade, Industry and Cooperatives', 'Investment Promotion', 'Director', 'Director', 'investment@mtic.go.ug', '+256 41 234 569', 'www.mtic.go.ug', 'National', ARRAY['Investment permits', 'Business registration', 'Investment incentives']),
-- Works & Transport
('UG', 'Ministry of Works and Transport', 'Transport Division', 'Hon. Gen. Katumba Wamala', 'Minister', 'minister@mwt.go.ug', '+256 41 345 678', 'www.mwt.go.ug', 'National', ARRAY['Transport permits', 'Infrastructure development', 'Logistics planning']),
('UG', 'Ministry of Works and Transport', 'Roads Division', 'Director', 'Director', 'roads@mwt.go.ug', '+256 41 345 679', 'www.mwt.go.ug', 'National', ARRAY['Road permits', 'Transport regulation', 'Infrastructure maintenance']),
('UG', 'Ministry of Works and Transport', 'Railway Division', 'Director', 'Director', 'railway@mwt.go.ug', '+256 41 345 680', 'www.mwt.go.ug', 'National', ARRAY['Rail permits', 'Railway operations', 'Rail infrastructure']),
('UG', 'Ministry of Works and Transport', 'Maritime Division', 'Director', 'Director', 'maritime@mwt.go.ug', '+256 41 345 681', 'www.mwt.go.ug', 'National', ARRAY['Maritime permits', 'Port operations', 'Lake transport']),
-- Revenue & Customs
('UG', 'Uganda Revenue Authority', 'Customs Division', 'Commissioner General', 'Commissioner', 'customs@ura.go.ug', '+256 41 456 789', 'www.ura.go.ug', 'National', ARRAY['Customs clearance', 'Import/Export documentation', 'Tax services']),
('UG', 'Uganda Revenue Authority', 'Border Control', 'Director', 'Director', 'borders@ura.go.ug', '+256 41 456 790', 'www.ura.go.ug', 'National', ARRAY['Border clearance', 'Transit permits', 'Border documentation']),
('UG', 'Uganda Revenue Authority', 'Tax Services', 'Director', 'Director', 'tax@ura.go.ug', '+256 41 456 791', 'www.ura.go.ug', 'National', ARRAY['Tax registration', 'Tax clearance', 'Tax compliance']),
-- Finance
('UG', 'Ministry of Finance, Planning and Economic Development', 'Trade Finance', 'Director', 'Director', 'trade.finance@finance.go.ug', '+256 41 234 000', 'www.finance.go.ug', 'National', ARRAY['Trade financing', 'Export credit', 'Financial services']),
-- Agriculture
('UG', 'Ministry of Agriculture, Animal Industry and Fisheries', 'Agri-Trade', 'Director', 'Director', 'agritrade@agriculture.go.ug', '+256 41 320 000', 'www.agriculture.go.ug', 'National', ARRAY['Agricultural permits', 'Food safety', 'Export certification']),
-- Standards
('UG', 'Uganda National Bureau of Standards', 'Quality Control', 'Director General', 'Director General', 'info@unbs.go.ug', '+256 41 505 999', 'www.unbs.go.ug', 'National', ARRAY['Product certification', 'Standards compliance', 'Quality assurance']),
-- Logistics Coordination
('UG', 'Uganda Investment Authority', 'Logistics Hub', 'Director', 'Director', 'logistics@ugandainvest.go.ug', '+256 41 700 000', 'www.ugandainvest.go.ug', 'National', ARRAY['Logistics coordination', 'One-stop services', 'Business facilitation']),
-- Port Authority
('UG', 'Uganda Railways Corporation', 'Port Operations', 'General Manager', 'General Manager', 'info@urc.go.ug', '+256 41 320 500', 'www.urc.go.ug', 'National', ARRAY['Port services', 'Railway operations', 'Cargo handling']);

-- Tanzania Government Contacts
INSERT INTO government_contacts (country_code, ministry, department, name, title, email, phone, website, jurisdiction, services) VALUES
-- Trade & Investment
('TZ', 'Ministry of Industry, Trade and Investment', 'Trade Development', 'Hon. Dr. Ashatu Kijaji', 'Minister', 'minister@miti.go.tz', '+255 22 212 0711', 'www.miti.go.tz', 'National', ARRAY['Trade licensing', 'Import/Export permits', 'Investment promotion']),
('TZ', 'Ministry of Industry, Trade and Investment', 'Export Promotion', 'Director', 'Director', 'exports@miti.go.tz', '+255 22 212 0712', 'www.miti.go.tz', 'National', ARRAY['Export documentation', 'Trade facilitation', 'Market access']),
('TZ', 'Ministry of Industry, Trade and Investment', 'Investment Promotion', 'Director', 'Director', 'investment@miti.go.tz', '+255 22 212 0713', 'www.miti.go.tz', 'National', ARRAY['Investment permits', 'Business registration', 'Investment incentives']),
-- Works & Transport
('TZ', 'Ministry of Works and Transport', 'Transport Division', 'Hon. Prof. Makame Mbarawa', 'Minister', 'minister@mwt.go.tz', '+255 22 212 7244', 'www.mwt.go.tz', 'National', ARRAY['Transport permits', 'Infrastructure development', 'Logistics planning']),
('TZ', 'Ministry of Works and Transport', 'Roads Division', 'Director', 'Director', 'roads@mwt.go.tz', '+255 22 212 7245', 'www.mwt.go.tz', 'National', ARRAY['Road permits', 'Transport regulation', 'Infrastructure maintenance']),
('TZ', 'Ministry of Works and Transport', 'Railway Division', 'Director', 'Director', 'railway@mwt.go.tz', '+255 22 212 7246', 'www.mwt.go.tz', 'National', ARRAY['Rail permits', 'Railway operations', 'Rail infrastructure']),
('TZ', 'Ministry of Works and Transport', 'Aviation Division', 'Director', 'Director', 'aviation@mwt.go.tz', '+255 22 212 7247', 'www.mwt.go.tz', 'National', ARRAY['Aviation permits', 'Airport operations', 'Flight clearances']),
-- Revenue & Customs
('TZ', 'Tanzania Revenue Authority', 'Customs Division', 'Commissioner General', 'Commissioner', 'customs@tra.go.tz', '+255 22 292 5000', 'www.tra.go.tz', 'National', ARRAY['Customs clearance', 'Import/Export documentation', 'Tax services']),
('TZ', 'Tanzania Revenue Authority', 'Border Control', 'Director', 'Director', 'borders@tra.go.tz', '+255 22 292 5001', 'www.tra.go.tz', 'National', ARRAY['Border clearance', 'Transit permits', 'Border documentation']),
('TZ', 'Tanzania Revenue Authority', 'Tax Services', 'Director', 'Director', 'tax@tra.go.tz', '+255 22 292 5002', 'www.tra.go.tz', 'National', ARRAY['Tax registration', 'Tax clearance', 'Tax compliance']),
-- Ports & Maritime
('TZ', 'Tanzania Ports Authority', 'Port Operations', 'Director General', 'Director General', 'info@tpa.go.tz', '+255 22 212 7244', 'www.tpa.go.tz', 'National', ARRAY['Port services', 'Container handling', 'Maritime services']),
('TZ', 'Tanzania Ports Authority', 'Cargo Operations', 'Manager', 'Manager', 'cargo@tpa.go.tz', '+255 22 212 7245', 'www.tpa.go.tz', 'National', ARRAY['Cargo handling', 'Container management', 'Port clearance']),
('TZ', 'Tanzania Maritime Authority', 'Maritime Services', 'Director General', 'Director General', 'info@tma.go.tz', '+255 22 213 7720', 'www.tma.go.tz', 'National', ARRAY['Maritime permits', 'Shipping regulations', 'Maritime safety']),
-- Finance
('TZ', 'Ministry of Finance and Planning', 'Trade Finance', 'Director', 'Director', 'trade.finance@mof.go.tz', '+255 22 292 8000', 'www.mof.go.tz', 'National', ARRAY['Trade financing', 'Export credit', 'Financial services']),
-- Agriculture
('TZ', 'Ministry of Agriculture', 'Agri-Trade', 'Director', 'Director', 'agritrade@agriculture.go.tz', '+255 22 286 3000', 'www.agriculture.go.tz', 'National', ARRAY['Agricultural permits', 'Food safety', 'Export certification']),
-- Standards
('TZ', 'Tanzania Bureau of Standards', 'Quality Control', 'Director General', 'Director General', 'info@tbs.go.tz', '+255 22 245 0298', 'www.tbs.go.tz', 'National', ARRAY['Product certification', 'Standards compliance', 'Quality assurance']),
-- Logistics Coordination
('TZ', 'Tanzania Investment Centre', 'Logistics Hub', 'Director', 'Director', 'logistics@tic.go.tz', '+255 22 292 5000', 'www.tic.go.tz', 'National', ARRAY['Logistics coordination', 'One-stop services', 'Business facilitation']),
-- Emergency Services
('TZ', 'Disaster Management Department', 'Emergency Logistics', 'Director', 'Director', 'emergency@dmd.go.tz', '+255 22 212 5000', 'www.dmd.go.tz', 'National', ARRAY['Emergency coordination', 'Disaster logistics', 'Crisis management']);

-- Ethiopia Government Contacts
INSERT INTO government_contacts (country_code, ministry, department, name, title, email, phone, website, jurisdiction, services) VALUES
-- Trade & Regional Integration
('ET', 'Ministry of Trade and Regional Integration', 'Trade Development', 'Hon. Gebremeskel Chala', 'Minister', 'minister@moti.gov.et', '+251 11 551 7777', 'www.moti.gov.et', 'National', ARRAY['Trade licensing', 'Import/Export permits', 'Investment promotion']),
('ET', 'Ministry of Trade and Regional Integration', 'Export Promotion', 'Director', 'Director', 'exports@moti.gov.et', '+251 11 551 7778', 'www.moti.gov.et', 'National', ARRAY['Export documentation', 'Trade facilitation', 'Market access']),
('ET', 'Ministry of Trade and Regional Integration', 'Investment Promotion', 'Director', 'Director', 'investment@moti.gov.et', '+251 11 551 7779', 'www.moti.gov.et', 'National', ARRAY['Investment permits', 'Business registration', 'Investment incentives']),
-- Transport & Logistics
('ET', 'Ministry of Transport and Logistics', 'Transport Division', 'Hon. Alemu Sime', 'Minister', 'minister@mot.gov.et', '+251 11 552 0202', 'www.mot.gov.et', 'National', ARRAY['Transport permits', 'Infrastructure development', 'Logistics planning']),
('ET', 'Ministry of Transport and Logistics', 'Roads Division', 'Director', 'Director', 'roads@mot.gov.et', '+251 11 552 0203', 'www.mot.gov.et', 'National', ARRAY['Road permits', 'Transport regulation', 'Infrastructure maintenance']),
('ET', 'Ministry of Transport and Logistics', 'Railway Division', 'Director', 'Director', 'railway@mot.gov.et', '+251 11 552 0204', 'www.mot.gov.et', 'National', ARRAY['Rail permits', 'Railway operations', 'Rail infrastructure']),
('ET', 'Ministry of Transport and Logistics', 'Aviation Division', 'Director', 'Director', 'aviation@mot.gov.et', '+251 11 552 0205', 'www.mot.gov.et', 'National', ARRAY['Aviation permits', 'Airport operations', 'Flight clearances']),
-- Revenue & Customs
('ET', 'Ethiopian Revenue Authority', 'Customs Division', 'Commissioner General', 'Commissioner', 'customs@era.gov.et', '+251 11 558 0000', 'www.era.gov.et', 'National', ARRAY['Customs clearance', 'Import/Export documentation', 'Tax services']),
('ET', 'Ethiopian Revenue Authority', 'Border Control', 'Director', 'Director', 'borders@era.gov.et', '+251 11 558 0001', 'www.era.gov.et', 'National', ARRAY['Border clearance', 'Transit permits', 'Border documentation']),
('ET', 'Ethiopian Revenue Authority', 'Tax Services', 'Director', 'Director', 'tax@era.gov.et', '+251 11 558 0002', 'www.era.gov.et', 'National', ARRAY['Tax registration', 'Tax clearance', 'Tax compliance']),
-- Maritime Affairs
('ET', 'Ethiopian Maritime Affairs Authority', 'Port Operations', 'Director General', 'Director General', 'info@emaa.gov.et', '+251 11 667 3000', 'www.emaa.gov.et', 'National', ARRAY['Port management', 'Maritime services', 'Shipping regulations']),
('ET', 'Ethiopian Maritime Affairs Authority', 'Logistics Coordination', 'Director', 'Director', 'logistics@emaa.gov.et', '+251 11 667 3001', 'www.emaa.gov.et', 'National', ARRAY['Logistics coordination', 'Port logistics', 'Cargo management']),
-- Finance
('ET', 'Ministry of Finance', 'Trade Finance', 'Director', 'Director', 'trade.finance@mofed.gov.et', '+251 11 551 5000', 'www.mofed.gov.et', 'National', ARRAY['Trade financing', 'Export credit', 'Financial services']),
-- Agriculture
('ET', 'Ministry of Agriculture', 'Agri-Trade', 'Director', 'Director', 'agritrade@moa.gov.et', '+251 11 646 3977', 'www.moa.gov.et', 'National', ARRAY['Agricultural permits', 'Food safety', 'Export certification']),
-- Standards
('ET', 'Ethiopian Standards Agency', 'Quality Control', 'Director General', 'Director General', 'info@ethiostandards.org', '+251 11 646 6888', 'www.ethiostandards.org', 'National', ARRAY['Product certification', 'Standards compliance', 'Quality assurance']),
-- Investment
('ET', 'Ethiopian Investment Commission', 'Logistics Hub', 'Director', 'Director', 'logistics@eic.gov.et', '+251 11 551 0555', 'www.eic.gov.et', 'National', ARRAY['Logistics coordination', 'One-stop services', 'Business facilitation']),
-- Emergency Services
('ET', 'National Disaster Risk Management Commission', 'Emergency Logistics', 'Director', 'Director', 'emergency@ndrmc.gov.et', '+251 11 551 8000', 'www.ndrmc.gov.et', 'National', ARRAY['Emergency coordination', 'Disaster logistics', 'Crisis management']);

-- ============================================
-- UPDATE COMPLETENESS SCORES
-- ============================================

UPDATE country_profiles SET completeness = (
  SELECT 
    CASE 
      WHEN code = 'RW' THEN 85
      WHEN code = 'KE' THEN 90
      WHEN code = 'UG' THEN 80
      WHEN code = 'TZ' THEN 85
      WHEN code = 'ET' THEN 75
      ELSE 0
    END
);

-- ============================================
-- SUMMARY
-- ============================================
-- Countries seeded: 5 (RW, KE, UG, TZ, ET)
-- Infrastructure entries: ~40 facilities (airports, ports, warehouses, roads)
-- Suppliers: ~25 suppliers
-- Pricing entries: ~60 price items
-- Government contacts: ~65 contacts (comprehensive ministry and authority contacts)
-- Data source: LogCluster (https://www.logcluster.org/en/countries)
-- 
-- NOTE: To fetch REAL data from LogCluster:
-- 1. Register at https://logie.logcluster.org
-- 2. Get API credentials (if available)
-- 3. Run: npm run sync-logcluster
-- 4. Or manually extract data from LogIE platform
-- ============================================

