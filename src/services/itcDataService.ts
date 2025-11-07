/**
 * ITC (International Trade Centre) Data Service
 * Integrates data from:
 * - Export Potential Map: https://exportpotential.intracen.org/
 * - Trade Map: https://www.trademap.org/
 * 
 * Note: These services may require API keys or have rate limits.
 * For production, consider using a backend proxy to handle authentication.
 */

// Country code mapping: ISO 3166-1 alpha-2 to ITC country codes
const ITC_COUNTRY_CODES: Record<string, number> = {
  'RW': 646, // Rwanda
  'KE': 404, // Kenya
  'UG': 800, // Uganda
  'TZ': 834, // Tanzania
  'ET': 231, // Ethiopia
};

// Material/Product mapping to HS codes (simplified - you may need to expand this)
const MATERIAL_TO_HS: Record<string, string[]> = {
  'cement': ['2523', '2524'], // Cement, building materials
  'steel': ['7207', '7214', '7308'], // Steel products
  'aggregate': ['2517'], // Stone, gravel
  'sand': ['2505'], // Natural sand
  'gravel': ['2517'], // Gravel, crushed stone
  'timber': ['4403', '4407'], // Wood, timber
  'iron': ['7201', '7202'], // Iron and steel
  'copper': ['7403'], // Copper
  'aluminum': ['7601'], // Aluminum
};

interface ITCExportPotential {
  productCode: string;
  productName: string;
  exporterCountry: string;
  marketCountry: string;
  exportValue: number;
  exportPotential: number;
  distance: number;
  growthRate: number;
  marketSize: number;
  competition: number;
}

interface ITCTradeData {
  productCode: string;
  productName: string;
  country: string;
  partner: string;
  importValue: number;
  exportValue: number;
  tradeBalance: number;
  year: number;
  period: 'monthly' | 'quarterly' | 'yearly';
}

/**
 * Fetch export potential data from ITC Export Potential Map
 * Note: This is a simplified implementation. The actual API may require authentication.
 */
export async function fetchExportPotential(
  exporterCountry: string,
  marketCountry: string = 'w', // 'w' = world
  productCode?: string
): Promise<ITCExportPotential[]> {
  try {
    const exporterCode = ITC_COUNTRY_CODES[exporterCountry.toUpperCase()];
    if (!exporterCode) {
      console.warn(`No ITC code found for country: ${exporterCountry}`);
      return [];
    }

    // Note: The actual ITC API endpoint structure may differ
    // This is a placeholder implementation
    // You may need to:
    // 1. Use their official API if available
    // 2. Scrape their website (with permission)
    // 3. Use a backend proxy service
    
    // For now, return mock data structure that matches ITC format
    // In production, replace this with actual API calls
    
    const mockData: ITCExportPotential[] = [
      {
        productCode: productCode || '2523',
        productName: 'Cement',
        exporterCountry: exporterCountry,
        marketCountry: marketCountry,
        exportValue: Math.random() * 1000000,
        exportPotential: Math.random() * 2000000,
        distance: Math.random() * 0.5,
        growthRate: (Math.random() - 0.5) * 20,
        marketSize: Math.random() * 5000000,
        competition: Math.random() * 10,
      }
    ];

    return mockData;
  } catch (error) {
    console.error('Error fetching ITC export potential:', error);
    return [];
  }
}

/**
 * Fetch trade data from ITC Trade Map
 * Note: This is a simplified implementation. The actual API may require authentication.
 */
export async function fetchTradeData(
  country: string,
  partner?: string,
  productCode?: string,
  year?: number
): Promise<ITCTradeData[]> {
  try {
    const countryCode = ITC_COUNTRY_CODES[country.toUpperCase()];
    if (!countryCode) {
      console.warn(`No ITC code found for country: ${country}`);
      return [];
    }

    // Note: The actual ITC Trade Map API endpoint structure may differ
    // This is a placeholder implementation
    // You may need to:
    // 1. Use their official API if available
    // 2. Scrape their website (with permission)
    // 3. Use a backend proxy service
    
    // For now, return mock data structure that matches Trade Map format
    // In production, replace this with actual API calls
    
    const currentYear = year || new Date().getFullYear();
    const mockData: ITCTradeData[] = [
      {
        productCode: productCode || '2523',
        productName: 'Cement',
        country: country,
        partner: partner || 'World',
        importValue: Math.random() * 5000000,
        exportValue: Math.random() * 3000000,
        tradeBalance: Math.random() * 2000000 - 1000000,
        year: currentYear,
        period: 'yearly',
      }
    ];

    return mockData;
  } catch (error) {
    console.error('Error fetching ITC trade data:', error);
    return [];
  }
}

