import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Mail, 
  Smartphone, 
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  X,
  Settings,
  Save,
  RotateCcw,
  Plus,
  Edit3,
  Trash2
} from 'lucide-react';
import {
  AppLayout,
  PageHeader,
  PageLayout,
  SectionLayout,
  FormField,
  SelectInput,
  ActionMenu
} from '../design-system';

interface NotificationRule {
  id: string;
  name: string;
  type: 'price' | 'supplier' | 'document' | 'system';
  condition: string;
  threshold?: number;
  channels: string[];
  enabled: boolean;
  createdAt: string;
}

const Notifications: React.FC = () => {
  const [notificationSettings, setNotificationSettings] = useState({
    email: {
      enabled: true,
      priceAlerts: true,
      supplierUpdates: true,
      documentExpiry: true,
      systemUpdates: false,
      weeklyDigest: true
    },
    push: {
      enabled: true,
      priceAlerts: true,
      supplierUpdates: false,
      documentExpiry: true,
      systemUpdates: true
    },
    sms: {
      enabled: false,
      priceAlerts: false,
      supplierUpdates: false,
      documentExpiry: true,
      systemUpdates: false
    }
  });

  const [notificationRules, setNotificationRules] = useState<NotificationRule[]>([
    {
      id: '1',
      name: 'Cement Price Alert',
      type: 'price',
      condition: 'price_change',
      threshold: 5,
      channels: ['email', 'push'],
      enabled: true,
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Document Expiry Warning',
      type: 'document',
      condition: 'expiry_warning',
      threshold: 30,
      channels: ['email', 'sms'],
      enabled: true,
      createdAt: '2024-01-10'
    },
    {
      id: '3',
      name: 'New Supplier Alert',
      type: 'supplier',
      condition: 'new_supplier',
      channels: ['email'],
      enabled: false,
      createdAt: '2024-01-05'
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showAddRule, setShowAddRule] = useState(false);
  const [editingRule, setEditingRule] = useState<NotificationRule | null>(null);

  const [newRule, setNewRule] = useState({
    name: '',
    type: 'price' as 'price' | 'supplier' | 'document' | 'system',
    condition: '',
    threshold: 0,
    channels: [] as string[],
    enabled: true
  });

  useEffect(() => {
    // Load notification settings from localStorage
    const savedSettings = localStorage.getItem('qivook_notification_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setNotificationSettings(parsed);
      } catch (error) {
        console.error('Failed to parse saved notification settings:', error);
      }
    }
  }, []);

  const handleChannelSettingChange = (channel: string, setting: string, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [channel]: {
        ...prev[channel as keyof typeof prev],
        [setting]: value
      }
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      // Save to localStorage
      localStorage.setItem('qivook_notification_settings', JSON.stringify(notificationSettings));
      setMessage({ type: 'success', text: 'Notification settings saved successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save notification settings. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    const defaultSettings = {
      email: {
        enabled: true,
        priceAlerts: true,
        supplierUpdates: true,
        documentExpiry: true,
        systemUpdates: false,
        weeklyDigest: true
      },
      push: {
        enabled: true,
        priceAlerts: true,
        supplierUpdates: false,
        documentExpiry: true,
        systemUpdates: true
      },
      sms: {
        enabled: false,
        priceAlerts: false,
        supplierUpdates: false,
        documentExpiry: true,
        systemUpdates: false
      }
    };
    setNotificationSettings(defaultSettings);
  };

  const handleAddRule = () => {
    if (newRule.name && newRule.condition) {
      const rule: NotificationRule = {
        id: Date.now().toString(),
        name: newRule.name,
        type: newRule.type,
        condition: newRule.condition,
        threshold: newRule.threshold,
        channels: newRule.channels,
        enabled: newRule.enabled,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setNotificationRules(prev => [...prev, rule]);
      setNewRule({
        name: '',
        type: 'price',
        condition: '',
        threshold: 0,
        channels: [],
        enabled: true
      });
      setShowAddRule(false);
    }
  };

  const handleEditRule = (rule: NotificationRule) => {
    setEditingRule(rule);
    setNewRule({
      name: rule.name,
      type: rule.type,
      condition: rule.condition,
      threshold: rule.threshold || 0,
      channels: rule.channels,
      enabled: rule.enabled
    });
    setShowAddRule(true);
  };

  const handleDeleteRule = (ruleId: string) => {
    setNotificationRules(prev => prev.filter(rule => rule.id !== ruleId));
  };

  const handleToggleRule = (ruleId: string) => {
    setNotificationRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return <Mail size={16} />;
      case 'push': return <Smartphone size={16} />;
      case 'sms': return <MessageSquare size={16} />;
      default: return <Bell size={16} />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'price': return <AlertTriangle size={16} className="text-orange-500" />;
      case 'supplier': return <CheckCircle size={16} className="text-green-500" />;
      case 'document': return <Settings size={16} className="text-primary-500" />;
      case 'system': return <Bell size={16} className="text-purple-500" />;
      default: return <Bell size={16} />;
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Notifications"
        subtitle="Manage your notification preferences and alerts"
        breadcrumbs={[{ label: 'Notifications' }]}
        actions={
          <div className="flex items-center gap-3">
            <ActionMenu
              items={[
                { id: 'reset', label: 'Reset to Default', icon: <RotateCcw className="h-4 w-4" />, description: 'Reset all notification settings to default', onClick: handleReset }
              ]}
              size="sm"
            />
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save size={16} className="mr-2" />
              )}
              Save Settings
            </button>
          </div>
        }
      />

      <PageLayout>
        <div className="space-y-6">
          {/* Message */}
          {message && (
            <div className={`p-4 rounded-lg flex items-center gap-3 ${
              message.type === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Channel Settings */}
          <SectionLayout title="Notification Channels" subtitle="Choose how you want to receive notifications">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Email Notifications */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                    <Mail size={20} className="text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Email</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Email notifications</p>
                  </div>
                  <label className="ml-auto">
                    <input
                      type="checkbox"
                      checked={notificationSettings.email.enabled}
                      onChange={(e) => handleChannelSettingChange('email', 'enabled', e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
                    />
                  </label>
                </div>
                <div className="space-y-3">
                  {Object.entries(notificationSettings.email).filter(([key]) => key !== 'enabled').map(([key, value]) => (
                    <label key={key} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <input
                        type="checkbox"
                        checked={value as boolean}
                        onChange={(e) => handleChannelSettingChange('email', key, e.target.checked)}
                        disabled={!notificationSettings.email.enabled}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded disabled:opacity-50"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Push Notifications */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                    <Smartphone size={20} className="text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Push</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Mobile notifications</p>
                  </div>
                  <label className="ml-auto">
                    <input
                      type="checkbox"
                      checked={notificationSettings.push.enabled}
                      onChange={(e) => handleChannelSettingChange('push', 'enabled', e.target.checked)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 dark:border-gray-600 rounded"
                    />
                  </label>
                </div>
                <div className="space-y-3">
                  {Object.entries(notificationSettings.push).filter(([key]) => key !== 'enabled').map(([key, value]) => (
                    <label key={key} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <input
                        type="checkbox"
                        checked={value as boolean}
                        onChange={(e) => handleChannelSettingChange('push', key, e.target.checked)}
                        disabled={!notificationSettings.push.enabled}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 dark:border-gray-600 rounded disabled:opacity-50"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* SMS Notifications */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                    <MessageSquare size={20} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">SMS</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Text messages</p>
                  </div>
                  <label className="ml-auto">
                    <input
                      type="checkbox"
                      checked={notificationSettings.sms.enabled}
                      onChange={(e) => handleChannelSettingChange('sms', 'enabled', e.target.checked)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-gray-600 rounded"
                    />
                  </label>
                </div>
                <div className="space-y-3">
                  {Object.entries(notificationSettings.sms).filter(([key]) => key !== 'enabled').map(([key, value]) => (
                    <label key={key} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <input
                        type="checkbox"
                        checked={value as boolean}
                        onChange={(e) => handleChannelSettingChange('sms', key, e.target.checked)}
                        disabled={!notificationSettings.sms.enabled}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-gray-600 rounded disabled:opacity-50"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </SectionLayout>

          {/* Notification Rules */}
          <SectionLayout 
            title="Custom Alert Rules" 
            subtitle="Create custom notification rules for specific conditions"
            actions={
              <button
                onClick={() => setShowAddRule(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors flex items-center"
              >
                <Plus size={16} className="mr-2" />
                Add Rule
              </button>
            }
          >
            <div className="space-y-4">
              {notificationRules.map((rule) => (
                <div key={rule.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(rule.type)}
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{rule.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {rule.condition} {rule.threshold && `(${rule.threshold}%)`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {rule.channels.map((channel) => (
                          <div key={channel} className="w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                            {getChannelIcon(channel)}
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => handleToggleRule(rule.id)}
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          rule.enabled
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {rule.enabled ? 'Enabled' : 'Disabled'}
                      </button>
                      <button
                        onClick={() => handleEditRule(rule)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionLayout>

          {/* Add/Edit Rule Modal */}
          {showAddRule && (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {editingRule ? 'Edit Rule' : 'Add New Rule'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddRule(false);
                      setEditingRule(null);
                      setNewRule({
                        name: '',
                        type: 'price',
                        condition: '',
                        threshold: 0,
                        channels: [],
                        enabled: true
                      });
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <FormField label="Rule Name">
                    <input
                      type="text"
                      value={newRule.name}
                      onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Enter rule name"
                    />
                  </FormField>

                  <FormField label="Type">
                    <SelectInput
                      value={newRule.type}
                      onChange={(value: string) => setNewRule(prev => ({ ...prev, type: value as any }))}
                      options={[
                        { value: 'price', label: 'Price Alert' },
                        { value: 'supplier', label: 'Supplier Update' },
                        { value: 'document', label: 'Document Alert' },
                        { value: 'system', label: 'System Notification' }
                      ]}
                    />
                  </FormField>

                  <FormField label="Condition">
                    <SelectInput
                      value={newRule.condition}
                      onChange={(value: string) => setNewRule(prev => ({ ...prev, condition: value }))}
                      options={[
                        { value: 'price_change', label: 'Price Change' },
                        { value: 'expiry_warning', label: 'Expiry Warning' },
                        { value: 'new_supplier', label: 'New Supplier' },
                        { value: 'system_update', label: 'System Update' }
                      ]}
                    />
                  </FormField>

                  {newRule.type === 'price' && (
                    <FormField label="Threshold (%)">
                      <input
                        type="number"
                        value={newRule.threshold}
                        onChange={(e) => setNewRule(prev => ({ ...prev, threshold: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Enter threshold percentage"
                      />
                    </FormField>
                  )}

                  <FormField label="Channels">
                    <div className="space-y-2">
                      {['email', 'push', 'sms'].map((channel) => (
                        <label key={channel} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={newRule.channels.includes(channel)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewRule(prev => ({ ...prev, channels: [...prev.channels, channel] }));
                              } else {
                                setNewRule(prev => ({ ...prev, channels: prev.channels.filter(c => c !== channel) }));
                              }
                            }}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{channel}</span>
                        </label>
                      ))}
                    </div>
                  </FormField>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="enabled"
                      checked={newRule.enabled}
                      onChange={(e) => setNewRule(prev => ({ ...prev, enabled: e.target.checked }))}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
                    />
                    <label htmlFor="enabled" className="text-sm text-gray-700 dark:text-gray-300">
                      Enable this rule
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-6">
                  <button
                    onClick={handleAddRule}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    {editingRule ? 'Update Rule' : 'Add Rule'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddRule(false);
                      setEditingRule(null);
                      setNewRule({
                        name: '',
                        type: 'price',
                        condition: '',
                        threshold: 0,
                        channels: [],
                        enabled: true
                      });
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </PageLayout>
    </AppLayout>
  );
};

export default Notifications;
