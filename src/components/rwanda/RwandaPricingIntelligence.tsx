// Pricing intelligence component for Rwanda showing fuel, labor, and transport costs with trends
import React, { useState, useEffect } from 'react';
import { 
  Fuel, 
  Users, 
  Truck, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  DollarSign,
  Calendar,
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle,
  Info,
  BarChart3,
  PieChart
} from 'lucide-react';
import { CountryPricing } from '../../data/countries/types';
import { getRwandaPricing } from '../../data/countries/rwanda/rwandaDataLoader';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts';

interface PricingIntelligenceProps {
  className?: string;
}

type PricingCategory = 'fuel' | 'labor' | 'transport' | 'storage' | 'materials';
type ViewMode = 'table' | 'chart' | 'trends';

const RwandaPricingIntelligence: React.FC<PricingIntelligenceProps> = ({ className = '' }) => {
  const [pricing, setPricing] = useState<CountryPricing[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<PricingCategory>('fuel');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    loadPricingData();
  }, []);

  const loadPricingData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const pricingData = await getRwandaPricing();
      setPricing(pricingData);
      setLastUpdated(new Date().toISOString());
    } catch (err) {
      setError('Failed to load pricing data');
      console.error('Error loading pricing data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredPricing = () => {
    return pricing.filter(p => p.category === selectedCategory);
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-green-500" />;
      case 'stable': return <Minus className="w-4 h-4 text-gray-500" />;
      default: return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTrendColor = (trend?: string) => {
    switch (trend) {
      case 'up': return 'text-red-600 dark:text-red-400';
      case 'down': return 'text-green-600 dark:text-green-400';
      case 'stable': return 'text-gray-600 dark:text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'fuel': return <Fuel className="w-5 h-5" />;
      case 'labor': return <Users className="w-5 h-5" />;
      case 'transport': return <Truck className="w-5 h-5" />;
      case 'storage': return <BarChart3 className="w-5 h-5" />;
      case 'materials': return <PieChart className="w-5 h-5" />;
      default: return <DollarSign className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'fuel': return 'text-orange-600 dark:text-orange-400';
      case 'labor': return 'text-blue-600 dark:text-blue-400';
      case 'transport': return 'text-purple-600 dark:text-purple-400';
      case 'storage': return 'text-green-600 dark:text-green-400';
      case 'materials': return 'text-indigo-600 dark:text-indigo-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getCategoryStats = (category: PricingCategory) => {
    const categoryPricing = pricing.filter(p => p.category === category);
    if (categoryPricing.length === 0) return null;

    const prices = categoryPricing.map(p => p.price);
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    return {
      count: categoryPricing.length,
      average: avgPrice,
      min: minPrice,
      max: maxPrice,
      currency: categoryPricing[0]?.currency || 'USD'
    };
  };

  const getChartData = () => {
    const categoryPricing = getFilteredPricing();
    return categoryPricing.map(item => ({
      name: item.item,
      price: item.price,
      currency: item.currency,
      lastUpdated: new Date(item.lastUpdated).toLocaleDateString()
    }));
  };

  const categories: { value: PricingCategory; label: string; count: number }[] = [
    { value: 'fuel', label: 'Fuel', count: pricing.filter(p => p.category === 'fuel').length },
    { value: 'labor', label: 'Labor', count: pricing.filter(p => p.category === 'labor').length },
    { value: 'transport', label: 'Transport', count: pricing.filter(p => p.category === 'transport').length },
    { value: 'storage', label: 'Storage', count: pricing.filter(p => p.category === 'storage').length },
    { value: 'materials', label: 'Materials', count: pricing.filter(p => p.category === 'materials').length }
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading pricing data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center p-8 ${className}`}>
        <div className="text-red-500 mb-4">
          <AlertTriangle className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error Loading Pricing Data</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <button
          onClick={loadPricingData}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pricing Intelligence</h2>
          <p className="text-gray-600 dark:text-gray-400">Current pricing data for Rwanda logistics</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={loadPricingData}
            className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Category Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {categories.map((category) => {
          const stats = getCategoryStats(category.value);
          const Icon = getCategoryIcon(category.value);
          const colorClass = getCategoryColor(category.value);
          
          return (
            <div key={category.value} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-700 ${colorClass}`}>
                  {Icon}
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">{category.count} items</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{category.label}</h3>
              {stats ? (
                <div className="space-y-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Avg: {stats.currency} {stats.average.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Range: {stats.currency} {stats.min.toFixed(2)} - {stats.max.toFixed(2)}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No data available</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.value}
            onClick={() => setSelectedCategory(category.value)}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === category.value
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {getCategoryIcon(category.value)}
            <span className="ml-2">{category.label}</span>
            <span className="ml-2 bg-white/20 dark:bg-gray-600 text-xs px-2 py-0.5 rounded-full">
              {category.count}
            </span>
          </button>
        ))}
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">View:</span>
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {[
              { value: 'table', label: 'Table', icon: BarChart3 },
              { value: 'chart', label: 'Chart', icon: PieChart },
              { value: 'trends', label: 'Trends', icon: TrendingUp }
            ].map((mode) => {
              const Icon = mode.icon;
              return (
                <button
                  key={mode.value}
                  onClick={() => setViewMode(mode.value as ViewMode)}
                  className={`flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === mode.value
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-1" />
                  {mode.label}
                </button>
              );
            })}
          </div>
        </div>
        
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <Calendar className="w-4 h-4 mr-1" />
          Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleString() : 'Unknown'}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {viewMode === 'table' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Unit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Trend
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Last Updated
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {getFilteredPricing().map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getCategoryIcon(item.category)}
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.item}
                          </div>
                          {item.region && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {item.region}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.currency} {item.price.toFixed(2)}
                      </div>
                      {item.previousPrice && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Was: {item.currency} {item.previousPrice.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {item.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getTrendIcon(item.trend)}
                        <span className={`ml-1 text-sm ${getTrendColor(item.trend)}`}>
                          {item.trend || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {item.source}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(item.lastUpdated).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {viewMode === 'chart' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {categories.find(c => c.value === selectedCategory)?.label} Pricing
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any) => [`${value} USD`, 'Price']}
                    labelFormatter={(label) => `Item: ${label}`}
                  />
                  <Bar dataKey="price" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {viewMode === 'trends' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Price Trends
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any) => [`${value} USD`, 'Price']}
                    labelFormatter={(label) => `Item: ${label}`}
                  />
                  <Line type="monotone" dataKey="price" stroke="#3B82F6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* No data */}
        {getFilteredPricing().length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No pricing data</h3>
            <p className="text-gray-600 dark:text-gray-400">
              No pricing information available for {categories.find(c => c.value === selectedCategory)?.label.toLowerCase()}
            </p>
          </div>
        )}
      </div>

      {/* Data Source Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">Data Source</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Pricing data is sourced from Logistics Cluster (logcluster.org) and may not reflect real-time market conditions. 
              Prices are provided for reference purposes only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RwandaPricingIntelligence;

