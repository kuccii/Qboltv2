// Mock data for the Qivook platform

// Price Tracking Data
export const priceData = [
  { date: 'Jan', cement: 320, steel: 850, timber: 420, sand: 180 },
  { date: 'Feb', cement: 350, steel: 880, timber: 410, sand: 190 },
  { date: 'Mar', cement: 360, steel: 920, timber: 430, sand: 195 },
  { date: 'Apr', cement: 340, steel: 900, timber: 450, sand: 200 },
  { date: 'May', cement: 370, steel: 930, timber: 470, sand: 210 },
  { date: 'Jun', cement: 390, steel: 950, timber: 460, sand: 215 },
  { date: 'Jul', cement: 410, steel: 980, timber: 480, sand: 220 },
  { date: 'Aug', cement: 400, steel: 990, timber: 490, sand: 225 }
];

export const agriculturePriceData = [
  { date: 'Jan', fertilizer: 280, seeds: 150, pesticides: 220, equipment: 580 },
  { date: 'Feb', fertilizer: 290, seeds: 155, pesticides: 230, equipment: 590 },
  { date: 'Mar', fertilizer: 300, seeds: 160, pesticides: 225, equipment: 600 },
  { date: 'Apr', fertilizer: 310, seeds: 165, pesticides: 235, equipment: 620 },
  { date: 'May', fertilizer: 315, seeds: 170, pesticides: 240, equipment: 640 },
  { date: 'Jun', fertilizer: 320, seeds: 175, pesticides: 245, equipment: 650 },
  { date: 'Jul', fertilizer: 335, seeds: 180, pesticides: 250, equipment: 680 },
  { date: 'Aug', fertilizer: 350, seeds: 185, pesticides: 260, equipment: 700 }
];

// Price change percentage for dashboard
export const priceChanges = {
  construction: {
    cement: 5.2,
    steel: 2.8,
    timber: -1.5,
    sand: 3.0
  },
  agriculture: {
    fertilizer: 8.2,
    seeds: 3.5,
    pesticides: 4.1,
    equipment: 1.8
  }
};

// Risk-adjusted pricing data
export const riskAdjustedPricing = {
  construction: {
    cement: {
      basePrice: 320,
      riskAdjustment: 15,
      supplierReliability: 8.5,
      marketVolatility: 6.2,
      insuranceCoverage: 85
    },
    steel: {
      basePrice: 850,
      riskAdjustment: 22,
      supplierReliability: 7.8,
      marketVolatility: 8.1,
      insuranceCoverage: 72
    },
    timber: {
      basePrice: 420,
      riskAdjustment: 18,
      supplierReliability: 6.9,
      marketVolatility: 7.5,
      insuranceCoverage: 68
    },
    sand: {
      basePrice: 180,
      riskAdjustment: 8,
      supplierReliability: 9.1,
      marketVolatility: 4.2,
      insuranceCoverage: 92
    }
  },
  agriculture: {
    fertilizer: {
      basePrice: 280,
      riskAdjustment: 12,
      supplierReliability: 8.8,
      marketVolatility: 5.8,
      insuranceCoverage: 88
    },
    seeds: {
      basePrice: 150,
      riskAdjustment: 6,
      supplierReliability: 9.2,
      marketVolatility: 3.1,
      insuranceCoverage: 95
    },
    pesticides: {
      basePrice: 220,
      riskAdjustment: 16,
      supplierReliability: 7.5,
      marketVolatility: 6.9,
      insuranceCoverage: 78
    },
    equipment: {
      basePrice: 580,
      riskAdjustment: 25,
      supplierReliability: 6.8,
      marketVolatility: 9.2,
      insuranceCoverage: 65
    }
  }
};

