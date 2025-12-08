// Rwanda overview component showing key insights and quick access
import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  TrendingUp, 
  Users, 
  Building2, 
  Fuel, 
  Clock,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Phone,
  Mail,
  Globe
} from 'lucide-react';
import RwandaSupplierCard from './RwandaSupplierCard';
import { CountrySupplier, CountryData, CountryPricing } from '../../data/countries/types';
import { getRwandaSuppliers, getRwandaPricing, getRwandaStats } from '../../data/countries/rwanda/rwandaDataLoader';
import { unifiedApi } from '../../services/unifiedApi';

interface RwandaOverviewProps {
  countryCode?: string; // Optional: defaults to 'RW' for backward compatibility
}

const RwandaOverview: React.FC<RwandaOverviewProps> = ({ countryCode = 'RW' }) => {
  const [suppliers, setSuppliers] = useState<CountrySupplier[]>([]);
  const [pricing, setPricing] = useState<CountryPricing[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOverviewData();
  }, [countryCode]);

  const loadOverviewData = async () => {
    try {
      setLoading(true);
      
      // Fetch from database first, fallback to JSON files
      try {
        const [dbSuppliers, dbPricing, dbStats] = await Promise.all([
          unifiedApi.countries.getSuppliers(countryCode),
          unifiedApi.countries.getPricing(countryCode),
          unifiedApi.countries.getStats(countryCode)
        ]);

        // Transform database data to match expected format
        if (dbSuppliers.length > 0) {
          setSuppliers(dbSuppliers.map((s: any) => ({
            id: s.id,
            countryCode: countryCode as any,
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
            description: s.description,
            establishedYear: s.established_year,
            employeeCount: s.employee_count
          })));
        }

        if (dbPricing.length > 0) {
          setPricing(dbPricing.map((p: any) => ({
            countryCode: countryCode as any,
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
          })));
        }

        if (dbStats) {
          setStats(dbStats);
        }
      } catch (dbError) {
        // Fallback to JSON files if database fails (only for Rwanda)
        if (countryCode === 'RW') {
          console.log('Database fetch failed, using JSON files:', dbError);
          const [suppliersData, pricingData, statsData] = await Promise.all([
            getRwandaSuppliers(),
            getRwandaPricing(),
            getRwandaStats()
          ]);
          
          setSuppliers(suppliersData.slice(0, 6));
          setPricing(pricingData);
          setStats(statsData);
        } else {
          // For other countries, just show empty state
          setSuppliers([]);
          setPricing([]);
          setStats({
            totalSuppliers: 0,
            verifiedSuppliers: 0,
            governmentAgencies: 0,
            infrastructureFacilities: 0,
            pricingItems: 0,
            lastUpdated: new Date().toISOString(),
            dataCompleteness: 0
          });
        }
      }
    } catch (error) {
      console.error('Error loading overview data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFuelPrices = () => {
    return pricing.filter(p => p.category === 'fuel');
  };

  const getLaborCosts = () => {
    return pricing.filter(p => p.category === 'labor');
  };

  const getTopSuppliers = () => {
    return suppliers
      .filter(s => s.verified)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 3);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading overview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Playful Quick Stats */}
      <div className="mb-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span>📊</span>
          Country Stats!
        </h2>
        <p className="text-base text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
          <span>🎉</span>
          See how awesome this country is!
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 dark:from-blue-600 dark:via-blue-700 dark:to-blue-800 rounded-2xl shadow-2xl border-4 border-blue-300 dark:border-blue-500 p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-base font-bold flex items-center gap-2 mb-2">
                <span>👥</span>
                Total Suppliers
              </p>
              <p className="text-5xl font-extrabold">{stats?.totalSuppliers || 0}</p>
            </div>
            <Users className="w-10 h-10 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-400 via-green-500 to-green-600 dark:from-green-600 dark:via-green-700 dark:to-green-800 rounded-2xl shadow-2xl border-4 border-green-300 dark:border-green-500 p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-base font-bold flex items-center gap-2 mb-2">
                <span>✅</span>
                Verified Suppliers
              </p>
              <p className="text-5xl font-extrabold">{stats?.verifiedSuppliers || 0}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 dark:from-purple-600 dark:via-purple-700 dark:to-purple-800 rounded-2xl shadow-2xl border-4 border-purple-300 dark:border-purple-500 p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-base font-bold flex items-center gap-2 mb-2">
                <span>🏗️</span>
                Infrastructure
              </p>
              <p className="text-5xl font-extrabold">{stats?.infrastructureFacilities || 0}</p>
            </div>
            <Building2 className="w-10 h-10 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Playful Pricing Overview */}
      <div className="mb-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span>💰</span>
          Current Prices!
        </h2>
        <p className="text-base text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
          <span>📊</span>
          See what things cost right now!
        </p>
      </div>
      <div className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 dark:from-yellow-600 dark:via-yellow-700 dark:to-yellow-800 rounded-2xl shadow-2xl border-4 border-yellow-300 dark:border-yellow-500 p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>💹</span>
          Price List
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fuel Prices */}
          <div className="bg-white/20 dark:bg-white/10 rounded-xl p-4 border-2 border-white/30">
            <h4 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <span>⛽</span>
              Fuel Prices (USD/litre)
            </h4>
            <div className="space-y-2">
              {getFuelPrices().map((fuel, index) => (
                <div key={index} className="flex justify-between items-center py-2 px-3 bg-white/20 dark:bg-white/10 rounded-lg border border-white/30">
                  <span className="text-sm font-bold text-white">{fuel.item}</span>
                  <span className="text-sm font-extrabold text-white">${fuel.price.toFixed(2)}</span>
                </div>
              ))}
              {getFuelPrices().length === 0 && (
                <p className="text-sm text-white/80 text-center py-4">No fuel pricing data yet! 🚗</p>
              )}
            </div>
          </div>

          {/* Labor Costs */}
          <div className="bg-white/20 dark:bg-white/10 rounded-xl p-4 border-2 border-white/30">
            <h4 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <span>👷</span>
              Labor Costs (USD/day)
            </h4>
            <div className="space-y-2">
              {getLaborCosts().map((labor, index) => (
                <div key={index} className="flex justify-between items-center py-2 px-3 bg-white/20 dark:bg-white/10 rounded-lg border border-white/30">
                  <span className="text-sm font-bold text-white">{labor.item}</span>
                  <span className="text-sm font-extrabold text-white">${labor.price.toFixed(2)}</span>
                </div>
              ))}
              {getLaborCosts().length === 0 && (
                <p className="text-sm text-white/80 text-center py-4">No labor cost data yet! 💼</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Playful Top Suppliers */}
      <div className="mb-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span>⭐</span>
          Top Verified Suppliers!
        </h2>
        <p className="text-base text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
          <span>🏆</span>
          The best suppliers we found for you!
        </p>
      </div>
      <div className="bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 dark:from-emerald-600 dark:via-emerald-700 dark:to-emerald-800 rounded-2xl shadow-2xl border-4 border-emerald-300 dark:border-emerald-500 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getTopSuppliers().map((supplier) => (
            <div key={supplier.id} className="bg-white/20 dark:bg-white/10 rounded-xl p-4 border-2 border-white/30 hover:bg-white/30 transition-all transform hover:scale-105">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">✅</span>
                  <h4 className="font-bold text-white text-base">{supplier.name}</h4>
                </div>
                {supplier.rating && (
                  <div className="flex items-center text-yellow-200">
                    <span className="text-lg">⭐</span>
                    <span className="text-sm font-bold">{supplier.rating}</span>
                  </div>
                )}
              </div>
              
              <p className="text-sm text-white/90 font-medium mb-3 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {supplier.location}
              </p>
              
              <div className="flex flex-wrap gap-1 mb-3">
                {supplier.services.slice(0, 2).map((service, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-white/30 text-white text-xs font-bold rounded-lg border border-white/40"
                  >
                    {service}
                  </span>
                ))}
                {supplier.services.length > 2 && (
                  <span className="px-2 py-1 bg-white/20 text-white/90 text-xs font-bold rounded-lg border border-white/30">
                    +{supplier.services.length - 2}
                  </span>
                )}
              </div>
              
              <div className="flex space-x-2">
                {supplier.contact.phone && (
                  <button
                    onClick={() => window.open(`tel:${supplier.contact.phone}`)}
                    className="p-2 text-white bg-white/20 hover:bg-white/30 rounded-lg border border-white/30 transition-colors"
                    title="Call"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                )}
                {supplier.contact.email && (
                  <button
                    onClick={() => window.open(`mailto:${supplier.contact.email}`)}
                    className="p-2 text-white bg-white/20 hover:bg-white/30 rounded-lg border border-white/30 transition-colors"
                    title="Email"
                  >
                    <Mail className="w-4 h-4" />
                  </button>
                )}
                {supplier.contact.website && (
                  <button
                    onClick={() => window.open(supplier.contact.website, '_blank')}
                    className="p-2 text-white bg-white/20 hover:bg-white/30 rounded-lg border border-white/30 transition-colors"
                    title="Website"
                  >
                    <Globe className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Playful Quick Actions */}
      <div className="mb-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span>⚡</span>
          Quick Actions!
        </h2>
        <p className="text-base text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
          <span>🎯</span>
          Things you can do right away!
        </p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-2 border-blue-200 dark:border-blue-700 rounded-xl hover:shadow-md transition-all transform hover:scale-105">
            <span className="text-2xl mr-3">🏛️</span>
            <div className="text-left">
              <p className="font-bold text-gray-900 dark:text-white">Government Contacts</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ministries & Agencies</p>
            </div>
          </button>
          
          <button className="flex items-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-2 border-green-200 dark:border-green-700 rounded-xl hover:shadow-md transition-all transform hover:scale-105">
            <span className="text-2xl mr-3">⛽</span>
            <div className="text-left">
              <p className="font-bold text-gray-900 dark:text-white">Fuel Pricing</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Current fuel costs</p>
            </div>
          </button>
          
          <button className="flex items-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-2 border-purple-200 dark:border-purple-700 rounded-xl hover:shadow-md transition-all transform hover:scale-105">
            <span className="text-2xl mr-3">🏗️</span>
            <div className="text-left">
              <p className="font-bold text-gray-900 dark:text-white">Infrastructure Map</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Airports & facilities</p>
            </div>
          </button>
          
          <button className="flex items-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-2 border-orange-200 dark:border-orange-700 rounded-xl hover:shadow-md transition-all transform hover:scale-105">
            <span className="text-2xl mr-3">👥</span>
            <div className="text-left">
              <p className="font-bold text-gray-900 dark:text-white">All Suppliers</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Complete directory</p>
            </div>
          </button>
        </div>
      </div>

      {/* Data Source Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start">
          <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">Data Source</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              This data is sourced from Logistics Cluster (logcluster.org) Digital Logistics Capacity Assessments. 
              Information is provided for reference purposes and may not reflect real-time conditions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RwandaOverview;

