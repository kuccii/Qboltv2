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
  PieChart,
  MapPin
} from 'lucide-react';
import { CountryPricing } from '../../data/countries/types';
import { getRwandaPricing } from '../../data/countries/rwanda/rwandaDataLoader';
import { unifiedApi } from '../../services/unifiedApi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts';

interface PricingIntelligenceProps {
  className?: string;
  countryCode?: string; // Optional: defaults to 'RW'
}

type PricingCategory = 'fuel' | 'labor' | 'transport' | 'storage' | 'materials';
type ViewMode = 'table' | 'chart' | 'trends';

const RwandaPricingIntelligence: React.FC<PricingIntelligenceProps> = ({ className = '', countryCode = 'RW' }) => {
  const [pricing, setPricing] = useState<CountryPricing[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<PricingCategory>('fuel');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    loadPricingData();
  }, [countryCode, selectedCategory]);

  const loadPricingData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch from database first, fallback to JSON files
      try {
        const dbPricing = await unifiedApi.countries.getPricing(countryCode, {
          category: selectedCategory
        });

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
          setLastUpdated(dbPricing[0]?.last_updated || new Date().toISOString());
        } else {
          // Fallback to JSON files (only for Rwanda)
          if (countryCode === 'RW') {
            const pricingData = await getRwandaPricing();
            setPricing(pricingData);
            setLastUpdated(new Date().toISOString());
          } else {
            setPricing([]);
            setLastUpdated(new Date().toISOString());
          }
        }
      } catch (dbError) {
        // Fallback to JSON files (only for Rwanda)
        if (countryCode === 'RW') {
          console.log('Database fetch failed, using JSON files:', dbError);
          const pricingData = await getRwandaPricing();
          setPricing(pricingData);
          setLastUpdated(new Date().toISOString());
        } else {
          setPricing([]);
          setLastUpdated(new Date().toISOString());
        }
      }
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
      case 'labor': return 'text-primary-600 dark:text-primary-400';
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

  // Only show loading on initial load, not when switching tabs
  if (loading && pricing.length === 0) {
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
      {/* Playful Header */}
      <div className="mb-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span>💰</span>
          Pricing Intelligence!
        </h2>
        <p className="text-base text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
          <span>📊</span>
          See all the prices for things you need!
        </p>
      </div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <button
            onClick={loadPricingData}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all transform hover:scale-105 border-2 border-gray-300 dark:border-gray-600 font-bold"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button className="flex items-center px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all transform hover:scale-105 shadow-lg font-bold">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Playful Category Stats */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <span>📊</span>
          Category Overview
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {categories.map((category) => {
          const stats = getCategoryStats(category.value);
          const Icon = getCategoryIcon(category.value);
          const colorClass = getCategoryColor(category.value);
          const categoryEmojis: Record<PricingCategory, string> = {
            'fuel': '⛽',
            'labor': '👷',
            'transport': '🚚',
            'storage': '📦',
            'materials': '🏗️'
          };
          const categoryColors: Record<PricingCategory, string> = {
            'fuel': 'from-orange-400 via-orange-500 to-orange-600 dark:from-orange-600 dark:via-orange-700 dark:to-orange-800 border-orange-300 dark:border-orange-500',
            'labor': 'from-primary-400 via-primary-500 to-primary-600 dark:from-primary-600 dark:via-primary-700 dark:to-primary-800 border-primary-300 dark:border-primary-500',
            'transport': 'from-purple-400 via-purple-500 to-purple-600 dark:from-purple-600 dark:via-purple-700 dark:to-purple-800 border-purple-300 dark:border-purple-500',
            'storage': 'from-green-400 via-green-500 to-green-600 dark:from-green-600 dark:via-green-700 dark:to-green-800 border-green-300 dark:border-green-500',
            'materials': 'from-indigo-400 via-indigo-500 to-indigo-600 dark:from-indigo-600 dark:via-indigo-700 dark:to-indigo-800 border-indigo-300 dark:border-indigo-500'
          };
          
          return (
            <div key={category.value} className={`bg-gradient-to-br ${categoryColors[category.value]} rounded-2xl shadow-2xl border-4 p-5 transform hover:scale-105 transition-all`}>
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-xl bg-white/20 dark:bg-white/10 border-2 border-white/30">
                  <span className="text-2xl">{categoryEmojis[category.value]}</span>
                </div>
                <span className="text-xs font-bold text-white bg-white/30 px-2 py-1 rounded-lg border border-white/40">{category.count} items</span>
              </div>
              <h3 className="font-bold text-lg text-white mb-2">{category.label}</h3>
              {stats ? (
                <div className="space-y-2">
                  <p className="text-sm font-bold text-white">
                    <span className="text-white/80">Avg:</span> {stats.currency} {stats.average.toFixed(2)}
                  </p>
                  <p className="text-xs font-medium text-white/90">
                    <span className="text-white/80">Range:</span> {stats.currency} {stats.min.toFixed(2)} - {stats.max.toFixed(2)}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-white/80 text-center py-2">No data yet! 📊</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Playful Category Filter */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <span>🔍</span>
          Filter by Category
        </h3>
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((category) => {
          const categoryEmojis: Record<PricingCategory, string> = {
            'fuel': '⛽',
            'labor': '👷',
            'transport': '🚚',
            'storage': '📦',
            'materials': '🏗️'
          };
          return (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`flex items-center px-4 py-2 rounded-xl text-sm font-bold transition-all transform hover:scale-105 ${
                selectedCategory === category.value
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg scale-105'
                  : 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border-2 border-gray-200 dark:border-gray-600'
              }`}
            >
              <span className="text-lg mr-2">{categoryEmojis[category.value]}</span>
              <span>{category.label}</span>
              <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-bold ${
                selectedCategory === category.value
                  ? 'bg-white/30 text-white'
                  : 'bg-white/50 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
              }`}>
                {category.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Playful View Mode Toggle */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">View:</span>
          <div className="flex bg-gradient-to-r from-primary-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-1 border-2 border-primary-200 dark:border-gray-700">
            {[
              { value: 'table', label: 'Table', icon: BarChart3, emoji: '📊' },
              { value: 'chart', label: 'Chart', icon: PieChart, emoji: '📈' },
              { value: 'trends', label: 'Trends', icon: TrendingUp, emoji: '📉' }
            ].map((mode) => {
              const Icon = mode.icon;
              return (
                <button
                  key={mode.value}
                  onClick={() => setViewMode(mode.value as ViewMode)}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all transform hover:scale-105 ${
                    viewMode === mode.value
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg scale-105'
                      : 'text-gray-600 dark:text-gray-400 hover:text-primary-700 dark:hover:text-primary-300'
                  }`}
                >
                  <span className="mr-1">{mode.emoji}</span>
                  {mode.label}
                </button>
              );
            })}
          </div>
        </div>
        
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-700">
          <Calendar className="w-4 h-4 mr-1" />
          Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleString() : 'Unknown'}
        </div>
      </div>

      {/* Playful Content */}
      <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg border-2 border-gray-200 dark:border-gray-700">
        {viewMode === 'table' && (
          <div className="overflow-x-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getFilteredPricing().map((item, index) => {
                const categoryEmojis: Record<string, string> = {
                  'fuel': '⛽',
                  'labor': '👷',
                  'transport': '🚚',
                  'storage': '📦',
                  'materials': '🏗️'
                };
                const emoji = categoryEmojis[item.category] || '💰';
                
                return (
                  <div 
                    key={index} 
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-gray-200 dark:border-gray-700 p-5 hover:shadow-xl hover:border-primary-300 dark:hover:border-primary-600 transition-all"
                  >
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-primary-50 dark:bg-primary-900/30 rounded-lg">
                        <span className="text-2xl">{emoji}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-bold text-gray-900 dark:text-white truncate">
                          {item.item}
                        </h4>
                        {item.region && (
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-xs mt-1">
                            <MapPin className="w-3 h-3" />
                            {item.region}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                        <span>💰</span>
                        Price
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {item.currency} {item.price.toFixed(2)}
                      </div>
                      {item.previousPrice && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Was: {item.currency} {item.previousPrice.toFixed(2)}
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Unit</div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {item.unit}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Trend</div>
                        <div className="flex items-center gap-1">
                          <span className="text-base">
                            {item.trend === 'up' ? '📈' : item.trend === 'down' ? '📉' : '➡️'}
                          </span>
                          <span className={`text-sm font-semibold capitalize ${getTrendColor(item.trend)}`}>
                            {item.trend || 'Stable'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span className="truncate">{item.source}</span>
                        <span>{new Date(item.lastUpdated).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {viewMode === 'chart' && (
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span>📊</span>
              {categories.find(c => c.value === selectedCategory)?.label} Pricing Chart
            </h3>
            <div className="h-80 bg-white/50 dark:bg-gray-800/50 rounded-xl p-4">
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
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span>📉</span>
              Price Trends Over Time
            </h3>
            <div className="h-80 bg-white/50 dark:bg-gray-800/50 rounded-xl p-4">
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

        {/* Playful No data */}
        {getFilteredPricing().length === 0 && (
          <div className="text-center py-12">
            <span className="text-6xl block mb-4">💰</span>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No pricing data yet!</h3>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              No pricing information available for {categories.find(c => c.value === selectedCategory)?.label.toLowerCase()} right now! 📊
            </p>
          </div>
        )}
      </div>

      {/* Playful Data Source Info */}
      <div className="bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 border-2 border-primary-300 dark:border-primary-700 rounded-2xl p-5 shadow-lg">
        <div className="flex items-start">
          <span className="text-2xl mr-3 flex-shrink-0">ℹ️</span>
          <div>
            <h4 className="text-base font-bold text-primary-900 dark:text-primary-200 mb-2">Data Source</h4>
            <p className="text-sm text-primary-800 dark:text-primary-300 font-medium">
              Pricing data comes from Logistics Cluster (logcluster.org) and might not be super up-to-date! 📊
              Prices are just for reference! 💡
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RwandaPricingIntelligence;

