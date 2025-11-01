// Multi-country data types for Qivook platform
// Designed to scale from Rwanda to other East African countries

export type CountryCode = 'RW' | 'KE' | 'UG' | 'TZ' | 'ET'; // Expandable

export interface ContactInfo {
  email: string;
  phone: string;
  website?: string;
  address?: string;
}

export interface CountryProfile {
  code: CountryCode;
  name: string;
  flag: string;
  currency: string;
  regions: string[];
  lastUpdated: string;
  dataSource: string;
  completeness: number; // 0-100% data coverage
  description?: string;
  population?: number;
  gdp?: number;
}

export interface CountrySupplier {
  id: string;
  countryCode: CountryCode;
  name: string;
  category: 'laboratory' | 'storage' | 'food' | 'transport' | 'government' | 'construction' | 'agriculture';
  location: string;
  region: string;
  contact: ContactInfo;
  services: string[];
  materials: string[];
  certifications: string[];
  verified: boolean;
  rating?: number;
  dataSource: 'user_contributed' | 'logcluster' | 'verified_partner';
  description?: string;
  establishedYear?: number;
  employeeCount?: string;
}

export interface CountryInfrastructure {
  id: string;
  countryCode: CountryCode;
  type: 'airport' | 'storage' | 'milling' | 'port' | 'road' | 'rail' | 'warehouse';
  name: string;
  location: string;
  coordinates?: [number, number];
  capacity: string;
  services: string[];
  operatingHours?: string;
  contact: ContactInfo;
  seasonalNotes?: string;
  status: 'operational' | 'under_construction' | 'maintenance' | 'closed';
  lastUpdated: string;
}

export interface CountryPricing {
  countryCode: CountryCode;
  category: 'fuel' | 'labor' | 'transport' | 'storage' | 'materials';
  item: string;
  price: number;
  currency: string;
  unit: string;
  lastUpdated: string;
  source: string;
  region?: string; // Some prices vary by region
  trend?: 'up' | 'down' | 'stable';
  previousPrice?: number;
  notes?: string;
}

export interface GovernmentContact {
  id: string;
  countryCode: CountryCode;
  ministry: string;
  department?: string;
  name: string;
  title: string;
  contact: ContactInfo;
  services: string[];
  jurisdiction?: string; // National, Provincial, Local
  lastUpdated: string;
}

export interface CountryData {
  profile: CountryProfile;
  suppliers: CountrySupplier[];
  infrastructure: CountryInfrastructure[];
  pricing: CountryPricing[];
  government: GovernmentContact[];
  lastProcessed: string;
}

// Helper types for UI components
export interface CountryFilter {
  code: CountryCode;
  name: string;
  flag: string;
  supplierCount: number;
  hasPricingData: boolean;
  hasInfrastructureData: boolean;
}

export interface CountryStats {
  totalSuppliers: number;
  verifiedSuppliers: number;
  governmentAgencies: number;
  infrastructureFacilities: number;
  pricingItems: number;
  lastUpdated: string;
}

// Data source types
export type DataSource = 'logcluster' | 'user_contributed' | 'verified_partner' | 'government' | 'api';

export interface DataSourceInfo {
  name: string;
  url?: string;
  lastUpdated: string;
  reliability: 'high' | 'medium' | 'low';
  coverage: string[];
}

// Search and filter types
export interface CountrySearchFilters {
  countries?: CountryCode[];
  categories?: string[];
  verified?: boolean;
  hasPricing?: boolean;
  searchTerm?: string;
  region?: string;
}

export interface CountrySearchResult {
  suppliers: CountrySupplier[];
  infrastructure: CountryInfrastructure[];
  government: GovernmentContact[];
  pricing: CountryPricing[];
  totalResults: number;
  searchTime: number;
}

