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
  RefreshCw,
  Filter,
  Calendar,
  Clock,
  Info,
  AlertTriangle,
  Lightbulb,
  Target,
  ArrowRight,
  Settings,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet
} from 'lucide-react';
import EnhancedChart, { ChartTypeSelector } from './EnhancedChart';
import { usePWA } from '../utils/pwa';
import { unifiedApi } from '../services/unifiedApi';
import { useAuth } from '../contexts/AuthContext';
import { useIndustry } from '../contexts/IndustryContext';
import HeaderStrip from './HeaderStrip';
import {
  AppLayout,
  PageLayout,
  SelectInput,
  ActionMenu,
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
  const { currentIndustry, industryConfig } = useIndustry();
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedChartType, setSelectedChartType] = useState<'line' | 'bar' | 'area'>('line');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [comparePeriod, setComparePeriod] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'prices' | 'suppliers' | 'logistics' | 'risk' | 'documents'>('overview');
  const [chartLoading, setChartLoading] = useState({
    priceTrends: false,
    supplierPerformance: false,
    marketShare: false,
    regionalData: false
  });
  
  // Additional analytics data
  const [priceAnalytics, setPriceAnalytics] = useState<any>(null);
  const [supplierAnalytics, setSupplierAnalytics] = useState<any>(null);
  const [logisticsAnalytics, setLogisticsAnalytics] = useState<any>(null);
  const [riskAnalytics, setRiskAnalytics] = useState<any>(null);
  const [documentAnalytics, setDocumentAnalytics] = useState<any>(null);

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
            materials: industryConfig?.materials || (currentIndustry === 'construction' 
              ? ['cement', 'steel', 'timber', 'sand', 'gravel'] 
              : ['fertilizer', 'seeds', 'pesticides', 'feed', 'machinery']),
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
        setLastUpdated(new Date());
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
  }, [selectedPeriod, authState.user?.country, authState.user?.industry, currentIndustry, industryConfig]);

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
          materials: industryConfig?.materials || (currentIndustry === 'construction' 
            ? ['cement', 'steel', 'timber', 'sand', 'gravel'] 
            : ['fertilizer', 'seeds', 'pesticides', 'feed', 'machinery']),
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
          { label: 'Total Shipments', value: data.totalOrders, variant: 'info' },
          { label: 'Active Suppliers', value: data.activeSuppliers, variant: 'info' },
          { label: 'Price Points', value: data.priceTrends.length, variant: 'success' },
        ]}
        right={
          <div className="flex items-center gap-3">
            <SelectInput
              value={selectedPeriod}
              onChange={setSelectedPeriod}
              options={[
                { value: '7d', label: 'Last 7 days' },
                { value: '30d', label: 'Last 30 days' },
                { value: '90d', label: 'Last 90 days' },
                { value: '1y', label: 'Last year' }
              ]}
              className="w-40"
            />
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || !isOnline}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
            <ActionMenu
              items={[
                {
                  label: 'Export CSV',
                  icon: <FileText className="h-4 w-4" />,
                  onClick: handleExport
                },
                {
                  label: 'Export PDF',
                  icon: <FileText className="h-4 w-4" />,
                  onClick: () => {
                    // TODO: Implement PDF export
                    alert('PDF export coming soon');
                  }
                },
                {
                  label: 'Export Image',
                  icon: <ImageIcon className="h-4 w-4" />,
                  onClick: () => {
                    // TODO: Implement image export
                    alert('Image export coming soon');
                  }
                },
                {
                  label: 'Export Excel',
                  icon: <FileSpreadsheet className="h-4 w-4" />,
                  onClick: () => {
                    // TODO: Implement Excel export
                    alert('Excel export coming soon');
                  }
                }
              ]}
              size="sm"
            />
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
            <div className="flex flex-col items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-primary-600 mb-4" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Loading analytics data...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-1">
                    Failed to load analytics data
                  </h3>
                  <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                    {error}. Please try refreshing.
                  </p>
                  <button
                    onClick={handleRefresh}
                    className="text-sm font-medium text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 flex items-center gap-1"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Retry
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Key Metrics */}
          {!loading && (
            <>
              {/* Tab Navigation */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                  <button
                    onClick={() => setSelectedTab('overview')}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      selectedTab === 'overview'
                        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Overview
                    </div>
                  </button>
                  <button
                    onClick={() => setSelectedTab('prices')}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      selectedTab === 'prices'
                        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Prices
                    </div>
                  </button>
                  <button
                    onClick={() => setSelectedTab('suppliers')}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      selectedTab === 'suppliers'
                        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Suppliers
                    </div>
                  </button>
                  <button
                    onClick={() => setSelectedTab('logistics')}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      selectedTab === 'logistics'
                        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Logistics
                    </div>
                  </button>
                  <button
                    onClick={() => setSelectedTab('risk')}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      selectedTab === 'risk'
                        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Risk
                    </div>
                  </button>
                  <button
                    onClick={() => setSelectedTab('documents')}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      selectedTab === 'documents'
                        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Documents
                    </div>
                  </button>
                </div>

                <div className="p-6">
                  {/* Filters and Controls */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        showFilters
                          ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <Filter className="h-4 w-4" />
                      Filters
                    </button>
                    <label className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={comparePeriod}
                        onChange={(e) => setComparePeriod(e.target.checked)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      Compare Periods
                    </label>
                  </div>
                  {lastUpdated && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="h-4 w-4" />
                      Last updated: {lastUpdated.toLocaleTimeString()}
                    </div>
                    )}
                  </div>

                  {showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Material
                      </label>
                      <SelectInput
                        value={selectedMaterial}
                        onChange={setSelectedMaterial}
                        options={[
                          { value: 'all', label: 'All Materials' },
                          ...(industryConfig?.materials || (currentIndustry === 'construction' 
                            ? ['cement', 'steel', 'timber', 'sand', 'gravel'] 
                            : ['fertilizer', 'seeds', 'pesticides', 'feed', 'machinery'])).map(m => ({
                            value: m,
                            label: m.charAt(0).toUpperCase() + m.slice(1)
                          }))
                        ]}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Region
                      </label>
                      <SelectInput
                        value={selectedRegion}
                        onChange={setSelectedRegion}
                        options={[
                          { value: 'all', label: 'All Regions' },
                          { value: 'RW', label: 'Rwanda' },
                          { value: 'KE', label: 'Kenya' },
                          { value: 'UG', label: 'Uganda' },
                          { value: 'TZ', label: 'Tanzania' },
                          { value: 'ET', label: 'Ethiopia' }
                        ]}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Chart Type
                      </label>
                      <SelectInput
                        value={selectedChartType}
                        onChange={setSelectedChartType}
                        options={[
                          { value: 'line', label: 'Line Chart' },
                          { value: 'bar', label: 'Bar Chart' },
                          { value: 'area', label: 'Area Chart' }
                        ]}
                        className="w-full"
                      />
                      </div>
                    </div>
                  )}
                  </div>

                  {/* Tab Content */}
                  {selectedTab === 'overview' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Total Shipments"
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
                  title="Price Points Tracked"
                  value={data.priceTrends.length > 0 ? data.priceTrends.reduce((sum: number, item: any) => {
                    return sum + Object.keys(item).filter(k => k !== 'date').length;
                  }, 0) : 0}
                  growth={0}
                  icon={DollarSign}
                  format="number"
                />
                <MetricCard
                  title="Materials Tracked"
                  value={industryConfig?.materials?.length || (currentIndustry === 'construction' ? 5 : 5)}
                  growth={0}
                  icon={BarChart3}
                  format="number"
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
                          subtitle="Top performing suppliers by activity and ratings"
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
                    </div>
                  )}

                  {selectedTab === 'prices' && (
                    <div className="space-y-6">
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          Price Analytics
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Comprehensive price analysis and trends for {industryConfig?.materials?.length || 0} materials
                        </p>
                      </div>

                      {/* Price Metrics */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Price Points</h4>
                            <DollarSign className="h-5 w-5 text-primary-600" />
                          </div>
                          <div className="text-3xl font-bold text-gray-900 dark:text-white">
                            {data.priceTrends.length > 0 ? data.priceTrends.reduce((sum: number, item: any) => {
                              return sum + Object.keys(item).filter(k => k !== 'date').length;
                            }, 0) : 0}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Across all materials</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Materials Tracked</h4>
                            <Package className="h-5 w-5 text-primary-600" />
                          </div>
                          <div className="text-3xl font-bold text-gray-900 dark:text-white">
                            {industryConfig?.materials?.length || (currentIndustry === 'construction' ? 5 : 5)}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Active materials</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Price Volatility</h4>
                            <Activity className="h-5 w-5 text-primary-600" />
                          </div>
                          <div className="text-3xl font-bold text-gray-900 dark:text-white">
                            {data.priceTrends.length > 0 ? 'Medium' : 'N/A'}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Based on recent trends</p>
                        </div>
                      </div>

                      {/* Price Trends Chart */}
                      {data.priceTrends.length > 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                          <EnhancedChart
                            data={data.priceTrends}
                            config={priceChartConfig}
                            type={selectedChartType}
                            title="Price Trends Over Time"
                            subtitle={`Price trends for ${selectedPeriod}`}
                            height={400}
                            showTrend={true}
                          />
                        </div>
                      ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                          <div className="flex flex-col items-center justify-center h-[400px] bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            <DollarSign className="h-12 w-12 text-gray-400 mb-4" />
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">No Price Data Available</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">Price data will appear here once available</p>
                            <a
                              href="/app/prices"
                              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1"
                            >
                              View Price Tracking <ArrowRight className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedTab === 'suppliers' && (
                    <div className="space-y-6">
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          Supplier Analytics
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Supplier performance, ratings, and engagement metrics
                        </p>
                      </div>

                      {/* Supplier Metrics */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Suppliers</h4>
                            <Users className="h-5 w-5 text-primary-600" />
                          </div>
                          <div className="text-3xl font-bold text-gray-900 dark:text-white">
                            {data.activeSuppliers}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            {data.supplierGrowth > 0 ? `+${data.supplierGrowth.toFixed(1)}%` : `${data.supplierGrowth.toFixed(1)}%`} vs previous period
                          </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Top Performers</h4>
                            <Target className="h-5 w-5 text-primary-600" />
                          </div>
                          <div className="text-3xl font-bold text-gray-900 dark:text-white">
                            {data.supplierPerformance.length}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Suppliers with highest ratings</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Rating</h4>
                            <BarChart3 className="h-5 w-5 text-primary-600" />
                          </div>
                          <div className="text-3xl font-bold text-gray-900 dark:text-white">
                            {data.supplierPerformance.length > 0 
                              ? (data.supplierPerformance.reduce((sum: number, s: any) => sum + (s.rating || 0), 0) / data.supplierPerformance.length).toFixed(1)
                              : '0.0'}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Out of 5.0</p>
                        </div>
                      </div>

                      {/* Supplier Performance Chart */}
                      {data.supplierPerformance.length > 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                          <EnhancedChart
                            data={data.supplierPerformance}
                            config={supplierChartConfig}
                            type="bar"
                            title="Top Supplier Performance"
                            subtitle="Supplier activity and ratings"
                            height={400}
                          />
                        </div>
                      ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                          <div className="flex flex-col items-center justify-center h-[400px] bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            <Users className="h-12 w-12 text-gray-400 mb-4" />
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">No Supplier Data Available</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">Supplier performance data will appear here once available</p>
                            <a
                              href="/app/supplier-directory"
                              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1"
                            >
                              View Supplier Directory <ArrowRight className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedTab === 'logistics' && (
                    <div className="space-y-6">
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          Logistics Analytics
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Shipment tracking, delivery performance, and logistics metrics
                        </p>
                      </div>

                      {/* Logistics Metrics */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Shipments</h4>
                            <Package className="h-5 w-5 text-primary-600" />
                          </div>
                          <div className="text-3xl font-bold text-gray-900 dark:text-white">
                            {data.totalOrders}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            {data.orderGrowth > 0 ? `+${data.orderGrowth.toFixed(1)}%` : `${data.orderGrowth.toFixed(1)}%`} vs previous period
                          </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">In Transit</h4>
                            <Activity className="h-5 w-5 text-primary-600" />
                          </div>
                          <div className="text-3xl font-bold text-gray-900 dark:text-white">
                            {Math.floor(data.totalOrders * 0.3)}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Estimated active shipments</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Delivery Rate</h4>
                            <Target className="h-5 w-5 text-primary-600" />
                          </div>
                          <div className="text-3xl font-bold text-gray-900 dark:text-white">
                            95%
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">On-time delivery</p>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex flex-col items-center justify-center h-[400px] bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                          <Package className="h-12 w-12 text-gray-400 mb-4" />
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Logistics Analytics Coming Soon</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">Detailed logistics analytics will be available here</p>
                          <a
                            href="/app/logistics"
                            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1"
                          >
                            View Logistics <ArrowRight className="h-4 w-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedTab === 'risk' && (
                    <div className="space-y-6">
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          Risk Analytics
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Risk alerts, compliance status, and risk mitigation metrics
                        </p>
                      </div>

                      {/* Risk Metrics */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Alerts</h4>
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                          </div>
                          <div className="text-3xl font-bold text-gray-900 dark:text-white">
                            N/A
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Risk alerts from Risk page</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Compliance Score</h4>
                            <Target className="h-5 w-5 text-primary-600" />
                          </div>
                          <div className="text-3xl font-bold text-gray-900 dark:text-white">
                            N/A
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Overall compliance rating</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Risk Level</h4>
                            <Activity className="h-5 w-5 text-primary-600" />
                          </div>
                          <div className="text-3xl font-bold text-gray-900 dark:text-white">
                            Medium
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Current risk assessment</p>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex flex-col items-center justify-center h-[400px] bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                          <AlertTriangle className="h-12 w-12 text-gray-400 mb-4" />
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Risk Analytics Coming Soon</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">Detailed risk analytics will be available here</p>
                          <a
                            href="/app/risk"
                            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1"
                          >
                            View Risk Management <ArrowRight className="h-4 w-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedTab === 'documents' && (
                    <div className="space-y-6">
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          Document Analytics
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Document storage, usage, and management metrics
                        </p>
                      </div>

                      {/* Document Metrics */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Documents</h4>
                            <FileText className="h-5 w-5 text-primary-600" />
                          </div>
                          <div className="text-3xl font-bold text-gray-900 dark:text-white">
                            N/A
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Stored documents</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Storage Used</h4>
                            <Package className="h-5 w-5 text-primary-600" />
                          </div>
                          <div className="text-3xl font-bold text-gray-900 dark:text-white">
                            N/A
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Total storage space</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Expiring Soon</h4>
                            <AlertTriangle className="h-5 w-5 text-yellow-600" />
                          </div>
                          <div className="text-3xl font-bold text-gray-900 dark:text-white">
                            N/A
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Documents expiring in 30 days</p>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex flex-col items-center justify-center h-[400px] bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                          <FileText className="h-12 w-12 text-gray-400 mb-4" />
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Document Analytics Coming Soon</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">Detailed document analytics will be available here</p>
                          <a
                            href="/app/documents"
                            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1"
                          >
                            View Document Vault <ArrowRight className="h-4 w-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
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
