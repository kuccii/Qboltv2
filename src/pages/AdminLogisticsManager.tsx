import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Truck, CheckCircle, AlertCircle } from 'lucide-react';
import { unifiedApi } from '../services/unifiedApi';
import DashboardCard from '../components/DashboardCard';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminLogisticsManager: React.FC = () => {
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRoute, setEditingRoute] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    origin_country: 'Kenya',
    destination_country: 'Uganda',
    distance_km: '',
    estimated_days: '',
    cost_per_ton: '',
    status: 'active'
  });

  const countries = ['Kenya', 'Rwanda', 'Uganda', 'Tanzania', 'Ethiopia', 'Somalia'];

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    try {
      setLoading(true);
      const result = await unifiedApi.logistics.getAll({ limit: 1000 });
      setRoutes(result.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load logistics routes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const routeData = {
        ...formData,
        distance_km: formData.distance_km ? parseFloat(formData.distance_km) : undefined,
        estimated_days: formData.estimated_days ? parseInt(formData.estimated_days) : undefined,
        cost_per_ton: formData.cost_per_ton ? parseFloat(formData.cost_per_ton) : undefined,
      };
      if (editingRoute) {
        await unifiedApi.logistics.update(editingRoute.id, routeData);
      } else {
        await unifiedApi.logistics.create(routeData);
      }
      resetForm();
      loadRoutes();
    } catch (err: any) {
      alert(err.message || 'Failed to save route');
    }
  };

  const handleEdit = (route: any) => {
    setEditingRoute(route);
    setFormData({
      origin: route.origin,
      destination: route.destination,
      origin_country: route.origin_country,
      destination_country: route.destination_country,
      distance_km: (route.distance_km || '').toString(),
      estimated_days: (route.estimated_days || '').toString(),
      cost_per_ton: (route.cost_per_ton || '').toString(),
      status: route.status || 'active'
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this route?')) return;
    try {
      await unifiedApi.logistics.delete(id);
      loadRoutes();
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  const resetForm = () => {
    setFormData({
      origin: '',
      destination: '',
      origin_country: 'Kenya',
      destination_country: 'Uganda',
      distance_km: '',
      estimated_days: '',
      cost_per_ton: '',
      status: 'active'
    });
    setShowCreateForm(false);
    setEditingRoute(null);
  };

  const filteredRoutes = routes.filter(r =>
    searchTerm === '' ||
    r.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner fullScreen />;
  if (error) return (
    <div className="p-6">
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <p className="text-red-600">{error}</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Logistics Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage logistics routes and shipments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <DashboardCard>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-50 dark:bg-primary-900/30 rounded-lg">
              <Truck className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Routes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{routes.length}</p>
            </div>
          </div>
        </DashboardCard>
        <DashboardCard>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {routes.filter(r => r.status === 'active').length}
              </p>
            </div>
          </div>
        </DashboardCard>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search routes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <button
          onClick={() => { resetForm(); setShowCreateForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          <span>Add Route</span>
        </button>
      </div>

      {showCreateForm && (
        <div className="mb-6 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            {editingRoute ? 'Edit Route' : 'Add New Route'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Origin *</label>
                <input type="text" required value={formData.origin} onChange={(e) => setFormData({ ...formData, origin: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Destination *</label>
                <input type="text" required value={formData.destination} onChange={(e) => setFormData({ ...formData, destination: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Origin Country *</label>
                <select required value={formData.origin_country} onChange={(e) => setFormData({ ...formData, origin_country: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Destination Country *</label>
                <select required value={formData.destination_country} onChange={(e) => setFormData({ ...formData, destination_country: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Distance (km)</label>
                <input type="number" value={formData.distance_km} onChange={(e) => setFormData({ ...formData, distance_km: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estimated Days</label>
                <input type="number" value={formData.estimated_days} onChange={(e) => setFormData({ ...formData, estimated_days: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cost per Ton (USD)</label>
                <input type="number" step="0.01" value={formData.cost_per_ton} onChange={(e) => setFormData({ ...formData, cost_per_ton: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                {editingRoute ? 'Update' : 'Create'} Route
              </button>
              <button type="button" onClick={resetForm} className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Route</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Distance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Days</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Cost/Ton</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredRoutes.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">No routes found</td></tr>
              ) : (
                filteredRoutes.map((route) => (
                  <tr key={route.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{route.origin} → {route.destination}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{route.origin_country} → {route.destination_country}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{route.distance_km || 'N/A'} km</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{route.estimated_days || 'N/A'} days</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">${route.cost_per_ton || 'N/A'}</td>
                    <td className="px-6 py-4"><StatusBadge status={route.status === 'active' ? 'active' : 'inactive'} /></td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(route)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400"><Edit2 className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(route.id)} className="text-red-600 hover:text-red-900 dark:text-red-400"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminLogisticsManager;

