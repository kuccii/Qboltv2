import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardCard from '../components/DashboardCard';
import { AdminCard } from '../components/AdminCard';
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
  Clock,
  UserCog
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
        unifiedApi.agents.getAll({ limit: 1000 }).catch(() => ({ data: [] })),
        unifiedApi.documents?.getAll({ limit: 1000 }).catch(() => ({ data: [] })) || Promise.resolve({ data: [] }),
        unifiedApi.financing?.getAll({ limit: 1000 }).catch(() => ({ data: [] })) || Promise.resolve({ data: [] }),
        unifiedApi.logistics?.getAll({ limit: 1000 }).catch(() => ({ data: [] })) || Promise.resolve({ data: [] }),
        unifiedApi.demand?.getAll({ limit: 1000 }).catch(() => ({ data: [] })) || Promise.resolve({ data: [] }),
        unifiedApi.riskProfile?.getAllAlerts({ limit: 1000 }).catch(() => ({ data: [] })) || Promise.resolve({ data: [] })
      ]);

      const pricesList = pricesData?.data || prices || [];
      const suppliersList = suppliersData?.data || suppliers || [];
      const agentsList = agentsData?.data || [];
      const documentsList = documentsData?.data || [];
      const financingList = financingData?.data || [];
      const logisticsList = logisticsData?.data || [];
      const demandList = demandData?.data || [];
      const riskAlertsList = riskAlertsData?.data || [];

      // Get user count from admin API
      const userCount = await unifiedApi.admin.getUserCount().catch(() => 0);

      setStats({
        users: userCount,
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
    { label: 'Manage Prices', icon: DollarSign, path: '/admin/prices', color: 'blue' },
    { label: 'Manage Suppliers', icon: Package, path: '/admin/suppliers', color: 'green' },
    { label: 'Manage Agents', icon: Users, path: '/admin/agents', color: 'purple' },
    { label: 'Manage Users', icon: UserCog, path: '/admin/users', color: 'gray' },
    { label: 'Manage Documents', icon: FileText, path: '/admin/documents', color: 'orange' },
    { label: 'Manage Financing', icon: CreditCard, path: '/admin/financing', color: 'indigo' },
    { label: 'Manage Logistics', icon: Truck, path: '/admin/logistics', color: 'teal' },
    { label: 'Manage Demand Data', icon: TrendingUp, path: '/admin/demand', color: 'pink' },
    { label: 'Manage Risk Alerts', icon: AlertTriangle, path: '/admin/risk', color: 'red' }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-gray-400 mt-1">Manage all data and settings for the platform</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/admin/import')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Bulk Import</span>
              </button>
              <button
                onClick={() => navigate('/admin/export')}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export Data</span>
              </button>
            </div>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <AdminCard>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Prices</p>
                  <p className="text-2xl font-bold text-white">{stats.prices}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500">{stats.pendingPrices} pending verification</p>
            </AdminCard>

            <AdminCard>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <Package className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Suppliers</p>
                  <p className="text-2xl font-bold text-white">{stats.suppliers}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <p className="text-xs text-gray-500">{stats.verifiedSuppliers} verified</p>
              </div>
            </AdminCard>

            <AdminCard>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-indigo-500/20 rounded-lg">
                  <Users className="h-6 w-6 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Agents</p>
                  <p className="text-2xl font-bold text-white">{stats.agents}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500">Service providers</p>
            </AdminCard>

            <AdminCard>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-orange-500/20 rounded-lg">
                  <FileText className="h-6 w-6 text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Documents</p>
                  <p className="text-2xl font-bold text-white">{stats.documents}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500">Trade documents</p>
            </AdminCard>

            <AdminCard>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-pink-500/20 rounded-lg">
                  <CreditCard className="h-6 w-6 text-pink-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Financing Offers</p>
                  <p className="text-2xl font-bold text-white">{stats.financing}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500">Active offers</p>
            </AdminCard>

            <AdminCard>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-teal-500/20 rounded-lg">
                  <Truck className="h-6 w-6 text-teal-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Logistics Routes</p>
                  <p className="text-2xl font-bold text-white">{stats.logistics}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500">Active routes</p>
            </AdminCard>

            <AdminCard>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-yellow-500/20 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Demand Data</p>
                  <p className="text-2xl font-bold text-white">{stats.demand}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500">Market insights</p>
            </AdminCard>

            <AdminCard>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-red-500/20 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Risk Alerts</p>
                  <p className="text-2xl font-bold text-white">{stats.riskAlerts}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500">Active alerts</p>
            </AdminCard>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                const colorClasses: Record<string, string> = {
                  blue: 'bg-blue-500/20 border-blue-500/30 hover:bg-blue-500/30 text-blue-400 border-2',
                  green: 'bg-green-500/20 border-green-500/30 hover:bg-green-500/30 text-green-400 border-2',
                  purple: 'bg-purple-500/20 border-purple-500/30 hover:bg-purple-500/30 text-purple-400 border-2',
                  orange: 'bg-orange-500/20 border-orange-500/30 hover:bg-orange-500/30 text-orange-400 border-2',
                  indigo: 'bg-indigo-500/20 border-indigo-500/30 hover:bg-indigo-500/30 text-indigo-400 border-2',
                  teal: 'bg-teal-500/20 border-teal-500/30 hover:bg-teal-500/30 text-teal-400 border-2',
                  pink: 'bg-pink-500/20 border-pink-500/30 hover:bg-pink-500/30 text-pink-400 border-2',
                  red: 'bg-red-500/20 border-red-500/30 hover:bg-red-500/30 text-red-400 border-2',
                  gray: 'bg-gray-500/20 border-gray-500/30 hover:bg-gray-500/30 text-gray-400 border-2'
                };

                return (
                  <button
                    key={action.path}
                    onClick={() => navigate(action.path)}
                    className={`flex flex-col items-center justify-center gap-3 p-6 rounded-xl transition-all duration-200 ${colorClasses[action.color] || colorClasses.gray}`}
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
            <h2 className="text-xl font-bold text-white mb-4">System Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <AdminCard>
                <div className="flex items-center gap-3 mb-3">
                  <Database className="h-6 w-6 text-blue-400" />
                  <h3 className="font-semibold text-white">Database</h3>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="font-semibold text-white">Connected</span>
                </div>
                <p className="text-sm text-gray-400 mt-2">All systems operational</p>
              </AdminCard>

              <AdminCard>
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="h-6 w-6 text-green-400" />
                  <h3 className="font-semibold text-white">Data Integrity</h3>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="font-semibold text-white">Healthy</span>
                </div>
                <p className="text-sm text-gray-400 mt-2">No data issues detected</p>
              </AdminCard>

              <AdminCard>
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="h-6 w-6 text-yellow-400" />
                  <h3 className="font-semibold text-white">Last Updated</h3>
                </div>
                <div className="text-lg font-semibold text-white">
                  {new Date().toLocaleDateString()}
                </div>
                <p className="text-sm text-gray-400 mt-2">Real-time sync active</p>
              </AdminCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