// Material demand by region
export const demandData = {
  construction: [
    { name: 'Nairobi', coordinates: [-1.2921, 36.8219], demand: 85, color: '#1E3A8A' },
    { name: 'Mombasa', coordinates: [-4.0435, 39.6682], demand: 75, color: '#1E3A8A' },
    { name: 'Kisumu', coordinates: [-0.1022, 34.7617], demand: 60, color: '#1E3A8A' },
    { name: 'Nakuru', coordinates: [-0.3031, 36.0800], demand: 55, color: '#1E3A8A' },
    { name: 'Kampala', coordinates: [0.3476, 32.5825], demand: 70, color: '#1E3A8A' },
    { name: 'Dar es Salaam', coordinates: [-6.7924, 39.2083], demand: 65, color: '#1E3A8A' },
    { name: 'Kigali', coordinates: [-1.9706, 30.1044], demand: 50, color: '#1E3A8A' }
  ],
  agriculture: [
    { name: 'Nairobi', coordinates: [-1.2921, 36.8219], demand: 60, color: '#166534' },
    { name: 'Mombasa', coordinates: [-4.0435, 39.6682], demand: 45, color: '#166534' },
    { name: 'Kisumu', coordinates: [-0.1022, 34.7617], demand: 80, color: '#166534' },
    { name: 'Nakuru', coordinates: [-0.3031, 36.0800], demand: 75, color: '#166534' },
    { name: 'Kampala', coordinates: [0.3476, 32.5825], demand: 85, color: '#166534' },
    { name: 'Dar es Salaam', coordinates: [-6.7924, 39.2083], demand: 50, color: '#166534' },
    { name: 'Kigali', coordinates: [-1.9706, 30.1044], demand: 65, color: '#166534' }
  ]
};

// Industry-specific descriptions
export const industryDescriptions = {
  construction: {
    title: 'Construction Materials Trading',
    subtitle: 'Monitor building material prices and supplier performance',
    metrics: {
      transactions: 'Construction Projects',
      orders: 'Price Points Tracked',
      suppliers: 'Material Suppliers',
      volatility: 'Price Volatility'
    }
  },
  agriculture: {
    title: 'Agricultural Inputs Trading',
    subtitle: 'Track farming inputs and seasonal patterns',
    metrics: {
      transactions: 'Farm Supplies',
      orders: 'Price Points Tracked',
      suppliers: 'Input Suppliers',
      volatility: 'Seasonal Variation'
    }
  }
};

