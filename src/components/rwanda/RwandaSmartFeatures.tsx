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
      
      const [suppliersData, pricingData, infrastructureData] = await Promise.all([
        getRwandaSuppliers(),
        getRwandaPricing(),
        getRwandaInfrastructure()
      ]);
      
      setSuppliers(suppliersData);
      setPricing(pricingData);
      setInfrastructure(infrastructureData);
      
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

  if (loading) {
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Zap className="w-6 h-6 mr-2 text-primary-600" />
            Smart Intelligence
          </h2>
          <p className="text-gray-600 dark:text-gray-400">AI-powered insights and recommendations for Rwanda logistics</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'recommendations', label: 'Recommendations', icon: Lightbulb, count: recommendations.length },
            { id: 'comparisons', label: 'Cost Analysis', icon: Calculator, count: costComparisons.length },
            { id: 'alerts', label: 'Alerts', icon: Bell, count: alerts.length },
            { id: 'demand', label: 'Demand Mapping', icon: MapPin, count: 0 }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                aria-label={`Switch to ${tab.label} tab`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
                <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 py-0.5 px-2 rounded-full text-xs">
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
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-lg">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {recommendation.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {recommendation.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(recommendation.priority)}`}>
                        {recommendation.priority}
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

