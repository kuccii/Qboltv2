import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Palette, 
  Globe, 
  Bell, 
  Shield, 
  Database,
  Download,
  Upload,
  Trash2,
  Save,
  RotateCcw,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import {
  AppLayout,
  PageHeader,
  PageLayout,
  SectionLayout,
  FormField,
  SelectInput,
  ActionMenu
} from '../design-system';

const Settings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [settings, setSettings] = useState({
    theme: theme,
    language: 'en',
    timezone: 'Africa/Nairobi',
    dateFormat: 'DD/MM/YYYY',
    currency: 'KES',
    notifications: {
      email: true,
      push: true,
      sms: false,
      priceAlerts: true,
      supplierUpdates: true,
      documentExpiry: true,
      systemUpdates: false
    },
    privacy: {
      profileVisibility: 'public',
      dataSharing: false,
      analytics: true,
      marketing: false
    },
    display: {
      itemsPerPage: 20,
      autoRefresh: true,
      refreshInterval: 30,
      showTooltips: true,
      compactMode: false
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('qivook_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      }
    }
  }, []);

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'sw', label: 'Swahili' },
    { value: 'fr', label: 'French' }
  ];

  const timezoneOptions = [
    { value: 'Africa/Nairobi', label: 'Nairobi (EAT)' },
    { value: 'Africa/Kampala', label: 'Kampala (EAT)' },
    { value: 'Africa/Kigali', label: 'Kigali (CAT)' },
    { value: 'Africa/Dar_es_Salaam', label: 'Dar es Salaam (EAT)' },
    { value: 'Africa/Addis_Ababa', label: 'Addis Ababa (EAT)' }
  ];

  const currencyOptions = [
    { value: 'KES', label: 'Kenyan Shilling (KES)' },
    { value: 'UGX', label: 'Ugandan Shilling (UGX)' },
    { value: 'RWF', label: 'Rwandan Franc (RWF)' },
    { value: 'TZS', label: 'Tanzanian Shilling (TZS)' },
    { value: 'ETB', label: 'Ethiopian Birr (ETB)' },
    { value: 'USD', label: 'US Dollar (USD)' }
  ];

  const dateFormatOptions = [
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }
  ];

  const profileVisibilityOptions = [
    { value: 'public', label: 'Public' },
    { value: 'private', label: 'Private' },
    { value: 'contacts', label: 'Contacts Only' }
  ];

  const handleSettingChange = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
  };

  const handleDirectSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      // Save to localStorage
      localStorage.setItem('qivook_settings', JSON.stringify(settings));
      
      // Apply theme change
      if (settings.theme !== theme) {
        toggleTheme();
      }
      
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    const defaultSettings = {
      theme: 'light',
      language: 'en',
      timezone: 'Africa/Nairobi',
      dateFormat: 'DD/MM/YYYY',
      currency: 'KES',
      notifications: {
        email: true,
        push: true,
        sms: false,
        priceAlerts: true,
        supplierUpdates: true,
        documentExpiry: true,
        systemUpdates: false
      },
      privacy: {
        profileVisibility: 'public',
        dataSharing: false,
        analytics: true,
        marketing: false
      },
      display: {
        itemsPerPage: 20,
        autoRefresh: true,
        refreshInterval: 30,
        showTooltips: true,
        compactMode: false
      }
    };
    setSettings(defaultSettings);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'qivook-settings.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string);
          setSettings(importedSettings);
          setMessage({ type: 'success', text: 'Settings imported successfully!' });
        } catch (error) {
          setMessage({ type: 'error', text: 'Failed to import settings. Invalid file format.' });
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Settings"
        subtitle="Customize your app experience and preferences"
        breadcrumbs={[{ label: 'Settings' }]}
        actions={
          <div className="flex items-center gap-3">
            <ActionMenu
              items={[
                { id: 'export', label: 'Export Settings', icon: <Download className="h-4 w-4" />, description: 'Download your settings as a file', onClick: handleExport },
                { id: 'import', label: 'Import Settings', icon: <Upload className="h-4 w-4" />, description: 'Import settings from a file', onClick: () => document.getElementById('import-file')?.click() },
                { id: 'reset', label: 'Reset to Default', icon: <RotateCcw className="h-4 w-4" />, description: 'Reset all settings to default values', onClick: handleReset }
              ]}
              size="sm"
            />
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
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

          {/* Hidden file input for import */}
          <input
            id="import-file"
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />

          {/* Appearance Settings */}
          <SectionLayout title="Appearance" subtitle="Customize the look and feel of the application">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Theme"
                icon={<Palette size={18} />}
              >
                <SelectInput
                  value={settings.theme}
                  onChange={(value: string) => handleDirectSettingChange('theme', value)}
                  options={[
                    { value: 'light', label: 'Light' },
                    { value: 'dark', label: 'Dark' },
                    { value: 'system', label: 'System' }
                  ]}
                />
              </FormField>

              <FormField
                label="Language"
                icon={<Globe size={18} />}
              >
                <SelectInput
                  value={settings.language}
                  onChange={(value: string) => handleDirectSettingChange('language', value)}
                  options={languageOptions}
                />
              </FormField>
            </div>
          </SectionLayout>

          {/* Regional Settings */}
          <SectionLayout title="Regional Settings" subtitle="Configure your location and currency preferences">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                label="Timezone"
                icon={<Globe size={18} />}
              >
                <SelectInput
                  value={settings.timezone}
                  onChange={(value: string) => handleDirectSettingChange('timezone', value)}
                  options={timezoneOptions}
                />
              </FormField>

              <FormField
                label="Currency"
                icon={<Database size={18} />}
              >
                <SelectInput
                  value={settings.currency}
                  onChange={(value: string) => handleDirectSettingChange('currency', value)}
                  options={currencyOptions}
                />
              </FormField>

              <FormField
                label="Date Format"
                icon={<SettingsIcon size={18} />}
              >
                <SelectInput
                  value={settings.dateFormat}
                  onChange={(value: string) => handleDirectSettingChange('dateFormat', value)}
                  options={dateFormatOptions}
                />
              </FormField>
            </div>
          </SectionLayout>

          {/* Notification Settings */}
          <SectionLayout title="Notifications" subtitle="Choose how you want to be notified">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">Notification Channels</h4>
                  {Object.entries(settings.notifications).map(([key, value]) => (
                    <label key={key} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <input
                        type="checkbox"
                        checked={value as boolean}
                        onChange={(e) => handleSettingChange('notifications', key, e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </SectionLayout>

          {/* Privacy Settings */}
          <SectionLayout title="Privacy & Security" subtitle="Control your data and privacy preferences">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Profile Visibility"
                icon={<Shield size={18} />}
              >
                <SelectInput
                  value={settings.privacy.profileVisibility}
                  onChange={(value: string) => handleSettingChange('privacy', 'profileVisibility', value)}
                  options={profileVisibilityOptions}
                />
              </FormField>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white">Data & Privacy</h4>
                {Object.entries(settings.privacy).filter(([key]) => key !== 'profileVisibility').map(([key, value]) => (
                  <label key={key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <input
                      type="checkbox"
                      checked={value as boolean}
                      onChange={(e) => handleSettingChange('privacy', key, e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                    />
                  </label>
                ))}
              </div>
            </div>
          </SectionLayout>

          {/* Display Settings */}
          <SectionLayout title="Display & Performance" subtitle="Customize how content is displayed">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Items per page"
                icon={<SettingsIcon size={18} />}
              >
                <SelectInput
                  value={settings.display.itemsPerPage.toString()}
                  onChange={(value: string) => handleSettingChange('display', 'itemsPerPage', parseInt(value))}
                  options={[
                    { value: '10', label: '10 items' },
                    { value: '20', label: '20 items' },
                    { value: '50', label: '50 items' },
                    { value: '100', label: '100 items' }
                  ]}
                />
              </FormField>

              <FormField
                label="Refresh Interval (seconds)"
                icon={<RotateCcw size={18} />}
              >
                <SelectInput
                  value={settings.display.refreshInterval.toString()}
                  onChange={(value: string) => handleSettingChange('display', 'refreshInterval', parseInt(value))}
                  options={[
                    { value: '15', label: '15 seconds' },
                    { value: '30', label: '30 seconds' },
                    { value: '60', label: '1 minute' },
                    { value: '300', label: '5 minutes' }
                  ]}
                />
              </FormField>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white">Display Options</h4>
                {Object.entries(settings.display).filter(([key]) => !['itemsPerPage', 'refreshInterval'].includes(key)).map(([key, value]) => (
                  <label key={key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <input
                      type="checkbox"
                      checked={value as boolean}
                      onChange={(e) => handleSettingChange('display', key, e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                    />
                  </label>
                ))}
              </div>
            </div>
          </SectionLayout>

          {/* Data Management */}
          <SectionLayout title="Data Management" subtitle="Manage your data and account">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Download size={24} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Export Data</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Download all your data</p>
                  <button
                    onClick={handleExport}
                    className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                  >
                    Export
                  </button>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Upload size={24} className="text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Import Data</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Import settings and data</p>
                  <button
                    onClick={() => document.getElementById('import-file')?.click()}
                    className="px-4 py-2 text-sm font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                  >
                    Import
                  </button>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Trash2 size={24} className="text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Reset Settings</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Reset to default values</p>
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </SectionLayout>
        </div>
      </PageLayout>
    </AppLayout>
  );
};

export default Settings;
