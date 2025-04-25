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
      orders: 'Material Orders',
      suppliers: 'Material Suppliers',
      volatility: 'Price Volatility'
    }
  },
  agriculture: {
    title: 'Agricultural Inputs Trading',
    subtitle: 'Track farming inputs and seasonal patterns',
    metrics: {
      transactions: 'Farm Supplies',
      orders: 'Input Orders',
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
    tier: 'premium'
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
    tier: 'standard'
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
    tier: 'standard'
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
    tier: 'premium'
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
    tier: 'standard'
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
    tier: 'standard'
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

export const supplierDirectoryData: Supplier[] = [
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
  }
];