// Supplier data
export const supplierData = [
  {
    id: 1,
    name: 'East Africa Cement Ltd',
    location: 'Nairobi, Kenya',
    industry: 'construction',
    materials: ['cement', 'aggregates'],
    score: 92,
    reliabilityScore: 95,
    qualityScore: 88, 
    deliveryScore: 93,
    lastDelivery: '2023-08-10',
    tier: 'premium',
    verification: {
      status: 'verified' as const,
      documents: 'verified' as const,
      reputation: 'verified' as const,
      transactions: 'verified' as const
    },
    insurance: {
      status: 'active' as const,
      type: 'general' as const,
      coverageAmount: 5000000,
      currency: 'USD',
      expiryDate: new Date('2024-12-31')
    },
    riskScore: 8.5,
    transactionHistory: 156,
    avgDeliveryTime: 3.2
  },
  {
    id: 2,
    name: 'Steel Masters',
    location: 'Mombasa, Kenya',
    industry: 'construction',
    materials: ['steel', 'metal roofing'],
    score: 85,
    reliabilityScore: 90,
    qualityScore: 82,
    deliveryScore: 83,
    lastDelivery: '2023-08-05',
    tier: 'standard',
    verification: {
      status: 'verified' as const,
      documents: 'verified' as const,
      reputation: 'verified' as const,
      transactions: 'pending' as const
    },
    insurance: {
      status: 'active' as const,
      type: 'cargo' as const,
      coverageAmount: 2000000,
      currency: 'USD',
      expiryDate: new Date('2024-06-15')
    },
    riskScore: 7.2,
    transactionHistory: 89,
    avgDeliveryTime: 4.1
  },
  {
    id: 3,
    name: 'Timber Solutions',
    location: 'Kampala, Uganda',
    industry: 'construction',
    materials: ['timber', 'plywood'],
    score: 78,
    reliabilityScore: 75,
    qualityScore: 80,
    deliveryScore: 79,
    lastDelivery: '2023-08-12',
    tier: 'standard',
    verification: {
      status: 'pending' as const,
      documents: 'verified' as const,
      reputation: 'pending' as const,
      transactions: 'pending' as const
    },
    insurance: {
      status: 'inactive' as const,
      type: 'general' as const,
      coverageAmount: 0,
      currency: 'USD'
    },
    riskScore: 6.1,
    transactionHistory: 34,
    avgDeliveryTime: 5.8
  },
  {
    id: 4,
    name: 'KenyaAg Supplies',
    location: 'Nakuru, Kenya',
    industry: 'agriculture',
    materials: ['fertilizer', 'pesticides'],
    score: 90,
    reliabilityScore: 92,
    qualityScore: 88,
    deliveryScore: 90,
    lastDelivery: '2023-08-08',
    tier: 'premium',
    verification: {
      status: 'verified' as const,
      documents: 'verified' as const,
      reputation: 'verified' as const,
      transactions: 'verified' as const
    },
    insurance: {
      status: 'active' as const,
      type: 'general' as const,
      coverageAmount: 3000000,
      currency: 'USD',
      expiryDate: new Date('2024-09-30')
    },
    riskScore: 8.8,
    transactionHistory: 124,
    avgDeliveryTime: 2.8
  },
  {
    id: 5,
    name: 'Green Seeds Ltd',
    location: 'Kigali, Rwanda',
    industry: 'agriculture',
    materials: ['seeds', 'organic fertilizer'],
    score: 87,
    reliabilityScore: 85,
    qualityScore: 90,
    deliveryScore: 86,
    lastDelivery: '2023-08-15',
    tier: 'standard',
    verification: {
      status: 'verified' as const,
      documents: 'verified' as const,
      reputation: 'verified' as const,
      transactions: 'verified' as const
    },
    insurance: {
      status: 'active' as const,
      type: 'cargo' as const,
      coverageAmount: 1500000,
      currency: 'USD',
      expiryDate: new Date('2024-08-20')
    },
    riskScore: 7.8,
    transactionHistory: 67,
    avgDeliveryTime: 3.5
  },
  {
    id: 6,
    name: 'AgriTech Solutions',
    location: 'Dar es Salaam, Tanzania',
    industry: 'agriculture',
    materials: ['equipment', 'irrigation'],
    score: 68,
    reliabilityScore: 65,
    qualityScore: 70,
    deliveryScore: 69,
    lastDelivery: '2023-08-02',
    tier: 'standard',
    verification: {
      status: 'rejected' as const,
      documents: 'rejected' as const,
      reputation: 'pending' as const,
      transactions: 'pending' as const
    },
    insurance: {
      status: 'expired' as const,
      type: 'general' as const,
      coverageAmount: 0,
      currency: 'USD',
      expiryDate: new Date('2023-06-30')
    },
    riskScore: 4.2,
    transactionHistory: 12,
    avgDeliveryTime: 7.3
  },
  {
    id: 7,
    name: 'BuildRight Materials',
    location: 'Kisumu, Kenya',
    industry: 'construction',
    materials: ['cement', 'sand', 'aggregates'],
    score: 65,
    reliabilityScore: 60,
    qualityScore: 70,
    deliveryScore: 65,
    lastDelivery: '2023-08-14',
    tier: 'standard'
  },
  {
    id: 8,
    name: 'Farm Supply Co',
    location: 'Arusha, Tanzania',
    industry: 'agriculture',
    materials: ['fertilizer', 'seeds', 'equipment'],
    score: 75,
    reliabilityScore: 78,
    qualityScore: 72,
    deliveryScore: 75,
    lastDelivery: '2023-08-09',
    tier: 'standard'
  }
];

// Financing offers
export const financingOffers = [
  {
    id: 1,
    title: 'Working Capital Loan',
    provider: 'East African Bank',
    amount: 25000,
    term: '12 months',
    interestRate: '12.5%',
    eligibilityScore: 85,
    industry: 'both',
    description: 'Short-term financing to bridge cash flow gaps and handle operational expenses.'
  },
  {
    id: 2,
    title: 'Construction Material Credit',
    provider: 'Qivook Financial Services',
    amount: 15000,
    term: '6 months',
    interestRate: '10.0%',
    eligibilityScore: 75,
    industry: 'construction',
    description: 'Credit facility for purchasing construction materials from approved suppliers.'
  },
  {
    id: 3,
    title: 'Trade Finance Facility',
    provider: 'Pan-African Credit',
    amount: 50000,
    term: '18 months',
    interestRate: '13.5%',
    eligibilityScore: 90,
    industry: 'both',
    description: 'Comprehensive trade finance solution for importers and exporters.'
  },
  {
    id: 4,
    title: 'Seasonal Farming Loan',
    provider: 'AgriFinance',
    amount: 10000,
    term: '9 months',
    interestRate: '9.5%',
    eligibilityScore: 70,
    industry: 'agriculture',
    description: 'Financing aligned with farming cycles, with repayment after harvest.'
  },
  {
    id: 5,
    title: 'Equipment Financing',
    provider: 'Capital Leasing Co',
    amount: 35000,
    term: '24 months',
    interestRate: '14.0%',
    eligibilityScore: 80,
    industry: 'both',
    description: 'Leasing and purchase financing for equipment and machinery.'
  }
];

