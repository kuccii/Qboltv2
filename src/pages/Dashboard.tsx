import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  BarChart3, 
  Activity, 
  ShoppingCart, 
  AlertTriangle,
  Clock,
  Download,
  RefreshCw,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Bell,
  MapPin,
  Calendar,
  Shield,
  Briefcase,
  Wifi,
  WifiOff,
  Package
} from 'lucide-react';
import { useIndustry } from '../contexts/IndustryContext';
import { useExport } from '../hooks/useExport';
import { useNotifications } from '../hooks/useNotifications';
import { useDashboard, usePrices, useSuppliers, useShipments, useRiskAlerts } from '../hooks/useData';
import { useAuth } from '../contexts/AuthContext';
import IndustryDashboard from '../components/IndustryDashboard';
import PriceChart from '../components/PriceChart';
import StatusBadge from '../components/StatusBadge';
import OnboardingTour from '../components/OnboardingTour';
import { getDashboardTourSteps } from '../components/OnboardingTour';
import { 
  priceData, 
  agriculturePriceData, 
  dashboardMetrics, 
  priceChanges,
  industryDescriptions,
  supplierData,
  recentActivity,
  tradeOpportunities
} from '../data/mockData';
import { 
  AppLayout,
  PageLayout,
  SectionLayout,
  SelectInput,
  RailLayout
} from '../design-system';

