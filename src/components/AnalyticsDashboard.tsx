// Advanced analytics dashboard with comprehensive metrics
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Activity, 
  Users, 
  Package, 
  DollarSign,
  Download,
  RefreshCw
} from 'lucide-react';
import EnhancedChart, { ChartTypeSelector } from './EnhancedChart';
import { usePWA } from '../utils/pwa';
import { unifiedApi } from '../services/unifiedApi';
import { useAuth } from '../contexts/AuthContext';
import HeaderStrip from './HeaderStrip';
import {
  AppLayout,
  PageLayout,
} from '../design-system';

interface AnalyticsData {
  totalRevenue: number;
  revenueGrowth: number;
  totalOrders: number;
  orderGrowth: number;
  activeSuppliers: number;
  supplierGrowth: number;
  avgOrderValue: number;
  orderValueGrowth: number;
  priceTrends: Array<{
    date: string;
    [key: string]: any;
  }>;
  supplierPerformance: Array<{
    id: string;
    name: string;
    orders: number;
    revenue: number;
    rating: number;
  }>;
  marketShare: Array<{
    category: string;
    value: number;
    color: string;
  }>;
  regionalData: Array<{
    region: string;
    orders: number;
    revenue: number;
    growth: number;
  }>;
}

const AnalyticsDashboard: React.FC = () => {
  const { isOnline } = usePWA();
  const { authState } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedChartType, setSelectedChartType] = useState<'line' | 'bar' | 'area'>('line');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  // Fetch analytics data from backend
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        const [metrics, priceTrends, supplierPerformance, marketShare, regionalData] = await Promise.all([
          unifiedApi.analytics.getMetrics({
            period: selectedPeriod,
            country: authState.user?.country,
            industry: authState.user?.industry,
          }),
          unifiedApi.analytics.getPriceTrends({
            period: selectedPeriod,
            country: authState.user?.country,
            materials: ['cement', 'steel', 'timber', 'sand'],
          }),
          unifiedApi.analytics.getSupplierPerformance({
            period: selectedPeriod,
            country: authState.user?.country,
            industry: authState.user?.industry,
            limit: 5,
          }),
          unifiedApi.analytics.getMarketShare({
            period: selectedPeriod,
            country: authState.user?.country,
          }),
          unifiedApi.analytics.getRegionalData({
            period: selectedPeriod,
          }),
        ]);

        setAnalyticsData({
          ...metrics,
          priceTrends: priceTrends || [],
          supplierPerformance: supplierPerformance || [],
          marketShare: marketShare || [],
          regionalData: regionalData || [],
        } as AnalyticsData);
      } catch (err: any) {
        console.error('Failed to fetch analytics:', err);
        setError('Failed to load analytics data');
        // Set fallback data
        setAnalyticsData({
          totalRevenue: 0,
          revenueGrowth: 0,
          totalOrders: 0,
          orderGrowth: 0,
          activeSuppliers: 0,
          supplierGrowth: 0,
          avgOrderValue: 0,
          orderValueGrowth: 0,
          priceTrends: [],
          supplierPerformance: [],
          marketShare: [],
          regionalData: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [selectedPeriod, authState.user?.country, authState.user?.industry]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const [metrics, priceTrends, supplierPerformance, marketShare, regionalData] = await Promise.all([
        unifiedApi.analytics.getMetrics({
          period: selectedPeriod,
          country: authState.user?.country,
          industry: authState.user?.industry,
        }),
        unifiedApi.analytics.getPriceTrends({
          period: selectedPeriod,
          country: authState.user?.country,
          materials: ['cement', 'steel', 'timber', 'sand'],
        }),
        unifiedApi.analytics.getSupplierPerformance({
          period: selectedPeriod,
          country: authState.user?.country,
          industry: authState.user?.industry,
          limit: 5,
        }),
        unifiedApi.analytics.getMarketShare({
          period: selectedPeriod,
          country: authState.user?.country,
        }),
        unifiedApi.analytics.getRegionalData({
          period: selectedPeriod,
        }),
      ]);

      setAnalyticsData({
        ...metrics,
        priceTrends: priceTrends || [],
        supplierPerformance: supplierPerformance || [],
        marketShare: marketShare || [],
        regionalData: regionalData || [],
      } as AnalyticsData);
    } catch (err) {
      console.error('Failed to refresh analytics:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExport = () => {
    if (!analyticsData) return;

    // Export analytics data as CSV
    const csvData = [
      ['Metric', 'Value', 'Growth %'],
      ['Total Revenue', analyticsData.totalRevenue, analyticsData.revenueGrowth],
      ['Total Orders', analyticsData.totalOrders, analyticsData.orderGrowth],
      ['Active Suppliers', analyticsData.activeSuppliers, analyticsData.supplierGrowth],
      ['Avg Order Value', analyticsData.avgOrderValue, analyticsData.orderValueGrowth],
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qivook-analytics-${selectedPeriod}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Use real data or fallback
  const data = analyticsData || {
    totalRevenue: 0,
    revenueGrowth: 0,
    totalOrders: 0,
    orderGrowth: 0,
    activeSuppliers: 0,
    supplierGrowth: 0,
    avgOrderValue: 0,
    orderValueGrowth: 0,
    priceTrends: [],
    supplierPerformance: [],
    marketShare: [],
    regionalData: [],
  };

  const priceChartConfig = [
    { dataKey: 'cement', color: '#3B82F6', name: 'Cement (KES/bag)' },
    { dataKey: 'steel', color: '#EF4444', name: 'Steel (KES/ton)' },
    { dataKey: 'timber', color: '#10B981', name: 'Timber (KES/m³)' },
    { dataKey: 'sand', color: '#F59E0B', name: 'Sand (KES/m³)' },
  ];

  const supplierChartConfig = [
    { dataKey: 'orders', color: '#3B82F6', name: 'Orders' },
    { dataKey: 'revenue', color: '#10B981', name: 'Revenue (K)' },
  ];

  const regionalChartConfig = [
    { dataKey: 'orders', color: '#3B82F6', name: 'Orders' },
    { dataKey: 'revenue', color: '#10B981', name: 'Revenue (K)' },
  ];

  return (
    <AppLayout>
      <HeaderStrip 
        title="Analytics Dashboard"
        subtitle="Comprehensive insights into your supply chain performance"
        chips={[
          { label: 'Revenue', value: `$${(data.totalRevenue / 1000000).toFixed(1)}M`, variant: 'success' },
          { label: 'Orders', value: data.totalOrders, variant: 'info' },
          { label: 'Suppliers', value: data.activeSuppliers, variant: 'info' },
        ]}
        right={
          <div className="flex items-center gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || !isOnline}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
            >
              <Download size={20} />
              Export
            </button>
          </div>
        }
        status={isOnline ? { kind: 'live' } : { kind: 'offline' }}
      />

      <PageLayout maxWidth="full" padding="none">
        <div className="px-10 md:px-14 lg:px-20 py-8 space-y-8">
          {/* Offline Indicator */}
          {!isOnline && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Activity size={20} className="text-yellow-600 dark:text-yellow-400" />
                <span className="text-yellow-800 dark:text-yellow-200 font-medium">
                  You're offline. Some data may not be up to date.
                </span>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Activity size={20} className="text-red-600 dark:text-red-400" />
                <span className="text-red-800 dark:text-red-200 font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Key Metrics */}
          {!loading && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Total Revenue"
                  value={data.totalRevenue}
                  growth={data.revenueGrowth}
                  icon={DollarSign}
                  format="currency"
                />
                <MetricCard
                  title="Total Orders"
                  value={data.totalOrders}
                  growth={data.orderGrowth}
                  icon={Package}
                  format="number"
                />
                <MetricCard
                  title="Active Suppliers"
                  value={data.activeSuppliers}
                  growth={data.supplierGrowth}
                  icon={Users}
                  format="number"
                />
                <MetricCard
                  title="Avg Order Value"
                  value={data.avgOrderValue}
                  growth={data.orderValueGrowth}
                  icon={BarChart3}
                  format="currency"
                />
              </div>

              {/* Charts Section */}
              {data.priceTrends.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Price Trends Chart */}
                  <EnhancedChart
                    data={data.priceTrends}
                    config={priceChartConfig}
                    type={selectedChartType}
                    title="Price Trends"
                    subtitle="Material prices over time"
                    height={400}
                    showTrend={true}
                  />

                  {/* Market Share Chart */}
                  {data.marketShare.length > 0 && (
                    <EnhancedChart
                      data={data.marketShare}
                      config={[]}
                      type="pie"
                      title="Market Share"
                      subtitle="Distribution by category"
                      height={400}
                    />
                  )}
                </div>
              )}

              {/* Supplier Performance */}
              {data.supplierPerformance.length > 0 && (
                <EnhancedChart
                  data={data.supplierPerformance}
                  config={supplierChartConfig}
                  type="bar"
                  title="Supplier Performance"
                  subtitle="Top performing suppliers by orders and revenue"
                  height={400}
                />
              )}

              {/* Regional Analysis */}
              {data.regionalData.length > 0 && (
                <EnhancedChart
                  data={data.regionalData}
                  config={regionalChartConfig}
                  type="bar"
                  title="Regional Analysis"
                  subtitle="Performance by region"
                  height={400}
                />
              )}

              {/* Chart Type Selector */}
              <div className="flex justify-center">
                <ChartTypeSelector
                  selectedType={selectedChartType}
                  onTypeChange={setSelectedChartType}
                />
              </div>
            </>
          )}
        </div>
      </PageLayout>
    </AppLayout>
  );
};

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: number;
  growth: number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  format: 'currency' | 'number' | 'percentage';
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  growth,
  icon: Icon,
  format
}) => {
  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-KE', {
          style: 'currency',
          currency: 'KES',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(val);
      case 'number':
        return val.toLocaleString();
      case 'percentage':
        return `${val}%`;
      default:
        return val.toString();
    }
  };

  const isPositive = growth >= 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
            {formatValue(value)}
          </p>
        </div>
        <div className="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
          <Icon size={24} className="text-primary-600 dark:text-primary-400" />
        </div>
      </div>
      
      <div className="mt-4 flex items-center gap-2">
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm ${
          isPositive 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
        }`}>
          {isPositive ? (
            <TrendingUp size={14} />
          ) : (
            <TrendingDown size={14} />
          )}
          <span>{Math.abs(growth).toFixed(1)}%</span>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          vs previous period
        </span>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
