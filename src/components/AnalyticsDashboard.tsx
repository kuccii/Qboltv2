// Advanced analytics dashboard with comprehensive metrics
import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Activity, 
  Users, 
  Package, 
  DollarSign,
  Calendar,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import EnhancedChart, { ChartTypeSelector } from './EnhancedChart';
import { usePWA } from '../utils/pwa';

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
    cement: number;
    steel: number;
    timber: number;
    sand: number;
  }>;
  supplierPerformance: Array<{
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
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedChartType, setSelectedChartType] = useState<'line' | 'bar' | 'area'>('line');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock analytics data - in real app, this would come from API
  const analyticsData: AnalyticsData = useMemo(() => ({
    totalRevenue: 2450000,
    revenueGrowth: 12.5,
    totalOrders: 1847,
    orderGrowth: 8.3,
    activeSuppliers: 156,
    supplierGrowth: 15.2,
    avgOrderValue: 1326,
    orderValueGrowth: 4.1,
    priceTrends: [
      { date: '2024-01-01', cement: 750, steel: 45000, timber: 1200, sand: 150 },
      { date: '2024-01-08', cement: 780, steel: 46000, timber: 1250, sand: 155 },
      { date: '2024-01-15', cement: 760, steel: 45500, timber: 1230, sand: 152 },
      { date: '2024-01-22', cement: 790, steel: 47000, timber: 1280, sand: 158 },
      { date: '2024-01-29', cement: 800, steel: 47500, timber: 1300, sand: 160 },
    ],
    supplierPerformance: [
      { name: 'ABC Construction', orders: 245, revenue: 325000, rating: 4.8 },
      { name: 'XYZ Materials', orders: 189, revenue: 289000, rating: 4.6 },
      { name: 'BuildCorp Ltd', orders: 156, revenue: 234000, rating: 4.4 },
      { name: 'SteelWorks Inc', orders: 134, revenue: 198000, rating: 4.2 },
      { name: 'Timber Solutions', orders: 98, revenue: 156000, rating: 4.0 },
    ],
    marketShare: [
      { category: 'Construction Materials', value: 45, color: '#3B82F6' },
      { category: 'Agricultural Supplies', value: 30, color: '#10B981' },
      { category: 'Logistics Services', value: 15, color: '#F59E0B' },
      { category: 'Financial Services', value: 10, color: '#EF4444' },
    ],
    regionalData: [
      { region: 'Nairobi', orders: 892, revenue: 1180000, growth: 15.2 },
      { region: 'Kampala', orders: 456, revenue: 604000, growth: 8.7 },
      { region: 'Kigali', orders: 234, revenue: 310000, growth: 12.1 },
      { region: 'Dar es Salaam', orders: 189, revenue: 250000, growth: 6.3 },
      { region: 'Other', orders: 76, revenue: 100000, growth: 4.1 },
    ],
  }), [selectedPeriod]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRefreshing(false);
  };

  const handleExport = () => {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive insights into your supply chain performance
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Period Selector */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || !isOnline}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
          </button>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Download size={20} />
            Export
          </button>
        </div>
      </div>

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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={analyticsData.totalRevenue}
          growth={analyticsData.revenueGrowth}
          icon={DollarSign}
          format="currency"
        />
        <MetricCard
          title="Total Orders"
          value={analyticsData.totalOrders}
          growth={analyticsData.orderGrowth}
          icon={Package}
          format="number"
        />
        <MetricCard
          title="Active Suppliers"
          value={analyticsData.activeSuppliers}
          growth={analyticsData.supplierGrowth}
          icon={Users}
          format="number"
        />
        <MetricCard
          title="Avg Order Value"
          value={analyticsData.avgOrderValue}
          growth={analyticsData.orderValueGrowth}
          icon={BarChart3}
          format="currency"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price Trends Chart */}
        <EnhancedChart
          data={analyticsData.priceTrends}
          config={priceChartConfig}
          type={selectedChartType}
          title="Price Trends"
          subtitle="Material prices over time"
          height={400}
          showTrend={true}
        />

        {/* Market Share Chart */}
        <EnhancedChart
          data={analyticsData.marketShare}
          config={[]}
          type="pie"
          title="Market Share"
          subtitle="Distribution by category"
          height={400}
        />
      </div>

      {/* Supplier Performance */}
      <EnhancedChart
        data={analyticsData.supplierPerformance}
        config={supplierChartConfig}
        type="bar"
        title="Supplier Performance"
        subtitle="Top performing suppliers by orders and revenue"
        height={400}
      />

      {/* Regional Analysis */}
      <EnhancedChart
        data={analyticsData.regionalData}
        config={regionalChartConfig}
        type="bar"
        title="Regional Analysis"
        subtitle="Performance by region"
        height={400}
      />

      {/* Chart Type Selector */}
      <div className="flex justify-center">
        <ChartTypeSelector
          selectedType={selectedChartType}
          onTypeChange={setSelectedChartType}
        />
      </div>
    </div>
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
          <span>{Math.abs(growth)}%</span>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          vs previous period
        </span>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

