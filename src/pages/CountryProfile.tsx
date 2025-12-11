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

  // Only show loading on initial load, not when switching tabs
  if (loading && !countryProfile && !error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="animate-spin h-8 w-8 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading country profile...</p>
        </div>
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
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Playful Header */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 dark:from-primary-600 dark:via-purple-600 dark:to-pink-600 rounded-2xl p-5 sm:p-6 shadow-2xl border-4 border-white/20 dark:border-white/10 mb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                <span className="text-4xl">{currentCountry.flag}</span>
                <span>{currentCountry.name} Explorer! 🌍</span>
              </h1>
              <p className="text-base text-white/90 dark:text-white/80 mt-2 flex items-center gap-2">
                <span>✨</span>
                {countryProfile?.description || 'Learn all about this amazing country!'}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="text-sm px-4 py-2 rounded-xl border-2 border-white/30 bg-white/20 text-white font-bold">
                {normalizedCountryCode}
              </div>
              {countryProfile && (
                <div className="text-sm px-4 py-2 rounded-xl border-2 border-green-300 bg-green-500/30 text-white font-bold flex items-center gap-2">
                  <CheckCircle size={16} />
                  Active
                </div>
              )}
              {prevCountry && (
                <button
                  onClick={() => handleCountryChange(prevCountry.code)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-white/20 hover:bg-white/30 text-white rounded-xl border-2 border-white/30 transition-all transform hover:scale-105"
                  title={`Previous: ${prevCountry.name}`}
                >
                  <ArrowLeft size={18} />
                  <span className="hidden sm:inline">{prevCountry.name}</span>
                </button>
              )}
              {nextCountry && (
                <button
                  onClick={() => handleCountryChange(nextCountry.code)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-white/20 hover:bg-white/30 text-white rounded-xl border-2 border-white/30 transition-all transform hover:scale-105"
                  title={`Next: ${nextCountry.name}`}
                >
                  <span className="hidden sm:inline">{nextCountry.name}</span>
                  <ArrowRight size={18} />
                </button>
              )}
              <select
                value={normalizedCountryCode}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="px-4 py-2 text-sm font-bold bg-white/20 hover:bg-white/30 text-white rounded-xl border-2 border-white/30 transition-colors cursor-pointer"
                style={{ color: 'white' }}
              >
                {availableCountries.map(c => (
                  <option key={c.code} value={c.code} style={{ color: '#1f2937', backgroundColor: 'white' }}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Playful Tabs */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-primary-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-2 border-2 border-primary-200 dark:border-gray-700 shadow-lg overflow-x-auto scrollbar-hide">
          <button
            onClick={() => handleTabChange('overview')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-3 text-sm sm:text-base font-bold rounded-xl transition-all whitespace-nowrap flex-shrink-0 transform hover:scale-105 ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg scale-105'
                : 'text-gray-600 dark:text-gray-400 hover:bg-primary-100 dark:hover:bg-gray-700 hover:text-primary-700 dark:hover:text-primary-300'
            }`}
          >
            <span>📊</span>
            <span>Overview</span>
          </button>
          <button
            onClick={() => handleTabChange('infrastructure')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-3 text-sm sm:text-base font-bold rounded-xl transition-all whitespace-nowrap flex-shrink-0 transform hover:scale-105 ${
              activeTab === 'infrastructure'
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg scale-105'
                : 'text-gray-600 dark:text-gray-400 hover:bg-purple-100 dark:hover:bg-gray-700 hover:text-purple-700 dark:hover:text-purple-300'
            }`}
          >
            <span>🏗️</span>
            <span>Infrastructure</span>
          </button>
          <button
            onClick={() => handleTabChange('pricing')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-3 text-sm sm:text-base font-bold rounded-xl transition-all whitespace-nowrap flex-shrink-0 transform hover:scale-105 ${
              activeTab === 'pricing'
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg scale-105'
                : 'text-gray-600 dark:text-gray-400 hover:bg-green-100 dark:hover:bg-gray-700 hover:text-green-700 dark:hover:text-green-300'
            }`}
          >
            <span>💰</span>
            <span>Pricing</span>
          </button>
          <button
            onClick={() => handleTabChange('contacts')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-3 text-sm sm:text-base font-bold rounded-xl transition-all whitespace-nowrap flex-shrink-0 transform hover:scale-105 ${
              activeTab === 'contacts'
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg scale-105'
                : 'text-gray-600 dark:text-gray-400 hover:bg-orange-100 dark:hover:bg-gray-700 hover:text-orange-700 dark:hover:text-orange-300'
            }`}
          >
            <span>👥</span>
            <span>Contacts</span>
          </button>
          <button
            onClick={() => handleTabChange('intelligence')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-3 text-sm sm:text-base font-bold rounded-xl transition-all whitespace-nowrap flex-shrink-0 transform hover:scale-105 ${
              activeTab === 'intelligence'
                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg scale-105'
                : 'text-gray-600 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-gray-700 hover:text-red-700 dark:hover:text-red-300'
            }`}
          >
            <span>🛡️</span>
            <span>Intelligence</span>
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