// Dashboard summary metrics
export const dashboardMetrics = {
  construction: {
    totalTransactions: 1245,
    averageOrderValue: 8500,
    activeSuppliersCount: 87,
    materialShortages: [
      { material: 'Cement', severity: 'high', region: 'Western Kenya' },
      { material: 'Steel Rebar', severity: 'medium', region: 'Central Uganda' }
    ],
    priceVolatility: 12.3,
    industryIcon: '🏗️',
    unitLabels: {
      cement: 'per ton',
      steel: 'per ton',
      timber: 'per cubic meter',
      sand: 'per cubic meter'
    }
  },
  agriculture: {
    totalTransactions: 982,
    averageOrderValue: 5200,
    activeSuppliersCount: 65,
    materialShortages: [
      { material: 'NPK Fertilizer', severity: 'medium', region: 'Northern Tanzania' },
      { material: 'Pesticides', severity: 'low', region: 'Eastern Rwanda' }
    ],
    priceVolatility: 8.5,
    industryIcon: '🌾',
    unitLabels: {
      fertilizer: 'per 50kg bag',
      seeds: 'per kg',
      pesticides: 'per liter',
      equipment: 'per day'
    }
  }
};

// Recent activity data for dashboard
export const recentActivity = [
  {
    type: 'price_update',
    message: 'Cement prices increased by 5.2% in Nairobi region',
    time: '2 hours ago'
  },
  {
    type: 'supplier_added',
    message: 'New supplier "Steel Masters" added to directory',
    time: '4 hours ago'
  },
  {
    type: 'alert',
    message: 'Supply disruption alert for steel delivery in Mombasa',
    time: '6 hours ago'
  },
  {
    type: 'price_update',
    message: 'Timber prices decreased by 2.1% across Uganda',
    time: '8 hours ago'
  },
  {
    type: 'supplier_added',
    message: 'Quality verification completed for 3 suppliers',
    time: '1 day ago'
  },
  {
    type: 'alert',
    message: 'High volatility detected in fertilizer prices',
    time: '1 day ago'
  },
  {
    type: 'price_update',
    message: 'Sand prices stable in Rwanda region',
    time: '2 days ago'
  },
  {
    type: 'supplier_added',
    message: 'New premium supplier "Green Seeds Ltd" verified',
    time: '3 days ago'
  }
];

export interface LogisticsItem {
  id: string;
  industry: 'construction' | 'agriculture';
  route: string;
  region: string;
  status: 'normal' | 'delayed' | 'high-risk';
  description: string;
  estimatedTime: string;
  transportType: string;
  alerts?: string[];
  upcomingEvents?: {
    title: string;
    date: string;
  }[];
}

export interface Supplier {
  id: string;
  name: string;
  industry: 'construction' | 'agriculture';
  location: string;
  region: string;
  materials: string[];
  rating: number;
  deliveryTime: string;
  reliability: number;
  phone: string;
  email: string;
}

export const logisticsData: LogisticsItem[] = [
  {
    id: '1',
    industry: 'construction',
    route: 'Nairobi to Mombasa',
    region: 'Kenya',
    status: 'normal',
    description: 'Main highway route for construction materials',
    estimatedTime: '8-10 hours',
    transportType: 'Truck',
    alerts: ['Heavy traffic expected during peak hours'],
    upcomingEvents: [
      {
        title: 'Road maintenance',
        date: '2024-03-15'
      }
    ]
  },
  {
    id: '2',
    industry: 'agriculture',
    route: 'Kampala to Jinja',
    region: 'Uganda',
    status: 'delayed',
    description: 'Agricultural produce transport route',
    estimatedTime: '2-3 hours',
    transportType: 'Van',
    alerts: ['Road construction in progress', 'Alternative routes available']
  }
];

