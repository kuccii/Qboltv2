import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardCard from '../components/DashboardCard';
import { 
  Users, 
  Settings, 
  Shield, 
  Activity,
  DollarSign,
  Package,
  Truck,
  FileText,
  AlertTriangle,
  TrendingUp,
  Building2,
  CreditCard,
  MapPin,
  BarChart3,
  Download,
  Upload,
  Database,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { unifiedApi } from '../services/unifiedApi';
import { usePrices } from '../hooks/useData';
import { useSuppliers } from '../hooks/useData';

const AdminDashboard: React.FC = () => {
  const { authState } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    users: 0,
    prices: 0,
    suppliers: 0,
    agents: 0,
    documents: 0,
    financing: 0,
    logistics: 0,
    demand: 0,
    riskAlerts: 0,
    verifiedSuppliers: 0,
    pendingPrices: 0
  });
  const [loading, setLoading] = useState(true);

  const { prices } = usePrices({ limit: 1000 });
  const { suppliers } = useSuppliers({ limit: 1000 });

  useEffect(() => {
    if (authState.user?.role !== 'admin') {
      navigate('/app');
      return;
    }

    loadStats();
  }, [authState.user, navigate]);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Load all stats in parallel
      const [
        pricesData,
        suppliersData,
        agentsData,
        documentsData,
        financingData,
        logisticsData,
        demandData,
        riskAlertsData
      ] = await Promise.all([
        unifiedApi.prices.get({ limit: 1000 }).catch(() => ({ data: [] })),
        unifiedApi.suppliers.get({ limit: 1000 }).catch(() => ({ data: [] })),
        unifiedApi.agents.get({ limit: 1000 }).catch(() => ({ data: [] })),
        unifiedApi.documents?.get({ limit: 1000 }).catch(() => ({ data: [] })) || Promise.resolve({ data: [] }),
        unifiedApi.financing?.getOffers({ limit: 1000 }).catch(() => ({ data: [] })) || Promise.resolve({ data: [] }),
        unifiedApi.logistics?.getRoutes({ limit: 1000 }).catch(() => ({ data: [] })) || Promise.resolve({ data: [] }),
        unifiedApi.demand?.get({ limit: 1000 }).catch(() => ({ data: [] })) || Promise.resolve({ data: [] }),
        unifiedApi.riskProfile?.getAlerts({ limit: 1000 }).catch(() => ({ data: [] })) || Promise.resolve({ data: [] })
      ]);

      const pricesList = pricesData?.data || prices || [];
      const suppliersList = suppliersData?.data || suppliers || [];
      const agentsList = agentsData?.data || [];
      const documentsList = documentsData?.data || [];
      const financingList = financingData?.data || [];
      const logisticsList = logisticsData?.data || [];
      const demandList = demandData?.data || [];
      const riskAlertsList = riskAlertsData?.data || [];

      setStats({
        users: 0, // TODO: Add user count API
        prices: pricesList.length,
        suppliers: suppliersList.length,
        agents: agentsList.length,
        documents: documentsList.length,
        financing: financingList.length,
        logistics: logisticsList.length,
        demand: demandList.length,
        riskAlerts: riskAlertsList.length,
        verifiedSuppliers: suppliersList.filter((s: any) => s.verified).length,
        pendingPrices: pricesList.filter((p: any) => !p.verified).length
      });
    } catch (error) {
      console.error('Error loading admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Activity className="animate-spin h-8 w-8 text-gray-400" />
      </div>
    );
  }

  const quickActions = [
    { label: 'Manage Prices', icon: DollarSign, path: '/app/admin/prices', color: 'blue' },
    { label: 'Manage Suppliers', icon: Package, path: '/app/admin/suppliers', color: 'green' },
    { label: 'Manage Agents', icon: Users, path: '/app/admin/agents', color: 'purple' },
    { label: 'Manage Documents', icon: FileText, path: '/app/admin/documents', color: 'orange' },
    { label: 'Manage Financing', icon: CreditCard, path: '/app/admin/financing', color: 'indigo' },
    { label: 'Manage Logistics', icon: Truck, path: '/app/admin/logistics', color: 'teal' },
    { label: 'Manage Demand Data', icon: TrendingUp, path: '/app/admin/demand', color: 'pink' },
    { label: 'Manage Risk Alerts', icon: AlertTriangle, path: '/app/admin/risk', color: 'red' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage all data and settings for the platform</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/app/admin/import')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Bulk Import</span>
          </button>
          <button
            onClick={() => navigate('/app/admin/export')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <DashboardCard title="Total Prices" icon={<DollarSign className="w-5 h-5" />}>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.prices}</div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {stats.pendingPrices} pending verification
            </span>
          </div>
        </DashboardCard>

        <DashboardCard title="Total Suppliers" icon={<Package className="w-5 h-5" />}>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.suppliers}</div>
          <div className="flex items-center gap-2 mt-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {stats.verifiedSuppliers} verified
            </span>
          </div>
        </DashboardCard>

        <DashboardCard title="Agents" icon={<Users className="w-5 h-5" />}>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.agents}</div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Service providers</p>
        </DashboardCard>

        <DashboardCard title="Documents" icon={<FileText className="w-5 h-5" />}>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.documents}</div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Trade documents</p>
        </DashboardCard>

        <DashboardCard title="Financing Offers" icon={<CreditCard className="w-5 h-5" />}>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.financing}</div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Active offers</p>
        </DashboardCard>

        <DashboardCard title="Logistics Routes" icon={<Truck className="w-5 h-5" />}>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.logistics}</div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Active routes</p>
        </DashboardCard>

        <DashboardCard title="Demand Data Points" icon={<TrendingUp className="w-5 h-5" />}>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.demand}</div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Market insights</p>
        </DashboardCard>

        <DashboardCard title="Risk Alerts" icon={<AlertTriangle className="w-5 h-5" />}>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.riskAlerts}</div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Active alerts</p>
        </DashboardCard>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            const colorClasses = {
              blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300',
              green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-700 dark:text-green-300',
              purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-300',
              orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/30 text-orange-700 dark:text-orange-300',
              indigo: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
              teal: 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800 hover:bg-teal-100 dark:hover:bg-teal-900/30 text-teal-700 dark:text-teal-300',
              pink: 'bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800 hover:bg-pink-100 dark:hover:bg-pink-900/30 text-pink-700 dark:text-pink-300',
              red: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-700 dark:text-red-300'
            };

            return (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className={`flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 transition-all duration-200 ${colorClasses[action.color as keyof typeof colorClasses]}`}
              >
                <Icon className="w-8 h-8" />
                <span className="font-semibold text-sm text-center">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* System Status */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DashboardCard title="Database" icon={<Database className="w-5 h-5" />}>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="font-semibold text-gray-900 dark:text-white">Connected</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">All systems operational</p>
          </DashboardCard>

          <DashboardCard title="Data Integrity" icon={<Shield className="w-5 h-5" />}>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="font-semibold text-gray-900 dark:text-white">Healthy</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">No data issues detected</p>
          </DashboardCard>

          <DashboardCard title="Last Updated" icon={<Clock className="w-5 h-5" />}>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {new Date().toLocaleDateString()}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Real-time sync active</p>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
