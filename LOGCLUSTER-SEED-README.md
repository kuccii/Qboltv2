# LogCluster Country Profiles Seed Data

## Overview
This seed file contains comprehensive country profile data for all 5 countries in our system, based on information from the [Logistics Cluster](https://www.logcluster.org/en/countries).

## Countries Included
- 🇷🇼 **Rwanda** (RW) - Completeness: 85%
- 🇰🇪 **Kenya** (KE) - Completeness: 90%
- 🇺🇬 **Uganda** (UG) - Completeness: 80%
- 🇹🇿 **Tanzania** (TZ) - Completeness: 85%
- 🇪🇹 **Ethiopia** (ET) - Completeness: 75%

## Data Included

### Country Profiles
- Basic country information (name, flag, currency, regions)
- Population and GDP data
- Data source attribution (LogCluster)
- Completeness scores

### Infrastructure (30+ facilities)
- **Airports**: Major international and regional airports
- **Ports**: Seaports and lake ports
- **Storage & Warehouses**: Logistics parks, cold storage, container depots
- Includes coordinates, capacity, services, and contact information

### Suppliers (25+ suppliers)
- **Construction**: Cement and steel manufacturers
- **Storage & Logistics**: Warehousing and freight companies
- **Transport**: Freight and logistics providers
- **Agriculture**: Agricultural suppliers and organizations
- All marked with LogCluster as data source

### Pricing Data (60+ price items)
- **Fuel**: Diesel, petrol, kerosene prices by region
- **Labor**: Daily wages for various skill levels
- **Transport**: Vehicle rental rates
- **Storage**: Warehouse and cold storage rates
- **Materials**: Cement and steel prices
- Includes trend indicators (up/down/stable)

### Government Contacts (15+ contacts)
- **Ministries**: Trade, Transport, Infrastructure
- **Revenue Authorities**: Customs and tax departments
- **Port Authorities**: Maritime and port operations
- Contact information and services provided

## How to Use

1. **Run the schema first** (if not already done):
   ```sql
   -- Run: database/country-profiles-schema.sql
   ```

2. **Run the seed file**:
   ```sql
   -- Run: database/logcluster-country-seed.sql
   ```

3. **Verify the data**:
   ```sql
   SELECT code, name, completeness, data_source 
   FROM country_profiles 
   ORDER BY code;
   ```

## Data Sources

- **Primary Source**: [Logistics Cluster](https://www.logcluster.org/en/countries)
- **Additional Sources**: 
  - Country-specific logistics assessments
  - Government trade and transport ministries
  - Port and airport authorities
  - Industry associations

## Notes

- All data is marked with `data_source = 'logcluster'`
- Prices are in local currencies (RWF, KES, UGX, TZS, ETB)
- Infrastructure coordinates are approximate
- Contact information may need verification
- Completeness scores reflect data availability

## Next Steps

1. Verify data accuracy with LogCluster LogIE platform
2. Add more suppliers and infrastructure as needed
3. Update pricing data regularly
4. Expand government contacts database
5. Add demand mapping data (see `country-demand-schema.sql`)


