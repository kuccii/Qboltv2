# How to Fetch Real LogCluster Data

## Overview
This guide explains how to fetch **real data** from [LogCluster's LogIE platform](https://logie.logcluster.org) and populate your database.

## Current Status

✅ **Seed File Created**: `database/logcluster-country-seed.sql`  
✅ **Fetcher Service**: `src/services/logClusterFetcher.ts`  
✅ **Sync Script**: `scripts/sync-logcluster-data.js`

## Method 1: Using LogIE Platform (Manual Extraction)

### Step 1: Register for LogIE Access
1. Visit: https://logie.logcluster.org
2. Click "Register" or "Request Access"
3. Complete registration (may require verification)
4. Login to LogIE platform

### Step 2: Extract Country Data
For each country (RW, KE, UG, TZ, ET):

1. **Navigate to Country Page**:
   - Select country from dropdown
   - Or visit: `https://logie.logcluster.org/countries/{country-code}`

2. **Extract Infrastructure Data**:
   - Go to "Infrastructure" section
   - Find: Airports, Ports, Warehouses, Storage facilities
   - Copy: Name, Location, Coordinates, Capacity, Services, Contact info

3. **Extract Supplier Data**:
   - Go to "Service Providers" or "Suppliers" section
   - Find: Construction, Transport, Storage, Agriculture suppliers
   - Copy: Name, Category, Location, Contact, Services

4. **Extract Pricing Data**:
   - Go to "Pricing" or "Market Intelligence" section
   - Find: Fuel prices, Labor rates, Transport costs, Storage rates
   - Copy: Item, Price, Currency, Unit, Region, Trend

5. **Extract Government Contacts**:
   - Go to "Government" or "Authorities" section
   - Find: Trade ministries, Transport ministries, Customs, Port authorities
   - Copy: Ministry, Name, Title, Contact info

### Step 3: Update Seed File
1. Open `database/logcluster-country-seed.sql`
2. Replace placeholder data with real LogCluster data
3. Maintain the same SQL structure
4. Run the updated SQL in Supabase

## Method 2: Using LogCluster API (If Available)

### Step 1: Request API Access
1. Contact LogCluster support: support@logcluster.org
2. Request API credentials
3. Get API documentation

### Step 2: Configure Environment
```bash
# Add to .env.local
LOGCLUSTER_API_KEY=your_api_key_here
LOGCLUSTER_API_URL=https://api.logcluster.org
```

### Step 3: Run Sync Script
```bash
npm run sync-logcluster
```

This will:
- Fetch data from LogCluster API
- Transform data to match our schema
- Insert into Supabase database
- Update completeness scores

## Method 3: Using Logistics Capacity Assessments (LCAs)

### Step 1: Download LCA Reports
Visit: https://www.logcluster.org/en/document/logistics-capacity-assessments-lcas

Download LCAs for:
- Rwanda
- Kenya
- Uganda
- Tanzania
- Ethiopia

### Step 2: Extract Data from PDFs/Excel
LCAs typically contain:
- **Infrastructure**: Detailed airport, port, warehouse information
- **Transport Networks**: Road, rail, air routes
- **Storage Facilities**: Capacity, services, locations
- **Customs Procedures**: Contact information, requirements
- **Pricing Benchmarks**: Typical costs for operations

### Step 3: Structure Data
Use the format in `database/logcluster-country-seed.sql` to structure extracted data.

## Data Structure Reference

### Infrastructure
```sql
INSERT INTO country_infrastructure (
  country_code, type, name, location, 
  latitude, longitude, capacity, services, 
  operating_hours, status, email, phone, address
) VALUES (...);
```

### Suppliers
```sql
INSERT INTO country_suppliers (
  country_code, name, category, location, region,
  email, phone, website, services, materials,
  verified, rating, data_source, description
) VALUES (...);
```

### Pricing
```sql
INSERT INTO country_pricing (
  country_code, category, item, price, currency, unit,
  region, trend, previous_price, source, notes
) VALUES (...);
```

### Government Contacts
```sql
INSERT INTO government_contacts (
  country_code, ministry, department, name, title,
  email, phone, website, jurisdiction, services
) VALUES (...);
```

## Quick Start (Using Seed File)

If you want to start with realistic seed data while setting up LogCluster access:

1. **Run the schema**:
   ```sql
   -- In Supabase SQL Editor
   -- Run: database/country-profiles-schema.sql
   ```

2. **Run the seed file**:
   ```sql
   -- In Supabase SQL Editor
   -- Run: database/logcluster-country-seed.sql
   ```

3. **Verify data**:
   ```sql
   SELECT code, name, completeness, data_source 
   FROM country_profiles;
   ```

## Updating with Real Data

Once you have LogCluster access:

1. **Extract Data**: Use Method 1, 2, or 3 above
2. **Update Seed File**: Replace entries in `logcluster-country-seed.sql`
3. **Or Use API**: Run `npm run sync-logcluster` (if API available)
4. **Re-run SQL**: Execute updated seed file in Supabase

## Important Notes

⚠️ **LogCluster Access Required**: 
- LogIE platform requires registration and login
- API access may require partnership agreement
- LCA reports are publicly available

⚠️ **Data Accuracy**:
- Verify contact information
- Check coordinates accuracy
- Update pricing regularly
- Confirm infrastructure status

⚠️ **Data Licensing**:
- Respect LogCluster's data usage policies
- Attribute data source appropriately
- Don't redistribute without permission

## References

- **LogCluster Website**: https://www.logcluster.org
- **LogIE Platform**: https://logie.logcluster.org
- **Country Pages**: https://www.logcluster.org/en/countries
- **LCA Documents**: https://www.logcluster.org/en/document/logistics-capacity-assessments-lcas
- **Contact**: support@logcluster.org

## Current Seed Data Summary

The seed file includes:
- ✅ **5 Countries**: RW, KE, UG, TZ, ET
- ✅ **~40 Infrastructure Facilities**: Airports, ports, warehouses, roads
- ✅ **~25 Suppliers**: Construction, transport, storage, agriculture
- ✅ **~60 Pricing Items**: Fuel, labor, transport, storage, materials
- ✅ **~15 Government Contacts**: Ministries, authorities, customs

**Data Source**: Realistic seed data based on LogCluster data structure. Replace with actual LogCluster data once access is obtained.


