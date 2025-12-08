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
  Shield,
  CheckCircle,
  ExternalLink,
  Download,
  Copy,
  Star,
  CreditCard,
  FileText,
  Scale
} from 'lucide-react';
import { CountrySupplier, GovernmentContact, CountryData } from '../../data/countries/types';
import { getRwandaSuppliers, getRwandaGovernment, getRwandaData } from '../../data/countries/rwanda/rwandaDataLoader';
import { unifiedApi } from '../../services/unifiedApi';

interface ContactDirectoryProps {
  className?: string;
  countryCode?: string; // Optional: defaults to 'RW' for backward compatibility
}

type ContactTab = 'government' | 'suppliers' | 'logistics' | 'quality' | 'financial' | 'trade-services';

const RwandaContactDirectory: React.FC<ContactDirectoryProps> = ({ className = '', countryCode = 'RW' }) => {
  const [activeTab, setActiveTab] = useState<ContactTab>('government');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [suppliers, setSuppliers] = useState<CountrySupplier[]>([]);
  const [government, setGovernment] = useState<GovernmentContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadContactData();
  }, [countryCode, selectedCategory, searchTerm]);

  const loadContactData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch from database first, fallback to JSON files
      try {
        const [dbSuppliers, dbGovernment] = await Promise.all([
          unifiedApi.countries.getSuppliers(countryCode, {
            category: selectedCategory !== 'all' ? selectedCategory : undefined,
            search: searchTerm || undefined
          }),
          unifiedApi.countries.getGovernmentContacts(countryCode)
        ]);

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
            description: s.description
          })));
        }

        if (dbGovernment.length > 0) {
          setGovernment(dbGovernment.map((g: any) => ({
            id: g.id,
            countryCode: countryCode as any,
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
          })));
        }
      } catch (dbError) {
        // Fallback to JSON files (only for Rwanda)
        console.log('Database fetch failed, using JSON files:', dbError);
        if (countryCode === 'RW') {
          const [suppliersData, governmentData] = await Promise.all([
            getRwandaSuppliers(),
            getRwandaGovernment()
          ]);
          
          setSuppliers(suppliersData);
          setGovernment(governmentData);
        } else {
          // For other countries, just set empty arrays
          setSuppliers([]);
          setGovernment([]);
        }
      }
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
      case 'quality': return FlaskConical;
      case 'financial': return CreditCard;
      case 'trade-services': return FileText;
      default: return Users;
    }
  };

  const tabs: { id: ContactTab; label: string }[] = [
    { id: 'government', label: 'Government' },
    { id: 'suppliers', label: 'Suppliers' },
    { id: 'logistics', label: 'Logistics' },
    { id: 'quality', label: 'Quality & Testing' },
    { id: 'financial', label: 'Financial Services' },
    { id: 'trade-services', label: 'Trade Services' }
  ];

  // Only show loading on initial load, not when switching tabs
  if (loading && suppliers.length === 0 && government.length === 0) {
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
      {/* Playful Header */}
      <div className="mb-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span>📞</span>
          Contact Directory!
        </h2>
        <p className="text-base text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
          <span>👥</span>
          Find all the people and places you need to contact!
        </p>
      </div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
        </div>
        <button className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg font-bold">
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

      {/* Playful Tabs */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-2 border-2 border-blue-200 dark:border-gray-700 shadow-lg mb-6">
        <nav className="flex space-x-2 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = getTabIcon(tab.id);
            const count = getTabCount(tab.id);
            const tabEmojis: Record<ContactTab, string> = {
              'government': '🏛️',
              'suppliers': '👥',
              'logistics': '🚚',
              'quality': '🔬',
              'financial': '💳',
              'trade-services': '📄'
            };
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-4 sm:px-6 rounded-xl font-bold text-sm sm:text-base whitespace-nowrap flex-shrink-0 transition-all transform hover:scale-105 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-105'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-gray-700 hover:text-blue-700 dark:hover:text-blue-300'
                }`}
              >
                <span className="text-lg">{tabEmojis[tab.id]}</span>
                <span>{tab.label}</span>
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === tab.id
                    ? 'bg-white/30 text-white'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Results Count - Playful */}
        <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-3 border-2 border-blue-200 dark:border-blue-800">
          <p className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <span>📋</span>
            {activeTab === 'government' 
              ? `${getFilteredGovernment().length} ${getFilteredGovernment().length === 1 ? 'contact' : 'contacts'} found!`
              : `${getFilteredSuppliers().filter(supplier => {
                  switch (activeTab) {
                    case 'suppliers': return supplier.category === 'construction' || supplier.category === 'agriculture';
                    case 'logistics': return supplier.category === 'transport' || supplier.category === 'logistics' || supplier.category === 'warehousing';
                    case 'quality': return supplier.category === 'laboratory' || supplier.category === 'testing' || supplier.category === 'certification';
                    case 'financial': return supplier.category === 'bank' || supplier.category === 'fintech' || supplier.category === 'insurance' || supplier.category === 'finance';
                    case 'trade-services': return supplier.category === 'customs' || supplier.category === 'clearing' || supplier.category === 'broker' || supplier.category === 'documentation';
                    default: return true;
                  }
                }).length} ${getFilteredSuppliers().filter(supplier => {
                  switch (activeTab) {
                    case 'suppliers': return supplier.category === 'construction' || supplier.category === 'agriculture';
                    case 'logistics': return supplier.category === 'transport' || supplier.category === 'logistics' || supplier.category === 'warehousing';
                    case 'quality': return supplier.category === 'laboratory' || supplier.category === 'testing' || supplier.category === 'certification';
                    case 'financial': return supplier.category === 'bank' || supplier.category === 'fintech' || supplier.category === 'insurance' || supplier.category === 'finance';
                    case 'trade-services': return supplier.category === 'customs' || supplier.category === 'clearing' || supplier.category === 'broker' || supplier.category === 'documentation';
                    default: return true;
                  }
                }).length === 1 ? 'contact' : 'contacts'} found!`
            }
          </p>
        </div>

        {activeTab === 'government' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getFilteredGovernment().map((contact) => (
              <div key={contact.id} className="bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-900/20 rounded-xl shadow-lg border-2 border-blue-200 dark:border-blue-700 p-5 hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-600 transition-all transform hover:scale-[1.02]">
                {/* Header */}
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0 pr-3">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                        <span>👤</span>
                        {contact.name}
                      </h3>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{contact.title}</p>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 rounded-lg border-2 border-blue-300 dark:border-blue-700">
                        <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <p className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase">{contact.ministry}</p>
                      </div>
                    </div>
                    {contact.verified && (
                      <div className="flex items-center text-green-600 dark:text-green-400 flex-shrink-0 bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 px-2 py-1 rounded-lg border-2 border-green-300 dark:border-green-700">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Contact Actions */}
                <div className="space-y-2 mb-4">
                  {contact.contact.phone && (
                    <button
                      onClick={() => handleContact('phone', contact.contact.phone)}
                      className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 rounded-lg hover:from-blue-200 hover:to-blue-300 dark:hover:from-blue-900/50 dark:hover:to-blue-800/50 transition-all border-2 border-blue-300 dark:border-blue-700 transform hover:scale-[1.02]"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-xl">📞</span>
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{contact.contact.phone}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(contact.contact.phone);
                        }}
                        className="flex-shrink-0 p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        title="Copy"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </button>
                  )}
                  
                  {contact.contact.email && (
                    <button
                      onClick={() => handleContact('email', contact.contact.email)}
                      className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 rounded-lg hover:from-green-200 hover:to-green-300 dark:hover:from-green-900/50 dark:hover:to-green-800/50 transition-all border-2 border-green-300 dark:border-green-700 transform hover:scale-[1.02]"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-xl">✉️</span>
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{contact.contact.email}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(contact.contact.email);
                        }}
                        className="flex-shrink-0 p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        title="Copy"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </button>
                  )}
                  
                  {contact.contact.website && (
                    <button
                      onClick={() => handleContact('website', contact.contact.website)}
                      className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40 rounded-lg hover:from-purple-200 hover:to-purple-300 dark:hover:from-purple-900/50 dark:hover:to-purple-800/50 transition-all border-2 border-purple-300 dark:border-purple-700 transform hover:scale-[1.02]"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-xl">🌐</span>
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{contact.contact.website}</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    </button>
                  )}
                </div>
                
                {contact.services.length > 0 && (
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Services</p>
                    <div className="flex flex-wrap gap-2">
                      {contact.services.slice(0, 3).map((service, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs font-medium rounded border border-blue-200 dark:border-blue-700"
                        >
                          {service}
                        </span>
                      ))}
                      {contact.services.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded border border-gray-300 dark:border-gray-600">
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
                    return supplier.category === 'transport' || supplier.category === 'logistics' || supplier.category === 'warehousing';
                  case 'quality':
                    return supplier.category === 'laboratory' || supplier.category === 'testing' || supplier.category === 'certification';
                  case 'financial':
                    return supplier.category === 'bank' || supplier.category === 'fintech' || supplier.category === 'insurance' || supplier.category === 'finance';
                  case 'trade-services':
                    return supplier.category === 'customs' || supplier.category === 'clearing' || supplier.category === 'broker' || supplier.category === 'documentation';
                  default:
                    return true;
                }
              })
              .map((supplier) => (
                <div key={supplier.id} className="bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-800 dark:to-purple-900/20 rounded-xl shadow-lg border-2 border-purple-200 dark:border-purple-700 p-5 hover:shadow-xl hover:border-purple-400 dark:hover:border-purple-600 transition-all transform hover:scale-[1.02]">
                  {/* Header */}
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0 pr-3">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                          <span>🏢</span>
                          {supplier.name}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{supplier.location}</p>
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40 rounded-lg border-2 border-purple-300 dark:border-purple-700">
                          <span className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase">{supplier.category}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 ml-2 flex-shrink-0">
                        {supplier.verified && (
                          <div className="flex items-center text-green-600 dark:text-green-400 bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 px-2 py-1 rounded-lg border-2 border-green-300 dark:border-green-700">
                            <CheckCircle className="w-4 h-4" />
                          </div>
                        )}
                        {supplier.rating && (
                          <div className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-900/40 dark:to-yellow-800/40 px-2 py-1 rounded-lg border-2 border-yellow-300 dark:border-yellow-700">
                            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                            <span className="text-sm font-bold text-yellow-700 dark:text-yellow-400">{supplier.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Contact Actions */}
                  <div className="space-y-2 mb-4">
                    {supplier.contact.phone && (
                      <button
                        onClick={() => handleContact('phone', supplier.contact.phone)}
                        className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 rounded-lg hover:from-blue-200 hover:to-blue-300 dark:hover:from-blue-900/50 dark:hover:to-blue-800/50 transition-all border-2 border-blue-300 dark:border-blue-700 transform hover:scale-[1.02]"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="text-xl">📞</span>
                          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{supplier.contact.phone}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(supplier.contact.phone);
                          }}
                          className="flex-shrink-0 p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          title="Copy"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </button>
                    )}
                    
                    {supplier.contact.email && (
                      <button
                        onClick={() => handleContact('email', supplier.contact.email)}
                        className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 rounded-lg hover:from-green-200 hover:to-green-300 dark:hover:from-green-900/50 dark:hover:to-green-800/50 transition-all border-2 border-green-300 dark:border-green-700 transform hover:scale-[1.02]"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="text-xl">✉️</span>
                          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{supplier.contact.email}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(supplier.contact.email);
                          }}
                          className="flex-shrink-0 p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          title="Copy"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </button>
                    )}
                    
                    {supplier.contact.website && (
                      <button
                        onClick={() => handleContact('website', supplier.contact.website)}
                        className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40 rounded-lg hover:from-purple-200 hover:to-purple-300 dark:hover:from-purple-900/50 dark:hover:to-purple-800/50 transition-all border-2 border-purple-300 dark:border-purple-700 transform hover:scale-[1.02]"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="text-xl">🌐</span>
                          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{supplier.contact.website}</p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      </button>
                    )}
                  </div>
                  
                  {supplier.services.length > 0 && (
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Services</p>
                      <div className="flex flex-wrap gap-2">
                        {supplier.services.slice(0, 2).map((service, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs font-medium rounded border border-blue-200 dark:border-blue-700"
                          >
                            {service}
                          </span>
                        ))}
                        {supplier.services.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded border border-gray-300 dark:border-gray-600">
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
              ))}
          </div>
        )}

        {/* No results */}
        {((activeTab === 'government' && getFilteredGovernment().length === 0) ||
          (activeTab !== 'government' && getFilteredSuppliers().filter(supplier => {
            switch (activeTab) {
              case 'suppliers': return supplier.category === 'construction' || supplier.category === 'agriculture';
              case 'logistics': return supplier.category === 'transport' || supplier.category === 'logistics' || supplier.category === 'warehousing';
              case 'quality': return supplier.category === 'laboratory' || supplier.category === 'testing' || supplier.category === 'certification';
              case 'financial': return supplier.category === 'bank' || supplier.category === 'fintech' || supplier.category === 'insurance' || supplier.category === 'finance';
              case 'trade-services': return supplier.category === 'customs' || supplier.category === 'clearing' || supplier.category === 'broker' || supplier.category === 'documentation';
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

