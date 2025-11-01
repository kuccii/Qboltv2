import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type Industry = 'construction' | 'agriculture';

interface IndustryTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

interface IndustryConfig {
  name: string;
  displayName: string;
  description: string;
  icon: string;
  theme: IndustryTheme;
  materials: string[];
  metrics: {
    [key: string]: string;
  };
  features: string[];
  terminology: {
    [key: string]: string;
  };
}

const industryConfigs: Record<Industry, IndustryConfig> = {
  construction: {
    name: 'construction',
    displayName: 'Construction',
    description: 'Building materials, supplier networks, and project management',
    icon: 'Building2',
    theme: {
      primary: '#1E3A8A',
      secondary: '#374151',
      accent: '#F59E0B',
      background: '#F8FAFC',
      surface: '#FFFFFF',
      text: '#1F2937',
      textSecondary: '#6B7280',
      border: '#E5E7EB',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6'
    },
    materials: ['cement', 'steel', 'timber', 'sand', 'aggregates', 'tools', 'equipment'],
    metrics: {
      transactions: 'Construction Projects',
      orders: 'Material Orders',
      suppliers: 'Material Suppliers',
      volatility: 'Price Volatility',
      projects: 'Active Projects',
      completion: 'Project Completion Rate'
    },
    features: [
      'Project Management Integration',
      'Material Cost Tracking',
      'Supplier Performance Analysis',
      'Construction Timeline & Milestones',
      'Safety & Compliance Alerts',
      'Equipment Rental Tracking',
      'Project Profitability Analysis'
    ],
    terminology: {
      materials: 'Building Materials',
      suppliers: 'Material Suppliers',
      projects: 'Construction Projects',
      orders: 'Material Orders',
      pricing: 'Material Pricing',
      logistics: 'Material Logistics'
    }
  },
  agriculture: {
    name: 'agriculture',
    displayName: 'Agriculture',
    description: 'Farming inputs, seasonal patterns, and agricultural solutions',
    icon: 'Wheat',
    theme: {
      primary: '#166534',
      secondary: '#B45309',
      accent: '#F59E0B',
      background: '#F0FDF4',
      surface: '#FFFFFF',
      text: '#1F2937',
      textSecondary: '#6B7280',
      border: '#D1FAE5',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6'
    },
    materials: ['fertilizer', 'seeds', 'pesticides', 'equipment', 'irrigation', 'livestock', 'crops'],
    metrics: {
      transactions: 'Farm Supplies',
      orders: 'Input Orders',
      suppliers: 'Input Suppliers',
      volatility: 'Seasonal Variation',
      farms: 'Active Farms',
      yield: 'Yield per Hectare'
    },
    features: [
      'Seasonal Planning & Calendar',
      'Crop-Specific Input Tracking',
      'Weather Integration',
      'Harvest Planning',
      'Farm Equipment Management',
      'Soil & Fertilizer Analysis',
      'Market Price Forecasting'
    ],
    terminology: {
      materials: 'Agricultural Inputs',
      suppliers: 'Input Suppliers',
      projects: 'Farming Operations',
      orders: 'Input Orders',
      pricing: 'Input Pricing',
      logistics: 'Farm Logistics'
    }
  }
};

interface IndustryContextType {
  currentIndustry: Industry;
  industryConfig: IndustryConfig;
  setIndustry: (industry: Industry) => void;
  switchIndustry: (industry: Industry) => Promise<void>;
  isIndustrySelected: boolean;
  getIndustryTerm: (key: string) => string;
  getIndustryMaterial: (material: string) => string;
}

const IndustryContext = createContext<IndustryContextType | undefined>(undefined);

export const useIndustry = () => {
  const context = useContext(IndustryContext);
  if (context === undefined) {
    throw new Error('useIndustry must be used within an IndustryProvider');
  }
  return context;
};

interface IndustryProviderProps {
  children: React.ReactNode;
}

export const IndustryProvider: React.FC<IndustryProviderProps> = ({ children }) => {
  const [currentIndustry, setCurrentIndustry] = useState<Industry>('construction');
  const [isIndustrySelected, setIsIndustrySelected] = useState(false);

  // Load industry from localStorage on mount
  useEffect(() => {
    const savedIndustry = localStorage.getItem('qivook.industry') as Industry;
    if (savedIndustry && industryConfigs[savedIndustry]) {
      setCurrentIndustry(savedIndustry);
      setIsIndustrySelected(true);
    }
  }, []);

  const industryConfig = industryConfigs[currentIndustry];

  const setIndustry = useCallback((industry: Industry) => {
    setCurrentIndustry(industry);
    setIsIndustrySelected(true);
    localStorage.setItem('qivook.industry', industry);
    
    // Apply industry theme to document
    const config = industryConfigs[industry];
    const root = document.documentElement;
    root.style.setProperty('--industry-primary', config.theme.primary);
    root.style.setProperty('--industry-secondary', config.theme.secondary);
    root.style.setProperty('--industry-accent', config.theme.accent);
    root.style.setProperty('--industry-background', config.theme.background);
    root.style.setProperty('--industry-surface', config.theme.surface);
  }, []);

  const switchIndustry = useCallback(async (industry: Industry) => {
    // Save current state before switching
    const currentState = {
      selectedTab: localStorage.getItem('qivook.dashboard.tab'),
      selectedCountries: localStorage.getItem('qivook.dashboard.countries'),
      selectedMaterials: localStorage.getItem('qivook.prices.materials'),
      selectedRegion: localStorage.getItem('qivook.prices.region')
    };

    // Switch industry
    setIndustry(industry);

    // Clear industry-specific state
    localStorage.removeItem('qivook.dashboard.tab');
    localStorage.removeItem('qivook.dashboard.countries');
    localStorage.removeItem('qivook.prices.materials');
    localStorage.removeItem('qivook.prices.region');

    // Show success message
    console.log(`Switched to ${industryConfigs[industry].displayName} industry`);
  }, [setIndustry]);

  const getIndustryTerm = useCallback((key: string) => {
    return industryConfig.terminology[key] || key;
  }, [industryConfig]);

  const getIndustryMaterial = useCallback((material: string) => {
    const materialMap: Record<string, Record<Industry, string>> = {
      cement: { construction: 'Cement', agriculture: 'Fertilizer' },
      steel: { construction: 'Steel', agriculture: 'Seeds' },
      timber: { construction: 'Timber', agriculture: 'Pesticides' },
      sand: { construction: 'Sand', agriculture: 'Equipment' },
      aggregates: { construction: 'Aggregates', agriculture: 'Irrigation' },
      tools: { construction: 'Tools', agriculture: 'Livestock' },
      equipment: { construction: 'Equipment', agriculture: 'Crops' }
    };
    
    return materialMap[material]?.[currentIndustry] || material;
  }, [currentIndustry]);

  const value = {
    currentIndustry,
    industryConfig,
    setIndustry,
    switchIndustry,
    isIndustrySelected,
    getIndustryTerm,
    getIndustryMaterial
  };

  return (
    <IndustryContext.Provider value={value}>
      {children}
    </IndustryContext.Provider>
  );
};