const Dashboard: React.FC = () => {
  const { currentIndustry, getIndustryTerm } = useIndustry();
  const { authState } = useAuth();
  
  // Real-time data hooks
  const { metrics: dashboardMetricsData, loading: metricsLoading, refetch: refetchMetrics } = useDashboard();
  const { prices: realPrices, loading: pricesLoading, isConnected: pricesConnected, refetch: refetchPrices } = usePrices({
    country: authState.user?.country,
    limit: 10,
  });
  const { suppliers: realSuppliers, loading: suppliersLoading, isConnected: suppliersConnected, refetch: refetchSuppliers } = useSuppliers({
    country: authState.user?.country,
    industry: authState.user?.industry || currentIndustry,
    limit: 10,
  });
  const { shipments: realShipments, loading: shipmentsLoading, isConnected: shipmentsConnected } = useShipments({ limit: 5 });
  const { alerts: realAlerts, loading: alertsLoading } = useRiskAlerts({ resolved: false });
  
  // State management
  const [selectedTab, setSelectedTab] = useState<'overview' | 'insights' | 'alerts'>('overview');
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  // New hooks for enhanced functionality
  const { exportData } = useExport();
  const { notifications, addNotification, markAsRead } = useNotifications();
  // Auto-dismiss dashboard notifications shown in the corner - only unread ones
  useEffect(() => {
    const unreadNotifications = notifications.filter(n => !n.read);
    if (!unreadNotifications || unreadNotifications.length === 0) return;
    const timers = unreadNotifications.slice(0, 3).map(n => setTimeout(() => {
      markAsRead(n.id);
    }, 5000)); // Auto-dismiss after 5 seconds
    return () => { timers.forEach(t => clearTimeout(t)); };
  }, [notifications, markAsRead]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // Check if real-time is connected
  const isRealTimeConnected = pricesConnected || suppliersConnected || shipmentsConnected;
  
  // URL synchronization
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab') as 'overview' | 'insights' | 'alerts';
    const countries = params.get('countries')?.split(',') || [];
    const range = params.get('range') as '7d' | '30d' | '90d' | '1y' || '30d';
    
    if (tab) setSelectedTab(tab);
    if (countries.length > 0) setSelectedCountries(countries);
    if (range) setTimeRange(range);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedTab !== 'overview') params.set('tab', selectedTab);
    if (selectedCountries.length > 0) params.set('countries', selectedCountries.join(','));
    if (timeRange !== '30d') params.set('range', timeRange);
    
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState({}, '', newUrl);
  }, [selectedTab, selectedCountries, timeRange]);

  // Data preparation - Use real data if available, fallback to mock data
  const metrics = dashboardMetricsData?.metrics || dashboardMetrics[currentIndustry];
  const description = industryDescriptions[currentIndustry];
  const priceChangeData = priceChanges[currentIndustry];
  const priceChartData = currentIndustry === 'construction' ? priceData : agriculturePriceData;
  
  // Use real data when available
  // Using runtime hooks and mock fallbacks directly below
  
  // Loading state
  const isLoading = metricsLoading || pricesLoading || suppliersLoading || shipmentsLoading || alertsLoading;
  
  // Prepare chart data based on industry
  const dataKeys = currentIndustry === 'construction' 
    ? [
        { key: 'cement', color: '#1E3A8A', name: `Cement (${(metrics.unitLabels as any).cement})` },
        { key: 'steel', color: '#374151', name: `Steel (${(metrics.unitLabels as any).steel})` },
        { key: 'timber', color: '#047857', name: `Timber (${(metrics.unitLabels as any).timber})` },
        { key: 'sand', color: '#B45309', name: `Sand (${(metrics.unitLabels as any).sand})` }
      ]
    : [
        { key: 'fertilizer', color: '#166534', name: `Fertilizer (${(metrics.unitLabels as any).fertilizer})` },
        { key: 'seeds', color: '#B45309', name: `Seeds (${(metrics.unitLabels as any).seeds})` },
        { key: 'pesticides', color: '#1E3A8A', name: `Pesticides (${(metrics.unitLabels as any).pesticides})` },
        { key: 'equipment', color: '#374151', name: `Equipment (${(metrics.unitLabels as any).equipment})` }
      ];

  // Computed data
  const countries = ['All Regions', 'Kenya', 'Uganda', 'Rwanda', 'Tanzania'];
  const filteredSuppliers = useMemo(() => {
    return supplierData.filter(supplier => {
      const matchesIndustry = supplier.industry === currentIndustry;
      const matchesCountry = selectedCountries.length === 0 || 
        selectedCountries.some(country => supplier.location.includes(country));
      return matchesIndustry && matchesCountry;
    });
  }, [currentIndustry, selectedCountries]);

  const topSuppliers = filteredSuppliers
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const recentActivities = recentActivity || [];

  // Format date helper
  const formatDate = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Enhanced functionality handlers
  const handleExport = async () => {
    try {
      const dataToExport = {
        metrics: metrics,
        suppliers: topSuppliers,
        priceChanges: priceChangeData,
        activities: recentActivities
      };
      
      await exportData([dataToExport], 'dashboard-report', {
        format: 'json',
        includeMetadata: true
      });
      
      addNotification({
        type: 'success',
        title: 'Export Complete',
        message: 'Dashboard data has been exported successfully'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Export Failed',
        message: 'Failed to export dashboard data'
      });
    }
  };

  const handleRefresh = async () => {
    try {
      // Refresh all real data
      await Promise.all([
        refetchMetrics(),
        refetchPrices(),
        refetchSuppliers(),
      ]);
      setLastUpdated(new Date());
      addNotification({
        type: 'success',
        title: 'Data Refreshed',
        message: 'Dashboard data has been updated'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Refresh Failed',
        message: 'Failed to refresh dashboard data'
      });
    } finally {
    }
  };

  const renderPriceChange = (name: string, value: number) => {
    const isPositive = value >= 0;
    return (
      <div className="flex items-center justify-between py-2">
        <span className="text-gray-700 dark:text-gray-300">{name}</span>
        <span className={`flex items-center ${isPositive ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
          {isPositive ? '+' : ''}{value}% 
          {isPositive 
            ? <ArrowUpRight size={16} className="ml-1" /> 
            : <ArrowDownRight size={16} className="ml-1" />}
        </span>
      </div>
    );
  };

  return (
    <AppLayout>
      {/* New compact header strip */}
      <div className="px-6 pt-5">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 rounded-xl p-4 md:p-5 shadow-lg border border-blue-500 dark:border-blue-600">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white">{description.title}</h1>
              <p className="text-sm text-blue-100 dark:text-blue-200 mt-1">{description.subtitle}</p>
            </div>
            <div className="flex items-center gap-2 md:gap-3 flex-wrap">
              {authState.user?.country && (
                <div className="text-xs px-3 py-1.5 rounded-lg border border-white/30 dark:border-white/20 bg-white/20 dark:bg-white/10 text-white font-medium">
                  <span className="mr-1">Country:</span>
                  <span className="font-bold">{authState.user.country}</span>
                </div>
              )}
              {isRealTimeConnected ? (
                <div className="flex items-center gap-1 text-xs text-green-800 border-green-300 bg-green-50 dark:text-green-200 dark:border-green-400 dark:bg-green-900/30 px-3 py-1.5 rounded-lg border font-medium">
                  <Wifi size={12} />
                  <span>Live</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs text-gray-700 border-gray-300 bg-gray-50 dark:text-gray-300 dark:border-gray-400 dark:bg-gray-800/50 px-3 py-1.5 rounded-lg border font-medium">
                  <WifiOff size={12} />
                  <span>Offline</span>
                </div>
              )}
              <div className="text-xs text-white/90 dark:text-white/80 flex items-center px-3 py-1.5 rounded-lg bg-white/10 dark:bg-white/5 border border-white/20">
                <Clock size={14} className="mr-1" />
                Updated: {formatDate(lastUpdated)}
              </div>
              {Array.isArray(realSuppliers) && realSuppliers.length > 0 && (
                <div className="text-xs px-3 py-1.5 rounded-lg border border-white/30 dark:border-white/20 bg-white/20 dark:bg-white/10 text-white font-medium">
                  Suppliers: <span className="font-bold ml-1">{realSuppliers.length}</span>
                </div>
              )}
              {Array.isArray(realPrices) && realPrices.length > 0 && (
                <div className="text-xs px-3 py-1.5 rounded-lg border border-white/30 dark:border-white/20 bg-white/20 dark:bg-white/10 text-white font-medium">
                  Prices: <span className="font-bold ml-1">{realPrices.length}</span>
                </div>
              )}
              {Array.isArray(realAlerts) && realAlerts.length > 0 && (
                <div className="text-xs px-3 py-1.5 rounded-lg border border-white/30 dark:border-white/20 bg-white/20 dark:bg-white/10 text-white font-medium">
                  Alerts: <span className="font-bold ml-1">{realAlerts.length}</span>
                </div>
              )}
              {Array.isArray(realShipments) && realShipments.length > 0 && (
                <div className="text-xs px-3 py-1.5 rounded-lg border border-white/30 dark:border-white/20 bg-white/20 dark:bg-white/10 text-white font-medium">
                  Shipments: <span className="font-bold ml-1">{realShipments.length}</span>
                </div>
              )}
              <button
                onClick={handleRefresh}
                className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <RefreshCw className="h-4 w-4" /> Refresh
              </button>
              <button
                onClick={handleExport}
                className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Download className="h-4 w-4" /> Export
              </button>
              <button
                onClick={() => setShowOnboarding(true)}
                className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" /> Tour
              </button>
            </div>
          </div>
        </div>
      </div>

      <PageLayout maxWidth="full" padding="none">
        <RailLayout
          right={
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Quick Filters</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time Range</label>
                    <SelectInput
                      value={timeRange}
                      onChange={(value: string) => setTimeRange(value as any)}
                      options={[
                        { value: '7d', label: 'Last 7 days' },
                        { value: '30d', label: 'Last 30 days' },
                        { value: '90d', label: 'Last 90 days' },
                        { value: '1y', label: 'Last year' }
                      ]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Countries</label>
                    <div className="space-y-2">
                      {countries.slice(1).map(country => (
                        <label key={country} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedCountries.includes(country)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCountries([...selectedCountries, country]);
                              } else {
                                setSelectedCountries(selectedCountries.filter(c => c !== country));
                              }
                            }}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-400">{country}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Top Suppliers</h3>
                <div className="space-y-3">
                  {topSuppliers.length === 0 && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">No suppliers to show.</div>
                  )}
                  {topSuppliers.map((supplier) => (
                    <div key={supplier.id} className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{supplier.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{supplier.location}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-800 dark:text-gray-200">{supplier.score}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Score</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {recentActivities.slice(0, 5).map((activity: any, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="mt-1">
                        {activity.type === 'price_update' && <TrendingUp size={14} className="text-blue-500" />}
                        {activity.type === 'supplier_added' && <Users size={14} className="text-green-500" />}
                        {activity.type === 'alert' && <Bell size={14} className="text-orange-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-800 dark:text-gray-200">{activity.message}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          }
        >
          <div className="px-6 py-6 space-y-6">
            {/* Tab Navigation */}
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-fit">
              <button 
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedTab === 'overview' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-200'}`}
                onClick={() => setSelectedTab('overview')}
              >
                Overview
              </button>
              <button 
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedTab === 'insights' 
                  ? 'bg-purple-600 text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-200'}`}
                onClick={() => setSelectedTab('insights')}
              >
                Insights
              </button>
              <button 
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedTab === 'alerts' 
                  ? 'bg-red-600 text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-200'}`}
                onClick={() => setSelectedTab('alerts')}
              >
                Alerts
              </button>
            </div>
            {/* Tab Content */}
            {selectedTab === 'overview' && (
              <>
                {/* Industry-specific dashboard */}
                <IndustryDashboard />
                
                {/* KPI Cards */}
                <SectionLayout title="Key Performance Indicators" subtitle={`Real-time metrics for your ${getIndustryTerm('materials')} supply chain`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg shadow-sm border-2 border-blue-200 dark:border-blue-700 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">{description.metrics.transactions}</h3>
                        <ShoppingCart size={20} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{metrics.totalTransactions}</div>
                      <div className="mt-1 text-sm text-blue-700 dark:text-blue-300">Last 30 days</div>
                      <div className="flex items-center mt-2 text-sm text-green-600 dark:text-green-400">
                        <TrendingUp size={16} className="mr-1" />
                        +12% from last month
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg shadow-sm border-2 border-green-200 dark:border-green-700 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-green-800 dark:text-green-200">{description.metrics.orders}</h3>
                        <DollarSign size={20} className="text-green-600 dark:text-green-400" />
                      </div>
                      <div className="text-3xl font-bold text-green-900 dark:text-green-100">${metrics.averageOrderValue}</div>
                      <div className="mt-1 text-sm text-green-700 dark:text-green-300">Average value</div>
                      <div className="flex items-center mt-2 text-sm text-red-600 dark:text-red-400">
                        <TrendingDown size={16} className="mr-1" />
                        -3% from last month
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg shadow-sm border-2 border-purple-200 dark:border-purple-700 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-purple-800 dark:text-purple-200">{description.metrics.suppliers}</h3>
                        <Users size={20} className="text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">{metrics.activeSuppliersCount}</div>
                      <div className="mt-1 text-sm text-purple-700 dark:text-purple-300">Active network</div>
                      <div className="flex items-center mt-2 text-sm text-green-600 dark:text-green-400">
                        <TrendingUp size={16} className="mr-1" />
                        +5 new this month
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg shadow-sm border-2 border-orange-200 dark:border-orange-700 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-orange-800 dark:text-orange-200">{description.metrics.volatility}</h3>
                        <Activity size={20} className="text-orange-600 dark:text-orange-400" />
                      </div>
                      <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">{metrics.priceVolatility}%</div>
                      <div className="mt-1 text-sm text-orange-700 dark:text-orange-300">30-day average</div>
                      <div className="flex items-center mt-2 text-sm text-orange-600 dark:text-orange-400">
                        <AlertTriangle size={16} className="mr-1" />
                        High volatility
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 rounded-lg shadow-sm border-2 border-cyan-200 dark:border-cyan-700 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-cyan-800 dark:text-cyan-200">Active Shipments</h3>
                        <Package size={20} className="text-cyan-600 dark:text-cyan-400" />
                      </div>
                      <div className="text-3xl font-bold text-cyan-900 dark:text-cyan-100">{realShipments?.length || 0}</div>
                      <div className="mt-1 text-sm text-cyan-700 dark:text-cyan-300">In transit</div>
                      <div className="flex items-center mt-2 text-sm text-green-600 dark:text-green-400">
                        <TrendingUp size={16} className="mr-1" />
                        On track
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-800/20 rounded-lg shadow-sm border-2 border-rose-200 dark:border-rose-700 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-rose-800 dark:text-rose-200">Risk Alerts</h3>
                        <AlertTriangle size={20} className="text-rose-600 dark:text-rose-400" />
                      </div>
                      <div className="text-3xl font-bold text-rose-900 dark:text-rose-100">{Array.isArray(realAlerts) ? realAlerts.length : 0}</div>
                      <div className="mt-1 text-sm text-rose-700 dark:text-rose-300">Active alerts</div>
                      <div className="flex items-center mt-2 text-sm text-red-600 dark:text-red-400">
                        <AlertTriangle size={16} className="mr-1" />
                        {Array.isArray(realAlerts) && realAlerts.length > 0 ? 'Action needed' : 'All clear'}
                      </div>
                    </div>
                  </div>
                </SectionLayout>

                {/* Price Trends and Changes */}
                <SectionLayout title="Market Analysis" subtitle="Price trends and market movements">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-lg shadow-sm border-2 border-indigo-200 dark:border-indigo-700 p-6 lg:col-span-2">
                      <div className="flex items-center gap-2 mb-4">
                        <BarChart3 size={20} className="text-indigo-600 dark:text-indigo-400" />
                        <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100">Price Trends</h3>
                      </div>
                      {isLoading ? (
                        <div className="h-[300px] animate-pulse bg-indigo-50 dark:bg-indigo-900/20 rounded" />
                      ) : (
                        <PriceChart 
                          data={priceChartData} 
                          dataKeys={dataKeys} 
                          height={300}
                        />
                      )}
                    </div>
                    
                    <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-lg shadow-sm border-2 border-pink-200 dark:border-pink-700 p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <TrendingUp size={20} className="text-pink-600 dark:text-pink-400" />
                        <h3 className="text-lg font-semibold text-pink-900 dark:text-pink-100">Price Changes</h3>
                      </div>
                      <div className="space-y-1 mt-2">
                        {Object.entries(priceChangeData).map(([key, value]) => (
                          <div key={`price-change-${key}`}>
                            {renderPriceChange(key.charAt(0).toUpperCase() + key.slice(1), value as number)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </SectionLayout>

                {/* Supply Alerts */}
                <SectionLayout title="Supply Alerts" subtitle="Critical supply chain notifications">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertTriangle size={20} className="text-gray-400" />
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Active Alerts</h3>
                    </div>
                    <div className="space-y-4 mt-2">
                      {metrics.materialShortages.map((shortage: any, index: number) => (
                        <div key={`shortage-${index}-${shortage.material || shortage.id || index}`} className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="mt-0.5">
                            <AlertTriangle 
                              size={18} 
                              className={shortage.severity === 'high' 
                                ? 'text-red-500' 
                                : shortage.severity === 'medium' 
                                  ? 'text-orange-500' 
                                  : 'text-gray-400'
                              } 
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-gray-800 dark:text-gray-200">{shortage.material} Shortage</h4>
                              <StatusBadge 
                                type={shortage.severity === 'high' 
                                  ? 'error' 
                                  : shortage.severity === 'medium' 
                                    ? 'warning' 
                                    : 'info'
                                } 
                                text={shortage.severity.toUpperCase()} 
                              />
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Region: {shortage.region}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                              {shortage.severity === 'high' 
                                ? 'Critical shortage affecting prices and availability.' 
                                : shortage.severity === 'medium' 
                                  ? 'Moderate supply constraints expected.' 
                                  : 'Minor supply issues reported.'
                              }
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </SectionLayout>

                {/* Trade Opportunities */}
                <SectionLayout title="Trade Opportunities" subtitle="Verified projects and demand opportunities">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Briefcase size={20} className="text-gray-400" />
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Active Opportunities</h3>
                      </div>
                      <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        View All
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {tradeOpportunities[currentIndustry].slice(0, 3).map((opportunity) => (
                        <div key={opportunity.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">{opportunity.title}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{opportunity.description}</p>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <MapPin size={12} />
                                  {opportunity.location}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar size={12} />
                                  Due: {opportunity.deadline.toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Briefcase size={12} />
                                  {opportunity.buyer}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                ${(opportunity.value / 1000000).toFixed(1)}M
                              </div>
                              <div className="text-xs text-gray-500">{opportunity.currency}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="flex flex-wrap gap-1">
                                {opportunity.materials.map((material, index) => (
                                  <span 
                                    key={`material-${index}-${material}`}
                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                                  >
                                    {material}
                                  </span>
                                ))}
                              </div>
                              {opportunity.insuranceRequired && (
                                <div className="flex items-center gap-1 text-xs text-blue-600">
                                  <Shield size={12} />
                                  Insurance Required
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <StatusBadge 
                                type={opportunity.riskLevel === 'low' ? 'success' : opportunity.riskLevel === 'medium' ? 'warning' : 'error'} 
                                text={opportunity.riskLevel.toUpperCase()} 
                              />
                              <button className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100">
                                Apply
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </SectionLayout>
              </>
            )}

            {selectedTab === 'insights' && (
              <div className="space-y-6">
                <SectionLayout title="Market Insights" subtitle="Strategic analysis and recommendations">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg shadow-sm border-2 border-blue-200 dark:border-blue-700 p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <BarChart3 size={20} className="text-blue-600 dark:text-blue-400" />
                        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Key Takeaways</h3>
                      </div>
                      <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                        <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Market Analysis</h3>
                        <ul className="space-y-2 text-blue-800 dark:text-blue-200">
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span>{currentIndustry === 'construction' 
                              ? 'Cement prices continue to rise due to increased demand in urban construction projects across Kenya.'
                              : 'Fertilizer prices are stabilizing after recent supply chain disruptions from global markets.'
                            }</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span>{currentIndustry === 'construction' 
                              ? 'Steel suppliers are offering bulk discounts to counter recent price increases.'
                              : 'Seed prices remain volatile due to seasonal demand fluctuations and import constraints.'
                            }</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span>{currentIndustry === 'construction' 
                              ? 'New regulations on imported materials expected to impact supply chain in Q4 2023.'
                              : 'New governmental subsidies for small-scale farmers announced in Rwanda and Uganda.'
                            }</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg shadow-sm border-2 border-purple-200 dark:border-purple-700 p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <TrendingUp size={20} className="text-purple-600 dark:text-purple-400" />
                        <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">Growth Opportunities</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-800">
                          <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-1">Market Expansion</h4>
                          <p className="text-sm text-purple-800 dark:text-purple-200">
                            {currentIndustry === 'construction' 
                              ? 'Growing demand in Tanzania and Uganda presents expansion opportunities.'
                              : 'Export potential for organic fertilizers to neighboring countries.'
                            }
                          </p>
                        </div>
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-800">
                          <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-1">Cost Optimization</h4>
                          <p className="text-sm text-purple-800 dark:text-purple-200">
                            {currentIndustry === 'construction' 
                              ? 'Bulk purchasing can reduce material costs by up to 15%.'
                              : 'Direct sourcing from producers can cut input costs by 20%.'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-4">Recommended Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border-2 border-green-200 dark:border-green-700 p-4 hover:shadow-md transition-shadow">
                        <h4 className="font-medium text-green-900 dark:text-green-100 mb-1">Procurement Strategy</h4>
                        <p className="text-sm text-green-800 dark:text-green-200">
                          {currentIndustry === 'construction' 
                            ? 'Consider locking in cement prices with suppliers showing stable supply chains.' 
                            : 'Secure fertilizer stocks ahead of the growing season to avoid seasonal price increases.'
                          }
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-lg border-2 border-amber-200 dark:border-amber-700 p-4 hover:shadow-md transition-shadow">
                        <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-1">Supplier Relationships</h4>
                        <p className="text-sm text-amber-800 dark:text-amber-200">
                          {currentIndustry === 'construction' 
                            ? 'Diversify steel suppliers to mitigate risk from volatile market conditions.' 
                            : 'Explore partnerships with local seed producers to reduce import dependency.'
                          }
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 rounded-lg border-2 border-teal-200 dark:border-teal-700 p-4 hover:shadow-md transition-shadow">
                        <h4 className="font-medium text-teal-900 dark:text-teal-100 mb-1">Risk Management</h4>
                        <p className="text-sm text-teal-800 dark:text-teal-200">
                          {currentIndustry === 'construction' 
                            ? 'Implement price hedging strategies for volatile materials.' 
                            : 'Establish backup suppliers for critical inputs during peak seasons.'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </SectionLayout>

                <SectionLayout title="Performance Metrics" subtitle="Detailed performance analysis">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-lg shadow-sm border-2 border-emerald-200 dark:border-emerald-700 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-emerald-800 dark:text-emerald-200">Efficiency Score</h3>
                        <Activity size={20} className="text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">87%</div>
                      <div className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">Above average</div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-900/20 dark:to-violet-800/20 rounded-lg shadow-sm border-2 border-violet-200 dark:border-violet-700 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-violet-800 dark:text-violet-200">Cost Savings</h3>
                        <DollarSign size={20} className="text-violet-600 dark:text-violet-400" />
                      </div>
                      <div className="text-3xl font-bold text-violet-900 dark:text-violet-100">12%</div>
                      <div className="mt-1 text-sm text-violet-700 dark:text-violet-300">vs last quarter</div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-sky-50 to-sky-100 dark:from-sky-900/20 dark:to-sky-800/20 rounded-lg shadow-sm border-2 border-sky-200 dark:border-sky-700 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-sky-800 dark:text-sky-200">Market Share</h3>
                        <BarChart3 size={20} className="text-sky-600 dark:text-sky-400" />
                      </div>
                      <div className="text-3xl font-bold text-sky-900 dark:text-sky-100">24%</div>
                      <div className="mt-1 text-sm text-sky-700 dark:text-sky-300">Regional market</div>
                    </div>
                  </div>
                </SectionLayout>
              </div>
            )}

            {selectedTab === 'alerts' && (
              <div className="space-y-6">
                <SectionLayout title="Alert Center" subtitle="Manage your supply chain notifications">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg shadow-sm border-2 border-orange-200 dark:border-orange-700 p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Bell size={20} className="text-orange-600 dark:text-orange-400" />
                        <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">Price Alerts</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg border border-orange-300 dark:border-orange-800">
                          <div className="flex items-center gap-3">
                            <AlertCircle size={20} className="text-orange-600" />
                            <div>
                              <h4 className="font-medium text-orange-900 dark:text-orange-100">Cement Price Surge</h4>
                              <p className="text-sm text-orange-800 dark:text-orange-200">Prices increased 5.2% in the last 24 hours</p>
                            </div>
                          </div>
                          <StatusBadge type="warning" text="ACTIVE" />
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-red-100 dark:bg-red-900/30 rounded-lg border border-red-300 dark:border-red-800">
                          <div className="flex items-center gap-3">
                            <AlertTriangle size={20} className="text-red-600" />
                            <div>
                              <h4 className="font-medium text-red-900 dark:text-red-100">Supply Disruption</h4>
                              <p className="text-sm text-red-800 dark:text-red-200">Steel delivery delayed by 3 days</p>
                            </div>
                          </div>
                          <StatusBadge type="error" text="CRITICAL" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg shadow-sm border-2 border-yellow-200 dark:border-yellow-700 p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle size={20} className="text-yellow-600 dark:text-yellow-400" />
                        <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100">Risk Assessment</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg border border-yellow-300 dark:border-yellow-800">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-yellow-900 dark:text-yellow-100">Supply Disruption</span>
                            <StatusBadge type="warning" text="MEDIUM" />
                          </div>
                          <p className="text-xs text-yellow-800 dark:text-yellow-200">Monitor supplier performance closely</p>
                        </div>
                        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg border border-yellow-300 dark:border-yellow-800">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-yellow-900 dark:text-yellow-100">Price Volatility</span>
                            <StatusBadge 
                              type={metrics.priceVolatility > 10 ? "error" : "warning"} 
                              text={metrics.priceVolatility > 10 ? "HIGH" : "MEDIUM"} 
                            />
                          </div>
                          <p className="text-xs text-yellow-800 dark:text-yellow-200">Consider price hedging strategies</p>
                        </div>
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-300 dark:border-green-800">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-green-900 dark:text-green-100">Quality Consistency</span>
                            <StatusBadge type="success" text="LOW" />
                          </div>
                          <p className="text-xs text-green-800 dark:text-green-200">Quality monitoring active</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </SectionLayout>

                <SectionLayout title="Active Risk Alerts" subtitle="Real-time risk alerts from your supply chain">
                  <div className="space-y-4">
                    {Array.isArray(realAlerts) && realAlerts.length > 0 ? (
                      realAlerts.slice(0, 5).map((alert: any, index: number) => (
                        <div 
                          key={alert.id || `alert-${index}`}
                          className={`p-4 rounded-lg border-2 ${
                            alert.severity === 'high' 
                              ? 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-300 dark:border-red-700'
                              : alert.severity === 'medium'
                                ? 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-300 dark:border-orange-700'
                                : 'bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-300 dark:border-yellow-700'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <AlertTriangle 
                                size={20} 
                                className={
                                  alert.severity === 'high' 
                                    ? 'text-red-600 dark:text-red-400 mt-0.5'
                                    : alert.severity === 'medium'
                                      ? 'text-orange-600 dark:text-orange-400 mt-0.5'
                                      : 'text-yellow-600 dark:text-yellow-400 mt-0.5'
                                } 
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-gray-900 dark:text-white">
                                    {alert.title || alert.alert_type || 'Risk Alert'}
                                  </h4>
                                  <StatusBadge 
                                    type={alert.severity === 'high' ? 'error' : alert.severity === 'medium' ? 'warning' : 'info'}
                                    text={alert.severity?.toUpperCase() || 'ALERT'}
                                  />
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                                  {alert.message || alert.description || 'No description available'}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                                  {alert.region && (
                                    <div className="flex items-center gap-1">
                                      <MapPin size={12} />
                                      {alert.region}
                                    </div>
                                  )}
                                  {alert.material && (
                                    <div className="flex items-center gap-1">
                                      <Package size={12} />
                                      {alert.material}
                                    </div>
                                  )}
                                  {alert.created_at && (
                                    <div className="flex items-center gap-1">
                                      <Clock size={12} />
                                      {new Date(alert.created_at).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                // Handle alert resolution
                                console.log('Resolve alert:', alert.id);
                              }}
                              className="ml-4 px-3 py-1.5 text-xs font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"
                            >
                              Resolve
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border-2 border-green-200 dark:border-green-700 p-8 text-center">
                        <CheckCircle size={48} className="text-green-600 dark:text-green-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">All Clear!</h3>
                        <p className="text-sm text-green-800 dark:text-green-200">
                          No active risk alerts at this time. Your supply chain is operating normally.
                        </p>
                      </div>
                    )}
                  </div>
                </SectionLayout>

                <SectionLayout title="Mitigation Actions" subtitle="Recommended actions to address risks">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border-2 border-blue-200 dark:border-blue-700 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle size={18} className="text-blue-600 dark:text-blue-400" />
                        <h4 className="font-medium text-blue-900 dark:text-blue-100">Diversified Supplier Base</h4>
                      </div>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        Multiple suppliers reduce dependency risk
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-lg border-2 border-amber-200 dark:border-amber-700 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400" />
                        <h4 className="font-medium text-amber-900 dark:text-amber-100">Price Hedging Needed</h4>
                      </div>
                      <p className="text-sm text-amber-800 dark:text-amber-200">
                        Consider implementing price hedging strategies
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border-2 border-green-200 dark:border-green-700 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle size={18} className="text-green-600 dark:text-green-400" />
                        <h4 className="font-medium text-green-900 dark:text-green-100">Quality Monitoring Active</h4>
                      </div>
                      <p className="text-sm text-green-800 dark:text-green-200">
                        Quality assurance processes are in place
                      </p>
                    </div>
                  </div>
                </SectionLayout>
              </div>
            )}
          </div>
        </RailLayout>
      </PageLayout>

      {/* Enhanced Components */}
      {showOnboarding && (
        <OnboardingTour
          isOpen={showOnboarding}
          onClose={() => setShowOnboarding(false)}
          onComplete={() => setShowOnboarding(false)}
          steps={getDashboardTourSteps(currentIndustry)}
          industry={currentIndustry}
        />
      )}

      {/* Notifications Display - Only show unread notifications */}
      {notifications.filter(n => !n.read).length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-3">
          {notifications.filter(n => !n.read).slice(0, 3).map((notification) => {
            const kind = notification.type || 'info';
            const kindClasses = kind === 'success'
              ? 'border-green-200 dark:border-green-800/60 bg-green-50 dark:bg-green-900/20'
              : kind === 'error'
                ? 'border-red-200 dark:border-red-800/60 bg-red-50 dark:bg-red-900/20'
                : kind === 'warning'
                  ? 'border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-900/20'
                  : 'border-blue-200 dark:border-blue-800/60 bg-white dark:bg-gray-800';
            const Icon = kind === 'success' ? CheckCircle : kind === 'error' ? XCircle : kind === 'warning' ? AlertTriangle : Bell;
            return (
              <div
                key={notification.id}
                className={`border rounded-lg shadow-lg p-4 max-w-sm transform transition-all duration-200 animate-slide-in ${kindClasses}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-3">
                    <div className="flex items-center gap-2">
                      <Icon size={16} className={kind === 'success' ? 'text-green-600' : kind === 'error' ? 'text-red-600' : kind === 'warning' ? 'text-amber-600' : 'text-blue-600'} />
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                        {notification.title}
                      </h4>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                      {notification.message}
                    </p>
                  </div>
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XCircle size={16} />
                  </button>
                </div>
                {notification.action && (
                  <button
                    onClick={notification.action.onClick}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-300 hover:underline"
                  >
                    {notification.action.label}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
};

export default Dashboard;