// Main Rwanda Logistics page with overview and navigation
import React, { useState, useEffect } from 'react';
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
  ExternalLink
} from 'lucide-react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import RwandaNavigation from '../components/rwanda/RwandaNavigation';
import RwandaSupplierCard from '../components/rwanda/RwandaSupplierCard';
import RwandaOverview from '../components/rwanda/RwandaOverview';
import RwandaContactDirectory from '../components/rwanda/RwandaContactDirectory';
import RwandaPricingIntelligence from '../components/rwanda/RwandaPricingIntelligence';
import { CountrySupplier, CountryData, CountryStats } from '../data/countries/types';
import { getRwandaData, getRwandaStats, searchRwandaSuppliers } from '../data/countries/rwanda/rwandaDataLoader';
import { unifiedApi } from '../services/unifiedApi';
import { exportRwandaComprehensiveReport } from '../utils/pdfExport';

const RwandaLogistics: React.FC = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [rwandaData, setRwandaData] = useState<CountryData | null>(null);
  const [stats, setStats] = useState<CountryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    loadRwandaData();
  }, []);

  useEffect(() => {
    // Update active section based on current route
    const path = location.pathname;
    if (path.includes('/profile')) setActiveSection('profile');
    else if (path.includes('/infrastructure')) setActiveSection('infrastructure');
    else if (path.includes('/services')) setActiveSection('services');
    else if (path.includes('/contacts')) setActiveSection('contacts');
    else setActiveSection('overview');
  }, [location.pathname]);

  const loadRwandaData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch from database first, fallback to JSON files
      try {
        const [profile, dbStats] = await Promise.all([
          unifiedApi.countries.getProfile('RW'),
          unifiedApi.countries.getStats('RW')
        ]);

        setStats(dbStats);
        
        // Build CountryData object from database
        const [suppliers, infrastructure, pricing, government] = await Promise.all([
          unifiedApi.countries.getSuppliers('RW'),
          unifiedApi.countries.getInfrastructure('RW'),
          unifiedApi.countries.getPricing('RW'),
          unifiedApi.countries.getGovernmentContacts('RW')
        ]);

        setRwandaData({
          profile: {
            code: profile.code as any,
            name: profile.name,
            flag: profile.flag || '🇷🇼',
            currency: profile.currency,
            regions: profile.regions || [],
            description: profile.description,
            population: profile.population,
            gdp: profile.gdp ? parseFloat(profile.gdp.toString()) : undefined,
            lastUpdated: profile.last_updated,
            dataSource: profile.data_source || 'database',
            completeness: profile.completeness || 0
          },
          suppliers: suppliers.map((s: any) => ({
            id: s.id,
            countryCode: 'RW' as const,
            name: s.name,
            category: s.category,
            location: s.location,
            region: s.region || '',
            contact: {
              email: s.email || '',
              phone: s.phone || '',
              website: s.website,
              address: s.address
            },
            services: s.services || [],
            materials: s.materials || [],
            certifications: s.certifications || [],
            verified: s.verified || false,
            rating: s.rating,
            dataSource: s.data_source || 'user_contributed',
            description: s.description
          })),
          infrastructure: infrastructure.map((i: any) => ({
            id: i.id,
            countryCode: 'RW' as const,
            type: i.type,
            name: i.name,
            location: i.location,
            coordinates: i.latitude && i.longitude ? [i.latitude, i.longitude] : undefined,
            capacity: i.capacity || '',
            services: i.services || [],
            operatingHours: i.operating_hours,
            contact: {
              email: i.email || '',
              phone: i.phone || '',
              website: i.website,
              address: i.address
            },
            seasonalNotes: i.seasonal_notes,
            status: i.status,
            lastUpdated: i.last_updated
          })),
          pricing: pricing.map((p: any) => ({
            countryCode: 'RW' as const,
            category: p.category,
            item: p.item,
            price: parseFloat(p.price),
            currency: p.currency,
            unit: p.unit,
            region: p.region,
            trend: p.trend,
            previousPrice: p.previous_price ? parseFloat(p.previous_price) : undefined,
            notes: p.notes,
            source: p.source,
            lastUpdated: p.last_updated
          })),
          government: government.map((g: any) => ({
            id: g.id,
            countryCode: 'RW' as const,
            ministry: g.ministry,
            department: g.department,
            name: g.name,
            title: g.title,
            contact: {
              email: g.email || '',
              phone: g.phone || '',
              website: g.website,
              address: g.address
            },
            services: g.services || [],
            jurisdiction: g.jurisdiction,
            lastUpdated: g.last_updated
          })),
          lastProcessed: new Date().toISOString()
        });
      } catch (dbError) {
        // Fallback to JSON files
        console.log('Database fetch failed, using JSON files:', dbError);
        const [data, statsData] = await Promise.all([
          getRwandaData(),
          getRwandaStats()
        ]);
        
        setRwandaData(data);
        setStats(statsData);
      }
    } catch (err) {
      setError('Failed to load Rwanda data');
      console.error('Error loading Rwanda data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    
    try {
      const results = await searchRwandaSuppliers(query, selectedCategory === 'all' ? undefined : selectedCategory);
      // Handle search results - could be passed to a search results component
      console.log('Search results:', results);
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  const handleExport = () => {
    if (rwandaData) {
      exportRwandaComprehensiveReport({
        suppliers: rwandaData.suppliers,
        government: rwandaData.government,
        infrastructure: rwandaData.infrastructure,
        pricing: rwandaData.pricing,
        stats: stats || {
          totalSuppliers: 0,
          verifiedSuppliers: 0,
          governmentAgencies: 0,
          infrastructureFacilities: 0,
          pricingItems: 0,
          lastUpdated: new Date().toISOString()
        }
      });
    }
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'laboratory', label: 'Laboratories' },
    { value: 'storage', label: 'Storage' },
    { value: 'food', label: 'Food Suppliers' },
    { value: 'transport', label: 'Transport' },
    { value: 'government', label: 'Government' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading Rwanda logistics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error Loading Data</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={loadRwandaData}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-4xl">🇷🇼</div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Rwanda Logistics Intelligence
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Comprehensive logistics infrastructure and supplier data
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleExport}
              className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </button>
            <button
              onClick={loadRwandaData}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-primary-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Suppliers</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalSuppliers}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Verified</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.verifiedSuppliers}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center">
                <Building2 className="w-8 h-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Infrastructure</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.infrastructureFacilities}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-orange-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pricing Items</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pricingItems}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search suppliers, services, or materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchTerm)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:w-80 flex-shrink-0">
          <RwandaNavigation 
            activeSection={activeSection}
            onNavigate={(section) => {
              setActiveSection(section);
              // Navigate to appropriate route
              switch (section) {
                case 'overview':
                  navigate('/app/rwanda');
                  break;
                case 'profile':
                  navigate('/app/rwanda/profile');
                  break;
                case 'infrastructure':
                  navigate('/app/rwanda/infrastructure');
                  break;
                case 'services':
                  navigate('/app/rwanda/services');
                  break;
                case 'contacts':
                  navigate('/app/rwanda/contacts');
                  break;
              }
            }}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <Outlet />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
          <p>Data sourced from Logistics Cluster (logcluster.org) - Digital Logistics Capacity Assessments</p>
          <p>Last updated: {rwandaData?.lastProcessed ? new Date(rwandaData.lastProcessed).toLocaleString() : 'Unknown'}</p>
          <p className="mt-1">Qivook does not guarantee accuracy of third-party data</p>
        </div>
      </div>
    </div>
  );
};

export default RwandaLogistics;
