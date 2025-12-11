import React, { useState } from 'react';
import { Check, ChevronDown, Flag } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface Country {
  code: string;
  name: string;
  flag: string;
  stats?: {
    suppliers: number;
    prices: number;
    lastUpdate: string;
  };
}

export interface CountrySelectorProps {
  countries: Country[];
  selectedCountries: string[];
  onSelectionChange: (selectedCodes: string[]) => void;
  placeholder?: string;
  maxSelections?: number;
  className?: string;
}

export const CountrySelector: React.FC<CountrySelectorProps> = ({
  countries,
  selectedCountries,
  onSelectionChange,
  placeholder = 'Select countries',
  maxSelections,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleCountry = (countryCode: string) => {
    if (selectedCountries.includes(countryCode)) {
      onSelectionChange(selectedCountries.filter(code => code !== countryCode));
    } else if (!maxSelections || selectedCountries.length < maxSelections) {
      onSelectionChange([...selectedCountries, countryCode]);
    }
  };

  const handleRemoveCountry = (countryCode: string) => {
    onSelectionChange(selectedCountries.filter(code => code !== countryCode));
  };

  const selectedCountriesData = countries.filter(country =>
    selectedCountries.includes(country.code)
  );

  return (
    <div className={cn('relative', className)}>
      {/* Selected Countries Display */}
      <div
        className="min-h-[2.5rem] w-full rounded-md border border-gray-300 bg-white px-3 py-2 cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1">
          {selectedCountriesData.length > 0 ? (
            selectedCountriesData.map(country => (
              <span
                key={country.code}
                className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-md"
              >
                <span className="text-sm">{country.flag}</span>
                {country.name}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveCountry(country.code);
                  }}
                  className="ml-1 hover:text-primary-600"
                >
                  ×
                </button>
              </span>
            ))
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {/* Search */}
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search countries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Country List */}
          <div className="py-1">
            {filteredCountries.length > 0 ? (
              filteredCountries.map(country => {
                const isSelected = selectedCountries.includes(country.code);
                const isDisabled = !isSelected && maxSelections && selectedCountries.length >= maxSelections;

                return (
                  <div
                    key={country.code}
                    className={cn(
                      'flex items-center justify-between px-3 py-2 text-sm cursor-pointer hover:bg-gray-50',
                      isSelected && 'bg-primary-50',
                      isDisabled && 'opacity-50 cursor-not-allowed'
                    )}
                    onClick={() => !isDisabled && handleToggleCountry(country.code)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{country.flag}</span>
                      <div>
                        <div className="font-medium">{country.name}</div>
                        {country.stats && (
                          <div className="text-xs text-gray-500">
                            {country.stats.suppliers} suppliers • {country.stats.prices} prices
                          </div>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="h-4 w-4 text-primary-600" />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">
                No countries found
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

