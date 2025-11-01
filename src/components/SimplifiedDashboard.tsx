import React, { useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  MapPin, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import { useRealPrices, useRealSuppliers, useRealAnalytics } from '../hooks/useRealData';
import { EnhancedChart } from './EnhancedChart';

const SimplifiedDashboard: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('cement');

  // Fetch real data
  const { data: priceData, loading: priceLoading, refetch: refetchPrices } = useRealPrices({
    material: selectedMaterial,
    country: selectedCountry === 'all' ? undefined : selectedCountry
  });

  const { data: suppliers, loading: suppliersLoading, refetch: refetchSuppliers } = useRealSuppliers({
    country: selectedCountry === 'all' ? undefined : selectedCountry,
    limit: 5
  });

  const { data: analytics, loading: analyticsLoading, refetch: refetchAnalytics } = useRealAnalytics({
    country: selectedCountry === 'all' ? undefined : selectedCountry
  });

  const handleRefresh = () => {
    refetchPrices();
    refetchSuppliers();
    refetchAnalytics();
  };

  const StatCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    loading = false 
  }: {
    title: string;
    value: string | number;
    change?: number;
    icon: React.ElementType;
    loading?: boolean;
  }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          {loading ? (
            <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-2" />
          ) : (
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          )}
        </div>
        <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
          <Icon className="text-primary-600 dark:text-primary-300" size={24} />
        </div>
      </div>
      {change !== undefined && !loading && (
        <div className="flex items-center mt-2">
          {change > 0 ? (
            <ArrowUpRight className="text-green-500" size={16} />
          ) : (
            <ArrowDownRight className="text-red-500" size={16} />
          )}
          <span className={`text-sm font-medium ml-1 ${
            change > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {Math.abs(change)}%
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">vs last month</span>
        </div>
      )}
    </div>
  );

  const QuickAction = ({ 
    title, 
    description, 
    icon: Icon, 
    onClick 
  }: {
    title: string;
    description: string;
    icon: React.ElementType;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-colors text-left group"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg group-hover:bg-primary-100 dark:group-hover:bg-primary-900 transition-colors">
          <Icon className="text-gray-600 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-300" size={20} />
        </div>
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
      </div>
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">Welcome back! Here's what's happening in your supply chain.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="all">All Countries</option>
          <option value="RW">Rwanda</option>
          <option value="KE">Kenya</option>
          <option value="UG">Uganda</option>
        </select>
        <select
          value={selectedMaterial}
          onChange={(e) => setSelectedMaterial(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="cement">Cement</option>
          <option value="steel">Steel</option>
          <option value="timber">Timber</option>
          <option value="sand">Sand</option>
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Suppliers"
          value={analytics?.totalSuppliers || 0}
          change={5.2}
          icon={Users}
          loading={analyticsLoading}
        />
        <StatCard
          title="Verified Suppliers"
          value={analytics?.verifiedSuppliers || 0}
          change={8.1}
          icon={Users}
          loading={analyticsLoading}
        />
        <StatCard
          title="Average Rating"
          value={analytics?.averageRating ? `${analytics.averageRating}/5` : '0/5'}
          change={2.3}
          icon={TrendingUp}
          loading={analyticsLoading}
        />
        <StatCard
          title="Active Countries"
          value="3"
          change={0}
          icon={MapPin}
          loading={false}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Price Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {selectedMaterial.charAt(0).toUpperCase() + selectedMaterial.slice(1)} Price Trends
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span>Last 6 months</span>
            </div>
          </div>
          {priceLoading ? (
            <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
          ) : (
            <div className="h-64">
              <EnhancedChart
                data={priceData}
                type="line"
                dataKey={selectedMaterial}
                xAxisKey="date"
                title=""
                showLegend={false}
              />
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
          <QuickAction
            title="Find Suppliers"
            description="Search for verified suppliers"
            icon={Search}
            onClick={() => window.location.href = '/app/suppliers'}
          />
          <QuickAction
            title="Report Price"
            description="Submit current market prices"
            icon={TrendingUp}
            onClick={() => window.location.href = '/app/price-reporting'}
          />
          <QuickAction
            title="View Rwanda Data"
            description="Explore Rwanda logistics"
            icon={MapPin}
            onClick={() => window.location.href = '/app/rwanda'}
          />
          <QuickAction
            title="Apply for Financing"
            description="Get working capital"
            icon={DollarSign}
            onClick={() => window.location.href = '/app/financing'}
          />
        </div>
      </div>

      {/* Top Suppliers */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Top Suppliers</h2>
          <button
            onClick={() => window.location.href = '/app/suppliers'}
            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
          >
            View all
          </button>
        </div>
        {suppliersLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {suppliers?.slice(0, 5).map((supplier: any) => (
              <div key={supplier.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-600 dark:text-primary-300">
                    {supplier.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">{supplier.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{supplier.location}</p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {supplier.rating?.toFixed(1) || 'N/A'}
                  </span>
                  <span className="text-yellow-500">★</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimplifiedDashboard;

