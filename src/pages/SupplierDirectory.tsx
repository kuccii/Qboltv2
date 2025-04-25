import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  Filter, 
  Download, 
  MapPin, 
  Phone, 
  Mail, 
  Star,
  CheckCircle,
  AlertCircle,
  Truck
} from 'lucide-react';
import DashboardCard from '../components/DashboardCard';
import StatusBadge from '../components/StatusBadge';
import { supplierDirectoryData } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';

const SupplierDirectory: React.FC = () => {
  const { currentUser } = useAuth();
  const industry = currentUser?.industry || 'construction';
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  
  // Filter suppliers based on industry and search/filter settings
  const filteredSuppliers = supplierDirectoryData
    .filter(supplier => supplier.industry === industry)
    .filter(supplier => 
      searchTerm === '' || 
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.location.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(supplier => 
      selectedMaterial === 'all' || 
      supplier.materials.includes(selectedMaterial)
    )
    .filter(supplier => 
      selectedRegion === 'all' || 
      supplier.region === selectedRegion
    );
  
  // Get unique materials and regions for this industry
  const uniqueMaterials = Array.from(
    new Set(
      supplierDirectoryData
        .filter(supplier => supplier.industry === industry)
        .flatMap(supplier => supplier.materials)
    )
  );
  
  const uniqueRegions = Array.from(
    new Set(
      supplierDirectoryData
        .filter(supplier => supplier.industry === industry)
        .map(supplier => supplier.region)
    )
  );
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Supplier Directory</h1>
          <p className="text-gray-500 mt-1">
            Find and connect with verified suppliers in your industry
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors px-3 py-1.5 rounded-md text-sm font-medium">
            <Download size={16} />
            Export List
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-card p-5 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="relative w-full md:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search suppliers..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 w-full rounded-lg border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-500" />
              <span className="text-sm text-gray-500">Filter by:</span>
            </div>
            
            <div className="flex gap-2 flex-1">
              <div className="relative flex-1">
                <select
                  value={selectedMaterial}
                  onChange={e => setSelectedMaterial(e.target.value)}
                  className="appearance-none w-full bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Materials</option>
                  {uniqueMaterials.map(material => (
                    <option key={material} value={material}>
                      {material.charAt(0).toUpperCase() + material.slice(1)}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
              
              <div className="relative flex-1">
                <select
                  value={selectedRegion}
                  onChange={e => setSelectedRegion(e.target.value)}
                  className="appearance-none w-full bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Regions</option>
                  {uniqueRegions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSuppliers.length > 0 ? (
            filteredSuppliers.map(supplier => (
              <div 
                key={supplier.id} 
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-medium text-gray-800">{supplier.name}</h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <MapPin size={14} className="mr-1" />
                      {supplier.location}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Star size={16} className="text-warning-500 mr-1" />
                    <span className="text-sm font-medium">{supplier.rating}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {supplier.materials.map((material, index) => (
                      <span 
                        key={index} 
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {material}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Truck size={14} className="mr-1" />
                      {supplier.deliveryTime}
                    </div>
                    <div className="flex items-center">
                      <CheckCircle size={14} className="mr-1" />
                      {supplier.reliability}% Reliable
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone size={14} className="text-gray-400" />
                      <span className="text-gray-600">{supplier.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm mt-1">
                      <Mail size={14} className="text-gray-400" />
                      <span className="text-gray-600">{supplier.email}</span>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <button className="w-full py-2 bg-primary-50 text-primary-700 rounded-md hover:bg-primary-100 transition-colors text-sm font-medium">
                      Contact Supplier
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500">
              No suppliers match your search criteria
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardCard 
          title="Supplier Verification" 
          icon={<CheckCircle size={20} />}
        >
          <div className="space-y-4 mt-2">
            <div className="bg-primary-50 border border-primary-100 rounded-lg p-4">
              <h3 className="font-medium text-primary-800 mb-2">Verification Process</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-success-500 mt-0.5" />
                  <span>Business registration verification</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-success-500 mt-0.5" />
                  <span>Trade history validation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-success-500 mt-0.5" />
                  <span>Quality certification checks</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-success-500 mt-0.5" />
                  <span>Customer feedback analysis</span>
                </li>
              </ul>
            </div>
          </div>
        </DashboardCard>
        
        <DashboardCard 
          title="Supplier Insights" 
          icon={<AlertCircle size={20} />}
        >
          <div className="space-y-4 mt-2">
            <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-warning-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-800">Regional Availability</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {industry === 'construction'
                      ? 'Cement suppliers are concentrated in urban centers, while timber suppliers are more prevalent in rural areas.'
                      : 'Fertilizer suppliers show good coverage across all regions, with specialized equipment suppliers primarily in major cities.'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-medium text-gray-800 mb-2">Supplier Distribution</h3>
              <div className="space-y-3">
                {uniqueRegions.map(region => (
                  <div key={region} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{region}</span>
                    <span className="text-sm font-medium text-gray-800">
                      {supplierDirectoryData.filter(s => s.region === region && s.industry === industry).length} suppliers
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
};

export default SupplierDirectory; 