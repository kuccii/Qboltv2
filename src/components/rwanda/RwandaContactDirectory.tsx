// Comprehensive contact directory for Rwanda with tabs and search
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  Building2, 
  Users, 
  Truck, 
  FlaskConical,
  Utensils,
  Shield,
  CheckCircle,
  ExternalLink,
  Download,
  Copy,
  Star
} from 'lucide-react';
import { CountrySupplier, GovernmentContact, CountryData } from '../../data/countries/types';
import { getRwandaSuppliers, getRwandaGovernment, getRwandaData } from '../../data/countries/rwanda/rwandaDataLoader';

interface ContactDirectoryProps {
  className?: string;
}

type ContactTab = 'government' | 'suppliers' | 'logistics' | 'laboratories' | 'food';

const RwandaContactDirectory: React.FC<ContactDirectoryProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState<ContactTab>('government');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [suppliers, setSuppliers] = useState<CountrySupplier[]>([]);
  const [government, setGovernment] = useState<GovernmentContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadContactData();
  }, []);

  const loadContactData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [suppliersData, governmentData] = await Promise.all([
        getRwandaSuppliers(),
        getRwandaGovernment()
      ]);
      
      setSuppliers(suppliersData);
      setGovernment(governmentData);
    } catch (err) {
      setError('Failed to load contact data');
      console.error('Error loading contact data:', err);
    } finally {
      setLoading(false);
    }
  };

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };

  const getFilteredSuppliers = () => {
    let filtered = suppliers;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(supplier => supplier.category === selectedCategory);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(supplier => 
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.services.some(service => service.toLowerCase().includes(searchTerm.toLowerCase())) ||
        supplier.materials.some(material => material.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return filtered;
  };

  const getFilteredGovernment = () => {
    let filtered = government;
    
    if (searchTerm) {
      filtered = filtered.filter(contact => 
        contact.ministry.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const getTabCount = (tab: ContactTab) => {
    switch (tab) {
      case 'government':
        return government.length;
      case 'suppliers':
        return suppliers.filter(s => s.category === 'construction' || s.category === 'agriculture').length;
      case 'logistics':
        return suppliers.filter(s => s.category === 'transport').length;
      case 'laboratories':
        return suppliers.filter(s => s.category === 'laboratory').length;
      case 'food':
        return suppliers.filter(s => s.category === 'food').length;
      default:
        return 0;
    }
  };

  const getTabIcon = (tab: ContactTab) => {
    switch (tab) {
      case 'government': return Building2;
      case 'suppliers': return Users;
      case 'logistics': return Truck;
      case 'laboratories': return FlaskConical;
      case 'food': return Utensils;
      default: return Users;
    }
  };

  const tabs: { id: ContactTab; label: string }[] = [
    { id: 'government', label: 'Government' },
    { id: 'suppliers', label: 'Suppliers' },
    { id: 'logistics', label: 'Logistics' },
    { id: 'laboratories', label: 'Laboratories' },
    { id: 'food', label: 'Food Suppliers' }
  ];

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading contacts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center p-8 ${className}`}>
        <div className="text-red-500 mb-4">
          <Shield className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error Loading Contacts</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <button
          onClick={loadContactData}
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Contact Directory</h2>
          <p className="text-gray-600 dark:text-gray-400">Complete directory of Rwanda logistics contacts</p>
        </div>
        
        <button className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
          <Download className="w-4 h-4 mr-2" />
          Export Contacts
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
        
        {activeTab === 'suppliers' && (
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Categories</option>
            <option value="construction">Construction</option>
            <option value="agriculture">Agriculture</option>
            <option value="storage">Storage</option>
          </select>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = getTabIcon(tab.id);
            const count = getTabCount(tab.id);
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
                <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 py-0.5 px-2 rounded-full text-xs">
                  {count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {activeTab === 'government' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getFilteredGovernment().map((contact) => (
              <div key={contact.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{contact.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{contact.title}</p>
                    <p className="text-sm font-medium text-primary-600 dark:text-primary-400">{contact.ministry}</p>
                  </div>
                  <div className="flex items-center text-green-600 dark:text-green-400">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    <span className="text-xs font-medium">Verified</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {contact.contact.email && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Email:</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-mono text-gray-900 dark:text-white">{contact.contact.email}</span>
                        <button
                          onClick={() => copyToClipboard(contact.contact.email)}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title="Copy email"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleContact('email', contact.contact.email)}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title="Send email"
                        >
                          <Mail className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {contact.contact.phone && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Phone:</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-mono text-gray-900 dark:text-white">{contact.contact.phone}</span>
                        <button
                          onClick={() => copyToClipboard(contact.contact.phone)}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title="Copy phone"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleContact('phone', contact.contact.phone)}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title="Call"
                        >
                          <Phone className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {contact.contact.website && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Website:</span>
                      <button
                        onClick={() => handleContact('website', contact.contact.website)}
                        className="flex items-center text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        <span className="text-sm mr-1">Visit</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
                
                {contact.services.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Services:</p>
                    <div className="flex flex-wrap gap-1">
                      {contact.services.slice(0, 3).map((service, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                        >
                          {service}
                        </span>
                      ))}
                      {contact.services.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                          +{contact.services.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab !== 'government' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getFilteredSuppliers()
              .filter(supplier => {
                switch (activeTab) {
                  case 'suppliers':
                    return supplier.category === 'construction' || supplier.category === 'agriculture';
                  case 'logistics':
                    return supplier.category === 'transport';
                  case 'laboratories':
                    return supplier.category === 'laboratory';
                  case 'food':
                    return supplier.category === 'food';
                  default:
                    return true;
                }
              })
              .map((supplier) => (
                <div key={supplier.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{supplier.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{supplier.location}</p>
                      <p className="text-xs text-primary-600 dark:text-primary-400 capitalize">{supplier.category}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {supplier.verified && (
                        <div className="flex items-center text-green-600 dark:text-green-400">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          <span className="text-xs font-medium">Verified</span>
                        </div>
                      )}
                      {supplier.rating && (
                        <div className="flex items-center text-yellow-500">
                          <Star className="w-3 h-3 fill-current" />
                          <span className="text-xs ml-1">{supplier.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {supplier.contact.email && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Email:</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-mono text-gray-900 dark:text-white truncate max-w-32">{supplier.contact.email}</span>
                          <button
                            onClick={() => handleContact('email', supplier.contact.email)}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            title="Send email"
                          >
                            <Mail className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {supplier.contact.phone && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Phone:</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-mono text-gray-900 dark:text-white">{supplier.contact.phone}</span>
                          <button
                            onClick={() => handleContact('phone', supplier.contact.phone)}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            title="Call"
                          >
                            <Phone className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {supplier.contact.website && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Website:</span>
                        <button
                          onClick={() => handleContact('website', supplier.contact.website)}
                          className="flex items-center text-primary-600 dark:text-primary-400 hover:underline"
                        >
                          <span className="text-sm mr-1">Visit</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {supplier.services.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Services:</p>
                      <div className="flex flex-wrap gap-1">
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
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}

        {/* No results */}
        {((activeTab === 'government' && getFilteredGovernment().length === 0) ||
          (activeTab !== 'government' && getFilteredSuppliers().filter(supplier => {
            switch (activeTab) {
              case 'suppliers': return supplier.category === 'construction' || supplier.category === 'agriculture';
              case 'logistics': return supplier.category === 'transport';
              case 'laboratories': return supplier.category === 'laboratory';
              case 'food': return supplier.category === 'food';
              default: return true;
            }
          }).length === 0)) && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No contacts found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? 'Try adjusting your search terms' : 'No contacts available for this category'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RwandaContactDirectory;

