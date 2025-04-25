import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  Phone, 
  Mail,
  MessageSquare,
  Clock,
  Truck,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import SupplierScore from './SupplierScore';

interface Supplier {
  id: string;
  name: string;
  location: string;
  materials: string[];
  rating: number;
  verified: boolean;
  deliveryTime: string;
  contactInfo: {
    phone: string;
    email: string;
    whatsapp: string;
  };
  specialties: string[];
  certifications: string[];
}

const SupplierDirectory: React.FC = () => {
  const { currentUser } = useAuth();
  const industry = currentUser?.industry || 'construction';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');

  // Mock data - in production this would come from your backend
  const suppliers: Supplier[] = [
    {
      id: '1',
      name: 'East Africa Building Supplies',
      location: 'Nairobi, Kenya',
      materials: ['Cement', 'Steel', 'Timber'],
      rating: 4.8,
      verified: true,
      deliveryTime: '2-3 days',
      contactInfo: {
        phone: '+254700000000',
        email: 'contact@eabs.com',
        whatsapp: '+254700000000'
      },
      specialties: ['Bulk orders', 'Custom specifications'],
      certifications: ['ISO 9001', 'KEBS Certified']
    },
    // Add more suppliers...
  ];

  const regions = ['All Regions', 'Nairobi', 'Mombasa', 'Kisumu', 'Kampala', 'Dar es Salaam'];
  const materials = industry === 'construction' 
    ? ['All Materials', 'Cement', 'Steel', 'Timber', 'Sand'] 
    : ['All Materials', 'Fertilizer', 'Seeds', 'Pesticides', 'Equipment'];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-card p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Supplier Directory</h2>
          
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search suppliers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full rounded-lg border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
                className="rounded-lg border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {materials.map(material => (
                  <option key={material} value={material.toLowerCase()}>
                    {material}
                  </option>
                ))}
              </select>

              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="rounded-lg border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {regions.map(region => (
                  <option key={region} value={region.toLowerCase()}>
                    {region}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suppliers.map(supplier => (
            <div key={supplier.id} className="border rounded-lg p-4 hover:border-primary-200 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-800">{supplier.name}</h3>
                    {supplier.verified && (
                      <CheckCircle size={16} className="text-success-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <MapPin size={16} />
                    <span>{supplier.location}</span>
                  </div>
                </div>
                <SupplierScore score={supplier.rating * 20} size="sm" />
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {supplier.materials.map((material, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {material}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-gray-600">
                    <Clock size={16} />
                    <span>{supplier.deliveryTime}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Truck size={16} />
                    <span>Delivery available</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {supplier.certifications.map((cert, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
                    >
                      {cert}
                    </span>
                  ))}
                </div>

                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-3">
                      <button className="text-gray-600 hover:text-primary-600">
                        <Phone size={20} />
                      </button>
                      <button className="text-gray-600 hover:text-primary-600">
                        <Mail size={20} />
                      </button>
                      <button className="text-gray-600 hover:text-primary-600">
                        <MessageSquare size={20} />
                      </button>
                    </div>
                    <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm">
                      Contact Supplier
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SupplierDirectory;