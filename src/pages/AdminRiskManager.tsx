import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { unifiedApi } from '../services/unifiedApi';
import DashboardCard from '../components/DashboardCard';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminRiskManager: React.FC = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAlert, setEditingAlert] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [formData, setFormData] = useState({
    alert_type: 'price_volatility',
    severity: 'medium',
    title: '',
    description: '',
    region: '',
    country: 'Kenya'
  });

  const alertTypes = ['price_volatility', 'supply_shortage', 'logistics_delay', 'supplier_risk', 'market_risk', 'compliance_issue'];
  const severities = ['low', 'medium', 'high', 'critical'];
  const countries = ['Kenya', 'Rwanda', 'Uganda', 'Tanzania', 'Ethiopia', 'Somalia'];

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const result = await unifiedApi.riskProfile.getAllAlerts({ limit: 1000 });
      setAlerts(result.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load risk alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAlert) {
        await unifiedApi.riskProfile.updateAlert(editingAlert.id, formData);
      } else {
        await unifiedApi.riskProfile.createAlert(formData);
      }
      resetForm();
      loadAlerts();
    } catch (err: any) {
      alert(err.message || 'Failed to save');
    }
  };

  const handleEdit = (alert: any) => {
    setEditingAlert(alert);
    setFormData({
      alert_type: alert.alert_type,
      severity: alert.severity,
      title: alert.title,
      description: alert.description || '',
      region: alert.region || '',
      country: alert.country || 'Kenya'
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this risk alert?')) return;
    try {
      await unifiedApi.riskProfile.deleteAlert(id);
      loadAlerts();
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await unifiedApi.riskProfile.resolveAlert(id);
      loadAlerts();
    } catch (err: any) {
      alert(err.message || 'Failed to resolve');
    }
  };

  const resetForm = () => {
    setFormData({
      alert_type: 'price_volatility',
      severity: 'medium',
      title: '',
      description: '',
      region: '',
      country: 'Kenya'
    });
    setShowCreateForm(false);
    setEditingAlert(null);
  };

  const filteredAlerts = alerts
    .filter(a => searchTerm === '' || a.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(a => selectedSeverity === 'all' || a.severity === selectedSeverity);

  if (loading) return <LoadingSpinner fullScreen />;
  if (error) return (
    <div className="p-6">
      <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
      <p className="text-red-600">{error}</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Risk Alert Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage risk alerts and monitoring</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <DashboardCard>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Alerts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{alerts.length}</p>
            </div>
          </div>
        </DashboardCard>
        <DashboardCard>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {alerts.filter(a => !a.resolved).length}
              </p>
            </div>
          </div>
        </DashboardCard>
        <DashboardCard>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Resolved</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {alerts.filter(a => a.resolved).length}
              </p>
            </div>
          </div>
        </DashboardCard>
        <DashboardCard>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-lg">
              <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Critical</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {alerts.filter(a => a.severity === 'critical' && !a.resolved).length}
              </p>
            </div>
          </div>
        </DashboardCard>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex-1 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">All Severities</option>
            {severities.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button
          onClick={() => { resetForm(); setShowCreateForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          <span>Add Alert</span>
        </button>
      </div>

      {showCreateForm && (
        <div className="mb-6 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            {editingAlert ? 'Edit Risk Alert' : 'Add New Risk Alert'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alert Type *</label>
                <select required value={formData.alert_type} onChange={(e) => setFormData({ ...formData, alert_type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  {alertTypes.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Severity *</label>
                <select required value={formData.severity} onChange={(e) => setFormData({ ...formData, severity: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  {severities.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Region</label>
                <input type="text" value={formData.region} onChange={(e) => setFormData({ ...formData, region: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
                <select value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                {editingAlert ? 'Update' : 'Create'} Alert
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Severity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAlerts.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">No alerts found</td></tr>
              ) : (
                filteredAlerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{alert.title}</div>
                      {alert.description && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{alert.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white capitalize">{alert.alert_type?.replace('_', ' ')}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        alert.severity === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                        alert.severity === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                        alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {alert.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {alert.region && `${alert.region}, `}{alert.country || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={alert.resolved ? 'resolved' : 'active'} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {!alert.resolved && (
                          <button onClick={() => handleResolve(alert.id)} className="text-green-600 hover:text-green-900 dark:text-green-400" title="Resolve">
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        <button onClick={() => handleEdit(alert)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400"><Edit2 className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(alert.id)} className="text-red-600 hover:text-red-900 dark:text-red-400"><Trash2 className="h-4 w-4" /></button>
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

export default AdminRiskManager;

