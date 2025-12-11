// Reusable supplier card component for Rwanda data
import React from 'react';
import { 
  MapPin, 
  Star, 
  Phone, 
  Mail, 
  Globe, 
  CheckCircle,
  Building2,
  Users,
  Truck,
  FlaskConical,
  Package,
  Utensils,
  Shield,
  Award
} from 'lucide-react';
import { CountrySupplier } from '../../data/countries/types';
import { useAccessibility } from '../../hooks/useAccessibility';

interface RwandaSupplierCardProps {
  supplier: CountrySupplier;
  showDetailedInfo?: boolean;
  onContact?: (type: 'phone' | 'email' | 'website', value: string) => void;
}

const RwandaSupplierCard: React.FC<RwandaSupplierCardProps> = ({ 
  supplier, 
  showDetailedInfo = false,
  onContact 
}) => {
  const { announce } = useAccessibility();
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'laboratory': return <FlaskConical className="w-5 h-5 text-primary-600" />;
      case 'storage': return <Package className="w-5 h-5 text-green-600" />;
      case 'food': return <Utensils className="w-5 h-5 text-orange-600" />;
      case 'transport': return <Truck className="w-5 h-5 text-purple-600" />;
      case 'government': return <Building2 className="w-5 h-5 text-red-600" />;
      case 'construction': return <Building2 className="w-5 h-5 text-gray-600" />;
      case 'agriculture': return <Package className="w-5 h-5 text-green-600" />;
      default: return <Users className="w-5 h-5 text-gray-600" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'laboratory': return 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200';
      case 'storage': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'food': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'transport': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'government': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'construction': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'agriculture': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const handleContact = (type: 'phone' | 'email' | 'website', value: string) => {
    announce(`Contacting ${supplier.name} via ${type}`);
    
    if (onContact) {
      onContact(type, value);
    } else {
      // Default contact actions
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
    }
  };

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-200 dark:border-gray-700"
      role="article"
      aria-labelledby={`supplier-${supplier.id}-name`}
      aria-describedby={`supplier-${supplier.id}-description`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getCategoryIcon(supplier.category)}
          <div>
            <h3 
              id={`supplier-${supplier.id}-name`}
              className="text-lg font-semibold text-gray-900 dark:text-white"
            >
              {supplier.name}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(supplier.category)}`}>
                {supplier.category.charAt(0).toUpperCase() + supplier.category.slice(1)}
              </span>
              {supplier.verified && (
                <div className="flex items-center text-green-600 dark:text-green-400">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  <span className="text-xs font-medium">Verified</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {supplier.rating && (
          <div className="flex items-center text-yellow-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="ml-1 text-sm font-medium">{supplier.rating}</span>
          </div>
        )}
      </div>

      {/* Location */}
      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
        <MapPin className="w-4 h-4 mr-2" />
        <span>{supplier.location}, {supplier.region}</span>
      </div>

      {/* Description */}
      {supplier.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {supplier.description}
        </p>
      )}

      {/* Services */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Services:</h4>
        <div className="flex flex-wrap gap-1">
          {supplier.services.slice(0, showDetailedInfo ? supplier.services.length : 3).map((service, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-xs rounded-full"
            >
              {service}
            </span>
          ))}
          {!showDetailedInfo && supplier.services.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
              +{supplier.services.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Materials */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Materials:</h4>
        <div className="flex flex-wrap gap-1">
          {supplier.materials.slice(0, showDetailedInfo ? supplier.materials.length : 3).map((material, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full"
            >
              {material}
            </span>
          ))}
          {!showDetailedInfo && supplier.materials.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
              +{supplier.materials.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Certifications */}
      {supplier.certifications.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Certifications:</h4>
          <div className="flex flex-wrap gap-1">
            {supplier.certifications.map((cert, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs rounded-full flex items-center"
              >
                <Award className="w-3 h-3 mr-1" />
                {cert}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Data Source */}
      <div className="mb-4">
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
          <Shield className="w-3 h-3 mr-1" />
          <span>Data source: {supplier.dataSource}</span>
        </div>
      </div>

      {/* Contact Actions */}
      <div className="flex space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
        {supplier.contact.phone && (
          <button
            onClick={() => handleContact('phone', supplier.contact.phone)}
            className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
            title={`Call ${supplier.contact.phone}`}
          >
            <Phone className="w-4 h-4" />
          </button>
        )}
        {supplier.contact.email && (
          <button
            onClick={() => handleContact('email', supplier.contact.email)}
            className="flex items-center justify-center w-8 h-8 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-full hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
            title={`Email ${supplier.contact.email}`}
          >
            <Mail className="w-4 h-4" />
          </button>
        )}
        {supplier.contact.website && (
          <button
            onClick={() => handleContact('website', supplier.contact.website)}
            className="flex items-center justify-center w-8 h-8 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 rounded-full hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
            title={`Visit ${supplier.contact.website}`}
          >
            <Globe className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default RwandaSupplierCard;
