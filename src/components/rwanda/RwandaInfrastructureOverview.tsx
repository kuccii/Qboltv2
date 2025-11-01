// Infrastructure overview component with interactive map and facility details
import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Building2, 
  Plane, 
  Package, 
  Truck, 
  Clock, 
  Phone, 
  Mail, 
  Globe,
  CheckCircle,
  AlertTriangle,
  Info,
  Search,
  Filter,
  Download,
  RefreshCw,
  Navigation,
  Users,
  Wifi,
  Shield,
  Star
} from 'lucide-react';
import { CountryInfrastructure } from '../../data/countries/types';
import { getRwandaInfrastructure } from '../../data/countries/rwanda/rwandaDataLoader';

interface InfrastructureOverviewProps {
  className?: string;
}

type InfrastructureType = 'all' | 'airport' | 'storage' | 'milling' | 'port' | 'road' | 'rail' | 'warehouse';
type ViewMode = 'list' | 'map' | 'grid';

const RwandaInfrastructureOverview: React.FC<InfrastructureOverviewProps> = ({ className = '' }) => {
  const [infrastructure, setInfrastructure] = useState<CountryInfrastructure[]>([]);
  const [selectedType, setSelectedType] = useState<InfrastructureType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFacility, setSelectedFacility] = useState<CountryInfrastructure | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInfrastructureData();
  }, []);

  const loadInfrastructureData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const infrastructureData = await getRwandaInfrastructure();
      setInfrastructure(infrastructureData);
    } catch (err) {
      setError('Failed to load infrastructure data');
      console.error('Error loading infrastructure data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredInfrastructure = () => {
    let filtered = infrastructure;
    
    if (selectedType !== 'all') {
      filtered = filtered.filter(facility => facility.type === selectedType);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(facility => 
        facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        facility.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        facility.services.some(service => service.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return filtered;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'airport': return <Plane className="w-5 h-5 text-blue-600" />;
      case 'storage': return <Package className="w-5 h-5 text-green-600" />;
      case 'milling': return <Building2 className="w-5 h-5 text-orange-600" />;
      case 'port': return <Navigation className="w-5 h-5 text-purple-600" />;
      case 'road': return <Truck className="w-5 h-5 text-gray-600" />;
      case 'rail': return <Truck className="w-5 h-5 text-indigo-600" />;
      case 'warehouse': return <Package className="w-5 h-5 text-teal-600" />;
      default: return <Building2 className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'airport': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'storage': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'milling': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'port': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'road': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'rail': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'warehouse': return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'under_construction': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'maintenance': return <Clock className="w-4 h-4 text-orange-500" />;
      case 'closed': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-green-600 dark:text-green-400';
      case 'under_construction': return 'text-yellow-600 dark:text-yellow-400';
      case 'maintenance': return 'text-orange-600 dark:text-orange-400';
      case 'closed': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getTypeCount = (type: InfrastructureType) => {
    if (type === 'all') return infrastructure.length;
    return infrastructure.filter(facility => facility.type === type).length;
  };

  const types: { value: InfrastructureType; label: string; icon: React.ComponentType<any> }[] = [
    { value: 'all', label: 'All Facilities', icon: Building2 },
    { value: 'airport', label: 'Airports', icon: Plane },
    { value: 'storage', label: 'Storage', icon: Package },
    { value: 'milling', label: 'Milling', icon: Building2 },
    { value: 'warehouse', label: 'Warehouses', icon: Package },
    { value: 'port', label: 'Ports', icon: Navigation },
    { value: 'road', label: 'Roads', icon: Truck },
    { value: 'rail', label: 'Rail', icon: Truck }
  ];

  const handleContact = (type: 'phone' | 'email' | 'website', value: string) => {
    switch (type) {
      case 'phone':
        window.open(`tel:${value}`);
        break;
      case 'email':
        window.open(`mailto:${value}`);
        break;
      case 'website':
        window.open(value, '_blank', 'noopener,noreferrer');
        break;
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading infrastructure data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center p-8 ${className}`}>
        <div className="text-red-500 mb-4">
          <AlertTriangle className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error Loading Infrastructure</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <button
          onClick={loadInfrastructureData}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Infrastructure Overview</h2>
          <p className="text-gray-600 dark:text-gray-400">Rwanda's logistics infrastructure and facilities</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={loadInfrastructureData}
            className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search facilities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              aria-label="Search infrastructure facilities"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">View:</span>
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {[
              { value: 'grid', label: 'Grid', icon: Building2 },
              { value: 'list', label: 'List', icon: Package },
              { value: 'map', label: 'Map', icon: MapPin }
            ].map((mode) => {
              const Icon = mode.icon;
              return (
                <button
                  key={mode.value}
                  onClick={() => setViewMode(mode.value as ViewMode)}
                  className={`flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === mode.value
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                  aria-label={`Switch to ${mode.label} view`}
                >
                  <Icon className="w-4 h-4 mr-1" />
                  {mode.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Type Filter */}
      <div className="flex flex-wrap gap-2">
        {types.map((type) => {
          const Icon = type.icon;
          const count = getTypeCount(type.value);
          
          return (
            <button
              key={type.value}
              onClick={() => setSelectedType(type.value)}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedType === type.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              aria-label={`Filter by ${type.label}`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {type.label}
              <span className="ml-2 bg-white/20 dark:bg-gray-600 text-xs px-2 py-0.5 rounded-full">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getFilteredInfrastructure().map((facility) => (
            <div 
              key={facility.id} 
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedFacility(facility)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedFacility(facility);
                }
              }}
              aria-label={`View details for ${facility.name}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getTypeIcon(facility.type)}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {facility.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{facility.location}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(facility.status)}
                  <span className={`text-sm font-medium ${getStatusColor(facility.status)}`}>
                    {facility.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(facility.type)}`}>
                  {facility.type.charAt(0).toUpperCase() + facility.type.slice(1)}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Package className="w-4 h-4 mr-2" />
                  <span>Capacity: {facility.capacity}</span>
                </div>
                
                {facility.operatingHours && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{facility.operatingHours}</span>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Services:</p>
                <div className="flex flex-wrap gap-1">
                  {facility.services.slice(0, 3).map((service, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                    >
                      {service}
                    </span>
                  ))}
                  {facility.services.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                      +{facility.services.length - 3}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                {facility.contact.phone && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContact('phone', facility.contact.phone);
                    }}
                    className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                    title={`Call ${facility.contact.phone}`}
                    aria-label={`Call ${facility.contact.phone}`}
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                )}
                {facility.contact.email && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContact('email', facility.contact.email);
                    }}
                    className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                    title={`Email ${facility.contact.email}`}
                    aria-label={`Email ${facility.contact.email}`}
                  >
                    <Mail className="w-4 h-4" />
                  </button>
                )}
                {facility.contact.website && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContact('website', facility.contact.website);
                    }}
                    className="flex items-center justify-center w-8 h-8 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 rounded-full hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                    title={`Visit ${facility.contact.website}`}
                    aria-label={`Visit ${facility.contact.website}`}
                  >
                    <Globe className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === 'list' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Facility
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Capacity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {getFilteredInfrastructure().map((facility) => (
                  <tr 
                    key={facility.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => setSelectedFacility(facility)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedFacility(facility);
                      }
                    }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getTypeIcon(facility.type)}
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {facility.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(facility.type)}`}>
                        {facility.type.charAt(0).toUpperCase() + facility.type.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {facility.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(facility.status)}
                        <span className={`ml-1 text-sm ${getStatusColor(facility.status)}`}>
                          {facility.status.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {facility.capacity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex space-x-2">
                        {facility.contact.phone && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleContact('phone', facility.contact.phone);
                            }}
                            className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                            title="Call"
                            aria-label={`Call ${facility.contact.phone}`}
                          >
                            <Phone className="w-4 h-4" />
                          </button>
                        )}
                        {facility.contact.email && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleContact('email', facility.contact.email);
                            }}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Email"
                            aria-label={`Email ${facility.contact.email}`}
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                        )}
                        {facility.contact.website && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleContact('website', facility.contact.website);
                            }}
                            className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                            title="Website"
                            aria-label={`Visit ${facility.contact.website}`}
                          >
                            <Globe className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {viewMode === 'map' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Interactive Map</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Map view coming soon. Currently showing {getFilteredInfrastructure().length} facilities.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getFilteredInfrastructure().slice(0, 6).map((facility) => (
                <div key={facility.id} className="text-left p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    {getTypeIcon(facility.type)}
                    <span className="font-medium text-gray-900 dark:text-white">{facility.name}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{facility.location}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">{facility.capacity}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* No results */}
      {getFilteredInfrastructure().length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No facilities found</h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm ? 'Try adjusting your search terms' : 'No facilities available for this type'}
          </p>
        </div>
      )}

      {/* Facility Detail Modal */}
      {selectedFacility && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getTypeIcon(selectedFacility.type)}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {selectedFacility.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">{selectedFacility.location}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFacility(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label="Close facility details"
                >
                  <span className="sr-only">Close</span>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getTypeColor(selectedFacility.type)}`}>
                    {selectedFacility.type.charAt(0).toUpperCase() + selectedFacility.type.slice(1)}
                  </span>
                  <div className="flex items-center">
                    {getStatusIcon(selectedFacility.status)}
                    <span className={`ml-1 text-sm font-medium ${getStatusColor(selectedFacility.status)}`}>
                      {selectedFacility.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Capacity</h4>
                    <p className="text-gray-600 dark:text-gray-400">{selectedFacility.capacity}</p>
                  </div>
                  
                  {selectedFacility.operatingHours && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Operating Hours</h4>
                      <p className="text-gray-600 dark:text-gray-400">{selectedFacility.operatingHours}</p>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Services</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedFacility.services.map((service, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedFacility.seasonalNotes && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Seasonal Notes</h4>
                    <p className="text-gray-600 dark:text-gray-400">{selectedFacility.seasonalNotes}</p>
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Contact Information</h4>
                  <div className="space-y-2">
                    {selectedFacility.contact.phone && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-gray-900 dark:text-white">{selectedFacility.contact.phone}</span>
                          <button
                            onClick={() => handleContact('phone', selectedFacility.contact.phone)}
                            className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                            aria-label={`Call ${selectedFacility.contact.phone}`}
                          >
                            <Phone className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {selectedFacility.contact.email && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Email:</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-gray-900 dark:text-white">{selectedFacility.contact.email}</span>
                          <button
                            onClick={() => handleContact('email', selectedFacility.contact.email)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            aria-label={`Email ${selectedFacility.contact.email}`}
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {selectedFacility.contact.website && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Website:</span>
                        <button
                          onClick={() => handleContact('website', selectedFacility.contact.website)}
                          className="flex items-center text-purple-600 dark:text-purple-400 hover:underline"
                          aria-label={`Visit ${selectedFacility.contact.website}`}
                        >
                          <span className="mr-1">Visit</span>
                          <Globe className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data Source Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">Data Source</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Infrastructure data is sourced from Logistics Cluster (logcluster.org) and may not reflect real-time conditions. 
              Contact information should be verified before use.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RwandaInfrastructureOverview;

