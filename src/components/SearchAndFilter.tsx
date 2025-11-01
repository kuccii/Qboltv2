// Advanced search and filtering component
import React, { useState, useMemo } from 'react';
import { Search, Filter, X, ChevronDown, Calendar, MapPin, Tag, SortAsc, SortDesc } from 'lucide-react';

export interface FilterOption {
  key: string;
  label: string;
  type: 'select' | 'multiselect' | 'date' | 'dateRange' | 'number' | 'text';
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
  min?: number;
  max?: number;
}

export interface SortOption {
  key: string;
  label: string;
  direction: 'asc' | 'desc';
}

interface SearchAndFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters: FilterOption[];
  activeFilters: Record<string, any>;
  onFilterChange: (key: string, value: any) => void;
  onClearFilters: () => void;
  sortOptions: SortOption[];
  activeSort: string;
  onSortChange: (sortKey: string) => void;
  resultsCount?: number;
  className?: string;
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchValue,
  onSearchChange,
  filters,
  activeFilters,
  onFilterChange,
  onClearFilters,
  sortOptions,
  activeSort,
  onSortChange,
  resultsCount,
  className = ''
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState<Set<string>>(new Set());

  const activeFilterCount = Object.values(activeFilters).filter(value => 
    value !== null && value !== undefined && value !== '' && 
    (Array.isArray(value) ? value.length > 0 : true)
  ).length;

  const toggleFilter = (key: string) => {
    setExpandedFilters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const handleFilterChange = (key: string, value: any) => {
    onFilterChange(key, value);
  };

  const clearFilter = (key: string) => {
    onFilterChange(key, null);
  };

  const renderFilterInput = (filter: FilterOption) => {
    const value = activeFilters[filter.key];

    switch (filter.type) {
      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => handleFilterChange(filter.key, e.target.value || null)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="">All {filter.label}</option>
            {filter.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className="space-y-2">
            {filter.options?.map(option => (
              <label key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={value?.includes(option.value) || false}
                  onChange={(e) => {
                    const currentValues = value || [];
                    const newValues = e.target.checked
                      ? [...currentValues, option.value]
                      : currentValues.filter((v: string) => v !== option.value);
                    handleFilterChange(filter.key, newValues.length > 0 ? newValues : null);
                  }}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => handleFilterChange(filter.key, e.target.value || null)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        );

      case 'dateRange':
        return (
          <div className="space-y-2">
            <input
              type="date"
              placeholder="From"
              value={value?.from || ''}
              onChange={(e) => handleFilterChange(filter.key, {
                ...value,
                from: e.target.value || null
              })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            <input
              type="date"
              placeholder="To"
              value={value?.to || ''}
              onChange={(e) => handleFilterChange(filter.key, {
                ...value,
                to: e.target.value || null
              })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        );

      case 'number':
        return (
          <div className="space-y-2">
            <input
              type="number"
              placeholder={filter.placeholder || `Min ${filter.label}`}
              min={filter.min}
              max={filter.max}
              value={value?.min || ''}
              onChange={(e) => handleFilterChange(filter.key, {
                ...value,
                min: e.target.value ? Number(e.target.value) : null
              })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            <input
              type="number"
              placeholder={filter.placeholder || `Max ${filter.label}`}
              min={filter.min}
              max={filter.max}
              value={value?.max || ''}
              onChange={(e) => handleFilterChange(filter.key, {
                ...value,
                max: e.target.value ? Number(e.target.value) : null
              })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        );

      case 'text':
        return (
          <input
            type="text"
            placeholder={filter.placeholder || `Search ${filter.label}`}
            value={value || ''}
            onChange={(e) => handleFilterChange(filter.key, e.target.value || null)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Filter Button */}
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
            isFilterOpen || activeFilterCount > 0
              ? 'bg-primary-600 text-white border-primary-600'
              : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
          }`}
        >
          <Filter size={20} />
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-white text-primary-600 text-xs font-bold px-2 py-1 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Sort Dropdown */}
        <div className="relative">
          <select
            value={activeSort}
            onChange={(e) => onSortChange(e.target.value)}
            className="appearance-none px-4 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {sortOptions.map(option => (
              <option key={option.key} value={option.key}>
                {option.label} ({option.direction === 'asc' ? 'A-Z' : 'Z-A'})
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>
      </div>

      {/* Results Count */}
      {resultsCount !== undefined && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {resultsCount} result{resultsCount !== 1 ? 's' : ''} found
        </div>
      )}

      {/* Filter Panel */}
      {isFilterOpen && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Filters
            </h3>
            <button
              onClick={onClearFilters}
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300"
            >
              Clear all
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filters.map(filter => (
              <div key={filter.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {filter.label}
                  </label>
                  {activeFilters[filter.key] && (
                    <button
                      onClick={() => clearFilter(filter.key)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                {renderFilterInput(filter)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(activeFilters).map(([key, value]) => {
            if (!value || (Array.isArray(value) && value.length === 0)) return null;
            
            const filter = filters.find(f => f.key === key);
            if (!filter) return null;

            const getDisplayValue = () => {
              if (Array.isArray(value)) {
                return value.join(', ');
              }
              if (typeof value === 'object' && value !== null) {
                return Object.entries(value)
                  .filter(([_, v]) => v !== null && v !== undefined && v !== '')
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(', ');
              }
              return value.toString();
            };

            return (
              <div
                key={key}
                className="flex items-center gap-2 px-3 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-200 rounded-full text-sm"
              >
                <span className="font-medium">{filter.label}:</span>
                <span>{getDisplayValue()}</span>
                <button
                  onClick={() => clearFilter(key)}
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SearchAndFilter;

