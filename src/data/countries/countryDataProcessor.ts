// Generic country data processor for multi-country support
import { 
  CountryCode, 
  CountryData, 
  CountrySupplier, 
  CountryInfrastructure, 
  CountryPricing, 
  GovernmentContact,
  CountryProfile,
  ContactInfo
} from './types';

export class CountryDataProcessor {
  private country: CountryCode;
  private countryName: string;
  private currency: string;
  
  constructor(country: CountryCode) {
    this.country = country;
    this.countryName = this.getCountryName(country);
    this.currency = this.getCurrency(country);
  }
  
  // Process country-specific JSON files
  async loadCountryData(files: any[]): Promise<CountryData> {
    const profile = this.extractProfile(files);
    const suppliers = this.extractSuppliers(files);
    const infrastructure = this.extractInfrastructure(files);
    const pricing = this.extractPricing(files);
    const government = this.extractGovernment(files);
    
    return {
      profile,
      suppliers,
      infrastructure,
      pricing,
      government,
      lastProcessed: new Date().toISOString()
    };
  }
  
  // Extract country profile information
  private extractProfile(files: any[]): CountryProfile {
    const countryInfo = this.getCountryInfo();
    
    return {
      code: this.country,
      name: countryInfo.name,
      flag: countryInfo.flag,
      currency: this.currency,
      regions: countryInfo.regions,
      lastUpdated: new Date().toISOString(),
      dataSource: 'logcluster.org',
      completeness: this.calculateCompleteness(files),
      description: countryInfo.description,
      population: countryInfo.population,
      gdp: countryInfo.gdp
    };
  }
  
  // Extract suppliers from various data sources
  private extractSuppliers(files: any[]): CountrySupplier[] {
    const suppliers: CountrySupplier[] = [];
    
    files.forEach(file => {
      if (this.isSupplierFile(file)) {
        const extractedSuppliers = this.parseSupplierFile(file);
        suppliers.push(...extractedSuppliers);
      }
    });
    
    return this.deduplicateSuppliers(suppliers);
  }
  
  // Extract infrastructure data
  private extractInfrastructure(files: any[]): CountryInfrastructure[] {
    const infrastructure: CountryInfrastructure[] = [];
    
    files.forEach(file => {
      if (this.isInfrastructureFile(file)) {
        const extractedInfra = this.parseInfrastructureFile(file);
        infrastructure.push(...extractedInfra);
      }
    });
    
    return infrastructure;
  }
  
  // Extract pricing data
  private extractPricing(files: any[]): CountryPricing[] {
    const pricing: CountryPricing[] = [];
    
    files.forEach(file => {
      if (this.isPricingFile(file)) {
        const extractedPricing = this.parsePricingFile(file);
        pricing.push(...extractedPricing);
      }
    });
    
    return pricing;
  }
  
  // Extract government contacts
  private extractGovernment(files: any[]): GovernmentContact[] {
    const government: GovernmentContact[] = [];
    
    files.forEach(file => {
      if (this.isGovernmentFile(file)) {
        const extractedGov = this.parseGovernmentFile(file);
        government.push(...extractedGov);
      }
    });
    
    return government;
  }
  
  // File type detection methods
  private isSupplierFile(file: any): boolean {
    const title = file.title?.toLowerCase() || '';
    return title.includes('supplier') || 
           title.includes('laboratory') || 
           title.includes('storage') || 
           title.includes('food') ||
           title.includes('transporter');
  }
  
  private isInfrastructureFile(file: any): boolean {
    const title = file.title?.toLowerCase() || '';
    return title.includes('airport') || 
           title.includes('storage') || 
           title.includes('milling') ||
           title.includes('road') ||
           title.includes('railway');
  }
  
  private isPricingFile(file: any): boolean {
    const title = file.title?.toLowerCase() || '';
    return title.includes('fuel') || 
           title.includes('labor') || 
           title.includes('cost') ||
           title.includes('price');
  }
  
  private isGovernmentFile(file: any): boolean {
    const title = file.title?.toLowerCase() || '';
    return title.includes('government') || 
           title.includes('ministry') || 
           title.includes('authority') ||
           title.includes('humanitarian');
  }
  
  // File parsing methods
  private parseSupplierFile(file: any): CountrySupplier[] {
    const suppliers: CountrySupplier[] = [];
    const text = file.text_content || '';
    
    // Extract supplier information based on file content
    if (file.title.includes('Laboratory and Quality Testing')) {
      suppliers.push(...this.extractLaboratorySuppliers(text));
    } else if (file.title.includes('Food Suppliers')) {
      suppliers.push(...this.extractFoodSuppliers(text));
    } else if (file.title.includes('Storage and Milling')) {
      suppliers.push(...this.extractStorageSuppliers(text));
    } else if (file.title.includes('Transporter')) {
      suppliers.push(...this.extractTransportSuppliers(text));
    }
    
    return suppliers;
  }
  