// Helper function to convert CountrySupplier to Supplier format
function convertToSupplierFormat(countrySuppliers: any[]): Supplier[] {
  return countrySuppliers.map(cs => ({
    id: cs.id,
    name: cs.name,
    industry: mapCategoryToIndustry(cs.category),
    location: `${cs.location}, ${cs.countryCode}`,
    region: cs.region,
    materials: cs.materials,
    rating: cs.rating || 4.0,
    deliveryTime: estimateDeliveryTime(cs.countryCode),
    reliability: cs.verified ? 95 : 85,
    phone: cs.contact.phone,
    email: cs.contact.email,
  }));
}

function mapCategoryToIndustry(category: string): 'construction' | 'agriculture' {
  const constructionCategories = ['laboratory', 'storage', 'construction'];
  return constructionCategories.includes(category) ? 'construction' : 'agriculture';
}

function estimateDeliveryTime(countryCode: string): string {
  const deliveryTimes = {
    'RW': '48-72 hours',
    'KE': '24-48 hours',
    'UG': '48-72 hours',
    'TZ': '72-96 hours',
    'ET': '96-120 hours'
  };
  return deliveryTimes[countryCode] || '48-72 hours';
}

// Rwanda suppliers from logcluster.org data
const rwandaSuppliers = [
  {
    id: 'rw-lab-rsb',
    name: 'Rwanda Standards Board (RSB)',
    category: 'laboratory',
    location: 'Kicukiro, Kigali',
    region: 'Rwanda',
    countryCode: 'RW',
    contact: {
      email: 'alphonse.mbabazi@rsb.gov.rw',
      phone: '+250 788 30 3492',
      website: 'https://www.rsb.gov.rw'
    },
    services: ['Physical Testing', 'Chemical Testing', 'Microbiology Testing', 'Material Testing'],
    materials: ['Construction Materials', 'Food Products', 'Agricultural Products'],
    verified: true,
    rating: 4.8
  },
  {
    id: 'rw-lab-fda',
    name: 'Rwanda Food and Drug Authority (Rwanda FDA)',
    category: 'laboratory',
    location: 'Nyarutarama, Kigali',
    region: 'Rwanda',
    countryCode: 'RW',
    contact: {
      email: 'info@rwandafda.gov.rw',
      phone: '+250 789193529',
      website: 'https://www.rwandafda.gov.rw'
    },
    services: ['Chemical Testing', 'Microbiology Testing', 'Pharmaceutical Testing'],
    materials: ['Food Products', 'Pharmaceuticals', 'Agricultural Products'],
    verified: true,
    rating: 4.6
  },
  {
    id: 'rw-food-aif',
    name: 'Africa Improved Foods (AIF)',
    category: 'food',
    location: 'Masoro, Kigali',
    region: 'Rwanda',
    countryCode: 'RW',
    contact: {
      email: 'blandine.ingabire@africaimprovedfoods.com',
      phone: '+250 788 38 9516',
      website: 'https://africaimprovedfoods.com'
    },
    services: ['Food Testing', 'Quality Control', 'Nutritional Analysis'],
    materials: ['Food Products', 'Fortified Foods', 'Agricultural Products'],
    verified: true,
    rating: 4.4
  },
  {
    id: 'rw-agri-naeb',
    name: 'National Agriculture Export Development Board (NAEB)',
    category: 'agriculture',
    location: 'Kigali/Kicukiro',
    region: 'Rwanda',
    countryCode: 'RW',
    contact: {
      email: 'info@naeb.gov.rw',
      phone: '+250 2525 75600',
      website: 'https://naeb.gov.rw'
    },
    services: ['Agricultural Testing', 'Export Quality Control', 'Crop Analysis'],
    materials: ['Agricultural Products', 'Export Crops', 'Seeds'],
    verified: true,
    rating: 4.5
  }
];

