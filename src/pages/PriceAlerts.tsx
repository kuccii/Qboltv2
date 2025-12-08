import React, { useState, useEffect } from 'react';
import {
  BellPlus,
  Bell,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Plus,
  X,
  Edit2,
  Trash2,
  Check
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useIndustry } from '../contexts/IndustryContext';
import { unifiedApi } from '../services/unifiedApi';
import DashboardCard from '../components/DashboardCard';
import StatusBadge from '../components/StatusBadge';

interface PriceAlert {
  id: string;
  material: string;
  condition: 'above' | 'below' | 'change';
  threshold: number;
  changePercent?: number;
  country: string;
  location?: string;
  active: boolean;
  createdAt: Date;
  lastTriggered?: Date;
  triggerCount?: number;
  notificationPreferences?: {
    email?: boolean;
    in_app?: boolean;
    sms?: boolean;
  };
}

const PriceAlerts: React.FC = () => {
  const { currentIndustry } = useIndustry();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    material: '',
    condition: 'above' as 'above' | 'below' | 'change',
    threshold: '',
    changePercent: '',
    country: 'Kenya',
    location: '',
    notificationEmail: true,
    notificationInApp: true,
    notificationSms: false
  });

  const materials = currentIndustry === 'construction'
    ? ['Cement', 'Steel Bars', 'Timber', 'Sand', 'Ballast', 'Roofing Sheets']
    : ['Fertilizer (DAP)', 'Fertilizer (NPK)', 'Maize Seeds', 'Pesticide'];

  const countries = ['Kenya', 'Rwanda', 'Uganda', 'Tanzania'];

  // Fetch real alerts from Supabase
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await unifiedApi.priceAlerts.get({ active: true });
        setAlerts(data.map((alert: any) => ({
          id: alert.id,
          material: alert.material,
          condition: alert.condition,
          threshold: alert.threshold || 0,
          changePercent: alert.change_percent,
          country: alert.country,
          location: alert.location,
          active: alert.active,
          createdAt: new Date(alert.created_at),
          lastTriggered: alert.last_triggered ? new Date(alert.last_triggered) : undefined,
          triggerCount: alert.trigger_count || 0,
          notificationPreferences: alert.notification_preferences || {
            email: true,
            in_app: true,
            sms: false
          }
        })));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load alerts');
        // Fallback to empty array
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  const handleCreateAlert = async () => {
    if (!formData.material || !formData.country) return;
    if (formData.condition !== 'change' && !formData.threshold) return;
    if (formData.condition === 'change' && !formData.changePercent) return;

    try {
      const newAlert = await unifiedApi.priceAlerts.create({
        material: formData.material,
        country: formData.country,
        location: formData.location || undefined,
        condition: formData.condition,
        threshold: formData.condition !== 'change' ? parseFloat(formData.threshold) : undefined,
        change_percent: formData.condition === 'change' ? parseFloat(formData.changePercent) : undefined,
        notification_preferences: {
          email: formData.notificationEmail,
          in_app: formData.notificationInApp,
          sms: formData.notificationSms
        }
      });

      setAlerts(prev => [{
        id: newAlert.id,
        material: newAlert.material,
        condition: newAlert.condition,
        threshold: newAlert.threshold || 0,
        changePercent: newAlert.change_percent,
        country: newAlert.country,
        location: newAlert.location,
        active: newAlert.active,
        createdAt: new Date(newAlert.created_at),
        triggerCount: newAlert.trigger_count || 0,
        notificationPreferences: newAlert.notification_preferences || {
          email: true,
          in_app: true,
          sms: false
        }
      }, ...prev]);

      setFormData({
        material: '',
        condition: 'above',
        threshold: '',
        changePercent: '',
        country: 'Kenya',
        location: '',
        notificationEmail: true,
        notificationInApp: true,
        notificationSms: false
      });
      setShowCreateForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create alert');
    }
  };

  const toggleAlert = async (id: string) => {
    const alert = alerts.find(a => a.id === id);
    if (!alert) return;

    try {
      await unifiedApi.priceAlerts.update(id, { active: !alert.active });
      setAlerts(prev =>
        prev.map(alert =>
          alert.id === id ? { ...alert, active: !alert.active } : alert
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update alert');
    }
  };

  const deleteAlert = async (id: string) => {
    if (!confirm('Are you sure you want to delete this alert?')) return;

    try {
      await unifiedApi.priceAlerts.delete(id);
      setAlerts(prev => prev.filter(alert => alert.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete alert');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Price Alerts</h1>
          <p className="text-gray-600 mt-1">
            Get notified when prices reach your thresholds
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          <span>New Alert</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <DashboardCard>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Bell className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Alerts</p>
              <p className="text-2xl font-bold text-gray-900">{alerts.length}</p>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Alerts</p>
              <p className="text-2xl font-bold text-gray-900">
                {alerts.filter(a => a.active).length}
              </p>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-50 rounded-lg">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Triggered Today</p>
              <p className="text-2xl font-bold text-gray-900">2</p>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* Create Alert Form */}
      {showCreateForm && (
        <DashboardCard>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Create New Alert</h2>
            <button
              onClick={() => setShowCreateForm(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Material
              </label>
              <select
                value={formData.material}
                onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select Material</option>
                {materials.map(mat => (
                  <option key={mat} value={mat}>{mat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <select
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condition
              </label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="above">Price goes above</option>
                <option value="below">Price goes below</option>
                <option value="change">Price changes by</option>
              </select>
            </div>

            {formData.condition !== 'change' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Threshold (KES)
                </label>
                <input
                  type="number"
                  value={formData.threshold}
                  onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
                  placeholder="e.g., 900"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Change Percentage (%)
                </label>
                <input
                  type="number"
                  value={formData.changePercent}
                  onChange={(e) => setFormData({ ...formData, changePercent: e.target.value })}
                  placeholder="e.g., 5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateAlert}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Create Alert
            </button>
          </div>
        </DashboardCard>
      )}

      {/* Alerts List */}
      <DashboardCard>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Alerts</h2>

        {alerts.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No alerts configured</p>
            <p className="text-sm text-gray-500 mb-4">
              Create your first price alert to get started
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Create Alert
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map(alert => (
              <div
                key={alert.id}
                className={`p-4 border rounded-lg flex items-center justify-between ${
                  alert.active ? 'border-gray-200 bg-white' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className={`p-2 rounded-lg ${alert.active ? 'bg-blue-50' : 'bg-gray-200'}`}>
                    <Bell className={`h-5 w-5 ${alert.active ? 'text-blue-600' : 'text-gray-400'}`} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{alert.material}</h3>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-600">{alert.country}</span>
                      {alert.active && (
                        <StatusBadge variant="success" size="sm">Active</StatusBadge>
                      )}
                      {!alert.active && (
                        <StatusBadge variant="secondary" size="sm">Inactive</StatusBadge>
                      )}
                    </div>

                    <p className="text-sm text-gray-600">
                      {alert.condition === 'above' && `Alert when price goes above ${alert.threshold} KES`}
                      {alert.condition === 'below' && `Alert when price goes below ${alert.threshold} KES`}
                      {alert.condition === 'change' && `Alert when price changes by ${alert.changePercent}%`}
                      {alert.location && (
                        <span className="text-xs text-gray-500 ml-2">• {alert.location}</span>
                      )}
                    </p>

                    <div className="flex items-center gap-3 mt-1">
                      {alert.triggerCount !== undefined && alert.triggerCount > 0 && (
                        <span className="text-xs text-blue-600">
                          Triggered {alert.triggerCount} time{alert.triggerCount > 1 ? 's' : ''}
                        </span>
                      )}
                      {alert.lastTriggered && (
                        <span className="text-xs text-gray-500">
                          Last: {new Date(alert.lastTriggered).toLocaleDateString()}
                        </span>
                      )}
                      {alert.notificationPreferences && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          {alert.notificationPreferences.email && <span>📧</span>}
                          {alert.notificationPreferences.in_app && <span>🔔</span>}
                          {alert.notificationPreferences.sms && <span>📱</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleAlert(alert.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    title={alert.active ? 'Deactivate' : 'Activate'}
                  >
                    {alert.active ? (
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                    ) : (
                      <Check className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={() => deleteAlert(alert.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardCard>

      {/* How It Works */}
      <DashboardCard>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">How Price Alerts Work</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold">
              1
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Set Your Threshold</h3>
              <p className="text-sm text-gray-600">
                Choose a material, country, and price threshold or percentage change
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold">
              2
            </div>
            <div>
              <h3 className="font-medium text-gray-900">We Monitor 24/7</h3>
              <p className="text-sm text-gray-600">
                Our system continuously tracks price changes across all markets
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold">
              3
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Get Instant Notifications</h3>
              <p className="text-sm text-gray-600">
                Receive email and in-app notifications when your threshold is reached
              </p>
            </div>
          </div>
        </div>
      </DashboardCard>
    </div>
  );
};

export default PriceAlerts;