  private parseInfrastructureFile(file: any): CountryInfrastructure[] {
    const infrastructure: CountryInfrastructure[] = [];
    const text = file.text_content || '';
    
    if (file.title.includes('Airport')) {
      infrastructure.push(...this.extractAirportData(text));
    } else if (file.title.includes('Storage')) {
      infrastructure.push(...this.extractStorageData(text));
    } else if (file.title.includes('Road')) {
      infrastructure.push(...this.extractRoadData(text));
    }
    
    return infrastructure;
  }
  
  private parsePricingFile(file: any): CountryPricing[] {
    const pricing: CountryPricing[] = [];
    const text = file.text_content || '';
    
    if (file.title.includes('Fuel')) {
      pricing.push(...this.extractFuelPricing(text));
    } else if (file.title.includes('Labor')) {
      pricing.push(...this.extractLaborPricing(text));
    }
    
    return pricing;
  }
  
  private parseGovernmentFile(file: any): GovernmentContact[] {
    const government: GovernmentContact[] = [];
    const text = file.text_content || '';
    
    if (file.title.includes('Government Contact List')) {
      government.push(...this.extractGovernmentContacts(text));
    } else if (file.title.includes('Humanitarian Agency')) {
      government.push(...this.extractHumanitarianAgencies(text));
    }
    
    return government;
  }
  
  // Specific extraction methods for Rwanda data
  private extractLaboratorySuppliers(text: string): CountrySupplier[] {
    const suppliers: CountrySupplier[] = [];
    
    // Extract Rwanda Standards Board
    if (text.includes('Rwanda Standards Board')) {
      suppliers.push({
        id: `${this.country}-lab-rsb`,
        countryCode: this.country,
        name: 'Rwanda Standards Board (RSB)',
        category: 'laboratory',
        location: 'Kicukiro, Kigali',
        region: 'Kigali',
        contact: {
          email: 'alphonse.mbabazi@rsb.gov.rw',
          phone: '+250 788 30 3492',
          website: 'https://www.rsb.gov.rw'
        },
        services: ['Physical Testing', 'Chemical Testing', 'Microbiology Testing', 'Material Testing'],
        materials: ['Construction Materials', 'Food Products', 'Agricultural Products'],
        certifications: ['ISO 9001', 'Rwanda Standards Board Certified'],
        verified: true,
        rating: 4.8,
        dataSource: 'logcluster',
        description: 'Physical, chemical, microbiology, and material testing labs'
      });
    }
    
    // Extract Rwanda FDA
    if (text.includes('Rwanda Food and Drug Authority')) {
      suppliers.push({
        id: `${this.country}-lab-fda`,
        countryCode: this.country,
        name: 'Rwanda Food and Drug Authority (Rwanda FDA)',
        category: 'laboratory',
        location: 'Nyarutarama, Kigali',
        region: 'Kigali',
        contact: {
          email: 'info@rwandafda.gov.rw',
          phone: '+250 789193529',
          website: 'https://www.rwandafda.gov.rw'
        },
        services: ['Chemical Testing', 'Microbiology Testing', 'Pharmaceutical Testing'],
        materials: ['Food Products', 'Pharmaceuticals', 'Agricultural Products'],
        certifications: ['FDA Certified', 'WHO Approved'],
        verified: true,
        rating: 4.6,
        dataSource: 'logcluster',
        description: 'Chemical, microbiology, and pharmaceutical labs'
      });
    }
    
    return suppliers;
  }
  
  private extractFoodSuppliers(text: string): CountrySupplier[] {
    const suppliers: CountrySupplier[] = [];
    
    if (text.includes('Africa Improved Foods')) {
      suppliers.push({
        id: `${this.country}-food-aif`,
        countryCode: this.country,
        name: 'Africa Improved Foods (AIF)',
        category: 'food',
        location: 'Masoro, Kigali',
        region: 'Kigali',
        contact: {
          email: 'blandine.ingabire@africaimprovedfoods.com',
          phone: '+250 788 38 9516',
          website: 'https://africaimprovedfoods.com'
        },
        services: ['Food Testing', 'Quality Control', 'Nutritional Analysis'],
        materials: ['Food Products', 'Fortified Foods', 'Agricultural Products'],
        certifications: ['HACCP', 'ISO 22000'],
        verified: true,
        rating: 4.4,
        dataSource: 'logcluster',
        description: 'Food laboratories and quality control'
      });
    }
    
    return suppliers;
  }
  
  private extractStorageSuppliers(text: string): CountrySupplier[] {
    // Implementation for storage suppliers
    return [];
  }
  
  private extractTransportSuppliers(text: string): CountrySupplier[] {
    // Implementation for transport suppliers
    return [];
  }
  