export const supplierDirectoryData: Supplier[] = [
  // Existing suppliers
  {
    id: '1',
    name: 'BuildTech Supplies',
    industry: 'construction',
    location: 'Nairobi, Kenya',
    region: 'Kenya',
    materials: ['cement', 'steel', 'timber'],
    rating: 4.5,
    deliveryTime: '24-48 hours',
    reliability: 95,
    phone: '+254 700 123 456',
    email: 'contact@buildtech.com'
  },
  {
    id: '2',
    name: 'AgriPro Solutions',
    industry: 'agriculture',
    location: 'Kampala, Uganda',
    region: 'Uganda',
    materials: ['fertilizer', 'seeds', 'pesticides'],
    rating: 4.2,
    deliveryTime: '48-72 hours',
    reliability: 90,
    phone: '+256 700 789 012',
    email: 'info@agripro.com'
  },
  
  // Rwanda suppliers (converted from CountrySupplier format)
  ...convertToSupplierFormat(rwandaSuppliers)
];

// Trade Opportunities Data
export const tradeOpportunities = {
  construction: [
    {
      id: 1,
      title: 'Nairobi Infrastructure Project',
      description: 'Large-scale road construction requiring cement, steel, and aggregates',
      value: 2500000,
      currency: 'USD',
      location: 'Nairobi, Kenya',
      deadline: new Date('2024-03-15'),
      riskLevel: 'low' as const,
      insuranceRequired: true,
      materials: ['cement', 'steel', 'aggregates'],
      status: 'active' as const,
      postedDate: new Date('2024-01-15'),
      buyer: 'Kenya National Highways Authority'
    },
    {
      id: 2,
      title: 'Mombasa Port Expansion',
      description: 'Port infrastructure development with steel structures and concrete',
      value: 1800000,
      currency: 'USD',
      location: 'Mombasa, Kenya',
      deadline: new Date('2024-04-30'),
      riskLevel: 'medium' as const,
      insuranceRequired: true,
      materials: ['steel', 'cement', 'timber'],
      status: 'active' as const,
      postedDate: new Date('2024-01-20'),
      buyer: 'Kenya Ports Authority'
    },
    {
      id: 3,
      title: 'Kampala Housing Development',
      description: 'Residential construction project requiring various building materials',
      value: 1200000,
      currency: 'USD',
      location: 'Kampala, Uganda',
      deadline: new Date('2024-05-15'),
      riskLevel: 'low' as const,
      insuranceRequired: false,
      materials: ['cement', 'timber', 'sand'],
      status: 'active' as const,
      postedDate: new Date('2024-01-25'),
      buyer: 'Uganda Housing Corporation'
    }
  ],
  agriculture: [
    {
      id: 4,
      title: 'Rwanda Fertilizer Distribution',
      description: 'Large-scale fertilizer supply for upcoming planting season',
      value: 800000,
      currency: 'USD',
      location: 'Kigali, Rwanda',
      deadline: new Date('2024-03-01'),
      riskLevel: 'low' as const,
      insuranceRequired: true,
      materials: ['fertilizer', 'seeds'],
      status: 'active' as const,
      postedDate: new Date('2024-01-10'),
      buyer: 'Rwanda Agriculture Board'
    },
    {
      id: 5,
      title: 'Tanzania Irrigation Equipment',
      description: 'Modern irrigation systems for commercial farming operations',
      value: 650000,
      currency: 'USD',
      location: 'Dar es Salaam, Tanzania',
      deadline: new Date('2024-04-15'),
      riskLevel: 'medium' as const,
      insuranceRequired: true,
      materials: ['equipment', 'irrigation'],
      status: 'active' as const,
      postedDate: new Date('2024-01-18'),
      buyer: 'Tanzania Agricultural Development Bank'
    },
    {
      id: 6,
      title: 'Kenya Seed Supply Program',
      description: 'High-quality seeds for smallholder farmers across Kenya',
      value: 450000,
      currency: 'USD',
      location: 'Nakuru, Kenya',
      deadline: new Date('2024-02-28'),
      riskLevel: 'low' as const,
      insuranceRequired: false,
      materials: ['seeds', 'pesticides'],
      status: 'active' as const,
      postedDate: new Date('2024-01-22'),
      buyer: 'Kenya Seed Company'
    }
  ]
};