/**
 * Get export potential for East African countries
 * Filters by countries in user's profile
 */
export async function getEastAfricaExportPotential(
  countries: string[] = ['RW', 'KE', 'UG', 'TZ', 'ET'],
  material?: string
): Promise<ITCExportPotential[]> {
  try {
    const productCodes = material ? MATERIAL_TO_HS[material.toLowerCase()] || [] : [];
    
    const allData: ITCExportPotential[] = [];
    
    for (const country of countries) {
      if (!ITC_COUNTRY_CODES[country.toUpperCase()]) continue;
      
      // Fetch export potential to world markets
      const exportData = await fetchExportPotential(
        country,
        'w', // world
        productCodes[0]
      );
      
      allData.push(...exportData);
    }
    
    return allData;
  } catch (error) {
    console.error('Error fetching East Africa export potential:', error);
    return [];
  }
}

/**
 * Get trade data for East African countries
 * Filters by countries in user's profile
 */
export async function getEastAfricaTradeData(
  countries: string[] = ['RW', 'KE', 'UG', 'TZ', 'ET'],
  material?: string,
  year?: number
): Promise<ITCTradeData[]> {
  try {
    const productCodes = material ? MATERIAL_TO_HS[material.toLowerCase()] || [] : [];
    
    const allData: ITCTradeData[] = [];
    
    for (const country of countries) {
      if (!ITC_COUNTRY_CODES[country.toUpperCase()]) continue;
      
      // Fetch trade data
      const tradeData = await fetchTradeData(
        country,
        undefined, // all partners
        productCodes[0],
        year
      );
      
      allData.push(...tradeData);
    }
    
    return allData;
  } catch (error) {
    console.error('Error fetching East Africa trade data:', error);
    return [];
  }
}

/**
 * Convert ITC export potential data to demand mapping format
 */
export function convertExportPotentialToDemand(
  itcData: ITCExportPotential[]
): Array<{
  id: string;
  region: string;
  material: string;
  demand: number;
  trend: 'up' | 'down' | 'stable';
  coordinates: [number, number];
  timestamp: string;
  source: 'itc_export_potential';
  exportValue: number;
  exportPotential: number;
  growthRate: number;
  marketSize: number;
}> {
  // Country coordinates (approximate)
  const countryCoordinates: Record<string, [number, number]> = {
    'RW': [30.0619, -1.9403], // Rwanda
    'KE': [36.8219, -1.2921], // Kenya
    'UG': [32.2903, 1.3733], // Uganda
    'TZ': [34.8888, -6.3690], // Tanzania
    'ET': [38.7469, 9.1450], // Ethiopia
  };

  return itcData.map((item, index) => ({
    id: `itc-${item.exporterCountry}-${item.productCode}-${index}`,
    region: item.exporterCountry,
    material: item.productName,
    demand: item.exportPotential || item.marketSize,
    trend: item.growthRate > 5 ? 'up' : item.growthRate < -5 ? 'down' : 'stable',
    coordinates: countryCoordinates[item.exporterCountry] || [0, 0],
    timestamp: new Date().toISOString(),
    source: 'itc_export_potential',
    exportValue: item.exportValue,
    exportPotential: item.exportPotential,
    growthRate: item.growthRate,
    marketSize: item.marketSize,
  }));
}

/**
 * Convert ITC trade data to demand mapping format
 */
export function convertTradeDataToDemand(
  itcData: ITCTradeData[]
): Array<{
  id: string;
  region: string;
  material: string;
  demand: number;
  trend: 'up' | 'down' | 'stable';
  coordinates: [number, number];
  timestamp: string;
  source: 'itc_trade_map';
  importValue: number;
  exportValue: number;
  tradeBalance: number;
}> {
  // Country coordinates (approximate)
  const countryCoordinates: Record<string, [number, number]> = {
    'RW': [30.0619, -1.9403], // Rwanda
    'KE': [36.8219, -1.2921], // Kenya
    'UG': [32.2903, 1.3733], // Uganda
    'TZ': [34.8888, -6.3690], // Tanzania
    'ET': [38.7469, 9.1450], // Ethiopia
  };

  return itcData.map((item, index) => ({
    id: `itc-trade-${item.country}-${item.productCode}-${index}`,
    region: item.country,
    material: item.productName,
    demand: item.importValue, // Import value indicates demand
    trend: item.tradeBalance > 0 ? 'down' : 'up', // Negative balance = high demand
    coordinates: countryCoordinates[item.country] || [0, 0],
    timestamp: new Date().toISOString(),
    source: 'itc_trade_map',
    importValue: item.importValue,
    exportValue: item.exportValue,
    tradeBalance: item.tradeBalance,
  }));
}

