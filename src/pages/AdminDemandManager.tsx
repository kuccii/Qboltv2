import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, TrendingUp, AlertCircle } from 'lucide-react';
import { unifiedApi } from '../services/unifiedApi';
import DashboardCard from '../components/DashboardCard';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminDemandManager: React.FC = () => {
  const [demandData, setDemandData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    region: '',
    country: 'Kenya',
    material: '',
    industry: 'construction',
    demand_quantity: '',
    demand_period: 'monthly',
    source: ''
  });

  const countries = ['Kenya', 'Rwanda', 'Uganda', 'Tanzania', 'Ethiopia', 'Somalia'];
  const industries = ['construction', 'agriculture'];
  const periods = ['monthly', 'quarterly', 'yearly'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await unifiedApi.demand.getAll({ limit: 1000 });
      setDemandData(result.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load demand data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        demand_quantity: formData.demand_quantity ? parseFloat(formData.demand_quantity) : undefined,
      };
      if (editingItem) {
        await unifiedApi.demand.update(editingItem.id, data);
      } else {
        await unifiedApi.demand.create(data);
      }
      resetForm();
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to save');
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      region: item.region,
      country: item.country,
      material: item.material,
      industry: item.industry,
      demand_quantity: (item.demand_quantity || '').toString(),
      demand_period: item.demand_period || 'monthly',
      source: item.source || ''
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this demand data?')) return;
    try {
      await unifiedApi.demand.delete(id);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  const resetForm = () => {
    setFormData({
      region: '',
      country: 'Kenya',
      material: '',
      industry: 'construction',
      demand_quantity: '',
      demand_period: 'monthly',
      source: ''
    });
    setShowCreateForm(false);
    setEditingItem(null);
  };

  const filteredData = demandData.filter(d =>
    searchTerm === '' ||
    d.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.region.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Demand Data Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage market demand data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <DashboardCard>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Records</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{demandData.length}</p>
            </div>
          </div>
        </DashboardCard>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search demand data..."
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
          <span>Add Demand Data</span>
        </button>
      </div>

      {showCreateForm && (
        <div className="mb-6 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            {editingItem ? 'Edit Demand Data' : 'Add New Demand Data'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Region *</label>
                <input type="text" required value={formData.region} onChange={(e) => setFormData({ ...formData, region: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country *</label>
                <select required value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Material *</label>
                <input type="text" required value={formData.material} onChange={(e) => setFormData({ ...formData, material: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Industry *</label>
                <select required value={formData.industry} onChange={(e) => setFormData({ ...formData, industry: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  {industries.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Demand Quantity</label>
                <input type="number" value={formData.demand_quantity} onChange={(e) => setFormData({ ...formData, demand_quantity: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Demand Period</label>
                <select value={formData.demand_period} onChange={(e) => setFormData({ ...formData, demand_period: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  {periods.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Source</label>
                <input type="text" value={formData.source} onChange={(e) => setFormData({ ...formData, source: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                {editingItem ? 'Update' : 'Create'}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Region</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Country</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Material</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Industry</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Period</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredData.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">No demand data found</td></tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{item.region}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{item.country}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{item.material}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white capitalize">{item.industry}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{item.demand_quantity || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{item.demand_period || 'N/A'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(item)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400"><Edit2 className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900 dark:text-red-400"><Trash2 className="h-4 w-4" /></button>
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

export default AdminDemandManager;

