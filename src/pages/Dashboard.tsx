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
  Settings,
  Bell,
  MapPin,
  Calendar,
  Shield,
  Briefcase
} from 'lucide-react';
import { useIndustry } from '../contexts/IndustryContext';
import { useExport } from '../hooks/useExport';
import { useNotifications } from '../hooks/useNotifications';
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
  PageHeader,
  PageLayout,
  SectionLayout,
  SelectInput,
  ActionMenu,
  RailLayout
} from '../design-system';

const Dashboard: React.FC = () => {
  const { currentIndustry, getIndustryTerm } = useIndustry();
  
  // State management
  const [selectedTab, setSelectedTab] = useState<'overview' | 'insights' | 'alerts'>('overview');
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  // New hooks for enhanced functionality
  const { exportData } = useExport();
  const { notifications, addNotification, markAsRead } = useNotifications();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
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

  // Data preparation
  const metrics = dashboardMetrics[currentIndustry];
  const description = industryDescriptions[currentIndustry];
  const priceChangeData = priceChanges[currentIndustry];
  const priceChartData = currentIndustry === 'construction' ? priceData : agriculturePriceData;
  
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
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastUpdated(new Date());
    setIsRefreshing(false);
    
    addNotification({
      type: 'success',
      title: 'Data Refreshed',
      message: 'Dashboard data has been updated'
    });
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
      <PageHeader
        title={description.title}
        subtitle={description.subtitle}
        breadcrumbs={[{ label: 'Dashboard' }]}
        actions={
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
              <Clock size={14} className="mr-1" />
              Updated: {formatDate(lastUpdated)}
            </div>
            <ActionMenu
              items={[
                { id: 'refresh', label: 'Refresh Data', icon: <RefreshCw className="h-4 w-4" />, description: 'Update all dashboard data', onClick: () => handleRefresh() },
                { id: 'export', label: 'Export Report', icon: <Download className="h-4 w-4" />, description: 'Download dashboard data', onClick: () => handleExport() },
                { id: 'tour', label: 'Take Tour', icon: <Plus className="h-4 w-4" />, description: 'Learn about dashboard features', onClick: () => setShowOnboarding(true) },
                { id: 'settings', label: 'Dashboard Settings', icon: <Settings className="h-4 w-4" />, description: 'Customize dashboard layout', onClick: () => console.log('Settings clicked') }
              ]}
              size="sm"
            />
          </div>
        }
      />

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
                  ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-800 dark:text-gray-200' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}
                onClick={() => setSelectedTab('overview')}
              >
                Overview
              </button>
              <button 
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedTab === 'insights' 
                  ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-800 dark:text-gray-200' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}
                onClick={() => setSelectedTab('insights')}
              >
                Insights
              </button>
              <button 
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedTab === 'alerts' 
                  ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-800 dark:text-gray-200' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}
                onClick={() => setSelectedTab('alerts')}
              >
                Alerts
              </button>
            </div>
            {/* Tab Content */}
            {/* Industry-specific dashboard */}
            <IndustryDashboard />
            
            {selectedTab === 'overview' && (
              <>
                {/* KPI Cards */}
                <SectionLayout title="Key Performance Indicators" subtitle={`Real-time metrics for your ${getIndustryTerm('materials')} supply chain`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{description.metrics.transactions}</h3>
                        <ShoppingCart size={20} className="text-gray-400" />
                      </div>
                      <div className="text-3xl font-bold text-gray-800 dark:text-gray-200">{metrics.totalTransactions}</div>
                      <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">Last 30 days</div>
                      <div className="flex items-center mt-2 text-sm text-green-600 dark:text-green-400">
                        <TrendingUp size={16} className="mr-1" />
                        +12% from last month
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{description.metrics.orders}</h3>
                        <DollarSign size={20} className="text-gray-400" />
                      </div>
                      <div className="text-3xl font-bold text-gray-800 dark:text-gray-200">${metrics.averageOrderValue}</div>
                      <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">Average value</div>
                      <div className="flex items-center mt-2 text-sm text-red-600 dark:text-red-400">
                        <TrendingDown size={16} className="mr-1" />
                        -3% from last month
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{description.metrics.suppliers}</h3>
                        <Users size={20} className="text-gray-400" />
                      </div>
                      <div className="text-3xl font-bold text-gray-800 dark:text-gray-200">{metrics.activeSuppliersCount}</div>
                      <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">Active network</div>
                      <div className="flex items-center mt-2 text-sm text-green-600 dark:text-green-400">
                        <TrendingUp size={16} className="mr-1" />
                        +5 new this month
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{description.metrics.volatility}</h3>
                        <Activity size={20} className="text-gray-400" />
                      </div>
                      <div className="text-3xl font-bold text-gray-800 dark:text-gray-200">{metrics.priceVolatility}%</div>
                      <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">30-day average</div>
                      <div className="flex items-center mt-2 text-sm text-orange-600 dark:text-orange-400">
                        <AlertTriangle size={16} className="mr-1" />
                        High volatility
                      </div>
                    </div>
                  </div>
                </SectionLayout>

                {/* Price Trends and Changes */}
                <SectionLayout title="Market Analysis" subtitle="Price trends and market movements">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 lg:col-span-2">
                      <div className="flex items-center gap-2 mb-4">
                        <BarChart3 size={20} className="text-gray-400" />
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Price Trends</h3>
                      </div>
                      <PriceChart 
                        data={priceChartData} 
                        dataKeys={dataKeys} 
                        height={300}
                      />
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <TrendingUp size={20} className="text-gray-400" />
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Price Changes</h3>
                      </div>
                      <div className="space-y-1 mt-2">
                        {Object.entries(priceChangeData).map(([key, value]) => 
                          renderPriceChange(key.charAt(0).toUpperCase() + key.slice(1), value as number)
                        )}
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
                        <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
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
                                    key={index} 
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
              <SectionLayout title="Market Insights" subtitle="Strategic analysis and recommendations">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 size={20} className="text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Key Takeaways</h3>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Market Analysis</h3>
                    <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>{currentIndustry === 'construction' 
                          ? 'Cement prices continue to rise due to increased demand in urban construction projects across Kenya.'
                          : 'Fertilizer prices are stabilizing after recent supply chain disruptions from global markets.'
                        }</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>{currentIndustry === 'construction' 
                          ? 'Steel suppliers are offering bulk discounts to counter recent price increases.'
                          : 'Seed prices remain volatile due to seasonal demand fluctuations and import constraints.'
                        }</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>{currentIndustry === 'construction' 
                          ? 'New regulations on imported materials expected to impact supply chain in Q4 2023.'
                          : 'New governmental subsidies for small-scale farmers announced in Rwanda and Uganda.'
                        }</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-4">Recommended Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">Procurement Strategy</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {currentIndustry === 'construction' 
                            ? 'Consider locking in cement prices with suppliers showing stable supply chains.' 
                            : 'Secure fertilizer stocks ahead of the growing season to avoid seasonal price increases.'
                          }
                        </p>
                      </div>
                      <div className="border dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">Supplier Relationships</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {currentIndustry === 'construction' 
                            ? 'Diversify steel suppliers to mitigate risk from volatile market conditions.' 
                            : 'Explore partnerships with local seed producers to reduce import dependency.'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </SectionLayout>
            )}

            {selectedTab === 'alerts' && (
              <SectionLayout title="Alert Center" subtitle="Manage your supply chain notifications">
                <div className="space-y-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Bell size={20} className="text-gray-400" />
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Price Alerts</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                        <div className="flex items-center gap-3">
                          <AlertCircle size={20} className="text-orange-500" />
                          <div>
                            <h4 className="font-medium text-gray-800 dark:text-gray-200">Cement Price Surge</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Prices increased 5.2% in the last 24 hours</p>
                          </div>
                        </div>
                        <StatusBadge type="warning" text="ACTIVE" />
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                        <div className="flex items-center gap-3">
                          <AlertTriangle size={20} className="text-red-500" />
                          <div>
                            <h4 className="font-medium text-gray-800 dark:text-gray-200">Supply Disruption</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Steel delivery delayed by 3 days</p>
                          </div>
                        </div>
                        <StatusBadge type="error" text="CRITICAL" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertTriangle size={20} className="text-gray-400" />
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Risk Assessment</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <h3 className="font-medium text-gray-800 dark:text-gray-200">Current Risks</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-700 dark:text-gray-300">Supply Disruption</span>
                            <StatusBadge type="warning" text="MEDIUM" />
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-700 dark:text-gray-300">Price Volatility</span>
                            <StatusBadge 
                              type={metrics.priceVolatility > 10 ? "error" : "warning"} 
                              text={metrics.priceVolatility > 10 ? "HIGH" : "MEDIUM"} 
                            />
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-700 dark:text-gray-300">Quality Consistency</span>
                            <StatusBadge type="success" text="LOW" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h3 className="font-medium text-gray-800 dark:text-gray-200">Mitigation Actions</h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle size={16} className="text-green-500" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Diversified supplier base</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <XCircle size={16} className="text-red-500" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Price hedging strategy needed</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle size={16} className="text-green-500" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Quality monitoring active</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </SectionLayout>
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

      {/* Notifications Display */}
      {notifications.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 space-y-2">
          {notifications.slice(0, 3).map((notification) => (
            <div
              key={notification.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                    {notification.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
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
                  className="mt-2 text-sm text-primary-600 dark:text-primary-400 hover:underline"
                >
                  {notification.action.label}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
};

export default Dashboard;