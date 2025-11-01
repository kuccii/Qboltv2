// Hierarchical sidebar navigation component matching logcluster.org structure
import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  MapPin, 
  Building2, 
  Truck, 
  Fuel, 
  Users, 
  Phone,
  FileText,
  Settings,
  Globe,
  Shield,
  Package,
  Utensils,
  FlaskConical
} from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  href?: string;
  children?: NavigationItem[];
}

interface RwandaNavigationProps {
  activeSection?: string;
  onNavigate?: (section: string) => void;
  className?: string;
}

const RwandaNavigation: React.FC<RwandaNavigationProps> = ({ 
  activeSection = 'overview',
  onNavigate,
  className = ''
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['profile', 'infrastructure', 'services', 'contacts']));

  const navigationItems: NavigationItem[] = [
    {
      id: 'overview',
      label: 'Rwanda Overview',
      icon: MapPin,
      href: '/app/rwanda'
    },
    {
      id: 'profile',
      label: '1. Country Profile',
      icon: Globe,
      children: [
        {
          id: 'background',
          label: '1.1 Background',
          icon: FileText,
          href: '/app/rwanda/profile/background'
        },
        {
          id: 'regulatory',
          label: '1.2 Regulatory Departments',
          icon: Shield,
          href: '/app/rwanda/profile/regulatory'
        },
        {
          id: 'customs',
          label: '1.3 Customs Information',
          icon: Settings,
          href: '/app/rwanda/profile/customs'
        }
      ]
    },
    {
      id: 'infrastructure',
      label: '2. Logistics Infrastructure',
      icon: Building2,
      children: [
        {
          id: 'airports',
          label: '2.1 Airports',
          icon: MapPin,
          href: '/app/rwanda/infrastructure/airports'
        },
        {
          id: 'roads',
          label: '2.2 Road Network',
          icon: Truck,
          href: '/app/rwanda/infrastructure/roads'
        },
        {
          id: 'storage',
          label: '2.3 Storage & Milling',
          icon: Package,
          href: '/app/rwanda/infrastructure/storage'
        }
      ]
    },
    {
      id: 'services',
      label: '3. Logistics Services',
      icon: Truck,
      children: [
        {
          id: 'fuel',
          label: '3.1 Fuel Pricing',
          icon: Fuel,
          href: '/app/rwanda/services/fuel'
        },
        {
          id: 'transporters',
          label: '3.2 Transporters',
          icon: Truck,
          href: '/app/rwanda/services/transporters'
        },
        {
          id: 'labor',
          label: '3.3 Labor Costs',
          icon: Users,
          href: '/app/rwanda/services/labor'
        }
      ]
    },
    {
      id: 'contacts',
      label: '4. Contact Directory',
      icon: Phone,
      children: [
        {
          id: 'government',
          label: '4.1 Government',
          icon: Building2,
          href: '/app/rwanda/contacts/government'
        },
        {
          id: 'suppliers',
          label: '4.2 Suppliers',
          icon: Package,
          href: '/app/rwanda/contacts/suppliers'
        },
        {
          id: 'logistics',
          label: '4.3 Logistics Providers',
          icon: Truck,
          href: '/app/rwanda/contacts/logistics'
        },
        {
          id: 'laboratories',
          label: '4.4 Laboratories',
          icon: FlaskConical,
          href: '/app/rwanda/contacts/laboratories'
        },
        {
          id: 'food',
          label: '4.5 Food Suppliers',
          icon: Utensils,
          href: '/app/rwanda/contacts/food'
        }
      ]
    },
    {
      id: 'intelligence',
      label: '5. Smart Intelligence',
      icon: Settings,
      href: '/app/rwanda/intelligence'
    }
  ];

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleItemClick = (item: NavigationItem) => {
    if (item.children) {
      toggleSection(item.id);
    } else if (onNavigate) {
      onNavigate(item.id);
    }
  };

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const isExpanded = expandedSections.has(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const isActive = activeSection === item.id;

    return (
      <div key={item.id} className="mb-1">
        <button
          onClick={() => handleItemClick(item)}
          className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
            isActive
              ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          style={{ paddingLeft: `${level * 12 + 12}px` }}
        >
          <div className="flex items-center space-x-2">
            <item.icon className="w-4 h-4" />
            <span className="font-medium">{item.label}</span>
          </div>
          {hasChildren && (
            <div className="flex items-center">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </div>
          )}
        </button>
        
        {hasChildren && isExpanded && (
          <div className="mt-1">
            {item.children!.map(child => renderNavigationItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-primary-600" />
          Rwanda Logistics
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Complete logistics infrastructure data
        </p>
      </div>
      
      <nav className="p-4">
        <div className="space-y-1">
          {navigationItems.map(item => renderNavigationItem(item))}
        </div>
      </nav>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <p>Data source: logcluster.org</p>
          <p>Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default RwandaNavigation;