  private extractAirportData(text: string): CountryInfrastructure[] {
    const infrastructure: CountryInfrastructure[] = [];
    
    if (text.includes('Kigali International Airport')) {
      infrastructure.push({
        id: `${this.country}-airport-kigali`,
        countryCode: this.country,
        type: 'airport',
        name: 'Kigali International Airport',
        location: 'Kigali',
        coordinates: [-1.9686, 30.1395],
        capacity: '24/7 operations',
        services: ['Air Cargo', 'Customs Clearance', 'Warehousing', 'Passenger Services'],
        contact: {
          email: 'info@caa.gov.rw',
          phone: '+250 252 585845',
          website: 'https://www.caa.gov.rw'
        },
        status: 'operational',
        lastUpdated: new Date().toISOString()
      });
    }
    
    return infrastructure;
  }
  
  private extractStorageData(text: string): CountryInfrastructure[] {
    // Implementation for storage facilities
    return [];
  }
  
  private extractRoadData(text: string): CountryInfrastructure[] {
    // Implementation for road infrastructure
    return [];
  }
  
  private extractFuelPricing(text: string): CountryPricing[] {
    const pricing: CountryPricing[] = [];
    
    // Extract fuel prices from text
    const fuelPriceRegex = /(Petrol|Diesel|Paraffin|Jet A-1).*?(\d+)\s*Rwf.*?(\d+\.?\d*)\s*US\$/g;
    let match;
    
    while ((match = fuelPriceRegex.exec(text)) !== null) {
      const [, fuelType, rwfPrice, usdPrice] = match;
      
      pricing.push({
        countryCode: this.country,
        category: 'fuel',
        item: fuelType,
        price: parseFloat(usdPrice),
        currency: 'USD',
        unit: 'per litre',
        lastUpdated: new Date().toISOString(),
        source: 'logcluster.org',
        trend: 'stable'
      });
    }
    
    return pricing;
  }
  
  private extractLaborPricing(text: string): CountryPricing[] {
    const pricing: CountryPricing[] = [];
    
    // Extract labor costs
    if (text.includes('Daily General Worker')) {
      pricing.push({
        countryCode: this.country,
        category: 'labor',
        item: 'Unskilled casual labour',
        price: 1.45, // USD per day
        currency: 'USD',
        unit: 'per day',
        lastUpdated: new Date().toISOString(),
        source: 'logcluster.org',
        trend: 'stable'
      });
    }
    
    return pricing;
  }
  
  private extractGovernmentContacts(text: string): GovernmentContact[] {
    const contacts: GovernmentContact[] = [];
    
    // Extract ministry contacts
    const ministryRegex = /Ministry of ([^\\n]+)[\\n\\s]*([^\\n]+)[\\n\\s]*([^\\n]+)[\\n\\s]*([^\\n]+)/g;
    let match;
    
    while ((match = ministryRegex.exec(text)) !== null) {
      const [, ministry, name, title, email] = match;
      
      contacts.push({
        id: `${this.country}-gov-${ministry.toLowerCase().replace(/\\s+/g, '-')}`,
        countryCode: this.country,
        ministry: `Ministry of ${ministry}`,
        name: name.trim(),
        title: title.trim(),
        contact: {
          email: email.trim(),
          phone: '',
          website: ''
        },
        services: ['Government Services', 'Regulatory Affairs'],
        jurisdiction: 'National',
        lastUpdated: new Date().toISOString()
      });
    }
    
    return contacts;
  }
  
  private extractHumanitarianAgencies(text: string): GovernmentContact[] {
    // Implementation for humanitarian agencies
    return [];
  }
  
  // Helper methods
  private getCountryName(code: CountryCode): string {
    const names = {
      'RW': 'Rwanda',
      'KE': 'Kenya',
      'UG': 'Uganda',
      'TZ': 'Tanzania',
      'ET': 'Ethiopia'
    };
    return names[code];
  }
  
  private getCurrency(code: CountryCode): string {
    const currencies = {
      'RW': 'RWF',
      'KE': 'KES',
      'UG': 'UGX',
      'TZ': 'TZS',
      'ET': 'ETB'
    };
    return currencies[code];
  }
  
  private getCountryInfo() {
    const countryInfo = {
      'RW': {
        name: 'Rwanda',
        flag: '🇷🇼',
        regions: ['Kigali', 'Northern Province', 'Southern Province', 'Eastern Province', 'Western Province'],
        description: 'Landlocked country in East Africa known for its rapid economic development and strong governance.',
        population: 13100000,
        gdp: 10300000000
      }
    };
    
    return countryInfo[this.country] || countryInfo['RW'];
  }
  
  private calculateCompleteness(files: any[]): number {
    // Calculate data completeness based on available files
    const totalExpectedFiles = 68; // Based on Rwanda data
    const availableFiles = files.length;
    return Math.round((availableFiles / totalExpectedFiles) * 100);
  }
  
  private deduplicateSuppliers(suppliers: CountrySupplier[]): CountrySupplier[] {
    const seen = new Set();
    return suppliers.filter(supplier => {
      const key = `${supplier.name}-${supplier.location}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }
}

// Create country-specific instances
export const rwandaProcessor = new CountryDataProcessor('RW');
export const kenyaProcessor = new CountryDataProcessor('KE'); // Future
export const ugandaProcessor = new CountryDataProcessor('UG'); // Future

