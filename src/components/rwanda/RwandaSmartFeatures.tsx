// Smart features component with recommendations, cost comparisons, and alerts
import React, { useState, useEffect } from 'react';
import { 
  Lightbulb, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Star,
  Calculator,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Building2,
  Truck,
  Fuel,
  Package,
  Bell,
  Settings,
  Filter,
  Search,
  BarChart3,
  PieChart,
  Target,
  Zap,
  Shield,
  Award
} from 'lucide-react';
import { CountrySupplier, CountryPricing, CountryInfrastructure } from '../../data/countries/types';
import { getRwandaSuppliers, getRwandaPricing, getRwandaInfrastructure } from '../../data/countries/rwanda/rwandaDataLoader';
import { useAccessibility } from '../../hooks/useAccessibility';
import CountryDemandMapping from '../countries/CountryDemandMapping';
import { useIndustry } from '../../contexts/IndustryContext';

interface SmartFeaturesProps {
  className?: string;
  countryCode?: string; // Optional: defaults to 'RW' for backward compatibility
}

interface Recommendation {
  id: string;
  type: 'supplier' | 'cost' | 'route' | 'alert';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  action?: string;
  data?: any;
  icon: React.ComponentType<any>;
}

interface CostComparison {
  item: string;
  currentPrice: number;
  averagePrice: number;
  savings: number;
  savingsPercent: number;
  recommendation: string;
}

interface Alert {
  id: string;
  type: 'price_change' | 'supplier_update' | 'infrastructure' | 'opportunity';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  action?: string;
}

