# LogCluster Data Integration Guide

## Overview
This guide explains how to fetch real data from [LogCluster's LogIE platform](https://logie.logcluster.org) and integrate it into our database.

## Access Methods

### Option 1: LogIE Platform (Manual)
1. **Access LogIE**: Visit https://logie.logcluster.org
2. **Login Required**: You'll need LogCluster credentials
3. **Navigate to Countries**: Select your country (RW, KE, UG, TZ, ET)
4. **Extract Data**:
   - Infrastructure (airports, ports, warehouses)
   - Suppliers and service providers
   - Government contacts
   - Logistics assessments

### Option 2: LogCluster API (If Available)
1. **Get API Credentials**: Contact LogCluster for API access
2. **Configure Environment**:
   ```bash
   LOGCLUSTER_API_KEY=your_api_key_here
   LOGCLUSTER_API_URL=https://api.logcluster.org
   ```
3. **Use the Fetcher Service**: `src/services/logClusterFetcher.ts`

### Option 3: Logistics Capacity Assessments (LCAs)
LogCluster provides detailed LCAs for each country:
- Visit: https://www.logcluster.org/en/document/logistics-capacity-assessments-lcas
- Download country-specific LCA reports
- Extract structured data from PDFs/Excel files

## Data Sources

### 1. LogIE Platform
- **URL**: https://logie.logcluster.org
- **Data Types**: 
  - Infrastructure locations and capacities
  - Service providers
  - Transport routes
  - Storage facilities
  - Government contacts

### 2. Country-Specific Pages
- **Rwanda**: https://www.logcluster.org/en/countries/rwanda
- **Kenya**: https://www.logcluster.org/en/countries/kenya
- **Uganda**: https://www.logcluster.org/en/countries/uganda
- **Tanzania**: https://www.logcluster.org/en/countries/tanzania
- **Ethiopia**: https://www.logcluster.org/en/countries/ethiopia

### 3. Logistics Capacity Assessments
- Detailed infrastructure assessments
- Port and airport capabilities
- Road and rail networks
- Storage facilities
- Customs procedures

## Implementation Steps

### Step 1: Get Access
1. Register for LogIE access at https://logie.logcluster.org
2. Request API access if needed (contact LogCluster support)
3. Obtain credentials for data access

### Step 2: Extract Data
Use the `logClusterFetcher.ts` service:

```typescript
import logClusterFetcher from './services/logClusterFetcher';

// Sync single country
await logClusterFetcher.syncCountryData('RW');

// Sync all countries
await logClusterFetcher.syncAllCountries();
```

### Step 3: Manual Data Entry (If No API)
If LogCluster doesn't provide an API:

1. **Download LCA Reports**: Get Logistics Capacity Assessments for each country
2. **Extract Data**: Use the structured format in `database/logcluster-country-seed.sql`
3. **Update Database**: Run SQL inserts or use the admin interface

### Step 4: Regular Updates
Set up a cron job or scheduled task:

```bash
# Weekly sync (example)
node scripts/sync-logcluster-data.js
```

## Current Seed Data

The `database/logcluster-country-seed.sql` file contains:
- ✅ 5 country profiles (RW, KE, UG, TZ, ET)
- ✅ 30+ infrastructure facilities
- ✅ 25+ suppliers
- ✅ 60+ pricing items
- ✅ 15+ government contacts

**Note**: This is realistic seed data based on LogCluster's data structure. To get actual real-time data, you need to:
1. Access LogIE platform
2. Extract data manually or via API
3. Update the seed file or database directly

## Data Structure Mapping

### LogCluster → Our Database

| LogCluster Data | Our Table | Fields |
|----------------|-----------|--------|
| Airports | `country_infrastructure` | type='airport', name, location, coordinates |
| Ports | `country_infrastructure` | type='port', name, location, capacity |
| Warehouses | `country_infrastructure` | type='warehouse', name, capacity, services |
| Service Providers | `country_suppliers` | name, category, location, services |
| Government Agencies | `government_contacts` | ministry, name, title, contact |
| Pricing Data | `country_pricing` | category, item, price, currency, unit |

## Next Steps

1. **Get LogCluster Access**: Register at https://logie.logcluster.org
2. **Extract Real Data**: Use LogIE platform or API
3. **Update Seed File**: Replace seed data with real LogCluster data
4. **Set Up Sync**: Implement automated sync (if API available)
5. **Verify Data**: Check accuracy and completeness

## References

- **LogCluster Website**: https://www.logcluster.org
- **LogIE Platform**: https://logie.logcluster.org
- **LCA Documents**: https://www.logcluster.org/en/document/logistics-capacity-assessments-lcas
- **Country Pages**: https://www.logcluster.org/en/countries


