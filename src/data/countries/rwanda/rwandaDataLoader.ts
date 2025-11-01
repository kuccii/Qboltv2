// Rwanda-specific data loader for logcluster.org data
import { rwandaProcessor } from '../countryDataProcessor';
import { CountryData } from '../types';

// Load and process all 68 Rwanda JSON files
export async function loadRwandaData(): Promise<CountryData> {
  try {
    // Import all JSON files dynamically
    const jsonFiles = import.meta.glob('../../../rwanda/structured_data_*.json');
    
    const files = await Promise.all(
      Object.entries(jsonFiles).map(async ([path, loader]) => {
        try {
          const data = await loader();
          return data;
        } catch (error) {
          console.warn(`Failed to load file ${path}:`, error);
          return null;
        }
      })
    );
    
    // Filter out null results
    const validFiles = files.filter(file => file !== null);
    
    console.log(`Loaded ${validFiles.length} Rwanda data files`);
    
    return rwandaProcessor.loadCountryData(validFiles);
  } catch (error) {
    console.error('Error loading Rwanda data:', error);
    // Return empty data structure on error
    return {
      profile: {
        code: 'RW',
        name: 'Rwanda',
        flag: '🇷🇼',
        currency: 'RWF',
        regions: ['Kigali', 'Northern Province', 'Southern Province', 'Eastern Province', 'Western Province'],
        lastUpdated: new Date().toISOString(),
        dataSource: 'logcluster.org',
        completeness: 0,
        description: 'Landlocked country in East Africa'
      },
      suppliers: [],
      infrastructure: [],
      pricing: [],
      government: [],
      lastProcessed: new Date().toISOString()
    };
  }
}

// Cache for loaded data
let rwandaDataCache: CountryData | null = null;
let lastLoadTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getRwandaData(forceReload = false): Promise<CountryData> {
  const now = Date.now();
  
  if (!forceReload && rwandaDataCache && (now - lastLoadTime) < CACHE_DURATION) {
    return rwandaDataCache;
  }
  
  rwandaDataCache = await loadRwandaData();
  lastLoadTime = now;
  
  return rwandaDataCache;
}

// Helper functions for specific data types
export async function getRwandaSuppliers() {
  const data = await getRwandaData();
  return data.suppliers;
}

export async function getRwandaInfrastructure() {
  const data = await getRwandaData();
  return data.infrastructure;
}

export async function getRwandaPricing() {
  const data = await getRwandaData();
  return data.pricing;
}

export async function getRwandaGovernment() {
  const data = await getRwandaData();
  return data.government;
}

export async function getRwandaProfile() {
  const data = await getRwandaData();
  return data.profile;
}

// Search functions
export async function searchRwandaSuppliers(query: string, category?: string) {
  const suppliers = await getRwandaSuppliers();
  
  return suppliers.filter(supplier => {
    const matchesQuery = supplier.name.toLowerCase().includes(query.toLowerCase()) ||
                        supplier.services.some(service => service.toLowerCase().includes(query.toLowerCase())) ||
                        supplier.materials.some(material => material.toLowerCase().includes(query.toLowerCase()));
    
    const matchesCategory = !category || supplier.category === category;
    
    return matchesQuery && matchesCategory;
  });
}

export async function getRwandaSuppliersByCategory(category: string) {
  const suppliers = await getRwandaSuppliers();
  return suppliers.filter(supplier => supplier.category === category);
}

export async function getRwandaVerifiedSuppliers() {
  const suppliers = await getRwandaSuppliers();
  return suppliers.filter(supplier => supplier.verified);
}

// Statistics
export async function getRwandaStats() {
  const data = await getRwandaData();
  
  return {
    totalSuppliers: data.suppliers.length,
    verifiedSuppliers: data.suppliers.filter(s => s.verified).length,
    governmentAgencies: data.government.length,
    infrastructureFacilities: data.infrastructure.length,
    pricingItems: data.pricing.length,
    lastUpdated: data.lastProcessed,
    dataCompleteness: data.profile.completeness
  };
}

