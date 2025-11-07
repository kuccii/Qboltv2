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
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Suppliers</p>
              <p className="text-3xl font-bold">{stats?.totalSuppliers || 0}</p>
            </div>
            <Users className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Verified Suppliers</p>
              <p className="text-3xl font-bold">{stats?.verifiedSuppliers || 0}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Infrastructure</p>
              <p className="text-3xl font-bold">{stats?.infrastructureFacilities || 0}</p>
            </div>
            <Building2 className="w-8 h-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Pricing Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-primary-600" />
          Current Pricing
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fuel Prices */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
              <Fuel className="w-4 h-4 mr-2" />
              Fuel Prices (USD/litre)
            </h4>
            <div className="space-y-2">
              {getFuelPrices().map((fuel, index) => (
                <div key={index} className="flex justify-between items-center py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{fuel.item}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">${fuel.price.toFixed(2)}</span>
                </div>
              ))}
              {getFuelPrices().length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">No fuel pricing data available</p>
              )}
            </div>
          </div>

          {/* Labor Costs */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Labor Costs (USD/day)
            </h4>
            <div className="space-y-2">
              {getLaborCosts().map((labor, index) => (
                <div key={index} className="flex justify-between items-center py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{labor.item}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">${labor.price.toFixed(2)}</span>
                </div>
              ))}
              {getLaborCosts().length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">No labor cost data available</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Top Suppliers */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
          Top Verified Suppliers
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getTopSuppliers().map((supplier) => (
            <div key={supplier.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{supplier.name}</h4>
                </div>
                {supplier.rating && (
                  <div className="flex items-center text-yellow-500">
                    <span className="text-sm font-medium">{supplier.rating}</span>
                  </div>
                )}
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{supplier.location}</p>
              
              <div className="flex flex-wrap gap-1 mb-3">
                {supplier.services.slice(0, 2).map((service, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                  >
                    {service}
                  </span>
                ))}
                {supplier.services.length > 2 && (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                    +{supplier.services.length - 2}
                  </span>
                )}
              </div>
              
              <div className="flex space-x-2">
                {supplier.contact.phone && (
                  <button
                    onClick={() => window.open(`tel:${supplier.contact.phone}`)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    title="Call"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                )}
                {supplier.contact.email && (
                  <button
                    onClick={() => window.open(`mailto:${supplier.contact.email}`)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    title="Email"
                  >
                    <Mail className="w-4 h-4" />
                  </button>
                )}
                {supplier.contact.website && (
                  <button
                    onClick={() => window.open(supplier.contact.website, '_blank')}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Building2 className="w-5 h-5 text-primary-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-white">Government Contacts</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ministries & Agencies</p>
            </div>
          </button>
          
          <button className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Fuel className="w-5 h-5 text-primary-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-white">Fuel Pricing</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Current fuel costs</p>
            </div>
          </button>
          
          <button className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <MapPin className="w-5 h-5 text-primary-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-white">Infrastructure Map</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Airports & facilities</p>
            </div>
          </button>
          
          <button className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Users className="w-5 h-5 text-primary-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-white">All Suppliers</p>
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