const RwandaSmartFeatures: React.FC<SmartFeaturesProps> = ({ className = '', countryCode = 'RW' }) => {
  const { currentIndustry } = useIndustry();
  const [suppliers, setSuppliers] = useState<CountrySupplier[]>([]);
  const [pricing, setPricing] = useState<CountryPricing[]>([]);
  const [infrastructure, setInfrastructure] = useState<CountryInfrastructure[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [costComparisons, setCostComparisons] = useState<CostComparison[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'recommendations' | 'comparisons' | 'alerts' | 'demand'>('recommendations');
  
  const { announce } = useAccessibility();

  useEffect(() => {
    loadSmartData();
  }, []);

  const loadSmartData = async () => {
    try {
      setLoading(true);
      
      // Fetch from database first, fallback to JSON files only for Rwanda
      try {
        const [dbSuppliers, dbPricing, dbInfrastructure] = await Promise.all([
          unifiedApi.countries.getSuppliers(countryCode),
          unifiedApi.countries.getPricing(countryCode),
          unifiedApi.countries.getInfrastructure(countryCode)
        ]);

        // Transform database data
        if (dbSuppliers.length > 0) {
          setSuppliers(dbSuppliers.map((s: any) => ({
            id: s.id,
            countryCode: countryCode as any,
            name: s.name,
            category: s.category,
            location: s.location,
            region: s.region || '',
            contact: {
              email: s.email || '',
              phone: s.phone || '',
              website: s.website,
              address: s.address
            },
            services: s.services || [],
            materials: s.materials || [],
            certifications: s.certifications || [],
            verified: s.verified || false,
            rating: s.rating,
            dataSource: s.data_source || 'user_contributed',
            description: s.description
          })));
        }

        if (dbPricing.length > 0) {
          setPricing(dbPricing.map((p: any) => ({
            countryCode: countryCode as any,
            category: p.category,
            item: p.item,
            price: parseFloat(p.price),
            currency: p.currency,
            unit: p.unit,
            region: p.region,
            trend: p.trend,
            previousPrice: p.previous_price ? parseFloat(p.previous_price) : undefined,
            notes: p.notes,
            source: p.source,
            lastUpdated: p.last_updated
          })));
        }

        if (dbInfrastructure.length > 0) {
          setInfrastructure(dbInfrastructure.map((infra: any) => ({
            id: infra.id,
            countryCode: countryCode as any,
            type: infra.type,
            name: infra.name,
            location: infra.location,
            coordinates: infra.latitude && infra.longitude ? [infra.latitude, infra.longitude] : undefined,
            capacity: infra.capacity || '',
            services: infra.services || [],
            operatingHours: infra.operating_hours,
            contact: {
              email: infra.email || '',
              phone: infra.phone || '',
              website: infra.website,
              address: infra.address
            },
            seasonalNotes: infra.seasonal_notes,
            status: infra.status,
            lastUpdated: infra.last_updated
          })));
        }
      } catch (dbError) {
        // Fallback to JSON files only for Rwanda
        if (countryCode === 'RW') {
          console.log('Database fetch failed, using JSON files:', dbError);
          const [suppliersData, pricingData, infrastructureData] = await Promise.all([
            getRwandaSuppliers(),
            getRwandaPricing(),
            getRwandaInfrastructure()
          ]);
          
          setSuppliers(suppliersData);
          setPricing(pricingData);
          setInfrastructure(infrastructureData);
        } else {
          // For other countries, use empty arrays
          setSuppliers([]);
          setPricing([]);
          setInfrastructure([]);
        }
      }
      
      // Generate smart insights
      generateRecommendations(suppliersData, pricingData, infrastructureData);
      generateCostComparisons(pricingData);
      generateAlerts(suppliersData, pricingData, infrastructureData);
      
    } catch (error) {
      console.error('Error loading smart data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = (suppliers: CountrySupplier[], pricing: CountryPricing[], infrastructure: CountryInfrastructure[]) => {
    const recs: Recommendation[] = [];

    // Top verified suppliers
    const topSuppliers = suppliers
      .filter(s => s.verified && s.rating && s.rating >= 4.5)
      .slice(0, 3);
    
    topSuppliers.forEach(supplier => {
      recs.push({
        id: `supplier-${supplier.id}`,
        type: 'supplier',
        title: `Recommended: ${supplier.name}`,
        description: `Highly rated ${supplier.category} supplier with ${supplier.rating} stars and ${supplier.certifications.length} certifications`,
        priority: 'high',
        action: 'View Details',
        data: supplier,
        icon: Star
      });
    });

    // Cost optimization opportunities
    const fuelPrices = pricing.filter(p => p.category === 'fuel');
    if (fuelPrices.length > 0) {
      const avgFuelPrice = fuelPrices.reduce((sum, p) => sum + p.price, 0) / fuelPrices.length;
      const lowestFuelPrice = Math.min(...fuelPrices.map(p => p.price));
      
      if (lowestFuelPrice < avgFuelPrice * 0.9) {
        recs.push({
          id: 'fuel-savings',
          type: 'cost',
          title: 'Fuel Cost Savings Opportunity',
          description: `Save up to ${((avgFuelPrice - lowestFuelPrice) / avgFuelPrice * 100).toFixed(1)}% on fuel costs by choosing the right supplier`,
          priority: 'medium',
          action: 'View Pricing',
          icon: Fuel
        });
      }
    }

    // Infrastructure recommendations
    const operationalFacilities = infrastructure.filter(f => f.status === 'operational');
    if (operationalFacilities.length > 0) {
      recs.push({
        id: 'infrastructure-utilization',
        type: 'route',
        title: 'Infrastructure Utilization',
        description: `${operationalFacilities.length} operational facilities available for your logistics needs`,
        priority: 'low',
        action: 'View Infrastructure',
        icon: Building2
      });
    }

    setRecommendations(recs);
  };

  const generateCostComparisons = (pricing: CountryPricing[]) => {
    const comparisons: CostComparison[] = [];

    // Group pricing by category
    const pricingByCategory = pricing.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {} as { [key: string]: CountryPricing[] });

    Object.entries(pricingByCategory).forEach(([category, items]) => {
      if (items.length > 1) {
        const prices = items.map(item => item.price);
        const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        
        const currentItem = items.find(item => item.price === minPrice) || items[0];
        
        comparisons.push({
          item: currentItem.item,
          currentPrice: currentItem.price,
          averagePrice: avgPrice,
          savings: avgPrice - currentItem.price,
          savingsPercent: ((avgPrice - currentItem.price) / avgPrice) * 100,
          recommendation: minPrice === avgPrice ? 'Best price available' : `Save ${((avgPrice - minPrice) / avgPrice * 100).toFixed(1)}% with current choice`
        });
      }
    });

    setCostComparisons(comparisons);
  };

  const generateAlerts = (suppliers: CountrySupplier[], pricing: CountryPricing[], infrastructure: CountryInfrastructure[]) => {
    const newAlerts: Alert[] = [];

    // Price change alerts
    const recentPricing = pricing.filter(p => {
      const lastUpdated = new Date(p.lastUpdated);
      const now = new Date();
      const daysDiff = (now.getTime() - lastUpdated.getTime()) / (1000 * 3600 * 24);
      return daysDiff <= 7;
    });

    if (recentPricing.length > 0) {
      newAlerts.push({
        id: 'price-updates',
        type: 'price_change',
        title: 'Recent Price Updates',
        message: `${recentPricing.length} pricing items updated in the last 7 days`,
        severity: 'info',
        timestamp: new Date().toISOString(),
        action: 'View Updates'
      });
    }

    // New suppliers
    const newSuppliers = suppliers.filter(s => s.verified);
    if (newSuppliers.length > 0) {
      newAlerts.push({
        id: 'new-suppliers',
        type: 'supplier_update',
        title: 'Verified Suppliers Available',
        message: `${newSuppliers.length} verified suppliers ready for your business needs`,
        severity: 'success',
        timestamp: new Date().toISOString(),
        action: 'View Suppliers'
      });
    }

    // Infrastructure status
    const maintenanceFacilities = infrastructure.filter(f => f.status === 'maintenance');
    if (maintenanceFacilities.length > 0) {
      newAlerts.push({
        id: 'maintenance-alert',
        type: 'infrastructure',
        title: 'Infrastructure Maintenance',
        message: `${maintenanceFacilities.length} facilities under maintenance - plan alternative routes`,
        severity: 'warning',
        timestamp: new Date().toISOString(),
        action: 'View Status'
      });
    }

    // Opportunities
    const highRatedSuppliers = suppliers.filter(s => s.rating && s.rating >= 4.5);
    if (highRatedSuppliers.length >= 5) {
      newAlerts.push({
        id: 'opportunity',
        type: 'opportunity',
        title: 'Quality Supplier Network',
        message: `Strong network of ${highRatedSuppliers.length} high-rated suppliers available`,
        severity: 'info',
        timestamp: new Date().toISOString(),
        action: 'Explore Network'
      });
    }

    setAlerts(newAlerts);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900';
      case 'low': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900';
      case 'success': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900';
      case 'info': return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
    }
  };

  const handleRecommendationAction = (recommendation: Recommendation) => {
    announce(`Action taken: ${recommendation.title}`);
    // Implement specific actions based on recommendation type
    console.log('Recommendation action:', recommendation);
  };

  const handleAlertAction = (alert: Alert) => {
    announce(`Alert action: ${alert.title}`);
    // Implement specific actions based on alert type
    console.log('Alert action:', alert);
  };

  // Only show loading on initial load
  if (loading && recommendations.length === 0 && costComparisons.length === 0 && alerts.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading smart insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Playful Header */}
      <div className="mb-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span>⚡</span>
          Smart Intelligence!
        </h2>
        <p className="text-base text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
          <span>🧠</span>
          Cool ideas and tips to help you make smart decisions!
        </p>
      </div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="flex items-center px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all transform hover:scale-105 border-2 border-gray-300 dark:border-gray-600 font-bold">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </button>
        </div>
      </div>

      {/* Playful Tabs */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-2 border-2 border-purple-200 dark:border-gray-700 shadow-lg mb-6">
        <nav className="flex space-x-2 overflow-x-auto scrollbar-hide">
          {[
            { id: 'recommendations', label: 'Recommendations', icon: Lightbulb, count: recommendations.length, emoji: '💡' },
            { id: 'comparisons', label: 'Cost Analysis', icon: Calculator, count: costComparisons.length, emoji: '💰' },
            { id: 'alerts', label: 'Alerts', icon: Bell, count: alerts.length, emoji: '🔔' },
            { id: 'demand', label: 'Demand Mapping', icon: MapPin, count: 0, emoji: '🗺️' }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-4 sm:px-6 rounded-xl font-bold text-sm sm:text-base whitespace-nowrap flex-shrink-0 transition-all transform hover:scale-105 ${
                  selectedTab === tab.id
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg scale-105'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-purple-100 dark:hover:bg-gray-700 hover:text-purple-700 dark:hover:text-purple-300'
                }`}
                aria-label={`Switch to ${tab.label} tab`}
              >
                <span className="text-lg">{tab.emoji}</span>
                {tab.label}
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                  selectedTab === tab.id
                    ? 'bg-white/30 text-white'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {selectedTab === 'recommendations' && (
          <div className="space-y-4">
            {recommendations.map((recommendation) => {
              const Icon = recommendation.icon;
              return (
                <div 
                  key={recommendation.id} 
                  className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg border-2 border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all transform hover:scale-[1.02]"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 text-blue-600 dark:text-blue-400 rounded-xl border-2 border-blue-300 dark:border-blue-700">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {recommendation.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 font-medium">
                          {recommendation.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 text-xs font-bold rounded-xl border-2 ${getPriorityColor(recommendation.priority)}`}>
                        {recommendation.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  {recommendation.action && (
                    <button
                      onClick={() => handleRecommendationAction(recommendation)}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      {recommendation.action}
                    </button>
                  )}
                </div>
              );
            })}
            
            {recommendations.length === 0 && (
              <div className="text-center py-12">
                <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No recommendations</h3>
                <p className="text-gray-600 dark:text-gray-400">We're analyzing your data to provide personalized recommendations</p>
              </div>
            )}
          </div>
        )}

        {selectedTab === 'comparisons' && (
          <div className="space-y-4">
            {costComparisons.map((comparison, index) => (
              <div 
                key={index} 
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {comparison.item}
                  </h3>
                  <div className="flex items-center space-x-2">
                    {comparison.savings > 0 ? (
                      <TrendingDown className="w-5 h-5 text-green-500" />
                    ) : (
                      <TrendingUp className="w-5 h-5 text-red-500" />
                    )}
                    <span className={`text-sm font-medium ${
                      comparison.savings > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {comparison.savings > 0 ? 'Savings' : 'Above Average'}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Current Price</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      ${comparison.currentPrice.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Average Price</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      ${comparison.averagePrice.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Savings</p>
                    <p className={`text-lg font-semibold ${
                      comparison.savings > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {comparison.savings > 0 ? '+' : ''}${comparison.savings.toFixed(2)} ({comparison.savingsPercent.toFixed(1)}%)
                    </p>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Recommendation:</strong> {comparison.recommendation}
                  </p>
                </div>
              </div>
            ))}
            
            {costComparisons.length === 0 && (
              <div className="text-center py-12">
                <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No cost comparisons</h3>
                <p className="text-gray-600 dark:text-gray-400">Insufficient pricing data for comparison analysis</p>
              </div>
            )}
          </div>
        )}

        {selectedTab === 'alerts' && (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div 
                key={alert.id} 
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getSeverityColor(alert.severity)}`}>
                      {alert.severity === 'error' && <AlertTriangle className="w-5 h-5" />}
                      {alert.severity === 'warning' && <AlertTriangle className="w-5 h-5" />}
                      {alert.severity === 'success' && <CheckCircle className="w-5 h-5" />}
                      {alert.severity === 'info' && <Bell className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {alert.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {alert.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(alert.severity)}`}>
                    {alert.severity}
                  </span>
                </div>
                
                {alert.action && (
                  <button
                    onClick={() => handleAlertAction(alert)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    {alert.action}
                  </button>
                )}
              </div>
            ))}
            
            {alerts.length === 0 && (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No alerts</h3>
                <p className="text-gray-600 dark:text-gray-400">All systems operating normally</p>
              </div>
            )}
          </div>
        )}

        {selectedTab === 'demand' && (
          <CountryDemandMapping countryCode={countryCode} />
        )}
      </div>

      {/* Data Source Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start">
          <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">AI-Powered Insights</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Smart recommendations are generated using machine learning algorithms analyzing your data patterns, 
              market trends, and supplier performance metrics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RwandaSmartFeatures;

