// Country Selector Page
// Shows available countries for selection
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Globe, ArrowRight } from 'lucide-react';

const availableCountries = [
  { code: 'RW', name: 'Rwanda', flag: '🇷🇼', description: 'Land of a thousand hills' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', description: 'East African economic hub' },
  { code: 'UG', name: 'Uganda', flag: '🇺🇬', description: 'Pearl of Africa' },
  { code: 'TZ', name: 'Tanzania', flag: '🇹🇿', description: 'Gateway to East Africa' },
  { code: 'ET', name: 'Ethiopia', flag: '🇪🇹', description: 'Horn of Africa' },
];

const CountrySelector: React.FC = () => {
  const navigate = useNavigate();

  const handleCountrySelect = (countryCode: string) => {
    navigate(`/app/countries/${countryCode.toLowerCase()}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Globe className="h-12 w-12 text-primary-600 dark:text-primary-400" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Select a Country
          </h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Explore comprehensive country profiles including suppliers, pricing, infrastructure, contacts, and market intelligence.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableCountries.map((country) => (
          <div
            key={country.code}
            onClick={() => handleCountrySelect(country.code)}
            className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{country.flag}</span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {country.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {country.description}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-4">
                <MapPin className="h-4 w-4" />
                <span>View Country Profile</span>
              </div>
            </div>
            
            {/* Hover effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-purple-500/0 group-hover:from-primary-500/5 group-hover:to-purple-500/5 transition-all duration-300" />
          </div>
        ))}
      </div>

      {/* Info Section */}
      <div className="mt-12 bg-primary-50 dark:bg-primary-900/20 rounded-lg p-6 border border-primary-200 dark:border-primary-800">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <MapPin className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              What's Included in Each Country Profile?
            </h3>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-primary-600 dark:text-primary-400">•</span>
                <span><strong>Overview:</strong> Key statistics, suppliers, and market insights</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 dark:text-primary-400">•</span>
                <span><strong>Infrastructure:</strong> Airports, storage facilities, ports, and logistics hubs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 dark:text-primary-400">•</span>
                <span><strong>Pricing:</strong> Fuel, labor, transport, and material costs with trends</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 dark:text-primary-400">•</span>
                <span><strong>Contacts:</strong> Suppliers, government contacts, and service providers</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 dark:text-primary-400">•</span>
                <span><strong>Intelligence:</strong> Market intelligence, demand mapping, and risk analysis</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountrySelector;


