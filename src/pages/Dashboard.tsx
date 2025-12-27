import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  Package,
  FileText,
  Wallet,
  Map,
  Search
} from 'lucide-react';
import { useIndustry } from '../contexts/IndustryContext';
import { useExport } from '../hooks/useExport';
import { useNotifications } from '../hooks/useNotifications';
import { useDashboard, usePrices, useSuppliers, useShipments, useRiskAlerts, useTradeOpportunities } from '../hooks/useData';
import { useAuth } from '../contexts/AuthContext';
import PriceChart from '../components/PriceChart';
import StatusBadge from '../components/StatusBadge';
import OnboardingTour from '../components/OnboardingTour';
import { getDashboardTourSteps } from '../components/OnboardingTour';
import { 
  dashboardMetrics, 
  industryDescriptions
} from '../data/mockData';
import { unifiedApi } from '../services/unifiedApi';
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
    industry: currentIndustry,
    limit: 10,
  });
  const { suppliers: realSuppliers, loading: suppliersLoading, isConnected: suppliersConnected, refetch: refetchSuppliers } = useSuppliers({
    country: authState.user?.country,
    industry: authState.user?.industry || currentIndustry,
    limit: 10,
  });
  const { shipments: realShipments, loading: shipmentsLoading, isConnected: shipmentsConnected } = useShipments({ limit: 5 });
  const { alerts: realAlerts, loading: alertsLoading } = useRiskAlerts({ resolved: false });
  const { opportunities: realOpportunities, loading: opportunitiesLoading } = useTradeOpportunities({ status: 'active', limit: 5 });
  
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

  // State for real data
  const [priceTrendsData, setPriceTrendsData] = useState<any[]>([]);
  const [priceTrendsLoading, setPriceTrendsLoading] = useState(false);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [priceChangeData, setPriceChangeData] = useState<Record<string, number>>({});
  
  // Fetch price trends from backend
  useEffect(() => {
    const fetchPriceTrends = async () => {
      try {
        setPriceTrendsLoading(true);
        const industryMaterials = currentIndustry === 'construction' 
          ? ['cement', 'steel', 'timber', 'sand']
          : ['fertilizer', 'seeds', 'pesticides', 'equipment'];
        
        const trends = await unifiedApi.analytics.getPriceTrends({
          period: '30d',
          country: authState.user?.country,
          materials: industryMaterials,
        });
        setPriceTrendsData(trends || []);
        
        // Calculate price changes from real data
        if (trends && trends.length > 0) {
          const changes: Record<string, number> = {};
          const latest = trends[trends.length - 1];
          const previous = trends[Math.max(0, trends.length - 7)]; // 7 days ago
          
          industryMaterials.forEach((material) => {
            if (latest[material] && previous?.[material]) {
              const change = ((latest[material] - previous[material]) / previous[material]) * 100;
              changes[material] = parseFloat(change.toFixed(2));
            } else {
              changes[material] = 0;
            }
          });
          setPriceChangeData(changes);
        }
      } catch (err) {
        console.error('Failed to fetch price trends:', err);
        setPriceTrendsData([]);
      } finally {
        setPriceTrendsLoading(false);
      }
    };
    
    if (authState.user) {
      fetchPriceTrends();
    }
  }, [currentIndustry, authState.user?.country]);
  
  // Fetch recent activities from backend
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setActivitiesLoading(true);
        const activities = await unifiedApi.user.getActivities(authState.user?.id, 10);
        setRecentActivities(activities || []);
      } catch (err) {
        console.error('Failed to fetch activities:', err);
        setRecentActivities([]);
      } finally {
        setActivitiesLoading(false);
      }
    };
    
    if (authState.user?.id) {
      fetchActivities();
    }
  }, [authState.user?.id]);
  
  // Data preparation - Use real data if available, fallback to mock data only for structure
  const metrics = dashboardMetricsData?.metrics || dashboardMetrics[currentIndustry];
  const description = industryDescriptions[currentIndustry];
  const priceChartData = priceTrendsData.length > 0 ? priceTrendsData : [];
  
  // Loading state
  const isLoading = metricsLoading || pricesLoading || suppliersLoading || shipmentsLoading || alertsLoading || priceTrendsLoading || activitiesLoading || opportunitiesLoading;
  
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

  // Computed data - Use real suppliers
  const countries = ['All Regions', 'Kenya', 'Uganda', 'Rwanda', 'Tanzania'];
  const filteredSuppliers = useMemo(() => {
    if (!Array.isArray(realSuppliers)) return [];
    return realSuppliers.filter(supplier => {
      const matchesIndustry = !supplier.industry || supplier.industry === currentIndustry;
      const matchesCountry = selectedCountries.length === 0 || 
        selectedCountries.some(country => (supplier.location || supplier.country || '').includes(country));
      return matchesIndustry && matchesCountry;
    });
  }, [realSuppliers, currentIndustry, selectedCountries]);

  const topSuppliers = filteredSuppliers
    .sort((a: any, b: any) => (b.rating || b.score || 0) - (a.rating || a.score || 0))
    .slice(0, 5);

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
      {/* Playful header strip */}
      <div className="px-3 sm:px-4 md:px-6 pt-4 sm:pt-5">
        <div className="bg-primary-800 dark:bg-primary-900 rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-white/20 dark:border-white/10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                <span>≡ƒÄ»</span>
                {description.title}
              </h1>
              <p className="text-base text-white/90 dark:text-white/80 mt-2 flex items-center gap-2">
                <span>Γ£¿</span>
                {description.subtitle}
              </p>
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
                className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-md bg-primary-800 text-white hover:bg-primary-700"
              >
                <Plus className="h-4 w-4" /> Tour
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="px-3 sm:px-4 md:px-6 py-4">
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>Quick Actions - Get Things Done Fast!</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {/* View Prices */}
            <Link
              to="/app/countries/rw/pricing"
              className="relative bg-primary-800 hover:bg-primary-700 text-white rounded-lg p-4 sm:p-5 shadow-md border border-primary-800 dark:border-primary-800 transform hover:scale-105 transition-all duration-200 flex flex-col items-center gap-2 cursor-pointer"
              title="Go to Prices Page - Track material prices"
            >
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8" />
              <span className="text-xs sm:text-sm font-bold text-center">Prices</span>
              {Array.isArray(realPrices) && realPrices.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-yellow-600">
                  {realPrices.length > 9 ? '9+' : realPrices.length}
                </span>
              )}
            </Link>

            {/* Find Suppliers */}
            <Link
              to="/app/countries/rw/contacts"
              className="relative bg-success-500 hover:bg-success-600 text-white rounded-lg p-4 sm:p-5 shadow-md border border-success-300 dark:border-success-700 transform hover:scale-105 transition-all duration-200 flex flex-col items-center gap-2 cursor-pointer"
              title="Go to Suppliers Page - Find verified suppliers"
            >
              <Users className="h-6 w-6 sm:h-8 sm:w-8" />
              <span className="text-xs sm:text-sm font-bold text-center">Suppliers</span>
              {Array.isArray(realSuppliers) && realSuppliers.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-yellow-600">
                  {realSuppliers.length > 9 ? '9+' : realSuppliers.length}
                </span>
              )}
            </Link>

            {/* Apply for Financing */}
            <Link
              to="/app/financing"
              className="relative bg-accent-500 hover:bg-accent-600 text-white rounded-lg p-4 sm:p-5 shadow-md border border-accent-300 dark:border-accent-700 transform hover:scale-105 transition-all duration-200 flex flex-col items-center gap-2 cursor-pointer"
              title="Go to Financing Page - Apply for business loans"
            >
              <Wallet className="h-6 w-6 sm:h-8 sm:w-8" />
              <span className="text-xs sm:text-sm font-bold text-center">Financing</span>
            </Link>

            {/* Risk Alerts */}
            <Link
              to="/app/risk"
              className="relative bg-error-500 hover:bg-error-600 text-white rounded-lg p-4 sm:p-5 shadow-md border border-error-300 dark:border-error-700 transform hover:scale-105 transition-all duration-200 flex flex-col items-center gap-2 cursor-pointer"
              title="Go to Risk Page - View risk alerts and mitigation"
            >
              <Shield className="h-6 w-6 sm:h-8 sm:w-8" />
              <span className="text-xs sm:text-sm font-bold text-center">Risk</span>
              {Array.isArray(realAlerts) && realAlerts.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-red-700 animate-pulse">
                  {realAlerts.length > 9 ? '9+' : realAlerts.length}
                </span>
              )}
            </Link>

            {/* View Documents */}
            <Link
              to="/app/documents"
              className="relative bg-primary-700 hover:bg-primary-600 text-white rounded-lg p-4 sm:p-5 shadow-md border border-primary-300 dark:border-primary-700 transform hover:scale-105 transition-all duration-200 flex flex-col items-center gap-2 cursor-pointer"
              title="Go to Documents Page - Manage trade documents"
            >
              <FileText className="h-6 w-6 sm:h-8 sm:w-8" />
              <span className="text-xs sm:text-sm font-bold text-center">Documents</span>
            </Link>

            {/* Track Demand */}
            <Link
              to="/app/demand"
              className="relative bg-warning-500 hover:bg-warning-600 text-white rounded-lg p-4 sm:p-5 shadow-md border border-warning-300 dark:border-warning-700 transform hover:scale-105 transition-all duration-200 flex flex-col items-center gap-2 cursor-pointer"
              title="Go to Demand Mapping Page - View demand patterns"
            >
              <Map className="h-6 w-6 sm:h-8 sm:w-8" />
              <span className="text-xs sm:text-sm font-bold text-center">Demand</span>
            </Link>
          </div>
        </div>
      </div>

      <PageLayout maxWidth="full" padding="none">
        <RailLayout
          right={
            <div className="space-y-4">
              <div className="bg-primary-800 dark:bg-primary-900 rounded-lg shadow-md border border-primary-800 dark:border-primary-800 p-5">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span>≡ƒöì</span>
                  Quick Filters
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-white mb-2 flex items-center gap-2">
                      <span>ΓÅ░</span>
                      Time Range
                    </label>
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
                    <label className="block text-sm font-bold text-white mb-2 flex items-center gap-2">
                      <span>≡ƒîì</span>
                      Countries
                    </label>
                    <div className="space-y-2 bg-white/10 dark:bg-white/5 rounded-xl p-3">
                      {countries.slice(1).map(country => (
                        <label key={country} className="flex items-center cursor-pointer hover:bg-white/10 rounded-lg p-2 transition-colors">
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
                            className="mr-2 w-4 h-4"
                          />
                          <span className="text-sm text-white font-medium">{country}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-accent-500 dark:bg-accent-700 rounded-lg shadow-md border border-accent-300 dark:border-accent-500 p-5">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span>Γ¡É</span>
                  Top Suppliers
                </h3>
                <div className="space-y-3">
                  {topSuppliers.length === 0 && (
                    <div className="text-sm text-white/80 text-center py-4">No suppliers to show yet! ≡ƒÄ»</div>
                  )}
                  {topSuppliers.map((supplier: any, index: number) => (
                    <div key={supplier.id} className="bg-white/20 dark:bg-white/10 rounded-xl p-3 border-2 border-white/30 hover:bg-white/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">≡ƒÅå</span>
                            <div className="text-sm font-bold text-white">{supplier.name || supplier.company_name}</div>
                          </div>
                          <div className="text-xs text-white/80 flex items-center gap-1">
                            <MapPin size={12} />
                            {supplier.location || supplier.country}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-extrabold text-white">{supplier.rating || supplier.score || 'N/A'}</div>
                          <div className="text-xs text-white/80">{supplier.rating ? 'Γ¡É Rating' : '≡ƒôè Score'}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-success-500 dark:bg-success-700 rounded-lg shadow-md border border-success-300 dark:border-success-500 p-5">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span>≡ƒô¥</span>
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {Array.isArray(recentActivities) && recentActivities.length > 0 ? (
                    recentActivities.slice(0, 5).map((activity: any, index: number) => {
                      const actionType = activity.action?.toLowerCase() || '';
                      const timeAgo = activity.created_at 
                        ? new Date(activity.created_at).toLocaleString()
                        : 'Recently';
                      const message = activity.details?.message || activity.action || 'Activity';
                      
                      let emoji = '≡ƒôî';
                      if (actionType.includes('price')) emoji = '≡ƒÆ░';
                      else if (actionType.includes('supplier')) emoji = '≡ƒæÑ';
                      else if (actionType.includes('alert')) emoji = '≡ƒöö';
                      
                      return (
                        <div key={activity.id || index} className="bg-white/20 dark:bg-white/10 rounded-xl p-3 border-2 border-white/30 hover:bg-white/30 transition-colors">
                          <div className="flex items-start gap-2">
                            <span className="text-lg">{emoji}</span>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-bold text-white">{message}</div>
                              <div className="text-xs text-white/80 mt-1">{timeAgo}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-4 text-white/80 text-sm">
                      <span className="text-2xl block mb-2">≡ƒÿ┤</span>
                      No recent activity
                    </div>
                  )}
                </div>
              </div>
            </div>
          }
        >
          <div className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
            {/* Playful Tab Navigation */}
            <div className="flex bg-primary-800 dark:bg-gray-800 rounded-lg p-2 w-full sm:w-fit overflow-x-auto scrollbar-hide border border-primary-800 dark:border-gray-700 shadow-md">
              <button 
                className={`px-4 sm:px-6 py-3 rounded-xl text-sm sm:text-base font-bold transition-all whitespace-nowrap flex-shrink-0 flex items-center gap-2 transform hover:scale-105 ${selectedTab === 'overview' 
                  ? 'bg-primary-800 text-white shadow-md scale-105' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-primary-800 dark:hover:bg-gray-700 hover:text-primary-800 dark:hover:text-primary-'}`}
                onClick={() => setSelectedTab('overview')}
              >
                <span>≡ƒôè</span>
                Overview
              </button>
              <button 
                className={`px-4 sm:px-6 py-3 rounded-xl text-sm sm:text-base font-bold transition-all whitespace-nowrap flex-shrink-0 flex items-center gap-2 transform hover:scale-105 ${selectedTab === 'insights' 
                  ? 'bg-accent-500 text-white shadow-md scale-105' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-purple-100 dark:hover:bg-gray-700 hover:text-purple-700 dark:hover:text-purple-300'}`}
                onClick={() => setSelectedTab('insights')}
              >
                <span>≡ƒÆí</span>
                Insights
              </button>
              <button 
                className={`px-4 sm:px-6 py-3 rounded-xl text-sm sm:text-base font-bold transition-all whitespace-nowrap flex-shrink-0 flex items-center gap-2 transform hover:scale-105 ${selectedTab === 'alerts' 
                  ? 'bg-error-500 text-white shadow-md scale-105' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-gray-700 hover:text-red-700 dark:hover:text-red-300'}`}
                onClick={() => setSelectedTab('alerts')}
              >
                <span>≡ƒöö</span>
                Alerts
              </button>
            </div>
            {/* Tab Content */}
            {selectedTab === 'overview' && (
              <>
                {/* Playful KPI Cards */}
                <div className="mb-6">
                  <div className="mb-4">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <span>≡ƒôê</span>
                      Your Amazing Numbers!
                    </h2>
                    <p className="text-base text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
                      <span>≡ƒÄë</span>
                      See how awesome your {getIndustryTerm('materials')} business is doing!
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6">
                    <div className="bg-primary-800 dark:bg-primary-900 rounded-lg shadow-md border border-primary-800 dark:border-primary-800 p-5 sm:p-6 transform hover:scale-105 transition-transform">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <span>≡ƒ¢Æ</span>
                          {description.metrics.transactions}
                        </h3>
                        <ShoppingCart size={24} className="text-white/80" />
                      </div>
                      <div className="text-4xl font-extrabold text-white mb-2">{metrics.totalTransactions}</div>
                      <div className="text-sm text-primary-800 font-medium mb-2">Last 30 days</div>
                      <div className="flex items-center text-sm text-green-200 font-bold">
                        <TrendingUp size={18} className="mr-1" />
                        +12% from last month ≡ƒÜÇ
                      </div>
                    </div>
                    
                    <div className="bg-success-500 dark:bg-success-700 rounded-lg shadow-md border border-success-300 dark:border-success-500 p-5 sm:p-6 transform hover:scale-105 transition-transform">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <span>≡ƒÆ░</span>
                          Prices We're Watching
                        </h3>
                        <TrendingUp size={24} className="text-white/80" />
                      </div>
                      <div className="text-4xl font-extrabold text-white mb-2">{realPrices?.length || 0}</div>
                      <div className="text-sm text-green-100 font-medium mb-2">Active price points</div>
                      <div className="flex items-center text-sm text-green-200 font-bold">
                        <TrendingUp size={18} className="mr-1" />
                        +{Math.floor((realPrices?.length || 0) * 0.15)} this month ≡ƒôè
                      </div>
                    </div>
                    
                    <div className="bg-accent-500 dark:bg-accent-700 rounded-lg shadow-md border border-accent-300 dark:border-accent-500 p-5 sm:p-6 transform hover:scale-105 transition-transform">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <span>≡ƒæÑ</span>
                          {description.metrics.suppliers}
                        </h3>
                        <Users size={24} className="text-white/80" />
                      </div>
                      <div className="text-4xl font-extrabold text-white mb-2">{metrics.activeSuppliersCount}</div>
                      <div className="text-sm text-purple-100 font-medium mb-2">Active network</div>
                      <div className="flex items-center text-sm text-purple-200 font-bold">
                        <TrendingUp size={18} className="mr-1" />
                        +5 new this month ≡ƒÄè
                      </div>
                    </div>
                    
                    <div className="bg-warning-500 dark:bg-warning-700 rounded-lg shadow-md border border-warning-300 dark:border-warning-500 p-5 sm:p-6 transform hover:scale-105 transition-transform">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <span>ΓÜí</span>
                          {description.metrics.volatility}
                        </h3>
                        <Activity size={24} className="text-white/80" />
                      </div>
                      <div className="text-4xl font-extrabold text-white mb-2">{metrics.priceVolatility}%</div>
                      <div className="text-sm text-orange-100 font-medium mb-2">30-day average</div>
                      <div className="flex items-center text-sm text-orange-200 font-bold">
                        <AlertTriangle size={18} className="mr-1" />
                        Keep an eye on this! ≡ƒæÇ
                      </div>
                    </div>
                    
                    <div className="bg-primary-600 dark:bg-primary-700 rounded-lg shadow-md border border-primary-300 dark:border-primary-500 p-5 sm:p-6 transform hover:scale-105 transition-transform">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <span>≡ƒôª</span>
                          Active Shipments
                        </h3>
                        <Package size={24} className="text-white/80" />
                      </div>
                      <div className="text-4xl font-extrabold text-white mb-2">{realShipments?.length || 0}</div>
                      <div className="text-sm text-cyan-100 font-medium mb-2">On the way!</div>
                      <div className="flex items-center text-sm text-cyan-200 font-bold">
                        <TrendingUp size={18} className="mr-1" />
                        All on track! Γ£à
                      </div>
                    </div>
                    
                    <div className="bg-error-500 dark:bg-error-700 rounded-lg shadow-md border border-error-300 dark:border-error-500 p-5 sm:p-6 transform hover:scale-105 transition-transform">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <span>ΓÜá∩╕Å</span>
                          Risk Alerts
                        </h3>
                        <AlertTriangle size={24} className="text-white/80" />
                      </div>
                      <div className="text-4xl font-extrabold text-white mb-2">{Array.isArray(realAlerts) ? realAlerts.length : 0}</div>
                      <div className="text-sm text-rose-100 font-medium mb-2">Active alerts</div>
                      <div className="flex items-center text-sm text-rose-200 font-bold">
                        <AlertTriangle size={18} className="mr-1" />
                        {Array.isArray(realAlerts) && realAlerts.length > 0 ? 'Check them out! ≡ƒæå' : 'All good! ≡ƒÄë'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Playful Price Trends and Changes */}
                <div className="mb-6">
                  <div className="mb-4">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <span>≡ƒôè</span>
                      Price Adventure!
                    </h2>
                    <p className="text-base text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
                      <span>≡ƒÄó</span>
                      Watch how prices go up and down like a fun roller coaster!
                    </p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-primary-700 dark:bg-primary-800 rounded-lg shadow-md border border-primary-300 dark:border-primary-500 p-6 lg:col-span-2">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl">≡ƒôê</span>
                        <h3 className="text-xl font-bold text-white">Price Trends Chart</h3>
                      </div>
                      {isLoading ? (
                        <div className="h-[300px] animate-pulse bg-indigo-400/30 dark:bg-indigo-700/30 rounded-xl flex items-center justify-center">
                          <span className="text-white text-lg">Loading chart... ≡ƒÄ¿</span>
                        </div>
                      ) : (
                        <div className="bg-white/10 dark:bg-white/5 rounded-xl p-4">
                          <PriceChart 
                            data={priceChartData} 
                            dataKeys={dataKeys} 
                            height={300}
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-accent-500 dark:bg-accent-700 rounded-lg shadow-md border border-accent-300 dark:border-accent-500 p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl">≡ƒÆ╣</span>
                        <h3 className="text-xl font-bold text-white">Price Changes</h3>
                      </div>
                      <div className="space-y-3 mt-4">
                        {Object.entries(priceChangeData).map(([key, value]) => {
                          const isPositive = value >= 0;
                          return (
                            <div key={`price-change-${key}`} className="bg-white/20 dark:bg-white/10 rounded-xl p-3 border-2 border-white/30">
                              <div className="flex items-center justify-between">
                                <span className="text-white font-bold text-sm">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                                <span className={`flex items-center font-extrabold text-lg ${isPositive ? 'text-red-200' : 'text-green-200'}`}>
                                  {isPositive ? '≡ƒôê' : '≡ƒôë'} {isPositive ? '+' : ''}{value}%
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Playful Supply Alerts */}
                <div className="mb-6">
                  <div className="mb-4">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <span>ΓÜá∩╕Å</span>
                      Important Alerts!
                    </h2>
                    <p className="text-base text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
                      <span>≡ƒöö</span>
                      Things you need to know about your supply chain!
                    </p>
                  </div>
                  <div className="bg-warning-500 dark:bg-warning-700 rounded-lg shadow-md border border-warning-300 dark:border-warning-500 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">≡ƒÜ¿</span>
                      <h3 className="text-xl font-bold text-white">Active Alerts</h3>
                    </div>
                    <div className="space-y-4 mt-4">
                      {metrics.materialShortages.map((shortage: any, index: number) => {
                        const severityEmoji = shortage.severity === 'high' ? '≡ƒö┤' : shortage.severity === 'medium' ? '≡ƒƒí' : '≡ƒƒó';
                        return (
                          <div key={`shortage-${index}-${shortage.material || shortage.id || index}`} className="bg-white/20 dark:bg-white/10 rounded-xl p-4 border-2 border-white/30">
                            <div className="flex items-start gap-3">
                              <span className="text-2xl">{severityEmoji}</span>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-bold text-white text-lg">{shortage.material} Shortage</h4>
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
                                <p className="text-sm text-white/90 font-medium mb-1 flex items-center gap-1">
                                  <MapPin size={14} />
                                  Region: {shortage.region}
                                </p>
                                <p className="text-sm text-white/80 mt-2">
                                  {shortage.severity === 'high' 
                                    ? '≡ƒÜ¿ Critical shortage affecting prices and availability!' 
                                    : shortage.severity === 'medium' 
                                      ? 'ΓÜá∩╕Å Moderate supply constraints expected.' 
                                      : 'Γä╣∩╕Å Minor supply issues reported.'
                                  }
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Playful Trade Opportunities */}
                <div className="mb-6">
                  <div className="mb-4">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <span>≡ƒÆ╝</span>
                      Amazing Opportunities!
                    </h2>
                    <p className="text-base text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
                      <span>≡ƒÄü</span>
                      Cool projects and deals waiting for you!
                    </p>
                  </div>
                  <div className="bg-success-500 dark:bg-success-700 rounded-lg shadow-md border border-success-300 dark:border-success-500 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">≡ƒîƒ</span>
                        <h3 className="text-xl font-bold text-white">Active Opportunities</h3>
                      </div>
                      <button className="text-sm text-white font-bold bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl border-2 border-white/30 transition-colors">
                        View All ≡ƒæë
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {Array.isArray(realOpportunities) && realOpportunities.length > 0 ? (
                        realOpportunities.slice(0, 3).map((opportunity: any) => (
                        <div key={opportunity.id} className="bg-white/20 dark:bg-white/10 rounded-xl p-5 border-2 border-white/30 hover:bg-white/30 transition-all transform hover:scale-[1.02]">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-bold text-white text-lg mb-2 flex items-center gap-2">
                                <span>≡ƒÄ»</span>
                                {opportunity.title || opportunity.opportunity_type}
                              </h4>
                              <p className="text-sm text-white/90 mb-3">{opportunity.description || 'Trade opportunity'}</p>
                              <div className="flex items-center gap-4 text-xs text-white/80 flex-wrap">
                                {opportunity.location && (
                                  <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-lg">
                                    <MapPin size={12} />
                                    {opportunity.location}
                                  </div>
                                )}
                                {opportunity.deadline && (
                                  <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-lg">
                                    <Calendar size={12} />
                                    Due: {new Date(opportunity.deadline).toLocaleDateString()}
                                  </div>
                                )}
                                {opportunity.country && (
                                  <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-lg">
                                    <Briefcase size={12} />
                                    {opportunity.country}
                                  </div>
                                )}
                              </div>
                            </div>
                            {(opportunity.budget_min || opportunity.budget_max) && (
                              <div className="text-right bg-white/20 rounded-xl p-3 border-2 border-white/30">
                                <div className="text-2xl font-extrabold text-white">
                                  ${opportunity.budget_max ? (opportunity.budget_max / 1000000).toFixed(1) : (opportunity.budget_min / 1000000).toFixed(1)}M
                                </div>
                                <div className="text-xs text-white/80">{opportunity.currency || 'USD'}</div>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-wrap">
                              {opportunity.material && (
                                <div className="flex flex-wrap gap-1">
                                  <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-white/30 text-white border-2 border-white/40">
                                    ≡ƒôª {opportunity.material}
                                  </span>
                                </div>
                              )}
                              {opportunity.insurance_required && (
                                <div className="flex items-center gap-1 text-xs text-white font-bold bg-white/20 px-2 py-1 rounded-lg">
                                  <Shield size={12} />
                                  Insurance Required
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <StatusBadge 
                                type={opportunity.status === 'active' ? 'success' : opportunity.status === 'matched' ? 'warning' : 'info'} 
                                text={opportunity.status?.toUpperCase() || 'ACTIVE'} 
                              />
                              <button className="px-4 py-2 text-sm font-bold text-emerald-600 bg-white rounded-xl hover:bg-emerald-50 border-2 border-white/50 transition-colors">
                                View ≡ƒæÇ
                              </button>
                            </div>
                          </div>
                        </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-white/80">
                          <span className="text-4xl block mb-2">≡ƒô¡</span>
                          <p className="text-base font-medium">No trade opportunities available yet</p>
                          <p className="text-sm mt-1">Check back soon for new opportunities! ≡ƒÄë</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {selectedTab === 'insights' && (
              <div className="space-y-6">
                {/* Playful Market Insights */}
                <div className="mb-6">
                  <div className="mb-4">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <span>≡ƒÆí</span>
                      Smart Ideas & Tips!
                    </h2>
                    <p className="text-base text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
                      <span>≡ƒºá</span>
                      Learn cool things about your market and how to grow!
                    </p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-primary-800 dark:bg-primary-900 rounded-lg shadow-md border border-primary-800 dark:border-primary-800 p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl">≡ƒôè</span>
                        <h3 className="text-xl font-bold text-white">Key Takeaways</h3>
                      </div>
                      <div className="p-4 bg-white/20 dark:bg-white/10 rounded-xl border-2 border-white/30">
                        <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                          <span>≡ƒöì</span>
                          Market Analysis
                        </h3>
                        <ul className="space-y-3 text-white">
                          <li className="flex items-start gap-2">
                            <span className="text-xl">≡ƒÆí</span>
                            <span className="font-medium">{currentIndustry === 'construction' 
                              ? 'Cement prices are going up because lots of people are building in cities! ≡ƒÅù∩╕Å'
                              : 'Fertilizer prices are getting better after some problems with shipping! ≡ƒî╛'
                            }</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-xl">≡ƒÆí</span>
                            <span className="font-medium">{currentIndustry === 'construction' 
                              ? 'Steel sellers are giving discounts if you buy a lot! ≡ƒÆ░'
                              : 'Seed prices change a lot because of seasons and shipping! ≡ƒî▒'
                            }</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-xl">≡ƒÆí</span>
                            <span className="font-medium">{currentIndustry === 'construction' 
                              ? 'New rules about buying from other countries are coming! ≡ƒôï'
                              : 'The government is helping farmers with money in Rwanda and Uganda! ≡ƒÄü'
                            }</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="bg-accent-500 dark:bg-accent-700 rounded-lg shadow-md border border-accent-300 dark:border-accent-500 p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl">≡ƒÜÇ</span>
                        <h3 className="text-xl font-bold text-white">Growth Opportunities</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="p-4 bg-white/20 dark:bg-white/10 rounded-xl border-2 border-white/30">
                          <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                            <span>≡ƒîì</span>
                            Market Expansion
                          </h4>
                          <p className="text-sm text-white/90 font-medium">
                            {currentIndustry === 'construction' 
                              ? 'More people need stuff in Tanzania and Uganda - great chance to grow! ≡ƒôê'
                              : 'You can sell organic fertilizers to nearby countries! ≡ƒî┐'
                            }
                          </p>
                        </div>
                        <div className="p-4 bg-white/20 dark:bg-white/10 rounded-xl border-2 border-white/30">
                          <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                            <span>≡ƒÆ░</span>
                            Save Money!
                          </h4>
                          <p className="text-sm text-white/90 font-medium">
                            {currentIndustry === 'construction' 
                              ? 'Buying lots at once can save you 15%! ≡ƒÄë'
                              : 'Buying directly from farmers can save 20%! ≡ƒî╛'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <span>Γ£à</span>
                      Things You Should Do!
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="bg-success-500 dark:bg-success-700 rounded-lg shadow-md border border-success-300 dark:border-success-500 p-5 hover:scale-105 transition-transform">
                        <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                          <span>≡ƒ¢Æ</span>
                          Buying Strategy
                        </h4>
                        <p className="text-sm text-white/90 font-medium">
                          {currentIndustry === 'construction' 
                            ? 'Lock in cement prices with reliable suppliers! ≡ƒöÆ' 
                            : 'Get fertilizer before the busy season starts! ΓÅ░'
                          }
                        </p>
                      </div>
                      <div className="bg-warning-500 dark:bg-warning-700 rounded-lg shadow-md border border-warning-300 dark:border-warning-500 p-5 hover:scale-105 transition-transform">
                        <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                          <span>≡ƒñ¥</span>
                          Make Friends!
                        </h4>
                        <p className="text-sm text-white/90 font-medium">
                          {currentIndustry === 'construction' 
                            ? 'Work with different steel sellers to stay safe! ≡ƒ¢í∩╕Å' 
                            : 'Partner with local seed growers! ≡ƒî▒'
                          }
                        </p>
                      </div>
                      <div className="bg-primary-600 dark:bg-primary-700 rounded-lg shadow-md border border-primary-300 dark:border-primary-500 p-5 hover:scale-105 transition-transform">
                        <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                          <span>≡ƒ¢í∩╕Å</span>
                          Stay Safe!
                        </h4>
                        <p className="text-sm text-white/90 font-medium">
                          {currentIndustry === 'construction' 
                            ? 'Protect yourself from price changes! ≡ƒôè' 
                            : 'Have backup suppliers ready! ≡ƒöä'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Playful Performance Metrics */}
                <div className="mb-6">
                  <div className="mb-4">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <span>≡ƒôê</span>
                      How Awesome You're Doing!
                    </h2>
                    <p className="text-base text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
                      <span>≡ƒÄ»</span>
                      Check out your amazing scores!
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-success-500 dark:bg-success-700 rounded-lg shadow-md border border-success-300 dark:border-success-500 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <span>ΓÜí</span>
                          Efficiency Score
                        </h3>
                        <Activity size={24} className="text-white/80" />
                      </div>
                      <div className="text-5xl font-extrabold text-white mb-2">87%</div>
                      <div className="text-sm text-emerald-100 font-bold">You're doing great! ≡ƒÄë</div>
                    </div>
                    
                    <div className="bg-accent-500 dark:bg-accent-700 rounded-lg shadow-md border border-accent-300 dark:border-accent-500 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <span>≡ƒÆ░</span>
                          Money Saved!
                        </h3>
                        <DollarSign size={24} className="text-white/80" />
                      </div>
                      <div className="text-5xl font-extrabold text-white mb-2">12%</div>
                      <div className="text-sm text-violet-100 font-bold">vs last quarter ≡ƒÜÇ</div>
                    </div>
                    
                    <div className="bg-primary-600 dark:bg-primary-700 rounded-lg shadow-md border border-primary-300 dark:border-primary-500 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <span>≡ƒôè</span>
                          Market Share
                        </h3>
                        <BarChart3 size={24} className="text-white/80" />
                      </div>
                      <div className="text-5xl font-extrabold text-white mb-2">24%</div>
                      <div className="text-sm text-sky-100 font-bold">In your region ≡ƒîì</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'alerts' && (
              <div className="space-y-6">
                {/* Playful Alert Center */}
                <div className="mb-6">
                  <div className="mb-4">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <span>≡ƒöö</span>
                      Important Alerts!
                    </h2>
                    <p className="text-base text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
                      <span>ΓÜá∩╕Å</span>
                      Things you need to know about right away!
                    </p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-warning-500 dark:bg-warning-700 rounded-lg shadow-md border border-warning-300 dark:border-warning-500 p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl">≡ƒÆ░</span>
                        <h3 className="text-xl font-bold text-white">Price Alerts</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white/20 dark:bg-white/10 rounded-xl border-2 border-white/30">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">≡ƒôê</span>
                            <div>
                              <h4 className="font-bold text-white text-lg">Cement Price Surge!</h4>
                              <p className="text-sm text-white/90 font-medium">Prices went up 5.2% in one day! ΓÜí</p>
                            </div>
                          </div>
                          <StatusBadge type="warning" text="ACTIVE" />
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-white/20 dark:bg-white/10 rounded-xl border-2 border-white/30">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">≡ƒÜ¿</span>
                            <div>
                              <h4 className="font-bold text-white text-lg">Supply Problem!</h4>
                              <p className="text-sm text-white/90 font-medium">Steel delivery is 3 days late! ≡ƒÿ░</p>
                            </div>
                          </div>
                          <StatusBadge type="error" text="CRITICAL" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-warning-500 dark:bg-warning-700 rounded-lg shadow-md border border-warning-300 dark:border-warning-500 p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl">≡ƒ¢í∩╕Å</span>
                        <h3 className="text-xl font-bold text-white">Risk Check</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="p-4 bg-white/20 dark:bg-white/10 rounded-xl border-2 border-white/30">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-bold text-white flex items-center gap-2">
                              <span>ΓÜá∩╕Å</span>
                              Supply Disruption
                            </span>
                            <StatusBadge type="warning" text="MEDIUM" />
                          </div>
                          <p className="text-xs text-white/90 font-medium">Watch your suppliers closely! ≡ƒæÇ</p>
                        </div>
                        <div className="p-4 bg-white/20 dark:bg-white/10 rounded-xl border-2 border-white/30">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-bold text-white flex items-center gap-2">
                              <span>≡ƒôè</span>
                              Price Volatility
                            </span>
                            <StatusBadge 
                              type={metrics.priceVolatility > 10 ? "error" : "warning"} 
                              text={metrics.priceVolatility > 10 ? "HIGH" : "MEDIUM"} 
                            />
                          </div>
                          <p className="text-xs text-white/90 font-medium">Prices are changing a lot! ≡ƒÆ╣</p>
                        </div>
                        <div className="p-4 bg-white/20 dark:bg-white/10 rounded-xl border-2 border-white/30">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-bold text-white flex items-center gap-2">
                              <span>Γ£à</span>
                              Quality Consistency
                            </span>
                            <StatusBadge type="success" text="LOW" />
                          </div>
                          <p className="text-xs text-white/90 font-medium">Everything looks good! ≡ƒÄë</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Playful Active Risk Alerts */}
                <div className="mb-6">
                  <div className="mb-4">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <span>≡ƒÜ¿</span>
                      Active Risk Alerts!
                    </h2>
                    <p className="text-base text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
                      <span>ΓÜí</span>
                      Real-time alerts from your supply chain!
                    </p>
                  </div>
                  <div className="space-y-4">
                    {Array.isArray(realAlerts) && realAlerts.length > 0 ? (
                      realAlerts.slice(0, 5).map((alert: any, index: number) => {
                        const severityEmoji = alert.severity === 'high' ? '≡ƒö┤' : alert.severity === 'medium' ? '≡ƒƒí' : '≡ƒƒó';
                        const bgGradient = alert.severity === 'high' 
                          ? 'bg-error-500 dark:bg-error-700 border-error-300 dark:border-error-500'
                          : alert.severity === 'medium'
                            ? 'bg-warning-500 dark:bg-warning-700 border-warning-300 dark:border-warning-500'
                            : 'bg-warning-500 dark:bg-warning-700 border-warning-300 dark:border-warning-500';
                        return (
                          <div 
                            key={alert.id || `alert-${index}`}
                            className={`bg-error-500 dark:bg-error-700 rounded-lg shadow-md border p-5`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3 flex-1">
                                <span className="text-3xl">{severityEmoji}</span>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-bold text-white text-lg">
                                      {alert.title || alert.alert_type || 'Risk Alert'}
                                    </h4>
                                    <StatusBadge 
                                      type={alert.severity === 'high' ? 'error' : alert.severity === 'medium' ? 'warning' : 'info'}
                                      text={alert.severity?.toUpperCase() || 'ALERT'}
                                    />
                                  </div>
                                  <p className="text-sm text-white/90 font-medium mb-3">
                                    {alert.message || alert.description || 'No description available'}
                                  </p>
                                  <div className="flex items-center gap-4 text-xs text-white/80 flex-wrap">
                                    {alert.region && (
                                      <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-lg">
                                        <MapPin size={12} />
                                        {alert.region}
                                      </div>
                                    )}
                                    {alert.material && (
                                      <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-lg">
                                        <Package size={12} />
                                        {alert.material}
                                      </div>
                                    )}
                                    {alert.created_at && (
                                      <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-lg">
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
                                className="ml-4 px-4 py-2 text-sm font-bold bg-white text-gray-700 rounded-xl hover:bg-gray-100 border-2 border-white/50 transition-colors"
                              >
                                Fix It! Γ£à
                              </button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="bg-success-500 dark:bg-success-700 rounded-lg shadow-md border border-success-300 dark:border-success-500 p-8 text-center">
                        <span className="text-6xl block mb-4">≡ƒÄë</span>
                        <h3 className="text-2xl font-bold text-white mb-2">All Clear!</h3>
                        <p className="text-base text-white/90 font-medium">
                          No active risk alerts right now! Everything is working great! Γ£¿
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Playful Mitigation Actions */}
                <div className="mb-6">
                  <div className="mb-4">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <span>≡ƒ¢í∩╕Å</span>
                      How to Stay Safe!
                    </h2>
                    <p className="text-base text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
                      <span>≡ƒÆ¬</span>
                      Things you can do to protect your business!
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-primary-800 dark:bg-primary-900 rounded-lg shadow-md border border-primary-800 dark:border-primary-800 p-5 hover:scale-105 transition-transform">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">Γ£à</span>
                        <h4 className="font-bold text-white text-lg">Work with Many Suppliers</h4>
                      </div>
                      <p className="text-sm text-white/90 font-medium">
                        Having lots of suppliers keeps you safe! ≡ƒ¢í∩╕Å
                      </p>
                    </div>
                    
                    <div className="bg-warning-500 dark:bg-warning-700 rounded-lg shadow-md border border-warning-300 dark:border-warning-500 p-5 hover:scale-105 transition-transform">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">≡ƒÆ░</span>
                        <h4 className="font-bold text-white text-lg">Protect Your Prices!</h4>
                      </div>
                      <p className="text-sm text-white/90 font-medium">
                        Use price protection to stay safe from changes! ≡ƒôè
                      </p>
                    </div>
                    
                    <div className="bg-success-500 dark:bg-success-700 rounded-lg shadow-md border border-success-300 dark:border-success-500 p-5 hover:scale-105 transition-transform">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">Γ£à</span>
                        <h4 className="font-bold text-white text-lg">Quality Check Active!</h4>
                      </div>
                      <p className="text-sm text-white/90 font-medium">
                        We're watching quality for you! ≡ƒæÇ
                      </p>
                    </div>
                  </div>
                </div>
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
                  : 'border-primary-800 dark:border-primary-/60 bg-white dark:bg-gray-800';
            const Icon = kind === 'success' ? CheckCircle : kind === 'error' ? XCircle : kind === 'warning' ? AlertTriangle : Bell;
            return (
              <div
                key={notification.id}
                className={`border rounded-lg shadow-md p-4 max-w-sm transform transition-all duration-200 animate-slide-in ${kindClasses}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-3">
                    <div className="flex items-center gap-2">
                      <Icon size={16} className={kind === 'success' ? 'text-green-600' : kind === 'error' ? 'text-red-600' : kind === 'warning' ? 'text-amber-600' : 'text-primary-'} />
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
                    className="mt-2 text-sm text-primary-800 hover:text-primary-800 dark:text-primary-800 hover:underline"
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
