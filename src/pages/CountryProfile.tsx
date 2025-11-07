// Unified Country Profile Page
// Consolidates: Suppliers, Pricing, Infrastructure, Contacts, Logistics, Demand, Intelligence
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  MapPin, 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  Users,
  Building2,
  Truck,
  Fuel,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Globe,
  Phone,
  Mail,
  ExternalLink,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  FileText,
  Shield
} from 'lucide-react';
import { unifiedApi } from '../services/unifiedApi';
import RwandaOverview from '../components/rwanda/RwandaOverview';
import RwandaInfrastructureOverview from '../components/rwanda/RwandaInfrastructureOverview';
import RwandaContactDirectory from '../components/rwanda/RwandaContactDirectory';
import RwandaPricingIntelligence from '../components/rwanda/RwandaPricingIntelligence';
import RwandaSmartFeatures from '../components/rwanda/RwandaSmartFeatures';

const availableCountries = [
  { code: 'RW', name: 'Rwanda', flag: '🇷🇼' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
  { code: 'UG', name: 'Uganda', flag: '🇺🇬' },
  { code: 'TZ', name: 'Tanzania', flag: '🇹🇿' },
  { code: 'ET', name: 'Ethiopia', flag: '🇪🇹' },
];

const CountryProfile: React.FC = () => {
  const { countryCode } = useParams<{ countryCode?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'overview' | 'infrastructure' | 'pricing' | 'contacts' | 'intelligence'>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countryProfile, setCountryProfile] = useState<any>(null);

  // If no country code, show country selector
  const normalizedCountryCode = countryCode?.toUpperCase() || 'RW';

  // Get current country index for navigation
  const currentCountryIndex = availableCountries.findIndex(c => c.code === normalizedCountryCode);
  const currentCountry = availableCountries[currentCountryIndex] || availableCountries[0];
  const prevCountry = currentCountryIndex > 0 ? availableCountries[currentCountryIndex - 1] : null;
  const nextCountry = currentCountryIndex < availableCountries.length - 1 ? availableCountries[currentCountryIndex + 1] : null;

  useEffect(() => {
    // If no country code in URL, redirect to default (RW)
    if (!countryCode) {
      navigate('/app/countries/rw', { replace: true });
      return;
    }

    // Parse active tab from URL or default to overview
    const path = location.pathname;
    if (path.includes('/infrastructure')) setActiveTab('infrastructure');
    else if (path.includes('/pricing')) setActiveTab('pricing');
    else if (path.includes('/contacts')) setActiveTab('contacts');
    else if (path.includes('/intelligence')) setActiveTab('intelligence');
    else setActiveTab('overview');

    loadCountryProfile();
  }, [countryCode, location.pathname, navigate]);

  const loadCountryProfile = async () => {
    if (!countryCode) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const profile = await unifiedApi.countries.getProfile(normalizedCountryCode);
      setCountryProfile(profile);
    } catch (err: any) {
      console.warn('Country profile not found in database (this is OK for new countries):', err);
      // Don't show error if profile doesn't exist (country not in DB yet)
      // This is expected for countries that haven't been seeded yet
      if (err?.code === 'PGRST116' || err?.message?.includes('PGRST116')) {
        setError(null); // Country profile not found, but continue showing empty state
        setCountryProfile(null); // No profile data
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load country profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCountryChange = (newCode: string) => {
    navigate(`/app/countries/${newCode.toLowerCase()}`);
  };

  const handleTabChange = (tab: 'overview' | 'infrastructure' | 'pricing' | 'contacts' | 'intelligence') => {
    setActiveTab(tab);
    navigate(`/app/countries/${countryCode?.toLowerCase()}/${tab}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin h-8 w-8 text-gray-400" />
      </div>
    );
  }

  // Only show error if it's a real error (not just missing profile)
  if (error && !countryProfile) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
        <p className="text-red-600">{error}</p>
        <button 
          onClick={loadCountryProfile}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/app')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{currentCountry.flag}</span>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentCountry.name}
                </h1>
                {countryProfile && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {countryProfile.description || 'Country Profile'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Country Navigation */}
          <div className="flex items-center gap-2">
            {prevCountry && (
              <button
                onClick={() => handleCountryChange(prevCountry.code)}
                className="flex items-center gap-2 px-3 py-2 text-sm border rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                title={`Previous: ${prevCountry.name}`}
              >
                <ArrowLeft size={16} />
                <span className="hidden sm:inline">{prevCountry.name}</span>
              </button>
            )}
            {nextCountry && (
              <button
                onClick={() => handleCountryChange(nextCountry.code)}
                className="flex items-center gap-2 px-3 py-2 text-sm border rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                title={`Next: ${nextCountry.name}`}
              >
                <span className="hidden sm:inline">{nextCountry.name}</span>
                <ArrowRight size={16} />
              </button>
            )}
            <select
              value={normalizedCountryCode}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-800"
            >
              {availableCountries.map(c => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => handleTabChange('overview')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <BarChart3 size={16} className="inline mr-2" />
            Overview
          </button>
          <button
            onClick={() => handleTabChange('infrastructure')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'infrastructure'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Building2 size={16} className="inline mr-2" />
            Infrastructure
          </button>
          <button
            onClick={() => handleTabChange('pricing')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'pricing'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <TrendingUp size={16} className="inline mr-2" />
            Pricing
          </button>
          <button
            onClick={() => handleTabChange('contacts')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'contacts'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Users size={16} className="inline mr-2" />
            Contacts
          </button>
          <button
            onClick={() => handleTabChange('intelligence')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'intelligence'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Shield size={16} className="inline mr-2" />
            Intelligence
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <RwandaOverview countryCode={normalizedCountryCode} />
        )}
        {activeTab === 'infrastructure' && (
          <RwandaInfrastructureOverview countryCode={normalizedCountryCode} />
        )}
        {activeTab === 'pricing' && (
          <RwandaPricingIntelligence countryCode={normalizedCountryCode} />
        )}
        {activeTab === 'contacts' && (
          <RwandaContactDirectory countryCode={normalizedCountryCode} />
        )}
        {activeTab === 'intelligence' && (
          <RwandaSmartFeatures countryCode={normalizedCountryCode} />
        )}
      </div>
    </div>
  );
};

export default CountryProfile;

